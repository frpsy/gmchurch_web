/**
 * CommunityRenderer — community.html 전용
 * DOM: #community-full
 */
const { CHURCH_DATA } = window;

export const CommunityRenderer = {
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
