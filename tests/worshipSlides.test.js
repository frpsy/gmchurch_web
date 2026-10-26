import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { CHURCH_DATA } from './helpers/loadData.js';
import { buildSlides, buildBook, paginate, STAGES, SUBS, NOTICE_POS, NOTICE_SIZE, MAX_CHARS, MAX_LINES } from '../scripts/lib/worshipSlides.js';
import { parseRef } from '../scripts/lib/bible.js';

const json = rel => JSON.parse(readFileSync(new URL(rel, import.meta.url), 'utf8'));
const order = json('../data/worship-order.json');
const hymns = json('../data/worship-texts/hymns.json').hymns;
const bcp = json('../data/worship-texts/bcp.json').pages;
const dialogs = json('../data/worship-texts/responses.json').dialogs;
const readings = json('../data/worship-texts/readings.json').readings;
const ctx = { hymns, bcp, dialogs, defaults: order.defaults };

const TYPES = ['hymn', 'bcp', 'dialog', 'reading', 'psalm', 'intercession', 'sermon', 'notice'];

describe('worship-order.json', () => {
    const weeks = Object.entries(order.weeks);

    it('날짜 키는 YYYY-MM-DD 형식의 일요일이다', () => {
        for (const [date] of weeks) {
            expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            expect(new Date(date + 'T00:00:00').getDay()).toBe(0);
        }
    });

    it('집전·설교 사제 이름은 사이트에 등록된 사제와 일치한다 (주보 이미지 오독 방지)', () => {
        const names = new Set();
        const walk = o => {
            if (Array.isArray(o)) o.forEach(walk);
            else if (o && typeof o === 'object') {
                if (typeof o.name === 'string') names.add(o.name.replace(/\((.+)\)/, ' $1'));
                Object.values(o).forEach(walk);
            }
        };
        walk(CHURCH_DATA);
        for (const [date, week] of weeks) {
            for (const who of [week.celebrant, week.preacher]) expect(names, `${date} ${who}`).toContain(who.replace(/ 사제$/, ''));
        }
    });

    it('항목은 소제목이거나 알려진 종류이며 이름(label)·맡은 이(by)·위치 막대 칸(stage)을 가진다', () => {
        for (const [date, week] of weeks) {
            for (const item of week.items) {
                if (item.section) continue;
                expect(TYPES, `${date} ${item.label}`).toContain(item.type);
                expect(item.label, date).toBeTruthy();
                expect(item.by, `${date} ${item.label}`).toBeTruthy();
                expect(STAGES, `${date} ${item.label}`).toContain(item.stage);
                if (item.sub) expect(SUBS, `${date} ${item.label}`).toContain(item.sub);
            }
        }
    });

    it('위치 막대 칸은 되돌아가지 않는다 (모임→말씀→응답→파송)', () => {
        for (const [, week] of weeks) {
            const seq = week.items.filter(i => !i.section).map(i => STAGES.indexOf(i.stage));
            expect(seq).toEqual([...seq].sort((a, b) => a - b));
        }
    });

    it('기도서 쪽·응답·성경 참조 데이터가 모두 있다', () => {
        for (const [, week] of weeks) {
            for (const item of week.items) {
                if (item.type === 'bcp') expect(bcp[String(item.page)], `기도서 ${item.page}쪽`).toBeTruthy();
                if (item.type === 'dialog') expect(dialogs[item.dialog], item.dialog).toBeTruthy();
                if (item.type === 'reading') expect(() => parseRef(item.ref), item.ref).not.toThrow();
            }
        }
        for (const key of ['reading-end', 'gospel-intro', 'gospel-end', 'intercession-end']) expect(dialogs[key], key).toBeTruthy();
    });

    it('생성된 슬라이드 파일이 순서 데이터와 일치한다 (build-worship-slides 누락 방지)', () => {
        const index = json('../data/worship/index.json');
        for (const [date, week] of weeks) {
            const key = date.replaceAll('-', '');
            expect(index.dates).toContain(key);
            const built = json(`../data/worship/${key}.json`);
            expect(built).toEqual(JSON.parse(JSON.stringify({ date, title: week.title, slides: buildSlides(week, ctx).slides })));
        }
        for (const key of index.dates) expect(existsSync(new URL(`../data/worship/${key}.json`, import.meta.url))).toBe(true);
    });
});

describe('슬라이드', () => {
    for (const [date, week] of Object.entries(order.weeks)) {
        const { slides } = buildSlides(week, ctx);
        const text = s => (s.lines || []).map(l => l.text).join(' ');

        it(`${date}: 안내(광고)로 시작하고 위치 막대 칸마다 주제 그림 슬라이드가 먼저 온다`, () => {
            const notices = slides.filter(s => s.kind === 'notice');
            expect(notices.length).toBe((order.defaults.announcements || []).length + (week.announcements || []).length);
            expect(slides.slice(0, notices.length).every(s => s.kind === 'notice')).toBe(true);
            const themes = slides.filter(s => s.kind === 'theme').map(s => s.stage);
            expect(themes).toEqual(STAGES.filter(st => week.items.some(i => i.stage === st)));
            for (const st of STAGES) {
                const first = slides.findIndex(s => s.stage === st);
                if (first >= 0) expect(slides[first].kind, st).toBe('theme');
            }
        });

        it(`${date}: 주보 항목마다 슬라이드가 있다`, () => {
            for (const item of week.items.filter(i => !i.section)) {
                const label = item.type === 'psalm' ? `시편 ${item.ref}` : item.label;
                expect(slides.some(s => s.label === label || s.label?.startsWith(label) || (item.gospel && s.label === item.kind)), item.label).toBe(true);
            }
        });

        it(`${date}: 빈 슬라이드가 없고 글자·줄 수가 한도 안이다`, () => {
            for (const s of slides) {
                if (s.kind === 'theme' || s.kind === 'notice') continue;
                if (s.kind === 'title') { expect(s.text, s.label).toBeTruthy(); continue; }
                expect(s.lines.length, `${s.label} ${s.kind}`).toBeGreaterThan(0);
                expect(s.lines.length, s.label).toBeLessThanOrEqual(MAX_LINES);
                expect(text(s).length, s.label).toBeLessThanOrEqual(MAX_CHARS + 60);
            }
        });

        it(`${date}: 독서 본문·사제 기도문은 슬라이드에 싣지 않는다`, () => {
            const all = slides.map(text).join(' ').replace(/\s+/g, '');
            for (const r of Object.values(readings)) for (const v of r.verses) expect(all, v.text.slice(0, 12)).not.toContain(v.text.replace(/\s+/g, '').slice(0, 12));
            expect(all).not.toContain('전능하신하느님,주님께서는그리스도의성체와보혈');
        });

        it(`${date}: 독서 슬라이드는 책 이름·장절과 응답만 둔다`, () => {
            const reads = slides.filter(s => s.kind === 'reading');
            expect(reads.length).toBe(week.items.filter(i => i.type === 'reading').length);
            for (const s of reads) {
                expect(s.ref).toMatch(/^.+ \d+:\d+(-\d+)?$/);
                expect(s.lines.map(l => l.r)).toEqual(['l', 'a']);
            }
        });

        it(`${date}: 복음 소개 응답에 해당 복음서 성인 이름이 들어간다`, () => {
            const gospel = week.items.find(i => i.gospel);
            const saint = { 마태: '성 마태오가', 마르코: '성 마르코가', 루가: '성 루가가', 요한: '성 요한이' }[gospel.ref.split(' ')[0]];
            const intro = slides.find(s => s.label === gospel.label && s.kind === 'dialog');
            expect(text(intro)).toContain(`${saint} 전한 거룩한 복음입니다.`);
            expect(text(intro)).not.toContain('{');
        });

        it(`${date}: 시편 응답 줄은 앞 줄과 같은 쪽에 있다`, () => {
            for (const s of slides.filter(x => x.kind === 'psalm')) expect(s.lines[0].mark).not.toBe('○');
        });

        it(`${date}: 응답(a) 줄이 있는 슬라이드에는 신호말(p·l) 또는 단독 응답이 있다`, () => {
            for (const s of slides.filter(x => x.kind === 'dialog' || x.kind === 'reading')) {
                expect(s.lines.some(l => l.r === 'a'), s.label).toBe(true);
                for (const l of s.lines) expect(['p', 'l', 'a']).toContain(l.r);
            }
        });
    }
});

describe('안내(광고) 슬라이드', () => {
    it('글자나 그림이 있고, 그림 파일이 실제로 있으며, 글자 없는 그림에는 alt가 있다', () => {
        for (const [, week] of Object.entries(order.weeks)) {
            for (const a of [...(order.defaults.announcements || []), ...(week.announcements || [])]) {
                expect(a.text || a.image).toBeTruthy();
                if (a.image) expect(existsSync(new URL(`../${a.image}`, import.meta.url)), a.image).toBe(true);
                if (a.image && !a.text) expect(a.alt, a.image).toBeTruthy();
                if (a.pos) expect(NOTICE_POS).toContain(a.pos);
                if (a.size) expect(NOTICE_SIZE).toContain(a.size);
            }
        }
    });

    it('잘못된 안내 설정은 빌드에서 막는다', () => {
        const week = { title: 't', items: [], announcements: [{ image: 'x.jpg' }] };
        expect(() => buildSlides(week, { ...ctx, defaults: {} })).toThrow('alt');
        expect(() => buildSlides({ ...week, announcements: [{ text: 'a', pos: 'zz' }] }, { ...ctx, defaults: {} })).toThrow('pos');
        expect(() => buildSlides({ ...week, announcements: [{}] }, { ...ctx, defaults: {} })).toThrow('text나 image');
    });
});

describe('예식문 (book.json)', () => {
    for (const [date, week] of Object.entries(order.weeks)) {
        const key = date.replaceAll('-', '');
        const book = json(`../data/worship/${key}.book.json`);
        const items = book.sections.flatMap(s => s.items);

        it(`${date}: 생성된 예식문이 순서 데이터와 일치한다`, () => {
            expect(book).toEqual(JSON.parse(JSON.stringify({ date, ...buildBook(week, ctx) })));
        });

        it(`${date}: 주보 항목이 번호 순서대로 모두 있고 소제목이 같다`, () => {
            expect(items.map(i => i.label)).toEqual(week.items.filter(i => !i.section).map(i => i.label));
            expect(items.map(i => i.no)).toEqual(items.map((_, i) => i + 1));
            expect(book.sections.map(s => s.title)).toEqual(week.items.filter(i => i.section).map(i => i.section));
        });

        it(`${date}: 악보 이미지 파일이 있고 독서 본문은 싣지 않는다`, () => {
            for (const i of items.filter(x => x.score)) expect(existsSync(new URL(`../${i.score}`, import.meta.url)), i.score).toBe(true);
            const all = items.flatMap(i => i.lines.map(l => l.text || '')).join(' ').replace(/\s+/g, '');
            for (const r of Object.values(readings)) for (const v of r.verses) expect(all).not.toContain(v.text.replace(/\s+/g, '').slice(0, 12));
        });
    }
});

describe('성경 본문 readings.json (슬라이드에는 쓰지 않는 예비)', () => {
    it('절 번호가 참조 범위와 같고 본문에 숫자·줄바꿈이 없다', () => {
        for (const [ref, r] of Object.entries(readings)) {
            const { from, to } = parseRef(ref);
            expect(r.verses.map(v => v.v)).toEqual(Array.from({ length: to - from + 1 }, (_, i) => from + i));
            for (const v of r.verses) {
                expect(v.text, ref).not.toMatch(/\d/);
                expect(v.text, ref).not.toContain('\n');
            }
        }
    });
});

describe('쪽 나누기', () => {
    it('한도를 넘기면 다음 쪽으로 넘기고 keep 줄은 앞 줄과 붙인다', () => {
        const lines = [{ text: 'a'.repeat(100) }, { text: 'b'.repeat(40) }, { text: 'c'.repeat(40), keep: true }];
        const pages = paginate(lines, { maxChars: 150 });
        expect(pages.map(p => p.map(l => l.text[0]).join(''))).toEqual(['a', 'bc']);
    });
});
