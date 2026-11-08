import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';

const json = rel => JSON.parse(readFileSync(new URL(rel, import.meta.url), 'utf8'));
const bcp = json('../data/worship-texts/bcp.json').pages;
const books = readdirSync(new URL('../data/worship/', import.meta.url)).filter(f => /^\d{8}\.book\.json$/.test(f));
const textOf = it => (it.lines || []).filter(l => l.text && !l.gap).map(l => l.text);

// 순서지에서 성시·기도서 본문이 빠지는 일을 막는다(2026-11-08 영성체후기도 누락 재발방지).
describe('순서지 성시·기도서 본문 누락 점검', () => {
    for (const f of books) {
        const items = json(`../data/worship/${f}`).sections.flatMap(s => s.items || []);
        describe(f, () => {
            it('성시 본문이 있다', () => {
                for (const it of items.filter(i => /시편|성시/.test(i.label || '') || /^\d+편$/.test(i.ref || '')))
                    expect(textOf(it).length, `${it.label} 본문 누락`).toBeGreaterThan(0);
            });
            it('기도서 N쪽 항목은 기도서 본문 전체가 실려 있다', () => {
                for (const it of items.filter(i => /^기도서 \d+쪽$/.test(i.ref || ''))) {
                    const page = it.ref.match(/\d+/)[0];
                    const src = bcp[page];
                    expect(src, `bcp.json에 ${page}쪽이 없습니다`).toBeTruthy();
                    const want = src.slides.flat().map(l => (typeof l === 'string' ? l : l.t)).join('');
                    expect(textOf(it).join(''), `${it.label}(기도서 ${page}쪽) 본문 누락`).toBe(want);
                }
            });
            it('"아멘"만 있는 기도 항목이 없다', () => {
                for (const it of items.filter(i => /기도/.test(i.label || '')))
                    if (textOf(it).length) expect(textOf(it).join('') !== '아멘', `${it.label}에 기도문 없이 아멘만 있습니다`).toBe(true);
            });
        });
    }
});
