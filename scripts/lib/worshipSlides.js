// 주보 예배 순서(data/worship-order.json)를 슬라이드 목록으로 푼다. 순수 함수만 둔다.

export const MAX_CHARS = 150;
export const MAX_LINES = 7;

const MODES = ['full', 'title', 'blank'];

// 문장 끝(. ? !, 뒤따르는 닫는 따옴표 포함)에서 나눈다
export function splitSentences(text) {
    return text.split(/(?<=[.?!][”’]*)\s+/).map(s => s.trim()).filter(Boolean);
}

// 한 덩어리가 한도를 넘으면 공백 단위로 쪼갠다
function splitLong(text, max) {
    const out = [];
    let cur = '';
    for (const word of text.split(' ')) {
        if (cur && (cur + ' ' + word).length > max) { out.push(cur); cur = word; } else cur = cur ? `${cur} ${word}` : word;
    }
    if (cur) out.push(cur);
    return out;
}

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
    // 연 구분 빈 줄이 쪽 머리·꼬리에 남지 않게 한다
    return pages.map(p => {
        const out = [...p];
        while (out.length && out[0].gap) out.shift();
        while (out.length && out.at(-1).gap) out.pop();
        return out;
    }).filter(p => p.length);
}

function textLines(item, ctx) {
    switch (item.type) {
    case 'hymn': {
        const h = ctx.hymns[String(item.number)];
        if (!h) throw new Error(`성가집 데이터에 ${item.number}장이 없습니다 (data/worship-texts/hymns.json)`);
        const lines = [];
        h.stanzas.forEach((st, i) => {
            if (i) lines.push({ text: '', gap: true });
            st.forEach(t => lines.push({ text: t }));
        });
        return { lines, dummy: !!h.dummy, caption: h.title };
    }
    case 'bcp': {
        const p = ctx.bcp[String(item.page)];
        if (!p) throw new Error(`기도서 데이터에 ${item.page}쪽이 없습니다 (data/worship-texts/bcp.json)`);
        return { lines: p.paragraphs.map(t => ({ text: t })), dummy: !!p.dummy, caption: p.title };
    }
    case 'reading': {
        const r = ctx.readings[item.ref];
        if (!r) throw new Error(`성경 본문 데이터에 ${item.ref}가 없습니다 (node scripts/extract-bible.js "${item.ref}" --write)`);
        const lines = [];
        for (const v of r.verses) for (const s of splitSentences(v.text)) lines.push(...splitLong(s, MAX_CHARS).map(text => ({ text })));
        return { lines, dummy: false };
    }
    case 'psalm':
        return { lines: item.lines.map(l => ({ text: l.text, ...(l.mark ? { mark: l.mark } : {}), ...(l.mark === '○' ? { keep: true } : {}) })), dummy: false };
    case 'prayer':
        return { lines: (item.text ? splitSentences(item.text) : []).map(text => ({ text })), dummy: false };
    default:
        return { lines: [], dummy: false };
    }
}

function subtitle(item) {
    switch (item.type) {
    case 'hymn': return `성가 ${item.number}장`;
    case 'bcp': return `기도서 ${item.page}쪽`;
    case 'reading': return item.ref;
    case 'psalm': return item.ref;
    default: return '';
    }
}

export function modeOf(item, defaults) {
    const mode = item.mode || defaults.modes?.[item.type] || 'title';
    if (!MODES.includes(mode)) throw new Error(`알 수 없는 mode: ${mode} (${item.label})`);
    return mode;
}

// week: worship-order.json의 한 주. ctx: { hymns, bcp, readings, defaults }
export function buildSlides(week, ctx) {
    const slides = [];
    let section = '';
    slides.push({
        kind: 'cover',
        title: week.title,
        lines: [`집전 ${week.celebrant}`, `설교 ${week.preacher}`, week.form].filter(Boolean),
    });
    for (const item of week.items) {
        if (item.section) {
            section = item.section;
            slides.push({ kind: 'section', section, title: section });
            continue;
        }
        const mode = modeOf(item, ctx.defaults);
        const base = { section, label: item.label, sub: subtitle(item), by: item.by, stand: !!item.stand };
        if (mode === 'blank') { slides.push({ kind: 'blank', section, label: item.label }); continue; }
        const { lines, dummy, caption } = mode === 'full' ? textLines(item, ctx) : { lines: [], dummy: false };
        if (mode === 'title' || !lines.length) {
            slides.push({ kind: 'title', ...base, ...(dummy ? { dummy } : {}) });
            continue;
        }
        const pages = paginate(lines);
        pages.forEach((page, i) => {
            slides.push({
                kind: 'text',
                ...base,
                ...(caption ? { caption } : {}),
                ...(pages.length > 1 ? { part: `${i + 1}/${pages.length}` } : {}),
                ...(dummy ? { dummy } : {}),
                lines: page,
            });
        });
    }
    return slides;
}

export function slideTexts(slide) {
    return [slide.title, slide.label, slide.sub, ...(slide.lines || []).map(l => (typeof l === 'string' ? l : l.text))].filter(Boolean);
}
