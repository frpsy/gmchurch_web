import { describe, it, expect } from 'vitest';
import { LiturgicalCalendar } from './helpers/loadData.js';

// ──────────────────────────────────────────────
// easterDate
// ──────────────────────────────────────────────
describe('LiturgicalCalendar.easterDate', () => {
    // Verified against Gregorian Easter tables
    const knownEasters = [
        { year: 2024, month: 3,  day: 31 },
        { year: 2025, month: 4,  day: 20 },
        { year: 2026, month: 4,  day: 5  },
        { year: 2027, month: 3,  day: 28 },
        { year: 2028, month: 4,  day: 16 },
    ];

    it.each(knownEasters)(
        'Easter $year → $month/$day',
        ({ year, month, day }) => {
            const easter = LiturgicalCalendar.easterDate(year);
            expect(easter.getFullYear()).toBe(year);
            expect(easter.getMonth() + 1).toBe(month);
            expect(easter.getDate()).toBe(day);
        }
    );

    it('returns a Date-like object with year/month/day accessors', () => {
        const d = LiturgicalCalendar.easterDate(2025);
        // instanceof check fails across vm context boundaries; use toString instead
        expect(Object.prototype.toString.call(d)).toBe('[object Date]');
        expect(typeof d.getFullYear).toBe('function');
    });

    it('Easter always falls on a Sunday', () => {
        for (let year = 2020; year <= 2040; year++) {
            const easter = LiturgicalCalendar.easterDate(year);
            expect(easter.getDay(), `Easter ${year}`).toBe(0);
        }
    });

    it('Easter always falls between March 22 and April 25 (Gregorian)', () => {
        for (let year = 2020; year <= 2040; year++) {
            const easter = LiturgicalCalendar.easterDate(year);
            const m = easter.getMonth() + 1;
            const d = easter.getDate();
            const isInRange =
                (m === 3 && d >= 22) ||
                (m === 4 && d <= 25);
            expect(isInRange, `Easter ${year} (${m}/${d})`).toBe(true);
        }
    });
});

// ──────────────────────────────────────────────
// adventStart
// ──────────────────────────────────────────────
describe('LiturgicalCalendar.adventStart', () => {
    const knownAdvents = [
        // Dec 25 = Sunday  → back 28 days → Nov 27
        { year: 2022, month: 11, day: 27 },
        // Dec 25 = Wednesday → back 24 days → Dec 1
        { year: 2024, month: 12, day: 1  },
        // Dec 25 = Thursday  → back 25 days → Nov 30
        { year: 2025, month: 11, day: 30 },
        // Dec 25 = Friday    → back 26 days → Nov 29
        { year: 2026, month: 11, day: 29 },
    ];

    it.each(knownAdvents)(
        'Advent $year → $month/$day',
        ({ year, month, day }) => {
            const advent = LiturgicalCalendar.adventStart(year);
            expect(advent.getMonth() + 1).toBe(month);
            expect(advent.getDate()).toBe(day);
        }
    );

    it('always returns a Sunday', () => {
        for (let year = 2020; year <= 2040; year++) {
            const advent = LiturgicalCalendar.adventStart(year);
            expect(advent.getDay(), `Advent ${year}`).toBe(0);
        }
    });

    it('always falls between Nov 27 and Dec 3 inclusive', () => {
        for (let year = 2020; year <= 2040; year++) {
            const advent = LiturgicalCalendar.adventStart(year);
            const nov27 = new Date(year, 10, 27);
            const dec3  = new Date(year, 11, 3);
            expect(advent >= nov27, `Advent ${year} >= Nov 27`).toBe(true);
            expect(advent <= dec3,  `Advent ${year} <= Dec 3`).toBe(true);
        }
    });
});

// ──────────────────────────────────────────────
// compute — season boundary cases
// All boundaries verified for 2026:
//   Easter      April  5
//   Ash Wed     Feb   18  (Easter − 46)
//   Palm Sun    March 29  (Easter − 7)
//   Pentecost   May   24  (Easter + 49)
//   Advent      Nov   29
// ──────────────────────────────────────────────
describe('LiturgicalCalendar.compute — season boundaries (2026)', () => {
    const cases = [
        // Christmas (Jan 1 – Jan 5)
        { date: [2026,  1,  1], name: '성탄절',      colorName: '백색' },
        { date: [2026,  1,  5], name: '성탄절',      colorName: '백색' },
        // Epiphany (Jan 6 – Ash Wed eve)
        { date: [2026,  1,  6], name: '공현절 후',   colorName: '녹색' },
        { date: [2026,  2, 17], name: '공현절 후',   colorName: '녹색' },
        // Lent (Ash Wed – Palm Sun eve)
        { date: [2026,  2, 18], name: '사순절',      colorName: '자색' },
        { date: [2026,  3, 28], name: '사순절',      colorName: '자색' },
        // Holy Week (Palm Sun – Easter eve)
        { date: [2026,  3, 29], name: '성주간',      colorName: '적색' },
        { date: [2026,  4,  4], name: '성주간',      colorName: '적색' },
        // Easter (Easter Sun – Pentecost eve)
        { date: [2026,  4,  5], name: '부활절',      colorName: '백색' },
        { date: [2026,  5, 23], name: '부활절',      colorName: '백색' },
        // Pentecost (Pentecost Sunday only)
        { date: [2026,  5, 24], name: '성령강림절',  colorName: '적색' },
        // Ordinary Time (day after Pentecost – Advent eve)
        { date: [2026,  5, 25], name: '성령강림 후', colorName: '녹색' },
        { date: [2026, 11, 28], name: '성령강림 후', colorName: '녹색' },
        // Advent (Advent Sun – Dec 24)
        { date: [2026, 11, 29], name: '대림절',      colorName: '자색' },
        { date: [2026, 12, 24], name: '대림절',      colorName: '자색' },
        // Christmas (Dec 25 – Dec 31)
        { date: [2026, 12, 25], name: '성탄절',      colorName: '백색' },
        { date: [2026, 12, 31], name: '성탄절',      colorName: '백색' },
    ];

    it.each(cases)(
        '$date → $name ($colorName)',
        ({ date: [y, m, d], name, colorName }) => {
            const result = LiturgicalCalendar.compute(new Date(y, m - 1, d));
            expect(result.name).toBe(name);
            expect(result.colorName).toBe(colorName);
        }
    );
});

// ──────────────────────────────────────────────
// compute — return value shape
// ──────────────────────────────────────────────
describe('LiturgicalCalendar.compute — return value shape', () => {
    it('has all required fields', () => {
        const result = LiturgicalCalendar.compute(new Date(2026, 3, 5));
        expect(result).toHaveProperty('name');
        expect(result).toHaveProperty('colorName');
        expect(result).toHaveProperty('color');
        expect(result).toHaveProperty('colorLight');
        expect(result).toHaveProperty('symbol');
        expect(result).toHaveProperty('note');
        expect(result).toHaveProperty('year');
        expect(result).toHaveProperty('dateLabel');
    });

    it('color and colorLight are valid 6-digit hex strings', () => {
        const testDates = [
            new Date(2026,  0,  1),  // Christmas
            new Date(2026,  0,  6),  // Epiphany
            new Date(2026,  1, 18),  // Lent
            new Date(2026,  2, 29),  // Holy Week
            new Date(2026,  3,  5),  // Easter
            new Date(2026,  4, 24),  // Pentecost
            new Date(2026,  4, 25),  // Ordinary
            new Date(2026, 10, 29),  // Advent
        ];
        testDates.forEach(d => {
            const r = LiturgicalCalendar.compute(d);
            expect(r.color,      `color for ${d.toDateString()}`).toMatch(/^#[0-9a-f]{6}$/i);
            expect(r.colorLight, `colorLight for ${d.toDateString()}`).toMatch(/^#[0-9a-f]{6}$/i);
        });
    });

    it('dateLabel reflects the input month and year', () => {
        const result = LiturgicalCalendar.compute(new Date(2026, 4, 24));
        expect(result.dateLabel).toBe('2026년 5월');
        expect(result.year).toBe(2026);
    });

    it('defaults to current year when called with no argument', () => {
        const result = LiturgicalCalendar.compute();
        expect(result.year).toBe(new Date().getFullYear());
    });
});
