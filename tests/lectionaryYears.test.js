import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { STANDARD_FILES, mergeStandards, resolveReadings } from '../scripts/lib/lectionary.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const read = f => JSON.parse(readFileSync(join(__dirname, '..', 'data', f), 'utf-8'));
const files = STANDARD_FILES.map(read);
const all = mergeStandards(files);

// 연도별 표준 파일이 끊김 없이 이어져야 대림절(해 바뀜)에도 전례독서가 멈추지 않는다
describe('표준 전례독서 연도 파일', () => {
    it('app.js와 같은 파일 목록을 쓴다', () => {
        const app = readFileSync(join(__dirname, '..', 'app.js'), 'utf-8');
        const m = app.match(/_LECTIONARY_FILES:\s*\[([^\]]*)\]/);
        const appFiles = [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1]);
        expect(appFiles).toEqual(STANDARD_FILES);
    });

    it('연도 코드가 서로 다르다', () => {
        const years = files.map(f => f.year);
        expect(new Set(years).size).toBe(years.length);
    });

    it('모든 날짜가 일요일이며 7일 간격으로 끊김 없이 이어진다', () => {
        for (let i = 0; i < all.length; i++) {
            const t = new Date(all[i].date + 'T00:00:00Z');
            expect(t.getUTCDay(), all[i].date).toBe(0);
            if (i > 0) {
                const prev = new Date(all[i - 1].date + 'T00:00:00Z');
                expect((t - prev) / 864e5, `${all[i - 1].date} → ${all[i].date}`).toBe(7);
            }
        }
    });

    it('모든 주일에 필수 필드가 있다', () => {
        for (const s of all) {
            expect(s.koreanName, s.date).toBeTruthy();
            expect(s.season, s.date).toBeTruthy();
            for (const k of ['firstReadingA', 'secondReading', 'gospel']) {
                expect(s.readings[k], `${s.date} ${k}`).toBeTruthy();
            }
        }
    });

    it('각 연도는 대림 제1주일로 시작해 왕이신 그리스도 주일로 끝난다', () => {
        for (const f of files) {
            expect(f.sundays[0].koreanName, f.year).toBe('대림 제1주일');
            expect(f.sundays.at(-1).koreanName, f.year).toBe('왕이신 그리스도 주일');
        }
    });
});

describe('나해(B년) 표본 검증', () => {
    it('2026-11-29 대림 제1주일은 나해다', () => {
        const r = resolveReadings(all, {}, '2026-11-29');
        expect(r.year).toBe('B');
        expect(r.first).toBe('이사야 64:1-9');
        expect(r.gospel).toBe('마르코 13:24-37');
    });

    it('2027-03-28 부활 주일', () => {
        const s = all.find(x => x.date === '2027-03-28');
        expect(s.koreanName).toBe('부활 주일');
        expect(s.readings.gospel).toBe('요한 20:1-18');
    });

    it('연중 주일은 연속(A)·짝(B) 두 트랙을 모두 가진다 (2027-07-04, 연중 제14주일)', () => {
        const s = all.find(x => x.date === '2027-07-04');
        expect(s.koreanName).toBe('연중 제14주일');
        expect(s.readings.firstReadingA).toBe('사무엘하 5:1-5, 9-10');
        expect(s.readings.firstReadingB).toBe('에제키엘 2:1-5');
    });

    it('2026-11-22 가해 마지막 주일과 이어진다', () => {
        const i = all.findIndex(x => x.date === '2026-11-22');
        expect(all[i].year).toBe('A');
        expect(all[i + 1].date).toBe('2026-11-29');
        expect(all[i + 1].year).toBe('B');
    });
});
