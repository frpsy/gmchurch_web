function renderChurchInfo() {
    // 텍스트 주입
    document.getElementById('church-name').innerText = CHURCH_DATA.name;
    document.getElementById('main-slogan').innerText = CHURCH_DATA.slogan;
    document.getElementById('sub-slogan').innerText = CHURCH_DATA.vision;

    // 예배 안내 리스트 생성
    const worshipList = document.getElementById('worship-list');
    worshipList.innerHTML = CHURCH_DATA.worship.map(item => 
        `<li><strong>${item.title}</strong>: ${item.time}</li>`
    ).join('');

    // 푸터 정보 업데이트
    document.getElementById('footer-contact').innerText = 
        `${CHURCH_DATA.address} | 전화: ${CHURCH_DATA.contact.phone}`;
}

// 페이지 로드 시 실행
window.onload = renderChurchInfo;