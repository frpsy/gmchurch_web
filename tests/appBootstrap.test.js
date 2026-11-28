import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

// App.init·renderMain은 렌더러를 하나씩 따로 실행해야 한다(docs/perf-refactor-plan.md B1).
// 하나가 던져도 뒤의 렌더러·메뉴·읽기 도구가 멈추지 않게 하려는 것이다.
const source = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

function body(name) {
    const start = source.indexOf(`\n    ${name}(`);
    expect(start, `${name}를 찾지 못함`).toBeGreaterThan(0);
    const end = source.indexOf('\n    },', start);
    return source.slice(start, end);
}

const BARE_CALL = /^\s+(?:if \([^)]*\) )?[A-Z][A-Za-z]+\.(?:render|init)\([^)]*\);\s*$/;

describe('App 부트스트랩 오류 격리', () => {
    for (const name of ['_init', 'renderMain']) {
        it(`${name}의 렌더러 호출은 모두 run()으로 감싼다`, () => {
            const bare = body(name).split('\n').filter(line => BARE_CALL.test(line));
            expect(bare).toEqual([]);
        });
    }

    it('renderMain은 렌더러를 30개 이상 run()으로 부른다', () => {
        const calls = body('renderMain').match(/run\('/g) || [];
        expect(calls.length).toBeGreaterThanOrEqual(30);
    });

    it('_run은 오류를 삼키고 콘솔에 남긴다', () => {
        const run = new Function('console', `return ({${body('_run').trim()}\n    }})._run;`);
        const logged = [];
        const fn = run({ error: (...a) => logged.push(a) });
        expect(() => fn('테스트', () => { throw new Error('x'); })).not.toThrow();
        expect(logged[0][0]).toContain('테스트');
    });

    it('_run은 비동기 렌더러의 실패도 콘솔에 남긴다', async () => {
        const run = new Function('console', `return ({${body('_run').trim()}\n    }})._run;`);
        const logged = [];
        const fn = run({ error: (...a) => logged.push(a) });
        fn('비동기', () => Promise.reject(new Error('y')));
        await new Promise(r => setTimeout(r, 0));
        expect(logged[0][0]).toContain('비동기');
    });
});
