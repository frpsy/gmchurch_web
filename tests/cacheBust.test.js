import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';

// 머지 뒤 CI(cache-bust.yml)가 ?v= 번호를 바꿔 옛 파일이 캐시에 남지 않게 한다.
// 번호가 빠진 페이지나 CI가 고치지 않는 폴더가 있으면 주보를 바꿔도 옛 data.js가 보일 수 있다(계획 B2).
const read = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const pages = [
    ...readdirSync(new URL('..', import.meta.url)).filter(f => f.endsWith('.html') && !/^google/.test(f)),
    'jubo/index.html',
];
const ASSET = /(?:src|href)="((?:\.\.\/)?(?:data|app)\.js|(?:\.\.\/)?style\.css)(\?v=[A-Za-z0-9_-]+)?"/g;

describe('캐시 번호', () => {
    it('data.js·app.js·style.css를 부르는 모든 페이지에 ?v= 번호가 있다', () => {
        const missing = [];
        for (const p of pages) {
            for (const m of read(p).matchAll(ASSET)) if (!m[2]) missing.push(`${p}: ${m[1]}`);
        }
        expect(missing).toEqual([]);
    });

    it('cache-bust·주보 자동 갱신 CI가 jubo/ 페이지도 고친다', () => {
        for (const wf of ['cache-bust.yml', 'bulletin-sync.yml']) {
            const s = read('.github/workflows/' + wf);
            expect(s, wf).toMatch(/sed -i [^\n]*jubo\/\*\.html/);
            expect(s, wf).toMatch(/git add [^\n]*jubo\/\*\.html/);
        }
    });

    it('cache-bust 커밋 메시지는 얕은 checkout에서도 있는 HEAD를 쓴다', () => {
        expect(read('.github/workflows/cache-bust.yml')).not.toMatch(/HEAD~1/);
    });
});
