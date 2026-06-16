# 대한성공회 광명교회 웹사이트 — 프로젝트 구조

## 개요

| 항목 | 내용 |
|------|------|
| 저장소 | `frpsy/gmchurch_web` (GitHub) |
| 배포 | GitHub Pages — `https://frpsy.github.io/gmchurch_web` |
| 방식 | 빌드 없는 순수 정적 사이트 (HTML + CSS + Vanilla JS) |
| 브랜치 전략 | 작업 브랜치 → PR → main 머지 → GitHub Pages 자동 배포 |
| 현재 상태 | 2026년 6월 10일 |

---

## 파일 구조

```
gmchurch_web/
├── index.html        메인 페이지
├── clergy.html       교회 소개 (성공회·사제·철학·교회 이야기·로고·언론)
├── faq.html          자주 묻는 질문 (성공회 오해·궁금증 FAQ, 가안)
├── worship.html      예배 안내 (예배 카드·감사성찬례란·순서·예배 자료)
├── newcomer.html     처음 오신 분 (환영·참여 안내·전례·전례 공간·영성체·문의)
├── community.html    공동체 (희망터·엠마우스·소그룹·녹색교회)
├── sundays.html      교회력 허브 (이달의 교회력·전례독서·절기·특별 주일)
├── emmaus.html       엠마우스 코스 상세 페이지
├── hopecenter.html   광명 희망터 상세 페이지
├── smallgroup.html   소그룹 모임 상세 페이지
├── greenchurch.html  녹색교회 상세 페이지
├── links.html        관련 기관 상세 페이지
├── visit.html        오시는 길 (지도·교통·주차)
├── giving.html       헌금 (봉헌 계좌·영수증 안내)
├── media.html        미디어·자료 허브 (영상·사진·녹색교회·관련 기관 카드 링크)
├── videos.html       영상 갤러리 상세 페이지
├── gallery.html      사진 갤러리 상세 페이지 (noindex)
├── privacy.html      개인정보 처리방침 (noindex)
├── data.js           ★ 단일 콘텐츠 소스 — CHURCH_DATA (1081줄)
├── app.js            렌더러 모음 + App bootstrap (2211줄)
├── style.css         전체 스타일 (4128줄)
├── favicon.svg       캔터베리 십자가 (짙은 녹색 배경 + 흰색 십자가)
├── apple-touch-icon.png
├── og-image-v2.png   소셜 공유 OG 이미지 (1200×630)
├── robots.txt
├── sitemap.xml
├── docs/             위원회 audit 보고서 · 작업 지시서
└── ARCHITECTURE.md   (이 파일)
```

**스크립트 로드 순서**: 모든 HTML 공통 — `data.js` → `app.js`  
`data.js`가 먼저 로드되어 `CHURCH_DATA` / `LiturgicalCalendar` 전역 변수를 정의하고, `app.js`가 이를 참조해 렌더링함.

**로고(캔터베리 십자가) 단일 소스**: `app.js` 상단의 `CANTERBURY_CROSS_PATH` 상수 +
`canterburyCrossSVG()` 헬퍼가 nav · footer · 로고 소개 · 지도 핀의 십자가를 공유함.
트럼펫형(오목) 4팔 + 계단형 중앙 사각 + 중앙 점(`fill-rule="evenodd"` 구멍). favicon.svg도 동일 경로 사용.
로고 디자인 변경 시 `CANTERBURY_CROSS_PATH` 1곳 + `favicon.svg` 1곳만 수정.

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
      pillars: [{ icon, title, desc }],  // 성서·이성·전통 3기둥
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

  ministerSection: {
    categories: [
      { id: "성직자", title: "성직자" },
      { id: "사역자", title: "사역자" },
      { id: "교회위원", title: "교회위원" }
    ]
  },

  clergy: [
    {
      category: "성직자",
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
      category: "성직자",
      name: "이남호(사도요한)",
      title: "협동사제",
      ordained: "", quote: "", desc: String,
      contact: "",
      kyoboUrl: "https://www.aladin.co.kr/…",  // 저서 링크
      blogUrl: "https://m.blog.naver.com/…"    // 블로그 링크
    }
  ],

  // 평신도 임원진 — category로 ministerSection.categories와 매칭, 경량 명단(officer-card)으로 렌더
  officers: [
    { category: "교회위원", role: "신자회장", members: [String] }  // members 1+ 명, ', '로 표시
  ],

  philosophy: {
    title: "우리가 지향하는 교회",
    intro: [String, String],           // 2개 문단 소개
    values: [{ icon, title, desc }],   // 4개: 녹색·열린·평등·전례
    closing: String                     // 마무리 문구
  },

  worship: {
    liturgicalSeason: LiturgicalCalendar.compute(),  // 자동 산출
    main: [
      { id: "main",     title: "주일 감사성찬례", time, desc },
      { id: "children", title: "어린이 예배",     time, desc }
    ],
    guide: String,        // 안내 배너 한 줄 (빈 문자열이면 미표시)
    spaceGuide: {         // 전례 공간 안내 (worship.html#worship-space)
      intro: String,
      items: [{ icon, name, en, desc }]  // 성수대·독서대·제대·성막·부활초 5개
    },
    resources: [          // 예배 자료 — 외부 앱 링크 카드 (worship.html#resources)
      { icon, title, desc, url }   // 기도서·성가·공동번역 성서
    ]
  },

  community: {
    groups: [
      { id: "hopecenter", title: "광명 희망터",  desc, icon, detailUrl },
      { id: "emmaus",     title: "엠마우스 코스", desc, icon, detailUrl },
      { id: "smallgroup", title: "소그룹 모임",  desc, icon, detailUrl },
      { id: "agape",      title: "주일 애찬",     desc, icon }  // 밥상 공동체 (detailUrl 없음)
    ]
  },

  giving: {
    bankName: "국민은행",
    bank: "2680-100-14008",
    holder: "대한성공회 광명교회",
    report: String,
    receiptInfo: String    // 기부금 영수증 안내
  },

  sns: {
    youtube, instagram, "naver blog", diocesan
  },

  liveUrl: "https://youtu.be/5tTJvrTX4aA",

  media: {
    intro: String,
    channelUrl: String,
    videos: [
      { id, title, desc, category }  // 5개 이상의 유튜브 영상
    ]
  },

  press: [
    { year, media, title, date, url }  // 4건 (2025·2021·2016·2005)
  ],

  navigation: [...]  // 아래 참조
};
```

---

### 내비게이션 구조 (`navigation` 배열)

`(JS)` = JS 렌더러가 동적으로 생성하는 ID. nav item에 `badge` 필드가 있으면 하위 메뉴에 칩(.nav-badge) 표시.

```
교회 소개  clergy.html
  └ 성공회란?          clergy.html#what-is-anglican
  └ 대한성공회         clergy.html#ack
  └ 섬기는 이들        clergy.html#priest-section       (JS)
  └ 교회 철학          clergy.html#philosophy
  └ 교회 이야기        clergy.html#identity

예배와 기도  worship.html
  └ 주일 감사성찬례    worship.html#main                (JS)
  └ 어린이 예배        worship.html#children            (JS)
  └ 감사성찬례 순서    worship.html#eucharist-order     (JS)
  └ 성무일과           worship.html#daily-office        (JS)
  └ 세계성공회 중보기도 worship.html#intercession       (JS)
  └ 예배 자료          worship.html#resources           (JS)

교회력  sundays.html
  └ 이달의 교회력      sundays.html#monthly             (JS)
  └ 전례독서           sundays.html#lectionary          (JS)
  └ 절기 안내          sundays.html#seasons             (JS)
  └ 특별 주일          sundays.html#special             (JS)

처음 오신 분  newcomer.html
  └ 인사말             newcomer.html#newcomer           (JS)
  └ 참여 안내          newcomer.html#firsttime          (JS)
  └ 성공회 전례란?     newcomer.html#liturgy            (JS)
  └ 전례 공간 안내     newcomer.html#worship-space      (JS)  성수대·독서대·제대·성막·부활초
  └ 영성체 안내        newcomer.html#communion          (JS)
  └ 자주 묻는 질문     faq.html                         (가안 badge)
  └ 문의하기           newcomer.html#contact            (JS)

공동체  community.html
  └ 광명 희망터        hopecenter.html                  (상세 페이지로 직접 이동)
  └ 엠마우스 코스      emmaus.html                      (상세 페이지로 직접 이동)
  └ 소그룹 모임        smallgroup.html                  (상세 페이지로 직접 이동)
  └ 녹색교회           greenchurch.html                 (상세 페이지로 직접 이동)

미디어·자료  media.html                                  (허브 — 카드 링크만, 렌더러 없음)
  └ 영상 갤러리        videos.html                      (상세 페이지로 직접 이동)
  └ 사진 갤러리        gallery.html                     (상세 페이지로 직접 이동)
  └ 녹색교회           greenchurch.html                 (상세 페이지로 직접 이동)
  └ 관련 기관          links.html                       (상세 페이지로 직접 이동)

오시는 길  visit.html
  └ 주소·교통          visit.html#location              (JS)
  └ 주차 안내          visit.html#parking               (JS)

※ Footer 전용 링크: giving.html(봉헌 안내), clergy.html#logo-intro(로고 소개), clergy.html#press(언론 보도), privacy.html(개인정보처리방침)
```

---

## app.js 렌더러 구조

총 2211줄, 16개의 렌더러 모듈 + 2개 유틸리티(ScrollReveal, ScrollProgress) + App 부트스트랩.

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
      │     하위 메뉴 item에 badge 필드 → .nav-badge 칩 렌더 (예: "임시")
      │
      ├── FooterRenderer.render()     → #main-footer (모든 페이지)
      │     info + clergy[0] + sns 4개 링크
      │     하단 바: 봉헌 안내(→ giving.html) + 개인정보 처리방침 링크
      │     주소 → 네이버지도 링크로 렌더됨 (MapHelper.naverUrl)
      │
      ├── IndexRenderer.render()      → index.html 전용
      │     _hero()    → #hero-title, #hero-sub (이름 + 슬로건)
      │     _about()   → #about-brief-content (lead = info.vision)
      │     _worship() → #worship-grid, #worship-guide
      │     _visit()   → #location-card (지도 + 주소 + 전화)
      │
      ├── WorshipRenderer.render()    → #worship-full (worship.html)
      │     예배 카드 그리드(id="main"·"children") + guide-banner
      │     liturgy-guide (liturgy-season-badge)
      │       (감사성찬례란?)        감사성찬례 소개 + 인용
      │       id="eucharist-order"  감사성찬례 순서 4단계
      │       id="resources"        예배 자료 (기도서·성가·성서 외부 링크 카드)
      │     ※ liturgicalSeason(s).color / s.colorLight 인라인 style 적용
      │
      ├── NewcomerRenderer.render()   → #newcomer-full (newcomer.html)
      │     liturgy-guide (id="newcomer" — newcomer-intro 서두)
      │       id="firsttime"        참여 안내 (체크리스트)
      │       id="liturgy"          성공회 전례란?
      │       id="worship-space"    전례 공간 안내 (성수대·독서대·제대·성막·부활초 / .space-grid)
      │       id="communion"        영성체 안내
      │       id="contact"          문의하기 CTA (newcomer-cta)
      │     ※ 데이터 출처: CHURCH_DATA.worship.spaceGuide / liturgicalSeason
      │
      ├── CommunityRenderer.render()  → #community-full (community.html)
      │     groups 카드 (id=각 그룹). detailUrl 있으면 '자세히 보기' 링크.
      │     주일 애찬(id="agape")은 community.html#agape 앵커로 존재하나 nav에 없음.
      │
      ├── SmallGroupRenderer.render() → #smallgroup-full (smallgroup.html)
      │     소그룹 모임 상세 콘텐츠. detailUrl 유무 확인 후 렌더.
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
      │     _clergy()     → #clergy-full   (주교 + 카테고리별 성직자 clergy-card / 임원진 officer-card)
      │       _bioSection(bio) → 타임라인 + 소임 태그 + 교회 밖 활동 + 출처
      │     _philosophy() → #philosophy-full  (.values-grid)
      │
      ├── MediaRenderer.render()      → #media-full (videos.html)
      │     유튜브 영상 소개 섹션 헤더
      │     video-grid: 5개+ 영상 카드 (썸네일 + 카테고리 + 제목 + 설명)
      │     각 카드는 유튜브 링크로 이동
      │     video-channel-cta: 유튜브 채널 전체 보기 버튼
      │
      ├── LinksRenderer.render()      → #links-full (links.html)
      │     관련 기관 목록.
      │
      ├── PressRenderer.render()      → #press-table (clergy.html)
      │     press-list: press 배열의 모든 기사
      │     각 항목: 연도 | 미디어 · 날짜 | 제목(링크)
      │
      ├── FaqRenderer.render()        → #faq-full (faq.html)
      │     draft-banner(가안) + faq-cat × 4 (정체성·신앙·사회참여·함께하기)
      │     각 항목: <details.faq-item> → .faq-q(summary) / .faq-a / .faq-refs(출처)
      │
      ├── SundaysRenderer.render()    → #sundays-full (sundays.html)
      │     이달의 교회력(#monthly) · 전례독서(#lectionary) · 절기 안내(#seasons) · 특별 주일(#special)
      │     ※ worship.html의 #worship-calendar / #worship-special 위젯도 담당
      │
      ├── ScrollReveal.init()         (모든 페이지)
      │     .reveal 클래스 요소들을 scroll 시 페이드인
      │     Intersection Observer 사용, 애니메이션 감소 설정 존중
      │
      ├── ScrollProgress.init()       (모든 페이지)
      │     페이지 스크롤 진행도를 시각화 (막대 또는 스타일 적용)
      │
      └── MenuOverlay.init()          (모든 페이지)
            nav-menu-trigger 버튼으로 여는 전체 메뉴 + 검색 오버레이
            CHURCH_DATA.navigation을 사이트맵으로 펼침
            검색 인덱스 = nav 라벨 + CHURCH_DATA 본문 자동 추출
              + 정적 HTML 페이지(story·emmaus·greenchurch·hopecenter) 런타임 fetch 파싱
            본문 일치 시 발췌 스니펫 표시, 첫 검색 시 정적 페이지 1회 로드
            
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
  #location-card                            ← IndexRenderer._visit()
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
<section id="identity"> .story-values — 교회 이야기 5대 정체성 서사 블록 (정적 HTML)
  01 전례 전통  02 평등 공동체  03 부활 신앙  04 밥상 공동체  05 약자·창조 돌봄
<section id="logo-intro">
  #logo-content                             ← ClergyRenderer._logo()
<section id="press">
  #press-table                              ← PressRenderer.render()
```

### faq.html
```html
<div class="page-hero">                       자주 묻는 질문 (FAQ)
<section id="faq"> .container--narrow
  #faq-full                                 ← FaqRenderer.render()
     draft-banner(가안) + .faq-lead + .faq-cat × 4 (정체성·신앙·사회참여·함께하기)
     각 항목 <details.faq-item> → .faq-q(summary) / .faq-a / .faq-refs(출처 링크)
※ 콘텐츠는 CHURCH_DATA.faq (카테고리 4 · 질문 12 · 출처 링크 17)
```

### media.html
```html
<div class="page-hero">                       미디어·자료 허브 — 렌더러 없음, 정적 카드 링크
<section>
  .resource-grid → .resource-card × 4         videos.html / gallery.html / greenchurch.html / links.html
```

### videos.html
```html
<div class="page-hero">
<nav class="gc-page-nav">                     미디어·자료 페이지 이동 (영상/사진/녹색교회/관련 기관)
<section>
  #media-full                               ← MediaRenderer.render()
    intro + 유튜브 채널 소개
    video-grid: 영상 카드들 (썸네일 + 카테고리 + 제목 + 설명)
    video-channel-cta: 채널 전체 보기 버튼
```

### worship.html
```html
<div class="page-hero">
<section>
  #worship-full                             ← WorshipRenderer
    #main / #children       예배 카드
    (감사성찬례란?)         감사성찬례 소개
    #eucharist-order        감사성찬례 순서
    #resources              예배 자료 (외부 앱 링크)
<section class="next-step-cta">           처음 오신 분으로 유도 CTA
```

### newcomer.html
```html
<div class="page-hero">
<section>
  #newcomer-full                            ← NewcomerRenderer
    #newcomer               처음 오신 분께 (환영 서두 + key facts)
    #firsttime              참여 안내 (체크리스트)
    #liturgy                성공회 전례란?
    #worship-space          전례 공간 안내 (성수대·독서대·제대·성막·부활초)
    #communion              영성체 안내
    #contact                문의하기 CTA
<section class="next-step-cta">           예배 안내로 유도 CTA
```

### community.html / giving.html / visit.html
```html
<div class="page-hero">
<section>  #community-full / #giving-full / #visit-full
   (community-full에 #agape 주일 애찬 카드 포함)
```

---

## style.css 주요 컴포넌트

### CSS 변수

```css
--green-deep:   #0a1f12   /* 주 브랜드 색 (nav, footer, 제목) */
--green-mid:    #3a7252
--green-light:  #eef2ec
--green-soft:   #c4d6c8
--gold:         #c09a60
--gold-bg:      #faf3e6
--cream:        #f7f4ed   /* 기본 배경 */
--white:        #ffffff
--text:         #1a1a1a
--text-muted:   #4d4c46   /* WCAG AA(4.5:1) 충족 */
--heading:      #0a1f12
--border:       #e8e5dc
--red:          #b53737
--nav-glass:    rgba(10, 31, 18, 0.9)  /* 네비게이션 글래스 배경 */
--surface-nav:  rgba(255, 255, 255, 0.96)
--theme:        #3a7252   /* 현재 절기색 (JS가 --season 값으로 덮어씀) */
--theme-light:  #eef2ec
--theme-on:     #fff      /* --theme 배경 위 텍스트 */
--nav-h:        68px
--section-pad:  7rem
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
| `.space-grid` / `.space-item` | 전례 공간 안내 카드 (아이콘 + 국문/영문명 + 설명) |
| `.resource-grid` / `.resource-card` | 예배 자료 외부 링크 카드 (hover lift) |
| `.liturgy-checklist` / `.checklist-item` | 처음 오신 분 체크리스트 |
| `.nav-badge` | 내비 하위 메뉴 상태 칩 (골드, 예: "임시") |
| `.draft-banner` | 임시/초안 페이지 상단 안내 배너 (골드) |
| `.story-values` / `.story-value` | 교회 이야기 5대 정체성 블록 (clergy.html#identity, greenchurch.html) |
| `.faq-cat` / `.faq-item` / `.faq-q` / `.faq-a` / `.faq-refs` / `.faq-ref` | FAQ 카테고리·문답(`<details>`)·출처 링크 (faq.html) |
| `.container--narrow` | 읽기 폭 제한 컨테이너 (max 820px, faq.html) |
| `.anglican-pillars` | 성공회 3기둥 카드 그리드 |
| `.anglican-korea-inner` | 대한성공회 2단 레이아웃 |
| `.logo-intro-grid` | 캔터베리 십자가 소개 그리드 |
| `.press-list` / `.press-item` | 언론 보도 리스트 |
| `.bus-chip.bus-blue/green` | 버스 번호 칩 |
| `.bank-card` | 봉헌 계좌 카드 |
| `.values-grid` / `.value-card` | 교회 철학 카드 |
| `.video-grid` / `.video-card` | 유튜브 영상 카드 (썸네일 + 정보) |
| `.video-thumb` | 영상 썸네일 컨테이너 (재생 버튼 오버레이) |
| `.video-play-btn` | 영상 재생 버튼 아이콘 (> 기호) |
| `.video-info` / `.video-category` | 영상 카테고리·제목·설명 |
| `.video-channel-cta` | 유튜브 채널 전체 보기 CTA 버튼 |
| `.footer-inner` | 푸터 3단 그리드 |
| `.footer-logo-mark` | 푸터 캔터베리 십자가 컨테이너 (38×38px, 흰색 SVG) |
| `.reveal` | ScrollReveal 애니메이션 대상 (fade-in on scroll) |

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
5. ARCHITECTURE.md 동기화

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
- `videos.html` 페이지에서 id="media-full" 사용

### 새 페이지 렌더러 추가 시 유의사항
1. `app.js`에 `const PageNameRenderer = { render() { ... } }` 정의
2. 해당 페이지에 `<div id="page-name-full"></div>` 마크업 준비
3. `App.init()` 메서드에서 조건부로 렌더러 호출
   - 페이지별 렌더러는 해당 HTML 페이지에서만 실행 (예: `if (document.getElementById('media-full'))`)
4. `data.js`의 `navigation` 배열에 새 메뉴 항목 추가
5. 필요 시 greenchurch.html처럼 `page-hero--photo` 별도 대문 이미지 제공
6. ARCHITECTURE.md와 docs/ 작업 지시서 동기화

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
