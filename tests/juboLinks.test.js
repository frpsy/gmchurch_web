import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';

// 모바일 예배 순서지(jubo/)의 링크·이미지가 깨지지 않는지 — 주보 등록 때마다 자동 점검
const root = new URL('../', import.meta.url);
const read = rel => readFileSync(new URL(rel, root), 'utf8');
const json = rel => JSON.parse(read(rel));
const exists = rel => existsSync(new URL(rel, root));

const html = read('jubo/index.html');
const BIBLE = JSON.parse(/const BIBLE = (\{.*?\});/s.exec(html)[1]);

// jubo/index.html의 bibleUrl과 같은 규칙: 책 이름이 BIBLE에 있어야 링크가 만들어진다
function bibleOk(ref) {
    if (/^시편\s*\d+편/.test(ref)) return true;
    const m = /^(.+?)\s+(\d+)(?::(.+))?$/.exec(String(ref).trim());
    return !!(m && BIBLE[m[1]]);
}

const dates = json('data/jubo/index.json').dates;

describe.each(dates)('모바일 예배 순서지 %s', key => {
    const jubo = json(`data/jubo/${key}.json`);
    const book = json(`data/worship/${key}.book.json`);
    const items = book.sections.flatMap(s => s.items);

    it('필수 파일이 있다', () => {
        expect(jubo.cover ? exists(jubo.cover.src) : true).toBe(true);
    });

    it('성경 본문·성시 링크가 만들어진다', () => {
        const refs = items.filter(i => i.kind || i.label === '성시').map(i => i.ref);
        refs.forEach(r => expect(bibleOk(r), r).toBe(true));
        if (jubo.reflection?.ref) expect(bibleOk(jubo.reflection.ref), jubo.reflection.ref).toBe(true);
    });

    it('시편 악보 이미지가 있고 성가는 번호가 있어 성가집 앱 링크가 만들어진다', () => {
        items.forEach(i => {
            [i.score, ...(i.scores || [])].filter(Boolean).forEach(s => expect(exists(s), s).toBe(true));
            if (/^성가 /.test(i.ref || '')) expect(/\d+/.test(i.ref), i.ref).toBe(true);
        });
    });
});
