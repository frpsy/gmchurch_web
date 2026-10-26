import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../data/hymnal-2015/', import.meta.url));
const json = name => JSON.parse(readFileSync(resolve(root, name), 'utf8'));
const manifest = json('manifest.json');
const index = json('index.json');
const source = json('source-index.json');

describe('성가 2015 악보 보관', () => {
  it('634쪽 전체가 읽을 수 있는 원본 JPG이며 기록된 해시와 일치한다', () => {
    expect(manifest.pageCount).toBe(634);
    expect(manifest.pages).toHaveLength(634);
    expect(readdirSync(resolve(root, 'images')).sort()).toEqual(
      manifest.pages.map(p => p.file.split('/').at(-1)).sort()
    );
    let bytes = 0;
    for (const [i, page] of manifest.pages.entries()) {
      expect(page.page).toBe(i + 1);
      const data = readFileSync(resolve(root, page.file));
      expect([...data.subarray(0, 2)]).toEqual([0xff, 0xd8]);
      expect([...data.subarray(-2)]).toEqual([0xff, 0xd9]);
      expect(data.length).toBe(page.bytes);
      expect(createHash('sha256').update(data).digest('hex')).toBe(page.sha256);
      expect(page.width).toBeGreaterThan(0);
      expect(page.height).toBeGreaterThan(0);
      bytes += data.length;
    }
    expect(bytes).toBe(manifest.imageBytes);
  });

  it('657개 번호·제목과 여러 쪽 악보의 순서가 원본 색인과 일치한다', () => {
    expect(index.hymns).toHaveLength(657);
    expect(new Set(index.hymns.map(h => h.number)).size).toBe(657);
    for (const [i, hymn] of index.hymns.entries()) {
      const row = source[i];
      expect(hymn.number).toBe(row.number);
      expect(hymn.title).toBe(row.title);
      const pages = Array.from({ length: (row.end ?? row.page) - row.page + 1 }, (_, j) => row.page + j);
      expect(hymn.images).toEqual(pages.map(p => manifest.pages[p - 1].file));
      const markdown = readFileSync(resolve(root, hymn.markdown), 'utf8');
      for (const image of hymn.images) expect(markdown).toContain(`../${image}`);
    }
    expect(manifest.missingFromSourceIndex).toEqual([96, 97, 98, 99, 100]);
    expect(index.hymns.find(h => h.number === 661).images).toEqual(['images/page-0633.jpg']);
  });
});
