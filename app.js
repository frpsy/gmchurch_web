function renderChurchInfo() {
    document.getElementById('church-name').innerText = CHURCH_DATA.name;
    document.getElementById('main-slogan').innerText = CHURCH_DATA.slogan;
    document.getElementById('sub-slogan').innerText = CHURCH_DATA.vision;
    document.getElementById('church-address').innerText = CHURCH_DATA.address;

    const liveLink = document.getElementById('live-link');
    liveLink.href = CHURCH_DATA.liveUrl || "https://youtube.com";

    const worshipList = document.getElementById('worship-list');
    worshipList.innerHTML = CHURCH_DATA.worship.map(item =>
        `<li><strong>${item.title}</strong>: ${item.time}</li>`
    ).join('');

    document.getElementById('footer-contact').innerHTML = `
        <p>${CHURCH_DATA.address}</p>
        <p>전화: ${CHURCH_DATA.contact.phone} | ${CHURCH_DATA.contact.priest}</p>
        <p style="margin-top:1rem; opacity:0.6;">&copy; 2026 ${CHURCH_DATA.name}</p>
    `;
}

window.onload = renderChurchInfo;
