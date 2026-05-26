/**
 * app.js — 대한성공회 광명교회 (ES Module bootstrap)
 *
 * 렌더러는 renderers/*.js 로 분리되었음. 이 파일은 모든 렌더러를 import 해서
 * DOMContentLoaded 시 한 번씩 호출하고, 해시 스크롤 핸들러만 자체 보유한다.
 *
 * HTML 로드 순서:
 *   1. data.js (classic script)            → window.CHURCH_DATA, window.LiturgicalCalendar
 *   2. app.js  (script type="module")     → 본 파일, defer 동작
 */
import { NavRenderer }       from './renderers/nav.js';
import { FooterRenderer }    from './renderers/footer.js';
import { IndexRenderer }     from './renderers/index.js';
import { WorshipRenderer }   from './renderers/worship.js';
import { CommunityRenderer } from './renderers/community.js';
import { GivingRenderer }    from './renderers/giving.js';
import { VisitRenderer }     from './renderers/visit.js';
import { AnglicanRenderer, ClergyRenderer } from './renderers/clergy.js';
import { PressRenderer }     from './renderers/press.js';

const App = {
    init() {
        NavRenderer.render();
        FooterRenderer.render();
        IndexRenderer.render();
        WorshipRenderer.render();
        CommunityRenderer.render();
        GivingRenderer.render();
        VisitRenderer.render();
        AnglicanRenderer.render();
        ClergyRenderer.render();
        PressRenderer.render();
        this._handleHashScroll();
    },

    _scrollToHash(hash) {
        const el = document.querySelector(hash);
        if (!el) return;
        const navH = parseInt(getComputedStyle(document.documentElement)
            .getPropertyValue('--nav-h')) || 64;
        window.scrollTo({
            top: el.getBoundingClientRect().top + window.scrollY - navH - 16,
            behavior: 'smooth'
        });
    },

    _handleHashScroll() {
        const hash = window.location.hash;
        if (!hash) return;
        // Wait for Pretendard (CDN font) to finish loading so layout is stable
        const ready = (document.fonts && document.fonts.ready)
            ? document.fonts.ready
            : Promise.resolve();
        ready.then(() => requestAnimationFrame(() => this._scrollToHash(hash)));
    }
};

// Module scripts are deferred by default; DOMContentLoaded may already have fired
// by the time this executes, so guard for both cases.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}
// Handle same-page hash navigation (dropdown clicks while already on the page)
window.addEventListener('hashchange', () => App._scrollToHash(window.location.hash));
