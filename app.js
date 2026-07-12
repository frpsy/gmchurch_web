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

// 사용자가 모션 최소화를 요청했는지 — 프로그램적 부드러운 스크롤을 즉시 이동으로 대체 (WCAG 2.3.3)
function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
function scrollBehavior() {
    return prefersReducedMotion() ? 'auto' : 'smooth';
}

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
        return `
            <div class="map-card${compact ? ' map-card--compact' : ''}">
                <div class="map-preview">
                    <iframe class="map-embed" src="${this._embedSrc()}" title="대한성공회 광명교회 위치 — Google 지도" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
                </div>
                <div class="map-card-addr">
                    <div class="map-addr-row">
                        <span class="map-addr-tag">도로명</span>
                        <span class="map-addr-text">${addr}</span>
                        <button class="map-copy-btn" data-copy="${addr}" aria-label="도로명 주소 복사">복사</button>
                    </div>
                    <div class="map-addr-row">
                        <span class="map-addr-tag">지번</span>
                        <span class="map-addr-text">${jibun}</span>
                    </div>
                </div>
                <div class="map-actions">
                    <a href="${this.naverUrl}" target="_blank" rel="noopener" class="map-btn map-btn--naver">
                        <span class="map-btn-mark">N</span>
                        <span class="map-btn-label">네이버 길찾기</span>
                        <span class="map-btn-arrow" aria-hidden="true">→</span>
                    </a>
                    <a href="${this.kakaoUrl}" target="_blank" rel="noopener" class="map-btn map-btn--kakao">
                        <span class="map-btn-mark map-btn-mark--kakao">K</span>
                        <span class="map-btn-label">카카오 길찾기</span>
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

        const items = CHURCH_DATA.navigation.map(item => {
            const isActive = item.href === activeHref;
            return `
            <li class="nav-item has-dropdown">
                <a href="${item.href}" class="nav-link${isActive ? ' active' : ''}"${isActive ? ' aria-current="page"' : ''}>${item.label}</a>
                <button class="nav-chevron" aria-label="${item.label} 하위 메뉴" aria-expanded="false">
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
                    <button class="nav-menu-trigger" id="nav-menu-trigger" aria-label="전체 메뉴 보기 및 검색" aria-haspopup="dialog">
                        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm0-2a9 9 0 0 1 6.32 15.4l4.14 4.13-1.42 1.42-4.13-4.14A9 9 0 1 1 11 2z" fill="currentColor"/></svg>
                    </button>
                    <button class="nav-toggle" id="nav-toggle" aria-label="메뉴 열기" aria-expanded="false">
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
                        <p class="footer-brand-meta">설립 ${info.established}<br>${clergy[0].name} ${clergy[0].title.split('·')[0].trim()}</p>
                    </div>
                    <div class="footer-col">
                        <h4>${worshipNavLabel}</h4>
                        ${services.map(s => `
                        <div class="footer-service-row">
                            <span class="footer-service-label">${s.title}</span>
                            <span class="footer-service-time">${s.time.replace('매주 일요일 ', '')}</span>
                        </div>`).join('')}
                        <div class="footer-info-row footer-info-row--first">
                            <span class="footer-info-label">주소</span>
                            <a href="${MapHelper.naverUrl}" target="_blank" rel="noopener" class="footer-info-link footer-addr-link">${info.addressShort}</a>
                        </div>
                        <div class="footer-info-row">
                            <span class="footer-info-label">전화</span>
                            <a href="tel:${info.phone}" class="footer-info-link footer-addr-link">${info.phone}</a>
                        </div>
                    </div>
                    <div class="footer-col">
                        <h4>예배 자료</h4>
                        <a href="sundays.html#lectionary" class="footer-ext-link">전례독서</a>
                        ${resources.map(r => `<a href="${r.url}" target="_blank" rel="noopener" class="footer-ext-link">${r.title}</a>`).join('')}
                    </div>
                    <div class="footer-col">
                        <h4>채널</h4>
                        <a href="${sns.youtube}"           target="_blank" rel="noopener" class="footer-ext-link">유튜브 채널</a>
                        <a href="${sns.instagram}"         target="_blank" rel="noopener" class="footer-ext-link">인스타그램</a>
                        <a href="${sns['naver blog']}"     target="_blank" rel="noopener" class="footer-ext-link">네이버 블로그</a>
                        <a href="${sns.diocesan}"          target="_blank" rel="noopener" class="footer-ext-link footer-ext-link--dim">성공회 서울교구</a>
                    </div>
                </div>
                <div class="footer-bottom">
                    <span>© ${new Date().getFullYear()} ${info.name}</span>
                    <nav class="footer-bottom-links" aria-label="하단 안내">
                        <a href="giving.html" class="footer-privacy-link">봉헌 안내</a>
                        <a href="clergy.html#logo-intro" class="footer-privacy-link">로고 소개</a>
                        <a href="clergy.html#press" class="footer-privacy-link">언론 보도</a>
                        <a href="privacy.html" class="footer-privacy-link">개인정보 처리방침</a>
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

        if (acts) acts.innerHTML = `
            <a href="newcomer.html" class="btn-hero-primary">처음 오신 분</a>
            <a href="worship.html" class="btn-outline">예배 안내</a>
        `;

        // 설립 연도만 추출 ("1990년 2월 11일" → "1990")
        const foundedYear = (established.match(/\d{4}/) || [established])[0];
        const countFrom = String(Math.max(0, parseInt(foundedYear, 10) - 15));
        if (stats) stats.innerHTML = `
            <a href="clergy.html#identity" class="hero-stat hero-stat--link"><span class="hero-stat-val" data-count-from="${countFrom}" data-count-to="${foundedYear}">${foundedYear}</span><span class="hero-stat-lbl">설립</span></a>
            <span class="hero-stat-divider" aria-hidden="true"></span>
            <a href="worship.html" class="hero-stat hero-stat--link"><span class="hero-stat-val">오전 11:00</span><span class="hero-stat-lbl">주일 예배</span></a>
            <span class="hero-stat-divider" aria-hidden="true"></span>
            <a href="visit.html" class="hero-stat hero-stat--link"><span class="hero-stat-val">경기도 광명시</span><span class="hero-stat-lbl">위치</span></a>
        `;
        this._initStatCounter();
    },

    _initStatCounter() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const statsEl = document.getElementById('hero-stats');
        if (!statsEl) return;
        const counters = statsEl.querySelectorAll('[data-count-to]');
        if (!counters.length) return;

        const run = () => {
            counters.forEach(el => {
                const from = parseInt(el.dataset.countFrom || '0', 10);
                const to   = parseInt(el.dataset.countTo, 10);
                if (isNaN(to)) return;
                const duration = 900;
                const t0 = performance.now();
                const tick = (now) => {
                    const p = Math.min((now - t0) / duration, 1);
                    el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
                    if (p < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
            });
        };

        const io = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                io.disconnect();
                setTimeout(run, 750); // hero-stats 페이드인 (delay 0.72s)과 동기
            }
        }, { threshold: 0.1 });
        io.observe(statsEl);
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
                    <li><strong>이름</strong><span>${name}</span></li>
                    <li><strong>설립</strong><span>${established}</span></li>
                    <li><strong>소속</strong><span>${diocese}</span></li>
                </ul>
                <a href="clergy.html" class="about-brief-link">교회 소개 자세히 보기 →</a>
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
            <h3>광명교회로 오시는 길</h3>
            ${MapHelper.html(true)}
            <div class="info-row"><strong>전화</strong><span><a href="tel:${phone}" class="link-plain">${phone}</a></span></div>
            <p class="visit-detail-wrap">
                <a href="visit.html" class="detail-link">자세히 보기 →</a>
            </p>
        `;
    }
};

/* ── BcpRenderer ─────────────────────────────────────────── */
const BcpRenderer = {
    render() {
        const el = document.getElementById('worship-bcp');
        if (!el) return;
        const bcp = CHURCH_DATA.worship && CHURCH_DATA.worship.prayer && CHURCH_DATA.worship.prayer.bcp;
        if (!bcp) return;
        el.innerHTML = `
            <div class="section-header">
                <p class="section-eyebrow">${bcp.eyebrow}</p>
                <h2 class="section-title">${bcp.title}</h2>
            </div>
            <div class="anglican-body">
                ${bcp.sections.map(sec => `
                    <h3 class="bcp-section-title">${sec.title}</h3>
                    ${sec.body.map(p => `<p class="anglican-para">${p}</p>`).join('')}
                `).join('')}
            </div>`;
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
                            <strong>시간</strong>
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
        return `
            <div class="liturgy-guide">
                <div class="liturgy-section">
                    <p class="section-eyebrow">Eucharist</p>
                    <h2 class="section-title">감사성찬례란?</h2>
                    <p class="liturgy-body">${eucharistIntro}</p>
                    <blockquote class="liturgy-inner-quote">${eucharistIntroQuote}</blockquote>
                </div>
                <div class="liturgy-section">
                    <p class="section-eyebrow">Order of Service</p>
                    <h2 class="section-title">감사성찬례 순서</h2>
                    <p class="liturgy-body liturgy-body--lead">성공회 기도서에 따른 감사성찬례는 크게 <strong>네 부분</strong>으로 구성됩니다.</p>
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
        return `
            <div class="liturgy-guide">
                <div class="liturgy-section">
                    <p class="section-eyebrow">Worship Resources</p>
                    <h2 class="section-title">예배 자료</h2>
                    <p class="liturgy-body liturgy-body--lead">기도서·성가·성서를 온라인으로도 보실 수 있습니다.</p>
                    <div class="resource-grid">
                        ${resources.map(r => `
                            <a class="resource-card" href="${r.url}" target="_blank" rel="noopener noreferrer">
                                <span class="resource-icon" aria-hidden="true">${r.icon}</span>
                                <h3 class="resource-title">${r.title}</h3>
                                <p class="resource-desc">${r.desc}</p>
                                <span class="resource-link">바로가기 <span aria-hidden="true">↗</span></span>
                            </a>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    _prayer({ prayer }) {
        if (!prayer) return '';
        return `
            <div class="liturgy-guide">
                <div class="liturgy-section">
                    <p class="section-eyebrow">DIVINE OFFICE</p>
                    <h2 class="section-title">성무일과(매일기도)</h2>
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
                                <span class="resource-link">기도서 열기 <span aria-hidden="true">↗</span></span>
                            </a>
                        `).join('')}
                    </div>
                </div>
                <div class="liturgy-section" id="intercession">
                    <p class="section-eyebrow">Anglican Cycle of Prayer</p>
                    <h2 class="section-title">세계성공회 중보기도</h2>
                    <p class="liturgy-body liturgy-body--lead">세계성공회(Anglican Communion)는 날마다 특정 교구와 지역 교회를 위해 함께 기도하는 기도 달력을 발행합니다. 전 세계 165개 이상의 나라에 퍼져 있는 성공회 공동체와 하나로 이어지는 기도입니다.</p>
                    <div class="resource-grid resource-grid--single">
                        <a class="resource-card" href="${prayer.intercession.url}" target="_blank" rel="noopener noreferrer">
                            <span class="resource-icon" aria-hidden="true">${prayer.intercession.icon}</span>
                            <h3 class="resource-title">${prayer.intercession.title}</h3>
                            <p class="resource-desc resource-en">${prayer.intercession.en}</p>
                            <p class="resource-desc">${prayer.intercession.desc}</p>
                            <span class="resource-link">PDF 내려받기 <span aria-hidden="true">↗</span></span>
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

        el.innerHTML = `
            <div class="liturgy-guide" id="newcomer">

                <div class="newcomer-intro">
                    <h2 class="newcomer-intro-title">환영합니다</h2>
                    <p class="newcomer-intro-body">광명교회에 오신 것을 환영합니다. 성공회 예배는 회중이 함께 기도하고 응답하는 전례 예배입니다. 처음에는 흐름이 낯설 수 있으니, 익숙하지 않은 부분은 편안히 지켜보셔도 좋습니다. 아래 안내가 예배의 흐름을 이해하시는 데 작은 도움이 되시기를 바라겠습니다.</p>
                    <div class="newcomer-key-facts">
                        <div class="newcomer-key-row">
                            <span class="newcomer-key-label">예배</span>
                            <span class="newcomer-key-value"><strong>주일 감사성찬례</strong> · 매주 일요일 오전 11:00</span>
                        </div>
                        <div class="newcomer-key-row">
                            <span class="newcomer-key-label">장소</span>
                            <span class="newcomer-key-value">${info.name} (${info.subName})<br>${info.addressShort}</span>
                        </div>
                        <div class="newcomer-key-row">
                            <span class="newcomer-key-label">소요</span>
                            <span class="newcomer-key-value">약 1시간</span>
                        </div>
                    </div>
                </div>

                <div class="liturgy-section" id="firsttime">
                    <p class="section-eyebrow">First Visit</p>
                    <h2 class="section-title">참여 안내</h2>
                    <p class="liturgy-body" style="margin-bottom:1rem;">처음 참석하실 때 알아두시면 도움이 되는 내용을 정리했습니다.</p>
                    <div class="liturgy-checklist">
                        <div class="checklist-item"><span class="check-icon">✓</span><p><strong>앉고 서는</strong> 순서가 있지만, 몸이 불편하시면 그대로 앉아 계셔도 됩니다.</p></div>
                        <div class="checklist-item"><span class="check-icon">✓</span><p><strong>주보</strong>에 예배 순서가 안내되어 있고, <strong>회중석의 기도서</strong>를 함께 펴고 응답하시면 됩니다.</p></div>
                        <div class="checklist-item"><span class="check-icon">✓</span><p>회중이 함께 부르는 <strong>성가</strong>는 따라 부르지 않으셔도 괜찮습니다.</p></div>
                        <div class="checklist-item"><span class="check-icon">✓</span><p>처음에는 낯설어도 한두 번 참여하시면 자연스럽게 익숙해지실 수 있습니다.</p></div>
                        <div class="checklist-item"><span class="check-icon">✓</span><p>궁금하신 점은 옆자리 교우나 안내위원에게 편하게 물어보세요.</p></div>
                    </div>
                </div>

                <div class="liturgy-section" id="liturgy">
                    <p class="section-eyebrow">Anglican Liturgy</p>
                    <h2 class="section-title">성공회 전례란?</h2>
                    <p class="liturgy-body">성공회(Anglican Church)는 <strong>말씀과 성찬을 함께 중시하는 전례 교회</strong>입니다. 초대교회로부터 이어진 말씀의 전례와 성찬의 전례가 조화를 이루는 예배 전통을 400여 년간 지켜오고 있습니다.</p>
                    <p class="liturgy-body">예배는 <strong>성공회 기도서(Book of Common Prayer)</strong>에 따라 드립니다. 1549년 캔터베리 대주교 토마스 크랜머가 편찬한 이 기도서는, 라틴어가 아닌 자국어로 예배를 드리도록 하여 <strong>모든 신자가 전례에 직접 참여</strong>할 수 있게 한 종교개혁의 중요한 유산입니다.</p>
                    <div class="liturgy-card">
                        <h3 class="liturgy-card-title">전례의 의미</h3>
                        <p class="liturgy-body"><strong>'전례(典禮, Liturgy)'</strong>는 그리스어 <em>레이투르기아(λειτουργία)</em>에서 온 말로, '공동체를 위해 수행하는 일'을 뜻합니다. 곧 전례는 <strong>그리스도인이 함께 드리고 함께 살아가는 신앙의 실천</strong>입니다.</p>
                        <ul class="liturgy-list">
                            <li>회중이 <strong>함께 기도하고 응답하는 대화 형식</strong>으로 진행됩니다.</li>
                            <li>모든 신자가 성직자와 함께 <strong>예배를 드리는 주체</strong>가 됩니다.</li>
                            <li>성서·성가집·기도서·주보를 함께 펴고 능동적으로 참여합니다.</li>
                        </ul>
                    </div>
                </div>

                ${spaceGuide && spaceGuide.items && spaceGuide.items.length ? `
                <div class="liturgy-section" id="worship-space">
                    <p class="section-eyebrow">Inside the Church</p>
                    <h2 class="section-title">전례 공간 안내</h2>
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
                    <h2 class="section-title">영성체 안내</h2>
                    <div class="communion-grid">
                        <div class="communion-card communion-season">
                            <h3>세례받으신 분</h3>
                            <p class="liturgy-body">성공회의 성찬은 모든 그리스도인에게 열려 있습니다. 교파에 관계없이 <strong>세례받은 그리스도인이라면 누구나</strong> 그리스도의 몸과 피를 모실 수 있습니다.</p>
                            <ul class="liturgy-list">
                                <li>제대 앞으로 나오신 후, 두 손을 펴서 빵을 받으십시오.</li>
                                <li>빵을 받으신 후, 포도주에 찍어 <strong>영하십시오</strong>.<br><small style="color:var(--text-muted); font-size:0.82em;">영하다: 성체를 받아 모시다</small></li>
                                <li>빵과 포도주를 받을 때 <em>"아멘"</em>으로 응답합니다.</li>
                                <li>성찬을 받는 방법이 궁금하시면 안내위원에게 문의해 주세요.</li>
                            </ul>
                        </div>
                        <div class="communion-card" style="border-top-color:var(--green-mid); background:var(--green-light);">
                            <h3>아직 세례를 받지 않으신 분</h3>
                            <p class="liturgy-body"><strong>제대 앞으로 나오시면 강복(축복)을 받으실 수 있습니다.</strong></p>
                            <ul class="liturgy-list">
                                <li>두 손을 가슴에 X자로 모으시면, 집전자가 머리에 손을 얹고 강복해 드립니다.</li>
                                <li>편안한 마음으로 나오세요. 이 시간은 하느님께서 여러분을 맞이하시는 자리입니다.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="newcomer-cta" id="contact">
                    <h3>더 궁금하신 점이 있으신가요?</h3>
                    <p>성공회 예배나 광명교회에 대해 궁금하신 점이 있으시면 편하게 문의해 주세요.</p>
                    <div class="newcomer-cta-actions">
                        ${primary.contact ? `<a href="mailto:${primary.contact}" class="newcomer-cta-link"><span aria-hidden="true">✉️</span> ${primary.name} 사제에게 메일 보내기</a>` : ''}
                        <a href="tel:${info.phone}" class="newcomer-cta-link"><span aria-hidden="true">📞</span> 교회 사무실 ${info.phone}</a>
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
                        ${g.detailUrl ? `<a href="${g.detailUrl}" class="community-detail-link"><span>자세히 보기</span><span aria-hidden="true">→</span></a>` : ''}
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
                            <strong>모임 일정</strong>
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

        el.innerHTML = `
            <div class="info-card" id="offering" style="max-width:640px; margin:0 auto;">
                <h3>봉헌 계좌</h3>
                <div class="bank-card">
                    <p style="font-size:0.8rem; color:var(--green-mid); margin-bottom:0.3rem;">${bankName}</p>
                    <p class="account">${bank}</p>
                    <p class="sub">예금주 ${holder}</p>
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

        el.innerHTML = `
            <div class="info-card info-card--wide" id="location">
                <h3>주소와 연락처</h3>
                ${MapHelper.html(false)}
                <div class="visit-contact">
                    <div class="info-row"><strong>우편번호</strong><span>${postalCode}</span></div>
                    <div class="info-row"><strong>전화</strong><span><a href="tel:${phone}" class="link-plain">${phone}</a></span></div>
                    <div class="info-row"><strong>팩스</strong><span>${fax}</span></div>
                </div>
            </div>
            <div class="info-card info-card--wide" id="parking">
                <h3>교통·주차 안내</h3>
                <div class="info-row">
                    <strong>승용차</strong>
                    <span>내비게이션에 <em>대한성공회 광명교회</em> 또는 위 주소를 검색해 주세요.</span>
                </div>
                <div class="info-row">
                    <strong>버스</strong>
                    <span>
                        가까운 정류장: <strong>온신초등학교앞</strong>
                        <span class="bus-list">
                            <span class="bus-chip bus-blue">505</span>
                            <span class="bus-chip bus-green">5627</span>
                            <span class="bus-chip bus-green">5633</span>
                            <span class="bus-chip bus-green">6637</span>
                        </span>
                        <span class="bus-note">서울역·구로디지털단지·목동 방면에서 접근 가능합니다.</span>
                    </span>
                </div>
                <div class="info-row">
                    <strong>주차</strong>
                    <span>교회 인근에 무료 주차가 가능합니다. 방문 전 교회 사무실(<a href="tel:${phone}" class="link-plain">${phone}</a>)로 확인해 주세요.</span>
                </div>
                <p class="visit-note">※ 카카오맵·네이버지도에서 <strong>대한성공회 광명교회</strong>로 검색하시면 최단 경로 안내를 받으실 수 있습니다.</p>
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
                        <span class="founded-label">창립</span>
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
        const bishopHtml = bishop ? `
            <div class="bishop-card">
                <p class="bishop-eyebrow">Diocese of Seoul</p>
                <div class="bishop-card-inner">
                    ${bishop.photo
                        ? `<div class="bishop-portrait-wrap"><img src="${bishop.photo}" alt="${bishop.name} 주교 초상" class="bishop-portrait" loading="lazy"></div>`
                        : `<div class="bishop-portrait-wrap bishop-portrait-fallback" aria-hidden="true">🏛</div>`}
                    <div class="bishop-card-body">
                        <p class="bishop-name">${bishop.name} 주교</p>
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
                                ? `<img src="${c.photo}" alt="${c.name} 사제" loading="lazy" class="clergy-avatar-img">`
                                : '<span aria-hidden="true">✝️</span>'}
                        </div>
                        <div>
                            <div class="clergy-name">${c.name} 사제</div>
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
            const bodyHtml = (membersHtml + officersHtml) || `<div class="minister-empty">준비 중입니다.</div>`;
            return `
            <div class="minister-category">
                <h3 class="minister-cat-title">${cat.title}</h3>
                ${cat.note ? `<p class="minister-cat-note">${cat.note}</p>` : ''}
                ${bodyHtml}
            </div>`;
        }).join('');
    },

    _bioSection(bio) {
        const milestones = bio.milestones.map(m => `
            <li class="bio-milestone">
                <span class="bio-year">${m.year}</span>
                <span class="bio-dot"></span>
                <span class="bio-text">${m.text}${m.first ? ' <span class="bio-first">최초</span>' : ''}</span>
            </li>
        `).join('');

        const roles = bio.roles.map(r =>
            `<span class="bio-role-tag">${r}</span>`
        ).join('');

        const externalRolesHtml = bio.externalRoles && bio.externalRoles.length > 0
            ? `<p class="bio-label" style="margin-top:1.5rem;">교회 밖 활동</p>
               <div class="bio-roles">${bio.externalRoles.map(r => `<span class="bio-role-tag">${r}</span>`).join('')}</div>`
            : '';

        return `
            <div class="bio-section">
                <p class="bio-label">주요 사목 이력</p>
                <ul class="bio-timeline">${milestones}</ul>
                <p class="bio-label" style="margin-top:1.5rem;">교단 내 소임</p>
                <div class="bio-roles">${roles}</div>
                ${externalRolesHtml}
                <div class="bio-ministry-note">
                    <span class="bio-ministry-icon">🕊</span>
                    <p>${bio.ministryNote}</p>
                </div>
                ${bio.source ? `
                <p class="bio-source">출처: ${bio.source.author} 지음, ${bio.source.title}, ${bio.source.publisher} (${bio.source.year})</p>
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
                ${values.map(v => {
                    const inner = `
                        <div class="val-icon">${v.icon}</div>
                        <h4>${v.title}</h4>
                        <p>${v.desc}</p>
                        ${v.href && v.cta ? `<span class="value-card-cta">${v.cta} <span aria-hidden="true">→</span></span>` : ''}`;
                    return v.href
                        ? `<a class="value-card value-card--link" href="${v.href}">${inner}</a>`
                        : `<div class="value-card">${inner}</div>`;
                }).join('')}
            </div>
            ${closingHtml}
        `;
    }
};

/* ── AboutNavRenderer — 교회 소개 섹션 둘러보기 + 순차 연결 흐름 ─── */
const AboutNavRenderer = {
    render() {
        const host = document.getElementById('about-section-nav');
        if (!host) return;
        const about = (CHURCH_DATA.navigation || []).find(n => n.href === 'clergy.html');
        if (!about || !about.items) return;
        const cfg = CHURCH_DATA.aboutJourney || {};
        const items = about.items;
        const onPage = it => it.href.startsWith('clergy.html') && it.href.includes('#');
        const anchorOf = it => it.href.split('#')[1];

        // 1) sticky 섹션 내비게이션 — 스크롤 내내 하위 메뉴를 노출
        host.innerHTML = `
            <nav class="gc-page-nav" aria-label="${cfg.navLabel || '교회 소개 둘러보기'}">
                <div class="container">
                    ${items.map(it => onPage(it)
                        ? `<a href="#${anchorOf(it)}" class="gc-nav-link" data-about-section="${anchorOf(it)}">${it.label}</a>`
                        : `<a href="${it.href}" class="gc-nav-link gc-nav-link--ext">${it.label} <span aria-hidden="true">↗</span></a>`
                    ).join('')}
                </div>
            </nav>`;

        // 2) 섹션 끝마다 '다음' 연결 — 순차적으로 모든 하위 메뉴를 거치게
        items.forEach((it, i) => {
            const next = items[i + 1];
            if (!onPage(it) || !next) return;
            const section = document.getElementById(anchorOf(it));
            if (!section) return;
            const container = section.querySelector('.container') || section;
            const a = document.createElement('a');
            a.className = 'about-next';
            a.href = next.href;
            a.innerHTML =
                `<span class="about-next-label">${cfg.nextLabel || '다음'}</span>` +
                `<span class="about-next-target">${next.label}</span>` +
                `<span class="about-next-arrow" aria-hidden="true">→</span>`;
            container.appendChild(a);
        });

        this._bindSpy(host);
    },

    // 현재 보고 있는 섹션을 내비에서 강조 (greenchurch 섹션 내비와 동일 방식)
    _bindSpy(host) {
        const links = Array.from(host.querySelectorAll('.gc-nav-link[data-about-section]'));
        if (!links.length) return;
        const ids = links.map(l => l.dataset.aboutSection);
        const els = ids.map(id => document.getElementById(id));
        const pads = els.map(el => el ? parseFloat(getComputedStyle(el).paddingTop) || 0 : 0);
        const update = () => {
            const threshold = window.innerHeight * 0.40;
            let activeId = null;
            els.forEach((el, i) => {
                if (el && el.getBoundingClientRect().top + pads[i] <= threshold) activeId = ids[i];
            });
            links.forEach(l => l.classList.toggle('is-active', l.dataset.aboutSection === activeId));
        };
        window.addEventListener('scroll', update, { passive: true });
        update();
    }
};

/* ── MediaRenderer ───────────────────────────────────────── */
const MediaRenderer = {
    render() {
        const el = document.getElementById('media-full');
        if (!el || !CHURCH_DATA.media) return;
        const { intro, channelUrl, videos } = CHURCH_DATA.media;

        el.innerHTML = `
            <div class="section-header">
                <p class="section-eyebrow">YouTube</p>
                <h2 class="section-title">영상 갤러리</h2>
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
                    유튜브 채널 전체 보기 ↗
                </a>
            </div>
        `;
    }
};

/* ── MediaHubRenderer ────────────────────────────────────── */
/* 미디어·자료 허브(media.html)의 섹션 카드 — data.media.hub.cards 기준 */
const MediaHubRenderer = {
    render() {
        const el = document.getElementById('media-hub');
        if (!el || !CHURCH_DATA.media || !CHURCH_DATA.media.hub) return;
        el.innerHTML = `
            <div class="resource-grid">
                ${CHURCH_DATA.media.hub.cards.map(c => `
                    <a class="resource-card" href="${c.href}" style="border-top-color: var(--green-mid);">
                        <span class="resource-icon" aria-hidden="true">${c.icon}</span>
                        <p class="resource-title">${c.title}</p>
                        <p class="resource-desc">${c.desc}</p>
                        <span class="resource-link" style="color:var(--green-mid);">${c.action} →</span>
                    </a>
                `).join('')}
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

        el.innerHTML = `
            ${badge ? `
            <div class="draft-banner">
                <span class="draft-badge">${badge}</span>${note}
            </div>` : ''}
            <div class="section-header">
                <p class="section-eyebrow">Photo Gallery</p>
                <h2 class="section-title">사진 갤러리</h2>
                <p class="section-sub">${intro}</p>
            </div>
            <div class="photo-filters" role="group" aria-label="사진 분류 필터">
                ${categories.map((c, i) => `
                    <button class="photo-filter-btn${i === 0 ? ' is-active' : ''}"
                            data-filter="${c}" type="button">${c}</button>
                `).join('')}
            </div>
            <div class="photo-grid" id="photo-grid-items">
                ${photos.map(p => {
                    const isPending = p.thumb.includes('picsum');
                    return `
                    <button class="photo-item${isPending ? ' photo-item--pending' : ''}"
                            data-category="${p.category}"
                            data-src="${p.src}"
                            data-title="${p.title}"
                            data-desc="${p.desc}"
                            data-date="${p.date}"
                            data-pending="${isPending}"
                            type="button"
                            aria-label="${isPending ? p.title + ' (사진 준비 중)' : p.alt + ' 크게 보기'}">
                        ${isPending
                            ? `<div class="photo-placeholder" aria-hidden="true">
                                <span class="photo-placeholder-label">${p.title}</span>
                                <span class="photo-placeholder-badge">준비중</span>
                               </div>`
                            : `<img src="${p.thumb}" alt="${p.alt}" loading="lazy" width="480" height="320">
                               <div class="photo-overlay" aria-hidden="true">
                                   <span class="photo-cat-badge">${p.category}</span>
                                   <p class="photo-caption">${p.title}</p>
                                   <p class="photo-date">${p.date}</p>
                               </div>`
                        }
                    </button>`;
                }).join('')}
            </div>
            <p class="photo-count" id="photo-count-text">${photos.length}장</p>
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
                    const match = filter === '전체' || item.dataset.category === filter;
                    item.style.display = match ? '' : 'none';
                    if (match) shown++;
                });
                countEl.textContent = `${shown}장`;
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
            if (item && item.dataset.pending !== 'true') openLb(item);
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
            ? `<p class="faq-refs"><span class="faq-refs-label">출처</span>${refs.map(r =>
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
        overlay.setAttribute('aria-label', '초상 확대 보기');
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
    _PER_PAGE: 5,

    _rowHtml(item, isLatest) {
        const count = item.images ? item.images.length : 0;
        return `
            <button class="bulletin-row" aria-expanded="false" type="button">
                <div class="bulletin-row-info">
                    <div class="bulletin-row-top">
                        <span class="bulletin-row-date">${item.label}</span>
                        ${isLatest ? '<span class="bulletin-badge-new">이번 주</span>' : ''}
                    </div>
                    <div class="bulletin-row-meta">
                        <span class="bulletin-row-season">${item.season}</span>
                        ${count > 0 ? `<span class="bulletin-row-count">${count}면</span>` : ''}
                    </div>
                </div>
                <svg class="bulletin-row-chevron" viewBox="0 0 10 6" width="12" height="12" aria-hidden="true">
                    <path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>`;
    },

    _drawerHtml(item) {
        const pdfSvg = `<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="currentColor">
                       <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                       <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                   </svg>`;
        const pdfBtn = item.pdf
            ? `<a href="${item.pdf}" class="bulletin-pdf-btn" download>${pdfSvg} PDF 내려받기</a>`
            : '';
        if (!item.images || item.images.length === 0) {
            return pdfBtn || `<p class="bulletin-empty-inner">주보가 준비 중입니다.</p>`;
        }
        const imgs = item.images.map((src, i) =>
            `<img src="${src}" alt="${item.label} ${i + 1}면" loading="lazy" class="bulletin-page">`
        ).join('');
        return `<div class="bulletin-pages">${imgs}</div>${pdfBtn}`;
    },

    _renderPage(el, items, page) {
        const perPage    = this._PER_PAGE;
        const totalPages = Math.ceil(items.length / perPage);
        const start      = page * perPage;
        const pageItems  = items.slice(start, start + perPage);

        const listHtml = pageItems.map((item, relIdx) => `
            <div class="bulletin-item">
                ${this._rowHtml(item, start + relIdx === 0)}
                <div class="bulletin-drawer" hidden>
                    ${this._drawerHtml(item)}
                </div>
            </div>
        `).join('');

        const pagHtml = totalPages > 1 ? `
            <nav class="bulletin-pagination" aria-label="주보 목록 페이지">
                <button class="bulletin-pag-btn" type="button" data-dir="-1"${page === 0 ? ' disabled' : ''}>← 이전</button>
                <span class="bulletin-pag-info">${page + 1} / ${totalPages}</span>
                <button class="bulletin-pag-btn" type="button" data-dir="1"${page >= totalPages - 1 ? ' disabled' : ''}>다음 →</button>
            </nav>
        ` : '';

        el.innerHTML = `<div class="bulletin-list">${listHtml}</div>${pagHtml}`;

        el.querySelectorAll('.bulletin-row').forEach(btn => {
            btn.addEventListener('click', () => {
                const drawer = btn.nextElementSibling;
                const isOpen = btn.getAttribute('aria-expanded') === 'true';
                el.querySelectorAll('.bulletin-row[aria-expanded="true"]').forEach(other => {
                    if (other !== btn) {
                        other.setAttribute('aria-expanded', 'false');
                        other.nextElementSibling.hidden = true;
                    }
                });
                btn.setAttribute('aria-expanded', String(!isOpen));
                drawer.hidden = isOpen;
            });
        });

        el.querySelectorAll('.bulletin-pag-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this._renderPage(el, items, page + parseInt(btn.dataset.dir, 10));
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    },

    _createLightbox() {
        const dlg = document.createElement('dialog');
        dlg.id = 'bulletin-lb';
        dlg.innerHTML = `
            <div class="bulletin-lb-wrap">
                <button class="bulletin-lb-close" aria-label="닫기">✕</button>
                <img class="bulletin-lb-img" src="" alt="">
            </div>`;
        document.body.appendChild(dlg);
        dlg.querySelector('.bulletin-lb-close').addEventListener('click', () => dlg.close());
        dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && dlg.open) dlg.close();
        }, { once: false });
        return dlg;
    },

    render() {
        const el = document.getElementById('bulletin-full');
        if (!el) return;
        const { items } = CHURCH_DATA.bulletins;
        if (!items || items.length === 0) {
            el.innerHTML = `<p class="bulletin-empty">아직 등록된 주보가 없습니다.</p>`;
            return;
        }
        const dlg = document.getElementById('bulletin-lb') || this._createLightbox();
        el.addEventListener('click', e => {
            const img = e.target.closest('.bulletin-page');
            if (!img) return;
            dlg.querySelector('.bulletin-lb-img').src = img.src;
            dlg.querySelector('.bulletin-lb-img').alt = img.alt;
            dlg.showModal();
        });
        this._renderPage(el, items, 0);
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
        if (lectionaryEl) this._lectionaryAsync(lectionaryEl);
        if (seasonsEl)    seasonsEl.innerHTML  = this._seasons(d.seasons, cs, yearDates, advYear);
        if (monthlyEl) {
            this._calYear  = year;
            this._calMonth = mon;
            monthlyEl.innerHTML = this._monthlyFull(year, mon, specialMap);
            this._bindCalNav(monthlyEl);
        }
        if (specialEl)  specialEl.innerHTML = this._special(d.specialSundays);
    },

    /* 전례독서 — RCL 가해 JSON에서 오늘 날짜 기준 자동 표시.
       연중 시기는 연속(A)·짝(B) 두 트랙을 토글로 오가며, 본문은 공동번역 성서로 연결 */
    async _lectionaryAsync(el) {
        const header = `
            <div class="section-header">
                <p class="section-eyebrow">Lectionary</p>
                <h2 class="section-title">전례독서</h2>
                <p class="section-sub">교회력에 따라 정해진 주일 성서 본문입니다. 제1독서·제2독서·복음을 봉독하며, 본문을 누르면 공동번역 성서가 열립니다.</p>
            </div>`;
        el.innerHTML = header + '<p class="lectionary-loading">불러오는 중…</p>';

        let sundays;
        try {
            const res = await fetch('data/lectionary-year-a.json');
            if (!res.ok) throw new Error('fetch ' + res.status);
            sundays = (await res.json()).sundays;
        } catch (_) {
            el.innerHTML = header + `<div class="lect-nav-wrap">${this._lectionaryFallback()}</div>`;
            return;
        }

        // 주보 기준 실제 봉독 기록 병합 (파일이 없어도 표준 독서로 동작)
        try {
            const ovRes = await fetch('data/lectionary-overrides.json');
            if (ovRes.ok) this._applyOverrides(sundays, (await ovRes.json()).sundays || {});
        } catch (_) { /* 표준 독서 유지 */ }

        const idx = this._lectionaryFindIdx(sundays);
        el.dataset.lectionaryIdx = idx;
        const track = sundays[idx].bulletinTrack || 'B';  // 주보 확인 트랙, 없으면 짝 독서 기본
        el.dataset.lectionaryTrack = track;
        el.innerHTML = header + `<div class="lect-nav-wrap">${this._lectionaryCardHtml(sundays, idx, track)}</div>`;
        this._bindLectionaryNav(el, sundays);
    },

    /* 주보에서 확인한 트랙·특별 주일 독서를 표준 목록 위에 덮어쓴다 */
    _applyOverrides(sundays, overrides) {
        sundays.forEach(s => {
            const o = overrides[s.date];
            if (!o) return;
            if (o.track) s.bulletinTrack = o.track;
            if (o.readings) {
                s.bulletinReadings = true;
                s.anglicanName = s.koreanName;           // 표준 주일명은 부제로 이동
                if (o.koreanName) s.koreanName = o.koreanName;
                s.readings = {
                    firstReadingA: o.readings.firstReading,
                    psalm: o.readings.psalm,
                    secondReading: o.readings.secondReading,
                    gospel: o.readings.gospel
                };
            }
        });
    },

    _lectionaryFindIdx(sundays) {
        const today = new Date();
        const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        // 오늘이 일요일이면 오늘, 아니면 이번 주 지난 일요일
        const thisSunday = new Date(todayDate);
        const dow = todayDate.getDay();
        if (dow !== 0) thisSunday.setDate(thisSunday.getDate() - dow);
        const ms = thisSunday.getTime();

        let best = 0, bestDiff = Infinity;
        sundays.forEach((s, i) => {
            const diff = Math.abs(new Date(s.date + 'T00:00:00').getTime() - ms);
            if (diff < bestDiff) { bestDiff = diff; best = i; }
        });
        return best;
    },

    /* 성서 본문 참조 → 공동번역(COG) 온라인 성서 URL. 첫 장·절로 이동 */
    _bibleBooks: {
        '창세':'gen','탈출':'exo','레위':'lev','민수':'num','신명기':'deu','신명':'deu',
        '여호수아':'jos','판관기':'jdg','판관':'jdg','룻기':'rut',
        '사무엘상':'1sa','사무엘하':'2sa','열왕기상':'1ki','열왕기하':'2ki',
        '역대상':'1ch','역대하':'2ch','에즈라':'ezr','느헤미야':'neh','에스델':'est','에스더':'est',
        '욥기':'job','시편':'psa','잠언':'pro','전도서':'ecc','아가':'sng',
        '이사야':'isa','예레미야':'jer','애가':'lam','에스겔':'ezk','에제키엘':'ezk','다니엘':'dan',
        '호세아':'hos','요엘':'jol','아모스':'amo','오바댜':'oba','요나':'jon','미가':'mic',
        '나훔':'nam','하박국':'hab','스바냐':'zep','학개':'hag','스가랴':'zec','즈가리야':'zec','말라기':'mal',
        '마태':'mat','마가':'mrk','누가':'luk','요한1서':'1jn','요한2서':'2jn','요한3서':'3jn',
        '요한일서':'1jn','요한이서':'2jn','요한삼서':'3jn','요한':'jhn','사도행전':'act',
        '로마':'rom','고린도전':'1co','고린도후':'2co','갈라디아':'gal','에베소':'eph',
        '빌립보':'php','골로새':'col','데살로니가전서':'1th','데살로니가후서':'2th','살전':'1th','살후':'2th',
        '디모데전서':'1ti','디모데후서':'2ti','디도':'tit','빌레몬':'phm','히브리':'heb',
        '야고보':'jas','베드로전서':'1pe','베드로후서':'2pe','유다':'jud','묵시록':'rev','요한계시록':'rev'
    },
    _bibleUrl(ref) {
        if (!ref) return null;
        const r = ref.trim();
        // 가장 긴 책 이름 접두사로 매칭 (요한1서 vs 요한, 신명기 vs 신명 등 구분)
        let name = null;
        for (const key in this._bibleBooks) {
            if (r.startsWith(key) && (!name || key.length > name.length)) name = key;
        }
        if (!name) return null;
        const m = r.slice(name.length).trim().match(/^(\d+)(?::(\d+))?/);
        if (!m) return null;
        let url = 'https://www.bskorea.or.kr/bible/korbibReadpage.php?version=COG'
                + '&book=' + this._bibleBooks[name] + '&chap=' + m[1];
        if (m[2]) url += '&sec=' + m[2];
        return url;
    },
    _refLink(ref) {
        const url = this._bibleUrl(ref);
        if (!url) return `<span class="lectionary-ref">${ref}</span>`;
        return `<a class="lectionary-ref lectionary-ref-link" href="${url}" target="_blank" rel="noopener noreferrer">${ref}<span class="lectionary-ref-ico" aria-hidden="true">↗</span></a>`;
    },

    _lectionaryCardHtml(sundays, idx, track) {
        const s = sundays[idx];
        const d = new Date(s.date + 'T00:00:00');
        const dateStr = d.getFullYear() + '년 ' + (d.getMonth() + 1) + '월 ' + d.getDate() + '일';

        const hasB = !!s.readings.firstReadingB;
        const useB = hasB && track === 'B';
        const firstRef = useB ? s.readings.firstReadingB : s.readings.firstReadingA;

        const roles = ['제1독서', '제2독서', '복음'];
        const refs  = [firstRef, s.readings.secondReading, s.readings.gospel];
        const rows = roles.map((r, i) => `
            <div class="lectionary-row">
                <span class="lectionary-role">${r}</span>
                ${this._refLink(refs[i])}
            </div>`).join('');

        // 연중 시기 두 트랙 토글 (짝 독서가 있는 주일에만 노출)
        const hint = s.bulletinTrack
            ? `이 주일은 주보 기준으로 <strong>${s.bulletinTrack === 'A' ? '연속' : '짝'} 독서</strong>를 봉독합니다.`
            : '사제의 선택에 따라 두 트랙을 오가며 봉독합니다. 이번 주 본문은 주보를 확인해 주세요.';
        const toggle = hasB ? `
            <div class="lect-track" role="group" aria-label="독서 트랙 선택">
                <button type="button" class="lect-track-btn ${useB ? '' : 'is-active'}" data-track="A"
                        aria-pressed="${useB ? 'false' : 'true'}"><span class="lect-track-tag">A</span>연속 독서</button>
                <button type="button" class="lect-track-btn ${useB ? 'is-active' : ''}" data-track="B"
                        aria-pressed="${useB ? 'true' : 'false'}"><span class="lect-track-tag">B</span>짝 독서</button>
            </div>
            <p class="lect-track-hint">${hint}</p>` : '';

        const hasPrev = idx > 0;
        const hasNext = idx < sundays.length - 1;

        return `
        <div class="lect-nav-row">
            <button class="lect-nav-btn" id="lect-prev"
                    ${hasPrev ? '' : 'disabled'} aria-label="이전 주일">‹ 이전</button>
            <span class="lect-nav-label">${s.koreanName}</span>
            <button class="lect-nav-btn" id="lect-next"
                    ${hasNext ? '' : 'disabled'} aria-label="다음 주일">다음 ›</button>
        </div>
        <div class="lectionary-card lectionary-card--current" id="lect-card">
            <div class="lectionary-card-head">
                <p class="lectionary-card-label">가해(A년) · ${dateStr}</p>
                <p class="lectionary-card-week">${s.koreanName}</p>
                ${s.anglicanName && !s.anglicanName.includes('성령강림 후') ? `<p class="lectionary-card-meta">${s.anglicanName}</p>` : ''}
            </div>
            ${toggle}
            <div class="lectionary-card-body">${rows}</div>
            <p class="lectionary-card-note">${s.bulletinReadings ? '주보 기준 독서입니다. ' : ''}본문을 누르면 공동번역 성서(대한성서공회)가 열립니다.</p>
        </div>`;
    },

    _bindLectionaryNav(el, sundays) {
        const container = el.querySelector('.lect-nav-wrap');
        if (!container) return;

        const rerender = () => {
            container.innerHTML = this._lectionaryCardHtml(
                sundays, parseInt(el.dataset.lectionaryIdx), el.dataset.lectionaryTrack);
            this._bindLectionaryNav(el, sundays);
        };
        const moveTo = i => {
            el.dataset.lectionaryIdx = i;
            // 이동한 주일의 주보 확인 트랙으로 초기화
            el.dataset.lectionaryTrack = sundays[i].bulletinTrack || 'B';
            rerender();
        };
        el.querySelector('#lect-prev')?.addEventListener('click', () => {
            const i = parseInt(el.dataset.lectionaryIdx);
            if (i > 0) moveTo(i - 1);
        });
        el.querySelector('#lect-next')?.addEventListener('click', () => {
            const i = parseInt(el.dataset.lectionaryIdx);
            if (i < sundays.length - 1) moveTo(i + 1);
        });
        container.querySelectorAll('.lect-track-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                el.dataset.lectionaryTrack = btn.dataset.track;
                rerender();
            });
        });
    },

    _lectionaryFallback() {
        const w = CHURCH_DATA.worship;
        const r = w && w.currentReadings;
        if (!r) return '<p>전례독서를 불러올 수 없습니다.</p>';
        const items = r.items.filter(it => it.role !== '시편');
        return `
        <div class="lectionary-card lectionary-card--current">
            <div class="lectionary-card-head">
                <p class="lectionary-card-week">${r.week}</p>
                <p class="lectionary-card-meta">${r.year} · ${r.date}</p>
            </div>
            <div class="lectionary-card-body">
                ${items.map(it => `
                <div class="lectionary-row">
                    <span class="lectionary-role">${it.role}</span>
                    ${this._refLink(it.ref)}
                </div>`).join('')}
            </div>
            ${r.note ? `<p class="lectionary-card-note">${r.note}</p>` : ''}
        </div>`;
    },

    /* 이달의 교회력 — worship.html 용 헤더 포함 버전 */
    _monthlyFull(year, month, specialMap) {
        return `
            <div class="section-header">
                <p class="section-eyebrow">Monthly Calendar</p>
                <h2 class="section-title">이달의 교회력</h2>
                <p class="section-sub">이달의 주일과 특별 절기를 한눈에 살펴보세요. 날짜의 배경 색은 그날의 전례색입니다.</p>
            </div>
            <div class="lit-cal-wrap">${this._monthlyGrid(year, month, specialMap)}</div>`;
    },

    /* 교회력 연도 시작 연도(advYear)를 기준으로 이동 절기 날짜 계산 */
    _computeDates(advYear) {
        const ny       = advYear + 1;           // 다음 달력 연도 (부활절·사순절 등이 속함)
        const easter   = LiturgicalCalendar.easterDate(ny);
        const add      = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
        const fmt      = d => `${d.getMonth() + 1}월 ${d.getDate()}일`;
        const ashWed    = add(easter, -46);
        const palmSun   = add(easter, -7);
        const pentecost = add(easter, 49);
        const advent     = LiturgicalCalendar.adventStart(advYear);
        const nextAdvent = LiturgicalCalendar.adventStart(ny);
        return {
            advent:    `${advYear}년 ${fmt(advent)} ~ 12월 24일`,
            christmas: `${advYear}년 12월 25일 ~ ${ny}년 1월 5일`,
            epiphany:  `${ny}년 1월 6일 ~ ${fmt(add(ashWed, -1))}`,
            lent:      `${fmt(ashWed)} ~ ${fmt(add(palmSun, -1))}`,
            holyweek:  `${fmt(palmSun)} ~ ${fmt(add(easter, -1))}`,
            easter:    `${fmt(easter)} ~ ${fmt(add(pentecost, -1))}`,
            pentecost: fmt(pentecost),
            ordinary:  `${fmt(add(pentecost, 1))} ~ ${fmt(add(nextAdvent, -1))}`
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

        const map = {};
        const set = (d, label) => { map[key(d)] = label; };

        set(new Date(year, 0, 6),   '주현절');                             // 1/6
        set(nthWd(year, 2, 5, 1),   '세계기도일');                         // 3월 첫째 금요일
        set(add(easter, -7),         '종려주일');                           // 성주간 시작
        set(easter,                  '부활주일');
        set(add(easter, 42),         '승천주일');                           // easter+39=목요일, 주일 관행=+42
        set(add(pentecost, 7),       '성삼위일체 주일');                    // 성령강림 다음 주일
        set(nthWd(year, 5, 0, 1),   '환경주일');                           // 6월 첫째 주일
        /* 창조절: 9/1~10/4의 모든 주일 */
        let d = nthWd(year, 8, 0, 1);
        while (d <= new Date(year, 9, 4)) { set(d, '창조절'); d = add(d, 7); }
        set(sunOnAfter(new Date(year, 9, 30)), '모든 성인 주일');          // 10/30~11/5 사이 주일
        set(add(advent, -7),         '왕이신 그리스도 주일');               // 대림절 직전 주일
        set(nearSun(new Date(year, 11, 1)), '에이즈 추모 주일');            // 12/1 인근 주일

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
                    <p class="section-eyebrow" style="margin-bottom:0.4rem;">현재 절기 — ${cs.dateLabel}</p>
                    <p style="font-size:1.45rem; font-weight:700; color:var(--heading); margin:0 0 0.3rem;">${cs.symbol} ${cs.name}</p>
                    <p style="font-size:0.92rem; color:var(--text-muted);">${cs.note}</p>
                    ${range ? `<p style="font-size:0.83rem; color:var(--text-muted); margin-top:0.75rem; padding-top:0.65rem; border-top:1px solid var(--border);">${advYear}-${advYear + 1} 교회력 &nbsp;·&nbsp; ${range}</p>` : ''}
                </div>
            </div>`;
    },

    /* 전례력 색 리본 — 8개 절기 색을 교회력 순서로 띠처럼 펼치고, 현재 절기를 도드라지게 */
    _ribbon(cs) {
        const seasons = (CHURCH_DATA.sundays && CHURCH_DATA.sundays.seasons) || [];
        if (!seasons.length) return '';
        const curKey = cs.key;
        const segs = seasons.map(s => {
            const on = s.key === curKey;
            return `<button class="season-ribbon-seg${on ? ' is-current' : ''}" style="--seg:${s.color};" data-season-key="${s.key}" aria-label="${s.name} 절기 정보" aria-expanded="false">${on ? `<span class="season-ribbon-mark" aria-hidden="true">${s.symbol}</span>` : ''}</button>`;
        }).join('');
        return `
            <div class="season-ribbon" aria-label="전례력 절기 색 띠 — 현재 절기 ${cs.name}">${segs}</div>
            <p class="season-ribbon-cap">교회력의 흐름 &middot; 지금은 <strong>${cs.symbol} ${cs.name}</strong></p>
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
                <p class="season-pop-meta">전례색 · ${s.colorName}</p>
                <p class="season-pop-period">📅 ${s.period}</p>
                <p class="season-pop-desc">${s.desc}</p>`;
            pop.hidden = false;
        });

        document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
        document.addEventListener('click', e => { if (!wrap.contains(e.target)) close(); }, { capture: true });
    },

    /* 월간 달력 — 정적 헤더 + 동적 그리드 래퍼 */
    _monthly(year, month, specialMap) {
        return `
            <div class="section-header">
                <p class="section-eyebrow">Monthly Calendar</p>
                <h2 class="section-title">이달의 교회력</h2>
                <p class="section-sub">이달의 주일과 특별 절기를 한눈에 살펴보세요. 날짜의 배경 색은 그날의 전례색이며, 절기가 바뀌는 날부터 색이 달라집니다.</p>
            </div>
            <div class="lit-cal-wrap">${this._monthlyGrid(year, month, specialMap)}</div>`;
    },

    /* 달력 그리드 — 전/다음 달 이동 시 이 부분만 교체 */
    _monthlyGrid(year, month, specialMap) {
        const today      = new Date();
        const todayDate  = (today.getFullYear() === year && today.getMonth() === month) ? today.getDate() : -1;
        const monthLabel = new Date(year, month).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });
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
                        <button class="lit-cal-nav" data-cal-dir="-1" aria-label="이전 달">&#9664;</button>
                        <span class="lit-cal-hd-month">${monthLabel}</span>
                        <button class="lit-cal-nav" data-cal-dir="1" aria-label="다음 달">&#9654;</button>
                    </div>
                    <span class="lit-cal-hd-season">${seasonLabel}</span>
                </div>
                <div class="lit-cal-wds">
                    <span>일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span>
                </div>
                <div class="lit-cal-grid">${cells.join('')}</div>
            </div>
            <ul class="lit-cal-legend" aria-label="달력 보는 법">
                <li data-cal-today role="button" tabindex="0" title="이번 달로 이동"><span class="lit-cal-legend-dot lit-cal-legend-dot--today" aria-hidden="true"></span>오늘</li>
                <li><span class="lit-cal-legend-dot lit-cal-legend-dot--sun" aria-hidden="true"></span>주일 (전례색 강조)</li>
                <li><span class="lit-cal-legend-tag" aria-hidden="true">이름</span>특별 주일·절기</li>
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
        const cards = seasons.map((s, i) => {
            const isCurrent = cs && cs.key === s.key;
            const range = dates[s.key];
            return `
                <div class="resource-card" style="border-top-color:${s.color};${isCurrent ? ' box-shadow:0 0 0 2px ' + s.color + ';' : ''}">
                    <span class="lit-seq" style="border-color:${s.color};" aria-hidden="true">${i + 1}</span>
                    <span class="resource-icon" aria-hidden="true">${s.symbol}</span>
                    <p class="resource-title">${s.name}<span class="resource-desc" style="font-weight:400; margin:0 0 0 0.4em;">${s.en}</span></p>
                    <p class="resource-desc" style="margin-bottom:0.35rem;">전례색 · ${s.colorName}</p>
                    ${range ? `<p class="resource-desc" style="font-weight:600; color:var(--text); margin-bottom:0.4rem;">📅 ${range}</p>` : ''}
                    <p class="resource-desc">${s.desc}</p>
                    ${isCurrent ? `<p class="lit-current-tag">지금 이 절기입니다</p>` : ''}
                </div>`;
        }).join('');
        return `
            <div class="section-header">
                <p class="section-eyebrow">Liturgical Year</p>
                <h2 class="section-title">교회력 절기</h2>
                <p class="section-sub">성공회는 교회력에 따라 그리스도의 생애를 한 해 동안 함께 기억합니다. 교회력의 새해는 1월이 아니라 대림절에 시작하며, 아래 ①~⑧의 순서로 이어집니다. 각 절기의 색은 기도서 전례색입니다.</p>
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
        return `
            <div class="section-header">
                <p class="section-eyebrow">Special Sundays</p>
                <h2 class="section-title">특별 주일</h2>
                <p class="section-sub">대한성공회와 세계교회가 함께 지키는 주요 주일과 절기입니다.</p>
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
        BcpRenderer.render();
        WorshipRenderer.render();
        NewcomerRenderer.render();
        CommunityRenderer.render();
        SmallGroupRenderer.render();
        GivingRenderer.render();
        VisitRenderer.render();
        AnglicanRenderer.render();
        ClergyRenderer.render();
        AboutNavRenderer.render();
        PressRenderer.render();
        FaqRenderer.render();
        MediaRenderer.render();
        MediaHubRenderer.render();
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
            behavior: scrollBehavior()
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
        btn.setAttribute('aria-label', '최상단으로 이동');
        btn.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>`;
        document.body.appendChild(btn);

        btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: scrollBehavior() }));

        let rafId = null;
        const check = () => {
            rafId = null;
            const docH = document.documentElement.scrollHeight;
            const vpH = document.documentElement.clientHeight;
            const scrollable = docH - vpH;
            // 첫 화면(히어로)을 지나 스크롤하면 노출 — 바닥 근처에서야 뜨던 0.7 기준 개선
            btn.classList.toggle('visible', scrollable > 400 && window.scrollY > vpH * 0.9);
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
            (wor.prayer.dailyOffice || []).forEach(o => add(o.title, 'worship.html#daily-office', '성무일과(매일기도)',
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

        // 미디어 (videos.html)
        if (d.media) (d.media.videos || []).forEach(v => add(v.title, 'videos.html', '영상 갤러리',
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
        el.setAttribute('aria-label', '전체 메뉴 및 검색');
        el.setAttribute('aria-hidden', 'true');
        el.innerHTML = `
            <div class="menu-overlay-backdrop" data-close></div>
            <div class="menu-overlay-panel">
                <div class="menu-overlay-bar">
                    <div class="menu-search-box">
                        <svg class="menu-search-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm0-2a9 9 0 0 1 6.32 15.4l4.14 4.13-1.42 1.42-4.13-4.14A9 9 0 1 1 11 2z" fill="currentColor"/></svg>
                        <input id="menu-search-input" class="menu-search-input" type="search" inputmode="search"
                               placeholder="메뉴·내용 검색" autocomplete="off" aria-label="메뉴 검색">
                    </div>
                    <button class="menu-overlay-close" data-close aria-label="닫기">
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

        // 모달 포커스 트랩 — aria-modal 다이얼로그에서 Tab이 배경으로 새지 않도록 (WCAG 2.4.3)
        this._overlay.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;
            const focusables = Array.from(this._overlay.querySelectorAll(
                'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
            )).filter(el => el.offsetParent !== null);  // 보이는 요소만 (숨긴 사이트맵/결과 제외)
            if (!focusables.length) return;
            const first = focusables[0];
            const last  = focusables[focusables.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault(); last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault(); first.focus();
            }
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
            this._results.innerHTML = `<p class="menu-results-empty">'${this._escape(q)}'에 대한 결과가 없습니다.</p>`;
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