/**
 * NavRenderer — 전역 네비게이션 + 모바일 드롭다운 토글
 * DOM: #main-nav
 */
const { CHURCH_DATA } = window;

export const NavRenderer = {
    render() {
        const nav = document.getElementById('main-nav');
        if (!nav) return;

        const items = CHURCH_DATA.navigation.map((item, i) => `
            <li class="nav-item has-dropdown">
                <a href="${item.href}" class="nav-link">${item.label}</a>
                <button class="nav-chevron" aria-label="${item.label} 하위 메뉴" aria-expanded="false" aria-controls="nav-dropdown-${i}">
                    <svg viewBox="0 0 10 6" width="10" height="6" aria-hidden="true"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                <ul class="dropdown" id="nav-dropdown-${i}">
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

        const setToggleState = (isOpen) => {
            toggle.setAttribute('aria-expanded', isOpen);
            toggle.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
        };

        if (header) {
            window.addEventListener('scroll', () => {
                header.classList.toggle('scrolled', window.scrollY > 50);
            }, { passive: true });
        }

        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = menu.classList.toggle('open');
            setToggleState(isOpen);
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
                setToggleState(false);
            });
        });

        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && !toggle.contains(e.target)) {
                menu.classList.remove('open');
                setToggleState(false);
            }
        });
    }
};
