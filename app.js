/* app.js */
const App = {
    init() {
        this.renderHero();
        this.renderWorship();
        this.renderCommunity();
        this.renderGiving();
        this.renderFooter();
    },

    renderHero() {
        document.getElementById('hero-title').innerText = CHURCH_DATA.info.slogan;
        document.getElementById('hero-sub').innerText = CHURCH_DATA.info.vision;
        document.getElementById('live-btn').href = CHURCH_DATA.liveUrl;
    },

    renderWorship() {
        const container = document.getElementById('worship-grid');
        let html = CHURCH_DATA.worship.main.map(w => `
            <div class="card">
                <h3>${w.title}</h3>
                <p><strong>${w.time}</strong></p>
                <p style="font-size:0.9rem; color:#666;">${w.desc}</p>
            </div>
        `).join('');
        html += `<div class="card" style="grid-column: 1 / -1; background:#e8f5e9;">
                    <p>💡 ${CHURCH_DATA.worship.guide}</p>
                 </div>`;
        container.innerHTML = html;
    },

    renderCommunity() {
        const container = document.getElementById('community-grid');
        container.innerHTML = CHURCH_DATA.community.groups.map(g => `
            <div class="card" style="text-align:center;">
                <div style="font-size:2rem; margin-bottom:1rem;">${g.icon}</div>
                <h3>${g.title}</h3>
                <p>${g.desc}</p>
            </div>
        `).join('');
    },

    renderGiving() {
        document.getElementById('bank-info').innerHTML = `
            <p><strong>국민은행</strong> ${CHURCH_DATA.giving.bank}</p>
            <p>예금주: ${CHURCH_DATA.giving.holder}</p>
            <p style="margin-top:1rem; font-size:0.85rem; color:#888;">${CHURCH_DATA.giving.report}</p>
        `;
    },

    renderFooter() {
        document.getElementById('footer-addr').innerText = CHURCH_DATA.info.address;
        document.getElementById('footer-info').innerText = `Tel: ${CHURCH_DATA.info.phone} | ${CHURCH_DATA.clergy.priest}`;
    }
};

window.onload = () => App.init();