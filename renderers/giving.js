/**
 * GivingRenderer — giving.html 전용
 * DOM: #giving-full
 */
const { CHURCH_DATA } = window;

export const GivingRenderer = {
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
