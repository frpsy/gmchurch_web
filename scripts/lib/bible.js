// 공동번역 성서 PDF(`pdftotext -layout` 결과)에서 구절을 뽑는다.
// 줄 끝이 단어 중간인지 경계인지는 PDF 텍스트만으로 알 수 없으므로 띄어쓰기는 추정이다.
// 글자(공백 제외)는 PDF와 같고, 띄어쓰기는 readings.json에 확정할 때 사람이 검수한다.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// 주보·전례독서 표기 → PDF 책 제목. 필요한 책만 확인하며 늘린다(없으면 오류).
const BOOKS = {
    '창세': '창세기', '출애굽': '출애굽기', '레위': '레위기', '민수': '민수기',
    '신명': '신명기', '신명기': '신명기', '여호수아': '여호수아', '판관기': '판관기',
    '룻기': '룻기', '이사야': '이사야', '예레미야': '예레미야', '에제키엘': '에제키엘',
    '호세아': '호세아', '아모스': '아모스', '요나': '요나', '미가': '미가',
    '스바니야': '스바니야', '즈가리야': '즈가리야', '욥기': '욥기', '잠언': '잠언',
    '아가': '아가', '애가': '애가', '에스델': '에스델', '다니엘': '다니엘',
    '사무엘상': '사무엘(상)', '사무엘하': '사무엘(하)',
    '열왕기상': '열왕기(상)', '열왕기하': '열왕기(하)',
    '마태': '마태오의 복음서', '마르코': '마르코의 복음서', '루가': '루가의 복음서',
    '요한': '요한의 복음서', '사도행전': '사도행전',
    '로마': '로마인들에게 보낸 편지',
    '고린토전서': '고린토인들에게 보낸 첫째 편지', '고린토후서': '고린토인들에게 보낸 둘째 편지',
    '갈라디아': '갈라디아인들에게 보낸 편지', '에페소': '에페소인들에게 보낸 편지',
    '필립비': '필립비인들에게 보낸 편지', '골로사이': '골로사이인들에게 보낸 편지',
    '데살로니카전서': '데살로니카인들에게 보낸 첫째 편지', '1데살': '데살로니카인들에게 보낸 첫째 편지',
    '데살로니카후서': '데살로니카인들에게 보낸 둘째 편지', '2데살': '데살로니카인들에게 보낸 둘째 편지',
    '히브리': '히브리인들에게 보낸 편지', '야고보': '야고보의 편지',
    '베드로전서': '베드로의 첫째 편지', '베드로후서': '베드로의 둘째 편지',
    '요한1서': '요한의 첫째 편지',
};

// 3,300쪽짜리 PDF라 추출에 1분 넘게 걸리므로 임시 폴더에 한 번만 푼다
export function bibleText(pdfPath) {
    const st = statSync(pdfPath);
    const cache = join(tmpdir(), `gmchurch-bible-${st.size}-${Math.floor(st.mtimeMs)}.txt`);
    if (existsSync(cache)) return readFileSync(cache, 'utf8');
    const text = execFileSync('pdftotext', ['-layout', pdfPath, '-'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    writeFileSync(cache, text);
    return text;
}

// "마태 22:34-46" → { book, chapter, from, to }. 한 장 안의 구절만 다룬다.
export function parseRef(ref) {
    const m = /^(\S+) (\d+):(\d+)(?:-(\d+))?$/.exec(ref.trim());
    if (!m) throw new Error(`성경 참조 형식이 아닙니다: ${ref}`);
    const book = BOOKS[m[1]];
    if (!book) throw new Error(`책 이름을 모릅니다: ${m[1]} (scripts/lib/bible.js BOOKS에 추가)`);
    const from = Number(m[3]);
    return { book, chapter: Number(m[2]), from, to: m[4] ? Number(m[4]) : from };
}

const JAMO = /[ㄱ-ㆎ]/g;
const BREAK = '\u0001';
const OPENERS = /([‘“(])\s+/g;

// 책 한 권의 줄만 잘라낸다(본문의 책 제목 줄부터 다음 책의 쪽 머리말 전까지).
function bookLines(text, book) {
    const lines = text.split('\n');
    const start = lines.findIndex(l => l.trim() === book);
    if (start < 0) throw new Error(`책 제목 줄을 찾지 못했습니다: ${book}`);
    const header = /^\s*(.+?) 제\d+장\s*$/;
    let end = lines.length;
    for (let i = start + 1; i < lines.length; i++) {
        const m = header.exec(lines[i]);
        if (m && m[1] !== book) { end = i; break; }
    }
    return lines.slice(start, end);
}

// 쪽 번호·머리말·각주·소제목을 걷어내고 본문 줄만 남긴다. 빈 줄은 문단/쪽 경계 표시로 둔다.
function cleanLines(lines, book) {
    const out = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const t = line.trim();
        if (/^\d{3,4}$/.test(t)) continue;
        if (t.startsWith(book) && /제\d+장$/.test(t)) continue;
        if (/^[ㄱ-ㆎ]$/.test(t)) {
            // 각주 표지 줄: 다음 빈 줄이나 다음 표지 줄 전까지가 각주 내용
            while (i + 1 < lines.length && lines[i + 1].trim() !== '' && !/^[ㄱ-ㆎ]$/.test(lines[i + 1].trim())) i++;
            continue;
        }
        out.push(t);
    }
    // 소제목: 앞뒤가 빈 줄인 한 줄 블록 중 문장 부호로 끝나지 않거나 병행 본문 표시 "(마르코 12:28-34; …)"가 붙은 것
    const blocks = [];
    let cur = [];
    for (const l of out) {
        if (l === '') { if (cur.length) blocks.push(cur); cur = []; blocks.push(null); } else cur.push(l);
    }
    if (cur.length) blocks.push(cur);
    const kept = [];
    for (const b of blocks) {
        if (b === null) { kept.push(''); continue; }
        if (b.length === 1) {
            const l = b[0];
            const parallel = /\([가-힣]+ ?\d+[:\d,;\- 가-힣]*\)$/.test(l);
            const plain = !/\d/.test(l) && !/[.?!”’다]$/.test(l) && !/^\d+\s*¶/.test(l);
            if (parallel || plain) continue;
        }
        kept.push(...b);
    }
    return kept;
}

// 줄을 이을 때 공백을 넣을지 추정한다. 구두점·절 번호·여는 따옴표 경계는 공백, 나머지는 단어 중간으로 본다.
function joinLines(lines) {
    let s = '';
    for (const l of lines) {
        if (l === '') { s += ` ${BREAK} `; continue; }
        if (s !== '' && !s.endsWith(' ')) {
            const prev = s[s.length - 1];
            if (/[.,?!:;”’)\d]/.test(prev) || /^[\d‘“(]/.test(l)) s += ' ';
        }
        s += l;
    }
    return s;
}

// 장 번호 줄에서 시작해 절 번호를 순서대로 따라가며 절별 본문을 모은다.
// 장의 첫 절은 절 번호 대신 장 번호("22 ¶ …" 또는 소제목 뒤의 "2 …")로 인쇄되므로,
// 장 번호 뒤에 처음 나오는 번호가 2인 자리를 장의 시작으로 본다.
function splitVerses(text, chapter, to) {
    const tokens = text.replace(JAMO, ' ').replace(/¶/g, ' ¶ ').split(/\s+/).filter(Boolean);
    const isNum = tk => /^\d{1,3}$/.test(tk);
    const nextNum = i => { for (let j = i + 1; j < tokens.length; j++) if (isNum(tokens[j])) return Number(tokens[j]); return 0; };
    const start = tokens.findIndex((tk, i) => tk === String(chapter) && nextNum(i) === 2);
    if (start < 0) throw new Error(`${chapter}장의 시작을 찾지 못했습니다`);
    const verses = new Map();
    let v = 1;
    let buf = [];
    for (let i = start + 1; i < tokens.length; i++) {
        const tk = tokens[i];
        if (isNum(tk) && Number(tk) === v + 1) {
            verses.set(v, buf.join(' '));
            if (v >= to) return verses;
            v += 1;
            buf = [];
        } else if (tk === BREAK) {
            // 마지막 절은 다음 절 번호가 없으므로, 문장이 끝난 문단/쪽 경계에서 닫는다
            if (v >= to && /[.?!”’)]$/.test(buf.at(-1) || '') && tokens.slice(i + 1).find(x => x !== BREAK) !== String(v + 1)) break;
        } else if (tk !== '¶') buf.push(tk);
    }
    verses.set(v, buf.join(' '));
    return verses;
}

function tidy(s) {
    return s.replace(OPENERS, '$1').replace(/\s+/g, ' ').trim();
}

const norm = s => s.replace(/\s+/g, '').replace(/[“”]/g, '"').replace(/[‘’]/g, "'");

// PDF 글자에 온라인 공동번역(bible.anglican.kr)의 띄어쓰기를 입힌다. 글자가 다르면 오류.
export function respace(pdfText, onlineText) {
    const a = norm(pdfText);
    const b = norm(onlineText);
    if (a !== b) {
        let i = 0;
        while (i < a.length && a[i] === b[i]) i++;
        throw new Error(`글자가 다릅니다 (PDF …${a.slice(Math.max(0, i - 8), i + 8)}… / 온라인 …${b.slice(Math.max(0, i - 8), i + 8)}…)`);
    }
    const letters = [...pdfText.replace(/\s+/g, '')];
    let out = '';
    let j = 0;
    for (const ch of onlineText) {
        if (/\s/.test(ch)) { if (out && !out.endsWith(' ')) out += ' '; continue; }
        out += letters[j++];
    }
    return out.trim();
}

// ref에 해당하는 절 목록 [{ v, text }]. 절이 이어지지 않으면 오류.
export function extractPassage(text, ref) {
    const { book, chapter, from, to } = parseRef(ref);
    let lines = bookLines(text, book);
    // 쪽 머리말의 "책 제N장"은 그 쪽에서 시작하는 마지막 장이므로, 그 장 이상인 첫 쪽부터 읽는다
    if (chapter > 1) {
        const at = lines.findIndex(l => {
            const m = /^\s*.+ 제(\d+)장\s*$/.exec(l);
            return m && Number(m[1]) >= chapter;
        });
        if (at < 0) throw new Error(`${book} ${chapter}장 쪽을 찾지 못했습니다`);
        lines = lines.slice(at);
    }
    const stream = joinLines(cleanLines(lines, book));
    const verses = splitVerses(stream, chapter, to);
    const out = [];
    for (let v = from; v <= to; v++) {
        const t = verses.get(v);
        if (!t) throw new Error(`${ref}: ${chapter}장 ${v}절을 찾지 못했습니다`);
        out.push({ v, text: tidy(t) });
    }
    return out;
}

// 온라인 공동번역(bible.anglican.kr)의 장 데이터에서 절별 본문을 가져온다. 띄어쓰기 기준용.
export async function fetchOnlineChapter(book, chapter) {
    const books = await (await fetch('https://bible.anglican.kr/data/books.json')).json();
    const meta = books.find(b => b.name_ko === book);
    if (!meta) throw new Error(`온라인 책 목록에 없습니다: ${book}`);
    const res = await fetch(`https://bible.anglican.kr/data/bible/${meta.id}-${chapter}.json`);
    if (!res.ok) throw new Error(`온라인 본문을 가져오지 못했습니다: ${meta.id}-${chapter} (${res.status})`);
    const data = await res.json();
    const verses = new Map();
    for (const v of data.verses) {
        let t = '';
        let prev = null;
        for (const seg of v.segments) {
            if (prev && prev.type === 'poetry') t += ' ';
            t += seg.text.replace(/^¶\s*/, '');
            prev = seg;
        }
        verses.set(v.number, t);
    }
    return verses;
}
