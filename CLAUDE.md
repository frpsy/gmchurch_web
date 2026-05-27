# 대한성공회 광명교회 웹사이트 — 프로젝트 구조

## 개요

| 항목 | 내용 |
|------|------|
| 저장소 | `frpsy/gmchurch_web` (GitHub) |
| 배포 | GitHub Pages — `https://frpsy.github.io/gmchurch_web` |
| 방식 | 빌드 없는 순수 정적 사이트 (HTML + CSS + Vanilla JS) |
| 브랜치 전략 | 작업 브랜치 → PR → main 머지 → GitHub Pages 자동 배포 |

---

## 파일 구조

```
gmchurch_web/
├── index.html        메인 페이지
├── clergy.html       교회 소개 (성공회·사제·철학·로고·언론)
├── worship.html      예배 안내 + 전례 가이드
├── community.html    공동체 (희망터·엠마우스·소그룹)
├── visit.html        오시는 길 (지도·교통·주차)
├── giving.html       헌금 (봉헌 계좌)
├── privacy.html      개인정보 처리방침 (noindex)
├── data.js           ★ 단일 콘텐츠 소스 — CHURCH_DATA
├── app.js            렌더러 모음 + App bootstrap (~807줄)
├── style.css         전체 스타일 (~1443줄)
├── favicon.svg       캔터베리 십자가 (짙은 녹색 배경 + 흰색 십자가)
├── apple-touch-icon.png
├── og-image-v2.png   소셜 공유 OG 이미지 (1200×630)
├── robots.txt
├── sitemap.xml
├── docs/             위원회 audit 보고서 · 작업 지시서
└── CLAUDE.md         (이 파일)
```

**스크립트 로드 순서**: 모든 HTML 공통 — `data.js` → `app.js`  
`data.js`가 먼저 로드되어 `CHURCH_DATA` / `LiturgicalCalendar` 전역 변수를 정의하고, `app.js`가 이를 참조해 렌더링함.

---

## data.js 구조

### LiturgicalCalendar (CHURCH_DATA 선언 전에 정의)

부활절 날짜를 Meeus/Jones/Butcher 알고리즘으로 계산하고, 오늘 날짜 기준 절기·색·심볼을 자동 반환하는 IIFE 모듈.

```javascript
const LiturgicalCalendar = (() => {
    easterDate(year)     // 부활절 계산
    addDays(date, days)
    startOfDay(date)
    adventStart(year)    // 대림 1주일 계산
    compute(today = new Date())  // 절기 객체 반환
    return { compute, easterDate, adventStart };
})();
```

`compute()` 반환 shape:
```javascript
{
    name,        // "성령강림 후"
    colorName,   // "녹색"
    color,       // "#3d6b4a"
    colorLight,  // "#eef2ec"
    symbol,      // "🌿"
    note,        // "그리스도인의 일상"
    year,        // 2026
    dateLabel    // "2026년 5월"
}
```

#### 절기 / 색 매핑 (대한성공회 기도서 기준)

| 절기 | 색 | HEX | 기간 |
|------|----|-----|------|
| 대림절 | 자색 | `#6b4f8f` | 대림 1주일 ~ 12/24 |
| 성탄절 | 백색 | `#b8860b` | 12/25 ~ 1/5 |
| 공현절 후 | 녹색 | `#3d6b4a` | 1/6 ~ 재의 수요일 전날 |
| 사순절 | 자색 | `#6b4f8f` | 재의 수요일 ~ 종려주일 전날 |
| 성주간 | 적색 | `#c0390f` | 종려주일 ~ 부활 전야 |
| 부활절 | 백색 | `#b8860b` | 부활 대축일 ~ 성령강림 전날 |
| 성령강림절 | 적색 | `#c0390f` | 성령강림 대축일 당일 |
| 성령강림 후 | 녹색 | `#3d6b4a` | 성령강림 다음날 ~ 대림 전날 |

---

### CHURCH_DATA 스키마

```javascript
const CHURCH_DATA = {

  info: {
    name: "대한성공회 광명교회",
    subName: "성 디모테오 성당",
    slogan: "모든 생명을 환대하는 교회",
    vision: "하느님 나라를 살아가는 사랑의 공동체",
    established: "1990년 2월 11일",
    address: "경기도 광명시 아방리 2길 10",
    addressShort: "경기도 광명시 아방리 2길 10",
    postalCode: "14335",
    addressJibun: "경기도 광명시 노온사동 373-1",
    addressDetail: { sido, sigungu, eupmyeondong, jibun, road },
    geo: { latitude: 37.4757, longitude: 126.8641 },
    phone: "02-2686-0091",
    fax: "02-2686-0092",
    email: "bsyg2000@hanmail.net"
  },

  anglican: {
    welcome: "…배너 문구…",
    what: {                         // 성공회란? 섹션
      eyebrow, title,
      paras: [String, String],
      pillars: [{ icon, title, desc }],  // 성경·전통·이성 3기둥
      pillarNote: String
    },
    korea: {                        // 대한성공회 섹션
      eyebrow, title,
      founded: "1890",
      paras: [String, String],
      highlights: [{ icon, text }]  // 4개 하이라이트
    }
  },

  logo: {                           // 캔터베리 십자가 소개 (clergy.html)
    eyebrow, title, desc,
    colors: String
    // letters 필드 없음 — ACGM 모노그램 → 캔터베리 십자가로 변경됨
  },

  clergy: [
    {
      name: "민숙희(마가렛)",
      title: "관할사제 · 서울교구 서부교무구 총사제",
      ordained: "2005년 서품",
      quote: String,
      desc: String,
      contact: "bsyg2000@hanmail.net",  // @ 포함 시 mailto:, 아니면 tel: 링크
      bio: {
        milestones: [{ year, text, first? }],  // first=true → '최초' 배지
        roles: [String],
        externalRoles: [String],               // 교회 밖 활동 태그
        ministryNote: String,
        source: { title, author, publisher, year }
      }
    },
    {
      name: "이남호(사도요한)",
      title: "협동사제",
      ordained: "", quote: "", desc: String,
      contact: "",
      kyoboUrl: "https://www.aladin.co.kr/…"  // 저서 링크
    }
  ],

  philosophy: {
    values: [{ icon, title, desc }]  // 녹색·열린·평등·전례 4개
  },

  worship: {
    liturgicalSeason: LiturgicalCalendar.compute(),  // 자동 산출
    main: [
      { id: "main",     title: "주일 감사성찬례", time, desc },
      { id: "children", title: "어린이 예배",     time, desc }
    ],
    guide: String,         // 처음 오시는 분 안내 한 줄
    liturgyInfo: [...]     // 레거시 배열 — WorshipRenderer가 직접 렌더
  },

  community: {
    groups: [
      { id: "hopecenter", title: "광명 희망터",  desc, icon },
      { id: "emmaus",     title: "엠마우스 코스", desc, icon },
      { id: "smallgroup", title: "소그룹 모임",  desc, icon }
    ]
  },

  giving: {
    bankName: "국민은행",
    bank: "2680-100-14008",
    holder: "대한성공회 광명교회",
    report: String,
    receiptInfo: String    // 기부금 영수증 안내 (두 문장 → 렌더 시 <br> 삽입)
  },

  sns: {
    youtube, instagram, "naver blog", diocesan
  },

  liveUrl: "https://youtu.be/5tTJvrTX4aA",

  press: [
    { year, media, title, date, url }  // 4건 (2005·2016·2021·2025)
  ],

  navigation: [...]  // 아래 참조
};
```

---

### 내비게이션 구조 (`navigation` 배열)

전체 앵커 22개 자동 검증 완료. `(JS)` = JS 렌더러가 동적으로 생성하는 ID.

```
교회 소개  clergy.html
  └ 성공회란?          clergy.html#what-is-anglican
  └ 대한성공회         clergy.html#ack
  └ 관할사제           clergy.html#priest           (JS)
  └ 교회 철학          clergy.html#philosophy
  └ 언론 보도          clergy.html#press

예배  worship.html
  └ 주일 감사성찬례    worship.html#main            (JS)
  └ 어린이 예배        worship.html#children        (JS)

처음 오시는 분  worship.html#newcomer
  └ 성공회 전례란?     worship.html#newcomer        (JS)
  └ 예배 순서          worship.html#eucharist-order (JS)
  └ 영성체 안내        worship.html#communion       (JS)
  └ 처음 오신 분들께   worship.html#firsttime       (JS)

공동체  community.html
  └ 광명 희망터        community.html#hopecenter    (JS)
  └ 엠마우스 코스      community.html#emmaus        (JS)
  └ 소그룹 모임        community.html#smallgroup    (JS)

오시는 길  visit.html
  └ 주소·교통          visit.html#location          (JS)
  └ 주차 안내          visit.html#parking           (JS)

헌금  giving.html
  └ 봉헌 계좌          giving.html#offering         (JS)
```

---

## app.js 렌더러 구조

```
window DOMContentLoaded
└── App.init()
      ├── NavRenderer.render()        → #main-nav (모든 페이지)
      │     로고: 투명 배경 + 흰색 캔터베리 십자가 SVG + 교회명
      │     _bindEvents()
      │       • scroll → .nav-header.scrolled
      │       • hamburger toggle → .nav-menu.open
      │       • .nav-chevron click → .nav-item.mobile-open 토글
      │         (nav-link는 e.preventDefault() 없이 항상 이동)
      │       • .dropdown a click → 모바일 메뉴 자동 닫힘
      │
      ├── FooterRenderer.render()     → #main-footer (모든 페이지)
      │     info + clergy[0] + sns 4개 링크 + 개인정보 처리방침 링크
      │     주소 → 네이버지도 링크로 렌더됨 (MapHelper.naverUrl)
      │
      ├── IndexRenderer.render()      → index.html 전용
      │     _hero()    → #hero-title, #hero-sub
      │     _about()   → #about-brief-content
      │     _worship() → #worship-grid, #worship-guide
      │     _giving()  → #bank-info, #location-card (지도 + 주소)
      │
      ├── WorshipRenderer.render()    → #worship-full (worship.html)
      │     예배 카드 그리드 + guide-banner
      │     liturgy-guide (id="newcomer")
      │       id="eucharist-order"  감사성찬례 4단계
      │       id="communion"        영성체 안내
      │       id="firsttime"        처음 오신 분들께
      │     ※ liturgicalSeason(s).color / s.colorLight 인라인 style 적용
      │
      ├── CommunityRenderer.render()  → #community-full (community.html)
      │
      ├── GivingRenderer.render()     → #giving-full (giving.html)
      │     id="offering" div 내 봉헌 계좌 카드
      │     receiptInfo → ". " 기준 <br> 삽입하여 두 줄 렌더
      │
      ├── VisitRenderer.render()      → #visit-full (visit.html)
      │     id="location" : Google Maps iframe + 주소
      │     id="parking"  : 버스 칩(505 파랑 / 5627·5633·6637 녹색) + 주차
      │
      ├── AnglicanRenderer.render()   → clergy.html 전용
      │     _welcome() → #anglican-welcome-banner
      │     _what()    → #anglican-what  (성공회란? + 3기둥 pillars)
      │     _korea()   → #anglican-korea (2단 레이아웃: 텍스트 + 배지)
      │
      ├── ClergyRenderer.render()     → clergy.html 전용
      │     _logo()       → #logo-content  (캔터베리 십자가 SVG + 설명)
      │     _clergy()     → #clergy-full   (clergy-card × 2)
      │       _bioSection(bio) → 타임라인 + 소임 태그 + 교회 밖 활동 + 출처
      │     _philosophy() → #philosophy-full  (.values-grid)
      │
      ├── PressRenderer.render()      → #press-table (clergy.html)
      │
      └── App._handleHashScroll()
            window.location.hash 존재 시:
            document.fonts.ready → requestAnimationFrame → _scrollToHash()
            오프셋: --nav-h(68px) + 16px
            hashchange 이벤트도 동일 처리
```

---

## HTML 페이지별 섹션 구조

### index.html
```html
<a class="skip-link" href="#main-content">  ← 접근성 skip-link
<nav id="main-nav">                         ← NavRenderer
<main id="main-content">
<header class="hero">
  #hero-title / #hero-sub                   ← IndexRenderer._hero()
<section id="about-brief">
  #about-brief-content                      ← IndexRenderer._about()
<section id="worship">
  #worship-grid / #worship-guide            ← IndexRenderer._worship()
<section id="visit-preview">
  #location-card                            ← IndexRenderer._giving()
<section id="giving">
  #bank-info                                ← IndexRenderer._giving()
</main>
<footer id="main-footer">                   ← FooterRenderer
```

### clergy.html
```html
<div class="page-hero">
#anglican-welcome-banner                    ← AnglicanRenderer._welcome()
<section id="what-is-anglican">
  #anglican-what                            ← AnglicanRenderer._what()
<section id="ack">
  #anglican-korea                           ← AnglicanRenderer._korea()
<section id="priest-section">
  #clergy-full   (id="priest" on 첫 카드)  ← ClergyRenderer._clergy()
<section id="philosophy">
  #philosophy-full                          ← ClergyRenderer._philosophy()
<section id="logo-intro">
  #logo-content                             ← ClergyRenderer._logo()
<section id="press">
  #press-table                              ← PressRenderer
```

### worship.html
```html
<div class="page-hero">
<section>
  #worship-full                             ← WorshipRenderer
    #main / #children       예배 카드
    #newcomer               전례 가이드 시작
    #eucharist-order        감사성찬례 순서
    #communion              영성체 안내
    #firsttime              처음 오신 분들께
```

### community.html / giving.html / visit.html
```html
<div class="page-hero">
<section>  #community-full / #giving-full / #visit-full
```

---

## style.css 주요 컴포넌트

### CSS 변수

```css
--green-deep:   #0a1f12   /* 주 브랜드 색 (nav, footer, 제목) */
--green-mid:    #3d6b4a
--green-light:  #eef2ec
--green-soft:   #cdd9cf
--gold:         #8b7355
--gold-bg:      #f5efe3
--cream:        #f7f4ed   /* 기본 배경 */
--white:        #ffffff
--text:         #1a1a1a
--text-muted:   #6b6b66
--border:       #e8e5dc
--red:          #b53737
--nav-glass:    rgba(10, 31, 18, 0.9)  /* 네비게이션 글래스 배경 */
--nav-h:        68px
--section-pad:  9rem  (모바일: 5rem)
--content-max:  1200px
--radius-sm/md/lg: 8px / 14px / 20px
```

### 주요 클래스 목록

| 클래스 | 용도 |
|--------|------|
| `.skip-link` | 접근성 건너뛰기 링크 (포커스 시 노출) |
| `.nav-header` | 고정 헤더 (--nav-glass), scroll 시 `.scrolled` |
| `.nav-chevron` | 모바일 드롭다운 토글 화살표 버튼 (desktop: hidden) |
| `.nav-item.mobile-open` | 모바일 드롭다운 열림 상태 |
| `.hero` / `.hero-fallback` | Ken Burns 애니메이션 배경 (Unsplash 이미지) |
| `.page-hero` | 서브 페이지 상단 헤더 |
| `.section` / `.section-header` | 섹션 레이아웃 |
| `.container` | 최대폭 1200px, 패딩 clamp |
| `.grid` | auto-fit minmax(280px) 그리드 |
| `.card` / `.info-card` | 콘텐츠 카드 (기본 shadow 없음, hover 시 표시) |
| `.guide-banner` | 녹색 좌측 보더 배너 |
| `.quote-block` | 골드 좌측 보더 인용 |
| `.about-brief-*` | 메인 교회 소개 블록 |
| `.clergy-card` | 사제 카드 (2단 그리드) |
| `.bio-timeline` / `.bio-milestone` | 사제 이력 타임라인 |
| `.bio-first` | '최초' 배지 |
| `.bio-roles` / `.bio-role-tag` | 소임 태그 그룹 |
| `.bio-source` | 출처 각주 |
| `.liturgy-guide` | 전례 가이드 전체 래퍼 |
| `.liturgy-season-badge` | 현재 절기 배지 (색·심볼·절기명) |
| `.liturgy-steps` / `.liturgy-step` | 감사성찬례 4단계 |
| `.communion-grid` / `.communion-card` | 영성체 안내 카드 |
| `.liturgy-checklist` / `.checklist-item` | 처음 오신 분 체크리스트 |
| `.anglican-pillars` | 성공회 3기둥 카드 그리드 |
| `.anglican-korea-inner` | 대한성공회 2단 레이아웃 |
| `.logo-intro-grid` | 캔터베리 십자가 소개 그리드 |
| `.press-list` / `.press-item` | 언론 보도 리스트 |
| `.bus-chip.bus-blue/green` | 버스 번호 칩 |
| `.bank-card` | 봉헌 계좌 카드 |
| `.values-grid` / `.value-card` | 교회 철학 카드 |
| `.footer-inner` | 푸터 3단 그리드 |
| `.footer-logo-mark` | 푸터 캔터베리 십자가 컨테이너 (38×38px, 흰색 SVG) |

### 반응형 브레이크포인트

```css
@media (max-width: 768px)  /* 모바일: 햄버거 메뉴, 1단 레이아웃 */
@media (max-width: 480px)  /* 소형: 버튼 전폭 */
@supports (padding: env(safe-area-inset-left))  /* iPhone 노치 대응 */
```

---

## 개발 규칙

### 콘텐츠 수정
- **텍스트·데이터**: `data.js`의 `CHURCH_DATA` 만 편집
- **레이아웃·동작**: `app.js` 렌더러 편집
- **스타일**: `style.css` 편집

### 새 섹션 추가 절차
1. HTML에 `<div id="새id"></div>` 추가
2. `data.js`에 데이터 추가
3. `app.js`에 렌더러 메서드 추가
4. `data.js navigation`에 앵커 링크 추가
5. CLAUDE.md 동기화

### 앵커 / 해시 스크롤
- JS 렌더러가 생성하는 동적 ID는 `App._handleHashScroll()`이 처리
- `document.fonts.ready` → `requestAnimationFrame` → scroll (Pretendard 로딩 대기)
- 오프셋: `--nav-h`(68px) + 16px 여백

### 모바일 내비게이션
- `.nav-link` (텍스트): 항상 페이지 이동 (`e.preventDefault()` 없음)
- `.nav-chevron` (▾ 버튼): 드롭다운 토글만 담당
- 다른 드롭다운 열리면 이전 것 자동 닫힘
- 드롭다운 링크 클릭 시 모바일 메뉴 자동 닫힘

### 접근성 구조
- 모든 HTML: `<body>` 첫 자식 = `<a href="#main-content" class="skip-link">본문으로 바로가기</a>`
- 모든 HTML: `<nav>` 뒤 ~ `<footer>` 앞 = `<main id="main-content">...</main>`
- `:focus-visible` 스타일 — style.css Accessibility 섹션 참조

### 중복 ID 금지
- `clergy.html` 섹션 태그에 `id="philosophy"` 이미 있음
- `ClergyRenderer._philosophy()` 내부 div에 동일 ID 추가 금지

### Git 워크플로
```bash
git fetch origin main
git checkout -b claude/작업명 origin/main
# 작업 후
git add 파일
git commit -m "설명"
git push -u origin claude/작업명
# PR 생성 → 직접 검토 후 main에 머지
```

### 전례력 자동화 참고
```javascript
// 절기 확인
LiturgicalCalendar.compute()          // 오늘
LiturgicalCalendar.compute(new Date('2026-12-25'))  // 특정일
LiturgicalCalendar.easterDate(2027)   // 부활절 날짜
LiturgicalCalendar.adventStart(2026)  // 대림 1주일
```
