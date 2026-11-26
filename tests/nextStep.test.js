// 페이지 끝 「다음 걸음」 영역: data.js nextStep 하나로 모든 페이지 문구·버튼을 관리한다(2026-11-26).
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createContext, runInContext } from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ctx = createContext({ window: { addEventListener() {} } });
runInContext(readFileSync(join(root, 'data.js'), 'utf-8') + ';this.D = CHURCH_DATA;', ctx);
const { nextStep } = ctx.D;
const pagesInHtml = readdirSync(root).filter(f => f.endsWith('.html'))
    .flatMap(f => [...readFileSync(join(root, f), 'utf-8').matchAll(/data-next-step="([\w-]+)"/g)].map(m => [f, m[1]]));

describe('다음 걸음 영역', () => {
    it('HTML에 남은 옛 문구 블록이 없다(문구는 data.js에서만 관리)', () => {
        for (const f of readdirSync(root).filter(f => f.endsWith('.html')))
            expect(readFileSync(join(root, f), 'utf-8'), f).not.toMatch(/next-step-cta-title/);
    });

    it('HTML이 가리키는 페이지 키마다 데이터가 있고, 쓰이지 않는 데이터가 없다', () => {
        const keys = pagesInHtml.map(([, k]) => k);
        for (const [f, k] of pagesInHtml) expect(nextStep.pages[k], f).toBeTruthy();
        expect(Object.keys(nextStep.pages).sort()).toEqual([...new Set(keys)].sort());
    });

    it('버튼은 1~3개, 사전에 있는 목적지만 쓰고 한 페이지에서 겹치지 않는다', () => {
        for (const [k, p] of Object.entries(nextStep.pages)) {
            expect(p.actions.length, k).toBeGreaterThanOrEqual(1);
            expect(p.actions.length, k).toBeLessThanOrEqual(3);
            expect(new Set(p.actions).size, k).toBe(p.actions.length);
            for (const a of p.actions) expect(nextStep.links[a], `${k}:${a}`).toBeTruthy();
        }
    });

    it('목적지마다 이름·아이콘·주소가 있고 아이콘은 icons.svg에 있다', () => {
        const svg = readFileSync(join(root, 'images', 'icons.svg'), 'utf-8');
        for (const [k, l] of Object.entries(nextStep.links)) {
            expect(l.label && l.href, k).toBeTruthy();
            expect(svg, k).toContain(`id="${l.icon}"`);
        }
    });

    it('제목이 페이지마다 다르다', () => {
        const pages = Object.entries(nextStep.pages);
        for (const [k, p] of pages) {
            expect(p.title.length, k).toBeLessThanOrEqual(22);
        }
        const titles = pages.map(([, p]) => p.title);
        expect(new Set(titles).size).toBe(titles.length);
    });
});
