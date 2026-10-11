# 01. 조사 D — 디자인 일관성

## 1. 개요

- 방법: `style.css` 파싱(규칙 1,075개, 선택자·@media 문맥별 중복 검출), `grep -n`, Playwright(Chromium)로 20페이지 키보드 Tab 순회(라이트 1440·390, 다크 1440) 후 `outline`·`box-shadow`·대비 측정. 스크립트는 scratchpad의 `focus2.py`, `cssparse.py`, `dups.py`.
- 범위: 버튼, 카드, 헤더/내비, 아이콘·이모티콘, 포커스, 중복 정의, 인라인 스타일, radius/shadow 토큰 사용.
- 미완료: 호버 시 다크모드 글자 소실 실측은 도구 장애로 실행하지 못함 → 4장 참고.
- 건수: 총 12건 (상 1 / 중 6 / 하 5).
- 소스 파일은 수정하지 않았음.

## 2. 비교표·빈도표·인라인 목록

### 2-1. 버튼 변형 (style.css)

| 클래스 | 줄 | 모서리 | 패딩 | 굵기 | 비고 |
|---|---|---|---|---|---|
| `.btn-nav-live` | 332 | pill | .55rem 1.15rem | 700 | 빨강, hover `#9b1c1c` 하드코딩(343) |
| `.btn-outline` | 484 | radius-sm | .68rem 1.75rem | 600 | 히어로 전용 |
| `.btn-live` | 505 | pill | .8rem 1.8rem | 700 | 빨강, hover `#9b1c1c`(515) |
| `.btn-hero-primary` | 518 | radius-sm | .68rem 1.75rem | 600 | 배경 `#f6f4ee` 하드코딩 |
| `.btn-next` / `--primary` | 2444 / 2466 | pill | .85rem 1.7rem | 600 | |
| `.newcomer-cta-link` | 2534 | pill | .7rem 1.4rem | 600 | |
| `.map-btn` 계열 | 3797~3823 | (별도) | .7~.85rem | | 네이버·카카오 브랜드색 |

주 버튼 계열만 6종, 패딩 6종, 모서리 radius-sm/pill 혼재. 공용 `.btn` 기반 클래스가 없음.

### 2-2. 카드

| 클래스 | 줄 | 모서리 | 배경 | 그림자(정지) | hover 이동 |
|---|---|---|---|---|---|
| `.card` | 874 | md | white | 없음 | -6px, hover-shadow |
| `.info-card` | 918 | md | white | 없음 | -4px, hover-shadow-sm |
| `.resource-card` | 2701 | md | white | 없음 | -5px, hover-shadow-sm |
| `.anglican-pillar` | 1876 | md | white | 없음 | -4px |
| `.value-card` | 1301 | md | cream | 없음 | -2px, shadow-md |
| `.clergy-card` | 1432 | lg | white | shadow-md | |
| `.officer-card` | 1389 | lg | white | shadow-md | |
| `.faq-item` | 2141 | md | white | shadow-sm | |
| `.story-value` | 3617 | md | white | 없음 | 왼쪽 4px 띠 |
| `.liturgy-card` | 2564 | 0 md md 0 | cream | 없음 | |

### 2-3. border-radius 빈도 (선언 수)

| 값 | 건수 | 토큰 여부 |
|---|---|---|
| `var(--radius-md)` | 32 | 토큰 |
| `var(--radius-pill)` | 21 | 토큰 |
| `50%` | 20 | 원형(정상) |
| `var(--radius-sm)` | 19 | 토큰 |
| `var(--radius-lg)` | 7 | 토큰 |
| `4px` | 7 | 하드코딩 (1236, 1548, 2041, 2087, 3778, 4882, 4901) |
| `3px` | 6 | 하드코딩 (157, 1005, 1536, 2215, 2230, 4795) |
| `2px` | 2 | 하드코딩 (363, 2196) |
| `0.25rem` | 1 | 하드코딩 (1220) |
| 부분 모서리 조합 | 9 | 토큰 조합 + `0 2px 2px 0`(181) |

토큰 계열 약 79건, 하드코딩 소형 16건.

### 2-4. box-shadow 빈도

| 값 | 건수 |
|---|---|
| `var(--hover-shadow-sm)` | 12 |
| `var(--shadow-md)` | 11 |
| `var(--shadow-sm)` | 6 |
| `var(--shadow-lg)` / `var(--hover-shadow)` | 1 / 1 |
| `none` | 4 |
| 하드코딩 고유 값(inset 포함) | 약 30종 각 1~2건 |

토큰 약 31건 대비 하드코딩 약 33건. 하드코딩 위치: 180, 208, 293, 501, 515, 528, 533, 1077, 1451, 2486, 2497, 2783, 3440, 3795, 3799, 4410, 4426, 4470, 4546, 4985, 5003 외.

### 2-5. 인라인 스타일

- HTML `style="`: 총 55건, 19개 파일 — privacy 17, greenchurch 11, emmaus 8, clergy 3, links 2, 나머지 각 1.
- app.js `style=`: 58회, 54줄.
- 반복 패턴: `section-eyebrow` 에 `style="display:block; margin-bottom:0.75rem;"` 가 17개 페이지, 거기에 `justify-content:center` 추가 변형이 5개(emmaus:39, faq:37, greenchurch:41, hopecenter:38, smallgroup:38).
- 흰 배경 섹션: `clergy.html:95,114` `style="background:var(--white);"` 인데 `.section--white` 가 `style.css`에 이미 있음(`배경 흰색 섹션 — HTML 인라인 style 대체` 주석).
- app.js 주요 위치: 797, 827, 856, 888~892, 917~930, 949~957, 1076~1107, 1291~1299, 1340, 1348, 1502, 1506, 2539~2547, 2559, 2592, 2647, 2713~2718, 2736~2739.
- 정당한 동적 값(절기색 변수): app.js 556, 1204, 2559, 2592, 2647, 2713, 2714.

### 2-6. 이모티콘·아이콘

- 이모티콘 직접 사용: 없음. `✕`(gallery.html:80, app.js:2043), `✓`(app.js:799~803), `◀▶`(lit-cal-nav)은 문서상 허용 문자. `⚠`는 주석뿐.
- 아이콘은 `icon('name')`·`icons.svg` 사용 일관. 아이콘 배지 크기 규칙은 style.css 5277에서 통일.

## 3. 발견 항목

**DES-01 / 전 페이지(내비 드롭다운) / style.css:165-169 + 281-296 / 상**
- 현상: 드롭다운 링크 키보드 포커스 링이 세이지 `--gold`(`#a8bd9f`)인데 드롭다운 배경은 흰색(`var(--white)`). `.nav-header a:focus-visible` 가 어두운 헤더 전용 의도였으나 흰 드롭다운에도 적용됨.
- 증거: Tab 순회 라이트 1440에서 20페이지 모두 드롭다운 링크 32개씩(총 640건) outline `rgb(168,189,159)` / 배경 `rgb(255,255,255)` → 대비 2.01:1 (WCAG 비텍스트 3:1 미달). 다크에서는 0건.
- 영향: 데스크톱 키보드 사용자가 하위 메뉴 현재 위치를 알아보기 어려움.
- 제안: `.dropdown li a:focus-visible { outline-color: var(--theme); }` 추가(다크 대응은 `--theme` 토큰이 처리하는지 확인).

**DES-02 / index / style.css:165-169 + `.hero a` / 중**
- 현상: `.hero a:focus-visible` 도 세이지인데 측정상 `.btn-hero-primary`·`.btn-outline` 의 부모 배경이 크림(대비 1.8:1)으로 잡힘.
- 증거: 라이트 1440·390 모두 `a.btn-hero-primary`, `a.btn-outline` outline `rgb(168,189,159)` 대비 1.8. 히어로 배경이 사진이면 실제 대비는 다를 수 있음 → 스크린샷 확인 미완.
- 영향: 홈 첫 화면 버튼 포커스 식별 약함 가능.
- 제안: 히어로 위 링은 흰색 2px + 어두운 오프셋 링, 또는 `box-shadow` 이중 링.

**DES-03 / 전 페이지 / style.css:258 (`.nav-menu-trigger`) / 중**
- 현상: 포커스 시 `outline: none` 이고 배경만 `rgba(255,255,255,0.12)` 로 바뀜.
- 증거: 라이트·다크 1440, 라이트 390의 20페이지 전부에서 outline `0px none`, box-shadow 없음. 배경 알파 0.12.
- 영향: 상시 노출 버튼이라 가장 먼저 Tab에 걸리는데 포커스가 거의 안 보임.
- 제안: `outline: 2px solid var(--gold); outline-offset: 2px;` 로 변경.

**DES-04 / index, sundays / style.css:590-593, 1147, 4139, 4303, 4427 / 중**
- 현상: 포커스 시 `outline:none` 후 배경·그림자만 변경. `.hero-stat--link`(590), `.lit-cal-nav`(1147), `.photo-item`(4139, 그림자+이동은 있음), `.gallery-lb-close`(4303), `#back-to-top`(4427).
- 증거: 측정 `index`의 `a.hero-stat--link` 3개(1440), `sundays`의 `button.lit-cal-nav` 2개 모두 outline 0 / box-shadow none, 배경 알파 0.12~0.18.
- 영향: 상태 변화가 약해 키보드 포커스 판별 어려움.
- 제안: 위 요소에 `outline: 2px solid` 복원(어두운 바탕은 `--gold`/흰색).

**DES-05 / 18페이지 / HTML `style=` 55건, app.js 58회 / 중**
- 현상: 같은 스타일이 반복됨(2-5 참고). `.section--white` 가 있는데 clergy.html:95,114 가 인라인 사용. privacy.html 은 제목·목록 마다 인라인 17건. app.js 는 `font-size:0.78/0.8/0.82/0.83/0.88/0.9/0.92rem` 등 `--fs-*` 토큰에 없는 값을 직접 지정.
- 증거: `grep -n 'style="'`, `grep -n "style=" app.js`.
- 영향: 일관성 유지 비용, 다크모드 오버라이드 불가(인라인 우선), 테마 변경 시 누락.
- 제안: `.section-eyebrow` 기본에 `display:block; margin-bottom:.75rem`, `--center` 변형 클래스, privacy 전용 `.prose` 클래스, 흰 섹션은 `.section--white`.

**DES-06 / 전역 / style.css:648, 2719, 5277 외 / 중**
- 현상: 같은 선택자의 뒤쪽 정의가 앞쪽을 덮어 앞 선언이 죽은 코드가 됨.
- 증거(파서 결과):
  - 아이콘 배지 7종(`.resource-icon`, `.card-icon`, `.story-value-icon`, `.space-icon` 등)의 `font-size`/`display`/`line-height` 가 개별 정의(909, 1893, 2719, 2977, 3540, 3570, 3628)와 5277 블록에서 중복, 최종값은 5277(1.6rem, inline-flex).
  - `:root --section-pad` 3회: 6rem(기본) → 3.5rem(3200) → 2.5rem(5159). ARCHITECTURE.md 는 7rem 로 기재되어 어긋남.
  - `.page-hero` 모바일 padding 3회(691, 3203, 5162).
  - `.newcomer-intro`/`.newcomer-cta`/`.footer-inner`/`.emmaus-stages`/`.video-grid` 모바일 규칙이 두 @media 768 블록에 중복(3324↔5187, 3329↔5188, 3334↔5197, 3429↔5181, 4055↔5186).
  - `.map-card--compact .map-btn` 가 연속 두 줄(3822, 3823)에서 padding 만 다름.
  - `:root` 2회(16, 2272 `--season`), `.hero-label`/`h1`/`sub`/`actions`/`stats` 가 432~436 과 455~480 에 분산.
- 영향: 값 수정 시 어느 줄이 유효한지 혼동.
- 제안: 마지막 승자만 남기고 합침. 문서 수치 정정.

**DES-07 / 전역 / style.css 343, 515, 530, 1648, 3797 / 중**
- 현상: hover 색이 토큰 아닌 hex: `#9b1c1c`(343, 515), `#e3e7d2`(530, 1648, 4372, 4393), `#00702f`(3797), `#fad900`(3814).
- 증거: CLAUDE.md 색상 규칙(하드코딩 hex 금지, hover 포함)에 반함. `.btn-hero-primary`·`.about-brief-award` 는 다크 블록에 별도 대응 존재(4372, 4391), 나머지는 `.btn-live`/`.btn-nav-live` 만 의도적 빨강.
- 영향: 다크에서 호버 가독성은 실측하지 못함(4장).
- 제안: `--red-hover` 토큰 추가, `#e3e7d2` 를 `color-mix` 로.

**DES-08 / 전역 / style.css:874-1301 외 / 하**
- 현상: 카드 호버 이동량이 -6/-5/-4/-2px 로 제각각, 그림자 토큰도 `hover-shadow`/`hover-shadow-sm`/`shadow-md` 혼재. 정지 상태 그림자는 `clergy-card`·`officer-card`·`faq-item` 만 있고 나머지는 없음(ARCHITECTURE.md "기본 shadow 없음"과 불일치). `clergy-card`·`officer-card` 는 radius-lg, 나머지 radius-md.
- 제안: `--lift-card` 같은 토큰 1~2개로 정리.

**DES-09 / 전역 / 2-3, 2-4 표 / 하**
- 현상: radius 하드코딩 16건(2·3·4px, 0.25rem), shadow 하드코딩 약 33건, 구 팔레트 금색 `rgba(177,184,131,·)` 가 현 세이지 팔레트(`#a8bd9f`) 이후에도 남음(180, 501, 533, 2497).
- 증거: 위 줄 번호.
- 제안: `--radius-xs: 4px`, `--shadow-glow` 등 토큰화, 금색 잔재 교체.

**DES-10 / 전역 / 버튼 6계열 / 하**
- 현상: 2-1 표처럼 공용 버튼 베이스 없음. 같은 용도의 CTA가 pill/radius-sm 혼재, 패딩 6종.
- 제안: `.btn` 베이스 + 변형(`--primary`, `--ghost`, `--live`).

**DES-11 / visit, index / iframe.map-embed / 하**
- 현상: 지도 iframe 이 Tab 정지점이며 포커스 표시 없음(outline 0).
- 증거: visit 1440에서 연속 8개 정지, index 1~2개.
- 영향: 키보드 사용자가 지도 안에서 8번 Tab 소모.
- 제안: 지도 iframe 에 `tabindex="-1"` 또는 건너뛰기 링크(접근성팀과 확인).

**DES-12 / 문서 / ARCHITECTURE.md:622 / 하**
- 현상: 문서의 `--section-pad: 7rem` 은 실제 6rem. 문서 `style.css 4128줄` 도 실제 5330줄.
- 제안: 문서 동기화.

## 4. 미확인 항목

- 다크모드 호버 시 글자 소실 실측: 모든 대화형 요소를 hover해 글자/배경 대비를 계산하는 측정은 도구 장애로 스크립트 저장·실행에 이르지 못함. 정적 분석상 의심 후보는 DES-07의 hex 목록(`.about-brief-award:hover` 등)이나 다크 오버라이드가 존재해 확정 불가.
- 링크 스타일(밑줄·색·화살표 표기), 표, 폼, 이미지(비율·모서리·그림자), 푸터·서브 내비(`gc-page-nav`) 비교: 코드 상세 비교 및 렌더 측정 미실시.
- 히어로 사진 위 포커스 링 실제 대비(DES-02): 스크린샷 확인 미실시.
- 다크모드 390, 768/1024 해상도 포커스 측정, 키보드로 접히는 모바일 메뉴 포커스 순서: 미실시.
- 실제 기기(iOS Safari 등) 렌더링: 미확인.
