import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';

// 본문 글꼴 Pretendard는 jsdelivr의 같은 파일을 fonts/pretendard/에서 직접 제공한다(docs/perf-refactor-plan.md P3).
// 외부 CDN 연결과 장애 위험을 없애려는 것이다.
const read = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const pages = [
    ...readdirSync(new URL('..', import.meta.url)).filter(f => f.endsWith('.html') && !/^google/.test(f)),
    'jubo/index.html',
];
const CSS = 'fonts/pretendard/pretendardvariable-dynamic-subset.css';

describe('글꼴 자체 제공', () => {
    // 공식 저장소에만 있는 404.html처럼 글꼴 CSS를 쓰지 않는 페이지도 있다. 그런 페이지는 자체 경로 검사에서 뺀다.
    it('어느 페이지도 jsdelivr를 부르지 않는다', () => {
        expect(pages.filter(p => read(p).includes('cdn.jsdelivr.net'))).toEqual([]);
    });

    it('Pretendard 글꼴 CSS를 쓰는 페이지는 모두 자체 경로를 쓴다', () => {
        const usesFont = pages.filter(p => /pretendard[^"']*\.css/i.test(read(p)));
        const bad = usesFont.filter(p => !read(p).includes(`href="${(p.startsWith('jubo/') ? '../' : '') + CSS}"`));
        expect(usesFont.length).toBeGreaterThan(30);
        expect(bad).toEqual([]);
    });

    it('글꼴 CSS가 가리키는 조각이 모두 저장소에 있다', () => {
        const urls = [...read(CSS).matchAll(/url\(\.\/(woff2\/[^)]+)\)/g)].map(m => m[1]);
        expect(urls.length).toBe(92);
        const missing = urls.filter(u => !existsSync(new URL('../fonts/pretendard/' + u, import.meta.url)));
        expect(missing).toEqual([]);
    });

    it('글꼴 CSS에 SIL Open Font License 고지가 남아 있다', () => {
        expect(read(CSS)).toContain('SIL Open Font License');
    });
});
