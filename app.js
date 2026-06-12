/**
 * app.js — 대한성공회 광명교회
 *
 * SOLID 적용:
 *  S — 각 render* 메서드가 단일 책임
 *  O — NavRenderer / PageRenderer 확장 가능, 기존 코드 미수정
 *  L — 모든 렌더러는 동일 인터페이스(render) 준수
 *  I — 페이지별 필요한 렌더러만 호출
 *  D — App이 구체 DOM에 직접 의존하지 않고 ID 기반 접근
 */

/* ── 캔터베리 십자가 ─────────────────────────────────────────
 * 단일 소스: nav · footer · 로고 소개 · 지도 핀이 모두 이 경로를 공유.
 * 트럼펫형(오목) 4팔 + 계단형 중앙 사각 + 중앙 점(evenodd 구멍).
 * viewBox 0 0 64 64, 중심 32,32. 흰색 단색 마크로 다크 배경 위에서 사용. */
const CANTERBURY_CROSS_PATH = "M 25.6,23.2 C 25.4,14.56 22,8.22 20.8,4 Q 32,6.4 43.2,4 C 42,8.22 38.6,14.56 38.4,23.2 L 40.8,23.2 40.8,25.6 C 49.44,25.4 55.78,22 60,20.8 Q 57.6,32 60,43.2 C 55.78,42 49.44,38.6 40.8,38.4 L 40.8,40.8 38.4,40.8 C 38.6,49.44 42,55.78 43.2,60 Q 32,57.6 20.8,60 C 22,55.78 25.4,49.44 25.6,40.8 L 23.2,40.8 23.2,38.4 C 14.56,38.6 8.22,42 4,43.2 Q 6.4,32 4,20.8 C 8.22,22 14.56,25.4 23.2,25.6 L 23.2,23.2 25.6,23.2 Z M 28.9,32 a 3.1,3.1 0 1,0 6.2,0 a 3.1,3.1 0 1,0 -6.2,0 Z";

// 십자가 SVG 마크업 (fill 색 지정 가능)
function canterburyCrossSVG({ size = null, fill = '#ffffff', cls = '', label = null } = {}) {
    const dims = size ? ` width="${size}" height="${size}"` : '';
    const a11y = label ? ` role="img" aria-label="${label}"` : ' aria-hidden="true" focusable="false"';
    const klass = cls ? ` class="${cls}"` : '';
    return `<svg viewBox="0 0 64 64"${dims}${klass}${a11y}><path d="${CANTERBURY_CROSS_PATH}" fill="${fill}" fill-rule="evenodd"/></svg>`;
}

/* ── Language manager ────────────────────────────────────── */
function _deepMerge(target, source) {
    if (!source) return target;
    Object.keys(source).forEach(key => {
        const sv = source[key], tv = target[key];
        if (sv !== null && typeof sv === 'object' && !Array.isArray(sv) &&
            tv !== null && typeof tv === 'object' && !Array.isArray(tv)) {
            _deepMerge(tv, sv);
        } else {
            target[key] = sv;
        }
    });
    return target;
}

const LangManager = {
    get() { return localStorage.getItem('gmchurch-lang') || 'ko'; },
    toggle() {
        localStorage.setItem('gmchurch-lang', this.get() === 'en' ? 'ko' : 'en');
        location.reload();
    },
    apply() {
        if (this.get() === 'en' && typeof CHURCH_DATA_EN !== 'undefined') {
            _deepMerge(CHURCH_DATA, CHURCH_DATA_EN);
        }
    }
};

LangManager.apply();

/* ── MapHelper ───────────────────────────────────────────── */
const MapHelper = {
    // 네이버/카카오 iframe은 X-Frame-Options로 임베드 차단 → Google Maps output=embed 사용.
    // API 키 불필요, 다크/라이트·모바일/PC 모두 정상 동작.
    // q= 에 도로명 주소 문자열을 사용: Google 지오코딩이 한국 도로명 주소로 정확한 위치 핀 지정.
    naverUrl:  "https://map.naver.com/p/search/%EB%8C%80%ED%95%9C%EC%84%B1%EA%B3%B5%ED%9A%8C%20%EA%B4%91%EB%AA%85%EA%B5%90%ED%9A%8C",
    kakaoUrl:  "https://map.kakao.com/link/search/%EB%8C%80%ED%95%9C%EC%84%B1%EA%B3%B5%ED%9A%8C%20%EA%B4%91%EB%AA%85%EA%B5%90%ED%9A%8C",

    _embedSrc() {
        const addr = encodeURIComponent(CHURCH_DATA.info.address);
        return `https://www.google.com/maps?q=${addr}&z=17&hl=ko&output=embed`;
    },

    copyAddr(btn) {
        const addr = btn.dataset.copy;
        if (!addr) return;
        navigator.clipboard.writeText(addr).then(() => {
            const prev = btn.textContent;
            btn.textContent = '✓';
            setTimeout(() => { btn.textContent = prev; }, 1800);
        }).catch(() => {});
    },

    html(compact = false) {
        const addr = CHURCH_DATA.info.address;
        const jibun = CHURCH_DATA.info.addressJibun;
        const ui = CHURCH_DATA.ui.map;
        return `
            <div class="map-card${compact ? ' map-card--compact' : ''}">
                <div class="map-preview">
                    <iframe class="map-embed" src="${this._embedSrc()}" title="${ui.iframeTitle}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
                </div>
                <div class="map-card-addr">
                    <div class="map-addr-row">
                        <span class="map-addr-tag">${ui.roadLabel}</span>
                        <span class="map-addr-text">${addr}</span>
                        <button class="map-copy-btn" data-copy="${addr}" aria-label="${ui.roadLabel} 주소 복사">${ui.copyLabel}</button>
                    </div>
                    <div class="map-addr-row">
                        <span class="map-addr-tag">${ui.jibunLabel}</span>
                        <span class="map-addr-text">${jibun}</span>
                    </div>
                </div>
                <div class="map-actions">
                    <a href="${this.naverUrl}" target="_blank" rel="noopener" class="map-btn map-btn--naver">
                        <span class="map-btn-mark">N</span>
                        <span class="map-btn-label">${ui.naverLabel}</span>
                        <span class="map-btn-arrow" aria-hidden="true">→</span>
                    </a>
                    <a href="${this.kakaoUrl}" target="_blank" rel="noopener" class="map-btn map-btn--kakao">
                        <span class="map-btn-mark map-btn-mark--kakao">K</span>
                        <span class="map-btn-label">${ui.kakaoLabel}</span>
                        <span class="map-btn-arrow" aria-hidden="true">→</span>
                    </a>
                </div>
            </div>
        `;
    }
};

/* ── NavRenderer ─────────────────────────────────────────── */
const NavRenderer = {
    _currentPage() {
        const path = window.location.pathname.split('/').pop();
        return path === '' ? 'index.html' : path;
    },

    render() {
        const nav = document.getElementById('main-nav');
        if (!nav) return;

        const currentPage = this._currentPage();
        const currentHash = window.location.hash.replace('#', '');

        // active 우선순위: 페이지+해시 완전 일치 > 하위 메뉴 hash 일치 > 해시 없는 페이지 일치(fallback)
        const activeHref = this._resolveActiveHref(currentPage, currentHash);

        const uiNav = CHURCH_DATA.ui.nav;
        const items = CHURCH_DATA.navigation.map(item => {
            const isActive = item.href === activeHref;
            return `
            <li class="nav-item has-dropdown">
                <a href="${item.href}" class="nav-link${isActive ? ' active' : ''}"${isActive ? ' aria-current="page"' : ''}>${item.label}</a>
                <button class="nav-chevron" aria-label="${item.label}${uiNav.subMenuSuffix}" aria-expanded="false">
                    <svg viewBox="0 0 10 6" width="10" height="6" aria-hidden="true"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                <ul class="dropdown">
                    ${item.items.map(sub =>
                        `<li><a href="${sub.href}">${sub.label}${sub.badge ? ` <span class="nav-badge">${sub.badge}</span>` : ''}</a></li>`
                    ).join('')}
                </ul>
            </li>
        `;
        }).join('');

        nav.innerHTML = `
            <div class="container nav-inner">
                <a href="index.html" class="nav-logo">
                    <span class="nav-logo-mark" aria-hidden="true">
                        ${canterburyCrossSVG()}
                    </span>
                    <span class="nav-logo-text">
                        <span class="nav-logo-name">${CHURCH_DATA.info.name}</span>
                        <span class="nav-logo-sub">${CHURCH_DATA.info.subName}</span>
                    </span>
                </a>
                <ul class="nav-menu" id="nav-menu">${items}</ul>
                <div class="nav-actions">
                    <button class="nav-lang-btn" id="nav-lang-btn" aria-label="${uiNav.langBtnLabel}" onclick="LangManager.toggle()">${uiNav.langBtn}</button>
                    <button class="nav-menu-trigger" id="nav-menu-trigger" aria-label="${uiNav.searchLabel}" aria-haspopup="dialog">
                        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm0-2a9 9 0 0 1 6.32 15.4l4.14 4.13-1.42 1.42-4.13-4.14A9 9 0 1 1 11 2z" fill="currentColor"/></svg>
                    </button>
                    <button class="nav-toggle" id="nav-toggle" aria-label="${uiNav.toggleLabel}" aria-expanded="false">
                        <span></span><span></span><span></span>
                    </button>
                </div>
            </div>
        `;

        this._bindEvents();
    },

    _bindEvents() {
        const header = document.querySelector('.nav-header');
        const toggle = document.getElementById('nav-toggle');
        const menu   = document.getElementById('nav-menu');
        if (!toggle || !menu) return;

        const closeMenu = () => {
            menu.classList.remove('open');
            toggle.setAttribute('aria-expanded', false);
            menu.querySelectorAll('.nav-item.mobile-open').forEach(item => {
                item.classList.remove('mobile-open');
                const btn = item.querySelector('.nav-chevron');
                if (btn) btn.setAttribute('aria-expanded', false);
            });
        };

        if (header) {
            window.addEventListener('scroll', () => {
                header.classList.toggle('scrolled', window.scrollY > 50);
            }, { passive: true });
        }

        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            if (menu.classList.contains('open')) {
                closeMenu();
            } else {
                menu.classList.add('open');
                toggle.setAttribute('aria-expanded', true);
            }
        });

        menu.querySelectorAll('.nav-chevron').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const item = btn.closest('.nav-item');
                const isOpen = item.classList.toggle('mobile-open');
                btn.setAttribute('aria-expanded', isOpen);
                menu.querySelectorAll('.nav-item').forEach(other => {
                    if (other !== item) {
                        other.classList.remove('mobile-open');
                        const otherBtn = other.querySelector('.nav-chevron');
                        if (otherBtn) otherBtn.setAttribute('aria-expanded', false);
                    }
                });
            });
        });

        const handleAnchorClick = (e, a) => {
            const href = a.getAttribute('href') || '';
            closeMenu();
            if (!href.includes('#')) return;
            const [page, hash] = href.split('#');
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            const samePage = (page === '' || page === currentPage);
            if (samePage && hash) {
                e.preventDefault();
                if (window.location.hash !== '#' + hash) {
                    history.pushState(null, '', '#' + hash);
                }
                NavRenderer._updateActive();
                App._scrollToHash('#' + hash);
            }
        };

        menu.querySelectorAll('.nav-link').forEach(a => {
            a.addEventListener('click', (e) => handleAnchorClick(e, a));
        });

        menu.querySelectorAll('.dropdown a').forEach(a => {
            a.addEventListener('click', (e) => handleAnchorClick(e, a));
        });

        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && !toggle.contains(e.target)) {
                closeMenu();
            }
        });

        // hashchange(브라우저 뒤로/앞으로)에서도 active 갱신
        window.addEventListener('hashchange', () => NavRenderer._updateActive());
    },

    // active href 결정: top-level 완전 일치 > 하위 메뉴 hash 일치 > page-only fallback > 하위 페이지 일치
    _resolveActiveHref(currentPage, currentHash) {
        let fallback = null;
        let subPageFallback = null;
        for (const item of CHURCH_DATA.navigation) {
            const [itemPage, itemHash] = item.href.split('#');
            if (itemPage === currentPage) {
                if (itemHash && itemHash === currentHash) return item.href;
                if (currentHash && item.items) {
                    const subMatch = item.items.some(sub => sub.href.split('#')[1] === currentHash);
                    if (subMatch) return item.href;
                }
                if (!itemHash && !fallback) fallback = item.href;
            } else if (!subPageFallback && item.items) {
                // 하위 메뉴에 현재 페이지가 있으면 상위 메뉴를 active로
                const subPageMatch = item.items.some(sub => sub.href.split('#')[0] === currentPage);
                if (subPageMatch) subPageFallback = item.href;
            }
        }
        return fallback || subPageFallback;
    },

    // nav 전체 재렌더 없이 active 클래스만 갱신
    _updateActive() {
        const currentPage = this._currentPage();
        const currentHash = window.location.hash.replace('#', '');
        const activeHref = this._resolveActiveHref(currentPage, currentHash);
        document.querySelectorAll('#nav-menu .nav-link').forEach(a => {
            const isActive = a.getAttribute('href') === activeHref;
            a.classList.toggle('active', isActive);
            if (isActive) a.setAttribute('aria-current', 'page');
            else a.removeAttribute('aria-current');
        });
    }
};

/* ── FooterRenderer ──────────────────────────────────────── */
const FooterRenderer = {
    render() {
        const footer = document.getElementById('main-footer');
        if (!footer) return;
        const { info, clergy, sns, worship, navigation } = CHURCH_DATA;
        const uiF = CHURCH_DATA.ui.footer;
        const services = worship.main;
        const resources = worship.resources || [];
        const worshipNavLabel = (navigation.find(n => n.href === 'worship.html') || {}).label || '예배와 기도';
        footer.innerHTML = `
            <div class="container">
                <div class="footer-inner">
                    <div class="footer-col">
                        <div class="footer-brand">
                            <span class="footer-logo-mark" aria-hidden="true">
                                ${canterburyCrossSVG({ size: 26 })}
                            </span>
                            <div>
                                <strong class="footer-brand-name">${info.name}</strong>
                                <span class="footer-brand-sub">${info.subName}</span>
                            </div>
                        </div>
                        <p class="footer-brand-slogan">"${info.slogan}"</p>
                        <p class="footer-brand-meta">${uiF.established} ${info.established}<br>${clergy[0].name} ${clergy[0].title.split('·')[0].trim()}</p>
                    </div>
                    <div class="footer-col">
                        <h4>${worshipNavLabel}</h4>
                        ${services.map(s => `
                        <div class="footer-service-row">
                            <span class="footer-service-label">${s.title}</span>
                            <span class="footer-service-time">${s.time.replace(uiF.timePrefix, '')}</span>
                        </div>`).join('')}
                        <div class="footer-info-row footer-info-row--first">
                            <span class="footer-info-label">${uiF.address}</span>
                            <a href="${MapHelper.naverUrl}" target="_blank" rel="noopener" class="footer-info-link footer-addr-link">${info.addressShort}</a>
                        </div>
                        <div class="footer-info-row">
                            <span class="footer-info-label">${uiF.phone}</span>
                            <a href="tel:${info.phone}" class="footer-info-link footer-addr-link">${info.phone}</a>
                        </div>
                    </div>
                    <div class="footer-col">
                        <h4>${uiF.resourcesHeading}</h4>
                        <a href="sundays.html#lectionary" class="footer-ext-link">${uiF.lectionaryLink}</a>
                        ${resources.map(r => `<a href="${r.url}" target="_blank" rel="noopener" class="footer-ext-link">${r.title}</a>`).join('')}
                    </div>
                    <div class="footer-col">
                        <h4>${uiF.channelsHeading}</h4>
                        <a href="${sns.youtube}"           target="_blank" rel="noopener" class="footer-ext-link">${uiF.youtube}</a>
                        <a href="${sns.instagram}"         target="_blank" rel="noopener" class="footer-ext-link">${uiF.instagram}</a>
                        <a href="${sns['naver blog']}"     target="_blank" rel="noopener" class="footer-ext-link">${uiF.naverBlog}</a>
                        <a href="${sns.diocesan}"          target="_blank" rel="noopener" class="footer-ext-link footer-ext-link--dim">${uiF.diocesan}</a>
                    </div>
                </div>
                <div class="footer-bottom">
                    <span>© ${new Date().getFullYear()} ${info.name}</span>
                    <nav class="footer-bottom-links" aria-label="하단 안내">
                        <a href="giving.html" class="footer-privacy-link">${uiF.giving}</a>
                        <a href="clergy.html#logo-intro" class="footer-privacy-link">${uiF.logoIntro}</a>
                        <a href="clergy.html#press" class="footer-privacy-link">${uiF.press}</a>
                        <a href="privacy.html" class="footer-privacy-link">${uiF.privacy}</a>
                    </nav>
                </div>
            </div>
        `;
    }
};

/* ── IndexRenderer ───────────────────────────────────────── */
const IndexRenderer = {
    render() {
        this._hero();
        this._about();
        this._worship();
        this._visit();
    },

    _hero() {
        const { name, slogan, vision, established } = CHURCH_DATA.info;

        const label = document.getElementById('hero-label');
        const title = document.getElementById('hero-title');
        const sub   = document.getElementById('hero-sub');
        const acts  = document.getElementById('hero-actions');
        const stats = document.getElementById('hero-stats');

        if (label) label.textContent = name;
        if (title) title.textContent = slogan;
        if (sub)   sub.textContent   = vision;

        const uiI = CHURCH_DATA.ui.index;
        if (acts) acts.innerHTML = `
            <a href="newcomer.html" class="btn-hero-primary">${uiI.btnNewcomer}</a>
            <a href="worship.html" class="btn-outline">${uiI.btnWorship}</a>
        `;

        // 설립 연도만 추출 ("1990년 2월 11일" → "1990")
        const foundedYear = (established.match(/\d{4}/) || [established])[0];
        if (stats) stats.innerHTML = `
            <a href="clergy.html#identity" class="hero-stat hero-stat--link"><span class="hero-stat-val">${foundedYear}</span><span class="hero-stat-lbl">${uiI.statFounded}</span></a>
            <span class="hero-stat-divider" aria-hidden="true"></span>
            <a href="worship.html" class="hero-stat hero-stat--link"><span class="hero-stat-val">${uiI.statSundayTime}</span><span class="hero-stat-lbl">${uiI.statSunday}</span></a>
            <span class="hero-stat-divider" aria-hidden="true"></span>
            <a href="visit.html" class="hero-stat hero-stat--link"><span class="hero-stat-val">${uiI.statLocationName}</span><span class="hero-stat-lbl">${uiI.statLocation}</span></a>
        `;
    },

    _about() {
        const el = document.getElementById('about-brief-content');
        if (!el) return;
        const { name, established, diocese, aboutLead, aboutDesc, award } = CHURCH_DATA.info;
        el.innerHTML = `
            <div class="about-brief">
                ${award ? `
                <a href="${award.href}" class="about-brief-award">
                    <span class="about-brief-award-icon" aria-hidden="true">🌿</span>
                    <span class="about-brief-award-body">
                        <strong>${award.year} ${award.title}</strong>
                        <span>${award.org}</span>
                    </span>
                    <span class="about-brief-award-arrow" aria-hidden="true">→</span>
                </a>` : ''}
                <p class="about-brief-lead">${aboutLead}</p>
                <p class="about-brief-desc">${aboutDesc}</p>
                <ul class="about-brief-facts">
                    <li><strong>${uiI.aboutName}</strong><span>${name}</span></li>
                    <li><strong>${uiI.aboutFounded}</strong><span>${established}</span></li>
                    <li><strong>${uiI.aboutDiocese}</strong><span>${diocese}</span></li>
                </ul>
                <a href="clergy.html" class="about-brief-link">${uiI.aboutLink}</a>
            </div>
        `;
    },

    _worship() {
        const el = document.getElementById('worship-grid');
        if (!el) return;
        el.innerHTML = CHURCH_DATA.worship.main.map(w => `
            <div class="card">
                <h3>${w.title}</h3>
                <p class="card-time">${w.time}</p>
                <p class="card-desc">${w.desc}</p>
            </div>
        `).join('');
        const guide = document.getElementById('worship-guide');
        if (guide) {
            if (CHURCH_DATA.worship.guide) {
                guide.innerHTML = `<p>${CHURCH_DATA.worship.guide}</p>`;
            } else {
                guide.hidden = true;
            }
        }
    },

    _visit() {
        const locationEl = document.getElementById('location-card');
        if (!locationEl) return;
        const { phone } = CHURCH_DATA.info;
        locationEl.innerHTML = `
            <h3>${uiI.visitTitle}</h3>
            ${MapHelper.html(true)}
            <div class="info-row"><strong>${uiI.visitPhone}</strong><span><a href="tel:${phone}" class="link-plain">${phone}</a></span></div>
            <p class="visit-detail-wrap">
                <a href="visit.html" class="detail-link">${uiI.visitDetailLink}</a>
            </p>
        `;
    }
};

/* ── WorshipRenderer ─────────────────────────────────────── */
const WorshipRenderer = {
    render() {
        const servicesEl  = document.getElementById('worship-services');
        const eucharistEl = document.getElementById('worship-eucharist');
        const resourcesEl = document.getElementById('worship-resources');
        const prayerEl    = document.getElementById('worship-prayer');
        if (!servicesEl && !eucharistEl && !resourcesEl && !prayerEl) return;
        const w = CHURCH_DATA.worship;
        if (servicesEl)  servicesEl.innerHTML  = this._services(w);
        if (eucharistEl) eucharistEl.innerHTML = this._eucharist(w);
        if (resourcesEl) resourcesEl.innerHTML = this._resources(w);
        if (prayerEl)    prayerEl.innerHTML    = this._prayer(w);
    },

    _services({ main, guide, liturgicalSeason: s }) {
        return `
            <div class="worship-services-grid grid">
                ${main.map(w => `
                    <div class="info-card" id="${w.id}">
                        <h3>${w.title}</h3>
                        <div class="info-row">
                            <strong>${CHURCH_DATA.ui.worship.timeLabel}</strong>
                            <span class="worship-time">${w.time}</span>
                        </div>
                        <p class="worship-card-desc">${w.desc}</p>
                        ${w.verse ? `
                        <blockquote class="liturgy-inner-quote worship-card-quote">
                            "${w.verse}"<br><cite class="worship-card-cite">— ${w.verseRef}</cite>
                        </blockquote>
                        <p class="worship-card-detail">${w.detail}</p>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
            ${guide ? `<div class="guide-banner"><p>${guide}</p></div>` : ''}
            <div class="liturgy-guide">
                <div class="liturgy-season-badge">
                    <span class="season-dot"></span>
                    ${s.symbol}&nbsp;${s.name}&nbsp;·&nbsp;<span class="season-name">${s.colorName}</span>
                    <span class="season-note">${s.note}</span>
                </div>
            </div>
        `;
    },

    _eucharist({ eucharistIntro, eucharistIntroQuote, eucharistOrder }) {
        const uiW = CHURCH_DATA.ui.worship;
        return `
            <div class="liturgy-guide">
                <div class="liturgy-section">
                    <p class="section-eyebrow">Eucharist</p>
                    <h2 class="section-title">${uiW.eucharistTitle}</h2>
                    <p class="liturgy-body">${eucharistIntro}</p>
                    <blockquote class="liturgy-inner-quote">${eucharistIntroQuote}</blockquote>
                </div>
                <div class="liturgy-section">
                    <p class="section-eyebrow">Order of Service</p>
                    <h2 class="section-title">${uiW.eucharistOrderTitle}</h2>
                    <p class="liturgy-body liturgy-body--lead">${uiW.eucharistOrderLead}</p>
                    <div class="liturgy-steps">
                        ${eucharistOrder.map((step, i) => `
                            <div class="liturgy-step">
                                <div class="step-num">${i + 1}</div>
                                <div class="step-body">
                                    <h4 class="step-title">${step.title}</h4>
                                    <ul class="step-list">
                                        ${step.items.map(item => `<li>${item}</li>`).join('')}
                                    </ul>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    _resources({ resources }) {
        if (!resources || !resources.length) return '';
        const uiW = CHURCH_DATA.ui.worship;
        return `
            <div class="liturgy-guide">
                <div class="liturgy-section">
                    <p class="section-eyebrow">Worship Resources</p>
                    <h2 class="section-title">${uiW.resourcesTitle}</h2>
                    <p class="liturgy-body liturgy-body--lead">${uiW.resourcesLead}</p>
                    <div class="resource-grid">
                        ${resources.map(r => `
                            <a class="resource-card" href="${r.url}" target="_blank" rel="noopener noreferrer">
                                <span class="resource-icon" aria-hidden="true">${r.icon}</span>
                                <h3 class="resource-title">${r.title}</h3>
                                <p class="resource-desc">${r.desc}</p>
                                <span class="resource-link">${uiW.resourcesLink} <span aria-hidden="true">↗</span></span>
                            </a>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    _prayer({ prayer }) {
        if (!prayer) return '';
        const uiW = CHURCH_DATA.ui.worship;
        return `
            <div class="liturgy-guide">
                <div class="liturgy-section">
                    <p class="section-eyebrow">DIVINE OFFICE</p>
                    <h2 class="section-title">${uiW.dailyOfficeTitle}</h2>
                    ${(prayer.dailyOfficeIntro || []).map((p, i) => `
                        <p class="liturgy-body${i === prayer.dailyOfficeIntro.length - 1 ? ' liturgy-body--lead' : ''}">${p}</p>
                    `).join('')}
                    <div class="resource-grid">
                        ${prayer.dailyOffice.map(o => `
                            <a class="resource-card" href="${o.url}" target="_blank" rel="noopener noreferrer">
                                <span class="resource-icon" aria-hidden="true">${o.icon}</span>
                                <h3 class="resource-title">${o.title}</h3>
                                <p class="resource-desc resource-en">${o.en}</p>
                                <p class="resource-desc">${o.desc}</p>
                                <span class="resource-link">${uiW.openLink} <span aria-hidden="true">↗</span></span>
                            </a>
                        `).join('')}
                    </div>
                </div>
                <div class="liturgy-section" id="intercession">
                    <p class="section-eyebrow">Anglican Cycle of Prayer</p>
                    <h2 class="section-title">${uiW.intercessionTitle}</h2>
                    <p class="liturgy-body liturgy-body--lead">${uiW.intercessionLead}</p>
                    <div class="resource-grid resource-grid--single">
                        <a class="resource-card" href="${prayer.intercession.url}" target="_blank" rel="noopener noreferrer">
                            <span class="resource-icon" aria-hidden="true">${prayer.intercession.icon}</span>
                            <h3 class="resource-title">${prayer.intercession.title}</h3>
                            <p class="resource-desc resource-en">${prayer.intercession.en}</p>
                            <p class="resource-desc">${prayer.intercession.desc}</p>
                            <span class="resource-link">${uiW.intercessionPdfLink} <span aria-hidden="true">↗</span></span>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }
};

/* ── NewcomerRenderer (처음 오신 분 — newcomer.html) ─────────── */
const NewcomerRenderer = {
    render() {
        const el = document.getElementById('newcomer-full');
        if (!el) return;
        const { liturgicalSeason: s, spaceGuide } = CHURCH_DATA.worship;
        const { info, clergy } = CHURCH_DATA;
        const primary = clergy[0] || {};

        const uiN = CHURCH_DATA.ui.newcomer;
        el.innerHTML = `
            <div class="liturgy-guide" id="newcomer">

                <div class="newcomer-intro">
                    <h2 class="newcomer-intro-title">${uiN.welcomeTitle}</h2>
                    <p class="newcomer-intro-body">${uiN.welcomeBody}</p>
                    <div class="newcomer-key-facts">
                        <div class="newcomer-key-row">
                            <span class="newcomer-key-label">${uiN.keyWorship}</span>
                            <span class="newcomer-key-value">${uiN.keyWorshipValue}</span>
                        </div>
                        <div class="newcomer-key-row">
                            <span class="newcomer-key-label">${uiN.keyLocation}</span>
                            <span class="newcomer-key-value">${info.name} (${info.subName})<br>${info.addressShort}</span>
                        </div>
                        <div class="newcomer-key-row">
                            <span class="newcomer-key-label">${uiN.keyDuration}</span>
                            <span class="newcomer-key-value">${uiN.keyDurationValue}</span>
                        </div>
                    </div>
                </div>

                <div class="liturgy-section" id="firsttime">
                    <p class="section-eyebrow">First Visit</p>
                    <h2 class="section-title">${uiN.firstVisitTitle || '참여 안내'}</h2>
                    <p class="liturgy-body" style="margin-bottom:1rem;">${uiN.firstVisitLead}</p>
                    <div class="liturgy-checklist">
                        ${uiN.firstVisitItems.map(item => `<div class="checklist-item"><span class="check-icon">✓</span><p>${item}</p></div>`).join('')}
                    </div>
                </div>

                <div class="liturgy-section" id="liturgy">
                    <p class="section-eyebrow">Anglican Liturgy</p>
                    <h2 class="section-title">${uiN.liturgyTitle || '성공회 전례란?'}</h2>
                    <p class="liturgy-body">${uiN.liturgyIntro1}</p>
                    <p class="liturgy-body">${uiN.liturgyIntro2}</p>
                    <div class="liturgy-card">
                        <h3 class="liturgy-card-title">${uiN.liturgyCardTitle}</h3>
                        <p class="liturgy-body">${uiN.liturgyCardBody}</p>
                        <ul class="liturgy-list">
                            ${uiN.liturgyCardItems.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                </div>

                ${spaceGuide && spaceGuide.items && spaceGuide.items.length ? `
                <div class="liturgy-section" id="worship-space">
                    <p class="section-eyebrow">Inside the Church</p>
                    <h2 class="section-title">${uiN.spaceTitle || '전례 공간 안내'}</h2>
                    <p class="liturgy-body" style="margin-bottom:1.5rem;">${spaceGuide.intro}</p>
                    <div class="space-grid">
                        ${spaceGuide.items.map(item => `
                            <div class="space-item">
                                <span class="space-icon" aria-hidden="true">${item.icon}</span>
                                <div class="space-text">
                                    <h3 class="space-name">${item.name} <span class="space-en">${item.en}</span></h3>
                                    <p class="space-desc">${item.desc}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                <div class="liturgy-section" id="communion">
                    <p class="section-eyebrow">Holy Communion</p>
                    <h2 class="section-title">${uiN.communionTitle || '영성체 안내'}</h2>
                    <div class="communion-grid">
                        <div class="communion-card communion-season">
                            <h3>${uiN.communionBaptizedTitle}</h3>
                            <p class="liturgy-body">${uiN.communionBaptizedBody}</p>
                            <ul class="liturgy-list">
                                ${uiN.communionBaptizedItems.map(item => `<li>${item}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="communion-card" style="border-top-color:var(--green-mid); background:var(--green-light);">
                            <h3>${uiN.communionUnbaptizedTitle}</h3>
                            <p class="liturgy-body">${uiN.communionUnbaptizedBody}</p>
                            <ul class="liturgy-list">
                                ${uiN.communionUnbaptizedItems.map(item => `<li>${item}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="newcomer-cta" id="contact">
                    <h3>${uiN.contactTitle}</h3>
                    <p>${uiN.contactBody}</p>
                    <div class="newcomer-cta-actions">
                        ${primary.contact ? `<a href="mailto:${primary.contact}" class="newcomer-cta-link"><span aria-hidden="true">✉️</span> ${primary.name} ${uiN.contactEmailSuffix}</a>` : ''}
                        <a href="tel:${info.phone}" class="newcomer-cta-link"><span aria-hidden="true">📞</span> ${uiN.contactOffice} ${info.phone}</a>
                    </div>
                </div>
            </div>
        `;
    }
};

/* ── CommunityRenderer ───────────────────────────────────── */
const CommunityRenderer = {
    render() {
        const el = document.getElementById('community-full');
        if (!el) return;
        el.innerHTML = `
            <div class="grid">
                ${CHURCH_DATA.community.groups.map(g => `
                    <div class="card" id="${g.id}" style="text-align:center;">
                        <div class="card-icon">${g.icon}</div>
                        <h3>${g.title}</h3>
                        <p style="color:var(--text-muted); font-size:0.9rem;">${g.desc}</p>
                        ${g.note ? `<p style="font-size:0.9rem; color:var(--text-muted); margin-top:0.5rem;">${g.note}</p>` : ''}
                        ${g.footnote ? `<p class="community-card-note">${g.footnote}</p>` : ''}
                        ${g.detailUrl ? `<a href="${g.detailUrl}" class="community-detail-link"><span>${CHURCH_DATA.ui.community.detailLink}</span><span aria-hidden="true">→</span></a>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }
};

/* ── SmallGroupRenderer ──────────────────────────────────── */
const SmallGroupRenderer = {
    render() {
        const el = document.getElementById('smallgroup-full');
        if (!el) return;
        const { smallgroups } = CHURCH_DATA.community;
        if (!smallgroups) return;
        el.innerHTML = `
            <div class="liturgy-guide">
                <div class="liturgy-section">
                    <p class="liturgy-body">${smallgroups.intro}</p>
                </div>
                ${smallgroups.groups.map(g => `
                <div class="liturgy-section" id="${g.id}">
                    <div class="info-card info-card--wide">
                        <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:1rem;">
                            <span style="font-size:2rem;" aria-hidden="true">${g.icon}</span>
                            <div>
                                <p class="section-eyebrow" style="margin-bottom:0.2rem;">${g.en}</p>
                                <h2 style="margin:0; font-size:1.25rem;">${g.title}</h2>
                            </div>
                        </div>
                        <div class="info-row" style="margin-bottom:1.25rem;">
                            <strong>${CHURCH_DATA.ui.smallgroup.scheduleLabel}</strong>
                            <span style="color:var(--green-mid); font-weight:600;">${g.schedule}</span>
                        </div>
                        <p style="color:var(--text-muted); font-size:0.92rem; line-height:1.9; margin-bottom:1.25rem;">${g.desc}</p>
                        ${g.details && g.details.length ? `
                        <ul style="margin:0; padding-left:1.2rem; color:var(--text-muted); font-size:0.9rem; line-height:2;">
                            ${g.details.map(d => `<li>${d}</li>`).join('')}
                        </ul>` : ''}
                    </div>
                </div>
                `).join('')}
            </div>
        `;
    }
};

/* ── GivingRenderer ──────────────────────────────────────── */
const GivingRenderer = {
    render() {
        const el = document.getElementById('giving-full');
        if (!el) return;
        const { bankName, bank, holder, report, receiptInfo } = CHURCH_DATA.giving;

        const uiG = CHURCH_DATA.ui.giving;
        el.innerHTML = `
            <div class="info-card" id="offering" style="max-width:640px; margin:0 auto;">
                <h3>${uiG.accountTitle}</h3>
                <div class="bank-card">
                    <p style="font-size:0.8rem; color:var(--green-mid); margin-bottom:0.3rem;">${bankName}</p>
                    <p class="account">${bank}</p>
                    <p class="sub">${uiG.holderPrefix}${holder}</p>
                </div>
                <p style="font-size:0.88rem; color:var(--text-muted); line-height:1.8;" id="report">${report}</p>
                ${receiptInfo ? `<p style="margin-top:0.8rem; font-size:0.88rem; color:var(--text-muted); line-height:1.8; padding-top:0.8rem; border-top:1px solid var(--border);">${receiptInfo.replace(/\. (?=\S)/g, '.<br>')}</p>` : ''}
            </div>
        `;
    }
};

/* ── VisitRenderer ───────────────────────────────────────── */
const VisitRenderer = {
    render() {
        const el = document.getElementById('visit-full');
        if (!el) return;
        const { address, addressJibun, postalCode, phone, fax } = CHURCH_DATA.info;
        const uiV = CHURCH_DATA.ui.visit;

        el.innerHTML = `
            <div class="info-card info-card--wide" id="location">
                <h3>${uiV.addressTitle}</h3>
                ${MapHelper.html(false)}
                <div class="visit-contact">
                    <div class="info-row"><strong>${uiV.postalLabel}</strong><span>${postalCode}</span></div>
                    <div class="info-row"><strong>${uiV.phoneLabel}</strong><span><a href="tel:${phone}" class="link-plain">${phone}</a></span></div>
                    <div class="info-row"><strong>${uiV.faxLabel}</strong><span>${fax}</span></div>
                </div>
            </div>
            <div class="info-card info-card--wide" id="parking">
                <h3>${uiV.trafficTitle}</h3>
                <div class="info-row">
                    <strong>${uiV.carLabel}</strong>
                    <span>${uiV.carDesc}</span>
                </div>
                <div class="info-row">
                    <strong>${uiV.busLabel}</strong>
                    <span>
                        ${uiV.busStop}
                        <span class="bus-list">
                            <span class="bus-chip bus-blue">505</span>
                            <span class="bus-chip bus-green">5627</span>
                            <span class="bus-chip bus-green">5633</span>
                            <span class="bus-chip bus-green">6637</span>
                        </span>
                        <span class="bus-note">${uiV.busNote}</span>
                    </span>
                </div>
                <div class="info-row">
                    <strong>${uiV.parkingLabel}</strong>
                    <span>${uiV.parkingDesc1}<a href="tel:${phone}" class="link-plain">${phone}</a>${uiV.parkingDesc2}</span>
                </div>
                <p class="visit-note">${uiV.mapNote}</p>
            </div>
        `;
    }
};

/* ── LinksRenderer ───────────────────────────────────────── */
const LinksRenderer = {
    render() {
        const el = document.getElementById('links-full');
        if (!el) return;
        el.innerHTML = CHURCH_DATA.links.groups.map(group => `
            <div class="links-group">
                <h2 class="links-group-title">${group.title}</h2>
                <div class="links-grid">
                    ${group.items.map(item => `
                        <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="links-card">
                            <span class="links-card-name">${item.name}</span>
                            <span class="links-card-desc">${item.desc}</span>
                            <span class="links-card-arrow" aria-hidden="true">↗</span>
                        </a>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }
};

/* ── AnglicanRenderer ────────────────────────────────────── */
const AnglicanRenderer = {
    render() {
        this._welcome();
        this._what();
        this._korea();
    },

    _welcome() {
        const el = document.getElementById('anglican-welcome-banner');
        if (!el || !CHURCH_DATA.anglican) return;
        el.innerHTML = `
            <div class="anglican-welcome">
                <div class="container">
                    <p>${CHURCH_DATA.anglican.welcome}</p>
                </div>
            </div>
        `;
    },

    _what() {
        const el = document.getElementById('anglican-what');
        if (!el || !CHURCH_DATA.anglican) return;
        const { what } = CHURCH_DATA.anglican;
        const m = what.mission;
        el.innerHTML = `
            <div class="section-header">
                <p class="section-eyebrow">${what.eyebrow}</p>
                <h2 class="section-title">${what.title}</h2>
            </div>
            <div class="anglican-body">
                ${what.paras.map(p => `<p class="anglican-para">${p}</p>`).join('')}
            </div>
            <div class="anglican-pillars">
                ${what.pillars.map(p => `
                    <div class="anglican-pillar">
                        <div class="anglican-pillar-icon">${p.icon}</div>
                        <h4 class="anglican-pillar-title">${p.title}</h4>
                        <p class="anglican-pillar-desc">${p.desc}</p>
                    </div>
                `).join('')}
            </div>
            <p class="anglican-pillar-note">${what.pillarNote}</p>

            ${m ? `
            <div style="margin-top:3rem; padding-top:2.5rem; border-top:1px solid var(--border);">
                <div class="section-header" style="margin-bottom:1.5rem;">
                    <p class="section-eyebrow">${m.eyebrow}</p>
                    <h2 class="section-title" style="font-size:1.4rem;">${m.title}</h2>
                    <p class="section-sub" style="font-style:italic; color:var(--text-muted);">${m.intro}</p>
                </div>
                <div class="mission-marks">
                    ${m.marks.map(mk => `
                        <div class="mission-mark">
                            <span class="mission-mark__num">${mk.num}</span>
                            <div class="mission-mark__body">
                                <h4 class="mission-mark__title">${mk.ko}</h4>
                                <p class="mission-mark__en">${mk.en}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <p class="anglican-pillar-note" style="margin-top:1.5rem;">${m.note}</p>
            </div>
            ` : ''}
        `;
    },

    _korea() {
        const el = document.getElementById('anglican-korea');
        if (!el || !CHURCH_DATA.anglican) return;
        const { korea } = CHURCH_DATA.anglican;
        const iona = korea.ionaLink;
        el.innerHTML = `
            <div class="anglican-korea-inner">
                <div class="anglican-korea-text">
                    <div class="section-header" style="margin-bottom:2rem;">
                        <p class="section-eyebrow">${korea.eyebrow}</p>
                        <h2 class="section-title">${korea.title}</h2>
                    </div>
                    ${korea.paras.map(p => `<p class="anglican-para">${p}</p>`).join('')}
                    ${iona ? `
                    <a href="${iona.url}" target="_blank" rel="noopener noreferrer"
                       class="iona-link-card">
                        <span style="font-size:1.2rem;" aria-hidden="true">⛵</span>
                        <span class="iona-link-card__text">
                            <span class="iona-link-card__label">${iona.label}</span>
                            <span class="iona-link-card__desc">${iona.desc}</span>
                        </span>
                        <span class="iona-link-card__arrow" aria-hidden="true">↗</span>
                    </a>
                    ` : ''}
                    ${korea.incheonLink ? `
                    <a href="${korea.incheonLink.url}" target="_blank" rel="noopener noreferrer"
                       class="iona-link-card">
                        <span style="font-size:1.2rem;" aria-hidden="true">⛪</span>
                        <span class="iona-link-card__text">
                            <span class="iona-link-card__label">${korea.incheonLink.label}</span>
                            <span class="iona-link-card__desc">${korea.incheonLink.desc}</span>
                        </span>
                        <span class="iona-link-card__arrow" aria-hidden="true">↗</span>
                    </a>
                    ` : ''}
                    ${korea.cathedralLink ? `
                    <a href="${korea.cathedralLink.url}" target="_blank" rel="noopener noreferrer"
                       class="iona-link-card">
                        <span style="font-size:1.2rem;" aria-hidden="true">🕊️</span>
                        <span class="iona-link-card__text">
                            <span class="iona-link-card__label">${korea.cathedralLink.label}</span>
                            <span class="iona-link-card__desc">${korea.cathedralLink.desc}</span>
                        </span>
                        <span class="iona-link-card__arrow" aria-hidden="true">↗</span>
                    </a>
                    ` : ''}
                </div>
                <div class="anglican-korea-side">
                    <div class="founded-badge">
                        <span class="founded-year">${korea.founded}</span>
                        <span class="founded-label">${CHURCH_DATA.ui.clergy.foundedLabel}</span>
                    </div>
                    <ul class="korea-highlights">
                        ${korea.highlights.map(h => `
                            <li class="korea-highlight-item">
                                <span class="korea-hl-icon">${h.icon}</span>
                                <span>${h.text}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        `;
    }
};

/* ── ClergyRenderer ──────────────────────────────────────── */
const ClergyRenderer = {
    render() {
        this._clergy();
        this._philosophy();
        this._logo();
    },

    _logo() {
        const el = document.getElementById('logo-content');
        if (!el || !CHURCH_DATA.logo) return;
        const { eyebrow, title, subtitle, desc, colors, history, elements, refs } = CHURCH_DATA.logo;

        const elementsHtml = elements ? `
            <div class="logo-elements">
                ${elements.map(e => `
                    <div class="logo-element-item">
                        <p class="logo-element-label">${e.label}</p>
                        <p class="logo-element-desc">${e.desc}</p>
                    </div>`).join('')}
            </div>` : '';

        const refsHtml = refs && refs.length ? `
            <ol class="logo-refs">
                ${refs.map((r, i) => `<li class="logo-ref-item"><span class="logo-ref-num" aria-hidden="true">${i + 1}</span><span class="logo-ref-text">${r}</span></li>`).join('')}
            </ol>` : '';

        el.innerHTML = `
            <div class="section-header">
                <p class="section-eyebrow">${eyebrow}</p>
                <h2 class="section-title">${title}</h2>
            </div>
            <div class="logo-intro-grid">
                <div class="logo-display">
                    <div class="logo-badge">
                        <svg viewBox="0 0 64 64" role="img" aria-label="캔터베리 십자가">
                            <path d="${CANTERBURY_CROSS_PATH}" fill="#ffffff" fill-rule="evenodd"/>
                        </svg>
                    </div>
                    <p class="logo-subtitle">${subtitle}</p>
                    <p class="logo-colors">${colors}</p>
                </div>
                <div class="logo-meaning">
                    <p class="logo-desc">${desc}</p>
                    ${history ? `<p class="logo-history">${history}</p>` : ''}
                    ${elementsHtml}
                </div>
            </div>
            ${refsHtml}
        `;
    },

    _clergy() {
        const el = document.getElementById('clergy-full');
        if (!el) return;
        const bishop = CHURCH_DATA.bishop;
        const uiC = CHURCH_DATA.ui.clergy;
        const bishopHtml = bishop ? `
            <div class="bishop-card">
                <p class="bishop-eyebrow">Diocese of Seoul</p>
                <div class="bishop-card-inner">
                    ${bishop.photo
                        ? `<div class="bishop-portrait-wrap"><img src="${bishop.photo}" alt="${bishop.name}${uiC.bishopSuffix} 초상" class="bishop-portrait" loading="lazy"></div>`
                        : `<div class="bishop-portrait-wrap bishop-portrait-fallback" aria-hidden="true">🏛</div>`}
                    <div class="bishop-card-body">
                        <p class="bishop-name">${bishop.name}${uiC.bishopSuffix}</p>
                        <p class="bishop-title">${bishop.title}</p>
                        ${bishop.ordained ? `<p class="bishop-ordained">${bishop.ordained}</p>` : ''}
                        <p class="bishop-desc">${bishop.desc}</p>
                        ${bishop.note ? `<p class="bishop-note">${bishop.note}</p>` : ''}
                    </div>
                </div>
            </div>
        ` : '';
        const cats = CHURCH_DATA.ministerSection.categories;
        let firstPriestRendered = false;
        el.innerHTML = bishopHtml + cats.map(cat => {
            const members = CHURCH_DATA.clergy.filter(c => c.category === cat.id);
            const membersHtml = members.length > 0
                ? members.map(c => {
                    const isFirstPriest = !firstPriestRendered && cat.id === '성직자';
                    if (isFirstPriest) firstPriestRendered = true;
                    return `
                    <div class="clergy-card" ${isFirstPriest ? 'id="priest"' : ''}>
                        <div class="clergy-avatar${c.photo ? '' : ' clergy-avatar--fallback'}">
                            ${c.photo
                                ? `<img src="${c.photo}" alt="${c.name}${uiC.priestSuffix}" loading="lazy" class="clergy-avatar-img">`
                                : '<span aria-hidden="true">✝️</span>'}
                        </div>
                        <div>
                            <div class="clergy-name">${c.name}${uiC.priestSuffix}</div>
                            <div class="clergy-title">${c.title}</div>
                            ${c.ordained ? `<div style="font-size:0.78rem; color:var(--text-muted); margin-top:0.2rem;">${c.ordained}</div>` : ''}
                            ${c.quote ? `<div class="quote-block"><p>"${c.quote}"</p></div>` : ''}
                            <p class="clergy-desc">${c.desc}</p>
                            ${c.bio ? this._bioSection(c.bio) : ''}
                            ${c.contact ? (c.contact.includes('@')
                                ? `<p style="margin-top:1rem; font-size:0.83rem; color:var(--green-mid);">✉️ <a href="mailto:${c.contact}" style="color:inherit;">${c.contact}</a></p>`
                                : `<p style="margin-top:1rem; font-size:0.83rem; color:var(--green-mid);">📞 <a href="tel:${c.contact}" style="color:inherit;">${c.contact}</a></p>`) : ''}
                            ${c.kyoboUrl ? `<p style="margin-top:0.6rem; font-size:0.83rem;">📚 <a href="${c.kyoboUrl}" target="_blank" rel="noopener" style="color:var(--green-mid); font-weight:600;">저서 보기 (알라딘)</a></p>` : ''}
                            ${c.blogUrl ? `<p style="margin-top:0.4rem; font-size:0.83rem;">✍️ <a href="${c.blogUrl}" target="_blank" rel="noopener" style="color:var(--green-mid); font-weight:600;">블로그 (네이버)</a></p>` : ''}
                        </div>
                    </div>`;
                }).join('')
                : '';
            const officers = (CHURCH_DATA.officers || []).filter(o => o.category === cat.id);
            const officersHtml = officers.length > 0
                ? `<div class="officer-card">
                    <ul class="officer-list">
                        ${officers.map(o => `
                        <li class="officer-row">
                            <span class="officer-role">${o.role}</span>
                            <span class="officer-names">${o.members.join(', ')}</span>
                        </li>`).join('')}
                    </ul>
                </div>`
                : '';
            const bodyHtml = (membersHtml + officersHtml) || `<div class="minister-empty">${uiC.ministerEmpty}</div>`;
            return `
            <div class="minister-category">
                <h3 class="minister-cat-title">${cat.title}</h3>
                ${cat.note ? `<p class="minister-cat-note">${cat.note}</p>` : ''}
                ${bodyHtml}
            </div>`;
        }).join('');
    },

    _bioSection(bio) {
        const uiC = CHURCH_DATA.ui.clergy;
        const milestones = bio.milestones.map(m => `
            <li class="bio-milestone">
                <span class="bio-year">${m.year}</span>
                <span class="bio-dot"></span>
                <span class="bio-text">${m.text}${m.first ? ` <span class="bio-first">${uiC.bioFirst}</span>` : ''}</span>
            </li>
        `).join('');

        const roles = bio.roles.map(r =>
            `<span class="bio-role-tag">${r}</span>`
        ).join('');

        const externalRolesHtml = bio.externalRoles && bio.externalRoles.length > 0
            ? `<p class="bio-label" style="margin-top:1.5rem;">${uiC.bioExternal}</p>
               <div class="bio-roles">${bio.externalRoles.map(r => `<span class="bio-role-tag">${r}</span>`).join('')}</div>`
            : '';

        const sourceHtml = bio.source
            ? uiC.bioSourceFmt
                .replace('{author}', bio.source.author)
                .replace('{title}', bio.source.title)
                .replace('{publisher}', bio.source.publisher)
                .replace('{year}', bio.source.year)
            : '';

        return `
            <div class="bio-section">
                <p class="bio-label">${uiC.bioMilestones}</p>
                <ul class="bio-timeline">${milestones}</ul>
                <p class="bio-label" style="margin-top:1.5rem;">${uiC.bioRoles}</p>
                <div class="bio-roles">${roles}</div>
                ${externalRolesHtml}
                <div class="bio-ministry-note">
                    <span class="bio-ministry-icon">🕊</span>
                    <p>${bio.ministryNote}</p>
                </div>
                ${bio.source ? `
                <p class="bio-source">${uiC.bioSourcePrefix}${sourceHtml}</p>
                ` : ''}
            </div>
        `;
    },

    _philosophy() {
        const el = document.getElementById('philosophy-full');
        if (!el) return;
        const { intro, values, closing } = CHURCH_DATA.philosophy;
        const introHtml = intro ? `
            <div class="philosophy-intro">
                ${intro.map(p => `<p>${p}</p>`).join('')}
            </div>` : '';
        const closingHtml = closing ? `
            <div class="philosophy-closing">
                <p>${closing}</p>
            </div>` : '';
        el.innerHTML = `
            ${introHtml}
            <div class="values-grid">
                ${values.map(v => `
                    <div class="value-card">
                        <div class="val-icon">${v.icon}</div>
                        <h4>${v.title}</h4>
                        <p>${v.desc}</p>
                    </div>
                `).join('')}
            </div>
            ${closingHtml}
        `;
    }
};

/* ── MediaRenderer ───────────────────────────────────────── */
const MediaRenderer = {
    render() {
        const el = document.getElementById('media-full');
        if (!el || !CHURCH_DATA.media) return;
        const { intro, channelUrl, videos } = CHURCH_DATA.media;

        const uiM = CHURCH_DATA.ui.media;
        el.innerHTML = `
            <div class="section-header">
                <p class="section-eyebrow">YouTube</p>
                <h2 class="section-title">${uiM.videosTitle}</h2>
                <p class="section-sub">${intro}</p>
            </div>
            <div class="video-grid">
                ${videos.map(v => `
                    <a class="video-card" href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener noreferrer">
                        <div class="video-thumb">
                            <img src="https://img.youtube.com/vi/${v.id}/hqdefault.jpg" alt="${v.title}" loading="lazy" width="480" height="360">
                            <span class="video-play-btn" aria-hidden="true">▶</span>
                        </div>
                        <div class="video-info">
                            <span class="video-category">${v.category}</span>
                            <h3 class="video-title">${v.title}</h3>
                            <p class="video-desc">${v.desc}</p>
                        </div>
                    </a>
                `).join('')}
            </div>
            <div class="video-channel-cta">
                <a href="${channelUrl}" target="_blank" rel="noopener noreferrer" class="video-channel-link">
                    ${uiM.channelLink}
                </a>
            </div>
        `;
    }
};

/* ── PhotoGalleryRenderer ────────────────────────────────── */
const PhotoGalleryRenderer = {
    render() {
        const el = document.getElementById('gallery-full');
        if (!el || !CHURCH_DATA.photoGallery) return;
        const { intro, badge, note, categories, photos } = CHURCH_DATA.photoGallery;

        const uiGal = CHURCH_DATA.ui.gallery;
        el.innerHTML = `
            ${badge ? `
            <div class="draft-banner">
                <span class="draft-badge">${badge}</span>${note}
            </div>` : ''}
            <div class="section-header">
                <p class="section-eyebrow">Photo Gallery</p>
                <h2 class="section-title">${uiGal.galleryTitle}</h2>
                <p class="section-sub">${intro}</p>
            </div>
            <div class="photo-filters" role="group" aria-label="${uiGal.filterLabel}">
                ${categories.map((c, i) => `
                    <button class="photo-filter-btn${i === 0 ? ' is-active' : ''}"
                            data-filter="${c}" type="button">${c}</button>
                `).join('')}
            </div>
            <div class="photo-grid" id="photo-grid-items">
                ${photos.map(p => `
                    <button class="photo-item"
                            data-category="${p.category}"
                            data-src="${p.src}"
                            data-title="${p.title}"
                            data-desc="${p.desc}"
                            data-date="${p.date}"
                            type="button"
                            aria-label="${p.alt} ${uiGal.enlargeLabel}">
                        <img src="${p.thumb}" alt="${p.alt}" loading="lazy" width="480" height="320">
                        <div class="photo-overlay" aria-hidden="true">
                            <span class="photo-cat-badge">${p.category}</span>
                            <p class="photo-caption">${p.title}</p>
                            <p class="photo-date">${p.date}</p>
                        </div>
                    </button>
                `).join('')}
            </div>
            <p class="photo-count" id="photo-count-text">${uiGal.photoCount.replace('{n}', photos.length)}</p>
        `;

        const grid    = el.querySelector('#photo-grid-items');
        const countEl = el.querySelector('#photo-count-text');

        // 카테고리 필터
        el.querySelectorAll('.photo-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                el.querySelectorAll('.photo-filter-btn')
                  .forEach(b => b.classList.remove('is-active'));
                btn.classList.add('is-active');
                const filter = btn.dataset.filter;
                let shown = 0;
                grid.querySelectorAll('.photo-item').forEach(item => {
                    const match = filter === CHURCH_DATA.ui.gallery.filterAll || item.dataset.category === filter;
                    item.style.display = match ? '' : 'none';
                    if (match) shown++;
                });
                countEl.textContent = CHURCH_DATA.ui.gallery.photoCount.replace('{n}', shown);
            });
        });

        // 라이트박스
        const lb      = document.getElementById('gallery-lightbox');
        if (!lb) return;
        const lbImg   = lb.querySelector('.gallery-lb-img');
        const lbTitle = lb.querySelector('.gallery-lb-title');
        const lbDesc  = lb.querySelector('.gallery-lb-desc');
        const lbDate  = lb.querySelector('.gallery-lb-date');
        const lbClose = lb.querySelector('.gallery-lb-close');

        const openLb = item => {
            lbImg.src      = item.dataset.src;
            lbImg.alt      = item.querySelector('img').alt;
            lbTitle.textContent = item.dataset.title;
            lbDesc.textContent  = item.dataset.desc;
            lbDate.textContent  = item.dataset.date;
            lb.classList.add('is-open');
            document.body.style.overflow = 'hidden';
            lbClose.focus();
        };
        const closeLb = () => {
            lb.classList.remove('is-open');
            document.body.style.overflow = '';
        };

        grid.addEventListener('click', e => {
            const item = e.target.closest('.photo-item');
            if (item) openLb(item);
        });
        lbClose.addEventListener('click', closeLb);
        lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && lb.classList.contains('is-open')) closeLb();
        });
    }
};

/* ── PressRenderer ───────────────────────────────────────── */
const PressRenderer = {
    render() {
        const el = document.getElementById('press-table');
        if (!el || !CHURCH_DATA.press) return;

        const groups = [];
        const seen = {};
        CHURCH_DATA.press.forEach(p => {
            const cat = p.category || '기타';
            if (!seen[cat]) { seen[cat] = []; groups.push({ cat, items: seen[cat] }); }
            seen[cat].push(p);
        });

        el.innerHTML = groups.map(g => `
            <div class="press-category">
                <h3 class="press-category-title">${g.cat}</h3>
                <ul class="press-list">
                    ${g.items.map(p => `
                        <li class="press-item">
                            <span class="press-year">${p.year}</span>
                            <div class="press-main">
                                <a href="${p.url}" target="_blank" rel="noopener" class="press-link">${p.title}</a>
                                <span class="press-meta">${p.media} · ${p.date}</span>
                            </div>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `).join('');
    }
};

/* ── FaqRenderer ─────────────────────────────────────────── */
const FaqRenderer = {
    render() {
        const el = document.getElementById('faq-full');
        if (!el || !CHURCH_DATA.faq) return;
        const faq = CHURCH_DATA.faq;

        const refsHtml = (refs) => (refs && refs.length)
            ? `<p class="faq-refs"><span class="faq-refs-label">${CHURCH_DATA.ui.faq.refsLabel}</span>${refs.map(r =>
                  `<a href="${r.url}" target="_blank" rel="noopener noreferrer" class="faq-ref">${r.label} <span aria-hidden="true">↗</span></a>`
              ).join('')}</p>`
            : '';

        const catsHtml = faq.categories.map(cat => `
            <section class="faq-cat" aria-labelledby="faqcat-${cat.id}">
                <h2 class="faq-cat-title" id="faqcat-${cat.id}">
                    <span class="faq-cat-icon" aria-hidden="true">${cat.icon || ''}</span>${cat.title}
                </h2>
                <div class="faq-list">
                    ${cat.items.map(item => `
                        <details class="faq-item">
                            <summary class="faq-q">
                                <span class="faq-q-text">${item.q}</span>
                                <span class="faq-q-mark" aria-hidden="true"></span>
                            </summary>
                            <div class="faq-a">
                                ${(item.a || '').split('\n\n').map((para, i) =>
                                    `<p class="${i === 0 ? 'faq-a-lead' : 'faq-a-text'}">${para}</p>`
                                ).join('')}
                                ${refsHtml(item.refs)}
                            </div>
                        </details>
                    `).join('')}
                </div>
            </section>
        `).join('');

        el.innerHTML = `
            ${faq.note ? `<div class="guide-banner"><p>${faq.note}</p></div>` : ''}
            ${faq.lead ? `<p class="faq-lead">${faq.lead}</p>` : ''}
            ${catsHtml}
        `;
    }
};

/* ── ScrollReveal ────────────────────────────────────────── */
const ScrollReveal = {
    init() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        if (!window.IntersectionObserver) return;

        // Single-block targets: section headers and feature blocks
        [
            '.section-header',
            '.about-brief',
            '.guide-banner',
            '.story-lead',
            '.newcomer-cta',
            '.liturgy-inner-quote',
            '.next-step-cta',
        ].forEach(sel => {
            document.querySelectorAll(sel).forEach(el => el.classList.add('reveal'));
        });

        // Staggered containers — each child animates in sequence
        [
            { sel: '.section .grid',  step: 0.07 },
            { sel: '.story-values',   step: 0.06 },
            { sel: '.anglican-pillars', step: 0.08 },
            { sel: '.mission-marks',  step: 0.07 },
            { sel: '.liturgy-steps',  step: 0.07 },
            { sel: '.resource-grid',  step: 0.07 },
        ].forEach(({ sel, step }) => {
            document.querySelectorAll(sel).forEach(container => {
                Array.from(container.children).forEach((child, i) => {
                    child.classList.add('reveal');
                    child.style.transitionDelay = `${i * step}s`;
                });
            });
        });

        // Standalone info-cards not inside a grid
        document.querySelectorAll('.info-card').forEach(el => {
            if (!el.closest('.grid')) el.classList.add('reveal');
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }
};

/* ── ScrollProgress ──────────────────────────────────── */
const ScrollProgress = {
    init() {
        const bar = document.createElement('div');
        bar.id = 'scroll-progress-bar';
        bar.setAttribute('aria-hidden', 'true');
        document.body.prepend(bar);

        let rafId = null;
        const update = () => {
            rafId = null;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const pct = docHeight > 0 ? window.scrollY / docHeight : 0;
            bar.style.transform = `scaleX(${pct})`;
        };
        const onScroll = () => {
            if (!rafId) rafId = requestAnimationFrame(update);
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        update();
    }
};

/* ── Portrait Lightbox ───────────────────────────────────── */
const PortraitLightbox = {
    init() {
        const overlay = document.createElement('div');
        overlay.id = 'portrait-lightbox';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-label', CHURCH_DATA.ui.global.portraitLabel);
        const img = document.createElement('img');
        img.id = 'portrait-lightbox-img';
        overlay.appendChild(img);
        document.body.appendChild(overlay);

        const open = (src, alt) => {
            img.src = src;
            img.alt = alt;
            overlay.classList.add('is-open');
            document.body.style.overflow = 'hidden';
        };
        const close = () => {
            overlay.classList.remove('is-open');
            document.body.style.overflow = '';
        };

        overlay.addEventListener('click', close);
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') close();
        });

        document.addEventListener('click', e => {
            const el = e.target.closest('.clergy-avatar-img, .bishop-portrait');
            if (el && el.tagName === 'IMG') {
                open(el.src, el.alt);
            }
        });
    }
};

/* ── BulletinRenderer ────────────────────────────────────── */
const BulletinRenderer = {
    render() {
        const el = document.getElementById('bulletin-full');
        if (!el) return;
        const { note, items } = CHURCH_DATA.bulletins;

        const uiB = CHURCH_DATA.ui.bulletin;
        if (!items || items.length === 0) {
            el.innerHTML = `<p class="bulletin-notice-sub">${uiB.emptyMsg}</p>`;
            return;
        }

        const rows = items.map(b => {
            const hasFile = b.file && b.file.trim();
            if (hasFile) {
                return `
                <a href="${b.file}" target="_blank" rel="noopener noreferrer" class="bulletin-row" aria-label="${b.label}">
                    <span class="bulletin-icon" aria-hidden="true">📋</span>
                    <span class="bulletin-date">${b.label}</span>
                    <span class="bulletin-season">${b.season}</span>
                    <span class="bulletin-dl">${uiB.pdfLink}</span>
                </a>`;
            }
            return `
                <div class="bulletin-row bulletin-row--empty" aria-label="${b.label}">
                    <span class="bulletin-icon" aria-hidden="true">📋</span>
                    <span class="bulletin-date">${b.label}</span>
                    <span class="bulletin-season">${b.season}</span>
                    <span class="bulletin-dl bulletin-dl--pending">${uiB.pending}</span>
                </div>`;
        }).join('');

        el.innerHTML = `
            <div class="bulletin-list" role="list">
                ${rows}
            </div>
        `;
    }
};

/* ── SundaysRenderer ─────────────────────────────────────── */
const SundaysRenderer = {
    render() {
        const currentEl    = document.getElementById('sundays-current');
        const lectionaryEl = document.getElementById('sundays-lectionary');
        const seasonsEl    = document.getElementById('sundays-seasons');
        const monthlyEl    = document.getElementById('sundays-monthly');
        const specialEl    = document.getElementById('sundays-special');
        if (!currentEl && !lectionaryEl && !seasonsEl && !monthlyEl && !specialEl) return;
        const d = CHURCH_DATA.sundays;
        if (!d) return;

        const cs = CHURCH_DATA.worship && CHURCH_DATA.worship.liturgicalSeason;

        const now  = new Date();
        const year = now.getFullYear();
        const mon  = now.getMonth();
        /* 교회력 연도 시작 연도: 대림절 전이면 전년도 대림절에서 시작 */
        const adventThisYear = LiturgicalCalendar.adventStart(year);
        const advYear = now < adventThisYear ? year - 1 : year;
        const yearDates  = this._computeDates(advYear);
        const specialMap = this._specialDates(year);

        if (currentEl) {
            currentEl.innerHTML = this._currentSeason(cs, yearDates, advYear);
            this._bindRibbonPopover(currentEl.querySelector('.season-ribbon-wrap'));
        }
        if (lectionaryEl) lectionaryEl.innerHTML = this._lectionary();
        if (seasonsEl)    seasonsEl.innerHTML  = this._seasons(d.seasons, cs, yearDates, advYear);
        if (monthlyEl) {
            this._calYear  = year;
            this._calMonth = mon;
            monthlyEl.innerHTML = this._monthlyFull(year, mon, specialMap);
            this._bindCalNav(monthlyEl);
        }
        if (specialEl)  specialEl.innerHTML = this._special(d.specialSundays);
    },

    /* 전례독서 — 날짜 비교로 이번 주·다가오는 주·지난 주 라벨을 동적 계산 */
    _lectionary() {
        const w = CHURCH_DATA.worship;
        const r = w && w.currentReadings;
        const n = w && w.nextReadings;

        // "YYYY년 M월 D일" 또는 영어 날짜 → 로컬 자정 Date
        const parseDate = s => {
            if (!s) return null;
            const m = s.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
            if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
            const d = new Date(s);
            return isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
        };
        // 오늘이 일요일이면 오늘, 아니면 이번 주 돌아오는 일요일(로컬 자정)
        const nextSunday = (() => {
            const t = new Date();
            const d = new Date(t.getFullYear(), t.getMonth(), t.getDate());
            const day = d.getDay();
            if (day !== 0) d.setDate(d.getDate() + (7 - day));
            return d;
        })();
        const uiS = CHURCH_DATA.ui.sundays;
        const lectionaryLabel = dateStr => {
            const rd = parseDate(dateStr);
            if (!rd) return '';
            const diff = rd - nextSunday;
            if (diff === 0) return uiS.thisWeek;
            return diff < 0 ? uiS.lastWeek : uiS.comingWeek;
        };

        const cardHtml = (data, label) => {
            const isCurrent = label === uiS.thisWeek;
            return `
            <div class="lectionary-card${isCurrent ? ' lectionary-card--current' : ''}">
                <div class="lectionary-card-head">
                    <p class="lectionary-card-label">${label}</p>
                    <p class="lectionary-card-week">${data.week}</p>
                    <p class="lectionary-card-meta">${data.year}&nbsp;·&nbsp;${data.date}</p>
                </div>
                <div class="lectionary-card-body">
                    ${data.items.map(item => `
                        <div class="lectionary-row">
                            <span class="lectionary-role">${item.role}</span>
                            <span class="lectionary-ref">${item.ref}</span>
                        </div>`).join('')}
                </div>
                ${data.note ? `<p class="lectionary-card-note">${data.note}</p>` : ''}
            </div>`;
        };

        // 이번 주 카드를 먼저 표시
        const cards = [r, n]
            .filter(Boolean)
            .map(d => ({ data: d, label: lectionaryLabel(d.date) }))
            .sort((a, b) => (a.label === uiS.thisWeek ? -1 : b.label === uiS.thisWeek ? 1 : 0));

        return `
            <div class="section-header">
                <p class="section-eyebrow">Lectionary</p>
                <h2 class="section-title">${uiS.lectionaryTitle}</h2>
                <p class="section-sub">${uiS.lectionarySub}</p>
            </div>
            ${cards.map(c => cardHtml(c.data, c.label)).join('')}`;
    },

    /* 이달의 교회력 — worship.html 용 헤더 포함 버전 */
    _monthlyFull(year, month, specialMap) {
        const uiS = CHURCH_DATA.ui.sundays;
        return `
            <div class="section-header">
                <p class="section-eyebrow">Monthly Calendar</p>
                <h2 class="section-title">${uiS.monthlyTitle}</h2>
                <p class="section-sub">${uiS.monthlySub}</p>
            </div>
            <div class="lit-cal-wrap">${this._monthlyGrid(year, month, specialMap)}</div>`;
    },

    /* 교회력 연도 시작 연도(advYear)를 기준으로 이동 절기 날짜 계산 */
    _computeDates(advYear) {
        const uiS    = CHURCH_DATA.ui.sundays;
        const locale = uiS.calLocale;
        const sep    = uiS.calRangeSep;
        const ny     = advYear + 1;
        const easter   = LiturgicalCalendar.easterDate(ny);
        const add      = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
        const fmt      = d => d.toLocaleDateString(locale, { month: 'long', day: 'numeric' });
        const fmtYM    = (y, d) => d.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
        const ashWed    = add(easter, -46);
        const palmSun   = add(easter, -7);
        const pentecost = add(easter, 49);
        const advent     = LiturgicalCalendar.adventStart(advYear);
        const nextAdvent = LiturgicalCalendar.adventStart(ny);
        const dec24  = new Date(advYear, 11, 24);
        const dec25  = new Date(advYear, 11, 25);
        const jan5   = new Date(ny, 0, 5);
        const jan6   = new Date(ny, 0, 6);
        return {
            advent:    `${fmtYM(advYear, advent)}${sep}${fmt(dec24)}`,
            christmas: `${fmtYM(advYear, dec25)}${sep}${fmtYM(ny, jan5)}`,
            epiphany:  `${fmtYM(ny, jan6)}${sep}${fmtYM(ny, add(ashWed, -1))}`,
            lent:      `${fmtYM(ny, ashWed)}${sep}${fmtYM(ny, add(palmSun, -1))}`,
            holyweek:  `${fmtYM(ny, palmSun)}${sep}${fmtYM(ny, add(easter, -1))}`,
            easter:    `${fmtYM(ny, easter)}${sep}${fmtYM(ny, add(pentecost, -1))}`,
            pentecost: fmtYM(ny, pentecost),
            ordinary:  `${fmtYM(ny, add(pentecost, 1))}${sep}${fmtYM(ny, add(nextAdvent, -1))}`
        };
    },

    /* 연도별 특별 주일·축일 날짜 → {YYYY-MM-DD: label} */
    _specialDates(year) {
        const easter    = LiturgicalCalendar.easterDate(year);
        const add       = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
        const pentecost = add(easter, 49);
        const advent    = LiturgicalCalendar.adventStart(year);
        const key       = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        /* n번째 weekday: month=0-based, wd=0(일)~6(토), n=1~ */
        const nthWd     = (y, m, wd, n) => {
            const first = new Date(y, m, 1);
            const off   = (7 + wd - first.getDay()) % 7;
            return new Date(y, m, 1 + off + (n - 1) * 7);
        };
        /* 가장 가까운 일요일 */
        const nearSun   = d => { const wd = d.getDay(); return wd <= 3 ? add(d, -wd) : add(d, 7 - wd); };
        /* 기준일 당일 또는 그 이후 첫 일요일 */
        const sunOnAfter = d => add(d, (7 - d.getDay()) % 7);

        const sd = CHURCH_DATA.ui.sundays.specialDays;
        const map = {};
        const set = (d, label) => { map[key(d)] = label; };

        set(new Date(year, 0, 6),   sd.epiphany);
        set(nthWd(year, 2, 5, 1),   sd.worldDayOfPrayer);
        set(add(easter, -7),         sd.palmSunday);
        set(easter,                  sd.easterSunday);
        set(add(easter, 42),         sd.ascensionSunday);
        set(add(pentecost, 7),       sd.trinitySunday);
        set(nthWd(year, 5, 0, 1),   sd.environmentSunday);
        let d = nthWd(year, 8, 0, 1);
        while (d <= new Date(year, 9, 4)) { set(d, sd.seasonOfCreation); d = add(d, 7); }
        set(sunOnAfter(new Date(year, 9, 30)), sd.allSaints);
        set(add(advent, -7),         sd.christTheKing);
        set(nearSun(new Date(year, 11, 1)), sd.worldAids);

        return map;
    },

    /* 현재 절기 강조: 전례력 색 리본 + 현재 절기 카드 */
    _currentSeason(cs, dates, advYear) {
        if (!cs) return '';
        const range = dates[cs.key] || '';
        return `
            <div class="container season-ribbon-wrap" style="padding-top:1.75rem;">
                ${this._ribbon(cs)}
            </div>
            <div class="container" style="padding-top:1.25rem; padding-bottom:0;">
                <div class="sundays-season-hero">
                    <p class="section-eyebrow" style="margin-bottom:0.4rem;">${CHURCH_DATA.ui.sundays.currentSeasonLabel} — ${cs.dateLabel}</p>
                    <p style="font-size:1.45rem; font-weight:700; color:var(--heading); margin:0 0 0.3rem;">${cs.symbol} ${cs.name}</p>
                    <p style="font-size:0.92rem; color:var(--text-muted);">${cs.note}</p>
                    ${range ? `<p style="font-size:0.83rem; color:var(--text-muted); margin-top:0.75rem; padding-top:0.65rem; border-top:1px solid var(--border);">${advYear}-${advYear + 1} ${CHURCH_DATA.ui.sundays.churchYearLabel} &nbsp;·&nbsp; ${range}</p>` : ''}
                </div>
            </div>`;
    },

    /* 전례력 색 리본 — 8개 절기 색을 교회력 순서로 띠처럼 펼치고, 현재 절기를 도드라지게 */
    _ribbon(cs) {
        const seasons = (CHURCH_DATA.sundays && CHURCH_DATA.sundays.seasons) || [];
        if (!seasons.length) return '';
        const curKey = cs.key;
        const uiS = CHURCH_DATA.ui.sundays;
        const segs = seasons.map(s => {
            const on = s.key === curKey;
            return `<button class="season-ribbon-seg${on ? ' is-current' : ''}" style="--seg:${s.color};" data-season-key="${s.key}" aria-label="${s.name} ${uiS.seasonAriaLabel}" aria-expanded="false">${on ? `<span class="season-ribbon-mark" aria-hidden="true">${s.symbol}</span>` : ''}</button>`;
        }).join('');
        return `
            <div class="season-ribbon" aria-label="${uiS.ribbonAriaPrefix}${cs.name}">${segs}</div>
            <p class="season-ribbon-cap">${uiS.ribbonCaption} <strong>${cs.symbol} ${cs.name}</strong></p>
            <div class="season-pop" role="tooltip" hidden></div>`;
    },

    _bindRibbonPopover(wrap) {
        if (!wrap) return;
        const pop = wrap.querySelector('.season-pop');
        if (!pop) return;
        const seasons = (CHURCH_DATA.sundays && CHURCH_DATA.sundays.seasons) || [];
        const seasonMap = Object.fromEntries(seasons.map(s => [s.key, s]));
        let activeKey = null;

        const close = () => {
            pop.hidden = true;
            activeKey = null;
            wrap.querySelectorAll('.season-ribbon-seg').forEach(b => b.setAttribute('aria-expanded', 'false'));
        };

        wrap.addEventListener('click', e => {
            const btn = e.target.closest('.season-ribbon-seg');
            if (!btn) { close(); return; }
            const key = btn.dataset.seasonKey;
            if (key === activeKey) { close(); return; }
            const s = seasonMap[key];
            if (!s) { close(); return; }
            activeKey = key;
            wrap.querySelectorAll('.season-ribbon-seg').forEach(b => b.setAttribute('aria-expanded', 'false'));
            btn.setAttribute('aria-expanded', 'true');
            pop.innerHTML = `
                <div class="season-pop-bar" style="background:${s.color};"></div>
                <p class="season-pop-title">${s.symbol} ${s.name}<span class="season-pop-en">${s.en}</span></p>
                <p class="season-pop-meta">${CHURCH_DATA.ui.sundays.seasonColorLabel} · ${s.colorName}</p>
                <p class="season-pop-period">📅 ${s.period}</p>
                <p class="season-pop-desc">${s.desc}</p>`;
            pop.hidden = false;
        });

        document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
        document.addEventListener('click', e => { if (!wrap.contains(e.target)) close(); }, { capture: true });
    },

    /* 월간 달력 — 정적 헤더 + 동적 그리드 래퍼 */
    _monthly(year, month, specialMap) {
        const uiS = CHURCH_DATA.ui.sundays;
        return `
            <div class="section-header">
                <p class="section-eyebrow">Monthly Calendar</p>
                <h2 class="section-title">${uiS.monthlyTitle}</h2>
                <p class="section-sub">${uiS.monthlySub2}</p>
            </div>
            <div class="lit-cal-wrap">${this._monthlyGrid(year, month, specialMap)}</div>`;
    },

    /* 달력 그리드 — 전/다음 달 이동 시 이 부분만 교체 */
    _monthlyGrid(year, month, specialMap) {
        const today      = new Date();
        const todayDate  = (today.getFullYear() === year && today.getMonth() === month) ? today.getDate() : -1;
        const uiS = CHURCH_DATA.ui.sundays;
        const monthLabel = new Date(year, month).toLocaleDateString(uiS.calLocale, { year: 'numeric', month: 'long' });
        const daysInMon  = new Date(year, month + 1, 0).getDate();
        const firstWd    = new Date(year, month, 1).getDay();
        const key        = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        const monthSeason = LiturgicalCalendar.compute(new Date(year, month, 1));
        const seasonLabel = monthSeason ? `${monthSeason.symbol} ${monthSeason.name}` : '';

        const cells = [];
        for (let i = 0; i < firstWd; i++) {
            cells.push('<div class="lit-cal-cell lit-cal-cell--empty"></div>');
        }
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        for (let n = 1; n <= daysInMon; n++) {
            const date    = new Date(year, month, n);
            const isSun   = date.getDay() === 0;
            const isToday = n === todayDate;
            const isPast  = date < todayStart;
            const special = specialMap[key(date)];
            const season  = LiturgicalCalendar.compute(date);
            const alpha   = isSun ? '2e' : '12';
            let cls = 'lit-cal-cell';
            if (isSun)   cls += ' lit-cal-cell--sun';
            if (isToday) cls += ' lit-cal-cell--today';
            if (isPast)  cls += ' lit-cal-cell--past';
            const aria = special
                ? ` aria-label="${n}일 ${special}" title="${special}"`
                : ` aria-label="${n}일"`;
            cells.push(`
                <div class="${cls}" style="background:${season.color}${alpha};"${aria}>
                    <span class="lit-cal-num">${n}</span>
                    ${special ? `<span class="lit-cal-label">${special}</span>` : ''}
                </div>`);
        }

        return `
            <div class="lit-cal">
                <div class="lit-cal-hd">
                    <div class="lit-cal-hd-nav">
                        <button class="lit-cal-nav" data-cal-dir="-1" aria-label="${uiS.prevMonth}">&#9664;</button>
                        <span class="lit-cal-hd-month">${monthLabel}</span>
                        <button class="lit-cal-nav" data-cal-dir="1" aria-label="${uiS.nextMonth}">&#9654;</button>
                    </div>
                    <span class="lit-cal-hd-season">${seasonLabel}</span>
                </div>
                <div class="lit-cal-wds">
                    ${uiS.weekdays.map(d => `<span>${d}</span>`).join('')}
                </div>
                <div class="lit-cal-grid">${cells.join('')}</div>
            </div>
            <ul class="lit-cal-legend" aria-label="달력 보는 법">
                <li data-cal-today role="button" tabindex="0" title="이번 달로 이동"><span class="lit-cal-legend-dot lit-cal-legend-dot--today" aria-hidden="true"></span>${uiS.legendToday}</li>
                <li><span class="lit-cal-legend-dot lit-cal-legend-dot--sun" aria-hidden="true"></span>${uiS.legendSunday}</li>
                <li><span class="lit-cal-legend-tag" aria-hidden="true">이름</span>${uiS.legendSpecial}</li>
            </ul>`;
    },

    /* 전/다음 달 이동 + 오늘 복귀 — 이벤트 위임으로 re-render 없이 그리드만 교체 */
    _bindCalNav(container) {
        const goToMonth = (y, m) => {
            this._calYear  = y;
            this._calMonth = m;
            const wrap = container.querySelector('.lit-cal-wrap');
            if (wrap) wrap.innerHTML = this._monthlyGrid(y, m, this._specialDates(y));
        };
        container.addEventListener('click', e => {
            if (e.target.closest('[data-cal-today]')) {
                const now = new Date();
                goToMonth(now.getFullYear(), now.getMonth());
                return;
            }
            const btn = e.target.closest('[data-cal-dir]');
            if (!btn) return;
            const dir = parseInt(btn.dataset.calDir, 10);
            let m = this._calMonth + dir;
            let y = this._calYear;
            if (m > 11) { m = 0; y++; }
            if (m < 0)  { m = 11; y--; }
            goToMonth(y, m);
        });
        container.addEventListener('keydown', e => {
            if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('[data-cal-today]')) {
                e.preventDefault();
                const now = new Date();
                goToMonth(now.getFullYear(), now.getMonth());
            }
        });
    },

    /* 교회력 절기 카드 그리드 — 대림절을 시작으로 시간순 배열 */
    _seasons(seasons, cs, dates, advYear) {
        const uiS = CHURCH_DATA.ui.sundays;
        const cards = seasons.map((s, i) => {
            const isCurrent = cs && cs.key === s.key;
            const range = dates[s.key];
            return `
                <div class="resource-card" style="border-top-color:${s.color};${isCurrent ? ' box-shadow:0 0 0 2px ' + s.color + ';' : ''}">
                    <span class="lit-seq" style="border-color:${s.color};" aria-hidden="true">${i + 1}</span>
                    <span class="resource-icon" aria-hidden="true">${s.symbol}</span>
                    <p class="resource-title">${s.name}<span class="resource-desc" style="font-weight:400; margin:0 0 0 0.4em;">${s.en}</span></p>
                    <p class="resource-desc" style="margin-bottom:0.35rem;">${uiS.seasonColorLabel} · ${s.colorName}</p>
                    ${range ? `<p class="resource-desc" style="font-weight:600; color:var(--text); margin-bottom:0.4rem;">📅 ${range}</p>` : ''}
                    <p class="resource-desc">${s.desc}</p>
                    ${isCurrent ? `<p class="lit-current-tag">${uiS.seasonCurrentTag}</p>` : ''}
                </div>`;
        }).join('');
        return `
            <div class="section-header">
                <p class="section-eyebrow">Liturgical Year</p>
                <h2 class="section-title">${uiS.seasonsTitle}</h2>
                <p class="section-sub">${uiS.seasonsSub}</p>
            </div>
            <div class="resource-grid">${cards}</div>`;
    },

    /* 특별 주일 카드 그리드 */
    _special(sundays) {
        const cards = sundays.map(s => `
            <div class="info-card">
                <p style="font-size:0.78rem; font-weight:700; letter-spacing:0.05em; color:var(--green-mid); text-transform:uppercase; margin-bottom:0.35rem;">${s.origin}</p>
                <h3 style="font-size:1rem; font-weight:700; margin-bottom:0.2rem;">${s.name}</h3>
                <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:0.75rem;">${s.en} &middot; ${s.date}</p>
                <p style="font-size:0.9rem; color:var(--text); line-height:1.7;">${s.desc}</p>
            </div>`).join('');
        const uiS = CHURCH_DATA.ui.sundays;
        return `
            <div class="section-header">
                <p class="section-eyebrow">Special Sundays</p>
                <h2 class="section-title">${uiS.specialTitle}</h2>
                <p class="section-sub">${uiS.specialSub}</p>
            </div>
            <div class="grid">${cards}</div>`;
    }
};

/* ── App bootstrap ───────────────────────────────────────── */
const App = {
    init() {
        /* 사이트 대표 테마(--theme)는 녹색 고정(:root 기본값 사용). 절기색(--season)만
           전례 요소(절기 페이지 리본·달력·전례 안내 배지 등)에 주입한다. */
        const cs = CHURCH_DATA.worship && CHURCH_DATA.worship.liturgicalSeason;
        if (cs) {
            const r = document.documentElement.style;
            r.setProperty('--season',       cs.color);
            r.setProperty('--season-light', cs.colorLight);
        }

        NavRenderer.render();
        FooterRenderer.render();
        IndexRenderer.render();
        WorshipRenderer.render();
        NewcomerRenderer.render();
        CommunityRenderer.render();
        SmallGroupRenderer.render();
        GivingRenderer.render();
        VisitRenderer.render();
        AnglicanRenderer.render();
        ClergyRenderer.render();
        PressRenderer.render();
        FaqRenderer.render();
        MediaRenderer.render();
        PhotoGalleryRenderer.render();
        LinksRenderer.render();
        BulletinRenderer.render();
        SundaysRenderer.render();
        this._handleHashScroll();
        ScrollReveal.init();
        ScrollProgress.init();
        BackToTop.init();
        PortraitLightbox.init();
        MenuOverlay.init();
        document.addEventListener('click', e => {
            if (e.target.matches('.map-copy-btn')) MapHelper.copyAddr(e.target);
        });
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

window.addEventListener('DOMContentLoaded', () => {
    App.init();
    // Handle same-page hash navigation (dropdown clicks while already on the page)
    window.addEventListener('hashchange', () => App._scrollToHash(window.location.hash));
});

/* ── BackToTop ────────────────────────────────────────── */
const BackToTop = {
    init() {
        const btn = document.createElement('button');
        btn.id = 'back-to-top';
        btn.setAttribute('aria-label', CHURCH_DATA.ui.global.backToTopLabel);
        btn.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>`;
        document.body.appendChild(btn);

        btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

        let rafId = null;
        const check = () => {
            rafId = null;
            const docH = document.documentElement.scrollHeight;
            const vpH = document.documentElement.clientHeight;
            const scrollable = docH - vpH;
            btn.classList.toggle('visible', scrollable > 200 && window.scrollY / scrollable >= 0.7);
        };
        const onScroll = () => { if (!rafId) rafId = requestAnimationFrame(check); };

        window.addEventListener('scroll', onScroll, { passive: true });
        check();
    }
};

/* ── MenuOverlay (전체 메뉴 보기 + 검색) ──────────────────────
 * nav 트리거 버튼으로 여는 오버레이. CHURCH_DATA.navigation으로 사이트맵을 펼치고,
 * 상단 입력창에서 메뉴 라벨 + 페이지 본문(내용)을 함께 검색한다.
 * 검색 인덱스 = nav 라벨 + CHURCH_DATA 본문 자동 추출 + 정적 HTML 페이지 런타임 파싱. */
const MenuOverlay = {
    _index: null,
    _overlay: null,
    _input: null,
    _sitemap: null,
    _results: null,
    _trigger: null,
    _staticLoaded: false,

    // 본문이 data.js가 아닌 HTML에 직접 있는 정적 페이지 (런타임 fetch로 인덱싱)
    // sections: 지정 시 해당 id 섹션만 인덱싱 (나머지는 nav 라벨로 이미 색인됨)
    _staticPages: [
        { url: 'clergy.html',      group: '교회 이야기', sections: ['identity'] },
        { url: 'emmaus.html',      group: '엠마우스 코스' },
        { url: 'greenchurch.html', group: '녹색교회' },
        { url: 'hopecenter.html',  group: '광명 희망터' }
    ],

    init() {
        this._trigger = document.getElementById('nav-menu-trigger');
        if (!this._trigger) return;
        this._buildIndex();
        this._buildOverlay();
        this._bindEvents();
    },

    // 검색 인덱스: nav 라벨 + CHURCH_DATA 본문. href+label 기준으로 병합(본문은 합침)
    _buildIndex() {
        const map = new Map();
        const addItem = (item) => {
            const key = item.href + '|' + item.label;
            const ex = map.get(key);
            if (ex) {
                if (item.text) ex.text = (ex.text + ' ' + item.text).trim();
                if (!ex.badge && item.badge) ex.badge = item.badge;
            } else {
                map.set(key, {
                    label: item.label, href: item.href, group: item.group,
                    badge: item.badge || null, text: item.text || ''
                });
            }
        };
        CHURCH_DATA.navigation.forEach(top => {
            addItem({ label: top.label, href: top.href, group: top.label });
            (top.items || []).forEach(sub =>
                addItem({ label: sub.label, href: sub.href, group: top.label, badge: sub.badge }));
        });
        this._extractContent().forEach(addItem);
        this._index = Array.from(map.values());
    },

    // CHURCH_DATA 본문을 페이지#앵커에 매핑해 검색 항목으로 추출
    _extractContent() {
        const d = CHURCH_DATA;
        const out = [];
        const join = (...parts) => parts.flat().filter(Boolean).join(' ');
        const add = (label, href, group, text) => { if (label) out.push({ label, href, group, text: text || '' }); };

        // 교회 소개 (clergy.html)
        if (d.anglican) {
            const w = d.anglican.what;
            add('성공회란?', 'clergy.html#what-is-anglican', '교회 소개',
                join(w.paras, w.pillars.map(p => join(p.title, p.desc)), w.pillarNote,
                     w.mission ? w.mission.marks.map(m => join(m.ko, m.en)) : []));
            const k = d.anglican.korea;
            add('대한성공회', 'clergy.html#ack', '교회 소개',
                join(k.paras, k.highlights.map(h => h.text)));
        }
        (d.clergy || []).forEach(c => add(c.name, 'clergy.html#priest-section', '섬기는 이들',
            join(c.title, c.desc, c.quote, c.bio && c.bio.ministryNote, c.bio && c.bio.roles)));
        if (d.bishop) add(d.bishop.name, 'clergy.html#priest-section', '섬기는 이들',
            join(d.bishop.title, d.bishop.desc));
        if (d.philosophy) add('교회 철학', 'clergy.html#philosophy', '교회 소개',
            join(d.philosophy.title, d.philosophy.intro,
                 d.philosophy.values.map(v => join(v.title, v.desc)), d.philosophy.closing));
        if (d.logo) add('로고 소개', 'clergy.html#logo-intro', '교회 소개',
            join(d.logo.title, d.logo.subtitle, d.logo.desc, d.logo.colors, d.logo.history,
                 d.logo.elements.map(e => join(e.label, e.desc))));
        (d.press || []).forEach(p => add(p.title, 'clergy.html#press', '언론 보도', join(p.media, p.year)));

        // 예배와 기도 (worship.html)
        const wor = d.worship || {};
        (wor.main || []).forEach(m => add(m.title, 'worship.html#' + m.id, '예배와 기도',
            join(m.time, m.desc, m.detail, m.verse)));
        (wor.resources || []).forEach(r => add(r.title, 'worship.html#resources', '예배 자료', r.desc));
        if (wor.prayer) {
            (wor.prayer.dailyOffice || []).forEach(o => add(o.title, 'worship.html#daily-office', '성무일도',
                join(o.en, o.desc)));
            const ic = wor.prayer.intercession;
            if (ic) add(ic.title, 'worship.html#intercession', '예배와 기도', join(ic.en, ic.desc));
        }
        // 전례 공간 안내 (newcomer.html에서 렌더)
        if (wor.spaceGuide) (wor.spaceGuide.items || []).forEach(s =>
            add(s.name, 'newcomer.html#worship-space', '전례 공간 안내', join(s.en, s.desc)));

        // 공동체 (community.html / smallgroup.html)
        const com = d.community || {};
        (com.groups || []).forEach(g => add(g.title, 'community.html#' + g.id, '공동체', join(g.desc, g.note)));
        if (com.smallgroups) (com.smallgroups.groups || []).forEach(g =>
            add(g.title, 'smallgroup.html#' + g.id, '소그룹 모임', join(g.en, g.schedule, g.desc, g.details)));

        // 미디어 (media.html)
        if (d.media) (d.media.videos || []).forEach(v => add(v.title, 'media.html#videos', '교회 영상',
            join(v.category, v.desc)));

        // 관련 기관 (links.html)
        if (d.links) (d.links.groups || []).forEach(gr => (gr.items || []).forEach(it =>
            add(it.name, 'links.html', '관련 기관', join(gr.title, it.desc))));

        // 자주 묻는 질문 (faq.html) — 답변 본문에서 태그 제거 후 색인
        if (d.faq) (d.faq.categories || []).forEach(cat => (cat.items || []).forEach(it =>
            add(it.q, 'faq.html#faq', '자주 묻는 질문',
                join(cat.title, (it.a || '').replace(/<[^>]+>/g, ' ')))));

        return out;
    },

    // 정적 HTML 페이지를 fetch해 섹션 단위로 인덱싱 (첫 검색 시 1회). 실패 시 무시.
    async _loadStaticPages() {
        if (this._staticLoaded) return;
        this._staticLoaded = true;
        const STRUCT = new Set(['main-content', 'main-nav', 'main-footer']);
        await Promise.all(this._staticPages.map(async pg => {
            try {
                const res = await fetch(pg.url);
                if (!res.ok) return;
                const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
                const main = doc.getElementById('main-content');
                if (!main) return;
                let added = 0;
                main.querySelectorAll('[id]').forEach(sec => {
                    if (STRUCT.has(sec.id)) return;
                    if (pg.sections && !pg.sections.includes(sec.id)) return;
                    const heading = sec.querySelector('h1, h2, h3');
                    const label = heading ? heading.textContent.trim() : '';
                    if (!label) return;
                    this._index.push({
                        label, href: pg.url + '#' + sec.id, group: pg.group,
                        badge: null, text: sec.textContent.replace(/\s+/g, ' ').trim()
                    });
                    added++;
                });
                if (!added) {
                    const h = main.querySelector('h1');
                    this._index.push({
                        label: (h ? h.textContent : pg.group).trim(), href: pg.url, group: pg.group,
                        badge: null, text: main.textContent.replace(/\s+/g, ' ').trim()
                    });
                }
            } catch (_) { /* 네트워크 실패 시 정적 페이지만 건너뜀 */ }
        }));
        // 로드 완료 시점에 검색 중이면 결과 갱신
        if (this._overlay.classList.contains('is-open') && this._input.value.trim()) {
            this._search(this._input.value);
        }
    },

    _badgeHtml(badge) {
        return badge ? ` <span class="nav-badge">${badge}</span>` : '';
    },

    _sitemapHtml() {
        return CHURCH_DATA.navigation.map(top => `
            <div class="menu-sitemap-group">
                <a class="menu-sitemap-title" href="${top.href}">${top.label}</a>
                <ul class="menu-sitemap-list">
                    ${(top.items || []).map(sub =>
                        `<li><a href="${sub.href}">${sub.label}${this._badgeHtml(sub.badge)}</a></li>`
                    ).join('')}
                </ul>
            </div>
        `).join('');
    },

    _buildOverlay() {
        const el = document.createElement('div');
        el.id = 'menu-overlay';
        el.className = 'menu-overlay';
        el.setAttribute('role', 'dialog');
        el.setAttribute('aria-modal', 'true');
        const uiNav = CHURCH_DATA.ui.nav;
        el.setAttribute('aria-label', uiNav.overlayLabel);
        el.setAttribute('aria-hidden', 'true');
        el.innerHTML = `
            <div class="menu-overlay-backdrop" data-close></div>
            <div class="menu-overlay-panel">
                <div class="menu-overlay-bar">
                    <div class="menu-search-box">
                        <svg class="menu-search-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm0-2a9 9 0 0 1 6.32 15.4l4.14 4.13-1.42 1.42-4.13-4.14A9 9 0 1 1 11 2z" fill="currentColor"/></svg>
                        <input id="menu-search-input" class="menu-search-input" type="search" inputmode="search"
                               placeholder="${uiNav.searchPlaceholder}" autocomplete="off" aria-label="${uiNav.searchInputLabel}">
                    </div>
                    <button class="menu-overlay-close" data-close aria-label="${uiNav.closeLabel}">
                        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                    </button>
                </div>
                <div class="menu-overlay-scroll">
                    <div class="menu-sitemap">${this._sitemapHtml()}</div>
                    <div class="menu-results" hidden></div>
                </div>
            </div>
        `;
        document.body.appendChild(el);
        this._overlay = el;
        this._input   = el.querySelector('#menu-search-input');
        this._sitemap = el.querySelector('.menu-sitemap');
        this._results = el.querySelector('.menu-results');
    },

    _bindEvents() {
        this._trigger.addEventListener('click', () => this.open());

        this._overlay.addEventListener('click', (e) => {
            if (e.target.closest('[data-close]')) { this.close(); return; }
            const a = e.target.closest('a');
            if (a) this._handleLinkClick(e, a);
        });

        this._input.addEventListener('input', () => this._search(this._input.value));

        // Enter → 첫 결과로 이동
        this._input.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter') return;
            const first = this._results.querySelector('a');
            if (!this._results.hidden && first) { e.preventDefault(); first.click(); }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this._overlay.classList.contains('is-open')) this.close();
        });
    },

    // 오버레이 안에서 같은 페이지 앵커 클릭 시 스크롤 처리 (cross-page는 기본 이동)
    _handleLinkClick(e, a) {
        this.close();
        const href = a.getAttribute('href') || '';
        if (!href.includes('#')) return;
        const [page, hash] = href.split('#');
        const current = window.location.pathname.split('/').pop() || 'index.html';
        if ((page === '' || page === current) && hash) {
            e.preventDefault();
            if (window.location.hash !== '#' + hash) history.pushState(null, '', '#' + hash);
            NavRenderer._updateActive();
            requestAnimationFrame(() => App._scrollToHash('#' + hash));
        }
    },

    _escape(s) {
        return s.replace(/[&<>"']/g, c => (
            { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
        ));
    },

    // 검색어와 일치하는 부분을 <mark>로 강조 (텍스트·검색어 모두 이스케이프)
    _highlight(text, query) {
        const i = text.toLowerCase().indexOf(query.toLowerCase());
        if (i < 0) return this._escape(text);
        return this._escape(text.slice(0, i))
            + '<mark>' + this._escape(text.slice(i, i + query.length)) + '</mark>'
            + this._escape(text.slice(i + query.length));
    },

    // 본문 일치 위치 주변을 발췌해 강조 (라벨/그룹 일치 시에는 미표시)
    _excerpt(text, query) {
        const i = text.toLowerCase().indexOf(query.toLowerCase());
        if (i < 0) return '';
        const start = Math.max(0, i - 30);
        const end = Math.min(text.length, i + query.length + 60);
        const slice = text.slice(start, end);
        return (start > 0 ? '… ' : '') + this._highlight(slice, query) + (end < text.length ? ' …' : '');
    },

    _search(raw) {
        const q = raw.trim();
        if (!q) {
            this._results.hidden = true;
            this._sitemap.hidden = false;
            this._results.innerHTML = '';
            return;
        }
        const ql = q.toLowerCase();
        const hits = [];
        this._index.forEach(item => {
            const inLabel = item.label.toLowerCase().includes(ql);
            const inGroup = item.group.toLowerCase().includes(ql);
            const inText  = !!item.text && item.text.toLowerCase().includes(ql);
            if (inLabel || inGroup || inText) hits.push({ item, inLabel, inGroup, inText });
        });
        // 라벨 일치 우선, 다음 그룹 일치, 그다음 본문 일치
        hits.sort((a, b) => (b.inLabel - a.inLabel) || (b.inGroup - a.inGroup));

        this._sitemap.hidden = true;
        this._results.hidden = false;

        if (!hits.length) {
            this._results.innerHTML = `<p class="menu-results-empty">${CHURCH_DATA.ui.overlay.noResults.replace('{q}', this._escape(q))}</p>`;
            return;
        }
        this._results.innerHTML = `
            <ul class="menu-results-list">
                ${hits.slice(0, 40).map(({ item, inLabel, inGroup }) => {
                    const excerpt = (!inLabel && !inGroup) ? this._excerpt(item.text, q) : '';
                    return `
                    <li>
                        <a href="${item.href}">
                            <span class="menu-result-head">
                                <span class="menu-result-label">${this._highlight(item.label, q)}${this._badgeHtml(item.badge)}</span>
                                <span class="menu-result-group">${this._escape(item.group)}</span>
                            </span>
                            ${excerpt ? `<span class="menu-result-excerpt">${excerpt}</span>` : ''}
                        </a>
                    </li>`;
                }).join('')}
            </ul>
        `;
    },

    open() {
        this._loadStaticPages();
        this._search('');
        this._input.value = '';
        this._overlay.classList.add('is-open');
        this._overlay.setAttribute('aria-hidden', 'false');
        this._trigger.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        // 트랜지션 시작 후 포커스 (모바일 키보드 자동 노출 방지 위해 약간 지연)
        setTimeout(() => this._input.focus(), 60);
    },

    close() {
        if (!this._overlay.classList.contains('is-open')) return;
        this._overlay.classList.remove('is-open');
        this._overlay.setAttribute('aria-hidden', 'true');
        this._trigger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        this._trigger.focus();
    }
};