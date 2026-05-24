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

/* ── MapHelper ───────────────────────────────────────────── */
const MapHelper = {
    // 광명교회 좌표 (위도 37.4757, 경도 126.8641)
    // 카카오 embed가 외부 도메인 iframe을 차단하여 Google Maps embed 사용
    iframeUrl: "https://maps.google.com/maps?q=37.4757,126.8641&hl=ko&z=17&output=embed",
    linkUrl:   "https://map.kakao.com/link/map/대한성공회광명교회,37.475700,126.864100",

    html(compact = false) {
        const h = compact ? '220px' : '300px';
        return `
            <div style="border-radius:var(--radius-md); overflow:hidden; border:1px solid var(--border); margin-bottom:1rem; height:${h}; background:#e8f5e9;">
                <iframe
                    src="${this.iframeUrl}"
                    width="100%" height="100%"
                    frameborder="0"
                    scrolling="no"
                    marginheight="0"
                    marginwidth="0"
                    loading="lazy"
                    title="광명교회 오시는 길"
                    style="display:block;"
                ></iframe>
            </div>
            <a href="${this.linkUrl}" target="_blank" rel="noopener"
               style="display:inline-flex; align-items:center; gap:0.4rem;
                      color:var(--green-mid); font-weight:700; font-size:0.88rem;">
                카카오지도에서 크게 보기 →
            </a>
        `;
    }
};

/* ── NavRenderer ─────────────────────────────────────────── */
const NavRenderer = {
    render() {
        const nav = document.getElementById('main-nav');
        if (!nav) return;

        const items = CHURCH_DATA.navigation.map(item => `
            <li class="nav-item has-dropdown">
                <a href="${item.href}" class="nav-link">${item.label}</a>
                <ul class="dropdown">
                    ${item.items.map(sub =>
                        `<li><a href="${sub.href}">${sub.label}</a></li>`
                    ).join('')}
                </ul>
            </li>
        `).join('');

        nav.innerHTML = `
            <div class="container nav-inner">
                <a href="index.html" class="nav-logo">
                    <span class="nav-logo-mark" aria-hidden="true">
                        <svg viewBox="0 0 64 64" focusable="false">
                            <rect width="64" height="64" rx="12" fill="#ffffff"/>
                            <text x="32" y="42" text-anchor="middle"
                                  font-family="inherit" font-weight="800"
                                  font-size="22" fill="#1b4d2e" letter-spacing="-1">GMC</text>
                        </svg>
                    </span>
                    <span class="nav-logo-text">
                        <span class="nav-logo-name">${CHURCH_DATA.info.name}</span>
                        <span class="nav-logo-sub">${CHURCH_DATA.info.subName}</span>
                    </span>
                </a>
                <button class="nav-toggle" id="nav-toggle" aria-label="메뉴 열기" aria-expanded="false">
                    <span></span><span></span><span></span>
                </button>
                <ul class="nav-menu" id="nav-menu" role="navigation">${items}</ul>
            </div>
        `;

        this._bindEvents();
    },

    _bindEvents() {
        const header = document.querySelector('.nav-header');
        const toggle = document.getElementById('nav-toggle');
        const menu   = document.getElementById('nav-menu');
        if (!toggle || !menu) return;

        if (header) {
            window.addEventListener('scroll', () => {
                header.classList.toggle('scrolled', window.scrollY > 50);
            }, { passive: true });
        }

        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = menu.classList.toggle('open');
            toggle.setAttribute('aria-expanded', isOpen);
        });

        menu.querySelectorAll('.has-dropdown > .nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    link.closest('.nav-item').classList.toggle('mobile-open');
                }
            });
        });

        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && !toggle.contains(e.target)) {
                menu.classList.remove('open');
                toggle.setAttribute('aria-expanded', false);
            }
        });
    }
};

/* ── FooterRenderer ──────────────────────────────────────── */
const FooterRenderer = {
    render() {
        const footer = document.getElementById('main-footer');
        if (!footer) return;
        const { info, clergy, sns } = CHURCH_DATA;
        footer.innerHTML = `
            <div class="container">
                <div class="footer-inner">
                    <div class="footer-col">
                        <h4>광명교회</h4>
                        <p>${info.name}<br>${info.subName}<br>설립 ${info.established}</p>
                    </div>
                    <div class="footer-col">
                        <h4>연락처</h4>
                        <p>${info.addressShort}<br>Tel. ${info.phone}<br>${clergy[0].name} ${clergy[0].title.split('·')[0].trim()}</p>
                    </div>
                    <div class="footer-col">
                        <h4>바로가기</h4>
                        <a href="${sns.youtube}"   target="_blank" rel="noopener">유튜브 채널</a>
                        <a href="${sns.instagram}" target="_blank" rel="noopener">인스타그램</a>
                        <a href="${sns.diocesan}"  target="_blank" rel="noopener">성공회 서울교구</a>
                    </div>
                </div>
                <div class="footer-bottom">
                    <span>© 2026 ${info.name}. All rights reserved.</span>
                    <span>대한성공회 서울교구</span>
                </div>
            </div>
        `;
    }
};

/* ── IndexRenderer ───────────────────────────────────────── */
const IndexRenderer = {
    render() {
        this._hero();
        this._worship();
        this._community();
        this._giving();
    },

    _hero() {
        const t = document.getElementById('hero-title');
        const s = document.getElementById('hero-sub');
        if (t) t.textContent = CHURCH_DATA.info.name;
        if (s) s.textContent = CHURCH_DATA.info.slogan;
    },

    _worship() {
        const el = document.getElementById('worship-grid');
        if (!el) return;
        el.innerHTML = CHURCH_DATA.worship.main.map(w => `
            <div class="card">
                <h3>${w.title}</h3>
                <p style="font-weight:700; color:var(--green-mid); margin-bottom:0.5rem;">${w.time}</p>
                <p style="color:var(--text-muted); font-size:0.9rem;">${w.desc}</p>
            </div>
        `).join('');
        const guide = document.getElementById('worship-guide');
        if (guide) guide.innerHTML = `<p>${CHURCH_DATA.worship.guide}</p>`;
    },

    _community() {
        const el = document.getElementById('community-grid');
        if (!el) return;
        el.innerHTML = CHURCH_DATA.community.groups.map(g => `
            <div class="card" style="text-align:center;">
                <div class="card-icon">${g.icon}</div>
                <h3>${g.title}</h3>
                <p style="color:var(--text-muted); font-size:0.9rem;">${g.desc}</p>
            </div>
        `).join('');
    },

    _giving() {
        const el = document.getElementById('bank-info');
        if (!el) return;
        const { bankName, bank, holder, report } = CHURCH_DATA.giving;
        const { addressShort, phone } = CHURCH_DATA.info;
        el.innerHTML = `
            <h3>봉헌 안내</h3>
            <div class="bank-card">
                <p style="font-size:0.8rem; color:var(--green-mid); margin-bottom:0.3rem;">${bankName}</p>
                <p class="account">${bank}</p>
                <p class="sub">예금주 ${holder}</p>
            </div>
            <p style="font-size:0.83rem; color:var(--text-muted);">${report}</p>
        `;

        // 오시는 길 카드에 지도 삽입
        const locationEl = document.getElementById('location-card');
        if (locationEl) {
            locationEl.innerHTML = `
                <h3>광명교회로 오시는 길</h3>
                ${MapHelper.html(true)}
                <div style="margin-top:1rem;">
                    <div class="info-row"><strong>주소</strong><span>${addressShort}</span></div>
                    <div class="info-row"><strong>전화</strong><span>${phone}</span></div>
                </div>
                <p style="margin-top:1.25rem;">
                    <a href="visit.html" style="color:var(--green-mid); font-weight:700; font-size:0.88rem;">자세히 보기 →</a>
                </p>
            `;
        }
    }
};

/* ── WorshipRenderer ─────────────────────────────────────── */
const WorshipRenderer = {
    render() {
        const el = document.getElementById('worship-full');
        if (!el) return;
        const { main, guide, liturgyInfo } = CHURCH_DATA.worship;

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
                    </div>
                `).join('')}
            </div>
            <div class="guide-banner"><p>${guide}</p></div>
            <div style="margin-top:3rem;">
                <div class="section-eyebrow">Anglican Liturgy</div>
                <h2 class="section-title" style="margin-bottom:2rem;">성공회 전례 안내</h2>
                <div class="grid">
                    ${liturgyInfo.map((item, i) => `
                        <div class="info-card" ${i === 0 ? `id="${item.id}"` : ''}>
                            <h3>${item.title}</h3>
                            <p style="font-size:0.9rem; color:var(--text-muted); line-height:1.9;">${item.desc}</p>
                        </div>
                    `).join('')}
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
        const { bankName, bank, holder, report } = CHURCH_DATA.giving;

        el.innerHTML = `
            <div class="info-card" id="offering" style="max-width:640px; margin:0 auto;">
                <h3>봉헌 계좌</h3>
                <div class="bank-card">
                    <p style="font-size:0.8rem; color:var(--green-mid); margin-bottom:0.3rem;">${bankName}</p>
                    <p class="account">${bank}</p>
                    <p class="sub">예금주 ${holder}</p>
                </div>
                <p style="font-size:0.88rem; color:var(--text-muted); line-height:1.8;" id="report">${report}</p>
            </div>
        `;
    }
};

/* ── VisitRenderer ───────────────────────────────────────── */
const VisitRenderer = {
    render() {
        const el = document.getElementById('visit-full');
        if (!el) return;
        const { address, phone, fax } = CHURCH_DATA.info;

        el.innerHTML = `
            <div class="info-card" id="location" style="max-width:760px; margin:0 auto 1.5rem;">
                <h3>주소와 연락처</h3>
                ${MapHelper.html(false)}
                <div style="margin-top:1.5rem;">
                    <div class="info-row"><strong>주소</strong><span>${address}</span></div>
                    <div class="info-row"><strong>전화</strong><span>${phone}</span></div>
                    <div class="info-row"><strong>팩스</strong><span>${fax}</span></div>
                </div>
            </div>
            <div class="info-card" id="parking" style="max-width:760px; margin:0 auto;">
                <h3>교통·주차 안내</h3>
                <div class="info-row">
                    <strong>승용차</strong>
                    <span>내비게이션에 <em>대한성공회 광명교회</em> 또는 위 주소를 검색해 주세요.</span>
                </div>
                <div class="info-row">
                    <strong>대중교통</strong>
                    <span>정확한 대중교통 안내는 교회 사무실(${phone})로 문의해 주세요.</span>
                </div>
                <div class="info-row">
                    <strong>주차</strong>
                    <span>주차 가능 여부는 방문 전 교회 사무실로 확인 부탁드립니다.</span>
                </div>
                <p style="margin-top:1.5rem; padding-top:1.25rem; border-top:1px solid var(--border); font-size:0.85rem; color:var(--text-muted); line-height:1.7;">
                    ※ 카카오맵·네이버지도에서 <strong>대한성공회 광명교회</strong> 또는 <strong>성 디모테오 성당</strong>으로 검색하시면 최단 경로 안내를 받으실 수 있습니다.
                </p>
            </div>
        `;
    }
};

/* ── ClergyRenderer ──────────────────────────────────────── */
const ClergyRenderer = {
    render() {
        this._clergy();
        this._philosophy();
    },

    _clergy() {
        const el = document.getElementById('clergy-full');
        if (!el) return;
        el.innerHTML = CHURCH_DATA.clergy.map((c, i) => `
            <div class="clergy-card" ${i === 0 ? 'id="priest"' : ''} style="${i > 0 ? 'margin-top:1.5rem;' : ''}">
                <div class="clergy-avatar">✝️</div>
                <div>
                    <div class="clergy-name">${c.name} 사제</div>
                    <div class="clergy-title">${c.title}</div>
                    ${c.ordained ? `<div style="font-size:0.78rem; color:var(--text-muted); margin-top:0.2rem;">${c.ordained}</div>` : ''}
                    ${c.quote ? `<div class="quote-block"><p>"${c.quote}"</p></div>` : ''}
                    <p class="clergy-desc">${c.desc}</p>
                    ${c.contact ? `<p style="margin-top:0.9rem; font-size:0.83rem; color:var(--green-mid);">📞 ${c.contact}</p>` : ''}
                    ${c.kyoboUrl ? `<p style="margin-top:0.6rem; font-size:0.83rem;">📚 <a href="${c.kyoboUrl}" target="_blank" rel="noopener" style="color:var(--green-mid); font-weight:600;">저서 목록 (교보문고)</a></p>` : ''}
                </div>
            </div>
        `).join('');
    },

    _philosophy() {
        const el = document.getElementById('philosophy-full');
        if (!el) return;
        el.innerHTML = `
            <div class="values-grid" id="philosophy">
                ${CHURCH_DATA.philosophy.values.map(v => `
                    <div class="value-card">
                        <div class="val-icon">${v.icon}</div>
                        <h4>${v.title}</h4>
                        <p>${v.desc}</p>
                    </div>
                `).join('')}
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

/* ── App bootstrap ───────────────────────────────────────── */
const App = {
    init() {
        NavRenderer.render();
        FooterRenderer.render();
        IndexRenderer.render();
        WorshipRenderer.render();
        CommunityRenderer.render();
        GivingRenderer.render();
        VisitRenderer.render();
        ClergyRenderer.render();
        PressRenderer.render();
        this._handleHashScroll();
    },

    _handleHashScroll() {
        const hash = window.location.hash;
        if (!hash) return;
        setTimeout(() => {
            const target = document.querySelector(hash);
            if (target) {
                const offset = parseInt(getComputedStyle(document.documentElement)
                    .getPropertyValue('--nav-h')) || 64;
                const top = target.getBoundingClientRect().top + window.scrollY - offset - 16;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        }, 80);
    }
};

window.addEventListener('DOMContentLoaded', () => App.init());
