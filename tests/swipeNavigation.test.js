import { expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';

const source = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

function setup({ reduced = false, onTabs = false, overflow = false, zoom = 1, home = false, targetTag, currentIndex = 0, native = false, page, tabs } = {}) {
    const listeners = new Map();
    const animation = { cancel: vi.fn() };
    const main = { isConnected: true, style: {}, animate: vi.fn(() => animation) };
    const links = [0, 1].map(index => ({
        href: 'https://site.test/menu-' + index + '.html',
        isConnected: true,
        getAttribute: name => {
            if (name === 'href') return 'menu-' + index + '.html';
            return name === 'aria-current' && !home && index === currentIndex ? 'page' : null;
        },
        click: vi.fn(),
    }));
    const tabLinks = (tabs?.files || []).map((file, index) => ({
        href: 'https://site.test/' + file,
        isConnected: true,
        getAttribute: name => name === 'href' ? file : (name === 'aria-current' && index === tabs.current ? 'page' : null),
        click: vi.fn(),
    }));
    const tabNav = tabs && { querySelectorAll: () => tabLinks };
    const homeLink = { href: 'https://site.test/index.html', isConnected: true, getAttribute: () => null, click: vi.fn() };
    const nav = {
        isConnected: true,
        clientWidth: 390,
        scrollWidth: overflow ? 500 : 390,
        querySelector: selector => selector === '.container' || home ? null : links[0],
        querySelectorAll: vi.fn(() => links),
    };
    const window = {
        PageSwapEvent: native,
        PageRevealEvent: native,
        location: new URL('https://site.test/' + (page || (home ? 'index.html' : 'menu-' + currentIndex + '.html'))),
        innerWidth: 390,
        visualViewport: { scale: zoom, addEventListener() {} },
        matchMedia: query => ({ matches: !query.includes('reduced') || reduced }),
        addEventListener: (type, fn) => listeners.set(type, fn),
        getSelection: () => ({ isCollapsed: true }),
    };
    const document = {
        body: { classList: { contains: name => name === 'home' && home } },
        documentElement: { classList: { toggle() {} } },
        getElementById: () => nav,
        querySelector: selector => {
            if (selector === 'a.nav-logo[href]') return homeLink;
            if (selector === 'main nav[data-swipe-tabs]') return tabNav || null;
            return null;
        },
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
        URL, sessionStorage: { setItem: vi.fn(), getItem: vi.fn() },
    });
    runInContext(source, context);
    runInContext('SwipeNavigation.init()', context);
    const target = { closest: selector => {
        if (selector === 'main') return main;
        if (selector === 'nav[data-swipe-tabs]' && onTabs) return nav;
        if (targetTag && selector.split(', ').includes(targetTag)) return target;
        return null;
    } };
    function touch(type, clientX, clientY = 150, { timeStamp, fingers = 1 } = {}) {
        const point = { clientX, clientY, identifier: 1 };
        const touches = [point, ...Array.from({ length: fingers - 1 }, (_, i) => ({ clientX, clientY, identifier: i + 2 }))];
        const event = { target, touches, changedTouches: [point], cancelable: true, preventDefault: vi.fn(), timeStamp };
        listeners.get(type)(event);
        return event;
    }
    const frame = () => {
        const callback = scheduledFrame;
        scheduledFrame = null;
        callback?.();
    };
    return {
        tabLinks, main, links, touch, animation, frame, requestAnimationFrame, nav, homeLink,
        storage: context.sessionStorage, listeners, context,
    };
}

it('hands off to document navigation from the painted position without a separate finish animation', () => {
    const { main, links, touch, frame, storage, listeners } = setup({ native: true });
    touch('touchstart', 240);
    expect(touch('touchmove', 205).preventDefault).toHaveBeenCalledOnce();
    frame();
    expect(parseFloat(main.style.translate)).toBeLessThan(0);
    touch('touchmove', 150);
    frame();
    expect(parseFloat(main.style.translate)).toBeLessThan(-35);
    touch('touchend', 150);
    expect(main.animate).not.toHaveBeenCalled();
    expect(main.style.translate).toBe('-85.5px');
    expect(links[1].click).toHaveBeenCalledOnce();
    const [, state] = storage.setItem.mock.calls[0];
    expect(JSON.parse(state)).toMatchObject({ to: links[1].href, travel: 304.5 });
    storage.getItem.mockReturnValue(state);
    const types = new Set();
    listeners.get('pageswap')({ viewTransition: { types, ready: Promise.resolve() }, activation: { entry: { url: links[1].href } } });
    expect(types.has('menu-swipe')).toBe(true);
    listeners.get('pagehide')();
    expect(main.style.translate).toBe('');
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

it.each([true, false])('uses the same document and never freezes a cold destination (prepared=%s)', prepared => {
    const { main, links, touch, frame, context } = setup({ native: true });
    links[1].href = 'https://site.test/clergy.html';
    const go = vi.fn().mockResolvedValue(undefined);
    const page = runInContext('PageSwitch', context);
    page.go = go;
    page.preload = vi.fn();
    page.isReady = vi.fn(() => prepared);
    context.document.startViewTransition = vi.fn();
    touch('touchstart', 240);
    touch('touchmove', 150);
    frame();
    touch('touchend', 150);
    expect(links[1].click).not.toHaveBeenCalled();
    if (prepared) {
        expect(main.animate).not.toHaveBeenCalled();
        expect(go).toHaveBeenCalledWith('clergy.html', true, 304.5);
    } else {
        expect(main.animate.mock.calls[0][0][1]).toEqual({ translate: '0px' });
        expect(go).toHaveBeenCalledWith('clergy.html', true);
    }
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
    const { main, links, touch, frame } = setup({ home: true });
    touch('touchstart', 240);
    touch('touchmove', 150);
    frame();
    expect(parseFloat(main.style.translate)).toBeLessThan(-50);
    touch('touchend', 150);
    expect(main.animate).not.toHaveBeenCalled();
    expect(links[0].click).toHaveBeenCalledOnce();
});

it('returns to the homepage when swiping right on the first main menu', () => {
    const { main, links, touch, frame, context } = setup({ currentIndex: 0 });
    const page = runInContext('PageSwitch', context);
    page.go = vi.fn().mockResolvedValue(undefined);
    page.preload = vi.fn();
    touch('touchstart', 150);
    touch('touchmove', 240);
    frame();
    expect(parseFloat(main.style.translate)).toBeGreaterThan(50);
    touch('touchend', 240);
    expect(page.go).toHaveBeenCalledWith('index.html', true);
    expect(links[1].click).not.toHaveBeenCalled();
});

it('keeps tab strips from jumping to the homepage', () => {
    const { homeLink, touch, frame, context } = setup({ onTabs: true, currentIndex: 0 });
    const page = runInContext('PageSwitch', context);
    page.go = vi.fn().mockResolvedValue(undefined);
    touch('touchstart', 150);
    touch('touchmove', 240);
    frame();
    touch('touchend', 240);
    expect(homeLink.click).not.toHaveBeenCalled();
    expect(page.go).not.toHaveBeenCalled();
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
    expect(main.animate).not.toHaveBeenCalled();
});

it('navigates without motion when reduced motion is requested', () => {
    const { main, links, touch } = setup({ reduced: true });
    touch('touchstart', 240);
    touch('touchmove', 150);
    touch('touchend', 150);
    expect(main.animate).not.toHaveBeenCalled();
    expect(links[1].click).toHaveBeenCalledOnce();
});

it.each([[18, 64, 0], [372, 326, 1]])('recognizes short swipes starting near either edge (%i)', (start, end, next) => {
    const { links, touch } = setup({ currentIndex: 1 - next, reduced: true });
    touch('touchstart', start);
    touch('touchmove', end);
    touch('touchend', end);
    expect(links[next].click).toHaveBeenCalledOnce();
});

it('reserves the outermost edge for browser gestures', () => {
    const { links, touch } = setup({ reduced: true });
    touch('touchstart', 382);
    expect(touch('touchmove', 300).preventDefault).not.toHaveBeenCalled();
    touch('touchend', 300);
    expect(links[1].click).not.toHaveBeenCalled();
});

it('preserves regular link taps and claims horizontal drags over a link early', () => {
    const { touch, frame, main } = setup({ targetTag: 'a' });
    touch('touchstart', 240);
    expect(touch('touchend', 240).preventDefault).not.toHaveBeenCalled();
    touch('touchstart', 240);
    expect(touch('touchmove', 232).preventDefault).toHaveBeenCalledOnce();
    frame();
    expect(parseFloat(main.style.translate)).toBeLessThan(0);
    expect(touch('touchend', 232).preventDefault).toHaveBeenCalledOnce();
});

it('stops tracking when a second finger joins so pinch zoom keeps working', () => {
    const { main, links, touch, frame } = setup({ reduced: true });
    touch('touchstart', 240);
    touch('touchmove', 220);
    const pinch = touch('touchmove', 150, 150, { fingers: 2 });
    expect(pinch.preventDefault).not.toHaveBeenCalled();
    frame();
    touch('touchend', 150);
    expect(main.style.translate).toBeFalsy();
    expect(links[1].click).not.toHaveBeenCalled();
});

it('follows a quick short flick but not a drag pulled back toward the start', () => {
    const flick = setup({ reduced: true });
    flick.touch('touchstart', 240, 150, { timeStamp: 0 });
    flick.touch('touchmove', 228, 150, { timeStamp: 20 });
    flick.touch('touchmove', 212, 150, { timeStamp: 40 });
    flick.touch('touchend', 212, 150, { timeStamp: 50 });
    expect(flick.links[1].click).toHaveBeenCalledOnce();

    const slow = setup({ reduced: true });
    slow.touch('touchstart', 240, 150, { timeStamp: 0 });
    slow.touch('touchmove', 228, 150, { timeStamp: 200 });
    slow.touch('touchmove', 212, 150, { timeStamp: 400 });
    slow.touch('touchend', 212, 150, { timeStamp: 420 });
    expect(slow.links[1].click).not.toHaveBeenCalled();

    const back = setup({ reduced: true });
    back.touch('touchstart', 300, 150, { timeStamp: 0 });
    back.touch('touchmove', 100, 150, { timeStamp: 200 });
    back.touch('touchmove', 200, 150, { timeStamp: 260 });
    back.touch('touchend', 230, 150, { timeStamp: 280 });
    expect(back.links[1].click).not.toHaveBeenCalled();
});

it('keeps a loading destination in place briefly before animating to it', async () => {
    const { main, links, touch, frame, context } = setup({ native: true });
    links[1].href = 'https://site.test/clergy.html';
    let resolve;
    const page = runInContext('PageSwitch', context);
    page.go = vi.fn().mockResolvedValue(undefined);
    page.preload = vi.fn();
    page.isReady = vi.fn(() => false);
    page.whenReady = vi.fn(() => new Promise(r => { resolve = r; }));
    context.document.startViewTransition = vi.fn();
    touch('touchstart', 240);
    touch('touchmove', 150);
    frame();
    touch('touchend', 150);
    expect(main.animate).not.toHaveBeenCalled();
    expect(page.go).not.toHaveBeenCalled();
    resolve(true);
    await new Promise(r => setTimeout(r, 0));
    expect(page.go).toHaveBeenCalledWith('clergy.html', true, 304.5);
    expect(main.animate).not.toHaveBeenCalled();
});

it.each([[240, 150, null], [150, 240, 0]])('sends a sub page back to its parent menu only on a right swipe (%i→%i)', (from, to, expected) => {
    const { links, touch } = setup({ reduced: true, page: 'greenchurch.html' });
    touch('touchstart', from);
    touch('touchmove', to);
    touch('touchend', to);
    expect(links[0].click).toHaveBeenCalledTimes(expected === 0 ? 1 : 0);
    expect(links[1].click).not.toHaveBeenCalled();
});

it('moves between tabs from the page body and continues to the next menu after the last tab', () => {
    const tabs = { files: ['menu-0.html', 'news.html'], current: 0 };
    const first = setup({ reduced: true, tabs });
    const page = runInContext('PageSwitch', first.context);
    page.go = vi.fn().mockResolvedValue(undefined);
    first.touch('touchstart', 240);
    first.touch('touchmove', 150);
    first.touch('touchend', 150);
    expect(page.go).toHaveBeenCalledWith('news.html', true);
    expect(first.links[1].click).not.toHaveBeenCalled();

    const last = setup({ reduced: true, page: 'news.html', tabs: { ...tabs, current: 1 } });
    last.touch('touchstart', 240);
    last.touch('touchmove', 150);
    last.touch('touchend', 150);
    expect(last.links[1].click).toHaveBeenCalledOnce();
});

it('returns from the first child tab to its parent hub and stops after the last one', () => {
    const tabs = { files: ['videos.html', 'links.html'] };
    const first = setup({ reduced: true, page: 'videos.html', tabs: { ...tabs, current: 0 } });
    first.touch('touchstart', 150);
    first.touch('touchmove', 240);
    first.touch('touchend', 240);
    expect(first.links[0].click).toHaveBeenCalledOnce();

    const last = setup({ reduced: true, page: 'links.html', tabs: { ...tabs, current: 1 } });
    last.touch('touchstart', 240);
    last.touch('touchmove', 150);
    last.touch('touchend', 150);
    expect(last.links[1].click).not.toHaveBeenCalled();
});

it('preloads the destination hero with the candidate the phone would pick', async () => {
    const { context } = setup();
    const created = [];
    context.Image = function () {
        const img = { decode: vi.fn(() => Promise.resolve()) };
        created.push(img);
        return img;
    };
    context.window.matchMedia = query => ({ matches: query === '(max-width: 768px)' });
    const attrs = (map) => ({ getAttribute: name => map[name] ?? null });
    const sources = [
        attrs({ media: '(min-width: 2000px)', srcset: 'images/hero/wide.webp' }),
        attrs({ media: '(max-width: 768px)', srcset: 'images/hero/b-m.webp 1x, images/hero/b.webp 2x' }),
    ];
    const picture = { matches: selector => selector === 'picture', querySelectorAll: () => sources };
    const hero = { ...attrs({ src: 'images/hero/b.webp' }), parentElement: picture };
    const doc = { querySelector: selector => selector === 'main .hero-illustration' ? hero : null };
    const page = runInContext('PageSwitch', context);
    const result = await page._preloadHero(doc);
    expect(created).toHaveLength(1);
    expect(result.srcset).toBe('images/hero/b-m.webp 1x, images/hero/b.webp 2x');
    expect(result.src).toBe('images/hero/b.webp');
    expect(page._preloadHero({ querySelector: () => null })).toBeNull();
});
