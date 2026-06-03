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

/* ── MapHelper ───────────────────────────────────────────── */
const MapHelper = {
    // 광명교회 좌표 (위도 37.4757, 경도 126.8641)
    // 네이버/카카오 iframe은 X-Frame-Options 차단으로 임베드 불가,
    // Google iframe은 한국 라벨이 빈약하여 디자인된 위치 카드 + 외부 앱 이동 방식 채택.
    naverUrl:  "https://map.naver.com/p/search/%EB%8C%80%ED%95%9C%EC%84%B1%EA%B3%B5%ED%9A%8C%20%EA%B4%91%EB%AA%85%EA%B5%90%ED%9A%8C",
    kakaoUrl:  "https://map.kakao.com/link/search/%EB%8C%80%ED%95%9C%EC%84%B1%EA%B3%B5%ED%9A%8C%20%EA%B4%91%EB%AA%85%EA%B5%90%ED%9A%8C",

    _illustration() {
        // 실제 광명교회 주변 (광명IC, 제2경인고속도로, GS칼텍스, 노인회관, SK엔크린, 타이어프로)을
        // 단순화한 일러스트 — viewBox 400x220
        return `
            <svg class="map-preview-svg" viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                <defs>
                    <linearGradient id="map-bg-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stop-color="#f1f0e9"/>
                        <stop offset="100%" stop-color="#e6e4d8"/>
                    </linearGradient>
                    <pattern id="map-topo" width="38" height="38" patternUnits="userSpaceOnUse">
                        <path d="M0 19 Q10 13 19 19 T38 19" stroke="rgba(10,31,18,0.05)" stroke-width="0.6" fill="none"/>
                        <path d="M0 30 Q10 24 19 30 T38 30" stroke="rgba(10,31,18,0.04)" stroke-width="0.6" fill="none"/>
                    </pattern>
                </defs>

                <!-- Background + topo lines (산악 느낌) -->
                <rect width="400" height="220" fill="url(#map-bg-grad)"/>
                <rect width="400" height="220" fill="url(#map-topo)"/>

                <!-- 하천 / 수로 (옅은 청록) — 고속도로 위로 살짝 -->
                <path d="M-10 152 Q70 150 130 154 T260 152 T410 148"
                      stroke="#c7d8d0" stroke-width="2.5" fill="none" opacity="0.6"/>

                <!-- 산 / 녹지 (북동쪽, 옅은 초록) -->
                <path d="M270 -10 Q310 20 350 35 Q380 50 410 60 L410 -10 Z"
                      fill="rgba(58,114,82,0.10)"/>
                <path d="M-10 -10 Q20 10 50 25 L50 -10 Z"
                      fill="rgba(58,114,82,0.10)"/>

                <!-- Building blocks -->
                <g fill="rgba(10,31,18,0.07)">
                    <rect x="155" y="86"  width="42" height="24" rx="2"/>
                    <rect x="155" y="114" width="22" height="18" rx="2"/>
                    <rect x="182" y="114" width="14" height="18" rx="2"/>
                    <rect x="70"  y="92"  width="32" height="22" rx="2"/>
                    <rect x="70"  y="120" width="32" height="18" rx="2"/>
                    <rect x="280" y="86"  width="32" height="24" rx="2"/>
                    <rect x="22"  y="50"  width="38" height="20" rx="2"/>
                </g>

                <!-- 교회 블록 (옅은 골드 강조) -->
                <rect x="184" y="100" width="32" height="34" rx="2" fill="rgba(192,154,96,0.15)" stroke="rgba(192,154,96,0.38)" stroke-width="0.6"/>

                <!-- 광명온신초등학교 부지 (교회 동쪽 바로 옆) -->
                <g>
                    <!-- 부지 (옅은 베이지) -->
                    <rect x="222" y="88" width="46" height="56" rx="3" fill="rgba(232,166,72,0.10)" stroke="rgba(232,166,72,0.32)" stroke-width="0.6"/>
                    <!-- 본관 건물 (위쪽) -->
                    <rect x="226" y="92" width="38" height="14" rx="1.5" fill="rgba(10,31,18,0.14)"/>
                    <!-- 운동장 (아래쪽 사각형 + 트랙 라인) -->
                    <rect x="226" y="112" width="38" height="28" rx="3" fill="#f0e9d8" stroke="rgba(10,31,18,0.18)" stroke-width="0.6"/>
                    <ellipse cx="245" cy="126" rx="14" ry="9" fill="none" stroke="rgba(139,115,85,0.45)" stroke-width="0.6" stroke-dasharray="2 2"/>
                    <!-- 학교 라벨 -->
                    <text x="245" y="100" text-anchor="middle" font-family="Pretendard, sans-serif" font-size="6.5" font-weight="700" fill="#ffffff" opacity="0.95">온신초</text>
                </g>

                <!-- 작은 골목길 (얇은 흰선) -->
                <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.9" fill="none">
                    <path d="M40 68 L130 72 L198 88"/>
                    <path d="M155 110 L260 112"/>
                    <path d="M70 88 L70 140"/>
                    <path d="M260 80 L260 140"/>
                    <path d="M308 60 L320 135"/>
                    <path d="M340 22 L350 85"/>
                </g>

                <!-- 메인 세로 도로 (북쪽 GS칼텍스 방향) -->
                <path d="M196 -10 Q200 38 198 88 L198 144"
                      stroke="#ffffff" stroke-width="11" stroke-linecap="round" fill="none"/>

                <!-- 고속도로 (제2경인) — 가로 오렌지 띠 -->
                <g>
                    <path d="M-10 178 L410 178" stroke="rgba(0,0,0,0.10)" stroke-width="22" stroke-linecap="butt"/>
                    <path d="M-10 178 L410 178" stroke="#e8a648" stroke-width="20" stroke-linecap="butt"/>
                    <path d="M-10 178 L410 178" stroke="#ffffff" stroke-width="0.8" stroke-dasharray="6 6" opacity="0.7"/>
                </g>

                <!-- 광명 IC 인터체인지 (오른쪽 루프) -->
                <g fill="none" stroke="rgba(0,0,0,0.10)" stroke-width="10.5">
                    <path d="M345 178 C 380 178 393 187 388 200 C 380 218 358 220 348 208"/>
                </g>
                <g fill="none" stroke="#e8a648" stroke-width="9" opacity="0.98">
                    <path d="M345 178 C 380 178 393 187 388 200 C 380 218 358 220 348 208"/>
                    <path d="M310 178 Q 330 185 348 198 Q 360 208 372 212"/>
                    <path d="M285 178 Q 302 168 320 162"/>
                </g>

                <!-- IC 표지 -->
                <g transform="translate(364,196)">
                    <rect x="-13" y="-8" width="26" height="16" rx="2" fill="#ffffff" stroke="#c98a2f" stroke-width="1"/>
                    <text x="0" y="3" text-anchor="middle" font-family="Pretendard, sans-serif" font-size="8" font-weight="800" fill="#c98a2f">광명IC</text>
                </g>

                <!-- 랜드마크: GS칼텍스 (북쪽) -->
                <g transform="translate(178,28)">
                    <circle cx="0" cy="0" r="6" fill="#ffffff" stroke="#3d6b4a" stroke-width="1"/>
                    <text x="0" y="3" text-anchor="middle" font-family="Pretendard, sans-serif" font-size="7" font-weight="800" fill="#3d6b4a">GS</text>
                    <text x="10" y="3" font-family="Pretendard, sans-serif" font-size="9" font-weight="600" fill="#3d4a3d">GS칼텍스</text>
                </g>

                <!-- 랜드마크: 원노온사동 노인회관 (북동) -->
                <g transform="translate(298,52)">
                    <circle cx="0" cy="0" r="5" fill="#ffffff" stroke="#6b6b66" stroke-width="0.8"/>
                    <circle cx="0" cy="0" r="2" fill="#6b6b66"/>
                    <text x="-2" y="-9" text-anchor="middle" font-family="Pretendard, sans-serif" font-size="9" font-weight="500" fill="#3d4a3d">노인회관</text>
                </g>

                <!-- 랜드마크: SK엔크린 (남서) -->
                <g transform="translate(44,148)">
                    <circle cx="0" cy="0" r="6" fill="#ffffff" stroke="#3d6b4a" stroke-width="1"/>
                    <text x="0" y="3" text-anchor="middle" font-family="Pretendard, sans-serif" font-size="7" font-weight="800" fill="#3d6b4a">SK</text>
                    <text x="-9" y="-10" font-family="Pretendard, sans-serif" font-size="9" font-weight="600" fill="#3d4a3d">SK엔크린</text>
                </g>

                <!-- Center marker shadow -->
                <ellipse cx="200" cy="125" rx="22" ry="5.5" fill="rgba(10,31,18,0.22)"/>

                <!-- Pin (위로 살짝 — 고속도로 칩과 분리) -->
                <g transform="translate(200,98)">
                    <path d="M0 -30 C-16 -30 -28 -18 -28 -3 C-28 14 0 28 0 28 C0 28 28 14 28 -3 C28 -18 16 -30 0 -30 Z" fill="#0a1f12"/>
                    <circle cx="0" cy="-2" r="13" fill="#ffffff"/>
                    <g transform="translate(-7,-9) scale(0.22)">
                        <path d="${CANTERBURY_CROSS_PATH}" fill="#0a1f12" fill-rule="evenodd"/>
                    </g>
                </g>

                <!-- "광명교회" label chip — pin 바로 아래 -->
                <g transform="translate(200,143)">
                    <rect x="-42" y="-10" width="84" height="20" rx="10" fill="#0a1f12"/>
                    <text x="0" y="4" text-anchor="middle" font-family="Pretendard, sans-serif" font-size="11" font-weight="700" fill="#ffffff">광명교회</text>
                </g>
            </svg>
        `;
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
                <div class="map-preview" aria-hidden="true">${this._illustration()}</div>
                <div class="map-card-addr">
                    <div class="map-addr-row">
                        <span class="map-addr-tag">도로명</span>
                        <span class="map-addr-text">${addr}</span>
                        <button class="map-copy-btn" data-copy="${addr}" onclick="MapHelper.copyAddr(this)" aria-label="도로명 주소 복사">복사</button>
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
                        <a href="worship.html#lectionary" class="footer-ext-link">전례독서</a>
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
        if (stats) stats.innerHTML = `
            <div class="hero-stat"><span class="hero-stat-val">${foundedYear}</span><span class="hero-stat-lbl">설립</span></div>
            <span class="hero-stat-divider" aria-hidden="true"></span>
            <div class="hero-stat"><span class="hero-stat-val">오전 11:00</span><span class="hero-stat-lbl">주일 예배</span></div>
            <span class="hero-stat-divider" aria-hidden="true"></span>
            <div class="hero-stat"><span class="hero-stat-val">경기도 광명시</span><span class="hero-stat-lbl">위치</span></div>
        `;
    },

    _about() {
        const el = document.getElementById('about-brief-content');
        if (!el) return;
        const { name, established, diocese, aboutLead, aboutDesc, award } = CHURCH_DATA.info;
        el.innerHTML = `
            <div class="about-brief">
                <p class="about-brief-lead">${aboutLead}</p>
                <p class="about-brief-desc">${aboutDesc}</p>
                <ul class="about-brief-facts">
                    <li><strong>이름</strong><span>${name}</span></li>
                    <li><strong>설립</strong><span>${established}</span></li>
                    <li><strong>소속</strong><span>${diocese}</span></li>
                </ul>
                ${award ? `
                <a href="${award.href}" class="about-brief-award">
                    <span class="about-brief-award-icon" aria-hidden="true">🌿</span>
                    <span class="about-brief-award-body">
                        <strong>${award.year} ${award.title}</strong>
                        <span>${award.org}</span>
                    </span>
                    <span class="about-brief-award-arrow" aria-hidden="true">→</span>
                </a>` : ''}
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

/* ── WorshipRenderer ─────────────────────────────────────── */
const WorshipRenderer = {
    render() {
        const el = document.getElementById('worship-full');
        if (!el) return;
        const { main, guide, liturgicalSeason: s, resources, prayer } = CHURCH_DATA.worship;
        document.documentElement.style.setProperty('--season', s.color);
        document.documentElement.style.setProperty('--season-light', s.colorLight);

        el.innerHTML = `
            <div class="grid" style="margin-bottom:2rem;">
                ${main.map(w => `
                    <div class="info-card" id="${w.id}">
                        <h3>${w.title}</h3>
                        <div class="info-row">
                            <strong>시간</strong>
                            <span style="color:var(--green-mid); font-weight:700;">${w.time}</span>
                        </div>
                        <p style="margin-top:1rem; color:var(--text-muted); font-size:0.9rem; line-height:1.9;">${w.desc}</p>
                        ${w.verse ? `
                        <blockquote class="liturgy-inner-quote" style="margin-top:1.25rem; font-size:0.9rem;">
                            "${w.verse}"<br><cite style="font-size:0.8rem; font-style:normal; color:var(--text-muted);">— ${w.verseRef}</cite>
                        </blockquote>
                        <p style="margin-top:1rem; font-size:0.87rem; color:var(--text-muted); line-height:1.9;">${w.detail}</p>
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

                <div class="liturgy-section">
                    <p class="section-eyebrow">Eucharist</p>
                    <h2 class="section-title">감사성찬례란?</h2>
                    <p class="liturgy-body">성공회 주일 예배의 중심은 <strong>감사성찬례</strong>입니다. 천주교의 '미사', 개신교의 '성만찬'과 같은 예배로, 그리스도교 예배의 출발이자 핵심입니다.</p>
                    <blockquote class="liturgy-inner-quote">
                        감사성찬례는 예수님의 마지막 만찬에서 비롯되었으며, <strong>공동체가 함께 모여 말씀을 듣고 성찬을 나누는</strong> 시간입니다.
                    </blockquote>
                </div>

                <div class="liturgy-section" id="eucharist-order">
                    <p class="section-eyebrow">Order of Service</p>
                    <h2 class="section-title">감사성찬례 순서</h2>
                    <p class="liturgy-body" style="margin-bottom:1.5rem;">성공회 기도서에 따른 감사성찬례는 크게 <strong>네 부분</strong>으로 구성됩니다.</p>
                    <div class="liturgy-steps">
                        <div class="liturgy-step">
                            <div class="step-num">1</div>
                            <div class="step-body">
                                <h4 class="step-title">입당예식</h4>
                                <ul class="step-list">
                                    <li>입당 성가와 함께 집전자가 입장합니다.</li>
                                    <li>회중은 모두 일어나 하느님께 예배드릴 준비를 합니다.</li>
                                    <li>죄를 고백하고 용서를 구합니다.</li>
                                </ul>
                            </div>
                        </div>
                        <div class="liturgy-step">
                            <div class="step-num">2</div>
                            <div class="step-body">
                                <h4 class="step-title">말씀의 전례</h4>
                                <ul class="step-list">
                                    <li>구약 성서 봉독 · 시편 화답송 · 서신서 봉독</li>
                                    <li>복음환호송(<em>"알렐루야, 알렐루야"</em>) 후 <strong>복음서 봉독</strong>과 설교</li>
                                    <li>사도신경 또는 니케아 신경으로 신앙을 함께 고백합니다.</li>
                                    <li>교회와 세상, 이웃과 자신을 위한 중보기도 — 회중은 <em>"주여, 우리의 기도를 들으소서"</em>로 응답합니다.</li>
                                </ul>
                            </div>
                        </div>
                        <div class="liturgy-step">
                            <div class="step-num">3</div>
                            <div class="step-body">
                                <h4 class="step-title">성찬의 전례</h4>
                                <ul class="step-list">
                                    <li>평화의 인사를 나눕니다.</li>
                                    <li>빵과 포도주, 헌금을 봉헌하고 집전자가 <strong>빵과 포도주를 축성</strong>합니다.</li>
                                    <li>주님의 기도 후 <strong>영성체</strong> — 그리스도의 몸과 피를 모십니다.</li>
                                </ul>
                            </div>
                        </div>
                        <div class="liturgy-step">
                            <div class="step-num">4</div>
                            <div class="step-body">
                                <h4 class="step-title">파송예식</h4>
                                <ul class="step-list">
                                    <li>감사 기도와 강복을 받습니다.</li>
                                    <li><em>"나가서 주님의 복음을 전합시다 / 평화를 이룹시다 / 사랑을 나눕시다"</em></li>
                                    <li>회중: <em>"그리스도의 이름으로. 아멘"</em> — 우리는 세상으로 파송되는 선교사가 됩니다.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="liturgy-section" id="lectionary">
                    <p class="section-eyebrow">Lectionary</p>
                    <h2 class="section-title">전례독서</h2>
                    <p class="liturgy-body" style="margin-bottom:1.5rem;">성공회 전례력에 따른 성서 본문을 확인하실 수 있습니다.</p>
                    <div class="lectionary-cal-wrap">
                        <iframe
                            src="https://calendar.google.com/calendar/embed?src=anglican.kr_ep5i6qcm67gl19st7m0fd32l30%40group.calendar.google.com&ctz=Asia%2FSeoul&mode=AGENDA&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=0&showCalendars=0&showTz=0&hl=ko"
                            class="lectionary-cal"
                            frameborder="0"
                            scrolling="no"
                            title="전례독서 일정"
                            loading="lazy"
                        ></iframe>
                    </div>
                </div>

                ${resources && resources.length ? `
                <div class="liturgy-section" id="resources">
                    <p class="section-eyebrow">Worship Resources</p>
                    <h2 class="section-title">예배 자료</h2>
                    <p class="liturgy-body" style="margin-bottom:1.5rem;">기도서·성가·성서를 온라인으로도 보실 수 있습니다.</p>
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
                ` : ''}

                ${prayer ? `
                <div class="liturgy-section" id="daily-office">
                    <p class="section-eyebrow">DIVINE OFFICE</p>
                    <h2 class="section-title">성무일도</h2>
                    ${(prayer.dailyOfficeIntro || []).map((p, i) => `
                        <p class="liturgy-body"${i === prayer.dailyOfficeIntro.length - 1 ? ' style="margin-bottom:1.5rem;"' : ''}>${p}</p>
                    `).join('')}
                    <div class="resource-grid">
                        ${prayer.dailyOffice.map(o => `
                            <a class="resource-card" href="${o.url}" target="_blank" rel="noopener noreferrer">
                                <span class="resource-icon" aria-hidden="true">${o.icon}</span>
                                <h3 class="resource-title">${o.title}</h3>
                                <p class="resource-desc" style="font-size:0.78rem; color:var(--text-muted); margin-bottom:0.4rem;">${o.en}</p>
                                <p class="resource-desc">${o.desc}</p>
                                <span class="resource-link">기도서 열기 <span aria-hidden="true">↗</span></span>
                            </a>
                        `).join('')}
                    </div>
                </div>

                <div class="liturgy-section" id="intercession">
                    <p class="section-eyebrow">Anglican Cycle of Prayer</p>
                    <h2 class="section-title">세계성공회 중보기도</h2>
                    <p class="liturgy-body" style="margin-bottom:1.5rem;">세계성공회(Anglican Communion)는 날마다 특정 교구와 지역 교회를 위해 함께 기도하는 기도 달력을 발행합니다. 전 세계 165개 이상의 나라에 퍼져 있는 성공회 공동체와 하나로 이어지는 기도입니다.</p>
                    <div class="resource-grid" style="--resource-cols:1;">
                        <a class="resource-card" href="${prayer.intercession.url}" target="_blank" rel="noopener noreferrer">
                            <span class="resource-icon" aria-hidden="true">${prayer.intercession.icon}</span>
                            <h3 class="resource-title">${prayer.intercession.title}</h3>
                            <p class="resource-desc" style="font-size:0.78rem; color:var(--text-muted); margin-bottom:0.4rem;">${prayer.intercession.en}</p>
                            <p class="resource-desc">${prayer.intercession.desc}</p>
                            <span class="resource-link">PDF 내려받기 <span aria-hidden="true">↗</span></span>
                        </a>
                    </div>
                </div>
                ` : ''}
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
        document.documentElement.style.setProperty('--season', s.color);
        document.documentElement.style.setProperty('--season-light', s.colorLight);
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
                        <div class="newcomer-key-row">
                            <span class="newcomer-key-label">복장</span>
                            <span class="newcomer-key-value">단정한 평상복이면 충분합니다</span>
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
                       class="iona-link-card"
                       onmouseover="this.classList.add('iona-link-card--hover')"
                       onmouseout="this.classList.remove('iona-link-card--hover')">
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
                       class="iona-link-card"
                       onmouseover="this.classList.add('iona-link-card--hover')"
                       onmouseout="this.classList.remove('iona-link-card--hover')">
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
                       class="iona-link-card"
                       onmouseover="this.classList.add('iona-link-card--hover')"
                       onmouseout="this.classList.remove('iona-link-card--hover')">
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

        el.innerHTML = `
            <div class="section-header">
                <p class="section-eyebrow">YouTube</p>
                <h2 class="section-title">교회 영상</h2>
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

/* ── PressRenderer ───────────────────────────────────────── */
const PressRenderer = {
    render() {
        const el = document.getElementById('press-table');
        if (!el || !CHURCH_DATA.press) return;
        el.innerHTML = `
            <ul class="press-list">
                ${CHURCH_DATA.press.map(p => `
                    <li class="press-item">
                        <span class="press-year">${p.year}</span>
                        <div class="press-main">
                            <a href="${p.url}" target="_blank" rel="noopener" class="press-link">${p.title}</a>
                            <span class="press-meta">${p.media} · ${p.date}</span>
                        </div>
                    </li>
                `).join('')}
            </ul>
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
            '.draft-banner',
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

/* ── App bootstrap ───────────────────────────────────────── */
const App = {
    init() {
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
        MediaRenderer.render();
        LinksRenderer.render();
        this._handleHashScroll();
        ScrollReveal.init();
        ScrollProgress.init();
        BackToTop.init();
        PortraitLightbox.init();
        MenuOverlay.init();
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
        btn.setAttribute('aria-label', '최상단으로 이동');
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
    _staticPages: [
        { url: 'story.html',       group: '교회 이야기' },
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