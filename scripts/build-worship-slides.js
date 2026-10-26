// 주보 예배 순서 → 예배 슬라이드 JSON.
//   node scripts/build-worship-slides.js [YYYY-MM-DD]   (기본: worship-order.json의 가장 최근 주)
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildSlides } from './lib/worshipSlides.js';

const root = new URL('../', import.meta.url);
const json = rel => JSON.parse(readFileSync(new URL(rel, root), 'utf8'));

const order = json('data/worship-order.json');
const date = process.argv[2] || Object.keys(order.weeks).sort().at(-1);
const week = order.weeks[date];
if (!week) {
    console.error(`worship-order.json에 ${date} 주가 없습니다.`);
    process.exit(1);
}

const { slides, warnings } = buildSlides(week, {
    hymns: json('data/worship-texts/hymns.json').hymns,
    bcp: json('data/worship-texts/bcp.json').pages,
    dialogs: json('data/worship-texts/responses.json').dialogs,
    defaults: order.defaults,
});

const key = date.replaceAll('-', '');
const dir = fileURLToPath(new URL('data/worship/', root));
mkdirSync(dir, { recursive: true });
writeFileSync(`${dir}${key}.json`, JSON.stringify({ date, title: week.title, slides }, null, 2) + '\n');

const dates = readdirSync(dir).filter(f => /^\d{8}\.json$/.test(f)).map(f => f.slice(0, 8)).sort().reverse();
writeFileSync(`${dir}index.json`, JSON.stringify({ dates }, null, 2) + '\n');

console.log(`data/worship/${key}.json — 슬라이드 ${slides.length}장`);
for (const w of warnings) console.log(`ℹ️ ${w}`);
const extras = week.items.filter(i => i.extra).map(i => i.label);
if (extras.length) console.log(`ℹ️ 주보에 없는 순서(교회 슬라이드 기준) ${extras.length}건: ${extras.join(', ')}`);
if (!week.theme?.image) console.log('ℹ️ 주제 그림 미지정 (worship-order.json theme.image) — 그림 없이 글자만 표시');
