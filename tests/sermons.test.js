import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import vm from 'node:vm';

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

  it('모든 설교의 목차가 유효한 본문 위치로 연결된다', () => {
    const app = read('app.js');
    const source = app.slice(app.indexOf('const SermonsRenderer = {'), app.indexOf('/* ── NextStepRenderer'));
    const context = {};
    vm.runInNewContext(source + '\n;this.renderer = SermonsRenderer;', context);
    for (const sermon of sermons.items) {
      const html = context.renderer._bodyHtml(sermon);
      const targets = [...html.matchAll(/href="#(sermon-section-[^"]+)"/g)].map(match => match[1]);
      expect(targets.length, sermon.date).toBeGreaterThan(0);
      for (const target of targets) expect(html, sermon.date).toContain(`id="${target}"`);
      if (sermon.toc) {
        let previous = -1;
        for (const entry of sermon.toc) {
          expect(entry.label.trim(), sermon.date).not.toBe('');
          expect(entry.index, sermon.date).toBeGreaterThan(previous);
          expect(entry.index, sermon.date).toBeLessThan(sermon.paragraphs.length);
          previous = entry.index;
        }
      }
    }
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
