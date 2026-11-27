import fs from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const read = name => fs.readFileSync(new URL(name, root), 'utf8');
const context = {};
vm.runInNewContext(read('data.js') + '\n;this.items = CHURCH_DATA.sermons.items;', context);
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

export function renderSermon(item) {
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
        .filter(([, value]) => value).map(([label, value]) => `<div><dt>${label}</dt><dd>${escape(value)}</dd></div>`).join('');
    const date = item.date.split('-').map(Number);
    const titleText = escape(title);
    const summary = escape(`${item.preacher}의 ${kind} · ${date[0]}년 ${date[1]}월 ${date[2]}일`);
    const head = template.slice(0, template.indexOf('<body>'))
        .replaceAll('설교 말씀 — 대한성공회 광명교회', () => `${titleText} — 대한성공회 광명교회`)
        .replaceAll('광명교회 주일 설교 말씀을 날짜별로 모았습니다.', () => summary)
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
                <a class="sermon-archive-link" href="sermons.html">설교 말씀 목록</a>
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
                        <a class="sermon-archive-link" href="sermons.html">설교 말씀 목록</a>
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
    for (const item of context.items) {
        const filename = `sermon-${item.pageId}.html`;
        if (!/^\d{4}-\d{2}-\d{2}$/.test(item.pageId) || pages.has(filename) || dates.has(item.date)) {
            throw new Error(`설교 주소 또는 날짜가 올바르지 않거나 겹칩니다: ${item.pageId}, ${item.date}`);
        }
        dates.add(item.date);
        pages.set(filename, renderSermon(item));
    }
    return pages;
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url))) {
    for (const [file, html] of sermonPages()) fs.writeFileSync(new URL(file, root), html);
}
