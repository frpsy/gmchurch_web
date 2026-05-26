/**
 * IndexRenderer — 홈 페이지(index.html) 전용 섹션 렌더러
 * DOM: #hero-title, #hero-sub, #about-brief-content, #worship-grid,
 *      #worship-guide, #bank-info, #location-card
 */
import { MapHelper } from './_map-helper.js?v=3';

const { CHURCH_DATA } = window;

export const IndexRenderer = {
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
        if (guide) guide.innerHTML = CHURCH_DATA.worship.guide ? `<p>${CHURCH_DATA.worship.guide}</p>` : '';
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
                    <div class="info-row"><strong>전화</strong><span><a href="tel:${phone}" style="color:inherit;">${phone}</a></span></div>
                </div>
                <p style="margin-top:1.25rem;">
                    <a href="visit.html" style="color:var(--green-mid); font-weight:700; font-size:0.88rem;">자세히 보기 →</a>
                </p>
            `;
        }
    }
};
