/* app.js */
const App = {
    init() {
        this.renderNav();
        this.initNavBehavior();

        // Index page
        if (document.getElementById('hero-title'))    this.renderHero();
        if (document.getElementById('worship-grid'))  this.renderWorship();
        if (document.getElementById('community-grid')) this.renderCommunity();
        if (document.getElementById('bank-info'))     this.renderGiving();

        // Sub-pages
        if (document.getElementById('worship-full'))   this.renderWorshipFull();
        if (document.getElementById('community-full')) this.renderCommunityFull();
        if (document.getElementById('giving-full'))    this.renderGivingFull();

        this.renderFooter();
    },

    renderNav() {
        const nav = document.getElementById('main-nav');
        if (!nav) return;
        const items = CHURCH_DATA.navigation.map(item => `
            <li class="nav-item has-dropdown">
                <a href="${item.href}" class="nav-link">${item.label}</a>
                <ul class="dropdown">
                    ${item.items.map(sub => `<li><a href="${sub.href}">${sub.label}</a></li>`).join('')}
                </ul>
            </li>
        `).join('');
        nav.innerHTML = `
            <div class="container nav-inner">
                <a href="index.html" class="nav-logo">
                    <span class="nav-logo-name">${CHURCH_DATA.info.name}</span>
                    <span class="nav-logo-sub">${CHURCH_DATA.info.subName}</span>
                </a>
                <button class="nav-toggle" id="nav-toggle" aria-label="메뉴">
                    <span></span><span></span><span></span>
                </button>
                <ul class="nav-menu" id="nav-menu">${items}</ul>
                <a href="${CHURCH_DATA.liveUrl}" target="_blank" class="btn-nav-live">📺 실시간 예배</a>
            </div>
        `;
    },

    initNavBehavior() {
        const nav = document.querySelector('.nav-header');
        if (nav) {
            window.addEventListener('scroll', () => {
                nav.classList.toggle('scrolled', window.scrollY > 50);
            });
        }

        const toggle = document.getElementById('nav-toggle');
        const menu = document.getElementById('nav-menu');
        if (!toggle || !menu) return;

        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('open');
        });

        // Mobile: tap nav-link with children to expand dropdown
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
            }
        });
    },

    renderHero() {
        document.getElementById('hero-title').innerText = CHURCH_DATA.info.slogan;
        document.getElementById('hero-sub').innerText = CHURCH_DATA.info.vision;
        document.getElementById('live-btn').href = CHURCH_DATA.liveUrl;
    },

    renderWorship() {
        const container = document.getElementById('worship-grid');
        container.innerHTML = CHURCH_DATA.worship.main.map(w => `
            <div class="card">
                <h3>${w.title}</h3>
                <p><strong>${w.time}</strong></p>
                <p style="margin-top:0.5rem; color:var(--text-muted); font-size:0.9rem;">${w.desc}</p>
            </div>
        `).join('');
        const guide = document.getElementById('worship-guide');
        if (guide) guide.innerHTML = `<p>${CHURCH_DATA.worship.guide}</p>`;
    },

    renderCommunity() {
        const container = document.getElementById('community-grid');
        container.innerHTML = CHURCH_DATA.community.groups.map(g => `
            <div class="card" style="text-align:center;">
                <div class="card-icon">${g.icon}</div>
                <h3>${g.title}</h3>
                <p style="color:var(--text-muted);">${g.desc}</p>
            </div>
        `).join('');
    },

    renderGiving() {
        document.getElementById('bank-info').innerHTML = `
            <h3>봉헌 안내</h3>
            <div class="info-row"><strong>은행</strong> 국민은행</div>
            <div class="info-row"><strong>계좌번호</strong> ${CHURCH_DATA.giving.bank}</div>
            <div class="info-row"><strong>예금주</strong> ${CHURCH_DATA.giving.holder}</div>
            <p style="margin-top:1rem; font-size:0.85rem; color:var(--text-muted);">${CHURCH_DATA.giving.report}</p>
        `;
    },

    renderWorshipFull() {
        document.getElementById('worship-full').innerHTML = `
            <div class="grid">
                ${CHURCH_DATA.worship.main.map(w => `
                    <div class="info-card" id="${w.title === '어린이 예배' ? 'children' : 'main'}">
                        <h3>${w.title}</h3>
                        <div class="info-row"><strong>시간</strong> ${w.time}</div>
                        <p style="margin-top:1rem; color:var(--text-muted); font-size:0.93rem;">${w.desc}</p>
                    </div>
                `).join('')}
                <div class="info-card" id="newcomer">
                    <h3>새신자 안내</h3>
                    <p style="color:var(--text-muted); font-size:0.93rem; line-height:1.9;">${CHURCH_DATA.worship.guide}</p>
                </div>
            </div>
        `;
    },

    renderCommunityFull() {
        const ids = ['hopecenter', 'emmaus', 'smallgroup'];
        document.getElementById('community-full').innerHTML = `
            <div class="grid">
                ${CHURCH_DATA.community.groups.map((g, i) => `
                    <div class="card" id="${ids[i]}" style="text-align:center;">
                        <div class="card-icon">${g.icon}</div>
                        <h3>${g.title}</h3>
                        <p style="color:var(--text-muted);">${g.desc}</p>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderGivingFull() {
        document.getElementById('giving-full').innerHTML = `
            <div class="grid">
                <div class="info-card" id="offering">
                    <h3>봉헌 계좌 안내</h3>
                    <div class="info-row"><strong>은행</strong> 국민은행</div>
                    <div class="info-row"><strong>계좌</strong> ${CHURCH_DATA.giving.bank}</div>
                    <div class="info-row"><strong>예금주</strong> ${CHURCH_DATA.giving.holder}</div>
                    <p style="margin-top:1rem; font-size:0.85rem; color:var(--text-muted);" id="report">${CHURCH_DATA.giving.report}</p>
                </div>
                <div class="info-card" id="location">
                    <h3>오시는 길</h3>
                    <div class="info-row"><strong>주소</strong> ${CHURCH_DATA.info.address}</div>
                    <div class="info-row"><strong>전화</strong> ${CHURCH_DATA.info.phone}</div>
                    <div class="info-row"><strong>팩스</strong> ${CHURCH_DATA.info.fax}</div>
                    <div style="margin-top:1.5rem;">
                        <a href="https://map.kakao.com/link/search/${encodeURIComponent(CHURCH_DATA.info.address)}" target="_blank" style="color:var(--primary-green); font-weight:bold;">카카오지도 보기 →</a>
                    </div>
                </div>
            </div>
        `;
    },

    renderFooter() {
        const footer = document.getElementById('main-footer');
        if (!footer) return;
        footer.innerHTML = `
            <div class="container">
                <div class="footer-inner">
                    <div class="footer-col">
                        <h4>광명교회</h4>
                        <p>${CHURCH_DATA.info.name}</p>
                        <p>${CHURCH_DATA.info.subName}</p>
                        <p style="margin-top:0.5rem;">설립 ${CHURCH_DATA.info.established}</p>
                    </div>
                    <div class="footer-col">
                        <h4>연락처</h4>
                        <p>${CHURCH_DATA.info.address}</p>
                        <p>Tel: ${CHURCH_DATA.info.phone}</p>
                        <p>${CHURCH_DATA.clergy.priest}</p>
                    </div>
                    <div class="footer-col">
                        <h4>바로가기</h4>
                        <a href="${CHURCH_DATA.sns.youtube}" target="_blank">유튜브 채널</a>
                        <a href="${CHURCH_DATA.sns.instagram}" target="_blank">인스타그램</a>
                        <a href="${CHURCH_DATA.sns.diocesan}" target="_blank">성공회 서울교구</a>
                    </div>
                </div>
                <div class="footer-bottom">
                    <span>&copy; 2026 ${CHURCH_DATA.info.name}. All rights reserved.</span>
                    <span>대한성공회 서울교구</span>
                </div>
            </div>
        `;
    }
};

window.onload = () => App.init();
