import { expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';

const source = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

function setup({ reduced = false, onTabs = false, overflow = false, zoom = 1 } = {}) {
    const listeners = new Map();
    const animation = { cancel: vi.fn() };
    const main = { isConnected: true, style: {}, animate: vi.fn(() => animation) };
    const links = [true, false].map(current => ({
        isConnected: true,
        getAttribute: name => name === 'aria-current' && current ? 'page' : null,
        click: vi.fn(),
    }));
    const nav = {
        isConnected: true,
        clientWidth: 390,
        scrollWidth: overflow ? 500 : 390,
        querySelector: selector => selector === '.container' ? null : links[0],
        querySelectorAll: () => links,
    };
    const window = {
        innerWidth: 390,
        visualViewport: { scale: zoom, addEventListener() {} },
        matchMedia: query => ({ matches: !query.includes('reduced') || reduced }),
        addEventListener() {},
        getSelection: () => ({ isCollapsed: true }),
    };
    const document = {
        documentElement: { classList: { toggle() {} } },
        getElementById: () => nav,
        addEventListener: (type, fn) => listeners.set(type, fn),
    };
    const context = createContext({
        window, document, setTimeout: vi.fn(), clearTimeout: vi.fn(),
    });
    runInContext(source, context);
    runInContext('SwipeNavigation.init()', context);
    const target = { closest: selector => {
        if (selector === 'main') return main;
        if (selector === 'nav[data-swipe-tabs]' && onTabs) return nav;
        return null;
    } };
    function touch(type, clientX, clientY = 150) {
        const point = { clientX, clientY, identifier: 1 };
        const event = { target, touches: [point], changedTouches: [point], cancelable: true, preventDefault: vi.fn() };
        listeners.get(type)(event);
        return event;
    }
    return { main, links, touch, animation };
}

it('follows the finger and settles before opening the next menu', () => {
    const { main, links, touch, animation } = setup();
    touch('touchstart', 240);
    touch('touchmove', 205);
    expect(parseFloat(main.style.translate)).toBeLessThan(0);
    touch('touchmove', 150);
    expect(parseFloat(main.style.translate)).toBeLessThan(-35);
    touch('touchend', 150);
    expect(links[1].click).not.toHaveBeenCalled();
    animation.onfinish();
    expect(links[1].click).toHaveBeenCalledOnce();
});

it('returns a short drag to its origin without opening a tab', () => {
    const { main, links, touch, animation } = setup({ onTabs: true });
    touch('touchstart', 240);
    touch('touchmove', 213);
    expect(touch('touchend', 213).preventDefault).toHaveBeenCalled();
    expect(main.animate.mock.calls[0][0][1]).toEqual({ translate: '0px' });
    animation.onfinish();
    expect(links[1].click).not.toHaveBeenCalled();
});

it.each([{ zoom: 2 }, { onTabs: true, overflow: true }, {}])('leaves native vertical scrolling alone (%j)', options => {
    const { main, links, touch } = setup(options);
    touch('touchstart', 240);
    touch('touchmove', 234, 185);
    touch('touchmove', 115, 186);
    touch('touchend', 115, 186);
    expect(main.style.translate).toBeUndefined();
    expect(main.animate).not.toHaveBeenCalled();
    expect(links[1].click).not.toHaveBeenCalled();
});

it('navigates without motion when reduced motion is requested', () => {
    const { main, links, touch } = setup({ reduced: true });
    touch('touchstart', 240);
    touch('touchmove', 150);
    touch('touchend', 150);
    expect(main.animate).not.toHaveBeenCalled();
    expect(links[1].click).toHaveBeenCalledOnce();
});
