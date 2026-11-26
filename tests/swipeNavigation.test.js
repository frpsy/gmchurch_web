import { expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';

const source = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

function setup({ reduced = false, onTabs = false, overflow = false, zoom = 1, home = false } = {}) {
    const listeners = new Map();
    const animation = { cancel: vi.fn() };
    const main = { isConnected: true, style: {}, animate: vi.fn(() => animation) };
    const links = [!home, false].map(current => ({
        isConnected: true,
        getAttribute: name => name === 'aria-current' && current ? 'page' : null,
        click: vi.fn(),
    }));
    const nav = {
        isConnected: true,
        clientWidth: 390,
        scrollWidth: overflow ? 500 : 390,
        querySelector: selector => selector === '.container' || home ? null : links[0],
        querySelectorAll: vi.fn(() => links),
    };
    const window = {
        innerWidth: 390,
        visualViewport: { scale: zoom, addEventListener() {} },
        matchMedia: query => ({ matches: !query.includes('reduced') || reduced }),
        addEventListener() {},
        getSelection: () => ({ isCollapsed: true }),
    };
    const document = {
        body: { classList: { contains: name => name === 'home' && home } },
        documentElement: { classList: { toggle() {} } },
        getElementById: () => nav,
        addEventListener: (type, fn) => listeners.set(type, fn),
    };
    let scheduledFrame;
    const requestAnimationFrame = vi.fn(callback => {
        scheduledFrame = callback;
        return 1;
    });
    const context = createContext({
        window, document, setTimeout: vi.fn(), clearTimeout: vi.fn(),
        requestAnimationFrame, cancelAnimationFrame: () => { scheduledFrame = null; },
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
    const frame = () => {
        const callback = scheduledFrame;
        scheduledFrame = null;
        callback?.();
    };
    return { main, links, touch, animation, frame, requestAnimationFrame, nav };
}

it('follows the finger and settles before opening the next menu', () => {
    const { main, links, touch, animation, frame } = setup();
    touch('touchstart', 240);
    expect(touch('touchmove', 205).preventDefault).toHaveBeenCalledOnce();
    frame();
    expect(parseFloat(main.style.translate)).toBeLessThan(0);
    touch('touchmove', 150);
    frame();
    expect(parseFloat(main.style.translate)).toBeLessThan(-35);
    touch('touchend', 150);
    expect(links[1].click).not.toHaveBeenCalled();
    animation.onfinish();
    expect(links[1].click).toHaveBeenCalledOnce();
});

it('returns a short drag to its origin without opening a tab', () => {
    const { main, links, touch, animation, frame } = setup({ onTabs: true });
    touch('touchstart', 240);
    touch('touchmove', 213);
    frame();
    expect(touch('touchend', 213).preventDefault).toHaveBeenCalled();
    expect(main.animate.mock.calls[0][0][1]).toEqual({ translate: '0px' });
    animation.onfinish();
    expect(links[1].click).not.toHaveBeenCalled();
});

it.each([{ zoom: 2 }, { onTabs: true, overflow: true }, {}])('leaves native vertical scrolling alone (%j)', options => {
    const { main, links, touch } = setup(options);
    touch('touchstart', 240);
    expect(touch('touchmove', 234, 185).preventDefault).not.toHaveBeenCalled();
    touch('touchmove', 115, 186);
    touch('touchend', 115, 186);
    expect(main.style.translate).toBeUndefined();
    expect(main.animate).not.toHaveBeenCalled();
    expect(links[1].click).not.toHaveBeenCalled();
});

it('opens the first main menu from the homepage', () => {
    const { main, links, touch, animation, frame } = setup({ home: true });
    touch('touchstart', 240);
    touch('touchmove', 150);
    frame();
    expect(parseFloat(main.style.translate)).toBeLessThan(-50);
    touch('touchend', 150);
    animation.onfinish();
    expect(links[0].click).toHaveBeenCalledOnce();
});

it('paints only the latest position in each frame and keeps tracking past a quarter screen', () => {
    const { main, touch, frame, requestAnimationFrame, nav } = setup();
    touch('touchstart', 300);
    touch('touchmove', 245);
    touch('touchmove', 170);
    touch('touchmove', 110);
    expect(main.style.translate).toBeUndefined();
    expect(requestAnimationFrame).toHaveBeenCalledOnce();
    expect(nav.querySelectorAll).toHaveBeenCalledOnce();
    frame();
    expect(parseFloat(main.style.translate)).toBeLessThan(-150);
    touch('touchend', 110);
    expect(main.animate.mock.calls[0][1].duration).toBeLessThan(100);
});

it('navigates without motion when reduced motion is requested', () => {
    const { main, links, touch } = setup({ reduced: true });
    touch('touchstart', 240);
    touch('touchmove', 150);
    touch('touchend', 150);
    expect(main.animate).not.toHaveBeenCalled();
    expect(links[1].click).toHaveBeenCalledOnce();
});
