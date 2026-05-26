/**
 * WorshipRenderer — worship.html 전용
 * DOM: #worship-full
 * 절기 색상은 CHURCH_DATA.worship.liturgicalSeason 에서 가져옴
 * (data.js 로드 시점 고정값 — 자정 경계 이슈는 docs/refactor-analysis.md 5.6 참조)
 */
const { CHURCH_DATA } = window;

export const WorshipRenderer = {
    render() {
        const el = document.getElementById('worship-full');
        if (!el) return;
        const { main, guide, liturgicalSeason: s } = CHURCH_DATA.worship;

        el.innerHTML = `
            <div class="grid" style="margin-bottom:2rem;">
                ${main.map(w => `
                    <div class="info-card" id="${w.id}">
                        <h3>${w.title}</h3>
                        <div class="info-row">
                            <strong>시간</strong>
                            <span style="color:var(--green-mid); font-weight:700;">${w.time}</span>
                        </div>
                        <p style="margin-top:1rem; color:var(--text-muted); font-size:0.9rem; line-height:1.9;">${w.desc}</p>
                    </div>
                `).join('')}
            </div>
            ${guide ? `<div class="guide-banner"><p>${guide}</p></div>` : ''}

            <div class="liturgy-guide" id="newcomer">
                <div class="liturgy-season-badge">
                    <span class="season-dot" style="background:${s.color};"></span>
                    ${s.symbol}&nbsp;${s.name}&nbsp;·&nbsp;<span style="color:${s.color}; font-weight:700;">${s.colorName}</span>
                    <span class="season-note">${s.note}</span>
                </div>

                <div class="liturgy-section">
                    <p class="section-eyebrow" style="color:${s.color};">Anglican Liturgy</p>
                    <h2 class="section-title">성공회 전례란?</h2>
                    <p class="liturgy-body">성공회(Anglican Church)는 <strong>말씀과 성찬을 함께 중시하는 전례 교회</strong>입니다. 초대교회로부터 내려오는 말씀의 전례와 성찬의 전례가 아름답게 조화를 이루는 깊은 영성의 예배 전통을 400여 년간 이어오고 있습니다.</p>
                    <p class="liturgy-body">성공회의 예배는 <strong>성공회 기도서(Book of Common Prayer)</strong>에 따라 드립니다. 1549년 캔터베리 대주교 토마스 크랜머가 주도하여 처음 편찬한 성공회 기도서는, 라틴어가 아닌 회중이 알아듣는 자국어로 예배드려 <strong>모든 신자가 전례에 능동적으로 참여</strong>할 수 있도록 했다는 점에서 종교개혁의 중요한 유산입니다.</p>
                    <div class="liturgy-card" style="border-left-color:${s.color};">
                        <h3 class="liturgy-card-title">전례 교회의 의미</h3>
                        <p class="liturgy-body"><strong>'전례(典禮, Liturgy)'</strong>는 그리스어 <em>레이투르기아(λειτουργία)</em>에서 온 말로, "공동체를 위해 수행하는 일"을 뜻합니다. 곧 전례는 <strong>그리스도인이 함께 드리고 함께 살아내는 신앙의 실천</strong>입니다.</p>
                        <ul class="liturgy-list">
                            <li><strong>회중이 함께 기도하고 응답하는 대화 형식</strong>으로 진행됩니다.</li>
                            <li><strong>모든 신자가 성직자와 동등하게 예배를 '드리는' 주체</strong>입니다.</li>
                            <li>성서, 성가집, 기도서, 주보를 함께 펴들고 능동적으로 참여합니다.</li>
                        </ul>
                    </div>
                </div>

                <div class="liturgy-section">
                    <p class="section-eyebrow" style="color:${s.color};">Eucharist</p>
                    <h2 class="section-title">감사성찬례란?</h2>
                    <p class="liturgy-body">성공회 주일 예배의 핵심은 <strong>감사성찬례</strong>입니다. 천주교의 '미사', 개신교의 '주님의 만찬'과 같은 예배로, 그리스도교 예배의 출발이자 기초이며 핵심입니다.</p>
                    <blockquote class="liturgy-inner-quote" style="border-left-color:${s.color};">
                        감사성찬례는 빵과 포도주를 나누는 예수님의 마지막 만찬에서 비롯되었으며, <strong>하느님 앞에서 공동체로 모여 말씀을 듣고 성찬을 나누는</strong> 거룩한 시간입니다.
                    </blockquote>
                </div>

                <div class="liturgy-section" id="eucharist-order">
                    <p class="section-eyebrow" style="color:${s.color};">Order of Service</p>
                    <h2 class="section-title">감사성찬례 순서</h2>
                    <p class="liturgy-body" style="margin-bottom:1.5rem;">성공회 기도서에 따른 감사성찬례는 크게 <strong>네 부분</strong>으로 구성됩니다.</p>
                    <div class="liturgy-steps">
                        <div class="liturgy-step">
                            <div class="step-num" style="background:${s.color};">1</div>
                            <div class="step-body">
                                <h4 class="step-title">입당예식</h4>
                                <ul class="step-list">
                                    <li>입당 성가와 함께 집전자가 입장합니다.</li>
                                    <li>회중은 다 함께 일어나 하느님께 예배드릴 준비를 합니다.</li>
                                    <li>죄를 고백하고 용서를 구하는 시간을 가집니다.</li>
                                </ul>
                            </div>
                        </div>
                        <div class="liturgy-step">
                            <div class="step-num" style="background:${s.color};">2</div>
                            <div class="step-body">
                                <h4 class="step-title">말씀의 전례</h4>
                                <ul class="step-list">
                                    <li>구약 성서 봉독 · 시편 화답송 · 서신서 봉독</li>
                                    <li>복음환호송(<em>"알렐루야, 알렐루야"</em>) 후 <strong>복음서 봉독</strong>과 설교</li>
                                    <li>사도신경 또는 니케아 신경으로 신앙을 함께 고백합니다.</li>
                                    <li>교회와 세상, 이웃과 자신을 위한 중보기도 — 회중은 <em>"주여, 우리의 기도를 들으소서"</em>로 응답합니다.</li>
                                </ul>
                            </div>
                        </div>
                        <div class="liturgy-step">
                            <div class="step-num" style="background:${s.color};">3</div>
                            <div class="step-body">
                                <h4 class="step-title">성찬의 전례</h4>
                                <ul class="step-list">
                                    <li>평화의 인사를 나눕니다.</li>
                                    <li>빵과 포도주, 헌금을 봉헌하고 집전자가 <strong>빵과 포도주를 축성</strong>합니다.</li>
                                    <li>주님의 기도 후 <strong>영성체</strong> — 그리스도의 몸과 피를 모십니다.</li>
                                </ul>
                            </div>
                        </div>
                        <div class="liturgy-step">
                            <div class="step-num" style="background:${s.color};">4</div>
                            <div class="step-body">
                                <h4 class="step-title">파송예식</h4>
                                <ul class="step-list">
                                    <li>감사 기도와 강복을 받습니다.</li>
                                    <li><em>"나가서 주님의 복음을 전합시다 / 평화를 이룹시다 / 사랑을 나눕시다"</em></li>
                                    <li>회중: <em>"그리스도의 이름으로. 아멘"</em> — 우리는 세상으로 파송되는 선교사가 됩니다.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="liturgy-section" id="communion">
                    <p class="section-eyebrow" style="color:${s.color};">Holy Communion</p>
                    <h2 class="section-title">영성체 안내</h2>
                    <div class="communion-grid">
                        <div class="communion-card" style="border-top-color:${s.color}; background:${s.colorLight};">
                            <h3>세례받으신 분</h3>
                            <p class="liturgy-body">성공회는 <strong>열린 성찬(Open Communion)</strong> 전통을 따릅니다. 교파에 관계없이 <strong>세례받은 그리스도인이라면 누구나</strong> 그리스도의 몸과 피를 모실 수 있습니다.</p>
                            <ul class="liturgy-list">
                                <li>제대 앞으로 나오셔서 두 손을 모으거나 펴고 빵을 받으십시오.</li>
                                <li>빵을 모신 후 포도주 잔이 전해지면 한 모금 받으십시오.</li>
                            </ul>
                        </div>
                        <div class="communion-card" style="border-top-color:var(--green-mid); background:var(--green-light);">
                            <h3>아직 세례를 받지 않으신 분</h3>
                            <p class="liturgy-body"><strong>제대 앞에 나오셔서 강복(축복)을 받으실 수 있습니다.</strong></p>
                            <ul class="liturgy-list">
                                <li>두 손을 가슴에 X자로 모으시면, 집전자가 머리에 손을 얹고 강복해 드립니다.</li>
                                <li>부담 갖지 마시고 편안한 마음으로 나오세요. 그 자체가 하느님께서 여러분을 맞이하시는 시간입니다.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="liturgy-section" id="firsttime">
                    <p class="section-eyebrow" style="color:${s.color};">First Visit</p>
                    <h2 class="section-title">처음 오신 분들께</h2>
                    <div class="liturgy-checklist">
                        <div class="checklist-item"><span class="check-icon" style="color:${s.color};">✓</span><p><strong>앉고 서는</strong> 순서가 있지만, 몸이 불편하시면 그대로 앉아 계셔도 괜찮습니다.</p></div>
                        <div class="checklist-item"><span class="check-icon" style="color:${s.color};">✓</span><p><strong>주보</strong>에 모든 순서가 안내되어 있고, <strong>회중석에 비치된 기도서</strong>를 펴 함께 응답하시면 됩니다.</p></div>
                        <div class="checklist-item"><span class="check-icon" style="color:${s.color};">✓</span><p>처음에는 낯설어도, 한두 번 참여하시면 자연스럽게 따라오실 수 있습니다.</p></div>
                        <div class="checklist-item"><span class="check-icon" style="color:${s.color};">✓</span><p>모르는 것이 있으시면 옆자리 교우나 안내위원에게 편하게 물어보세요.</p></div>
                    </div>
                </div>
            </div>
        `;
    }
};
