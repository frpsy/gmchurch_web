import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const read = f => JSON.parse(readFileSync(join(__dirname, '..', 'data', f), 'utf-8'));

// 주보 등록 시 매주 수기로 갱신하는 파일이므로 형식을 검증한다
describe('lectionary-overrides.json', () => {
    const overrides = read('lectionary-overrides.json');
    const base      = read('lectionary-year-a.json');
    const baseDates = new Set(base.sundays.map(s => s.date));

    it('sundays 객체가 존재한다', () => {
        expect(overrides.sundays).toBeTypeOf('object');
    });

    const entries = Object.entries(overrides.sundays || {});

    it('날짜 키는 YYYY-MM-DD 형식의 일요일이다', () => {
        for (const [date] of entries) {
            expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            expect(new Date(date + 'T00:00:00').getDay()).toBe(0);
        }
    });

    it('모든 날짜가 표준 전례독서 목록에 존재한다', () => {
        for (const [date] of entries) {
            expect(baseDates.has(date), `${date}가 lectionary-year-a.json에 없음`).toBe(true);
        }
    });

    it('track은 A 또는 B다', () => {
        for (const [date, o] of entries) {
            if (o.track !== undefined) {
                expect(['A', 'B'], `${date}의 track`).toContain(o.track);
            }
        }
    });

    it('readings가 있으면 네 본문을 모두 갖춘다', () => {
        for (const [date, o] of entries) {
            if (o.readings) {
                for (const key of ['firstReading', 'psalm', 'secondReading', 'gospel']) {
                    expect(o.readings[key], `${date}의 ${key}`).toBeTruthy();
                }
            }
        }
    });

    it('psalm이 있으면 "시편"으로 시작한다', () => {
        for (const [date, o] of entries) {
            if (o.psalm) expect(o.psalm, `${date}의 psalm`).toMatch(/^시편/);
        }
    });

    it('psalm 단독 지정은 track과 함께 온다 (트랙 A 시편 교정용)', () => {
        for (const [date, o] of entries) {
            if (o.psalm && !o.readings) {
                expect(o.track, `${date}: psalm은 track과 함께`).toBeTruthy();
            }
        }
    });

    it('각 항목은 track 또는 readings 중 하나 이상을 가진다', () => {
        for (const [date, o] of entries) {
            expect(o.track || o.readings, `${date}에 track/readings 없음`).toBeTruthy();
        }
    });
});
