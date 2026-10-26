import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { extractPassage, parseRef, respace } from '../scripts/lib/bible.js';

const verses = JSON.parse(readFileSync(new URL('../data/bulletin-verses.json', import.meta.url), 'utf8')).weeks;

describe('성경 PDF 파서 (scripts/lib/bible.js)', () => {
    // 실제 공동번역 PDF의 마태오 22장 쪽을 pdftotext -layout으로 뽑은 일부
    const fixture = readFileSync(new URL('./fixtures/bible-matt22.txt', import.meta.url), 'utf8');

    it('참조를 책·장·절로 푼다', () => {
        expect(parseRef('마태 22:34-46')).toEqual({ book: '마태오의 복음서', chapter: 22, from: 34, to: 46 });
        expect(parseRef('1데살 2:8')).toEqual({ book: '데살로니카인들에게 보낸 첫째 편지', chapter: 2, from: 8, to: 8 });
        expect(() => parseRef('없는책 1:1')).toThrow('책 이름을 모릅니다');
    });

    it('절 번호·소제목·각주·쪽 번호를 걷어내고 마지막 절에서 멈춘다', () => {
        const out = extractPassage(fixture, '마태 22:34-46');
        expect(out.map(v => v.v)).toEqual(Array.from({ length: 13 }, (_, i) => 34 + i));
        const all = out.map(v => v.text).join('');
        expect(all).not.toMatch(/\d|마르코|루가|신명|시편|ㄱ|ㄴ|ㄷ|ㄹ/);
        expect(out[0].text.startsWith('예수께서')).toBe(true);
        expect(out.at(-1).text.endsWith('없었다.')).toBe(true);
    });

    it('핵심구절(마태 22:37-40)의 글자와 같다', () => {
        const got = extractPassage(fixture, '마태 22:37-40').map(v => v.text).join('').replace(/[‘’“”\s]/g, '');
        expect(got).toContain(verses['2026-10-25'].text.replace(/[‘’“”\s]/g, ''));
    });

    it('온라인 띄어쓰기를 입히고, 글자가 다르면 멈춘다', () => {
        expect(respace('너는저리로건너가지', '너는 저리로 건너가지')).toBe('너는 저리로 건너가지');
        expect(respace('“그러면”', '"그러면"')).toBe('“그러면”');
        expect(() => respace('가나다', '가나라')).toThrow('글자가 다릅니다');
    });
});
