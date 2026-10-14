import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { CHURCH_DATA } from './helpers/loadData.js';

const news = JSON.parse(readFileSync(new URL('../data/bulletin-news.json', import.meta.url), 'utf8'));

// 매주 수기로 갱신하는 파일이므로 형식을 검증한다
describe('bulletin-news.json', () => {
    const entries = Object.entries(news.weeks || {});

    it('날짜 키는 YYYY-MM-DD 형식의 일요일이다', () => {
        for (const [date] of entries) {
            expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            expect(new Date(date + 'T00:00:00').getDay()).toBe(0);
        }
    });

    it('모든 소식은 제목과 본문을 가진다', () => {
        for (const [, list] of entries) {
            expect(list.length).toBeGreaterThan(0);
            for (const n of list) {
                expect(n.title).toBeTypeOf('string');
                expect(n.title.trim()).not.toBe('');
                expect(n.body).toBeTypeOf('string');
                expect(n.body.trim()).not.toBe('');
            }
        }
    });

    it('약어는 점으로 구분해 적는다 (G.F.S.)', () => {
        const text = JSON.stringify(news.weeks);
        expect(text).not.toMatch(/\bGFS\b/);
    });

    it('data.js 주보 항목의 news가 이 파일과 일치한다 (sync 누락 방지)', () => {
        for (const item of CHURCH_DATA.bulletins.items) {
            expect(item.news || []).toEqual(news.weeks[item.date] || []);
        }
    });

    it('주보는 최근 8주까지만 보관한다 (sync 보관 규칙)', () => {
        expect(CHURCH_DATA.bulletins.items.length).toBeLessThanOrEqual(8);
        expect(entries.length).toBeLessThanOrEqual(8);
    });
});
