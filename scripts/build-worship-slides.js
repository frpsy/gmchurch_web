// 주보 예배 순서 → 예배 슬라이드 JSON.
//   node scripts/build-worship-slides.js [YYYY-MM-DD]   (기본: worship-order.json의 가장 최근 주)
// 성경 본문이 readings.json에 없으면 PDF에서 뽑아 채운다(extract-bible.js와 같은 방식).
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildSlides } from './lib/worshipSlides.js';
import { extractReadings, READINGS_PATH } from './lib/readings.js';

const root = new URL('../', import.meta.url);
const json = rel => JSON.parse(readFileSync(new URL(rel, root), 'utf8'));

const order = json('data/worship-order.json');
const date = process.argv[2] || Object.keys(order.weeks).sort().at(-1);
const week = order.weeks[date];
if (!week) {
    console.error(`worship-order.json에 ${date} 주가 없습니다.`);
    process.exit(1);
}

const readingsFile = json('data/worship-texts/readings.json');
const missing = week.items.filter(i => i.type === 'reading' && !readingsFile.readings[i.ref]).map(i => i.ref);
if (missing.length) {
    Object.assign(readingsFile.readings, await extractReadings([...new Set(missing)]));
    writeFileSync(READINGS_PATH, JSON.stringify(readingsFile, null, 2) + '\n');
    console.log(`성경 본문 추가: ${missing.join(', ')}`);
}

const slides = buildSlides(week, {
    hymns: json('data/worship-texts/hymns.json').hymns,
    bcp: json('data/worship-texts/bcp.json').pages,
    readings: readingsFile.readings,
    defaults: order.defaults,
});

const key = date.replaceAll('-', '');
const dir = fileURLToPath(new URL('data/worship/', root));
mkdirSync(dir, { recursive: true });
writeFileSync(`${dir}${key}.json`, JSON.stringify({ date, title: week.title, slides }, null, 2) + '\n');

const dates = readdirSync(dir).filter(f => /^\d{8}\.json$/.test(f)).map(f => f.slice(0, 8)).sort().reverse();
writeFileSync(`${dir}index.json`, JSON.stringify({ dates }, null, 2) + '\n');

console.log(`data/worship/${key}.json — 슬라이드 ${slides.length}장`);
const dummy = slides.filter(s => s.dummy);
if (dummy.length) console.log(`⚠️ 더미 슬라이드 ${dummy.length}장: ${[...new Set(dummy.map(s => s.sub))].join(', ')} (성가집·기도서 파일 반영 필요)`);
