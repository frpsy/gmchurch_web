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
    it('어느 페이지도 jsdelivr를 부르지 않고, 모두 자체 글꼴 CSS를 쓴다', () => {
        const bad = pages.filter(p => {
            const s = read(p);
            const local = (p.startsWith('jubo/') ? '../' : '') + CSS;
            return s.includes('cdn.jsdelivr.net') || !s.includes(`href="${local}"`);
        });
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
