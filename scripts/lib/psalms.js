// 공동번역 PDF 부록 "감사성찬례용 시편"에서 한 편의 성시 줄(1~6절 + 영광송)을 만든다.
// 줄 형식은 data/worship-order.json의 psalm lines와 같다: { n, text } (앞 구절) · { mark: '○', text } (◯ 뒤 구절).
const DOXOLOGY = [
    { mark: '◉', text: '영광이 성부와' },
    { mark: '○', text: '성자와 성령께 처음과 같이 지금도' },
    { mark: '○', text: '그리고 영원히 아멘' },
];
const VERSES = 6;

// 부록 본문 시작: 목차("… 3144") 다음의 단독 제목 줄 "감사성찬례용 시편"
function appendix(text) {
    const lines = text.split('\n');
    const at = lines.findIndex(l => l.trim() === '감사성찬례용 시편');
    if (at < 0) throw new Error('감사성찬례용 시편 부록을 찾지 못했습니다');
    return lines.slice(at);
}

export function psalmLines(text, number, verses = VERSES) {
    const lines = appendix(text);
    const start = lines.findIndex(l => new RegExp(`^\\s*${number}\\s*편\\s*$`).test(l));
    if (start < 0) throw new Error(`부록에서 ${number}편을 찾지 못했습니다`);
    const rows = [];
    for (let i = start + 1; i < lines.length; i++) {
        const raw = lines[i];
        const t = raw.trim();
        if (/^\d+\s*편$/.test(t)) break;
        if (t === '' || t === '부록' || /^\d{4}$/.test(t)) continue;
        const m = /^(\d+|¶)\s+(.*)$/.exec(t);
        if (m) rows.push({ n: m[1] === '¶' ? null : Number(m[1]), text: m[2] });
        else if (rows.length) rows.at(-1).text += `\u0001${t}`; // 줄 끝 이어붙임(띄어쓰기는 사람이 확인)
    }
    const out = [];
    let count = 0;
    for (const r of rows) {
        if (r.n !== null) { count += 1; if (count > verses) break; }
        const joined = r.text.replace(/\u0001/g, ' ').replace(/\s:\s/g, ' ');
        const [a, b] = joined.split('◯').map(s => s.trim());
        if (!b) throw new Error(`${number}편: ◯ 구분이 없는 구절 "${joined}"`);
        out.push({ ...(r.n !== null ? { n: r.n } : {}), text: a });
        out.push({ mark: '○', text: b });
    }
    if (count < verses) throw new Error(`${number}편: ${verses}절이 안 됩니다`);
    return [...out, ...DOXOLOGY];
}

// 글자만 비교하기 위한 정규화(띄어쓰기·낭송 부호 제거)
export const letters = s => String(s).replace(/[\s:¶]/g, '');
