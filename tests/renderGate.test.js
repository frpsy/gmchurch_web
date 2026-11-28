import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';

// 렌더 전 숨김(docs/perf-refactor-plan.md P1): app.js가 빈 칸을 채우며 아래 섹션을 밀어내는
// 화면 흔들림(CLS)을 막는다. <head>에서 표시를 달고, App.init 끝 또는 load 이벤트에 뗀다.
const read = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const pages = readdirSync(new URL('..', import.meta.url))
    .filter(f => f.endsWith('.html') && !/^google/.test(f))
    .filter(f => /<script src="app\.js/.test(read(f)));

describe('렌더 전 숨김', () => {
    it('app.js를 쓰는 모든 페이지가 <head> 첫머리에서 render-pending을 달고 load나 5초 뒤 뗀다', () => {
        const bad = pages.filter(p => {
            const head = read(p).split('</head>')[0];
            const at = head.indexOf("classList.add('render-pending')");
            return at < 0 || at > head.indexOf('<link') || !head.includes("addEventListener('load',off);setTimeout(off,5000)");
        });
        expect(pages.length).toBeGreaterThan(20);
        expect(bad).toEqual([]);
    });

    it('App.init은 실패해도 finally에서 render-pending을 뗀다', () => {
        const app = read('app.js');
        const init = app.slice(app.indexOf('\n    init() {', app.indexOf('const App = {')));
        const body = init.slice(0, init.indexOf('\n    },'));
        expect(body).toMatch(/try \{\s*this\._init\(\);\s*\} finally \{\s*document\.documentElement\.classList\.remove\('render-pending'\);/);
    });

    it('style.css가 render-pending 동안 빈 칸 섹션부터 아래와 푸터를 숨긴다', () => {
        const css = read('style.css');
        expect(css).toContain('html.render-pending main > :has(:empty[id]),');
        expect(css).toContain('html.render-pending main > :has(:empty[id]) ~ *,');
        expect(css).toContain('html.render-pending #main-footer { visibility: hidden; }');
    });
});
