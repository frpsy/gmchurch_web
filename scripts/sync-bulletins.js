#!/usr/bin/env node
import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ── Liturgical season label (Korean Anglican) ─────────────
// data.js의 LiturgicalCalendar와 동일한 알고리즘
function easterDate(year) {
    const a = year % 19, b = Math.floor(year / 100), c = year % 100;
    const d = Math.floor(b / 4), e = b % 4;
    const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4), k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day   = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
}

function addDays(date, n) {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
}

function adventStart(year) {
    const dec25 = new Date(year, 11, 25);
    const dow = dec25.getDay();
    return addDays(dec25, -(dow === 0 ? 28 : dow + 21));
}

function sundayLabel(dateStr) {
    const y  = +dateStr.slice(0, 4);
    const mo = +dateStr.slice(4, 6) - 1;
    const d  = +dateStr.slice(6, 8);
    const date = new Date(y, mo, d);

    const easter    = easterDate(y);
    const ashWed    = addDays(easter, -46);
    const palmSun   = addDays(easter, -7);
    const pentecost = addDays(easter, 49);
    const advent    = adventStart(y);
    const jan6      = new Date(y, 0, 6);
    const wk = (a, b) => Math.round((+a - +b) / 604800000);

    if (date >= pentecost && date < advent) {
        const w = wk(date, pentecost);
        if (w === 0) return '성령강림주일';
        if (w === 1) return '삼위일체 주일';
        return `성령강림 후 제${w}주일`;
    }
    if (date >= easter && date < pentecost) {
        const w = wk(date, easter);
        if (w === 0) return '부활주일';
        const ord = ['', '제2', '제3', '제4', '제5', '제6'];
        return `부활절 후 ${ord[w] || w + '번째'}주일`;
    }
    if (date >= palmSun) return '성주간';
    if (date >= ashWed)  return `사순절 제${wk(date, ashWed) + 1}주일`;
    if (date >= jan6) {
        const firstSun = addDays(jan6, (7 - jan6.getDay()) % 7);
        return `주현절 후 제${wk(date, firstSun) + 1}주일`;
    }
    if (date >= advent) return `대림 제${wk(date, advent) + 1}주일`;
    if (mo === 11 && d >= 25) return '성탄절';
    return '성탄절 후 주일';
}

// ── 경로 설정 ─────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, '..');
const BULLETINS = path.join(ROOT, 'bulletins');
const DATA_JS   = path.join(ROOT, 'data.js');
const MAX_WEEKS = 13;

const cutoff = new Date();
cutoff.setDate(cutoff.getDate() - MAX_WEEKS * 7);
cutoff.setHours(0, 0, 0, 0);

// ── 1. 오래된 PDF 삭제 ────────────────────────────────────
const allPdfs = fs.readdirSync(BULLETINS).filter(f => /^\d{8}\.pdf$/i.test(f));
const valid   = new Set();

for (const file of allPdfs) {
    const ds = file.replace(/\.pdf$/i, '');
    const fileDate = new Date(+ds.slice(0, 4), +ds.slice(4, 6) - 1, +ds.slice(6, 8));
    if (fileDate < cutoff) {
        fs.unlinkSync(path.join(BULLETINS, file));
        console.log(`  삭제: ${file}`);
    } else {
        valid.add(ds);
    }
}

// ── 2. 신규 items 목록 구성 ───────────────────────────────
const newItems = [...valid]
    .sort((a, b) => b.localeCompare(a)) // 최신 순
    .map(ds => {
        const y  = +ds.slice(0, 4);
        const mo = +ds.slice(4, 6);
        const d  = +ds.slice(6, 8);
        return {
            date:   `${ds.slice(0,4)}-${ds.slice(4,6)}-${ds.slice(6,8)}`,
            label:  `${y}년 ${mo}월 ${d}일`,
            season: sundayLabel(ds),
            file:   `bulletins/${ds}.pdf`
        };
    });

// ── 3. data.js items 배열 교체 ────────────────────────────
const src = fs.readFileSync(DATA_JS, 'utf8');

const SECTION_OPEN  = '    bulletins: {\n';
const SECTION_CLOSE = '    navigation: [\n';
const bStart = src.indexOf(SECTION_OPEN);
const bEnd   = src.indexOf(SECTION_CLOSE);

if (bStart === -1 || bEnd === -1) {
    console.error('data.js에서 bulletins 섹션을 찾을 수 없습니다.');
    process.exit(1);
}

const section = src.slice(bStart, bEnd);
const ITEMS_OPEN  = '        items: [\n';
const ITEMS_CLOSE = '\n        ]';
const iOpen  = section.indexOf(ITEMS_OPEN);
const iClose = section.indexOf(ITEMS_CLOSE, iOpen + ITEMS_OPEN.length);

if (iOpen === -1 || iClose === -1) {
    console.error('bulletins.items 배열을 찾을 수 없습니다.');
    process.exit(1);
}

const newItemsStr = newItems
    .map(it => [
        '            {',
        `                date: "${it.date}",`,
        `                label: "${it.label}",`,
        `                season: "${it.season}",`,
        `                file: "${it.file}"`,
        '            }'
    ].join('\n'))
    .join(',\n');

const newSection =
    section.slice(0, iOpen + ITEMS_OPEN.length) +
    newItemsStr +
    section.slice(iClose);

fs.writeFileSync(DATA_JS, src.slice(0, bStart) + newSection + src.slice(bEnd), 'utf8');

console.log(`\n주보 동기화 완료: ${newItems.length}건`);
newItems.forEach(it => console.log(`  + ${it.label}  ${it.season}`));
if (newItems.length === 0) console.log('  (등록된 주보 없음)');
