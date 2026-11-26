// 교회력 주일명은 대한성공회 기도서 교회력 표기를 따른다(2026-11-26 사용자 확정).
// 예: 대림 1주일, 성탄 1주일, 주의 세례주일, 연중 33주일, 사순 1주일, 고난주일(성지주일),
//     부활주일, 부활 7주일(승천 후 주일), 성령강림주일, 삼위일체 주일, 왕이신 그리스도 주일.
// '제'를 붙인 번호(연중 제33주일)나 다른 교회력의 이름(성령강림 후 제N주일, 대림절 제N주일,
// 그리스도 왕 주일)이 다시 섞이지 않게 막는다.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { STANDARD_FILES } from '../scripts/lib/lectionary.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = f => readFileSync(join(root, f), 'utf-8');

const PRAYER_BOOK_NAME = new RegExp('^(' + [
    '(대림|성탄|사순|부활) [1-9]주일',
    '연중 ([1-9]|[12][0-9]|3[0-4])주일',
    '주의 세례주일',
    '고난주일\\(성지주일\\)',
    '부활주일',
    '부활 7주일\\(승천 후 주일\\)',
    '성령강림주일',
    '삼위일체 주일',
    '모든 성인의 날',
    '왕이신 그리스도 주일',
].join('|') + ')$');

describe('교회력 주일명은 기도서 표기를 따른다', () => {
    for (const f of STANDARD_FILES) {
        it(`${f}의 모든 주일명`, () => {
            const bad = JSON.parse(read(join('data', f))).sundays
                .filter(s => !PRAYER_BOOK_NAME.test(s.koreanName) || 'anglicanName' in s)
                .map(s => `${s.date} ${s.koreanName}`);
            expect(bad).toEqual([]);
        });
    }

    it('사이트 코드와 데이터에 다른 교회력 표기가 남지 않는다', () => {
        const banned = [/(대림|사순|부활|연중|성탄) 제\d+주일/, /성령강림 후 제\d+주일/, /대림절 제\d+주일/,
            /공현절 후/, /그리스도 왕 주일/, /성탄절 후 (제\d+)?주일/, /전례색 적색|colorName: "적색"/];
        const hits = [];
        for (const f of ['data.js', 'app.js', 'scripts/sync-bulletins.js']) {
            read(f).split('\n').forEach((line, i) => {
                if (banned.some(re => re.test(line))) hits.push(`${f}:${i + 1} ${line.trim().slice(0, 80)}`);
            });
        }
        expect(hits).toEqual([]);
    });
});
