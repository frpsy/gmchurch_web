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
import { sundayLabel } from '../scripts/lib/liturgical-names.js';
import { LiturgicalCalendar } from './helpers/loadData.js';

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

const ymd = d => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
// 기도서가 다른 날로 옮겨 지키도록 허용한 축일은 전례독서 주일명이 생성기 결과와 다를 수 있다.
const MOVED_FEASTS = new Set(['모든 성인의 날']);

describe('주보 주일명 생성기(scripts/lib/liturgical-names.js)', () => {
    it('표준 전례독서의 주일명과 같은 이름을 만든다', () => {
        const diff = [];
        for (const f of STANDARD_FILES) {
            for (const s of JSON.parse(read(join('data', f))).sundays) {
                if (MOVED_FEASTS.has(s.koreanName)) continue;
                const got = sundayLabel(s.date.replaceAll('-', '')).replace(/^[가나다]해 /, '');
                if (got !== s.koreanName) diff.push(`${s.date} 데이터=${s.koreanName} 생성=${got}`);
            }
        }
        expect(diff).toEqual([]);
    });

    it('2040년까지 모든 주일을 기도서 형식으로 만든다', () => {
        const bad = [];
        for (let d = new Date(2025, 10, 30); d < new Date(2041, 0, 1); d.setDate(d.getDate() + 7)) {
            const n = sundayLabel(ymd(d)).replace(/^[가나다]해 /, '');
            if (!PRAYER_BOOK_NAME.test(n) && n !== '성탄일') bad.push(`${ymd(d)} ${n}`);
        }
        expect(bad).toEqual([]);
    });

    it('해 표기는 대림 1주일마다 가·나·다로 돈다', () => {
        expect(sundayLabel('20260118')).toBe('가해 연중 2주일');
        expect(sundayLabel('20270117')).toBe('나해 연중 2주일');
        expect(sundayLabel('20280116')).toBe('다해 연중 2주일');
        expect(sundayLabel('20290114')).toBe('가해 연중 2주일');
    });
});

describe('절기 계산은 기도서 교회력 규칙을 따른다', () => {
    const SEASON_NAMES = new Set(['대림절', '성탄절', '공현 후 연중 시기', '사순절', '성주간', '부활절',
        '성령강림주일', '성령강림 후 연중 시기']);

    it('2026~2040년 모든 날의 절기 이름이 기준표 안에 있다', () => {
        const bad = new Set();
        for (let d = new Date(2026, 0, 1); d < new Date(2041, 0, 1); d.setDate(d.getDate() + 1)) {
            const s = LiturgicalCalendar.compute(new Date(d));
            if (!SEASON_NAMES.has(s.name)) bad.add(s.name);
        }
        expect([...bad]).toEqual([]);
    });

    it('성탄절은 주의 세례주일 전날까지다', () => {
        // 2026: 1/6 화요일 → 주의 세례주일 1/11, 2030: 1/6 일요일 → 1/13
        expect(LiturgicalCalendar.compute(new Date(2026, 0, 10)).name).toBe('성탄절');
        expect(LiturgicalCalendar.compute(new Date(2026, 0, 11)).name).toBe('공현 후 연중 시기');
        expect(LiturgicalCalendar.compute(new Date(2030, 0, 12)).name).toBe('성탄절');
        expect(LiturgicalCalendar.compute(new Date(2030, 0, 13)).name).toBe('공현 후 연중 시기');
    });

    it('주의 세례주일·삼위일체 주일·왕이신 그리스도 주일은 그날 전례색이 백색이다', () => {
        for (const [y, m, d] of [[2026, 0, 11], [2026, 4, 31], [2026, 10, 22], [2027, 0, 10], [2027, 4, 23], [2027, 10, 21]]) {
            const s = LiturgicalCalendar.compute(new Date(y, m, d));
            expect(s.dayColorName, `${y}-${m + 1}-${d}`).toBe('백색');
        }
        // 일반 연중 주일은 녹색
        expect(LiturgicalCalendar.compute(new Date(2026, 10, 15)).dayColorName).toBe('녹색');
    });
});
