/**
 * MapHelper — Google Maps embed + 카카오맵 외부 링크 헬퍼
 * IndexRenderer, VisitRenderer 양쪽에서 사용
 */
export const MapHelper = {
    // 광명교회 좌표 (위도 37.4757, 경도 126.8641)
    // 카카오 embed가 외부 도메인 iframe을 차단하여 Google Maps embed 사용
    iframeUrl: "https://maps.google.com/maps?q=37.4757,126.8641&hl=ko&z=17&output=embed",
    linkUrl:   "https://map.kakao.com/link/map/대한성공회광명교회,37.475700,126.864100",

    html(compact = false) {
        const h = compact ? '220px' : '300px';
        return `
            <div style="border-radius:var(--radius-md); overflow:hidden; border:1px solid var(--border); margin-bottom:1rem; height:${h}; background:#e8f5e9;">
                <iframe
                    src="${this.iframeUrl}"
                    width="100%" height="100%"
                    frameborder="0"
                    scrolling="no"
                    marginheight="0"
                    marginwidth="0"
                    loading="lazy"
                    title="광명교회 오시는 길"
                    style="display:block;"
                ></iframe>
            </div>
            <a href="${this.linkUrl}" target="_blank" rel="noopener"
               style="display:inline-flex; align-items:center; gap:0.4rem;
                      color:var(--green-mid); font-weight:700; font-size:0.88rem;">
                카카오지도에서 크게 보기 →
            </a>
        `;
    }
};
