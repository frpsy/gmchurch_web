// 성경 본문을 PDF에서 뽑아 data/worship-texts/readings.json 형식으로 만든다.
import { fileURLToPath } from 'node:url';
import { bibleText, extractPassage, fetchOnlineChapter, parseRef, respace } from './bible.js';

const root = new URL('../../', import.meta.url);
export const PDF_PATH = fileURLToPath(new URL('bible/gongdong-bible-revised-v2.3-r101.pdf', root));
export const READINGS_PATH = fileURLToPath(new URL('data/worship-texts/readings.json', root));

// 글자는 PDF 기준, 띄어쓰기는 온라인 공동번역에서 입힌다. 두 출처의 글자가 다르면 오류.
export async function extractReadings(refs) {
    const text = bibleText(PDF_PATH);
    const out = {};
    for (const ref of refs) {
        const { book, chapter } = parseRef(ref);
        const online = await fetchOnlineChapter(book, chapter);
        out[ref] = {
            verses: extractPassage(text, ref).map(({ v, text: raw }) => {
                if (!online.has(v)) throw new Error(`${ref}: 온라인 본문에 ${v}절이 없습니다`);
                return { v, text: respace(raw, online.get(v)) };
            }),
        };
    }
    return out;
}
