import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { resolveReadings, nextSundayKey, isToggleWeek, koreanDate } from '../scripts/lib/lectionary.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const read = f => JSON.parse(readFileSync(join(__dirname, '..', 'data', f), 'utf-8'));
const std = read('lectionary-year-a.json').sundays;
const ov  = read('lectionary-overrides.json').sundays;

// 병합 로직이 실제 주보와 일치하는지 — 예배 순서면에서 확인한 ground truth
describe('resolveReadings: 표준+주보 병합', () => {
    it('트랙 A 주간은 연속 독서 제1독서 + 주보 성시를 쓴다 (6/28)', () => {
        const r = resolveReadings(std, ov, '2026-06-28');
        expect(r.first).toBe('창세 22:1-14');   // 연속(A)
        expect(r.psalm).toBe('시편 13편');        // 주보 성시 (표준 트랙 B값 아님)
        expect(r.track).toBe('A');
    });

    it('트랙 A 시편은 표준(트랙 B) 시편을 덮어쓴다 (6/14)', () => {
        const r = resolveReadings(std, ov, '2026-06-14');
        expect(r.first).toBe('창세 18:1-15');
        expect(r.psalm).toBe('시편 116편');       // 표준은 시편 100(B), 주보는 116
    });

    it('트랙 B 주간은 짝 독서 제1독서를 쓴다 (6/21)', () => {
        const r = resolveReadings(std, ov, '2026-06-21');
        expect(r.first).toBe('예레미야 20:7-13'); // 짝(B)
        expect(r.track).toBe('B');
    });

    it('특별 주일은 주보 독서 전체로 교체하고 표준 주일명을 보존한다 (맥추감사)', () => {
        const r = resolveReadings(std, ov, '2026-07-12');
        expect(r.week).toBe('맥추감사주일');
        expect(r.standardName).toBe('연중 제15주일');
        expect(r.first).toBe('신명 8:1-4');
        expect(r.gospel).toBe('마태 6:25-34');
        expect(r.fromBulletin).toBe(true);
    });

    it('기록이 없는 주간은 표준 짝 독서(B)를 기본으로 쓴다', () => {
        const r = resolveReadings(std, ov, '2026-07-19'); // override 없음
        const s = std.find(x => x.date === '2026-07-19');
        expect(r.first).toBe(s.readings.firstReadingB);
        expect(r.fromBulletin).toBe(false);
    });

    it('제2독서·복음은 트랙과 무관하게 표준을 따른다', () => {
        const r = resolveReadings(std, ov, '2026-06-28');
        const s = std.find(x => x.date === '2026-06-28');
        expect(r.second).toBe(s.readings.secondReading);
        expect(r.gospel).toBe(s.readings.gospel);
    });

    it('표준 목록에 없는 날짜는 null', () => {
        expect(resolveReadings(std, ov, '2099-01-01')).toBeNull();
    });
});

describe('책 이름·절 표기 (성공회 주보식)', () => {
    it('개신교식 a/b 접미사가 없다 (상/하 사용)', () => {
        for (const s of std) {
            for (const ref of Object.values(s.readings)) {
                expect(ref, ref).not.toMatch(/\d[abc]\b/);
            }
        }
    });

    it('RCL 선택절 괄호가 남아있지 않다', () => {
        for (const s of std) {
            for (const ref of Object.values(s.readings)) {
                expect(ref, ref).not.toContain('(');
            }
        }
    });

    it('개신교식 긴 책 이름을 쓰지 않는다', () => {
        const banned = ['마태복음', '마가복음', '누가복음', '요한복음', '로마서', '창세기', '출애굽기'];
        for (const s of std) {
            for (const ref of Object.values(s.readings)) {
                for (const b of banned) expect(ref, ref).not.toContain(b);
            }
        }
    });
});

describe('보조 함수', () => {
    it('nextSundayKey는 7일 뒤를 반환한다', () => {
        expect(nextSundayKey('2026-07-12')).toBe('2026-07-19');
        expect(nextSundayKey('2026-12-27')).toBe('2027-01-03'); // 연도 경계
    });
    it('isToggleWeek은 짝 독서가 있는 연중 주간에만 참', () => {
        expect(isToggleWeek(std, '2026-06-28')).toBe(true);  // 연중
        expect(isToggleWeek(std, '2025-11-30')).toBe(false); // 대림
    });
    it('koreanDate 포맷', () => {
        expect(koreanDate('2026-07-12')).toBe('2026년 7월 12일');
    });
});
