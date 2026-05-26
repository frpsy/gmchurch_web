/**
 * PressRenderer — clergy.html 의 언론 보도 섹션
 * DOM: #press-table
 */
const { CHURCH_DATA } = window;

export const PressRenderer = {
    render() {
        const el = document.getElementById('press-table');
        if (!el || !CHURCH_DATA.press) return;
        el.innerHTML = `
            <ul class="press-list">
                ${CHURCH_DATA.press.map(p => `
                    <li class="press-item">
                        <span class="press-year">${p.year}</span>
                        <div class="press-main">
                            <a href="${p.url}" target="_blank" rel="noopener noreferrer" class="press-link">${p.title}</a>
                            <span class="press-meta">${p.media} · ${p.date}</span>
                        </div>
                    </li>
                `).join('')}
            </ul>
        `;
    }
};
