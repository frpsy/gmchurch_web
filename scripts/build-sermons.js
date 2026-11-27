import fs from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const read = name => fs.readFileSync(new URL(name, root), 'utf8');
const context = {};
vm.runInNewContext(read('data.js') + '\n;this.items = CHURCH_DATA.sermons.items;', context);
// 본문(문단·각주)은 data/sermon-bodies.json에 있다. 목록 항목과 pageId로 합친다.
const bodies = JSON.parse(read('data/sermon-bodies.json'));
context.items = context.items.map(item => {
    const body = bodies[item.pageId];
    if (!body) throw new Error(`본문이 없습니다: ${item.pageId}`);
    return { ...item, ...body };
});
const template = read('sermons.html').replaceAll('\r\n', '\n');

const escape = value => String(value).replace(/[&<>"']/g, char =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

function section(text) {
    const number = text.trim().match(/^(\d+)\.$/);
    if (number) return { title: number[1], label: number[0] + ' 부분', depth: 2, className: 'sermon-section' };
    const heading = text.match(/^(##|###) (.+)$/);
    if (!heading) return null;
    return heading[1] === '##'
        ? { title: heading[2], label: heading[2], depth: 2, className: 'sermon-section sermon-chapter' }
        : { title: heading[2], label: heading[2], depth: 3, className: 'sermon-subsection' };
}

// 글 끝 「이전·다음 글」 칸. 날짜 순서로 앞뒤 설교·강연을 잇는다
function pagerLink(entry, dir) {
    if (!entry) return '';
    const [y, m, d] = entry.date.split('-').map(Number);
    const label = `${dir === 'prev' ? '이전' : '다음'} ${entry.kind || '설교'}`;
    return `<a class="sermon-pager-link sermon-pager-link--${dir}" href="sermon-${entry.pageId}.html" rel="${dir}">
                            <span class="sermon-pager-dir">${label}</span>
                            <span class="sermon-pager-title">${escape(entry.title)}</span>
                            <span class="sermon-pager-meta">${y}년 ${m}월 ${d}일 · ${escape(entry.preacher)}</span>
                        </a>`;
}

export function renderSermon(item, { prev, next } = {}) {
    const { pageId, paragraphs, title, kind = '설교' } = item;
    const sections = paragraphs.map(section);
    const anchor = index => `sermon-section-${pageId}-${index}`;
    const headings = item.toc || sections.flatMap((entry, index) => entry
        ? [{ index, label: entry.label, sub: entry.depth === 3 }] : []);
    if (!headings.length || headings.some((entry, i) => !entry.label.trim() || !Number.isInteger(entry.index)
        || entry.index < 0 || entry.index >= paragraphs.length || (i && entry.index <= headings[i - 1].index))) {
        throw new Error(`목차를 확인하세요: ${pageId}`);
    }

    const body = paragraphs.map((paragraph, index) => {
        const entry = sections[index];
        const target = `id="${anchor(index)}" tabindex="-1"`;
        if (entry) return `<h${entry.depth} class="${entry.className}" ${target}>${escape(entry.title)}</h${entry.depth}>`;
        const content = escape(paragraph)
            .replace(/\*\*(.+?)\*\*/g, '<strong class="sermon-em">$1</strong>')
            .replace(/\[\^(\d+)\]/g, (_, n) => `<sup class="sermon-fn-ref"><a id="fnref-${pageId}-${n}" href="#fn-${pageId}-${n}" aria-label="주석 ${n}">${n}</a></sup>`);
        return `<p ${target}>${content}</p>`;
    }).join('\n');

    const notes = (item.footnotes || []).map((note, i) =>
        `<li id="fn-${pageId}-${i + 1}" tabindex="-1">${escape(note)} <a href="#fnref-${pageId}-${i + 1}" class="sermon-backref" aria-label="주석 ${i + 1}의 본문 위치로 돌아가기">본문으로</a></li>`).join('\n');
    const source = item.source
        ? `<p><a href="${escape(item.source.url)}" target="_blank" rel="noopener">${escape(item.source.label)}</a></p>` : '';
    const meta = [['성경 봉독', item.scripture], ['강연 자리', item.occasion]]
        .filter(([, value]) => value).map(([label, value]) => {
            const content = label === '성경 봉독'
                ? value.split(' / ').map(ref => `<span class="sermon-scripture-ref">${escape(ref)}</span>`).join(' / ')
                : escape(value);
            return `<div><dt>${label}</dt><dd>${content}</dd></div>`;
        }).join('');
    const date = item.date.split('-').map(Number);
    const titleText = escape(title);
    const summary = escape(`${item.preacher}의 ${kind} · ${date[0]}년 ${date[1]}월 ${date[2]}일`);
    // 목록 페이지의 제목·설명 문구가 바뀌어도 치환되도록 템플릿에서 읽는다. 없으면 멈춘다.
    const listTitle = template.match(/<title>([^<]+)<\/title>/)?.[1];
    const listSummary = template.match(/<meta name="description" content="([^"]+)"/)?.[1];
    if (!listTitle || !listSummary) throw new Error('sermons.html의 제목 또는 설명을 찾지 못했습니다.');
    const head = template.slice(0, template.indexOf('<body'))
        .replaceAll(listTitle, () => `${titleText} — 대한성공회 광명교회`)
        .replaceAll(listSummary, () => summary)
        .replaceAll('/sermons.html', `/sermon-${pageId}.html`)
        .replace('og:type" content="website"', 'og:type" content="article"');
    const scripts = template.slice(template.indexOf('    <footer id="main-footer">'));
    return `${head}<body>
    <!-- node scripts/build-sermons.js 로 생성한 페이지 -->
    <a href="#main-content" class="skip-link">본문으로 바로가기</a>
    <nav id="main-nav" class="nav-header"></nav>
    <main id="main-content" class="sermon-reading">
        <article aria-labelledby="sermon-title">
            <header class="sermon-reading-header">
                <a class="sermon-archive-link" href="sermons.html">설교와 강연 목록</a>
                <h1 id="sermon-title">${titleText}</h1>
                <div class="sermon-reading-byline">
                    <span>${escape(item.preacher)}</span>
                    <time datetime="${item.date}">${date[0]}년 ${date[1]}월 ${date[2]}일</time>
                </div>
                ${meta ? `<dl class="sermon-reading-meta">${meta}</dl>` : ''}
            </header>
            <div class="sermon-reading-layout">
                <details class="sermon-toc" data-article-toc>
                    <summary>목차</summary>
                    <nav aria-label="${escape(kind)} 목차"><ol>
${headings.map(({ index, label, sub }) => `                        <li${sub ? ' class="sermon-toc-sub"' : ''}><a href="#${anchor(index)}">${escape(label)}</a></li>`).join('\n')}
                    </ol></nav>
                </details>
                <div class="sermon-reading-text">
                    <div class="sermon-body">
${body}
                    </div>
                    ${notes ? `<section class="sermon-notes" aria-labelledby="sermon-notes-title">
                        <h2 id="sermon-notes-title">편집자 주석</h2>
                        <ol>${notes}</ol>
                    </section>` : ''}
                    <div class="sermon-reading-footer">
                        ${item.note ? `<p>${escape(item.note)}</p>` : ''}
                        ${source}
                        ${prev || next ? `<nav class="sermon-pager" aria-label="다른 설교와 강연">
                        ${pagerLink(prev, 'prev')}
                        ${pagerLink(next, 'next')}
                        </nav>` : ''}
                        <a class="sermon-archive-link" href="sermons.html">설교와 강연 목록</a>
                    </div>
                </div>
            </div>
        </article>
    </main>

${scripts}`.replace(/^[ 	]+$/gm, '');
}

export function sermonPages() {
    const pages = new Map();
    const dates = new Set();
    const byDate = [...context.items].sort((a, b) => a.date.localeCompare(b.date));
    for (const item of context.items) {
        const filename = `sermon-${item.pageId}.html`;
        if (!/^\d{4}-\d{2}-\d{2}$/.test(item.pageId) || pages.has(filename) || dates.has(item.date)) {
            throw new Error(`설교 주소 또는 날짜가 올바르지 않거나 겹칩니다: ${item.pageId}, ${item.date}`);
        }
        dates.add(item.date);
        const at = byDate.indexOf(item);
        pages.set(filename, renderSermon(item, { prev: byDate[at - 1], next: byDate[at + 1] }));
    }
    return pages;
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url))) {
    for (const [file, html] of sermonPages()) fs.writeFileSync(new URL(file, root), html);
}
