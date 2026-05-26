/**
 * FooterRenderer — 전역 푸터
 * DOM: #main-footer
 */
const { CHURCH_DATA } = window;

export const FooterRenderer = {
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
                        <p>${info.addressShort}<br><a href="tel:${info.phone}" style="color:inherit;">Tel. ${info.phone}</a><br>${clergy[0].name} ${clergy[0].title.split('·')[0].trim()}</p>
                    </div>
                    <div class="footer-col">
                        <h4>바로가기</h4>
                        <a href="${sns.youtube}"   target="_blank" rel="noopener noreferrer">유튜브 채널</a>
                        <a href="${sns.instagram}" target="_blank" rel="noopener noreferrer">인스타그램</a>
                        <a href="${sns['naver blog']}" target="_blank" rel="noopener noreferrer">네이버 블로그</a>
                        <a href="${sns.diocesan}"  target="_blank" rel="noopener noreferrer">성공회 서울교구</a>
                    </div>
                </div>
                <div class="footer-bottom">
                    <span>© 2026 ${info.name}. All rights reserved.</span>
                    <a href="privacy.html">개인정보 처리방침</a>
                    <span>대한성공회 서울교구</span>
                </div>
            </div>
        `;
    }
};
