import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { CHURCH_DATA } from './helpers/loadData.js';

const verses = JSON.parse(readFileSync(new URL('../data/bulletin-verses.json', import.meta.url), 'utf8'));

// 매주 수기로 갱신하는 파일이므로 형식을 검증한다
describe('bulletin-verses.json', () => {
    const entries = Object.entries(verses.weeks || {});

    it('날짜 키는 YYYY-MM-DD 형식의 일요일이다', () => {
        for (const [date] of entries) {
            expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            expect(new Date(date + 'T00:00:00').getDay()).toBe(0);
        }
    });

    it('모든 구절은 출처(ref)와 본문(text)을 가진다', () => {
        for (const [, v] of entries) {
            expect(v.ref).toMatch(/^[가-힣0-9]+ \d+:\d+(-\d+)?$/);
            expect(v.text).toBeTypeOf('string');
            expect(v.text.trim()).not.toBe('');
        }
    });

    it('본문에 절 번호나 줄바꿈을 넣지 않는다', () => {
        for (const [date, v] of entries) {
            expect(v.text, date).not.toMatch(/\d/);
            expect(v.text, date).not.toContain('\n');
        }
    });

    it('data.js 주보 항목의 verse가 이 파일과 일치한다 (sync 누락 방지)', () => {
        for (const item of CHURCH_DATA.bulletins.items) {
            expect(item.verse || null).toEqual(verses.weeks[item.date] || null);
        }
    });

    it('주보는 최근 8주까지만 보관한다 (sync 보관 규칙)', () => {
        expect(entries.length).toBeLessThanOrEqual(8);
    });
});
