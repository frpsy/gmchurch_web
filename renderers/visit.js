/**
 * VisitRenderer — visit.html 전용
 * DOM: #visit-full
 */
import { MapHelper } from './_map-helper.js';

const { CHURCH_DATA } = window;

export const VisitRenderer = {
    render() {
        const el = document.getElementById('visit-full');
        if (!el) return;
        const { address, addressJibun, postalCode, phone, fax } = CHURCH_DATA.info;

        el.innerHTML = `
            <div class="info-card" id="location" style="max-width:760px; margin:0 auto 1.5rem;">
                <h3>주소와 연락처</h3>
                ${MapHelper.html(false)}
                <div style="margin-top:1.5rem;">
                    <div class="info-row"><strong>도로명</strong><span>${address}</span></div>
                    <div class="info-row"><strong>지번</strong><span>${addressJibun}</span></div>
                    <div class="info-row"><strong>우편번호</strong><span>${postalCode}</span></div>
                    <div class="info-row"><strong>전화</strong><span><a href="tel:${phone}" style="color:inherit;">${phone}</a></span></div>
                    <div class="info-row"><strong>팩스</strong><span>${fax}</span></div>
                </div>
            </div>
            <div class="info-card" id="parking" style="max-width:760px; margin:0 auto;">
                <h3>교통·주차 안내</h3>
                <div class="info-row">
                    <strong>승용차</strong>
                    <span>내비게이션에 <em>대한성공회 광명교회</em> 또는 위 주소를 검색해 주세요.</span>
                </div>
                <div class="info-row">
                    <strong>버스</strong>
                    <span>
                        가까운 정류장: <strong>온신초등학교앞</strong>
                        <span class="bus-list" role="list" aria-label="버스 노선 목록">
                            <span class="bus-chip bus-blue" role="listitem" aria-label="간선버스 505번">505</span>
                            <span class="bus-chip bus-green" role="listitem" aria-label="지선버스 5627번">5627</span>
                            <span class="bus-chip bus-green" role="listitem" aria-label="지선버스 5633번">5633</span>
                            <span class="bus-chip bus-green" role="listitem" aria-label="지선버스 6637번">6637</span>
                        </span>
                        <span style="display:block; font-size:0.82rem; color:var(--text-muted); margin-top:0.4rem;">
                            서울역·구로디지털단지·목동 방면에서 접근 가능합니다.
                        </span>
                    </span>
                </div>
                <div class="info-row">
                    <strong>주차</strong>
                    <span>교회 인근에 무료 주차가 가능합니다. 방문 전 교회 사무실(<a href="tel:${phone}" style="color:inherit;">${phone}</a>)로 확인해 주세요.</span>
                </div>
                <p style="margin-top:1.5rem; padding-top:1.25rem; border-top:1px solid var(--border); font-size:0.85rem; color:var(--text-muted); line-height:1.7;">
                    ※ 카카오맵·네이버지도에서 <strong>대한성공회 광명교회</strong> 로 검색하시면 최단 경로 안내를 받으실 수 있습니다.
                </p>
            </div>
        `;
    }
};
