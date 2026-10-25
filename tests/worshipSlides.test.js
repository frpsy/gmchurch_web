import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { buildSlides, paginate, splitSentences, modeOf, MAX_CHARS, MAX_LINES } from '../scripts/lib/worshipSlides.js';
import { extractPassage, parseRef, respace } from '../scripts/lib/bible.js';

const json = rel => JSON.parse(readFileSync(new URL(rel, import.meta.url), 'utf8'));
const order = json('../data/worship-order.json');
const hymns = json('../data/worship-texts/hymns.json').hymns;
const bcp = json('../data/worship-texts/bcp.json').pages;
const readings = json('../data/worship-texts/readings.json').readings;
const verses = json('../data/bulletin-verses.json').weeks;
const ctx = { hymns, bcp, readings, defaults: order.defaults };

const TYPES = ['hymn', 'bcp', 'reading', 'psalm', 'prayer', 'sermon', 'notice'];

describe('worship-order.json', () => {
    const weeks = Object.entries(order.weeks);

    it('날짜 키는 YYYY-MM-DD 형식의 일요일이다', () => {
        for (const [date] of weeks) {
            expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            expect(new Date(date + 'T00:00:00').getDay()).toBe(0);
        }
    });

    it('항목은 소제목이거나 알려진 종류이며 이름(label)과 맡은 이(by)를 가진다', () => {
        for (const [date, week] of weeks) {
            expect(week.title, date).toBeTruthy();
            for (const item of week.items) {
                if (item.section) continue;
                expect(TYPES, `${date} ${item.label}`).toContain(item.type);
                expect(item.label, date).toBeTruthy();
                expect(item.by, `${date} ${item.label}`).toBeTruthy();
            }
        }
    });

    it('성가·기도서·성경 본문 데이터가 모두 있다', () => {
        for (const [, week] of weeks) {
            for (const item of week.items) {
                if (item.type === 'hymn') expect(hymns[String(item.number)], `성가 ${item.number}장`).toBeTruthy();
                if (item.type === 'bcp') expect(bcp[String(item.page)], `기도서 ${item.page}쪽`).toBeTruthy();
                if (item.type === 'reading') expect(readings[item.ref], item.ref).toBeTruthy();
            }
        }
    });

    it('종류별 기본 mode와 항목별 mode는 정해진 값만 쓴다', () => {
        for (const [, week] of weeks) for (const item of week.items) if (item.type) expect(['full', 'title', 'blank']).toContain(modeOf(item, order.defaults));
    });

    it('생성된 슬라이드 파일이 순서 데이터와 일치한다 (build-worship-slides 누락 방지)', () => {
        const index = json('../data/worship/index.json');
        for (const [date, week] of weeks) {
            const key = date.replaceAll('-', '');
            expect(index.dates).toContain(key);
            const built = json(`../data/worship/${key}.json`);
            expect(built).toEqual(JSON.parse(JSON.stringify({ date, title: week.title, slides: buildSlides(week, ctx) })));
        }
        for (const key of index.dates) expect(existsSync(new URL(`../data/worship/${key}.json`, import.meta.url))).toBe(true);
    });
});

describe('슬라이드', () => {
    for (const [date, week] of Object.entries(order.weeks)) {
        const slides = buildSlides(week, ctx);

        it(`${date}: 표지로 시작하고 주보 항목마다 슬라이드가 있다`, () => {
            expect(slides[0].kind).toBe('cover');
            for (const item of week.items) {
                if (item.section) expect(slides.some(s => s.kind === 'section' && s.title === item.section), item.section).toBe(true);
                else expect(slides.some(s => s.label === item.label), item.label).toBe(true);
            }
        });

        it(`${date}: 빈 슬라이드가 없고 글자·줄 수가 한도 안이다`, () => {
            for (const s of slides) {
                if (s.kind === 'blank') continue;
                expect([s.title, s.label].filter(Boolean).length, JSON.stringify(s)).toBeGreaterThan(0);
                if (s.kind !== 'text') continue;
                expect(s.lines.length).toBeGreaterThan(0);
                expect(s.lines.length, `${s.label} ${s.part}`).toBeLessThanOrEqual(MAX_LINES);
                const chars = s.lines.reduce((n, l) => n + l.text.length, 0);
                expect(chars, `${s.label} ${s.part}`).toBeLessThanOrEqual(MAX_CHARS + 20);
            }
        });

        it(`${date}: 독서 본문은 읽는 순서 그대로 빠짐없이 나뉜다`, () => {
            for (const item of week.items.filter(i => i.type === 'reading')) {
                const joined = slides.filter(s => s.label === item.label && s.kind === 'text').flatMap(s => s.lines.map(l => l.text)).join(' ');
                const expected = readings[item.ref].verses.map(v => v.text).join(' ');
                expect(joined.replace(/\s+/g, ' ')).toBe(expected.replace(/\s+/g, ' '));
            }
        });

        it(`${date}: 시편 응답 줄은 앞 줄과 같은 쪽에 있다`, () => {
            for (const s of slides.filter(x => x.label === '성시')) expect(s.lines[0].mark).not.toBe('○');
        });

        it(`${date}: 더미 슬라이드는 더미 데이터에서만 나온다`, () => {
            for (const s of slides.filter(x => x.dummy)) {
                const item = week.items.find(i => i.label === s.label);
                const src = item.type === 'hymn' ? hymns[String(item.number)] : bcp[String(item.page)];
                expect(src.dummy).toBe(true);
            }
        });
    }
});

describe('성경 본문 readings.json', () => {
    it('절 번호가 참조 범위와 같고 본문에 숫자·줄바꿈이 없다', () => {
        for (const [ref, r] of Object.entries(readings)) {
            const { from, to } = parseRef(ref);
            expect(r.verses.map(v => v.v)).toEqual(Array.from({ length: to - from + 1 }, (_, i) => from + i));
            for (const v of r.verses) {
                expect(v.text, ref).not.toMatch(/\d/);
                expect(v.text, ref).not.toContain('\n');
                expect(v.text, ref).not.toMatch(/\s{2,}/);
            }
        }
    });

    it('주보 핵심구절(bulletin-verses)과 같은 구절은 글자가 일치한다', () => {
        const norm = s => s.replace(/[‘’“”\s]/g, '');
        for (const [date, v] of Object.entries(verses)) {
            const m = /^(\S+) (\d+):(\d+)-(\d+)$/.exec(v.ref);
            const [, book, ch, a, b] = m;
            const covering = Object.entries(readings).find(([ref]) => {
                const p = /^(\S+) (\d+):(\d+)-(\d+)$/.exec(ref);
                return p && p[1] === book && p[2] === ch && Number(p[3]) <= Number(a) && Number(p[4]) >= Number(b);
            });
            if (!covering) continue;
            const text = covering[1].verses.filter(x => x.v >= Number(a) && x.v <= Number(b)).map(x => x.text).join('');
            expect(norm(text), date).toContain(norm(v.text));
        }
    });
});

describe('문장·쪽 나누기', () => {
    it('문장 끝(닫는 따옴표 포함)에서 나눈다', () => {
        expect(splitSentences('“가나다.” 라마바. 사아자?')).toEqual(['“가나다.”', '라마바.', '사아자?']);
    });

    it('한도를 넘기면 다음 쪽으로 넘기고 keep 줄은 앞 줄과 붙인다', () => {
        const lines = [{ text: 'a'.repeat(100) }, { text: 'b'.repeat(40) }, { text: 'c'.repeat(40), keep: true }];
        const pages = paginate(lines, { maxChars: 150 });
        expect(pages.map(p => p.map(l => l.text[0]).join(''))).toEqual(['a', 'bc']);
    });

    it('쪽 머리·꼬리의 연 구분 빈 줄을 버린다', () => {
        const pages = paginate([{ text: 'a'.repeat(100) }, { text: '', gap: true }, { text: 'b'.repeat(100) }], { maxChars: 150 });
        expect(pages.map(p => p.length)).toEqual([1, 1]);
    });
});

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
