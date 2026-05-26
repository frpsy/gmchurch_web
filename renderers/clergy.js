/**
 * AnglicanRenderer + ClergyRenderer — clergy.html 전용
 * AnglicanRenderer DOM: #anglican-welcome-banner, #anglican-what, #anglican-korea
 * ClergyRenderer  DOM: #logo-content, #clergy-full, #philosophy-full
 *
 * 두 렌더러가 모두 clergy.html 페이지에 속해 한 파일에서 export
 */
const { CHURCH_DATA } = window;

export const AnglicanRenderer = {
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

export const ClergyRenderer = {
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
        const cats = CHURCH_DATA.ministerSection.categories;
        let firstPriestRendered = false;
        el.innerHTML = cats.map(cat => {
            const members = CHURCH_DATA.clergy.filter(c => c.category === cat.id);
            const membersHtml = members.length > 0
                ? members.map(c => {
                    const isFirstPriest = !firstPriestRendered && cat.id === '성직자';
                    if (isFirstPriest) firstPriestRendered = true;
                    return `
                    <div class="clergy-card" ${isFirstPriest ? 'id="priest"' : ''}>
                        <div class="clergy-avatar">✝️</div>
                        <div>
                            <div class="clergy-name">${c.name} 사제</div>
                            <div class="clergy-title">${c.title}</div>
                            ${c.ordained ? `<div style="font-size:0.78rem; color:var(--text-muted); margin-top:0.2rem;">${c.ordained}</div>` : ''}
                            ${c.quote ? `<div class="quote-block"><p>"${c.quote}"</p></div>` : ''}
                            <p class="clergy-desc">${c.desc}</p>
                            ${c.bio ? this._bioSection(c.bio) : ''}
                            ${c.contact ? `<p style="margin-top:1rem; font-size:0.83rem; color:var(--green-mid);">📞 <a href="tel:${c.contact}" style="color:inherit;">${c.contact}</a></p>` : ''}
                            ${c.kyoboUrl ? `<p style="margin-top:0.6rem; font-size:0.83rem;">📚 <a href="${c.kyoboUrl}" target="_blank" rel="noopener noreferrer" style="color:var(--green-mid); font-weight:600;">저서 보기 (알라딘)</a></p>` : ''}
                        </div>
                    </div>`;
                }).join('')
                : `<div class="minister-empty">준비 중입니다.</div>`;
            return `
            <div class="minister-category">
                <h3 class="minister-cat-title">${cat.title}</h3>
                ${membersHtml}
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
