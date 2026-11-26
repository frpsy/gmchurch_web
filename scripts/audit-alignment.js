#!/usr/bin/env node
// 정렬 점검(수동): 각 페이지를 PC·휴대폰 폭으로 렌더링해 「가운데 정렬 여러 줄」 글을 센다.
// 규칙은 docs/dev-guide.md 「정렬」 절. 첫 화면(히어로)과 페이지 끝 「다음 걸음」·푸터는 세지 않는다.
//
// 사용: python3 -m http.server 8000 을 띄운 뒤
//   PLAYWRIGHT_MODULE=/경로/node_modules/playwright node scripts/audit-alignment.js [--base http://localhost:8000] [--list]
// 저장소에는 Playwright가 없다. 설치된 곳을 PLAYWRIGHT_MODULE로 알려 준다.
// 「세 줄+」이 0이어야 한다(가운데 글은 휴대폰에서 두 줄까지).
import { createRequire } from 'node:module';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
let pw;
try { pw = require(process.env.PLAYWRIGHT_MODULE || 'playwright'); }
catch { console.error('Playwright를 찾지 못했습니다. PLAYWRIGHT_MODULE에 설치 경로를 주세요.'); process.exit(2); }

const args = process.argv.slice(2);
const base = (args.includes('--base') ? args[args.indexOf('--base') + 1] : 'http://localhost:8000').replace(/\/$/, '');
const list = args.includes('--list');
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['google65f0b8b3b88f2479.html']);
const pages = readdirSync(root).filter((f) => f.endsWith('.html') && !SKIP.has(f)).sort();
const widths = [['PC', 1280], ['휴대폰', 390]];

function measure() {
  const EXCLUDE = '.hero, [class*="-hero"], .page-hero, [class*="next-step"], .cta, footer, nav, header, .site-header, .sermon-body, .sermon-text';
  const out = [];
  document.querySelectorAll('main h1, main h2, main h3, main h4, main p, main li, main dd, main blockquote, main figcaption').forEach((el) => {
    if (el.closest(EXCLUDE)) return;
    if (el.querySelector('p, li, h2, h3')) return;
    const cs = getComputedStyle(el);
    if (cs.textAlign !== 'center') return;
    const r = el.getBoundingClientRect();
    if (!r.height || cs.display === 'none' || cs.visibility === 'hidden') return;
    const text = el.textContent.trim().replace(/\s+/g, ' ');
    if (!text) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    const tops = new Set([...range.getClientRects()].filter((b) => b.width > 1).map((b) => Math.round(b.top)));
    const lines = tops.size;
    if (lines >= 2) out.push({ lines, cls: el.className || el.tagName.toLowerCase(), text: text.slice(0, 40) });
  });
  return out;
}

const browser = await pw.chromium.launch();
let bad = 0;
console.log('| 페이지 | PC 두 줄 / 세 줄+ | 휴대폰 두 줄 / 세 줄+ |\n|---|---|---|');
for (const file of pages) {
  const cells = [];
  const details = [];
  for (const [label, width] of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(`${base}/${file}`, { waitUntil: 'networkidle' }).catch(() => {});
    await page.waitForTimeout(300);
    const found = await page.evaluate(measure);
    await page.close();
    const three = found.filter((f) => f.lines >= 3);
    bad += three.length;
    cells.push(`${found.length - three.length} / ${three.length}`);
    for (const f of found) details.push(`  - ${label} ${f.lines}줄 .${String(f.cls).split(' ')[0]} 「${f.text}」`);
  }
  console.log(`| ${file} | ${cells.join(' | ')} |`);
  if (list && details.length) console.log(details.join('\n'));
}
await browser.close();
console.log(`\n가운데 세 줄 이상: ${bad}건`);
process.exit(bad ? 1 : 0);
