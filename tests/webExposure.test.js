import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { isUpToDate, referencedImages, webExcludes } from '../scripts/hymnal-web-exclude.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = p => readFileSync(resolve(root, p), 'utf8');

describe('성가 스캔 웹 공개 범위', () => {
  it('비공개 목록이 최신이다 (주보제작 뒤 node scripts/hymnal-web-exclude.js 실행)', () => {
    expect(isUpToDate()).toBe(true);
  });

  it('순서지가 쓰는 악보는 비공개 목록에 없고, 원본 PDF 폴더는 비공개다', () => {
    const excluded = new Set(webExcludes());
    const refs = referencedImages();
    expect(refs.size).toBeGreaterThan(0);
    for (const ref of refs) expect(excluded.has(ref), ref).toBe(false);
    expect(excluded.has('data/hymnal-2015/sources/')).toBe(true);
  });

  it('공식 서버 배포 목록(rsync)과 개발 Pages 제외 목록이 같은 파일을 가리킨다', () => {
    const txt = read('scripts/hymnal-web-exclude.txt').split('\n').filter(l => l.startsWith('/'));
    const cfg = read('_config.yml').split('\n').filter(l => /^\s+- data\/hymnal-2015\//.test(l));
    expect(txt.map(l => l.slice(1).replace(/\/$/, ''))).toEqual(cfg.map(l => l.replace(/^\s+- /, '')));
  });
});

describe('개발 주소 검색 제외와 공식 robots', () => {
  it('개발 robots.txt는 검색을 막는다', () => {
    const robots = read('robots.txt');
    expect(robots).toMatch(/^Disallow: \/\s*$/m);
    expect(robots).not.toMatch(/^Allow:/m);
  });

  it('공식용 robots 원본은 허용하고 개발 주소 sitemap을 가리켜 도메인 치환 대상이 된다', () => {
    const official = read('scripts/robots.official.txt');
    expect(official).toMatch(/^Allow: \/\s*$/m);
    expect(official).not.toMatch(/^Disallow: \/\s*$/m);
    expect(official).toMatch(/^Sitemap: https:\/\/frpsy\.github\.io\/gmchurch_web\/sitemap\.xml$/m);
  });

  it('공식 반영 스크립트가 공식 robots로 바꾸고 검색 차단 여부를 검증한다', () => {
    const script = read('scripts/release-official.sh');
    expect(script).toContain('cp scripts/robots.official.txt robots.txt');
    expect(script).toContain('Disallow');
    expect(script).toContain('Sitemap: $OFFICIAL_SITE/sitemap.xml');
  });
});

describe('개인정보 처리방침 호스팅 안내', () => {
  it('공식 주소와 개발 주소의 제공처를 함께 밝힌다', () => {
    const html = read('privacy.html');
    expect(html).toContain('gmskh.or.kr');
    expect(html).toContain('GitHub Pages');
    expect(html).not.toContain('GitHub Pages 호스팅 환경에서');
  });
});
