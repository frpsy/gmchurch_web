# 리팩토링 분석 보고서

> 작성일: 2026-05-26  
> 대상: `frpsy/gmchurch_web` (HTML + CSS + Vanilla JS 정적 사이트)  
> 목적: 코드 수정 없이 현황 분석 — 리팩토링 우선순위 결정용

---

## 1. app.js 렌더러별 책임 경계 명확성 평가

### 1.1 렌더러 목록 및 담당 영역

| 렌더러 | 담당 DOM | 정의 라인 | SRP 준수 |
|--------|---------|---------|---------|
| NavRenderer | `#main-nav` | 45–138 | ✅ |
| FooterRenderer | `#main-footer` | 141–173 | ⚠️ |
| IndexRenderer | 홈 전체 섹션 | 176–266 | ❌ |
| WorshipRenderer | `#worship-full` | 269–411 | ⚠️ |
| CommunityRenderer | `#community-full` | 414–430 | ✅ |
| GivingRenderer | `#giving-full` | 433–451 | ✅ |
| VisitRenderer | `#visit-full` | 454–503 | ✅ |
| AnglicanRenderer | 성공회 소개 2개 섹션 | 506–580 | ⚠️ |
| ClergyRenderer | 성직자+철학+로고 3개 섹션 | 583–707 | ❌ |
| PressRenderer | `#press-table` | 710–728 | ✅ |

### 1.2 SRP 위반 사례

#### IndexRenderer — 4개 섹션 혼합 (app.js:177–182)
```javascript
render() {
    this._hero();      // 히어로 배너
    this._about();     // 교회 소개
    this._worship();   // 예배 요약
    this._giving();    // 헌금 + 지도
}
```
- `_giving()` 안에 지도 렌더링(MapHelper)까지 포함 — 위치정보와 헌금 데이터를 동시에 처리
- `_community()` 메서드가 정의되어 있으나 `render()`에서 호출 안 함 (데드코드, app.js:223–233)

#### ClergyRenderer — 3개 독립 섹션 담당 (app.js:584–588)
```javascript
render() {
    this._clergy();      // 성직자 카드
    this._philosophy();  // 교회 철학
    this._logo();        // ACGM 로고
}
```
- 세 섹션은 콘텐츠·데이터·스타일이 완전히 독립적임에도 하나의 렌더러로 묶임
- 로고만 또는 철학만 업데이트하려 해도 전체 재렌더 발생

#### FooterRenderer — clergy 데이터 월경 참조 (app.js:155)
```javascript
<p>...${clergy[0].name} ${clergy[0].title.split('·')[0].trim()}</p>
```
- FooterRenderer가 clergy 배열에 직접 의존 — clergy 순서 변경 시 푸터 표시가 틀어짐

---

## 2. style.css 미사용 클래스 탐지

총 약 150개 클래스 분석 → **사용률 95.3%**

### 미사용 클래스 목록 (7개)

| 클래스 | 정의 라인 | 관련 기능 | 제거 가능 여부 |
|--------|---------|---------|------------|
| `.btn-nav-live` | 176–187 | 네비게이션 LIVE 버튼 | ✅ 제거 가능 (`liveUrl` 미렌더) |
| `.anglican-welcome-icon` | 757 | 환영 배너 아이콘 | ✅ 제거 가능 |
| `.liturgy-quote` | 959–978 | 전례 인용문 블록 | ✅ 제거 가능 (`.liturgy-inner-quote` 사용 중) |
| `.liturgy-closing` | 1119–1139 | 종결 명상 섹션 | ✅ 제거 가능 |
| `.closing-body` | 1133–1139 | 종결 본문 (위 종속) | ✅ 제거 가능 |
| `.mt-1` | 1185 | margin-top 유틸리티 | ✅ 제거 가능 |
| `.mt-2` | 1186 | margin-top 유틸리티 | ✅ 제거 가능 |

> **주의:** 제거 전 grep 재검증 필수. 향후 JS로 동적 추가될 가능성이 있는 클래스는 보류.

---

## 3. data.js → 렌더러 결합도 매핑

### 3.1 CHURCH_DATA 키별 의존 렌더러

| CHURCH_DATA 키 | 의존 렌더러 | 접근 방식 | 의존도 |
|----------------|-----------|---------|------|
| `info` | NavRenderer, FooterRenderer, IndexRenderer, VisitRenderer | 구조분해 | HIGH |
| `anglican` | AnglicanRenderer | 구조분해 | MEDIUM |
| `logo` | ClergyRenderer | 구조분해 | MEDIUM |
| `ministerSection` | ClergyRenderer | 직접 참조 | HIGH |
| `clergy` | ClergyRenderer, FooterRenderer | 필터링+map / 인덱스 접근 | HIGH |
| `philosophy` | ClergyRenderer | 구조분해 | MEDIUM |
| `worship` | WorshipRenderer, IndexRenderer | 구조분해 | HIGH |
| `community` | CommunityRenderer, IndexRenderer(미사용) | 구조분해 | MEDIUM |
| `giving` | GivingRenderer, IndexRenderer | 구조분해 | HIGH |
| `sns` | FooterRenderer | 구조분해 | MEDIUM |
| `liveUrl` | **없음** | — | **미사용** |
| `press` | PressRenderer | 조건부 + map | MEDIUM |
| `navigation` | NavRenderer | 직접 참조 | HIGH |

### 3.2 문제 케이스

#### 자기 책임 외 데이터 참조
- `FooterRenderer` → `clergy[0]` 참조 (app.js:155) — clergy 배열 변경에 푸터가 영향 받음
- `IndexRenderer._giving()` → `CHURCH_DATA.info.addressShort`, `phone` 동시 참조 (app.js:239) — 위치정보와 헌금 렌더가 같은 메서드에 혼합

#### liturgicalSeason 고정값 파이프라인
```
data.js 로드 시점
  → LiturgicalCalendar.compute() 즉시 실행 (data.js:238)
  → CHURCH_DATA.worship.liturgicalSeason 에 고정
  → WorshipRenderer가 고정된 값 참조 (app.js:273)
  → 페이지 새로고침 없으면 절기 색상 변경 불가
```

#### 미사용 데이터
- `CHURCH_DATA.liveUrl` — data.js에 정의되어 있으나 어느 렌더러도 참조하지 않음

---

## 4. 모바일 성능 병목 예상 지점 (Critical Rendering Path)

### 4.1 렌더 블로킹 리소스

```
브라우저 첫 렌더까지 차단 경로:

1. preconnect cdn.jsdelivr.net         → DNS 조회 (Good)
2. preload pretendard.css              → 사전 로드 (Good)
3. <link> pretendard.css (CDN)         → 렌더 블로킹 ⚠️ 200–800ms
4. <link> style.css                    → 렌더 블로킹 ⚠️ 20–50ms
5. DOMContentLoaded → App.init()       → JS 실행
6. document.fonts.ready               → 폰트 완료 대기 ⚠️ 200–1000ms
```

### 4.2 폰트 로딩

| 항목 | 현황 | 평가 |
|-----|------|------|
| CDN | jsdelivr.net | ✅ 글로벌 CDN |
| 폰트 타입 | variable + dynamic subset | ✅ 최적화됨 |
| preload 설정 | 있음 | ✅ |
| `document.fonts.ready` | app.js:761 (해시 스크롤 대기) | ⚠️ 타임아웃 없음 |

**위험:** 폰트 CDN 응답 지연 또는 차단 시 `document.fonts.ready`가 무한 대기 — 앵커 링크 이동 완전 멈춤.

### 4.3 이미지 및 지도

| 리소스 | 위치 | 현황 | 평가 |
|-------|------|------|------|
| 히어로 배경 (Unsplash) | style.css `.hero-fallback` | `w=1800&q=80`, Ken Burns 애니메이션 | ⚠️ 배경 이미지 — lazy 불가, 3G 5–8초 |
| Google Maps iframe | MapHelper (app.js:30) | `loading="lazy"` 설정 | ✅ |
| `prefers-reduced-motion` | style.css | Ken Burns 애니메이션 비활성화 | ✅ |

**히어로 이미지 병목:** `preconnect https://images.unsplash.com` 누락 — 첫 접속 시 DNS 조회 지연 추가.

### 4.4 JS 실행 타이밍

```
body 끝에서 동기 로드:
  data.js  → LiturgicalCalendar.compute() 즉시 실행 (~1ms)
  app.js   → 렌더러 객체 생성, DOMContentLoaded 이벤트 등록

App.init():
  NavRenderer   → DOM 쓰기
  FooterRenderer→ DOM 쓰기
  PageRenderer  → DOM 쓰기 (innerHTML × n회)
  _handleHashScroll → document.fonts.ready 대기 (비동기)
```

`defer` 미사용 — 단, `</body>` 직전 로드이므로 실질적 차이 없음.

### 4.5 페이지별 LCP 예상 요소

| 페이지 | LCP 요소 | 예상 시간 (3G) |
|-------|---------|-------------|
| index.html | `.hero h1` 또는 Unsplash 배경 | 3.0–5.0s |
| clergy.html | `.page-hero h1` | 1.5–3.0s |
| worship.html | `.section-title` | 1.5–3.0s |
| visit.html | Maps iframe | 2.5–5.0s |
| giving.html | `.bank-card` | 1.5–3.0s |

### 4.6 개선 여지 (리팩토링 범위 밖, 참고용)

1. `preconnect https://images.unsplash.com` 추가 (index.html head)
2. `document.fonts.ready` 에 1초 타임아웃 추가 (폰트 CDN 장애 대비)
3. Maps iframe 뷰포트 진입 시 지연 로드 (IntersectionObserver)

---

## 5. 리팩토링 시 파괴 위험이 높은 부분

### 5.1 🔴 id="priest" 동적 생성 로직

**위치:** app.js:636–639

```javascript
const isFirstPriest = !firstPriestRendered && cat.id === '성직자';
if (isFirstPriest) firstPriestRendered = true;
return `<div class="clergy-card" ${isFirstPriest ? 'id="priest"' : ''}>...
```

**파괴 조건:**
- `data.js`의 `clergy` 배열 순서 변경 → 다른 사제가 `#priest` ID를 받음
- `ministerSection.categories` 순서 변경 → 성직자 카테고리가 첫 번째가 아니면 ID 미생성
- clergy 배열에 `category: "사역자"` 항목이 먼저 오면 `id="priest"` 미생성

**현재 nav 앵커:** `clergy.html#priest-section` (data.js:348)  
→ 섹션 ID와 카드 ID가 분리되어 있어 즉각 깨지지는 않지만, 코드 내 `#priest` 직접 링크가 생기면 위험.

**규칙:** clergy 배열 수정 시 `category: "성직자"` 항목을 **반드시 첫 번째**에 유지할 것.

---

### 5.2 🔴 LiturgicalCalendar.compute() 즉시 실행

**위치:** data.js:238

```javascript
liturgicalSeason: LiturgicalCalendar.compute(),  // data.js 로드 시점에 고정
```

**파괴 조건:**
- 자정 전후로 페이지가 캐시되면 절기 색상이 하루 동안 틀린 채로 유지됨
- CDN 또는 브라우저 캐시가 HTML을 오래 보유할 경우 절기 불일치 지속
- 단위 테스트 작성 시 실행 시간대에 따라 결과가 달라지는 비결정적 코드

**규칙:** liturgicalSeason 관련 로직을 리팩토링할 경우 `LiturgicalCalendar.compute()` 호출을 렌더 시점으로 이동해야 함. data.js에서 값을 고정하는 패턴 유지 금지.

---

### 5.3 🟠 App._handleHashScroll() 체이닝

**위치:** app.js:757–765

```javascript
const ready = (document.fonts && document.fonts.ready)
    ? document.fonts.ready
    : Promise.resolve();
ready.then(() =>
    requestAnimationFrame(() => this._scrollToHash(hash))
);
```

**파괴 조건:**
- `document.fonts.ready`에 타임아웃 없음 → 폰트 CDN 차단 시 스크롤 영구 미동작
- `_scrollToHash()` 내부에서 `document.querySelector(hash)` 실패 시 조용히 무시 (디버깅 어려움)
- CSS 변수 `--nav-h` 미로드 시 `parseInt(undefined) = NaN` → 스크롤 오프셋 오류

**규칙:** 이 함수를 수정할 때는 반드시 `Promise.race`로 타임아웃 처리를 함께 추가할 것.

---

### 5.4 🟠 NavRenderer._bindEvents() 이벤트 등록

**위치:** app.js:90–137

**파괴 조건:**
- `NavRenderer.render()`를 두 번 호출하면 `_bindEvents()`도 두 번 실행 → 이벤트 리스너 중복 등록
- `window.addEventListener('scroll', ...)` 제거 로직 없음 → SPA 전환 시 메모리 누수
- `document.addEventListener('click', ...)` 동일 문제

**규칙:** render()는 반드시 1회만 호출할 것. 추후 동적 재렌더 기능 추가 시 기존 리스너 제거 로직 필수.

---

### 5.5 🟠 .footer-col CSS 선택자 특이성

**위치:** style.css:1161–1170

```css
.footer-col p a { color: inherit; }          /* 특이성 (0,2,2) = 22 */
.footer-col > a {                             /* 특이성 (0,2,1) = 21 */
    display: block;
    color: rgba(255,255,255,0.65);
}
```

**파괴 조건:**
- `.footer-col > a` 색상이 `.footer-col p a { color: inherit }`에 의해 덮어써질 수 있음 (특이성 역전)
- FooterRenderer의 SNS 링크가 `<p>` 안으로 이동하면 `display: block` 규칙 탈락 → 레이아웃 붕괴
- 현재 SNS 링크는 `.footer-col` 직접 자식이어야만 블록 스타일 적용됨

**규칙:** 풋터 HTML 구조(SNS 링크가 `<div class="footer-col">` 직접 자식) 변경 금지.

---

### 5.6 🟡 CHURCH_DATA.worship.liturgicalSeason 고정값

(5.2와 연관)

**위치:** data.js:238, app.js:273

**WorshipRenderer 색상 인라인 스타일:**
```javascript
style="background:${s.colorLight}; border-left:4px solid ${s.color};"
```
- 절기 색상이 인라인 스타일로 직접 삽입됨
- CSS 변수 또는 클래스 기반이 아니므로 DevTools에서 추적 어려움
- 절기가 바뀌어도 리렌더 없으면 색상 미변경

**규칙:** liturgicalSeason 색상을 CSS 변수(`--season-color`)로 전환하기 전까지 `compute()` 호출 위치를 data.js에서 렌더러로 이동하지 말 것 (이동 시 다른 색상 참조 지점도 함께 변경 필요).

---

## 종합 우선순위 표

| 우선순위 | 항목 | 위험도 | 권장 행동 |
|--------|------|------|---------|
| P0 | `id="priest"` 동적 생성 취약성 | 🔴 HIGH | clergy 배열 수정 시 카테고리 순서 고정 규칙 문서화 |
| P0 | liturgicalSeason 로드 시 고정 | 🔴 HIGH | WorshipRenderer 내에서 `compute()` 직접 호출로 이동 |
| P1 | `.footer-col` CSS 선택자 특이성 | 🟠 MEDIUM | 선택자 구조 정리, HTML 변경 금지 규칙 |
| P1 | IndexRenderer 다중 책임 | 🟠 MEDIUM | `_giving()` 분리, `_community()` 데드코드 제거 |
| P1 | ClergyRenderer 3중 책임 | 🟠 MEDIUM | LogoRenderer, PhilosophyRenderer 분리 |
| P2 | `fonts.ready` 타임아웃 미설정 | 🟡 MEDIUM | `Promise.race` + 1초 타임아웃 추가 |
| P2 | NavRenderer 이벤트 중복 등록 가능성 | 🟡 MEDIUM | `render()` 1회 보장 문서화 |
| P3 | 미사용 CSS 클래스 7개 | 🟢 LOW | 삭제 전 grep 재검증 후 제거 |
| P3 | `liveUrl` 미사용 데이터 | 🟢 LOW | 렌더러 추가 또는 data.js에서 제거 |

---

*분석 대상 커밋: `9e70764` (Merge PR #52) — 2026-05-26*
