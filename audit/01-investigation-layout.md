# 01. 조사 B — 레이아웃·간격

- 작성: 조사 B(레이아웃·간격 팀) · 기준일 2026-10-11 · 기준 커밋 `05777d2`
- 읽기 전용 조사. 소스 파일(html/css/js/json)은 수정하지 않았고 이 파일만 작성했습니다.

## 1. 개요

### 측정 방법
- Playwright Chromium(헤드리스, `reduced_motion=reduce`, `.reveal` 강제 표시)으로 20페이지 × 폭 360/390/768/1024/1440 = 100개 조합을 측정했습니다. 로컬 서버 `http://localhost:8000`, 라이트 모드만.
- 측정 항목은 다음과 같습니다.
  - `main` 직계 요소의 계산된 padding/margin/배경
  - 히어로 높이·패딩
  - 모든 `.container`의 max-width·좌우 패딩·실제 폭·x좌표
  - 같은 행 카드의 높이와 하단 링크 y좌표
  - `overflow:hidden|clip` 요소의 scroll/client 크기
  - 뷰포트 밖 요소
  - 리프 텍스트 요소의 가로 넘침
  - 히어로 하단→첫 콘텐츠 거리, 섹션 사이 콘텐츠 간 거리
- `style.css` 정적 분석(grep, 정규식)으로 margin/padding/gap 값 빈도, 하드코딩 max-width, 고정 높이(`height:px`)를 조사했습니다.
- 측정 스크립트와 중간 결과는 scratchpad 아래에 있습니다.
  - `/tmp/claude-0/-home-claude/aecbfe46-a9d3-53b1-bf88-8b5ab3b19d54/scratchpad/measure.py`, `m.json`, `rows2.py`, `rows2.json`, `gap.py`, `secgap.py`, `botgap.py`, `hero.py`, `overlay.py`
- 확인용 스크린샷(같은 scratchpad 아래)은 `ws1024.png`(예배 카드), `cg1024.png`(공동체 카드), `vg1440.png`(교회 가치 카드), `overlay_360_crop.png`입니다.

### 범위와 건수
- 대상은 20페이지 전체입니다. 문서 가로 스크롤은 100개 조합 모두 0건이었고, 기준선(`audit/metrics/baseline.json`)과 같습니다.
- 발견은 총 14건입니다: 상 0, 중 5, 하 9.
- 통과 확인(이상 없음)
  - 서브페이지 히어로 높이는 PC 350px, 모바일 291px로 17개 서브페이지 모두 동일합니다.
  - `.container` 폭은 1200px로 일관되고 좌우 패딩은 clamp(20→40px)입니다. 예외는 아래 LAY-09, LAY-04의 nav 컨테이너입니다.
  - 같은 행 카드 그리드는 `align-items: stretch`(기본)라 카드 높이 차이가 0입니다. 높이가 다른 행은 이미지+텍스트형 2단 레이아웃뿐이었습니다.
  - `text-overflow: ellipsis`는 `style.css`에 없습니다. `-webkit-line-clamp`는 `style.css:4802`(검색 결과 발췌)에만 있고 의도된 동작입니다.
  - `overflow:hidden`으로 실제 콘텐츠가 잘리는 경우는 측정되지 않았습니다. 잘림으로 잡힌 것은 `.sr-only`와 `.next-step-cta::before`(장식)뿐입니다.
  - 인페이지 탭바(`.gc-page-nav`)는 360/390/768에서 넘치지 않았습니다.

## 2. 측정표

### 2-1. 히어로 높이·패딩 (computed)

| 페이지 | 폭 | 높이 | padding-top / bottom |
|---|---|---|---|
| 서브페이지 17개(`.page-hero`) | 360~768 | 291px | 87px / 15px |
| 서브페이지 17개 | 1024·1440 | 350px | 119px / 35px |
| index(`header.hero`) | 전체 | 100svh(360/390/768에서 800px 뷰포트 기준 800px) | 0 |

- 위 표의 서브페이지 패딩은 `.page-hero` 규칙(`style.css:676`, `5136`, `5162`)에 따릅니다.
- index 히어로 CSS는 `style.css:372`(`min-height:560px`)와 모바일 `style.css:3295`(`min-height:100svh`)입니다.

### 2-2. 섹션 상하 padding (computed, 폭 1440 / 390)

| 구분 | 1440 (top/bottom) | 390 (top/bottom) | 해당 |
|---|---|---|---|
| 표준 `.section` | 96 / 96 | 40 / 40 | 거의 전부 |
| 히어로 바로 다음 `.page-hero + .section` | 40 / 96 | 28 / 40 | faq, worship, bulletin, news, newcomer, community, giving, media, visit, hopecenter, emmaus#intro, smallgroup, privacy |
| 히어로 다음에 nav가 끼는 첫 섹션 | 96 / 96 | 40 / 40 | videos, gallery, links, sundays#monthly, greenchurch(인라인 48) |
| greenchurch `#intro`(인라인 `style`) | 48 / 48 | 48 / 48 | `greenchurch.html:47` |
| `.next-step-cta` | 96 / 96 | 48 / 48 | `style.css:2387`, `5192`가 `2501`을 덮어씀 |

- `--section-pad`는 `style.css:50`(6rem), `3201`(3.5rem, 768 이하), `5159`(2.5rem, 768 이하, 최종), `5225`(print 1.5rem)에서 정의됩니다.

### 2-3. 섹션 간 실효 콘텐츠 간격(다음 섹션 첫 콘텐츠까지, px)

| 페이지 | 1440 | 390 |
|---|---|---|
| index | 192 / 192 / 215 | 80 / 80 / 99 |
| clergy | 204 / 204 / 204 / 204 / 248 | 92 / 92 / 92(첫 구간) / 160 |
| sundays | 195 / 194 / 215 | 83 / 82 / 103 |
| worship | 299 / 279 / (측정 아티팩트 제외) / 340 | 147 / 200 / 168 |
| emmaus | 192 / 225 / 223 / 242 | 104 / 105 / 138 / 114 |
| greenchurch | 203 / 195 / 195 / 195 / 211 | 142 / 83 / 83 / 83 / 99 |

- 해석: 표준 섹션 경계는 192~215px(PC)·80~105px(모바일)입니다. worship은 279~340px, 200px까지 벌어집니다(LAY-03).

### 2-4. 히어로 하단 → 첫 텍스트까지 거리(px, 첫 보이는 텍스트 노드 기준)

| 페이지 | 1440 | 390 |
|---|---|---|
| news, emmaus, smallgroup | 40 | 28 |
| bulletin | 59 | 45 |
| faq | 66 | 54 |
| newcomer | 77 | 57 |
| worship, giving, visit, privacy | 81 | 53 |
| hopecenter | 108 | 96 |
| media | 125 | 113 |
| community | 142 | 114 |
| videos, gallery, links | 150 | 89 |
| clergy | 215 | 179 |
| sundays | 460 | 395 |

- 주의: 이 값에는 카드 안쪽 padding·sr-only h2·선행 블록 높이가 섞여 있습니다.
  - media, community는 첫 요소가 카드(상단 padding 약 25~40px)입니다.
  - clergy(about nav 49~54 + 환영 배너 65~90)와 sundays(절기 리본 306~310 + nav)는 사이에 실제 콘텐츠 블록이 있어 결함으로 보지 않습니다.
  - videos, gallery, links는 `<nav>`(49/54px) + 96px 상단 패딩이라 구조적 차이가 확인됩니다(LAY-04).

### 2-5. 컨테이너 폭·패딩 (computed)

| 폭 | 구분 | 개수 | max-width | 좌우 padding | 실제 폭 |
|---|---|---|---|---|---|
| 360 | `.container` 일반 | 62 | 1200 | 20 | 360 |
| 360 | `.gc-page-nav .container` | 6(clergy 1 등) | 1200 | 4 | 360 (`style.css:4607`) |
| 360 | `.container--narrow`(faq) | 1 | 820 | 20 | 360 |
| 360 | links 인라인 | 1 | 860 | 20 | 360 |
| 360 | emmaus 인라인 | 1 | 760 | 20 | 360 |
| 1440 | `.container` | 68(+hero-content 1, season-ribbon 1) | 1200 | 40 | 1200 (x=120) |
| 1440 | faq narrow | 1 | 820 | 40 | 820 (x=310) |
| 1440 | links 인라인 | 1 | 860 | 40 | 860 (x=290) |
| 1440 | emmaus 인라인 | 1 | 760 | 40 | 760 (x=340) |

- `max-width: 1200px`을 직접 쓴 곳은 없습니다. `style.css:51`의 `--content-max`만 있습니다.
- 768에서 clergy의 `.container` 좌우 패딩은 38.4px(5vw), 1024 이상은 40px로 clamp 규칙대로입니다.

### 2-6. 하드코딩 max-width(px) — `style.css`, 미디어쿼리 제외

| 값 | 위치(줄) | 비고 |
|---|---|---|
| 900px | 1671, 1674, 1737, 1801, 4247 | 로고 소개·갤러리 라이트박스 |
| 860px | 3614 `.story-values`; `links.html:51` 인라인 | |
| 820px | 2112 `.container--narrow` | 토큰 아님 |
| 760px | 1575, 1860, 2289, 3599, 3831, 4829, 5321; `emmaus.html:254`, `privacy.html:40` 인라인 | 7곳 CSS + 2곳 인라인 |
| 740/680/660/620/560/540/520/480px | 1335, 856·4930, 2121, 998, 705·1117·2778·2908, 3566, 476·2525, 2433 | 읽기 폭 용도 |

- 읽기 폭 계열은 `--content-max`(1200) 외에 토큰 없이 900/860/820/760/740/680/660/620/560/540/520/480 값이 섞여 있습니다.

### 2-7. margin/padding/gap 값 빈도 (`style.css`, 정규식 집계)

- 대상 선언 652개: margin 계열 280, padding 계열 235, gap 135, row/column-gap 2.
- `var(--space-*)` 사용 16개(2.5%), 아무 `var()` 포함 25개.
  - 토큰 정의는 `style.css:82-89`의 `--space-1~8`입니다.
  - 사용 횟수는 `--space-5` 4, `--space-4` 3, `--space-3` 3, `--space-2` 3, `--space-6` 2, `--space-8` 1이고, `--space-1`, `--space-7`은 0입니다.
- 서로 다른 수치(단위 포함) 60종, 그중 rem 50종입니다.
- 토큰 스케일(0.25/0.5/0.75/1/1.5/2/2.5/3.5rem)과 일치하는 리터럴이 270회이고, 스케일 밖 rem 리터럴이 416회입니다.

| 값 | 횟수 | 스케일 | 값 | 횟수 | 스케일 |
|---|---|---|---|---|---|
| 1rem | 63 | 있음 | 0.4rem | 22 | 없음 |
| 1.25rem | 59 | 없음 | 0.6rem | 21 | 없음 |
| 1.5rem | 53 | 있음 | 1.4rem | 19 | 없음 |
| 0.5rem | 41 | 있음 | 0.25rem | 18 | 있음 |
| 0.75rem | 33 | 있음 | 0.7rem | 17 | 없음 |
| 1.1rem | 31 | 없음 | 0.2rem | 16 | 없음 |
| 1.75rem | 31 | 없음 | 0.3rem | 15 | 없음 |
| 2rem | 30 | 있음 | 0.45rem | 14 | 없음 |
| 0.85rem | 29 | 없음 | 0.55 / 0.35rem | 13 / 13 | 없음 |
| 2.5rem | 28 | 있음 | 0.9rem | 12 | 없음 |

- 주의: 집계는 shorthand의 각 값을 개별로 세었고 `calc()` 안 값도 포함합니다. 정규식 기반이라 ±몇 건의 오차가 있을 수 있습니다. 1.25rem(59회), 1.75rem(31회)처럼 자주 쓰는 값이 스케일에 없는 점이 특징입니다.

### 2-8. 고정 높이(`height:px`) 점검

- 텍스트 컨테이너에 걸린 고정 height는 발견하지 못했습니다. 나머지는 모두 아이콘·아바타·장식입니다.
  - 아이콘·버튼 크기: `style.css:224`, `251`, `2629`, `4404`, `4436`, `4724`
  - 원형 이미지: `1446`(120px), `4465`(148px)
  - 리본·장식: `997`~`1108`
- 예외로 `.lectionary-cal`(`style.css:2765`, `2769`)이 있으나 이 클래스는 `app.js`, `data.js`, `*.html`, `scripts/`에서 쓰이지 않습니다(grep 0건, LAY-13).

## 3. 발견 항목

### LAY-01 · 중
- 페이지: emmaus.html, greenchurch.html
- 위치: `emmaus.html:87`, `emmaus.html:253`, `greenchurch.html:68`, `greenchurch.html:394`
- 현상: `<section class="section" id="stages" class="gc-section-alt">`처럼 class 속성이 두 번 쓰여 두 번째가 무시됩니다. `gc-section-alt`(`style.css:828`, 옅은 녹색 띠 배경)가 적용되지 않아 의도한 교차 배경이 빠집니다.
- 증거: 1440에서 계산된 배경색이 emmaus `#stages`, `#references`, greenchurch `#climate`, `#animals` 모두 `rgba(0,0,0,0)`입니다. 같은 `gc-section-alt`가 정상 적용된 clergy `#identity`, worship `#eucharist-order`, sundays `#lectionary`는 `rgb(231,238,232)`입니다. 그 결과 emmaus 5개 섹션과 greenchurch 6개 섹션이 모두 같은 크림 배경으로 이어집니다(측정에서 `same-bg`).
- 영향: 다른 페이지와 달리 섹션 구분 띠가 없어 긴 페이지(greenchurch는 606줄)에서 구획 인지가 약합니다. 다크모드 규칙(`style.css:830`)도 적용되지 않습니다.
- 제안 수정: 속성을 합칩니다(`class="section gc-section-alt" id="stages"`). 단, 적용 시 배경 변화가 디자인 의도인지 확인이 필요합니다(작성자 의도는 교차 띠로 보임).
- 심각도: 중

### LAY-02 · 중
- 페이지: 전 페이지(검색·전체 메뉴 오버레이), 360px
- 위치: `style.css:4687-4731`(`.menu-overlay-bar`, `.menu-search-box`, `.menu-search-input`, `.menu-overlay-close`), `app.js:3085-3093`
- 현상: 폭 360에서 검색 입력의 최소 폭(`<input type=search>` 기본 `size=20`, `min-width:auto`)이 줄지 않아 검색 박스가 306px로 고정되고 닫기 버튼이 뷰포트 밖으로 밀립니다.
- 증거: 오버레이를 열었을 때 360에서 `box=[16,322]`, `input=[59,307] (248px)`, `close=[330,370] (40px)`로 닫기 버튼 오른쪽 끝이 370입니다(뷰포트 360을 10px 초과). 390에서는 `close=[334,374]`로 들어옵니다. 기준선 `baseline.json`의 360 전 페이지 overflow 목록(`menu-overlay-close` right=370)과 일치하고, 닫힌 상태(`visibility:hidden`)에서도 같은 값이 잡힙니다. 크롭 `overlay_360_crop.png`에서 X 아이콘이 우측 끝에 붙어 있습니다.
- 영향: 360px 기기에서 닫기 버튼의 터치 영역 10px과 아이콘 약 1px이 화면 밖입니다. 문서 가로 스크롤은 생기지 않습니다(패널이 가려 줌).
- 제안 수정: `.menu-search-box { min-width: 0 }`과 `.menu-search-input { min-width: 0; width: 100% }`를 추가합니다.
- 심각도: 중

### LAY-03 · 중
- 페이지: worship.html(주), links.html, hopecenter.html, smallgroup.html
- 위치: `style.css:2288-2291`(`.liturgy-guide { margin: 4rem auto 0 }`), `style.css:2557`(`.liturgy-section { margin-bottom: 3.5rem }`), `style.css:5178-5179`(모바일 1.5rem / 2.25rem), `style.css:3878`(`.links-group { margin-bottom: 3rem }`), `style.css:3565-3567`(`.placeholder-wrap { margin: 4rem auto }`)
- 현상: 섹션 패딩과 별개로 내부 블록 margin이 더해져 페이지마다 실효 상하 여백이 다릅니다. worship의 `#eucharist-order`, `#daily-office`, `#resources`는 상단에 `liturgy-guide` margin-top 64px, 하단에 `liturgy-section` margin-bottom 56px이 추가됩니다.
- 증거: 1440 기준 섹션 내부 상/하 여백은 worship `#eucharist-order` 160/152px, `#daily-office` 160/152px, `#resources` 160/152px이고 표준 섹션은 96/96입니다. 390에서는 64/76px 대 40/40입니다. 섹션 간 콘텐츠 거리는 worship 279~340px(PC)·147~200px(모바일)이고 sundays는 194~215px·82~103px, clergy는 204px·92px입니다(2-3). 히어로 다음 단독 섹션의 하단 여백도 hopecenter 160px(placeholder margin 64px 추가), smallgroup 152px, links 144px(links-group margin 48px 추가)로 표준 96px과 다릅니다. 모바일은 hopecenter 80px, smallgroup 76px, links 72px 대 40px입니다.
- 영향: 같은 역할의 섹션 간 호흡이 페이지마다 달라 시각 리듬이 어긋납니다. 특히 worship은 섹션이 가장 길어 빈 공간이 두드러집니다.
- 제안 수정: 마지막 자식의 하단 margin과 첫 자식의 상단 margin을 섹션 안에서 0으로 정리합니다(예: `.section > .container > * > :last-child { margin-bottom: 0 }`, `.liturgy-guide:first-child { margin-top: 0 }` 형태). 또는 해당 값을 `--space-*` 기반으로 통일합니다.
- 심각도: 중

### LAY-04 · 중
- 페이지: videos.html, gallery.html, links.html (그리고 greenchurch.html)
- 위치: `style.css:5136-5139`, `5162-5163`(`.page-hero + .section`만 줄임), `style.css:4557-4570`(`.gc-page-nav`), `greenchurch.html:47`
- 현상: 히어로 바로 다음 형제가 `<nav class="gc-page-nav">`인 페이지는 `.page-hero + .section` 규칙이 걸리지 않아 첫 섹션 상단 패딩이 96px(모바일 40px)로 남습니다. 다른 서브페이지는 40px(모바일 28px)입니다.
- 증거: 히어로 하단→첫 텍스트 거리가 1440에서 videos, gallery, links 150px 대 news·emmaus·smallgroup 40px, worship·giving·visit 81px입니다. 390에서는 89px 대 28~57px입니다. 섹션 상단 padding 계산값은 videos/gallery/links가 96px/40px, 일반 서브페이지가 40px/28px입니다.
- 영향: 같은 `.page-hero` 아래 첫 콘텐츠 위치가 페이지마다 최대 110px(PC) 다릅니다. 메뉴 간 이동 시 첫 화면 구도가 뛰어 보입니다. 위 거리에는 nav 49~54px가 포함되어 있어 순수 여백 차이는 이보다 작지만, 섹션 padding 계산값 차이(96 대 40)는 규칙 누락의 직접 증거입니다.
- 제안 수정: nav 다음 섹션도 같은 상단 여백을 받도록 선택자를 확장합니다(예: `.gc-page-nav + .section`). 이 경우 greenchurch의 인라인 padding(LAY-07)도 함께 정리합니다.
- 심각도: 중

### LAY-05 · 중
- 페이지: community.html
- 위치: `community.html` 렌더러 카드(`#community-full .grid`), `style.css:874-880`(`.card`는 block), `style.css:3360-3369`(`.community-detail-link`, `margin-top:1rem`)
- 현상: 카드 하단의 "자세히 보기" 링크가 카드 하단에 고정되지 않고 본문 바로 아래 흐릅니다. 본문 줄 수가 다르면 링크 y좌표가 어긋납니다. 또 4번째 카드(주일 애찬)는 링크가 없고 3열에서 혼자 둘째 줄에 놓입니다.
- 증거: 1024px(3열)에서 카드 높이는 모두 290px로 같지만 링크 하단 y는 249/249/223px(차이 26px)입니다. 소그룹 모임 설명이 한 줄이라 링크가 올라갑니다(`cg1024.png`). 768/1440에서는 설명 줄 수가 같아 차이가 없습니다(207/207/207, 223/223/223). 4번째 카드는 1024·1440에서 1열만 차지하고 행 나머지 두 칸이 비어 있습니다.
- 영향: 중간 폭에서 CTA 정렬이 흐트러지고 마지막 카드가 외톨이로 보입니다.
- 제안 수정: 카드를 `display:flex; flex-direction:column`으로 하고 링크에 `margin-top:auto`를 줍니다(`.community-detail-link`). 카드 4개 그리드는 2×2 또는 4열로 맞추는 방안을 검토합니다.
- 심각도: 중

### LAY-06 · 하
- 페이지: index.html (모바일 가로 방향 등 낮은 뷰포트)
- 위치: `style.css:372-381`(`.hero`: `min-height:560px; overflow:hidden`), `style.css:3295`(768 이하에서 `min-height:100svh`로 덮어씀)
- 현상: 768px 이하에서는 `min-height:560px`가 `100svh`로 바뀌어 낮은 뷰포트(스마트폰 가로)에서 히어로 높이가 줄고, 내용이 `overflow:hidden`에 가려지거나 고정 nav 아래로 들어갑니다.
- 증거: 뷰포트 568×320에서 히어로 높이 320px, 콘텐츠 영역이 top 57px(nav 하단 68px보다 위)~bottom 331px(히어로 하단 320px 초과)로 `clippedBottom: true`, `underNav: true`입니다. 360×560, 360×640, 390×844, 844×390은 모두 정상입니다(844×390은 폭이 768 초과라 560px 최소 높이가 유지됨).
- 영향: 스마트폰 가로 보기에서 홈 히어로 하단 버튼이 잘릴 수 있습니다. 가로 보기는 드문 사용입니다.
- 제안 수정: 모바일 규칙을 `min-height: max(100svh, 560px)`로 바꿉니다. 560px 최소값을 유지하면서 긴 화면에서는 100svh를 씁니다.
- 심각도: 하

### LAY-07 · 하
- 페이지: greenchurch.html
- 위치: `greenchurch.html:47` (`style="padding-top:3rem; padding-bottom:3rem;"`)
- 현상: `#intro` 섹션만 인라인 padding 3rem을 써서 `--section-pad`와 `.page-hero + .section` 규칙(`style.css:5137`, `5163`)을 모두 무시합니다.
- 증거: 계산값이 360·768·1440 모두 48px/48px이며(표준은 96/96, 모바일 40/40, 히어로 직후 40/96, 모바일 28/40), 반응형으로 변하지 않습니다. 첫 콘텐츠까지 히어로 하단에서 48px로 1440·390 모두 같습니다.
- 영향: 다른 서브페이지와 첫 화면 간격이 다르고, 모바일에서는 다른 섹션(40px)보다 큽니다. 인라인 스타일이라 유지보수도 어렵습니다.
- 제안 수정: 인라인 style을 제거하고 `#intro` 전용 클래스 또는 `.section--tight` 같은 수정자 클래스로 옮깁니다.
- 심각도: 하

### LAY-08 · 하
- 페이지: clergy.html
- 위치: `clergy.html:95`, `clergy.html:114` (`style="background:var(--white);"`), 대응 클래스 `style.css:1660`(`.section--white`)
- 현상: 흰 배경 섹션을 index.html은 `section--white` 클래스로, clergy.html은 인라인 style로 지정합니다. 같은 효과를 두 방식으로 쓰고 있습니다.
- 증거: 1440 계산 배경이 clergy `#ack`, `#philosophy`, index `#worship`, `#visit-preview` 모두 `rgb(255,255,255)`로 결과는 같습니다. `CLAUDE.md`의 "기존 클래스 재사용" 원칙과도 어긋납니다.
- 영향: 시각 결함은 없고 유지보수·일관성 문제입니다.
- 제안 수정: 두 곳을 `class="section section--white"`로 바꾸고 인라인 style을 제거합니다.
- 심각도: 하

### LAY-09 · 하
- 페이지: links.html, emmaus.html, privacy.html, faq.html 및 CSS 전반
- 위치: `links.html:51`(`max-width:860px`), `emmaus.html:254`(`max-width:760px`), `privacy.html:40`(`max-width:760px; margin:0 auto`), `style.css:2112`(820px), 그 외 2-6의 값들
- 현상: 읽기 폭 컨테이너가 토큰 없이 760/820/860으로 페이지마다 다르게 쓰입니다. 일부는 인라인입니다.
- 증거: 1440에서 faq 820px(x=310), links 860px(x=290), emmaus 760px(x=340)입니다. 같은 "읽기 폭" 역할인데 좌측 시작점이 20~30px씩 다릅니다. `style.css`에는 760px이 7곳, 900px이 5곳 등 12종 값이 흩어져 있습니다.
- 영향: 본문 좌측 정렬선이 페이지마다 미세하게 달라집니다. 읽기 폭 조정이 한 곳에서 불가능합니다.
- 제안 수정: `--content-narrow`(예: 760px 또는 820px 하나로) 토큰을 정하고 `.container--narrow`로 통일합니다. 인라인 3곳은 클래스로 옮깁니다.
- 심각도: 하

### LAY-10 · 하
- 페이지: 서브페이지 전체 히어로 eyebrow
- 위치: 인라인 `style="display:block; margin-bottom:0.75rem;"` — `bulletin.html:40`, `clergy.html:76`, `community.html:38`, `gallery.html:40`, `giving.html:37`, `links.html:37`, `media.html:39`, `newcomer.html:37`, `news.html:40`, `sundays.html:39`, `videos.html:39`, `visit.html:74`, `worship.html:39`. 추가로 `justify-content:center`가 붙은 곳은 `emmaus.html:39`, `faq.html:37`, `greenchurch.html:41`, `hopecenter.html:38`, `smallgroup.html:38`
- 현상: 17개 히어로에서 같은 인라인 style이 반복되고, 5개 페이지에만 `justify-content:center`가 더해져 있습니다. `display:block`이라 이 속성은 효과가 없습니다.
- 증거: 위 목록의 줄 번호(grep). 시각 차이는 측정되지 않았습니다.
- 영향: 렌더링 영향은 없지만 중복·불일치로 유지보수 부담이 큽니다.
- 제안 수정: `.page-hero .section-eyebrow { display:block; margin-bottom: var(--space-3) }` 규칙 한 번으로 옮기고 인라인을 제거합니다.
- 심각도: 하

### LAY-11 · 하
- 페이지: privacy.html, emmaus.html, greenchurch.html
- 위치: `privacy.html:40,42,47,50,52-58,63,66,69,72,77,80`(17개 인라인), `emmaus.html:199,242,254,273,278,283,286`, `greenchurch.html:47,102,264,339,529-547`
- 현상: 여백·글자 크기·색을 인라인 style로 직접 지정합니다. 값이 `1.05rem`, `0.92rem`, `1.9`, `2` 등 비토큰이고, 같은 목록 스타일이 greenchurch `:264`(line-height 1.9)와 `:339`(line-height 2)에서 서로 다릅니다.
- 증거: 위 줄 번호. greenchurch의 두 `ul`은 margin·font-size는 같고 line-height만 1.9 대 2로 다릅니다.
- 영향: 간격 규칙 변경 시 누락되기 쉽고, 목록 행간이 섹션마다 달라집니다.
- 제안 수정: 공통 클래스(예: `.prose-list`, `.privacy-h2`)로 옮기고 line-height를 하나로 통일합니다.
- 심각도: 하

### LAY-12 · 하
- 페이지: worship.html, clergy.html, emmaus.html
- 위치: `style.css:2681`(`.worship-services-grid`), `style.css:1296-1332`(`.values-grid`, `.value-card--link`), `emmaus.html:46` 부근 `.emmaus-intro-grid`, `.anglican-korea-inner`
- 현상: 2단·다단 레이아웃에서 열 높이·내용 밀도가 맞지 않아 큰 빈 공간이 생깁니다.
- 증거: worship 서비스 카드 2개는 높이가 같지만(1024에서 544px) 왼쪽 카드(주일 감사성찬례)는 마지막 콘텐츠 아래 빈 공간이 284px, 오른쪽은 41px입니다(`ws1024.png`; 768에서 322px, 1440에서 256px). clergy `.values-grid`는 4개 카드 중 첫 카드에만 CTA("녹색교회 자세히 보기")가 있고 나머지는 빈 공간 118~170px입니다(`vg1440.png`). `.emmaus-intro-grid`는 1024에서 열 높이가 435/278px, 1440에서 374/278px, `.anglican-korea-inner`는 1024에서 613/314px입니다(둘 다 `align-items:start`).
- 영향: 데스크톱·태블릿에서 카드 내부 빈 공간과 좌우 불균형이 보입니다.
- 제안 수정: 필요하면 `align-items:center`/`stretch` 조정, 카드 CTA는 `margin-top:auto`로 하단 정렬하는 방안을 검토합니다. 콘텐츠 의도에 따라 유지해도 무방합니다.
- 심각도: 하

### LAY-13 · 하
- 페이지: 전역(CSS) 및 문서
- 위치:
  - `--section-pad`가 `style.css:50`, `3201`, `5159`에 중복 정의됩니다(3201은 5159에 덮임).
  - `style.css:3203-3206` `.page-hero` 모바일 padding은 `5162`에 덮입니다.
  - `style.css:2501`(`.next-step-cta { padding: 4rem 0 }`, 560px 이하)은 `5192`(3rem)에 덮입니다.
  - `.lectionary-cal`(`style.css:2765`, `2769`)은 고정 높이 480/380px이나 사용처가 없습니다(grep 0건).
  - 문서 불일치: `ARCHITECTURE.md:623`은 `--section-pad: 7rem`이라고 하지만 실제는 6rem(`style.css:50`)입니다. `ARCHITECTURE.md:637`은 모바일 히어로 306px이라고 하지만 실제 계산값은 291px(`style.css:691`)입니다.
- 현상: 최종 값을 덮어쓰는 규칙이 앞쪽에 죽은 코드로 남고, 문서 수치가 실제와 다릅니다.
- 증거: 측정값이 위 최종 값과 일치합니다(모바일 `--section-pad` 계산 결과 40px, CTA 48px, 히어로 291px).
- 영향: 수정할 때 앞쪽 규칙을 고쳐도 반영되지 않는 혼선이 생깁니다.
- 제안 수정: 죽은 규칙 정리, 미사용 `.lectionary-cal` 제거, 문서 수치 갱신.
- 심각도: 하

### LAY-14 · 하
- 페이지: 전역(CSS)
- 위치: `style.css:82-89`(`--space-1~8` 정의)와 margin/padding/gap 선언 전체
- 현상: 간격 토큰이 정의되어 있지만 거의 쓰이지 않고 비토큰 값이 난립합니다.
- 증거: 2-7 참조. 652개 선언 중 토큰 사용 16개(2.5%), rem 값 50종, 스케일 밖 리터럴 416회, `--space-1`·`--space-7`은 사용 0회입니다. 1.25rem(59회)·1.75rem(31회) 같은 빈출 값이 스케일에 없고, 1.1rem(31회)·1.4rem(19회)·0.85rem(29회)처럼 근접한 변형이 많습니다.
- 영향: 간격 조정이 일관되게 되지 않아 LAY-03, LAY-04 같은 불일치가 재발하기 쉽습니다.
- 제안 수정: 스케일에 1.25rem·1.75rem 추가 여부를 정하고 신규·수정 코드부터 토큰을 쓰는 규칙을 둡니다. 일괄 치환은 시각 변화가 생기므로 단계적으로 진행합니다.
- 심각도: 하

## 4. 미확인 항목

- 측정 중 일부 섹션의 "콘텐츠 하단 여백"이 음수로 나왔습니다(clergy `#priest-section`·`#logo-intro`, worship `#bcp-hymnal`, sundays `#special`, faq, 예: clergy 390에서 -133/-1178px). 접힌 `.more-body[hidden=until-found]`(`style.css:5117-5121`)의 건너뛴 자식 박스 좌표가 잡힌 측정 아티팩트로 추정하지만, 도구 오류로 상위 요소 확인을 끝내지 못해 확정하지 못했습니다. 이 섹션들의 "하단 여백" 값은 2-3 표에서 제외했거나 신뢰하지 않았습니다.
- 접힌 `.more-body`를 펼친 상태의 레이아웃은 측정하지 않았습니다.
- 다크모드(390/1440) 레이아웃·간격 측정은 하지 않았습니다. 간격 규칙은 모드와 무관하다고 가정했으나 확인하지 않았습니다.
- 320px 이하 폭, 실제 iOS Safari·안드로이드 기기 렌더링은 미확인입니다(서버 Chromium + Noto CJK 환경 기준).
- 동적 콘텐츠 상태는 미확인입니다. bulletin·news·gallery·videos가 데이터 길이·개수·빈 상태에 따라 달라질 때의 카드 높이·줄바꿈은 현재 데이터 한 가지만 측정했습니다.
- `white-space: nowrap` 12곳(`style.css:150, 271, 340, 565, 1550, 1710, 2318, 2873, 3105, 3189, 3766, 4591`)은 각각의 모바일 넘침 여부를 개별 확인하지 않았습니다. 대신 360/390에서 리프 텍스트 가로 넘침 측정(`.sr-only` 제외 0건)과 문서 가로 스크롤 0건으로 갈음했습니다.
- 시즌 리본(`style.css:997-1108`, 높이 30px/26px) 안 라벨의 잘림 여부, 지도(visit) iframe 크기, 갤러리 라이트박스의 모바일 레이아웃은 측정하지 않았습니다.
- 기준선 스크린샷(`audit/screenshots/baseline/`) 140장은 직접 열람하지 않았습니다. 시각 확인은 위에 적은 scratchpad의 요소 단위 캡처만 사용했습니다.
- LAY-01의 의도(교차 띠 적용이 설계 의도인지)와 LAY-12의 불균형 허용 여부는 디자인 판단이라 확인이 필요합니다.
