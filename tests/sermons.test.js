import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import vm from 'node:vm';
import { sermonPages } from '../scripts/build-sermons.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = p => readFileSync(resolve(root, p), 'utf8');

// data.js는 브라우저 전역 스크립트라 샌드박스에서 CHURCH_DATA만 꺼낸다
const ctx = {};
vm.runInNewContext(read('data.js') + '\n;this.CHURCH_DATA = CHURCH_DATA;', ctx);
const { sermons, navigation } = ctx.CHURCH_DATA;

describe('설교 말씀 데이터', () => {
  it('각 설교는 날짜·제목·문단·설교자를 갖는다', () => {
    expect(sermons.items.length).toBeGreaterThan(0);
    for (const s of sermons.items) {
      expect(s.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(s.title.trim()).not.toBe('');
      expect(s.preacher.trim()).not.toBe('');
      expect(s.paragraphs.length).toBeGreaterThan(0);
      for (const p of s.paragraphs) expect(p.trim()).not.toBe('');
    }
  });

  it('설교 날짜는 겹치지 않는다 (펼치기 주소·정렬 키가 날짜로 정해진다)', () => {
    const dates = sermons.items.map(s => s.date);
    expect(new Set(dates).size).toBe(dates.length);
  });

  it('편집자 각주 표시 [^n]와 주석 목록이 1번부터 순서대로 짝이 맞는다', () => {
    for (const s of sermons.items) {
      const text = s.paragraphs.join('\n');
      const marks = [...text.matchAll(/\[\^(\d+)\]/g)].map(m => Number(m[1]));
      const notes = s.footnotes || [];
      expect(marks, s.date).toEqual(notes.map((_, i) => i + 1));
      for (const n of notes) expect(n.trim(), s.date).not.toBe('');
    }
  });

  it('편집자 강조(**)는 짝이 맞고 문단마다 두 개를 넘지 않는다', () => {
    for (const s of sermons.items) {
      for (const p of s.paragraphs) {
        const count = (p.match(/\*\*/g) || []).length;
        expect(count % 2, s.date).toBe(0);
        expect(count / 2, s.date).toBeLessThanOrEqual(2);
      }
    }
  });

  // 설교와 강연 모두 같은 형식이다(2026-11-26 사용자 지시). 긴 강연은 분량에 맞춰 더 넣는다.
  it('설교·강연마다 강조와 각주가 분량에 맞게 들어 있다 (1,800자마다 1개, 최소 3개)', () => {
    for (const s of sermons.items) {
      const text = s.paragraphs.join('\n');
      const need = Math.max(3, Math.floor(text.length / 1800));
      const emphasis = (text.match(/\*\*/g) || []).length / 2;
      const notes = (s.footnotes || []).length;
      expect(emphasis, `${s.date} 강조`).toBeGreaterThanOrEqual(need);
      expect(notes, `${s.date} 각주`).toBeGreaterThanOrEqual(need);
    }
  });

  it('모든 설교의 독립 HTML이 최신이며 목차와 각주 링크가 실제 위치를 가리킨다', () => {
    const pages = sermonPages();
    expect(pages.size).toBe(sermons.items.length);
    for (const [file, expected] of pages) {
      const html = read(file).replaceAll('\r\n', '\n');
      expect(html, file).toBe(expected);
      expect(html, file).toContain('<meta name="robots" content="noindex">');
      const targets = [...html.matchAll(/href="#(sermon-section-[^"]+|fn(?:ref)?-[^"]+)"/g)];
      expect(targets.some(match => match[1].startsWith('sermon-section-')), file).toBe(true);
      const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
      expect(new Set(ids).size, file).toBe(ids.length);
      for (const [, target] of targets) expect(ids, file).toContain(target);
    }
    expect(readdirSync(root).filter(name => /^sermon-\d{4}-\d{2}-\d{2}\.html$/.test(name)).sort())
      .toEqual([...pages.keys()].sort());
  });

  it('원문 출처 링크가 있으면 https 주소다', () => {
    for (const s of sermons.items) {
      if (s.source) expect(s.source.url).toMatch(/^https:\/\//);
    }
  });

  it('설교 페이지가 내비게이션에서 연결된다', () => {
    const links = navigation.flatMap(g => (g.items || []).map(i => i.href));
    expect(links).toContain('sermons.html');
    expect(read('sermons.html')).toContain('id="sermons-full"');
  });
});

describe('사이트 검색에서 설교와 강연 찾기', () => {
  it('문단에서 찾은 구절과 이동 링크를 글마다 한 번 보여준다', () => {
    const app = read('app.js');
    const search = vm.runInNewContext(app.slice(app.indexOf('const MenuOverlay = {')) + '\nMenuOverlay;', {
      CHURCH_DATA: { navigation: [], sermons }
    });
    search._buildIndex();
    search._results = {};
    search._sitemap = {};
    const pages = sermonPages();
    for (const [date, term] of [
      ['2026-11-22', '바빌론 유배 시대'],
      ['2026-11-26', '1988년에 신학과에 입학']
    ]) {
      search._search(term);
      const matches = [...search._results.innerHTML.matchAll(new RegExp('href="(sermon-' + date + '\\.html)#([^"]+)"', 'g'))];
      expect(matches).toHaveLength(1);
      const [, file, anchor] = matches[0];
      expect(pages.get(file)).toContain(`id="${anchor}"`);
      expect(search._results.innerHTML).toContain(`<mark>${search._escape(term)}</mark>`);
    }
  });
});

describe('설교 페이지 제목과 공유 정보', () => {
  it('페이지마다 설교 제목과 설교자 설명을 쓴다', () => {
    for (const [file, html] of sermonPages()) {
      const heading = html.match(/<h1 id="sermon-title">([^<]+)<\/h1>/)[1];
      expect(html, file).toContain(`<title>${heading} — 대한성공회 광명교회</title>`);
      expect(html, file).toContain(`property="og:title" content="${heading} — 대한성공회 광명교회"`);
      expect(html, file).not.toContain('content="광명교회 주일 설교와 강연을');
    }
  });
});

describe('설교 읽기 도구', () => {
  it('하단 도구에서 설교 목록으로 이동할 수 있다', () => {
    const app = read('app.js');
    const source = app.slice(app.indexOf('const ReadingTools = {'), app.indexOf("window.addEventListener('DOMContentLoaded'", app.indexOf('const ReadingTools = {')));
    expect(source).toMatch(/href="sermons\.html"[^>]*>[^<]*<svg/);
    expect(source).toContain('<span>설교</span>');
  });

  it('설교 읽기 페이지가 아니면 하단 도구를 만들지 않는다', () => {
    const app = read('app.js');
    const source = app.slice(app.indexOf('const ReadingTools = {'), app.indexOf("window.addEventListener('DOMContentLoaded'", app.indexOf('const ReadingTools = {')));
    const run = hasReadingLayout => {
      const created = [];
      const main = { querySelector: sel => (sel === '.sermon-reading-layout' && hasReadingLayout ? {} : null) };
      const document = {
        getElementById: id => (id === 'main-content' ? main : null),
        createElement: tag => { created.push(tag); throw new Error('stop'); }
      };
      const ReadingTools = new Function('document', `${source}; return ReadingTools;`)(document);
      try { ReadingTools.render({}); } catch (e) { /* 설교 페이지면 만들기 시작한 것만 확인한다 */ }
      return created.length;
    };
    expect(run(false)).toBe(0);
    expect(run(true)).toBeGreaterThan(0);
  });

  it('모든 성경 봉독 구절이 공동번역 본문 주소로 바뀐다', () => {
    const app = read('app.js');
    const books = app.slice(app.indexOf('    _bibleBooks: {'), app.indexOf('    _refLink(ref)'));
    const bible = new Function(`return {${books}};`)();
    const refs = sermons.items.flatMap(s => (s.scripture || '').split(' / ').filter(Boolean));
    expect(refs.length).toBeGreaterThan(0);
    for (const ref of refs) expect(bible._bibleUrl(ref), ref).toMatch(/^https:\/\/www\.bskorea\.or\.kr\/bible\/korbibReadpage\.php\?version=COG&book=[0-9a-z]{3}&chap=\d+/);
    expect(bible._bibleUrl('에제 34:11-16')).toContain('book=ezk&chap=34&sec=11');
  });

  it('글 끝에서 날짜 순서로 이전·다음 글로 이어진다', () => {
    const pages = sermonPages();
    const byDate = [...sermons.items].sort((a, b) => a.date.localeCompare(b.date));
    byDate.forEach((item, i) => {
      const html = pages.get(`sermon-${item.pageId}.html`);
      const prev = html.match(/href="(sermon-[\d-]+\.html)" rel="prev"/)?.[1];
      const next = html.match(/href="(sermon-[\d-]+\.html)" rel="next"/)?.[1];
      expect(prev, item.date).toBe(i ? `sermon-${byDate[i - 1].pageId}.html` : undefined);
      expect(next, item.date).toBe(byDate[i + 1] ? `sermon-${byDate[i + 1].pageId}.html` : undefined);
    });
  });

  it('성경 봉독 항목은 각 구절을 묶어서 표시한다', () => {
    const html = sermonPages().get('sermon-2026-11-22.html');
    const meta = html.match(/<dd>(.*?)<\/dd>/)[1];
    expect(meta).toContain('<span class="sermon-scripture-ref">에제 34:11-16,20-24</span>');
    expect(meta).toContain('<span class="sermon-scripture-ref">마태 25:31-46</span>');
  });
});
