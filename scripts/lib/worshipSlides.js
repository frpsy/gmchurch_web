// 주보 예배 순서(data/worship-order.json)를 예배 슬라이드 목록으로 푼다. 순수 함수만 둔다.
// 슬라이드에는 예배 주제 그림, 회중이 응답할 말, 노래 가사, 현재 위치 막대만 둔다.
// 독서 본문·설교·사제 기도문은 싣지 않는다(읽고 이끄는 사람에게 눈이 가도록).
import { parseRef } from './bible.js';

export const STAGES = ['모임', '말씀', '응답', '파송'];
export const SUBS = ['예물 준비', '성찬기도', '성체 나눔', '영성체'];
// 원본 PDF 주소는 저장소 이미지가 없을 때 참고할 수 있도록 유지한다.
export const HYMNBOOK_URL = 'https://dulkuka12.github.io/khymn/hymnbook.pdf';
export const NOTICE_POS = ['lt', 'rt', 'lb', 'rb', 'c'];
export const NOTICE_SIZE = ['m', 'l', 'xl'];
export const MAX_CHARS = 150;
export const MAX_LINES = 8;

// 복음서 이름 → 복음 소개 응답의 "{성인}"
const GOSPEL_SAINT = {
    '마태오의 복음서': '성 마태오가',
    '마르코의 복음서': '성 마르코가',
    '루가의 복음서': '성 루가가',
    '요한의 복음서': '성 요한이',
};

// 줄 단위 덩어리를 글자 수·줄 수 한도로 슬라이드 몫으로 묶는다. keep:true인 줄은 앞 줄과 같은 쪽에 둔다
export function paginate(lines, { maxChars = MAX_CHARS, maxLines = MAX_LINES } = {}) {
    const units = [];
    for (const line of lines) {
        if (line.keep && units.length) units.at(-1).push(line);
        else units.push([line]);
    }
    const pages = [];
    let page = [];
    let chars = 0;
    for (const unit of units) {
        const len = unit.reduce((n, l) => n + l.text.length, 0);
        if (page.length && (chars + len > maxChars || page.length + unit.length > maxLines)) {
            pages.push(page);
            page = [];
            chars = 0;
        }
        page.push(...unit);
        chars += len;
    }
    if (page.length) pages.push(page);
    return pages;
}

// bcp·responses 슬라이드 한 장의 줄을 {r,text}로 바꾼다. 문자열 줄은 모두 함께 하는 기도문이다.
function toLines(slide, vars = {}) {
    return slide.map(l => {
        const raw = typeof l === 'string' ? { t: l } : l;
        const text = Object.entries(vars).reduce((s, [k, v]) => s.replaceAll(`{${k}}`, v), raw.t);
        return raw.r ? { r: raw.r, text } : { text };
    });
}

function need(table, key, where) {
    const v = table[String(key)];
    if (!v) throw new Error(`${where}에 ${key}이(가) 없습니다`);
    return v;
}

// week: worship-order.json의 한 주. ctx: { hymns, hymnal, bcp, dialogs, defaults }
export function buildSlides(week, ctx) {
    const slides = [];
    const warnings = [];
    const theme = week.theme || {};
    // 맨 앞 안내(광고): 글자만, 그림 위 글자, 글자가 이미 든 그림 모두 같은 슬라이드로 만든다
    for (const a of [...(ctx.defaults.announcements || []), ...(week.announcements || [])]) {
        if (!a.text && !a.image) throw new Error('안내에는 text나 image가 있어야 합니다');
        if (a.image && !a.text && !a.alt) throw new Error(`글자 없는 안내 그림에는 alt(그림 속 글자)가 필요합니다: ${a.image}`);
        if (a.pos && !NOTICE_POS.includes(a.pos)) throw new Error(`안내 pos가 잘못됐습니다: ${a.pos}`);
        if (a.size && !NOTICE_SIZE.includes(a.size)) throw new Error(`안내 size가 잘못됐습니다: ${a.size}`);
        slides.push({ kind: 'notice', ...a });
    }

    let stage = null;
    for (const item of week.items) {
        if (item.section) continue;
        if (!STAGES.includes(item.stage)) throw new Error(`stage가 없거나 잘못됐습니다: ${item.label} (${item.stage})`);
        if (item.sub && !SUBS.includes(item.sub)) throw new Error(`sub가 잘못됐습니다: ${item.label} (${item.sub})`);
        // 위치 막대 칸이 바뀔 때마다 주제 그림 슬라이드를 넣는다 (교회 슬라이드 방식)
        if (item.stage !== stage) {
            stage = item.stage;
            slides.push({ kind: 'theme', stage, title: theme.title || week.title, subtitle: theme.subtitle || '', ...(theme.image ? { image: theme.image } : {}) });
        }
        const base = { stage, ...(item.sub ? { sub: item.sub } : {}) };
        const push = s => slides.push({ ...base, ...s });

        switch (item.type) {
        case 'hymn': {
            const h = { ...ctx.hymnal?.[String(item.number)], ...ctx.hymns[String(item.number)] };
            if (!h || !h.stanzas?.length) {
                warnings.push(`가사 미등록: 성가 ${item.number}장 (${item.label}) — 번호만 표시`);
                push({ kind: 'title', label: item.label, text: `성가 ${item.number}장`, ...(h?.title ? { caption: h.title } : {}) });
            } else {
                h.stanzas.forEach(st => push({ kind: 'lyrics', label: item.label, lines: st.map(text => ({ text })) }));
            }
            break;
        }
        case 'bcp': {
            const p = need(ctx.bcp, item.page, '기도서 데이터');
            p.slides.forEach(s => push({ kind: s.some(l => typeof l !== 'string') ? 'dialog' : 'lyrics', label: item.label, lines: toLines(s) }));
            break;
        }
        case 'dialog': {
            const d = need(ctx.dialogs, item.dialog, '응답 데이터');
            d.slides.forEach(s => push({ kind: 'dialog', label: item.label, lines: toLines(s) }));
            break;
        }
        case 'reading': {
            const { book, chapter, from, to } = parseRef(item.ref);
            const ref = `${book} ${chapter}:${from}${to !== from ? `-${to}` : ''}`;
            if (item.gospel) {
                const saint = GOSPEL_SAINT[book];
                if (!saint) throw new Error(`복음서가 아닙니다: ${book}`);
                const intro = need(ctx.dialogs, 'gospel-intro', '응답 데이터');
                intro.slides.forEach(s => push({ kind: 'dialog', label: item.label, lines: toLines(s, { 성인: saint }) }));
            }
            const end = need(ctx.dialogs, item.gospel ? 'gospel-end' : 'reading-end', '응답 데이터');
            push({ kind: 'reading', label: item.gospel ? item.kind : `${item.label}(${item.kind})`, ref, lines: toLines(end.slides[0]) });
            break;
        }
        case 'psalm': {
            const lines = item.lines.map(l => ({ text: l.text, ...(l.mark ? { mark: l.mark } : {}), ...(l.mark === '○' ? { keep: true } : {}) }));
            paginate(lines).forEach(page => push({ kind: 'psalm', label: `시편 ${item.ref}`, lines: page }));
            break;
        }
        case 'intercession': {
            if (item.refrain) push({ kind: 'dialog', label: item.label, lines: [{ r: 'p', text: '…' }, { r: 'a', text: item.refrain }] });
            else {
                warnings.push(`응답 문구 미입력: ${item.label} (회중이 매주 달리 하는 응답 — 주보에 없음) — 제목만 표시`);
                push({ kind: 'title', label: item.label, text: item.label });
            }
            const end = need(ctx.dialogs, 'intercession-end', '응답 데이터');
            end.slides.forEach(s => push({ kind: 'dialog', label: item.label, lines: toLines(s) }));
            break;
        }
        case 'sermon':
            push({ kind: 'title', label: item.label, text: `${item.label}: ${item.by}`, theme: true });
            break;
        case 'notice':
            push({ kind: 'title', label: item.label, text: item.label });
            break;
        default:
            throw new Error(`알 수 없는 종류: ${item.type} (${item.label})`);
        }
    }
    return { slides, warnings };
}

// 예식문(전체 순서와 악보)용 구조. 슬라이드와 같은 데이터를 쓰되 사제 기도문을 뺀 것은 같고,
// 소제목·번호·맡은 이·기도서 쪽·성가 번호·악보를 함께 담는다.
export function buildBook(week, ctx) {
    const sections = [];
    let no = 0;
    const flat = (slideList, vars) => slideList.flatMap((s, i) => [...(i ? [{ gap: true }] : []), ...toLines(s, vars)]);
    for (const item of week.items) {
        if (item.section) { sections.push({ title: item.section, items: [] }); continue; }
        const out = {
            no: ++no,
            label: item.label,
            ...(item.stand ? { stand: true } : {}),
            ...(item.by ? { by: item.by } : {}),
            lines: [],
        };
        switch (item.type) {
        case 'hymn': {
            const h = { ...ctx.hymnal?.[String(item.number)], ...ctx.hymns[String(item.number)] };
            out.ref = `성가 ${item.number}장`;
            if (h?.title) out.title = h.title;
            if (h?.stanzas) out.lines = h.stanzas.flatMap((st, i) => [...(i ? [{ gap: true }] : []), ...st.map(text => ({ text }))]);
            if (h.score) out.score = h.score;
            else if (h.images?.length) out.scores = h.images;
            const pdfPage = h.pdfPage ?? h.startPage;
            if (pdfPage) out.link = { url: `${HYMNBOOK_URL}#page=${pdfPage}`, text: `성가집 악보 보기 (PDF ${pdfPage}쪽)` };
            break;
        }
        case 'bcp':
            out.ref = `기도서 ${item.page}쪽`;
            out.lines = flat(need(ctx.bcp, item.page, '기도서 데이터').slides);
            break;
        case 'dialog':
            out.lines = flat(need(ctx.dialogs, item.dialog, '응답 데이터').slides);
            break;
        case 'reading': {
            const { book, chapter, from, to } = parseRef(item.ref);
            out.ref = `${book} ${chapter}:${from}${to !== from ? `-${to}` : ''}`;
            out.kind = item.kind;
            const lines = [];
            if (item.gospel) lines.push(...flat(need(ctx.dialogs, 'gospel-intro', '응답 데이터').slides, { 성인: GOSPEL_SAINT[book] }), { gap: true });
            lines.push(...toLines(need(ctx.dialogs, item.gospel ? 'gospel-end' : 'reading-end', '응답 데이터').slides[0]));
            out.lines = lines;
            break;
        }
        case 'psalm':
            out.ref = `시편 ${item.ref}`;
            out.lines = item.lines.map(l => ({ text: l.text, ...(l.n ? { n: l.n } : {}), ...(l.mark ? { mark: l.mark } : {}) }));
            if (item.score) out.score = item.score;
            break;
        case 'intercession':
            out.lines = [...(item.refrain ? [{ r: 'a', text: item.refrain }, { gap: true }] : []), ...flat(need(ctx.dialogs, 'intercession-end', '응답 데이터').slides)];
            break;
        case 'sermon':
        case 'notice':
            break;
        default:
            throw new Error(`알 수 없는 종류: ${item.type} (${item.label})`);
        }
        sections.at(-1).items.push(out);
    }
    return { title: week.title, celebrant: week.celebrant, preacher: week.preacher, form: week.form, sections };
}
