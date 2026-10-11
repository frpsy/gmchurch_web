# 02. 검증된 이슈 목록 (확정) · 우선순위 · 수정 순서

검수팀 3개가 조사팀 결과를 코드(파일:줄)와 렌더링으로 독립 재검증한 결과를 하나로 합쳤습니다. 항목별 증거와 수정 방법의 상세는 아래 3개 파일에 있습니다. 이 문서는 **무엇을 어떤 순서로 고치는지**의 확정본입니다.

- `02-verify-typography-layout.md` (TYP·LAY)
- `02-verify-design-color.md` (DES·COL·NEW)
- `02-verify-text.md` (TXT)

## 1. 검수 집계

| 영역 | 조사팀 보고 | 확정 | 오탐 | 보류 | 확인 필요(수정 금지) |
|---|---|---|---|---|---|
| 타이포그래피 TYP | 14 | 14 | 0 (부분 오탐 7곳) | 0 | - |
| 레이아웃 LAY | 14 | 13 | 0 | 1 (LAY-12) | - |
| 디자인 DES | 12 | 10 | 1 (DES-02) | 1 (DES-11) | - |
| 색 COL | 14 | 9 | 2 (COL-09, 14) | 3 (COL-04, 07, 08) | - |
| 검수 신규 NEW | - | 3 | - | - | - |
| 텍스트 TXT | 49 | 23 | 4 (07, 30, 39, 41) | 4 (02, 15, 17, 35) | 18 |
| 합계 | 117 | 72 | 7 | 9 | 18 |

조사팀 주장 중 검수에서 **틀린 것으로 판명**돼 수정 대상에서 뺀 것: `.nav-badge` 초소형(렌더링되지 않음), 서브 히어로 eyebrow 크기(의도된 라벨), 홈 히어로 포커스 링 대비(사진 위라 3:1 이상), 다크 서피스 병합(역할별 계층), `#f6f4ee`/`#f0ece4`를 `--cream`으로 병합(다크에서 버튼이 사라짐), 푸터 주소 `nowrap`(푸터 열 레이아웃이 밀림), 다크 호버 글자 소실(실측 0건).

## 2. 충돌 조정 결과 (하나의 기준)

| 쟁점 | 결정 |
|---|---|
| 본문 글자 크기 | `--fs-sm`·`--fs-md` 토큰은 올리지 않음(상단 내비가 먼저 깨짐). 문장형 설명 전용 `--fs-desc: 0.95rem`(15.2px) 신설 |
| 행간 | 한 줄 UI 1.2~1.4 / 여러 줄 제목·리드 1.55(`--lh-snug`) / 본문 1.75 / 장문 1.9 |
| 섹션 여백 | `--section-pad` 하나(6rem/모바일 2.5rem). 히어로·sub-nav 직후 2.5rem/1.75rem. 섹션 가장자리 자식 margin 0 |
| eyebrow | 본문 eyebrow 12.48px 하나. 서브 히어로 eyebrow는 현행 `clamp(.95rem,2vw,1.1rem)`를 명시 규칙으로 고정 |
| 달력 지난 날짜 | 색(opacity→`--text-muted`)은 라운드 2, 크기는 라운드 3. 같은 선택자를 두 라운드가 나눠 수정 |
| 포커스 링 | 규칙 하나: 기본 `--theme`, 어두운 녹색 면 위 `--gold`, 사진·라이트박스 위 흰색. `outline:none`은 `:focus:not(:focus-visible)`에서만 |
| 본문 링크 | 색 `--theme` + 밑줄 1px(offset 2px) 한 기준 |
| 인라인 style | 글자 크기·행간은 라운드 3에서 토큰/클래스로, 간격·표시 속성은 라운드 5 |
| 줄바꿈 | `text-wrap: balance` 한 규칙(제목·푸터 주소 등). 라운드 6 |

## 3. 라운드별 확정 작업 목록

각 라운드: 수정 → `npm test` → 20페이지 × 5폭 재촬영(`audit/tools/capture.py`) → 가로 스크롤·콘솔 오류 0건 확인 → 커밋.

### 라운드 1 — 기반 정비 (토큰 추가·정리, 렌더링 변화 거의 없음)

| 항목 | 작업 |
|---|---|
| TYP/LAY 토큰 | `--fs-desc 0.95rem`, `--lh-snug 1.55`, `--space-4h 1.25rem`, `--space-6h 1.75rem`, `--content-read 760px`, `--content-narrow 820px` 추가 |
| DES-07·COL-11 | 고정 토큰 `--ink-on-light #173a2e`, `--ink-on-sage #142c24`, `--brand-mid #285a47`, `--green-hover #e3e7d2`, `--red-hover #9b1c1c` 신설, 하드코딩 hex 교체(`#163a2e`→`#173a2e`, `#2a5a48`→`#285a47` 병합) |
| DES-09 | `--radius-xs 4px`, `--lift-1 -2px`, `--lift-2 -4px` 신설, 4px·0.25rem 이관 |
| COL-10 | 미정의 `--green-dark` 폴백 2곳(`style.css:2794`,`2955`) → `var(--theme)` |
| COL-12 | 흰색 알파 토큰 `--on-dark-1/2/3`(.92/.78/.70) 정의. 대비가 낮아지는 치환 금지 |
| COL-13 | `.nav-header.scrolled` 배경 선언 제거 → `--nav-glass` (다크 스크롤 시 내비 색 튐 해소) |

### 라운드 2 — 색·접근성

| 항목 | 작업 |
|---|---|
| COL-01 | `.photo-cat-badge` 글자색 고정 흰색 계열(+오버레이 진하게) |
| COL-02 | `.lit-cal-cell--past` opacity 제거, 숫자·라벨을 `--text-muted` |
| COL-03 | `.photo-date` 알파 .6→.85, 영상 ▶ 오버레이 .45→.6 |
| COL-05 | 다크 `.about-brief-award:hover` 배경 → `--green-light` |
| COL-06 | `.lectionary-ref-ico` opacity 제거 |
| COL-04·07 | 보호 수정만(`.step-num` 글자색 `--theme-on`, 달력 ◀▶ opacity .7→.9) |
| DES-01 | 드롭다운 링크 포커스 링 `--theme`, offset -3px |
| DES-03·04 | 포커스 링 제거 7곳 복원(`.nav-menu-trigger`, `.hero-stat--link`, `.lit-cal-nav`, `.photo-item`, `.gallery-lb-close`, `#back-to-top`, `.menu-overlay-close`) |
| NEW-1 | 본문 속 링크 색 `--theme` + 밑줄(`.story-value-text a`, `.logo-ref-text a`, `.emmaus-contact-link`, `.detail-link`, `.faq-a-text a`, privacy 본문 링크) |
| NEW-2·3 | skip-link 포커스 링 흰색, 전역 `:focus-visible`의 `border-radius:3px` 제거(`summary`·`.faq-q` 확인 후) |
| DES-11 | 지도 iframe `:focus-visible` 링만 추가(Tab 정지 수 조정은 보류) |

### 라운드 3 — 타이포그래피

TYP-01(홈 h1 `2rem` + balance), TYP-02(`--fs-desc` 적용: 선택자별), TYP-03(달력 라벨 12px / 모바일 11.2px, 범례 0.72rem, `.hero-label`), TYP-04(본문 eyebrow 12.48px, 서브 히어로 eyebrow 명시 규칙), TYP-05(`--lh-snug`), TYP-06(오프스케일 제목 값 정리), TYP-07(h2 2단: `.links-group-title`, privacy h2, smallgroup·clergy 인라인), TYP-08(`button, input, select, textarea { font-family: inherit }`), TYP-10(라벨 0.6~0.76rem → `--fs-label`, 선택자별), TYP-11(행간 1.95·2.0 → 1.9), TYP-13(한글 기능 라벨 자간 축소).

### 라운드 4 — 레이아웃·간격

LAY-01(`class` 속성 중복 4곳 합침: `emmaus.html:87,253`, `greenchurch.html:68,394`), LAY-02(`min-width:0`, 360px 검색 닫기 버튼), LAY-03(섹션 가장자리 margin 0), LAY-04(videos·gallery·links·sundays 첫 섹션 패딩), LAY-06(낮은 뷰포트 홈 히어로 `max(100svh,560px)`).

### 라운드 5 — 컴포넌트 일관성

DES-05 + TYP-09 + LAY-10·11(인라인 style → 최소 클래스 세트 `.text-note`, `.text-desc`, `.prose-list`, `.privacy-h2`, `.container--read`, `.section--tight-bottom`, 페이지별 전후 비교), DES-06(중복 규칙, 마지막 승자만 남김), DES-08(카드 hover 이동 2단계), DES-10(버튼 공용 베이스·radius 규칙), LAY-05(community 카드 링크 하단 정렬), LAY-07·08·09(greenchurch 인라인 패딩, clergy `.section--white`, 읽기 폭 토큰).

### 라운드 6 — 텍스트 교정·정리

텍스트(확정분만, 규범 오류 먼저): TXT-01·13(별표 노출+책 부호), 03(첫날), 04(공백), 05(줄표), 06(4주분), 49(`&nbsp;`), 08·09·10·12·16(사이트 내 표기 통일), 선택 통일 11·38은 **적용 보류**(규범 허용 범위, 교회 관용 확인 전). 줄바꿈 CSS(TXT-42~48: `text-wrap: balance` 한 규칙). 마크업 TYP-14(news h3→h2). 정리 TYP-12·LAY-13·DES-12(죽은 CSS 삭제, `ARCHITECTURE.md` 수치 정정). TXT-14(따옴표)·18(물결표)은 대량 치환 위험이 있어 **이번 PR에서 제외하고 후속 작업으로 보고**.

## 4. 수정하지 않는 항목

- **확인 필요(수정 금지)**: `02-needs-confirmation.md` 참조(18건 + 디자인 판단 3건)
- **보류**: LAY-12(카드 내부 빈 공간, 디자인 판단), DES-11 Tab 정지 수, TXT-02(규범 근거 미확보 — "를"로 바꾸는 것은 안전하나 필수 교정이 아님), TXT-15(주보 원문에 인쇄된 마침표), TXT-17, TXT-35
- **오탐**: TXT-07, 30, 39, 41, DES-02, COL-09, COL-14

## 5. 회귀 방지 원칙

1. 한 라운드에서 의도하지 않은 페이지가 변하면 즉시 되돌린다
2. `style.css`·`app.js`·`data.js`를 고치면 모든 HTML의 `?v=` 날짜를 갱신한다 (`CLAUDE.md` 체크리스트)
3. `data.js` 교회소식을 고치면 `data/bulletin-news.json`도 함께 (현재 교회소식은 이번 범위에서 수정하지 않음)
4. 글자 크기·대비를 낮추는 변경은 하지 않는다. 낮아 보이는 값은 올리는 방향으로만 수정
