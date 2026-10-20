import { createBackend, isDemo } from './backend.js';

const app = document.getElementById('app');
const toastEl = document.getElementById('toast');
const DOW = ['일', '월', '화', '수', '목', '금', '토'];
let be;
let toastTimer;

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rid = () => Math.random().toString(36).slice(2, 8);

function toast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 2600);
}

function shareLink(id) {
    return `${location.origin}${location.pathname}?s=${encodeURIComponent(id)}`;
}

async function copyLink(id) {
    const url = shareLink(id);
    try {
        await navigator.clipboard.writeText(url);
        toast('링크를 복사했습니다.');
    } catch {
        window.prompt('아래 링크를 복사해 주세요.', url);
    }
}

function isClosed(s) {
    return s.status === 'closed' || (s.closesAt && Date.now() > s.closesAt);
}

function fmtDateTime(ms) {
    const d = new Date(ms);
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function toLocalInput(ms) {
    if (!ms) return '';
    const d = new Date(ms);
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function errMsg(e) {
    if (e && e.code === 'permission-denied') return '권한이 없습니다. 관리자 허용 목록과 보안 규칙을 확인해 주세요.';
    return (e && e.message) || '알 수 없는 오류가 발생했습니다.';
}

function demoBanner() {
    return isDemo
        ? '<p class="banner">체험 모드입니다. 입력한 내용은 이 브라우저에만 저장되며 다른 사람에게 공유되지 않습니다. firebase-config.js를 채우면 실제 조사로 동작합니다.</p>'
        : '';
}

/* ---------- 결과 ---------- */
function resultsHtml(survey, answersList) {
    const total = answersList.length;
    const blocks = survey.questions.map((q) => {
        const sums = Object.fromEntries(q.options.map((o) => [o.id, 0]));
        let families = 0;
        answersList.forEach((a) => {
            const v = a[q.id];
            if (q.type === 'count') {
                let any = false;
                Object.entries(v || {}).forEach(([oid, n]) => {
                    if (oid in sums && n > 0) { sums[oid] += n; any = true; }
                });
                if (any) families += 1;
            } else {
                (v || []).forEach((oid) => { if (oid in sums) sums[oid] += 1; });
            }
        });
        const max = Math.max(1, ...Object.values(sums));
        const rows = q.options.map((o) => {
            const pct = q.type === 'count'
                ? Math.round((sums[o.id] / max) * 100)
                : (total ? Math.round((sums[o.id] / total) * 100) : 0);
            const label = q.type === 'count' ? `${sums[o.id]}명` : `${sums[o.id]}명 (${pct}%)`;
            return `<div class="bar-row">
                <div class="bar-label"><span>${esc(o.label)}</span><span>${label}</span></div>
                <div class="bar" aria-hidden="true"><span style="width:${pct}%"></span></div>
            </div>`;
        }).join('');
        const note = q.type === 'count' ? `<p class="muted" style="margin:0 0 8px">${families}가정 응답</p>` : '';
        return `<div class="result-q"><h3>${esc(q.text)}</h3>${note}${rows}</div>`;
    }).join('');
    return `<p class="muted">응답 ${total}건</p>${blocks}`;
}

/* ---------- 응답 화면 ---------- */
async function renderRespond(id) {
    const survey = await be.getSurvey(id);
    if (!survey) {
        app.innerHTML = '<div class="card center"><h1>조사를 찾을 수 없습니다</h1><p class="muted">링크가 올바른지 확인해 주세요.</p></div>';
        return;
    }
    document.title = `${survey.title} — 익명 조사`;
    const closed = isClosed(survey);
    const mine = await be.getMyAnswers(id).catch(() => null);
    const myComment = survey.allowComment ? await be.getMyComment(id).catch(() => '') : '';
    const canSeeResults = survey.showResults || be.user().isAdmin;

    const questions = survey.questions.map((q) => {
        const chosen = (mine && mine[q.id]) || (q.type === 'count' ? {} : []);
        const opts = q.options.map((o) => (q.type === 'count' ? `
            <label class="opt">
                <span>${esc(o.label)}</span>
                <input type="number" class="num" min="0" max="20" step="1" inputmode="numeric"
                    name="q_${esc(q.id)}" data-opt="${esc(o.id)}" value="${chosen[o.id] || 0}" ${closed ? 'disabled' : ''}>
            </label>` : `
            <label class="opt">
                <input type="${q.type === 'multi' ? 'checkbox' : 'radio'}" name="q_${esc(q.id)}" value="${esc(o.id)}"
                    ${chosen.includes(o.id) ? 'checked' : ''} ${closed ? 'disabled' : ''}>
                <span>${esc(o.label)}</span>
            </label>`)).join('');
        const hint = { multi: '여러 개 선택 가능', count: '해당 없으면 0', single: '' }[q.type];
        const req = q.required ? '<span class="req" aria-label="필수">*</span>' : '';
        return `<div class="card"><fieldset data-q="${esc(q.id)}"><legend>${esc(q.text)}${req}${hint ? `<span class="hint">${hint}</span>` : ''}</legend>${opts}</fieldset></div>`;
    }).join('');

    const closeNote = closed
        ? '<p class="banner">마감된 조사입니다. 답변을 바꿀 수 없습니다.</p>'
        : (survey.closesAt ? `<p class="muted">마감: ${fmtDateTime(survey.closesAt)}</p>` : '');

    app.innerHTML = `
        ${demoBanner()}
        <p class="eyebrow">익명 조사</p>
        <h1>${esc(survey.title)}</h1>
        ${survey.description ? `<p class="muted" style="white-space:pre-wrap">${esc(survey.description)}</p>` : ''}
        <p class="muted">이름과 연락처를 받지 않습니다. 같은 기기에서는 답변을 다시 열어 고칠 수 있습니다.</p>
        ${closeNote}
        <form id="respond" novalidate>
            ${questions}
            ${survey.allowComment ? `<div class="card"><label class="field"><span>의견 (선택, 관리자만 볼 수 있습니다)</span>
                <textarea id="comment" maxlength="1000" ${closed ? 'disabled' : ''}>${esc(myComment)}</textarea></label></div>` : ''}
            <p id="form-error" class="req" role="alert" hidden></p>
            ${closed ? '' : `<div class="actions"><button type="submit" class="primary">${mine ? '답변 수정하기' : '제출하기'}</button></div>`}
        </form>
        <section id="results" class="card" ${mine || closed ? '' : 'hidden'} style="margin-top:20px"></section>`;

    const resultsBox = document.getElementById('results');
    const showResults = async () => {
        if (!canSeeResults) {
            resultsBox.innerHTML = '<p class="center" style="margin:0">답변이 저장되었습니다. 감사합니다.</p>';
            resultsBox.hidden = false;
            return;
        }
        try {
            const list = await be.listAnswers(id);
            resultsBox.innerHTML = `<h2>현재 결과</h2>${resultsHtml(survey, list)}
                <div class="actions"><button type="button" class="small" id="refresh">새로고침</button></div>`;
            resultsBox.hidden = false;
            document.getElementById('refresh').onclick = showResults;
        } catch (e) {
            resultsBox.innerHTML = `<p>${esc(errMsg(e))}</p>`;
            resultsBox.hidden = false;
        }
    };
    if (mine || closed) showResults();

    document.getElementById('respond').addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const answers = {};
        let missing = null;
        survey.questions.forEach((q) => {
            let picked;
            if (q.type === 'count') {
                picked = {};
                document.querySelectorAll(`input[name="q_${CSS.escape(q.id)}"]`).forEach((i) => {
                    const n = Math.min(20, Math.max(0, Math.floor(Number(i.value) || 0)));
                    if (n > 0) picked[i.dataset.opt] = n;
                });
                answers[q.id] = picked;
                if (q.required && !Object.keys(picked).length && !missing) missing = q;
                return;
            }
            picked = [...document.querySelectorAll(`input[name="q_${CSS.escape(q.id)}"]:checked`)].map((i) => i.value);
            answers[q.id] = picked;
            if (q.required && !picked.length && !missing) missing = q;
        });
        const errEl = document.getElementById('form-error');
        if (missing) {
            errEl.textContent = `'${missing.text}' 항목에 답해 주세요.`;
            errEl.hidden = false;
            return;
        }
        errEl.hidden = true;
        const btn = ev.submitter;
        btn.disabled = true;
        try {
            await be.saveAnswers(id, answers);
            if (survey.allowComment) {
                const text = document.getElementById('comment').value.trim();
                if (text || myComment) await be.saveComment(id, text);
            }
            btn.textContent = '답변 수정하기';
            toast('제출했습니다.');
            await showResults();
        } catch (e) {
            errEl.textContent = errMsg(e);
            errEl.hidden = false;
        } finally {
            btn.disabled = false;
        }
    });
}

/* ---------- 관리자: 목록 ---------- */
async function renderAdmin() {
    document.title = '익명 조사 관리';
    const user = be.user();
    if (!user.isAdmin) {
        app.innerHTML = `${demoBanner()}
            <p class="eyebrow">익명 조사</p>
            <h1>조사 관리</h1>
            <p class="muted">조사를 만들려면 관리자 로그인이 필요합니다. 응답하려면 전달받은 조사 링크로 접속해 주세요.</p>
            <div class="actions"><button class="primary" id="login">${isDemo ? '체험 모드로 시작' : 'Google로 로그인'}</button></div>`;
        document.getElementById('login').onclick = async () => {
            try { await be.login(); renderAdmin(); } catch (e) { toast(errMsg(e)); }
        };
        return;
    }

    let list;
    try {
        list = await be.listSurveys();
    } catch (e) {
        app.innerHTML = `${demoBanner()}<h1>조사 관리</h1>
            <p class="banner">${esc(errMsg(e))}</p>
            <div class="actions"><button id="logout">로그아웃</button></div>`;
        document.getElementById('logout').onclick = async () => { await be.logout(); renderAdmin(); };
        return;
    }

    const items = list.map((s) => `
        <div class="card survey-item" data-id="${esc(s.id)}">
            <h2>${esc(s.title)}<span class="tag">${isClosed(s) ? '마감' : '진행 중'}</span></h2>
            <p class="muted" style="margin:0">${esc(fmtDateTime(s.createdAt))} 생성 · 문항 ${s.questions.length}개</p>
            <div class="actions">
                <button class="small" data-act="copy">링크 복사</button>
                <button class="small" data-act="results">결과</button>
                <button class="small" data-act="edit">수정</button>
                <button class="small" data-act="dup">복제</button>
                <button class="small" data-act="toggle">${s.status === 'closed' ? '다시 열기' : '마감하기'}</button>
                <button class="small danger" data-act="del">삭제</button>
            </div>
        </div>`).join('');

    app.innerHTML = `${demoBanner()}
        <p class="eyebrow">익명 조사</p>
        <h1>조사 관리</h1>
        <p class="muted">${esc(user.email)}</p>
        <div class="actions" style="margin:0 0 16px">
            <button class="primary" id="new">새 조사 만들기</button>
            <button id="new-meal">급식·돌봄 예시로 만들기</button>
            <button id="logout">로그아웃</button>
        </div>
        ${items || '<p class="muted">아직 만든 조사가 없습니다. 비슷한 조사를 반복한다면 기존 조사를 복제하면 편합니다.</p>'}`;

    document.getElementById('new').onclick = () => renderEditor(null);
    document.getElementById('new-meal').onclick = () => renderEditor(null, mealPreset());
    document.getElementById('logout').onclick = async () => { await be.logout(); renderAdmin(); };
    app.querySelectorAll('[data-act]').forEach((btn) => {
        btn.onclick = async () => {
            const id = btn.closest('[data-id]').dataset.id;
            const s = list.find((x) => x.id === id);
            try {
                switch (btn.dataset.act) {
                    case 'copy': return copyLink(id);
                    case 'results': return renderResultsPage(s);
                    case 'edit': return renderEditor(s);
                    case 'dup': {
                        await be.createSurvey({ ...s, title: `${s.title} (복사)`, status: 'open', closesAt: null });
                        toast('복제했습니다.');
                        return renderAdmin();
                    }
                    case 'toggle':
                        await be.setStatus(id, s.status === 'closed' ? 'open' : 'closed');
                        return renderAdmin();
                    case 'del':
                        if (!confirm(`'${s.title}' 조사와 모든 응답을 삭제할까요? 되돌릴 수 없습니다.`)) return;
                        await be.deleteSurvey(id);
                        return renderAdmin();
                }
            } catch (e) { toast(errMsg(e)); }
        };
    });
}

/* ---------- 관리자: 결과 ---------- */
async function renderResultsPage(s) {
    app.innerHTML = '<p class="muted">불러오는 중입니다.</p>';
    try {
        const [list, comments] = await Promise.all([
            be.listAnswers(s.id),
            s.allowComment ? be.listComments(s.id) : Promise.resolve([])
        ]);
        app.innerHTML = `
            <p class="eyebrow">결과</p>
            <h1>${esc(s.title)}</h1>
            <div class="card">${resultsHtml(s, list)}</div>
            ${s.allowComment ? `<div class="card"><h2>의견 ${comments.length}건</h2>
                ${comments.length ? `<ul class="comments">${comments.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>` : '<p class="muted">등록된 의견이 없습니다.</p>'}</div>` : ''}
            <div class="actions">
                <button id="refresh">새로고침</button>
                <button id="copy">링크 복사</button>
                <button id="back">목록으로</button>
            </div>`;
        document.getElementById('refresh').onclick = () => renderResultsPage(s);
        document.getElementById('copy').onclick = () => copyLink(s.id);
        document.getElementById('back').onclick = renderAdmin;
    } catch (e) {
        app.innerHTML = `<p class="banner">${esc(errMsg(e))}</p><div class="actions"><button id="back">목록으로</button></div>`;
        document.getElementById('back').onclick = renderAdmin;
    }
}

/* ---------- 관리자: 만들기/수정 ---------- */
function blankQuestion() {
    return { id: 'q' + rid(), text: '', type: 'multi', required: false, optionsText: '', _opts: [] };
}

function datesBetween(from, to, dows) {
    const out = [];
    const [fy, fm, fd] = from.split('-').map(Number);
    const [ty, tm, td] = to.split('-').map(Number);
    const end = new Date(ty, tm - 1, td);
    for (let d = new Date(fy, fm - 1, fd); d <= end; d.setDate(d.getDate() + 1)) {
        if (dows.includes(d.getDay())) out.push(new Date(d));
    }
    return out;
}

// 방학 급식·돌봄 조사 예시 (날짜는 만들 때 고쳐 쓴다)
function mealPreset() {
    const q = (text, type, required, labels) => ({
        id: 'q' + rid(), text, type, required, optionsText: labels.join('\n'), _opts: []
    });
    return {
        title: '방학 중 급식·돌봄 신청 조사',
        description: '이름은 받지 않습니다. 급식이 필요한 요일의 인원(자녀 수)을 입력해 주세요. 집계 인원은 급식 업체에 전달됩니다.',
        showResults: false, allowComment: true, closesAt: null,
        questions: [
            q('방학 중 급식이 필요한 요일별 인원', 'count', false,
                ['10월 26일(월)', '10월 27일(화)', '10월 28일(수)', '10월 29일(목)', '10월 30일(금)']),
            q('10월 26일(월) 교사 전체회의 — 부모돌봄 지원 가능 시간', 'multi', false, ['오전', '오후'])
        ]
    };
}

function renderEditor(existing, preset) {
    document.title = existing ? '조사 수정' : '새 조사';
    const draft = existing
        ? {
            title: existing.title,
            description: existing.description || '',
            showResults: existing.showResults,
            allowComment: existing.allowComment,
            closesAt: existing.closesAt,
            questions: existing.questions.map((q) => ({
                ...q, optionsText: q.options.map((o) => o.label).join('\n'), _opts: q.options
            }))
        }
        : preset || {
            title: '', description: '', showResults: true, allowComment: false, closesAt: null,
            questions: [blankQuestion()]
        };

    const draw = () => {
        const qs = draft.questions.map((q, i) => `
            <div class="q-edit" data-i="${i}">
                <label class="field"><span>문항 ${i + 1}</span>
                    <input type="text" data-f="text" value="${esc(q.text)}" maxlength="120" placeholder="예: 참석 가능한 날짜를 모두 선택해 주세요"></label>
                <div class="row tight" style="margin-bottom:12px">
                    <select data-f="type" aria-label="선택 방식" style="width:auto">
                        <option value="multi" ${q.type === 'multi' ? 'selected' : ''}>여러 개 선택</option>
                        <option value="single" ${q.type === 'single' ? 'selected' : ''}>하나만 선택</option>
                        <option value="count" ${q.type === 'count' ? 'selected' : ''}>항목별 인원수 입력</option>
                    </select>
                    <label class="check"><input type="checkbox" data-f="required" ${q.required ? 'checked' : ''}> 필수 응답</label>
                </div>
                <label class="field"><span>선택지 (한 줄에 하나씩)</span>
                    <textarea data-f="optionsText" placeholder="10월 26일(월)&#10;10월 27일(화)">${esc(q.optionsText)}</textarea></label>
                <details class="helper"><summary>날짜·시간 선택지 자동 만들기</summary>
                    <div class="row"><label class="field"><span>시작일</span><input type="date" data-h="from"></label>
                        <label class="field"><span>종료일</span><input type="date" data-h="to"></label></div>
                    <div class="dows">${DOW.map((d, n) => `<label class="check"><input type="checkbox" data-h="dow" value="${n}" checked> ${d}</label>`).join('')}</div>
                    <label class="field"><span>시간 (쉼표로 구분, 비우면 날짜만)</span>
                        <input type="text" data-h="times" placeholder="예: 10시, 12시, 14시"></label>
                    <button type="button" class="small" data-h="gen">선택지에 추가</button>
                </details>
                <div class="actions" style="margin-top:0">
                    <button type="button" class="small danger" data-rm ${draft.questions.length === 1 ? 'disabled' : ''}>문항 삭제</button>
                </div>
            </div>`).join('');

        app.innerHTML = `
            <p class="eyebrow">${existing ? '조사 수정' : '새 조사'}</p>
            <h1>${existing ? esc(existing.title) : '조사 만들기'}</h1>
            <div class="card">
                <label class="field"><span>제목</span><input type="text" id="t" maxlength="100" value="${esc(draft.title)}" placeholder="예: 10월 4주차 참석 조사"></label>
                <label class="field"><span>안내 문구 (선택)</span><textarea id="d" maxlength="1000">${esc(draft.description)}</textarea></label>
                <label class="field"><span>마감 일시 (선택)</span><input type="datetime-local" id="c" value="${toLocalInput(draft.closesAt)}"></label>
                <label class="check"><input type="checkbox" id="sr" ${draft.showResults ? 'checked' : ''}> 응답자에게도 결과 공개</label><br>
                <label class="check" style="margin-top:8px"><input type="checkbox" id="ac" ${draft.allowComment ? 'checked' : ''}> 의견란 사용 (관리자만 열람)</label>
            </div>
            ${qs}
            <div class="actions"><button type="button" id="addq">문항 추가</button></div>
            <p id="ed-error" class="req" role="alert" hidden></p>
            <div class="actions"><button class="primary" id="save">${existing ? '저장' : '만들기'}</button><button id="cancel">취소</button></div>`;

        const sync = () => {
            draft.title = document.getElementById('t').value;
            draft.description = document.getElementById('d').value;
            const c = document.getElementById('c').value;
            draft.closesAt = c ? new Date(c).getTime() : null;
            draft.showResults = document.getElementById('sr').checked;
            draft.allowComment = document.getElementById('ac').checked;
            app.querySelectorAll('.q-edit').forEach((box) => {
                const q = draft.questions[Number(box.dataset.i)];
                q.text = box.querySelector('[data-f=text]').value;
                q.type = box.querySelector('[data-f=type]').value;
                q.required = box.querySelector('[data-f=required]').checked;
                q.optionsText = box.querySelector('[data-f=optionsText]').value;
            });
        };

        app.querySelectorAll('.q-edit').forEach((box) => {
            const i = Number(box.dataset.i);
            box.querySelector('[data-rm]').onclick = () => { sync(); draft.questions.splice(i, 1); draw(); };
            box.querySelector('[data-h=gen]').onclick = () => {
                const from = box.querySelector('[data-h=from]').value;
                const to = box.querySelector('[data-h=to]').value || from;
                if (!from) { toast('시작일을 선택해 주세요.'); return; }
                const dows = [...box.querySelectorAll('[data-h=dow]:checked')].map((x) => Number(x.value));
                const times = box.querySelector('[data-h=times]').value.split(',').map((x) => x.trim()).filter(Boolean);
                const lines = [];
                datesBetween(from, to, dows).forEach((d) => {
                    const base = `${d.getMonth() + 1}월 ${d.getDate()}일(${DOW[d.getDay()]})`;
                    if (times.length) times.forEach((t) => lines.push(`${base} ${t}`)); else lines.push(base);
                });
                if (!lines.length) { toast('조건에 맞는 날짜가 없습니다.'); return; }
                sync();
                const q = draft.questions[i];
                q.optionsText = (q.optionsText.trim() ? q.optionsText.replace(/\s+$/, '') + '\n' : '') + lines.join('\n');
                draw();
            };
        });
        document.getElementById('addq').onclick = () => { sync(); draft.questions.push(blankQuestion()); draw(); };
        document.getElementById('cancel').onclick = renderAdmin;
        document.getElementById('save').onclick = async () => {
            sync();
            const errEl = document.getElementById('ed-error');
            const fail = (m) => { errEl.textContent = m; errEl.hidden = false; };
            if (!draft.title.trim()) return fail('제목을 입력해 주세요.');
            const questions = [];
            for (const [n, q] of draft.questions.entries()) {
                const labels = [...new Set(q.optionsText.split('\n').map((x) => x.trim()).filter(Boolean))];
                if (!q.text.trim()) return fail(`문항 ${n + 1}의 질문을 입력해 주세요.`);
                if (labels.length < 2) return fail(`문항 ${n + 1}의 선택지는 2개 이상 필요합니다.`);
                // 수정 시 기존 선택지 id를 유지해 이미 쌓인 응답이 어긋나지 않게 한다
                const options = labels.map((label) => {
                    const prev = (q._opts || []).find((o) => o.label === label);
                    return { id: prev ? prev.id : 'o' + rid(), label };
                });
                questions.push({ id: q.id, text: q.text.trim(), type: q.type, required: q.required, options });
            }
            const survey = {
                title: draft.title.trim(), description: draft.description.trim(), questions,
                showResults: draft.showResults, allowComment: draft.allowComment, closesAt: draft.closesAt,
                status: existing ? existing.status : 'open'
            };
            try {
                if (existing) await be.updateSurvey(existing.id, survey);
                else await be.createSurvey(survey);
                toast('저장했습니다.');
                renderAdmin();
            } catch (e) { fail(errMsg(e)); }
        };
    };
    draw();
}

/* ---------- 시작 ---------- */
(async () => {
    try {
        be = await createBackend();
        const id = new URLSearchParams(location.search).get('s');
        if (id) await renderRespond(id); else await renderAdmin();
    } catch (e) {
        app.innerHTML = `<div class="card"><h1>불러오지 못했습니다</h1><p class="muted">${esc(errMsg(e))}</p></div>`;
    }
})();
