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
                <button class="nav-chevron" aria-label="${item.label} 하위 메뉴" aria-expanded="false">
                    <svg viewBox="0 0 10 6" width="10" height="6" aria-hidden="true"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
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
                            <text x="32" y="40" text-anchor="middle"
                                  font-family="inherit" font-weight="800"
                                  font-size="19" fill="#1b4d2e" letter-spacing="-0.5">ACGM</text>
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

        menu.querySelectorAll('.dropdown a').forEach(a => {
            a.addEventListener('click', () => {
                menu.classList.remove('open');
                toggle.setAttribute('aria-expanded', false);
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
                        <a href="${sns['naver blog']}" target="_blank" rel="noopener">네이버 블로그</a>
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
        this._about();
        this._worship();
        this._giving();
    },

    _hero() {
        const t = document.getElementById('hero-title');
        const s = document.getElementById('hero-sub');
        if (t) t.textContent = CHURCH_DATA.info.name;
        if (s) s.textContent = CHURCH_DATA.info.slogan;
    },

    _about() {
        const el = document.getElementById('about-brief-content');
        if (!el) return;
        const { name, subName, slogan, vision, established } = CHURCH_DATA.info;
        el.innerHTML = `
            <div class="about-brief">
                <p class="about-brief-lead">${slogan}</p>
                <p class="about-brief-desc">${vision}. 성공회 전통 안에서 깊은 전례와 따뜻한 환대를 함께 나누는 공동체입니다. 처음 오시는 분도, 오래 머무신 분도 모두 환영합니다.</p>
                <ul class="about-brief-facts">
                    <li><strong>이름</strong><span>${name} · ${subName}</span></li>
                    <li><strong>설립</strong><span>${established}</span></li>
                    <li><strong>소속</strong><span>대한성공회 서울교구 서부교무구</span></li>
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
        const { main, guide, liturgicalSeason: s } = CHURCH_DATA.worship;

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

            <div class="liturgy-guide" id="newcomer">
                <div class="liturgy-season-badge">
                    <span class="season-dot" style="background:${s.color};"></span>
                    ${s.symbol}&nbsp;${s.name}&nbsp;·&nbsp;<span style="color:${s.color}; font-weight:700;">${s.colorName}</span>
                    <span class="season-note">${s.note}</span>
                </div>

                <div class="liturgy-section">
                    <p class="section-eyebrow" style="color:${s.color};">Anglican Liturgy</p>
                    <h2 class="section-title">성공회 전례란?</h2>
                    <p class="liturgy-body">성공회(Anglican Church)는 <strong>말씀과 성찬을 함께 중시하는 전례 교회</strong>입니다. 초대교회로부터 내려오는 말씀의 전례와 성찬의 전례가 아름답게 조화를 이루는 깊은 영성의 예배 전통을 400여 년간 이어오고 있습니다.</p>
                    <p class="liturgy-body">성공회의 예배는 <strong>성공회 기도서(Book of Common Prayer)</strong>에 따라 드립니다. 1549년 캔터베리 대주교 토마스 크랜머가 주도하여 처음 편찬한 성공회 기도서는, 라틴어가 아닌 회중이 알아듣는 자국어로 예배드려 <strong>모든 신자가 전례에 능동적으로 참여</strong>할 수 있도록 했다는 점에서 종교개혁의 중요한 유산입니다.</p>
                    <div class="liturgy-card" style="border-left-color:${s.color};">
                        <h3 class="liturgy-card-title">전례 교회의 의미</h3>
                        <p class="liturgy-body"><strong>'전례(典禮, Liturgy)'</strong>는 그리스어 <em>레이투르기아(λειτουργία)</em>에서 온 말로, "공동체를 위해 수행하는 일"을 뜻합니다. 곧 전례는 <strong>그리스도인이 함께 드리고 함께 살아내는 신앙의 실천</strong>입니다.</p>
                        <ul class="liturgy-list">
                            <li><strong>회중이 함께 기도하고 응답하는 대화 형식</strong>으로 진행됩니다.</li>
                            <li><strong>모든 신자가 성직자와 동등하게 예배를 '드리는' 주체</strong>입니다.</li>
                            <li>성서, 성가집, 기도서, 주보를 함께 펴들고 능동적으로 참여합니다.</li>
                        </ul>
                    </div>
                </div>

                <div class="liturgy-section">
                    <p class="section-eyebrow" style="color:${s.color};">Eucharist</p>
                    <h2 class="section-title">감사성찬례란?</h2>
                    <p class="liturgy-body">성공회 주일 예배의 핵심은 <strong>감사성찬례</strong>입니다. 천주교의 '미사', 개신교의 '주님의 만찬'과 같은 예배로, 그리스도교 예배의 출발이자 기초이며 핵심입니다.</p>
                    <blockquote class="liturgy-inner-quote" style="border-left-color:${s.color};">
                        감사성찬례는 빵과 포도주를 나누는 예수님의 마지막 만찬에서 비롯되었으며, <strong>하느님 앞에서 공동체로 모여 말씀을 듣고 성찬을 나누는</strong> 거룩한 시간입니다.
                    </blockquote>
                </div>

                <div class="liturgy-section" id="eucharist-order">
                    <p class="section-eyebrow" style="color:${s.color};">Order of Service</p>
                    <h2 class="section-title">감사성찬례 순서</h2>
                    <p class="liturgy-body" style="margin-bottom:1.5rem;">성공회 기도서에 따른 감사성찬례는 크게 <strong>네 부분</strong>으로 구성됩니다.</p>
                    <div class="liturgy-steps">
                        <div class="liturgy-step">
                            <div class="step-num" style="background:${s.color};">1</div>
                            <div class="step-body">
                                <h4 class="step-title">입당예식</h4>
                                <ul class="step-list">
                                    <li>입당 성가와 함께 집전자가 입장합니다.</li>
                                    <li>회중은 다 함께 일어나 하느님께 예배드릴 준비를 합니다.</li>
                                    <li>죄를 고백하고 용서를 구하는 시간을 가집니다.</li>
                                </ul>
                            </div>
                        </div>
                        <div class="liturgy-step">
                            <div class="step-num" style="background:${s.color};">2</div>
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
                            <div class="step-num" style="background:${s.color};">3</div>
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
                            <div class="step-num" style="background:${s.color};">4</div>
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

                <div class="liturgy-section" id="communion">
                    <p class="section-eyebrow" style="color:${s.color};">Holy Communion</p>
                    <h2 class="section-title">영성체 안내</h2>
                    <div class="communion-grid">
                        <div class="communion-card" style="border-top-color:${s.color}; background:${s.colorLight};">
                            <h3>세례받으신 분</h3>
                            <p class="liturgy-body">성공회는 <strong>열린 성찬(Open Communion)</strong> 전통을 따릅니다. 교파에 관계없이 <strong>세례받은 그리스도인이라면 누구나</strong> 그리스도의 몸과 피를 모실 수 있습니다.</p>
                            <ul class="liturgy-list">
                                <li>제대 앞으로 나오셔서 두 손을 모으거나 펴고 빵을 받으십시오.</li>
                                <li>빵을 모신 후 포도주 잔이 전해지면 한 모금 받으십시오.</li>
                            </ul>
                        </div>
                        <div class="communion-card" style="border-top-color:var(--green-mid); background:var(--green-light);">
                            <h3>아직 세례를 받지 않으신 분</h3>
                            <p class="liturgy-body"><strong>제대 앞에 나오셔서 강복(축복)을 받으실 수 있습니다.</strong></p>
                            <ul class="liturgy-list">
                                <li>두 손을 가슴에 X자로 모으시면, 집전자가 머리에 손을 얹고 강복해 드립니다.</li>
                                <li>부담 갖지 마시고 편안한 마음으로 나오세요. 그 자체가 하느님께서 여러분을 맞이하시는 시간입니다.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="liturgy-section" id="firsttime">
                    <p class="section-eyebrow" style="color:${s.color};">First Visit</p>
                    <h2 class="section-title">처음 오신 분들께</h2>
                    <div class="liturgy-checklist">
                        <div class="checklist-item"><span class="check-icon" style="color:${s.color};">✓</span><p><strong>앉고 서는</strong> 순서가 있지만, 몸이 불편하시면 그대로 앉아 계셔도 괜찮습니다.</p></div>
                        <div class="checklist-item"><span class="check-icon" style="color:${s.color};">✓</span><p><strong>주보</strong>에 모든 순서가 안내되어 있고, <strong>회중석에 비치된 기도서</strong>를 펴 함께 응답하시면 됩니다.</p></div>
                        <div class="checklist-item"><span class="check-icon" style="color:${s.color};">✓</span><p>처음에는 낯설어도, 한두 번 참여하시면 자연스럽게 따라오실 수 있습니다.</p></div>
                        <div class="checklist-item"><span class="check-icon" style="color:${s.color};">✓</span><p>모르는 것이 있으시면 옆자리 교우나 안내위원에게 편하게 물어보세요.</p></div>
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
        const { address, addressJibun, postalCode, phone, fax } = CHURCH_DATA.info;

        el.innerHTML = `
            <div class="info-card" id="location" style="max-width:760px; margin:0 auto 1.5rem;">
                <h3>주소와 연락처</h3>
                ${MapHelper.html(false)}
                <div style="margin-top:1.5rem;">
                    <div class="info-row"><strong>도로명</strong><span>${address}</span></div>
                    <div class="info-row"><strong>지번</strong><span>${addressJibun}</span></div>
                    <div class="info-row"><strong>우편번호</strong><span>${postalCode}</span></div>
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
                    <strong>버스</strong>
                    <span>
                        가까운 정류장: <strong>온신초등학교앞</strong>
                        <span class="bus-list">
                            <span class="bus-chip bus-blue">505</span>
                            <span class="bus-chip bus-green">5627</span>
                            <span class="bus-chip bus-green">5633</span>
                            <span class="bus-chip bus-green">6637</span>
                        </span>
                        <span style="display:block; font-size:0.82rem; color:var(--text-muted); margin-top:0.4rem;">
                            서울역·구로디지털단지·목동 방면에서 접근 가능합니다.
                        </span>
                    </span>
                </div>
                <div class="info-row">
                    <strong>주차</strong>
                    <span>교회 인근에 무료 주차가 가능합니다. 방문 전 교회 사무실(${phone})로 확인해 주세요.</span>
                </div>
                <p style="margin-top:1.5rem; padding-top:1.25rem; border-top:1px solid var(--border); font-size:0.85rem; color:var(--text-muted); line-height:1.7;">
                    ※ 카카오맵·네이버지도에서 <strong>대한성공회 광명교회</strong> 로 검색하시면 최단 경로 안내를 받으실 수 있습니다.
                </p>
            </div>
        `;
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
        `;
    },

    _korea() {
        const el = document.getElementById('anglican-korea');
        if (!el || !CHURCH_DATA.anglican) return;
        const { korea } = CHURCH_DATA.anglican;
        el.innerHTML = `
            <div class="anglican-korea-inner">
                <div class="anglican-korea-text">
                    <div class="section-header" style="margin-bottom:2rem;">
                        <p class="section-eyebrow">${korea.eyebrow}</p>
                        <h2 class="section-title">${korea.title}</h2>
                    </div>
                    ${korea.paras.map(p => `<p class="anglican-para">${p}</p>`).join('')}
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
        const { eyebrow, title, desc, letters, colors } = CHURCH_DATA.logo;
        el.innerHTML = `
            <div class="section-header">
                <p class="section-eyebrow">${eyebrow}</p>
                <h2 class="section-title">${title}</h2>
            </div>
            <div class="logo-intro-grid">
                <div class="logo-display">
                    <svg viewBox="0 0 64 64" aria-label="ACGM 로고">
                        <rect width="64" height="64" rx="12" fill="#163d24"/>
                        <text x="32" y="40" text-anchor="middle"
                              font-family="inherit" font-weight="800"
                              font-size="19" fill="#ffffff" letter-spacing="-0.5">ACGM</text>
                    </svg>
                    <p class="logo-colors">${colors}</p>
                </div>
                <div class="logo-meaning">
                    <p class="logo-desc">${desc}</p>
                    <div class="logo-letters">
                        ${letters.map(l => `
                            <div class="logo-letter">
                                <span class="logo-letter-mark">${l.letter}</span>
                                <div class="logo-letter-text">
                                    <strong>${l.word}</strong>
                                    <span>${l.desc}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
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
                    ${c.bio ? this._bioSection(c.bio) : ''}
                    ${c.contact ? `<p style="margin-top:1rem; font-size:0.83rem; color:var(--green-mid);">📞 <a href="tel:${c.contact}" style="color:inherit;">${c.contact}</a></p>` : ''}
                    ${c.kyoboUrl ? `<p style="margin-top:0.6rem; font-size:0.83rem;">📚 <a href="${c.kyoboUrl}" target="_blank" rel="noopener" style="color:var(--green-mid); font-weight:600;">저서 보기 (알라딘)</a></p>` : ''}
                </div>
            </div>
        `).join('');
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

        return `
            <div class="bio-section">
                <p class="bio-label">주요 사목 이력</p>
                <ul class="bio-timeline">${milestones}</ul>
                <p class="bio-label" style="margin-top:1.5rem;">교단 내 소임</p>
                <div class="bio-roles">${roles}</div>
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
        el.innerHTML = `
            <div class="values-grid">
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

window.addEventListener('DOMContentLoaded', () => {
    App.init();
    // Handle same-page hash navigation (dropdown clicks while already on the page)
    window.addEventListener('hashchange', () => App._scrollToHash(window.location.hash));
});
