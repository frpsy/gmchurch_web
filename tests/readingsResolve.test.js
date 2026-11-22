// 독서 본문이 화면에서 찾아지는지 검사한다(2026-11-22 제2독서 누락 재발 방지).
// 주보 독서 항목의 책 이름과 readings.json 키의 책 이름이 jubo/index.html의 BIBLE 목록에 있어야 한다.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const html = readFileSync(fileURLToPath(new URL('../jubo/index.html', import.meta.url)), 'utf8');
const BIBLE = JSON.parse(/const BIBLE = (\{.*?\});/s.exec(html)[1]);
const order = JSON.parse(readFileSync(fileURLToPath(new URL('../data/worship-order.json', import.meta.url)), 'utf8'));
const readings = JSON.parse(readFileSync(fileURLToPath(new URL('../data/worship-texts/readings.json', import.meta.url)), 'utf8')).readings;

// jubo/index.html의 refKey와 같은 규칙: "책 이름 장:절"에서 책 이름이 BIBLE에 있어야 한다.
const bookOf = ref => {
    const m = /^(.+?)\s+(\d+.*)$/.exec(String(ref || '').trim());
    return m ? m[1] : null;
};

describe('독서 본문 해석', () => {
    it('주차별 독서 항목의 책 이름이 jubo BIBLE 목록에 있다', () => {
        for (const [date, week] of Object.entries(order.weeks)) {
            for (const it of week.items.filter(i => i.type === 'reading')) {
                const book = bookOf(it.ref);
                expect(BIBLE[book], `${date} ${it.label} "${it.ref}"`).toBeTruthy();
            }
        }
    });

    it('readings.json 키의 책 이름이 jubo BIBLE 목록에 있다', () => {
        for (const key of Object.keys(readings)) {
            const book = bookOf(key);
            expect(BIBLE[book], `readings "${key}"`).toBeTruthy();
        }
    });
});
