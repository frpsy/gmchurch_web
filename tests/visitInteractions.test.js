import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';

describe('주소 복사', () => {
    it.each(['success', 'denied', 'unsupported'])('복사 결과 또는 직접 복사 안내를 제공한다: %s', async mode => {
        const status = { textContent: '' };
        const text = {};
        const selection = { removeAllRanges: vi.fn(), addRange: vi.fn() };
        const range = { selectNodeContents: vi.fn() };
        const clipboard = mode === 'unsupported' ? undefined : {
            writeText: mode === 'success' ? vi.fn().mockResolvedValue() : vi.fn().mockRejectedValue(new Error('denied'))
        };
        const context = createContext({
            navigator: { clipboard },
            window: { addEventListener() {}, getSelection: () => selection },
            document: { createRange: () => range },
            setTimeout: vi.fn()
        });
        runInContext(readFileSync(new URL('../data.js', import.meta.url), 'utf8'), context);
        runInContext(readFileSync(new URL('../app.js', import.meta.url), 'utf8'), context);
        const helper = runInContext('MapHelper', context);
        const btn = { dataset: { copy: '경기도 광명시 아방리 2길 10' }, textContent: '복사', disabled: false,
            closest: () => ({ querySelector: () => status }), parentElement: { querySelector: () => text } };
        await helper.copyAddr(btn);
        expect(btn.disabled).toBe(false);
        if (mode === 'success') {
            expect(clipboard.writeText).toHaveBeenCalledWith(btn.dataset.copy);
            expect(status.textContent).toBe('복사됨');
        } else {
            expect(status.textContent).toContain('길게 눌러 복사');
            expect(range.selectNodeContents).toHaveBeenCalledWith(text);
            expect(selection.addRange).toHaveBeenCalledWith(range);
        }
    });
});

describe('헌금 계좌 복사', () => {
    it.each(['success', 'denied'])('계좌번호 복사 결과 또는 직접 복사 안내를 제공한다: %s', async mode => {
        const status = { textContent: '' };
        const text = {};
        const selection = { removeAllRanges: vi.fn(), addRange: vi.fn() };
        const range = { selectNodeContents: vi.fn() };
        const clipboard = { writeText: mode === 'success' ? vi.fn().mockResolvedValue() : vi.fn().mockRejectedValue(new Error('denied')) };
        const context = createContext({
            navigator: { clipboard },
            window: { addEventListener() {}, getSelection: () => selection },
            document: { createRange: () => range },
            setTimeout: vi.fn()
        });
        runInContext(readFileSync(new URL('../data.js', import.meta.url), 'utf8'), context);
        runInContext(readFileSync(new URL('../app.js', import.meta.url), 'utf8'), context);
        const helper = runInContext('MapHelper', context);
        const giving = runInContext('CHURCH_DATA.giving', context);
        const btn = { dataset: { copy: `${giving.bankName} ${giving.bank}`, copyKind: 'account' }, textContent: '복사', disabled: false,
            closest: () => ({ querySelector: () => status }), parentElement: { querySelector: () => text } };
        await helper.copyAddr(btn);
        expect(btn.disabled).toBe(false);
        if (mode === 'success') {
            expect(clipboard.writeText).toHaveBeenCalledWith('국민은행 2680-100-14008');
            expect(status.textContent).toBe('복사됨');
        } else {
            expect(status.textContent).toContain('계좌번호를 선택했습니다');
            expect(range.selectNodeContents).toHaveBeenCalledWith(text);
        }
    });
});
