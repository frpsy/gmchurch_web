import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';

const read = f => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
const sprite = new Set([...read('images/icons.svg').matchAll(/<symbol id="([a-z-]+)"/g)].map(m => m[1]));
const htmlFiles = readdirSync(new URL('..', import.meta.url)).filter(f => f.endsWith('.html'));
// 그림 이모티콘(→ ↗ ✓ 같은 글자 기호는 제외)
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
const ALLOWED_SYMBOLS = /[✓✕]/gu;

describe('아이콘 팩', () => {
    it('data.js의 icon/symbol 값은 모두 스프라이트 심볼 이름이다', () => {
        const names = [...read('data.js').matchAll(/\b(?:icon|symbol): *"([^"]*)"/g)].map(m => m[1]);
        expect(names.length).toBeGreaterThan(40);
        for (const n of names) expect(sprite.has(n), n).toBe(true);
    });

    it('app.js와 HTML이 참조하는 아이콘은 모두 스프라이트에 있다', () => {
        const refs = [...read('app.js').matchAll(/icon\('([a-z-]+)'\)/g)].map(m => m[1]);
        for (const f of htmlFiles) refs.push(...[...read(f).matchAll(/icons\.svg(?:\?v=[\w-]+)?#([a-z-]+)/g)].map(m => m[1]));
        for (const n of refs) expect(sprite.has(n), n).toBe(true);
    });

    it('콘텐츠에 그림 이모티콘을 직접 쓰지 않는다 (아이콘 팩 사용)', () => {
        const strip = s => s.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '').replace(ALLOWED_SYMBOLS, '');
        for (const f of ['data.js', 'app.js', ...htmlFiles]) {
            expect(EMOJI.test(strip(read(f))), f).toBe(false);
        }
    });
});
