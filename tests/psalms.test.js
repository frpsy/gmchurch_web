import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';

const json = rel => JSON.parse(readFileSync(new URL(rel, import.meta.url), 'utf8'));
const order = json('../data/worship-order.json');
const psalms = json('../data/worship-texts/psalms.json').psalms;
const letters = s => String(s).replace(/[\s:¶]/g, '');
const joined = lines => letters(lines.map(l => l.text).join(''));

// 성시 본문이 비거나 다른 시편 본문으로 어긋나는 일을 막는다(2026-11-08 재발방지).
describe('성시(시편) 본문', () => {
    const items = Object.entries(order.weeks).flatMap(([week, w]) =>
        w.items.filter(i => i.type === 'psalm').map(i => ({ week, ...i })));

    it('예배 순서에 성시가 있다', () => expect(items.length).toBeGreaterThan(0));

    for (const item of items) {
        describe(`${item.week} ${item.ref}`, () => {
            const number = String(parseInt(item.ref, 10));
            it('본문이 비어 있지 않다', () => {
                expect(item.lines?.length, '성시 lines가 비었습니다. node scripts/extract-psalm.js <번호> --write 후 worship-order에 넣으세요').toBeGreaterThan(0);
            });
            it('공동번역 감사성찬례용 시편(psalms.json) 본문과 글자가 같다', () => {
                expect(psalms[number], `psalms.json에 ${number}편이 없습니다`).toBeTruthy();
                expect(joined(item.lines)).toBe(joined(psalms[number].lines));
            });
            it('악보 이미지가 있다', () => {
                expect(item.score).toBeTruthy();
                expect(existsSync(new URL(`../${item.score}`, import.meta.url))).toBe(true);
            });
        });
    }
});
