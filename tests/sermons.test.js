import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import vm from 'node:vm';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = p => readFileSync(resolve(root, p), 'utf8');

// data.js는 브라우저 전역 스크립트라 샌드박스에서 CHURCH_DATA만 꺼낸다
const ctx = {};
vm.runInNewContext(read('data.js') + '\n;this.CHURCH_DATA = CHURCH_DATA;', ctx);
const { sermons, navigation } = ctx.CHURCH_DATA;

describe('설교 말씀 데이터', () => {
  it('각 설교는 날짜·제목·문단·설교자를 갖는다', () => {
    expect(sermons.items.length).toBeGreaterThan(0);
    for (const s of sermons.items) {
      expect(s.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(s.title.trim()).not.toBe('');
      expect(s.preacher.trim()).not.toBe('');
      expect(s.paragraphs.length).toBeGreaterThan(0);
      for (const p of s.paragraphs) expect(p.trim()).not.toBe('');
    }
  });

  it('원문 출처 링크가 있으면 https 주소다', () => {
    for (const s of sermons.items) {
      if (s.source) expect(s.source.url).toMatch(/^https:\/\//);
    }
  });

  it('설교 페이지가 내비게이션에서 연결된다', () => {
    const links = navigation.flatMap(g => (g.items || []).map(i => i.href));
    expect(links).toContain('sermons.html');
    expect(read('sermons.html')).toContain('id="sermons-full"');
  });
});
