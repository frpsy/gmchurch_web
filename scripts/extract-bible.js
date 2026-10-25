// 공동번역 PDF에서 구절을 뽑아 data/worship-texts/readings.json에 확정한다.
//   node scripts/extract-bible.js "신명 34:1-12" "마태 22:34-46" [--write]
// 글자는 bible/ PDF 기준이고, 띄어쓰기는 온라인 공동번역(bible.anglican.kr)에서 가져와 입힌다.
// 두 출처의 글자가 다르면 멈춘다(글자 대조). --write가 없으면 화면에만 출력한다.
import { readFileSync, writeFileSync } from 'node:fs';
import { extractReadings, READINGS_PATH } from './lib/readings.js';

const args = process.argv.slice(2);
const write = args.includes('--write');
const refs = args.filter(a => !a.startsWith('--'));
if (!refs.length) {
    console.error('사용법: node scripts/extract-bible.js "신명 34:1-12" [...] [--write]');
    process.exit(1);
}

const found = await extractReadings(refs);
for (const [ref, r] of Object.entries(found)) {
    console.log(`## ${ref}`);
    for (const v of r.verses) console.log(`${v.v} ${v.text}`);
}
if (write) {
    const file = JSON.parse(readFileSync(READINGS_PATH, 'utf8'));
    Object.assign(file.readings, found);
    writeFileSync(READINGS_PATH, JSON.stringify(file, null, 2) + '\n');
    console.log('\n저장했습니다: data/worship-texts/readings.json');
}
