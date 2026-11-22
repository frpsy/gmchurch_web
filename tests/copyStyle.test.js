// 사이트 문구 문장 기준 (사용자 기준 2026-11-20 "한 문장 한 생각, 쉼표 1개 이하, 80자 이내"를 사이트에 맞춤).
// 기존 문장은 tests/copy-style-baseline.json에 기록해 두고, 새로 쓰거나 고친 문장만 막는다(ratchet).
// 기준선 갱신: UPDATE_COPY_BASELINE=1 npx vitest run tests/copyStyle.test.js  (기존 문장을 고쳤을 때만)
import { describe, it, expect } from 'vitest';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { CHURCH_DATA } from './helpers/loadData.js';

const BASELINE = join(dirname(fileURLToPath(import.meta.url)), 'copy-style-baseline.json');
// 설교·성서·기도서·악보 등 원문을 그대로 싣는 곳은 기준에서 뺀다.
const SKIP = /^(sermons|bulletin|jubo|worship\.prayer|hymn|psalm|bible|readings|lectionary)/;
const MAX_LEN = 80;
const MAX_COMMA = 1;

function strings(node, path = '', out = []) {
    if (typeof node === 'string') {
        if (node.length >= 12 && !SKIP.test(path)) out.push([path, node]);
    } else if (Array.isArray(node)) {
        node.forEach((x, i) => strings(x, `${path}[${i}]`, out));
    } else if (node && typeof node === 'object') {
        for (const k of Object.keys(node)) strings(node[k], path ? `${path}.${k}` : k, out);
    }
    return out;
}

function violations() {
    const keys = new Set();
    for (const [path, raw] of strings(CHURCH_DATA)) {
        const text = raw.replace(/<[^>]+>/g, '').trim();
        const sentences = text.split(/(?<=[.!?。])\s+/).filter(s => /[가-힣]/.test(s));
        for (const s of sentences) {
            if (s.length > MAX_LEN) keys.add(`길이|${path}|${s}`);
            if ((s.match(/,/g) || []).length > MAX_COMMA) keys.add(`쉼표|${path}|${s}`);
        }
    }
    return [...keys].sort();
}

describe('사이트 문구 문장 기준 (새 문장만 검사)', () => {
    const current = violations();

    it('기준선 파일이 있다', () => {
        if (process.env.UPDATE_COPY_BASELINE) {
            writeFileSync(BASELINE, JSON.stringify(current, null, 2) + '\n', 'utf-8');
        }
        expect(() => readFileSync(BASELINE, 'utf-8')).not.toThrow();
    });

    it('기준선에 없는 새 문장은 80자 이내, 쉼표 1개 이하로 쓴다', () => {
        const baseline = new Set(JSON.parse(readFileSync(BASELINE, 'utf-8')));
        const fresh = current.filter(k => !baseline.has(k));
        // 실패 메시지에 고칠 문장이 바로 보이도록 출력
        expect(fresh, `새로 쓴 문장이 기준을 넘습니다. 두 문장으로 나누거나 쉼표를 줄이세요:\n${fresh.join('\n')}`).toEqual([]);
    });
});
