// 사이트 문구 문장 기준 (사용자 기준 2026-11-20 "한 문장 한 생각, 쉼표 1개 이하, 80자 이내"를 사이트에 맞춤).
// 검사 대상: data.js의 문구와 각 HTML 페이지의 본문(p, li, dd, blockquote).
// 1) 길이·쉼표: 기존 문장은 tests/copy-style-baseline.json에 기록해 두고, 새로 쓰거나 고친 문장만 막는다(ratchet).
//    기준선 키는 「종류|문장」이라 배열 번호나 페이지가 바뀌어도 흔들리지 않는다.
//    기준선 갱신: UPDATE_COPY_BASELINE=1 npx vitest run tests/copyStyle.test.js
//    (기존 문장을 고쳤을 때만 쓴다. 새 위반까지 함께 묻히므로 diff를 반드시 확인한다.)
// 2) 한 문단 안의 문체 혼용(한다체와 합니다체)과 같은 뜻 어휘 혼용(소요/걸립니다)은 기준선 없이 바로 막는다.
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { CHURCH_DATA } from './helpers/loadData.js';

const TESTS = dirname(fileURLToPath(import.meta.url));
const ROOT = join(TESTS, '..');
const BASELINE = join(TESTS, 'copy-style-baseline.json');
// 설교·성서·기도서·악보 등 원문을 그대로 싣는 곳은 기준에서 뺀다.
const SKIP = /^(sermons|bulletin|jubo|worship\.prayer|hymn|psalm|bible|readings|lectionary)/;
const MAX_LEN = 80;
const MAX_COMMA = 1;
// 같은 뜻을 두 가지로 섞어 쓰면 어색해지는 어휘 묶음. 한 문단에 두 묶음 이상 나오면 막는다.
const WORD_GROUPS = [
    { name: '시간 길이(소요/걸림)', parts: [/소요/, /걸립니다|걸려요|걸리며|걸리고/] },
];

const plainText = html =>
    html.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

// 문장 끝(. ! ? 。) 뒤에 닫는 따옴표·괄호가 와도 문장을 나눈다.
const splitSentences = text =>
    text.split(/(?<=[.!?。][”’"')」』]*)\s+/).filter(s => /[가-힣]/.test(s));

function dataParagraphs(node, path = '', out = []) {
    if (typeof node === 'string') {
        if (node.length >= 12 && !SKIP.test(path)) out.push({ src: `data:${path}`, text: plainText(node) });
    } else if (Array.isArray(node)) {
        node.forEach((x, i) => dataParagraphs(x, `${path}[${i}]`, out));
    } else if (node && typeof node === 'object') {
        for (const k of Object.keys(node)) dataParagraphs(node[k], path ? `${path}.${k}` : k, out);
    }
    return out;
}

function htmlParagraphs() {
    const out = [];
    for (const file of readdirSync(ROOT).filter(f => f.endsWith('.html')).sort()) {
        const html = readFileSync(join(ROOT, file), 'utf-8')
            .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '');
        for (const m of html.matchAll(/<(p|li|dd|blockquote)\b[^>]*>([\s\S]*?)<\/\1>/g)) {
            const text = plainText(m[2]);
            if (text.length >= 12) out.push({ src: `html:${file}`, text });
        }
    }
    return out;
}

const PARAGRAPHS = [...dataParagraphs(CHURCH_DATA), ...htmlParagraphs()];

function baselineKeys() {
    const keys = new Set();
    for (const { text } of PARAGRAPHS) {
        for (const s of splitSentences(text)) {
            if (s.length > MAX_LEN) keys.add(`길이|${s}`);
            if ((s.match(/[,，]/g) || []).length > MAX_COMMA) keys.add(`쉼표|${s}`);
        }
    }
    return [...keys].sort();
}

const isPlainEnding = s => /(?<!니)다[.!?”’"')」』]*$/.test(s) && !/니다[.!?”’"')」』]*$/.test(s);
const isFormalEnding = s => /니다[.!?”’"')」』]*$/.test(s);

function mixes() {
    const found = [];
    for (const { src, text } of PARAGRAPHS) {
        const sentences = splitSentences(text);
        if (sentences.some(isPlainEnding) && sentences.some(isFormalEnding)) {
            found.push(`문체 혼용(한다체+합니다체)|${src}|${text.slice(0, 60)}`);
        }
        for (const g of WORD_GROUPS) {
            if (g.parts.filter(re => re.test(text)).length > 1) {
                found.push(`어휘 혼용 ${g.name}|${src}|${text.slice(0, 60)}`);
            }
        }
    }
    return found;
}

describe('사이트 문구 문장 기준', () => {
    const current = baselineKeys();

    it('기준선 파일이 있다', () => {
        if (process.env.UPDATE_COPY_BASELINE) {
            writeFileSync(BASELINE, JSON.stringify(current, null, 2) + '\n', 'utf-8');
        }
        expect(() => readFileSync(BASELINE, 'utf-8')).not.toThrow();
    });

    it('기준선에 없는 새 문장은 80자 이내, 쉼표 1개 이하로 쓴다', () => {
        const baseline = new Set(JSON.parse(readFileSync(BASELINE, 'utf-8')));
        const fresh = current.filter(k => !baseline.has(k));
        expect(fresh, `새로 쓴 문장이 기준을 넘습니다. 두 문장으로 나누거나 쉼표를 줄이세요:\n${fresh.join('\n')}`).toEqual([]);
    });

    it('기준선에 고쳐서 이미 사라진 문장이 남아 있지 않다', () => {
        const now = new Set(current);
        const stale = JSON.parse(readFileSync(BASELINE, 'utf-8')).filter(k => !now.has(k));
        expect(stale, `고쳐진 문장이 기준선에 남았습니다. UPDATE_COPY_BASELINE=1로 갱신하세요:\n${stale.join('\n')}`).toEqual([]);
    });

    it('한 문단 안에서 문체와 같은 뜻 어휘를 섞지 않는다', () => {
        const found = mixes();
        expect(found, `한 문단에서 말투나 어휘가 섞였습니다. 한 가지로 통일하세요:\n${found.join('\n')}`).toEqual([]);
    });
});
