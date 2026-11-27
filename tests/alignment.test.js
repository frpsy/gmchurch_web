// 정렬 규칙(docs/dev-guide.md 「정렬」): 읽는 글은 왼쪽, 가운데 글은 휴대폰에서 두 줄까지.
// 여러 줄로 읽히는 소개 문단·카드 본문에 가운데 정렬이 다시 생기지 않게 막는다.
// 렌더 기준 전수 점검은 수동 스크립트 scripts/audit-alignment.js 로 한다.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../style.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

// 읽는 글(두 줄 이상이 되는 문단·카드 본문)로 쓰는 클래스
const READING = [
    '.children-lead',
    '.story-lead',
    '.faq-lead',
    '.anglican-pillar',
    '.emmaus-join-card',
    '.hope-step-body',
    '.hope-history-body',
    '.children-rhythm-grid article',
];

function rulesFor(selector) {
    const out = [];
    const re = /([^{}]+)\{([^{}]*)\}/g;
    let m;
    while ((m = re.exec(css))) {
        const sels = m[1].split(',').map((x) => x.trim());
        if (sels.some((x) => x === selector || x.endsWith(' ' + selector) && !x.includes(':'))) out.push(m[0]);
    }
    return out;
}

describe('정렬 규칙', () => {
    for (const sel of READING) {
        it(`${sel}에는 가운데 정렬을 쓰지 않는다`, () => {
            const bad = rulesFor(sel).filter((r) => /text-align\s*:\s*center/.test(r));
            expect(bad, bad.join('\n')).toEqual([]);
        });
    }

    it('소개 문단은 한 줄이면 가운데로 보이고 여러 줄이면 왼쪽으로 읽히게 폭을 글에 맞춘다', () => {
        for (const sel of ['.children-lead', '.story-lead', '.faq-lead']) {
            const body = rulesFor(sel).join('\n');
            expect(body, sel).toMatch(/width\s*:\s*fit-content/);
            expect(body, sel).toMatch(/text-align\s*:\s*start/);
        }
    });
});

// 한글 본문은 어절 단위로 줄을 바꾼다. break-all은 「띕니 / 다.」처럼 낱말 중간을 끊는다(2026-11-27).
describe('줄바꿈', () => {
    it('사이트 CSS에 음절 단위 줄바꿈(word-break: break-all)이 없다', () => {
        expect(css).not.toMatch(/word-break\s*:\s*break-all/);
        expect(css).not.toMatch(/line-break\s*:\s*anywhere/);
    });
});
