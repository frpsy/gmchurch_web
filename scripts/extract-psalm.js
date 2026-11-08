// 공동번역 PDF 부록 "감사성찬례용 시편"에서 성시 본문(1~6절 + 영광송)을 뽑아 data/worship-texts/psalms.json에 둔다.
//   node scripts/extract-psalm.js 65 [34 90 ...] [--write]
// 주보 성시는 이 부록의 1~6절을 쓴다(교회 관행: 2026-10-25 90편, 11-01 34편). 주보에 인쇄된 본문이 이 시편과 다르거나 비어 있으면
// 임의로 비우지 말고 이 스크립트로 채운다. 줄바꿈 자리의 띄어쓰기는 PDF만으로 알 수 없으므로 화면에 낸 뒤 사람이 확인한다.
import { readFileSync, writeFileSync } from 'node:fs';
import { bibleText, } from './lib/bible.js';
import { PDF_PATH } from './lib/readings.js';
import { psalmLines } from './lib/psalms.js';

const args = process.argv.slice(2);
const write = args.includes('--write');
const nums = args.filter(a => /^\d+$/.test(a));
if (!nums.length) { console.error('사용법: node scripts/extract-psalm.js 65 [34 ...] [--write]'); process.exit(1); }

const text = bibleText(PDF_PATH);
const path = new URL('../data/worship-texts/psalms.json', import.meta.url);
const file = JSON.parse(readFileSync(path, 'utf8'));
for (const n of nums) {
    const lines = psalmLines(text, Number(n));
    console.log(`## 시편 ${n}편`);
    for (const l of lines) console.log(`${l.n ?? ' '} ${l.mark ?? ' '} ${l.text}`);
    file.psalms[n] = { lines };
}
if (write) {
    file.psalms = Object.fromEntries(Object.entries(file.psalms).sort((a, b) => a[0] - b[0]));
    writeFileSync(path, JSON.stringify(file, null, 2) + '\n');
    console.log('\n저장했습니다: data/worship-texts/psalms.json (띄어쓰기를 확인하세요)');
}
