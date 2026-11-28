#!/usr/bin/env node
/*
 * 사이트 점검 도구 (성능·버그·리팩토링 작업의 안전망, docs/perf-refactor-plan.md 0단계)
 *
 *   node scripts/site-check.mjs smoke              모든 페이지: 콘솔 오류·404·요청 실패·가로 넘침(390·1280)·페이지 전환 리스너 누적
 *   검사 범위는 루트 HTML과 jubo/index.html이다. presentation/(예배 화면)은 프로젝터용이라 넣지 않는다.
 *   node scripts/site-check.mjs shots <폴더>        모든 페이지 스크린샷(390·1280 × 라이트·다크, 전체 길이)
 *   node scripts/site-check.mjs compare <기준> <비교> [차이폴더]   픽셀 비교, 다르면 종료 코드 1
 *   node scripts/site-check.mjs perf [md 파일]      휴대폰 조건 실측(LCP·CLS·TBT·전송량·미사용 CSS/JS)
 *                                                   TBT는 근사값: 불러온 뒤 1.5초까지 모든 긴 작업의 50ms 초과분 합
 *   node scripts/site-check.mjs why                전송량 종류별 분해·큰 파일·흔들림 원인·LCP 요소·첫 화면 밖 즉시 로딩 이미지
 *
 * 옵션: --pages index.html,worship.html  (일부 페이지만)
 * 환경변수 SITE_ROOT=<폴더>: 그 폴더의 사이트를 대상으로 한다(변경 전 main을 같은 도구로 찍을 때)
 * Playwright는 package.json에 두지 않는다. CI는 `npm i --no-save playwright`로 받고,
 * 로컬은 설치된 playwright를 PW_MODULE=<경로>로 가리킬 수 있다.
 * 서버는 이 스크립트가 직접 띄운다(빈 포트). 외부 요청은 글꼴 CDN만 허용한다.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

// SITE_ROOT로 다른 폴더(예: main 체크아웃)를 같은 방식으로 찍어 비교할 수 있다
const ROOT = path.resolve(process.env.SITE_ROOT || path.join(path.dirname(fileURLToPath(import.meta.url)), '..'));
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW_MODULE || 'playwright');

const FIXED_NOW = new Date('2026-11-28T10:00:00+09:00');   // 교회력·주보 표시를 고정
const ALLOWED_EXTERNAL = /^https:\/\/cdn\.jsdelivr\.net\//;
const VIEWPORTS = { m: { width: 390, height: 844 }, d: { width: 1280, height: 900 } };

const args = process.argv.slice(2);
const opt = name => { const i = args.indexOf(name); return i >= 0 ? args.splice(i, 2)[1] : null; };
const onlyPages = opt('--pages');
const [cmd, ...rest] = args;

function listPages() {
    const all = fs.readdirSync(ROOT)
        .filter(f => f.endsWith('.html') && !/^google[0-9a-f]+\.html$/.test(f))
        .sort();
    all.push('jubo/index.html');
    return onlyPages ? all.filter(p => onlyPages.split(',').includes(p)) : all;
}

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
    '.woff2': 'font/woff2', '.pdf': 'application/pdf', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8' };

function startServer() {
    const server = http.createServer((req, res) => {
        let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
        if (p.endsWith('/')) p += 'index.html';
        const file = path.resolve(ROOT, '.' + p);
        const rel = path.relative(ROOT, file);
        if (rel.startsWith('..') || path.isAbsolute(rel)) { res.writeHead(403).end(); return; }
        fs.readFile(file, (err, buf) => {
            if (err) { res.writeHead(404).end('not found'); return; }
            const type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
            // GitHub Pages처럼 글자 파일은 gzip으로 보낸다(전송량을 배포 조건에 맞춘다)
            if (/text|javascript|json|svg|xml/.test(type) && /gzip/.test(req.headers['accept-encoding'] || '')) {
                res.writeHead(200, { 'content-type': type, 'content-encoding': 'gzip', vary: 'Accept-Encoding' });
                res.end(zlib.gzipSync(buf, { level: 6 }));
                return;
            }
            res.writeHead(200, { 'content-type': type });
            res.end(buf);
        });
    });
    return new Promise(r => server.listen(0, '127.0.0.1', () => r(server)));
}

async function blockExternal(ctx, base) {
    await ctx.route('**/*', route => {
        const u = route.request().url();
        if (u.startsWith(base) || ALLOWED_EXTERNAL.test(u) || u.startsWith('data:')) return route.continue();
        return route.abort('blockedbyclient');
    });
}

/* 지연 이미지·등장 효과까지 그려지도록 끝까지 내렸다가 맨 위로 */
async function settle(page) {
    await page.evaluate(async () => {
        await document.fonts?.ready;
        const step = innerHeight * 0.8;
        for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
            window.scrollTo(0, y);
            await new Promise(r => setTimeout(r, 60));
        }
        window.scrollTo(0, 0);
        await Promise.all([...document.images].map(img => img.complete ? null :
            new Promise(r => { img.onload = img.onerror = r; setTimeout(r, 3000); })));
        // 위치 표시 탭처럼 스크롤 뒤 늦게 바뀌는 화면을 기다린다: DOM 변화가 300ms 없을 때까지(최대 3초)
        await new Promise(done => {
            let quiet;
            const mo = new MutationObserver(() => { clearTimeout(quiet); quiet = setTimeout(finish, 300); });
            const finish = () => { mo.disconnect(); clearTimeout(cap); done(); };
            const cap = setTimeout(finish, 3000);
            mo.observe(document.documentElement, { subtree: true, attributes: true, childList: true, characterData: true });
            quiet = setTimeout(finish, 300);
        });
    });
}

const FREEZE_CSS = `*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}
.reveal,[data-reveal]{opacity:1!important;transform:none!important}`;

/* ---------- smoke ---------- */
async function smoke(browser, base) {
    const problems = [];
    for (const p of listPages()) {
        const ctx = await browser.newContext({ viewport: VIEWPORTS.m });
        await blockExternal(ctx, base);
        const page = await ctx.newPage();
        const issues = [];
        page.on('console', m => { if (m.type() === 'error' && !/ERR_BLOCKED_BY_CLIENT|net::ERR_FAILED/.test(m.text())) issues.push('console: ' + m.text().slice(0, 200)); });
        page.on('pageerror', e => issues.push('pageerror: ' + e.message.slice(0, 200)));
        page.on('response', r => { if (r.url().startsWith(base) && r.status() >= 400) issues.push(`${r.status()}: ${r.url().slice(base.length)}`); });
        page.on('requestfailed', r => { if (r.url().startsWith(base)) issues.push(`요청 실패(${r.failure()?.errorText}): ${r.url().slice(base.length)}`); });
        await page.goto(base + p, { waitUntil: 'networkidle' });
        await settle(page);
        const overflowAt = async () => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        let overflow = await overflowAt();
        if (overflow > 1) issues.push(`가로 넘침(390px) ${overflow}px`);
        await page.setViewportSize(VIEWPORTS.d);
        await page.waitForTimeout(200);
        overflow = await overflowAt();
        if (overflow > 1) issues.push(`가로 넘침(1280px) ${overflow}px`);
        if (issues.length) problems.push({ page: p, issues: [...new Set(issues)] });
        console.log(`${issues.length ? '✗' : '✓'} ${p}${issues.length ? '\n    ' + [...new Set(issues)].join('\n    ') : ''}`);
        await ctx.close();
    }
    const growth = await pageSwitchListeners(browser, base);
    console.log(`페이지 전환 리스너(document+window): ${growth.counts.join(' → ')}`);
    if (growth.issues.length) problems.push({ page: '페이지 전환', issues: growth.issues });
    for (const i of growth.issues) console.log('✗ ' + i);
    return problems;
}

/* 홈에서 출발해 전환 가능한 페이지를 두 바퀴 돌며 document·window 리스너 수를 센다 */
async function pageSwitchListeners(browser, base) {
    const ROUTE = ['worship.html', 'newcomer.html', 'clergy.html', 'community.html', 'sundays.html',
        'media.html', 'visit.html', 'news.html', 'bulletin.html', 'index.html'];
    const ctx = await browser.newContext({ viewport: VIEWPORTS.d });
    await blockExternal(ctx, base);
    const page = await ctx.newPage();
    const issues = [];
    page.on('pageerror', e => issues.push('전환 중 pageerror: ' + e.message.slice(0, 200)));
    await page.goto(base + 'index.html', { waitUntil: 'networkidle' });
    const cdp = await ctx.newCDPSession(page);
    const count = async () => {
        let n = 0;
        for (const expr of ['document', 'window']) {
            const { result } = await cdp.send('Runtime.evaluate', { expression: expr });
            const { listeners } = await cdp.send('DOMDebugger.getEventListeners', { objectId: result.objectId });
            n += listeners.length;
        }
        return n;
    };
    const counts = [await count()];
    for (let round = 0; round < 2; round++) {
        for (const file of ROUTE) {
            // 지금 <main>에 표시를 달아 두고, 새 <main>으로 바뀔 때까지 기다린다(URL만 바뀐 상태로 판정하지 않음)
            await page.evaluate(f => {
                document.querySelector('main')?.setAttribute('data-site-check-old', '');
                const a = document.createElement('a');
                a.href = f; document.body.appendChild(a); a.click(); a.remove();
            }, file);
            await page.waitForFunction(f => location.pathname.endsWith('/' + f)
                && document.querySelector('main') && !document.querySelector('main[data-site-check-old]'), file, { timeout: 8000 })
                .catch(() => issues.push(`전환 실패: ${file}`));
            await page.waitForTimeout(150);
        }
        counts.push(await count());
    }
    if (counts[2] > counts[1]) issues.push(`페이지 전환을 한 바퀴 더 돌 때마다 리스너가 늘어남: ${counts.join(' → ')}`);
    await ctx.close();
    return { counts, issues };
}

/* ---------- shots ---------- */
async function shots(browser, base, outDir) {
    fs.mkdirSync(outDir, { recursive: true });
    for (const p of listPages()) {
        for (const [vk, vp] of Object.entries(VIEWPORTS)) {
            for (const scheme of ['light', 'dark']) {
                const ctx = await browser.newContext({ viewport: vp, colorScheme: scheme, reducedMotion: 'reduce', deviceScaleFactor: 1 });
                await blockExternal(ctx, base);
                const page = await ctx.newPage();
                await page.clock.setFixedTime(FIXED_NOW);
                await page.goto(base + p, { waitUntil: 'networkidle' });
                await page.addStyleTag({ content: FREEZE_CSS });
                await settle(page);
                const name = `${p.replace(/\//g, '__')}.${vk}.${scheme}.png`;
                await page.screenshot({ path: path.join(outDir, name), fullPage: true });
                await ctx.close();
            }
        }
        console.log('찍음 ' + p);
    }
}

/* ---------- compare (브라우저 캔버스로 픽셀 비교) ---------- */
async function compare(browser, dirA, dirB, diffDir) {
    const pngs = d => fs.readdirSync(d).filter(f => f.endsWith('.png'));
    const files = [...new Set([...pngs(dirA), ...pngs(dirB)])].sort();
    const page = await browser.newPage();
    let bad = 0;
    for (const f of files) {
        const fa = path.join(dirA, f), fb = path.join(dirB, f);
        if (!fs.existsSync(fa)) { console.log(`✗ ${f}: 기준에 없음(새로 생긴 화면)`); bad++; continue; }
        if (!fs.existsSync(fb)) { console.log(`✗ ${f}: 비교본 없음`); bad++; continue; }
        const a = 'data:image/png;base64,' + fs.readFileSync(fa).toString('base64');
        const b = 'data:image/png;base64,' + fs.readFileSync(fb).toString('base64');
        const r = await page.evaluate(async ([a, b]) => {
            const load = src => new Promise((res, rej) => {
                const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('PNG를 읽지 못함'));
                setTimeout(() => rej(new Error('PNG 읽기 시간 초과')), 20000); i.src = src;
            });
            let ia, ib;
            try { [ia, ib] = await Promise.all([load(a), load(b)]); } catch (e) { return { diff: -1, size: e.message }; }
            if (ia.width !== ib.width || ia.height !== ib.height)
                return { size: `${ia.width}x${ia.height} → ${ib.width}x${ib.height}`, diff: -1 };
            const c = document.createElement('canvas'); c.width = ia.width; c.height = ia.height;
            const x = c.getContext('2d', { willReadFrequently: true });
            x.drawImage(ia, 0, 0); const da = x.getImageData(0, 0, c.width, c.height);
            x.drawImage(ib, 0, 0); const db = x.getImageData(0, 0, c.width, c.height);
            let diff = 0; const out = x.createImageData(c.width, c.height);
            for (let k = 0; k < da.data.length; k += 4) {
                const d = Math.abs(da.data[k] - db.data[k]) + Math.abs(da.data[k + 1] - db.data[k + 1]) + Math.abs(da.data[k + 2] - db.data[k + 2]);
                if (d > 0) { diff++; out.data[k] = 255; out.data[k + 3] = 255; }
                else { out.data[k] = out.data[k + 1] = out.data[k + 2] = da.data[k] / 3 + 170; out.data[k + 3] = 255; }
            }
            let png = null;
            if (diff) { x.putImageData(out, 0, 0); png = c.toDataURL('image/png'); }
            return { diff, png };
        }, [a, b]);
        if (r.diff === 0) continue;
        bad++;
        console.log(`✗ ${f}: ${r.diff < 0 ? '크기 다름 ' + r.size : r.diff + '픽셀 다름'}`);
        if (diffDir && r.png) {
            fs.mkdirSync(diffDir, { recursive: true });
            fs.writeFileSync(path.join(diffDir, f), Buffer.from(r.png.split(',')[1], 'base64'));
        }
    }
    console.log(bad ? `다른 이미지 ${bad}/${files.length}` : `모두 같음 (${files.length}장)`);
    return bad;
}

/* ---------- perf ---------- */
async function perfOne(browser, base, p) {
    const ctx = await browser.newContext({ viewport: VIEWPORTS.m, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await blockExternal(ctx, base);
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    // 휴대폰 느린 4G 근사(Lighthouse 기본값): 150ms·1.6Mbps 내려받기, CPU 4배 느리게
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    let bytes = 0, reqs = 0;
    cdp.on('Network.loadingFinished', e => { bytes += e.encodedDataLength; reqs++; });
    await page.addInitScript(() => {
        window.__m = { lcp: 0, cls: 0, tbt: 0 };
        new PerformanceObserver(l => { for (const e of l.getEntries()) window.__m.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__m.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
        new PerformanceObserver(l => { for (const e of l.getEntries()) window.__m.tbt += Math.max(0, e.duration - 50); }).observe({ type: 'longtask', buffered: true });
    });
    await page.coverage.startCSSCoverage();
    await page.coverage.startJSCoverage({ resetOnNavigation: false });
    await page.goto(base + p, { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    const m = await page.evaluate(() => {
        const nav = performance.getEntriesByType('navigation')[0];
        const fcp = performance.getEntriesByName('first-contentful-paint')[0];
        return { fcp: Math.round(fcp?.startTime || 0), lcp: Math.round(window.__m.lcp), cls: +window.__m.cls.toFixed(3),
            tbt: Math.round(window.__m.tbt), dcl: Math.round(nav.domContentLoadedEventEnd), load: Math.round(nav.loadEventEnd),
            dom: document.getElementsByTagName('*').length,
            imgNoSize: [...document.images].filter(i => !i.getAttribute('width') && !i.getAttribute('height') && !i.closest('[hidden]')).length };
    });
    const unused = list => {
        let total = 0, used = 0;
        for (const e of list) {
            if (!e.url.startsWith(base)) continue;
            total += e.text.length;
            for (const r of e.ranges) used += r.end - r.start;
        }
        return total ? Math.round(100 * (1 - used / total)) : 0;
    };
    const css = await page.coverage.stopCSSCoverage();
    const js = await page.coverage.stopJSCoverage();
    let jsTotal = 0, jsUsed = 0;
    for (const e of js) {
        if (!e.url.startsWith(base)) continue;
        jsTotal += e.source.length;
        // 블록 단위: count>0 인 범위에서 count==0 하위 범위를 뺀다(근사)
        const marks = new Uint8Array(e.source.length);
        for (const f of e.functions) for (const r of f.ranges) marks.fill(r.count > 0 ? 1 : 0, r.startOffset, r.endOffset);
        for (const v of marks) jsUsed += v;
    }
    await ctx.close();
    return { ...m, kb: Math.round(bytes / 1024), reqs, cssUnused: unused(css), jsUnused: jsTotal ? Math.round(100 * (1 - jsUsed / jsTotal)) : 0 };
}

async function perf(browser, base, mdFile) {
    const rows = [];
    const median = a => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
    for (const p of listPages()) {
        const runs = [];
        for (let i = 0; i < 3; i++) runs.push(await perfOne(browser, base, p));
        const pick = k => median(runs.map(r => r[k]));
        const row = { page: p, ...runs[0], fcp: pick('fcp'), lcp: pick('lcp'), cls: pick('cls'), tbt: pick('tbt'), dcl: pick('dcl') };
        rows.push(row);
        console.log(JSON.stringify(row));
    }
    if (mdFile) {
        const head = '| 페이지 | FCP | LCP | CLS | TBT(근사) | DCL | 전송 KB | 요청 | DOM 수 | 미사용 CSS | 미사용 JS | 크기 없는 이미지 |\n|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|\n';
        const body = rows.map(r => `| ${r.page} | ${r.fcp} | ${r.lcp} | ${r.cls} | ${r.tbt} | ${r.dcl} | ${r.kb} | ${r.reqs} | ${r.dom} | ${r.cssUnused}% | ${r.jsUnused}% | ${r.imgNoSize} |`).join('\n');
        fs.writeFileSync(mdFile, head + body + '\n');
        console.log('표 저장: ' + mdFile);
    }
}

/* ---------- why: 전송량을 종류별로 나누고, 레이아웃 흔들림을 일으킨 요소를 적는다 ---------- */
async function why(browser, base) {
    for (const p of listPages()) {
        const ctx = await browser.newContext({ viewport: VIEWPORTS.m, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
        await blockExternal(ctx, base);
        const page = await ctx.newPage();
        const cdp = await ctx.newCDPSession(page);
        await cdp.send('Network.enable');
        await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 });
        const meta = {}, kinds = {}, big = [];
        cdp.on('Network.responseReceived', e => { meta[e.requestId] = [e.type, e.response.url]; });
        cdp.on('Network.loadingFinished', e => {
            const [t, u] = meta[e.requestId] || ['?', '?'];
            const k = t + (u.startsWith(base) ? '' : '(외부)');
            kinds[k] = (kinds[k] || 0) + e.encodedDataLength;
            big.push([e.encodedDataLength, u.replace(base, '')]);
        });
        await page.addInitScript(() => {
            window.__s = [];
            const name = n => !n ? '?' : n.nodeName.toLowerCase() + (n.id ? '#' + n.id : '') +
                (typeof n.className === 'string' && n.className ? '.' + n.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
            new PerformanceObserver(l => {
                for (const e of l.getEntries()) if (!e.hadRecentInput && e.value >= 0.005)
                    window.__s.push({ v: +e.value.toFixed(3), t: Math.round(e.startTime), src: e.sources.map(s => name(s.node)).slice(0, 3) });
            }).observe({ type: 'layout-shift', buffered: true });
            window.__lcp = null;
            new PerformanceObserver(l => {
                for (const e of l.getEntries()) window.__lcp = { t: Math.round(e.startTime), el: name(e.element), url: (e.url || '').replace(location.origin, '').slice(0, 80), size: e.size };
            }).observe({ type: 'largest-contentful-paint', buffered: true });
        });
        await page.goto(base + p, { waitUntil: 'load', timeout: 60000 });
        await page.waitForTimeout(1500);
        const shifts = await page.evaluate(() => window.__s);
        const lcp = await page.evaluate(() => window.__lcp);
        // 첫 화면(844px) 밖인데 처음부터 받은 이미지
        const eager = await page.evaluate(() => [...document.images]
            .filter(i => i.loading !== 'lazy' && i.complete && i.naturalWidth && i.getBoundingClientRect().top > innerHeight)
            .map(i => (i.currentSrc || i.src).replace(location.origin, '').slice(0, 60)));
        console.log(`## ${p}  ` + Object.entries(kinds).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}=${Math.round(v / 1024)}K`).join(' '));
        console.log('   큰 파일: ' + big.sort((a, b) => b[0] - a[0]).slice(0, 5).map(([n, u]) => `${Math.round(n / 1024)}K ${u.slice(0, 70)}`).join(' | '));
        for (const s of shifts) console.log(`   흔들림 ${s.v} @${s.t}ms ← ${s.src.join(', ')}`);
        if (lcp) console.log(`   LCP ${lcp.t}ms ← ${lcp.el} ${lcp.url} (넓이 ${lcp.size})`);
        if (eager.length) console.log(`   첫 화면 밖인데 바로 받은 이미지 ${eager.length}개: ${eager.slice(0, 4).join(' | ')}`);
        await ctx.close();
    }
}

/* ---------- main ---------- */
const server = await startServer();
const base = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch(process.env.PW_EXECUTABLE ? { executablePath: process.env.PW_EXECUTABLE } : {});
let code = 0;
try {
    if (cmd === 'smoke') {
        const problems = await smoke(browser, base);
        console.log(problems.length ? `문제 ${problems.length}건` : '문제 없음');
        code = problems.length ? 1 : 0;
    } else if (cmd === 'shots') {
        if (!rest[0]) throw new Error('저장 폴더를 주세요');
        await shots(browser, base, path.resolve(rest[0]));
    } else if (cmd === 'compare') {
        if (!rest[1]) throw new Error('기준 폴더와 비교 폴더를 주세요');
        code = (await compare(browser, path.resolve(rest[0]), path.resolve(rest[1]), rest[2] && path.resolve(rest[2]))) ? 1 : 0;
    } else if (cmd === 'why') {
        await why(browser, base);
    } else if (cmd === 'perf') {
        await perf(browser, base, rest[0] && path.resolve(rest[0]));
    } else {
        console.log('사용법: node scripts/site-check.mjs smoke | shots <폴더> | compare <기준> <비교> [차이폴더] | perf [md]');
        code = 2;
    }
} finally {
    await browser.close();
    server.close();
}
process.exit(code);
