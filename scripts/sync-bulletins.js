#!/usr/bin/env node
import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';
import { resolveReadings, isToggleWeek, nextSundayKey, koreanDate } from './lib/lectionary.js';

// ── 전례력 절기 레이블 ────────────────────────────────────────
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

// 주님세례주일 = 1월 6일(주현절) 다음 첫 번째 일요일
function baptismOfLord(year) {
    const jan6 = new Date(year, 0, 6);
    const dow = jan6.getDay();
    return addDays(jan6, dow === 0 ? 7 : 7 - dow);
}

// 가/나/다해: Advent 2022 시작 → 가해, 2023 → 나해, 2024 → 다해, 순환
function yearLabel(adventYear) {
    return ['가', '나', '다'][((adventYear - 2022) % 3 + 3) % 3];
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
    const ck        = addDays(advent, -7);   // 그리스도 왕 주일
    const baptism   = baptismOfLord(y);      // 연중 제1주일
    const wk = (a, b) => Math.round((+a - +b) / 604800000);

    // 전례력 연도 레이블 (해당 날짜가 속하는 대림절 시작 연도 기준)
    const advY = date >= advent ? y : y - 1;
    const yLbl = yearLabel(advY);

    // 성탄절 (12/25~)
    if (mo === 11 && d >= 25) return '성탄절';

    // 대림절
    if (date >= advent) return `대림 제${wk(date, advent) + 1}주일`;

    // 성령강림절 이후 연중 (삼위일체 주일 포함)
    if (date >= pentecost) {
        const w = wk(date, pentecost);
        if (w === 0) return '성령강림 주일';
        if (w === 1) return '삼위일체 주일';
        const weeksToGoCK = Math.round((+ck - +date) / 604800000);
        if (weeksToGoCK === 0) return '그리스도 왕 주일';
        return `${yLbl}해 연중 ${34 - weeksToGoCK}주일`;
    }

    // 부활절 ~ 성령강림
    if (date >= easter) {
        const w = wk(date, easter);
        if (w === 0) return '부활 주일';
        const ord = ['', '제2', '제3', '제4', '제5', '제6', '제7'];
        return `부활절 후 ${ord[w] || w + '번째'}주일`;
    }

    // 성주간
    if (date >= palmSun) return '성주간';

    // 사순절
    if (date >= ashWed) return `사순 제${wk(date, ashWed)}주일`;

    // 주현절 이후 연중 (사순절 전)
    if (date >= baptism) return `${yLbl}해 연중 ${wk(date, baptism) + 1}주일`;

    // 성탄절 후 (1/1~1/5, 12/26~12/31 등)
    return '성탄절 후 주일';
}

// ── PDF 생성 ──────────────────────────────────────────────────
async function generatePdf(imageFiles, outputPath) {
    return new Promise((resolve, reject) => {
        const doc    = new PDFDocument({ autoFirstPage: false, margin: 0 });
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);
        for (const imgPath of imageFiles) {
            doc.addPage({ size: 'A4' });
            doc.image(imgPath, 0, 0, {
                fit: [doc.page.width, doc.page.height],
                align: 'center',
                valign: 'center'
            });
        }
        doc.end();
        stream.on('finish', resolve);
        stream.on('error', reject);
    });
}

// ── 경로 설정 ─────────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, '..');
const BULLETINS = path.join(ROOT, 'bulletins');
const DATA_JS   = path.join(ROOT, 'data.js');
const OVERRIDES = path.join(ROOT, 'data', 'lectionary-overrides.json');
const STANDARD  = path.join(ROOT, 'data', 'lectionary-year-a.json');
const MAX_WEEKS = 13;

// 지정한 마커 사이 구간을 통째로 교체 (data.js 손질용)
function replaceRegion(text, startMarker, endMarker, replacement) {
    const s = text.indexOf(startMarker);
    if (s === -1) return null;
    const e = text.indexOf(endMarker, s + startMarker.length);
    if (e === -1) return null;
    return text.slice(0, s) + replacement + text.slice(e);
}

// resolveReadings 결과 → data.js currentReadings/nextReadings 객체 문자열
function readingsBlock(key, resolved, standardYear, withNote) {
    const items = [
        ['제1독서', resolved.first],
        ['시편',    resolved.psalm],
        ['서신서',  resolved.second],
        ['복음',    resolved.gospel]
    ].map(([role, ref]) => `                { role: "${role}", ref: "${ref}" }`).join(',\n');
    const note = withNote
        ? `\n            note: "주보 기준 · 대한성공회 공동 전례독서에 따릅니다.",`
        : '';
    return [
        `        ${key}: {`,
        `            week: "${resolved.week}",`,
        `            year: "${standardYear}년",`,
        `            date: "${koreanDate(resolved.date)}",${note}`,
        `            items: [`,
        items,
        `            ]`,
        `        },`
    ].join('\n');
}

const cutoff = new Date();
cutoff.setDate(cutoff.getDate() - MAX_WEEKS * 7);
cutoff.setHours(0, 0, 0, 0);

// ── 메인 (비동기) ─────────────────────────────────────────────
(async () => {
    // ── 1. JPG 스캔 및 날짜별 그룹화 ────────────────────────────
    const allJpgs = fs.readdirSync(BULLETINS).filter(f => /^\d{8}_\d+\.jpe?g$/i.test(f));

    const groups = new Map();
    for (const file of allJpgs) {
        const ds = file.slice(0, 8);
        if (!groups.has(ds)) groups.set(ds, []);
        groups.get(ds).push(file);
    }

    // ── 2. 오래된 날짜 삭제 (이미지 + PDF) ──────────────────────
    const valid = new Map();
    for (const [ds, files] of groups) {
        const fileDate = new Date(+ds.slice(0, 4), +ds.slice(4, 6) - 1, +ds.slice(6, 8));
        if (fileDate < cutoff) {
            files.forEach(f => {
                fs.unlinkSync(path.join(BULLETINS, f));
                console.log(`  삭제: ${f}`);
            });
            const pdfFile = path.join(BULLETINS, `${ds}.pdf`);
            if (fs.existsSync(pdfFile)) {
                fs.unlinkSync(pdfFile);
                console.log(`  삭제: ${ds}.pdf`);
            }
        } else {
            files.sort((a, b) => {
                const na = +a.replace(/^\d{8}_(\d+)\.jpe?g$/i, '$1');
                const nb = +b.replace(/^\d{8}_(\d+)\.jpe?g$/i, '$1');
                return na - nb;
            });
            valid.set(ds, files);
        }
    }

    // PDF만 있는 항목 (JPG 없음) 추가 — 직접 업로드된 PDF
    const allPdfs = fs.readdirSync(BULLETINS).filter(f => /^\d{8}\.pdf$/i.test(f));
    for (const pdfFile of allPdfs) {
        const ds = pdfFile.slice(0, 8);
        if (valid.has(ds)) continue;
        const fileDate = new Date(+ds.slice(0, 4), +ds.slice(4, 6) - 1, +ds.slice(6, 8));
        if (fileDate < cutoff) {
            fs.unlinkSync(path.join(BULLETINS, pdfFile));
            console.log(`  삭제: ${pdfFile}`);
        } else {
            valid.set(ds, []);
        }
    }

    // ── 3. PDF 생성 (이미지 있는 경우, 없는 경우만) ──────────────
    for (const [ds, files] of valid) {
        if (files.length === 0) continue;
        const pdfPath = path.join(BULLETINS, `${ds}.pdf`);
        if (!fs.existsSync(pdfPath)) {
            try {
                await generatePdf(files.map(f => path.join(BULLETINS, f)), pdfPath);
                console.log(`  PDF 생성: ${ds}.pdf`);
            } catch (err) {
                console.error(`  PDF 생성 실패 (${ds}):`, err.message);
            }
        }
    }

    // ── 4. items 목록 구성 ────────────────────────────────────────
    // 특별 주일명(맥추감사주일 등)은 주보 기준 기록에서 가져온다
    let overrides = {};
    if (fs.existsSync(OVERRIDES)) {
        try {
            overrides = JSON.parse(fs.readFileSync(OVERRIDES, 'utf8')).sundays || {};
        } catch (err) {
            console.error('  lectionary-overrides.json 파싱 실패:', err.message);
        }
    }

    const newItems = [...valid.keys()]
        .sort((a, b) => b.localeCompare(a))
        .map(ds => {
            const y  = +ds.slice(0, 4);
            const mo = +ds.slice(4, 6);
            const d  = +ds.slice(6, 8);
            const pdfPath = path.join(BULLETINS, `${ds}.pdf`);
            const dateKey = `${ds.slice(0,4)}-${ds.slice(4,6)}-${ds.slice(6,8)}`;
            const ov = overrides[dateKey];
            return {
                date:   dateKey,
                label:  `${y}년 ${mo}월 ${d}일`,
                season: (ov && ov.koreanName) || sundayLabel(ds),
                images: valid.get(ds).map(f => `bulletins/${f}`),
                pdf:    fs.existsSync(pdfPath) ? `bulletins/${ds}.pdf` : null
            };
        });

    // ── 5. data.js items 배열 교체 ───────────────────────────────
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
        .map(it => {
            const imagesStr = it.images.map(img => `"${img}"`).join(', ');
            const pdfLine   = it.pdf ? `,\n                pdf: "${it.pdf}"` : '';
            return [
                '            {',
                `                date: "${it.date}",`,
                `                label: "${it.label}",`,
                `                season: "${it.season}",`,
                `                images: [${imagesStr}]${pdfLine}`,
                '            }'
            ].join('\n');
        })
        .join(',\n');

    const newSection =
        section.slice(0, iOpen + ITEMS_OPEN.length) +
        newItemsStr +
        section.slice(iClose);

    let out = src.slice(0, bStart) + newSection + src.slice(bEnd);

    // ── 6. 최신 주보 주간 → worship.currentReadings/nextReadings 자동 파생 ──
    //    (표준 독서 위에 주보 기록 병합. 화면 fallback + 데이터 일관성 유지)
    let standard = null;
    if (fs.existsSync(STANDARD)) {
        try {
            standard = JSON.parse(fs.readFileSync(STANDARD, 'utf8'));
        } catch (err) {
            console.error('  lectionary-year-a.json 파싱 실패:', err.message);
        }
    }

    if (standard && newItems.length > 0) {
        const latest  = newItems[0].date;                    // 목록은 최신순 정렬
        const current = resolveReadings(standard.sundays, overrides, latest);
        const next    = resolveReadings(standard.sundays, overrides, nextSundayKey(latest));
        const yr      = standard.year || 'A';

        if (current && next) {
            const block = readingsBlock('currentReadings', current, yr, true)
                        + '\n' + readingsBlock('nextReadings', next, yr, false)
                        + '\n';
            const rewritten = replaceRegion(out,
                '        currentReadings: {', '        main: [', block);
            if (rewritten) out = rewritten;
            else console.error('  ⚠️  worship 독서 구간을 찾지 못해 자동 파생을 건너뜁니다.');
        }
    }

    fs.writeFileSync(DATA_JS, out, 'utf8');

    // ── 7. 주보 주간 전례독서 커버리지 검증 ──────────────────────
    //    이미지 주보가 있는데 트랙/시편 기록이 빠지면 화면·fallback이 어긋난다
    const gaps = [];      // 트랙 자체가 없음 → 기본 B로 표시
    const psalmGaps = []; // 트랙 A인데 시편 없음 → 표준(트랙 B 시편)과 어긋남
    for (const it of newItems) {
        if (!it.images.length) continue;                     // PDF 전용 항목은 제외
        if (!standard) break;
        const ov = overrides[it.date];
        if (!isToggleWeek(standard.sundays, it.date)) continue;
        if (ov && ov.readings) continue;                     // 특별 주일은 전체 지정됨
        if (!ov || !ov.track) { gaps.push(it); continue; }
        if (ov.track === 'A' && !ov.psalm) psalmGaps.push(it);
    }

    console.log(`\n주보 동기화 완료: ${newItems.length}건`);
    newItems.forEach(it => {
        const pdfMark = it.pdf ? ' [PDF]' : '';
        console.log(`  + ${it.label}  ${it.season}  (${it.images.length}장)${pdfMark}`);
    });
    if (newItems.length === 0) console.log('  (등록된 주보 없음)');

    if (gaps.length) {
        console.log('\n⚠️  전례독서 트랙 미기록 (기본 짝 독서 B로 표시됨):');
        gaps.forEach(it => console.log(
            `   - ${it.date}  → 주보 예배 순서면 확인 후 data/lectionary-overrides.json에 "track" 기록`));
    }
    if (psalmGaps.length) {
        console.log('\nℹ️  트랙 A 주간 시편 미기록 (표준 트랙 B 시편으로 표시됨):');
        psalmGaps.forEach(it => console.log(
            `   - ${it.date}  → 주보 성시가 표준과 다르면 "psalm" 추가`));
    }
})();
