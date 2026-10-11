# 01. 조사 A — 타이포그래피

- 조사일: 2026-10-11 · 기준 커밋 `05777d2` · 읽기 전용 조사(소스 파일 수정 없음)
- 증거 표기: `파일:줄` = 소스 확인, `측정` = Playwright Chromium 계산된 스타일, `baseline` = `audit/metrics/baseline.json`

## 1. 개요

### 측정 방법
1. `style.css` 전체(5,330줄)를 주석 제거 후 파싱해 선언 3,989개를 `줄·@media·선택자·속성·값`으로 추출하고, `font-size`/`line-height`/`letter-spacing`/`font-weight`/`font-family` 빈도를 집계했습니다.
2. 20개 페이지 × 5개 폭(360/390/768/1024/1440)에서 "자기 텍스트를 가진 모든 요소"의 계산값(fs, lh, fw, ls, 폰트, 높이, 부모 체인)을 수집했습니다(11,281건, 내비게이션은 역할 비교에서 제외). 라이트 모드만 측정했습니다.
3. 역할별 비교(히어로 제목, 섹션 제목, eyebrow, 부제, 카드 제목/본문, 캡션, 버튼), 제목 계층 역전·단계 건너뜀, 한글 본문 행간(1.5 미만/1.95 이상), 15px 미만 본문, 인라인 style(app.js·html)을 따로 점검했습니다.
4. 스크린샷(`audit/screenshots/baseline/worship_390.png`, `index_390.png` 상단)으로 히어로 렌더링을 눈으로 확인했습니다.

### 범위·건수
- 대상: 20개 페이지(`audit/00-page-inventory.md`), `style.css`, `app.js` 인라인 style, 각 html 인라인 style.
- 발견 14건: 상 3, 중 6, 하 5.
- **px/rem 혼용: 없음.** `style.css`에 px 단위 `font-size`/`line-height`는 0건입니다. font-size는 var 221, rem 74, clamp 7, em 1(`style.css:2847`)이며 line-height는 단위 없는 숫자와 var입니다. 인라인도 rem 위주이고 em은 `app.js:851`(0.82em) 1건입니다.
- 본문 폰트: `body`는 Pretendard 계열(`style.css:101-109`). 측정상 11,281개 중 Pretendard 10,791, BrandSerif 410(로고, 의도), **Arial 80(TYP-08)**.

## 2. 빈도표·역할별 비교표

### 2-1. style.css 선언 빈도

| 속성 | 선언 수 | 서로 다른 값 | 상위 값(횟수) |
|---|---|---|---|
| font-size | 303 | 37 | `var(--fs-sm)` 70, `--fs-label` 53, `--fs-md` 46, `--fs-body` 44, `0.72rem` 18, `0.7rem` 8, `--fs-lead` 8, `1.05rem` 7, `0.68rem` 6, `1.3rem` 4, `1.25rem` 4 |
| line-height | 101 | 21 | `1` 10, `1.85` 10, `1.7` 9, `1.9` 9, `1.75` 8, `1.8` 8, `1.6` 7, `1.5` 5, `--lh-relaxed` 5, `--lh-body` 4, `--lh-heading` 4, `1.4` 4 |
| letter-spacing | 70 | 26 | `0.01em` 8, `0.02em` 8, `-0.01em` 8, `--ls-label` 5, `0.08em` 4, `0.34em` 3, `0.1em` 3 … |
| font-weight | 157 | 5 | 700 ×102, 600 ×35, 500 ×9, 800 ×9, 400 ×2 |
| font-family | 15 | 4 | `inherit` 7, `var(--font-brand)` 6, `"BrandSerif"` 1, 본문 스택 1 |

- font-size는 토큰 사용 비율이 높지만(221/303), 토큰 밖 rem 74건 중 `0.6~0.76rem`대가 9종, `1.02~1.5rem`대가 8종입니다(TYP-10).
- line-height는 토큰(`--lh-*`) 사용이 14/101뿐이고, 토큰과 같은 값을 직접 쓴 곳이 26건입니다(TYP-12).
- 인라인 style: `app.js` 28개 태그, `privacy.html` 9, `greenchurch.html` 3, `emmaus.html` 1(TYP-09).

### 2-2. 역할별 비교 (측정, 390px / 1440px)

| 역할 | 페이지·선택자 | 390px (fs / lh / fw / ls) | 1440px | 비고 |
|---|---|---|---|---|
| 히어로 제목 | 서브 19개 `.page-hero h1` | 35.2 / 40.5 / 700 / -0.70px | 54.4 / 62.6 / 700 | 일관 |
| 히어로 제목 | **index `.hero h1`** | **28 / 33.0 / 800** / -0.70px | **60.8 / 71.7 / 800** | 모바일은 작고(`style.css:3351`) 굵기 800, 데스크톱은 더 큼 → TYP-01 |
| 히어로 부제 | 서브 `.page-hero p` | 15.2 / 25.8 / 400 | 17.6 / 29.9 | `style.css:701-710` |
| 히어로 부제 | index `.hero-sub` | 15.2 / 26.6 / 400 | — | `style.css:473` |
| 섹션 제목 | `.section-title` 9페이지 | 32 / 38.4 / 700 / -0.96px | 44.8 / 53.8 | `style.css:844-852` |
| 섹션 제목 | clergy 하위 블록 인라인 | **22.4** / 26.9 / 700 | 22.4 | `app.js:1079` 인라인 `1.4rem` → TYP-07 |
| 섹션 eyebrow | `.section-eyebrow` (본문 구역) | **10.88** / 19.0 / 600 / 2.18px | 10.88 | `style.css:835-842` |
| 섹션 eyebrow | `.section-eyebrow` (서브 히어로 안) 18페이지 | **15.2** / 25.8 / 600 / 3.04px | 17.6 | `.page-hero p`가 덮어씀 → TYP-04 |
| eyebrow(CTA) | `.next-step-cta-eyebrow` | 11.52 / 20.2 / 700 / 2.53px | 11.52 | `style.css:2413` |
| eyebrow(주교) | `.bishop-eyebrow` | 11.2 / 19.6 / 700 / 1.34px | 11.2 | `style.css:4450` |
| 섹션 부제 | `.section-sub` 7페이지 | 16 / 28 / 400 | 16 / 28 | `style.css:853` |
| CTA 제목 | `.next-step-cta-title` 18페이지 | 24 / 30 / **800** | 33.6 / 42 / 800 | 섹션 제목(700)과 굵기 다름 |
| 카드 제목 h3 | `.card h3`, `.info-card h3` | 18 / 31.5 / 700 / -0.18px | 18 | `style.css:892,935` (`--fs-lead`) |
| 카드 제목 | value/communion/step/space/pillar 등 | 16 / 28 / 700 / normal | 16 | `--fs-body` |
| 카드 제목 | `.resource-title` | 16.32 / 28.6 / 700 | 16.32 | `style.css:2729` `1.02rem` |
| 카드 제목 | `.story-value-title`, `.bcp-section-title` | 16.8 / 29.4 / 700 | 16.8 | `style.css:3642,1862` `1.05rem` |
| 카드 제목 | `.logo-anglican-title`, `.placeholder-title` | 20.8 / 36.4 / 700 | 20.8 | `1.3rem` |
| 카드 제목 | `.nurture-part-title` | 14.4 / 25.2 / 700 | 14.4 | 본문과 같은 크기 |
| 카드 본문 | `.about-brief-desc`, `.logo-desc`, `.faq-a-text` | 16 / 30.4 | 16 / 30.4 | |
| 카드 본문 | `.liturgy-body`, `.newcomer-intro-body` | 16 / **31.2 (1.95)** | 16 / 31.2 | `style.css:2561,2338` |
| 카드 본문 | `.card-desc`(index) / `.worship-card-desc`(worship) | **14.4 / 25.2** / **14.4 / 27.4** | 동일 | 같은 문구인데 행간 1.75 vs 1.9 (`style.css:907`, `2683`) |
| 카드 본문 | `.video-desc`, `.space-desc`, `.emmaus-stage-desc` | 14.4 / 25.2~25.9 | 동일 | 행간 1.75/1.8/1.8 |
| 카드 본문 | `.resource-desc`, `.anglican-pillar-desc` | **13.6** / 23.8 | 동일 | `--fs-md` |
| 카드 본문 | `.links-card-desc` | **13.6** / 21.8 (1.6) | 동일 | `style.css:3917-3920` |
| 캡션/메모 | `.press-meta`, `.bio-role-tag`, `.community-card-note` 등 | 12.48 / 21.8 / 400 | 동일 | `--fs-label` |
| 캡션/배지 | `.lit-cal-label`, `.lit-cal-legend-tag` | **9.92**, **9.6** / 700 | 동일 | TYP-03 |
| 버튼 | `.btn-next`, `.newcomer-cta-link`, `.btn-hero-primary` | 14.4 / 25.2 / 600 | 동일 | |
| 버튼 | `.lect-track-btn`, `.lect-nav-btn` | 13.6 / normal / 600 | 동일 | |
| 버튼 | `.photo-filter-btn` | 14.4 / normal / 500 | 동일 | |
| 버튼 | `.map-copy-btn` | **12.48** / 20.0 / 600, **Arial** | 동일 | TYP-08 |

## 3. 발견 항목

### TYP-01 · index 히어로 제목(h1)이 섹션 제목(h2)보다 작음 — 심각도 상

| 항목 | 내용 |
|---|---|
| 페이지 | index.html (360~480px 구간) |
| 위치 | `style.css:464-472`(`.hero h1`), `style.css:3351`(`@media (max-width:480px) .hero h1 { font-size: 1.75rem; }`), `style.css:844-846`(`.section-title`) |
| 현상 | 모바일에서 홈 h1(28px)이 같은 페이지 h2.section-title(32px)보다 작아 제목 계층이 역전됩니다. 서브 페이지 h1은 35.2px인데 홈만 28px입니다. 홈 h1은 굵기 800, 서브 h1은 700입니다. 데스크톱(1440)은 홈 60.8px로 서브 54.4px보다 큽니다. |
| 증거 | 측정: index@360 h1 28px vs section-title 32px, index@390 h1 28px vs 32px(계층 역전 4건: 광명교회/예배 안내/처음 오셨나요?/오시는 길). index@768 h1 39.9px vs 32px(정상), @1024 53.2 vs 38.9. 서브 19페이지 h1은 390px에서 모두 35.2px/700. 스크린샷 `index_390.png` 상단에서 h1이 한 줄로 확인됨. |
| 영향 | 모바일 홈에서 페이지의 최상위 제목이 하위 제목보다 약해 시각 위계가 뒤집힙니다. 홈과 서브 페이지의 첫인상 크기도 어긋납니다. |
| 제안 수정 | `style.css:3351`의 `1.75rem` 오버라이드를 제거하거나 `clamp(2rem, …)` 하한(32px) 이상으로 맞추고(35.2px 서브 h1과 같은 값 권장), 홈과 서브의 h1 굵기를 700 또는 800 한쪽으로 통일합니다. 한 줄에 들어가는지 360px에서 확인합니다("모든 생명을 환대하는 교회", 390px에서 28px일 때 한 줄). |

### TYP-02 · 모바일 본문이 15px 미만인 곳이 많음 — 심각도 상

| 항목 | 내용 |
|---|---|
| 페이지 | clergy, greenchurch, worship, newcomer, emmaus, sundays, videos, links, index 외 (전 페이지 푸터 포함) |
| 위치 | 토큰 `style.css:68-72`(`--fs-sm: 0.9rem`=14.4px, `--fs-md: 0.85rem`=13.6px, `--fs-label: 0.78rem`=12.48px). 사용처: `.story-value-text` `3651`, `.resource-desc` `2738`, `.space-desc` `2993`, `.video-desc` `4028`, `.card-desc` `906`, `.worship-card-desc` `2683`, `.emmaus-stage-desc` `3477`, `.bishop-desc` `4509`, `.links-card-desc` `3917`, `.anglican-pillar-desc` `1904`, `.logo-element-desc` `1790`, `.footer-col .footer-brand-meta` `3083` 외 |
| 현상 | 390px에서 40자 이상인 문장형 텍스트의 글자 수 기준 53.5%(10,291/19,248자, 내비 제외·푸터 포함)가 15px 미만입니다. 14.4px가 대부분이고 13.6px, 12.48px도 문장 본문에 쓰입니다. 같은 `.story-value-text`가 greenchurch에서는 인라인으로 13.12px입니다. |
| 증거 | 측정(390px): `p.story-value-text` 14.4px 29건, `p.resource-desc` 13.6px 9건, `span.logo-ref-text` 12.48px 13건, `p.mission-mark__en` 13.6px, `span.links-card-desc` 13.6px, 푸터 `p.footer-brand-meta` 12.48px 20페이지. 같은 폭의 본문 `p.liturgy-body`, `p.faq-a-text`는 16px로 정상입니다. |
| 영향 | 고령 이용자가 읽는 설명·FAQ 주변 문장이 본문(16px)과 크기 차이가 나고, 일부는 13px 안팎이라 읽기 부담이 큽니다. |
| 제안 수정 | 글자 크기를 낮추지 말고 올립니다. (a) 문장형 설명 클래스는 `var(--fs-body)`(16px) 또는 최소 15px로 올립니다. (b) 토큰을 올릴 경우 `--fs-sm` 0.95rem, `--fs-md` 0.9rem 이상으로 하되 사용처가 116곳이라 카드 줄바꿈·높이를 전 페이지에서 재확인해야 합니다. (c) 캡션·메타(`--fs-label`)도 13px 이상 권장합니다. |

### TYP-03 · 10px 미만 초소형 글자(교회력 달력·배지) — 심각도 상

| 항목 | 내용 |
|---|---|
| 페이지 | sundays.html(달력), 전 페이지 내비게이션 배지 |
| 위치 | `.lit-cal-label` `style.css:1194`(0.62rem), 모바일 반복 `1243`; `.lit-cal-legend-tag` `1232`(0.6rem); `.nav-badge` `320`(0.62rem); `.lect-track-tag` `2892`(0.68rem) |
| 현상 | 달력 칸 안 절기·기념일 이름이 9.92px, 범례 태그가 9.6px입니다. 두 규칙 모두 굵기 700이라도 글자가 매우 작습니다. `@media (max-width:480px)`의 `1243`은 기본값(`1194`)과 같은 값을 반복합니다. |
| 증거 | 측정: sundays@390·@1440 모두 `span.lit-cal-label` 9.92px, `span.lit-cal-legend-tag` 9.6px(폭이 달라도 동일), `span.lect-track-tag` 10.88px. 주석 `style.css:1243`에 "좁은 칸에서도 한 단어는 들어감"이라고 의도가 적혀 있음. |
| 영향 | 연령대가 높은 이용자는 달력 속 절기명을 읽기 어렵습니다. |
| 제안 수정 | 최소 `var(--fs-label)`(12.48px)로 올리되, 칸 폭(`.lit-cal-cell` min-height 46px, 7열)이 좁아 줄바꿈이 생기므로 모바일에서는 라벨을 생략하고 범례·상세로 대체하거나 칸 높이를 늘리는 설계 변경이 필요합니다. 적용 후 360px에서 칸 넘침 여부를 확인해야 합니다(미확인). |

### TYP-04 · eyebrow 크기가 위치마다 4종, 서브 히어로 eyebrow는 부제와 같은 크기로 보임 — 심각도 중

| 항목 | 내용 |
|---|---|
| 페이지 | 서브 18페이지 히어로, 본문 구역 전체, CTA, clergy 주교 블록 |
| 위치 | `.section-eyebrow` `style.css:835-842`(0.68rem, 600, 0.2em); `.page-hero p` `style.css:701-710`(font-size clamp(0.95rem,2vw,1.1rem), line-height 1.7); 서브 히어로 마크업 `worship.html:39` 등 18개 html의 `<p class="section-eyebrow" style="display:block; margin-bottom:0.75rem;">`; `.next-step-cta-eyebrow` `2413-2420`(0.72rem, 700, 0.22em); `.bishop-eyebrow` `4450`(0.7rem, 700, 0.12em) |
| 현상 | `.page-hero p`(특이도 0,1,1)가 `.section-eyebrow`(0,1,0)의 font-size·line-height를 덮어 서브 히어로 eyebrow가 부제 문단과 같은 15.2px/lh 25.8로 렌더링됩니다. 본문 구역 eyebrow는 10.88px입니다. 같은 역할인데 서브 히어로 15.2px, 본문 10.88px, CTA 11.52px, 주교 블록 11.2px로 굵기(600/700)와 자간도 다릅니다. |
| 증거 | 측정(390px): 서브 히어로 eyebrow 15.2/25.84/600/3.04px와 히어로 부제 15.2/25.84/400이 같은 크기. 값이 폭에 따라 15.2(360·390)→15.36(768)→17.6(1024·1440)로 변하며 `clamp(0.95rem,2vw,1.1rem)`과 정확히 일치. 본문 구역은 모든 폭에서 10.88px. 스크린샷 `worship_390.png`에서 "WORSHIP & PRAYER"가 부제와 비슷한 크기로 보임. |
| 영향 | eyebrow가 의도한 "작은 라벨"이 아니라 부제와 경쟁하는 글자가 되고, 같은 컴포넌트가 위치에 따라 1.4배 차이가 납니다. 반대로 본문 구역 eyebrow(10.88px)는 TYP-03과 같은 초소형 문제입니다. |
| 제안 수정 | eyebrow 단일 규칙(예: `.section-eyebrow`에 `font-size: var(--fs-label)` 이상, 600, `--ls-eyebrow`)으로 통일하고, 서브 히어로 안에서는 `.page-hero .section-eyebrow`로 특이도를 높여 부제 규칙의 영향을 차단합니다. 18개 html의 인라인 `style="display:block; margin-bottom:0.75rem;"`는 `.section-eyebrow`가 이미 `display:block`이므로 클래스로 옮깁니다(CTA·주교 eyebrow도 같은 토큰 사용). 서브 히어로는 현재 15.2px을 유지한다면 부제와 구분되도록 별도 변형 클래스로 명시합니다. |

### TYP-05 · 여러 줄 한글 문장의 행간이 1.5 미만 — 심각도 중

| 항목 | 내용 |
|---|---|
| 페이지 | index(`.about-brief-lead`), faq(`.faq-q-text`) |
| 위치 | `.about-brief-lead` `style.css:1580-1585`(`line-height: var(--lh-heading)`=1.45), `.faq-q` `2164-2165`(`--lh-heading`), 토큰 정의 `style.css:75`(`--lh-heading: 1.45`). `.news-post-title` `5324`(1.4)는 제목이라 제외 |
| 현상 | 토큰 `--lh-heading`이 1.45라서, 제목이 아닌 여러 줄 문장(홈 소개 리드 18.4px, FAQ 질문 16px)이 1.45 행간입니다. |
| 증거 | 측정(390px): `p.about-brief-lead` 18.4px / 26.68px(1.45), 높이 53px(2줄); `span.faq-q-text` 16px / 23.2px(1.45), 높이 70px(3줄). 같은 폭의 본문은 1.75~1.95. |
| 영향 | 3줄까지 줄바꿈되는 FAQ 질문의 줄 사이가 빽빽해 읽기 어렵습니다. |
| 제안 수정 | 질문·리드 문장은 `--lh-body`(1.75) 또는 최소 1.55로 올립니다. `--lh-heading` 토큰은 한 줄 제목 전용으로 한정합니다. |

### TYP-06 · 같은 역할인데 카드 제목 크기·자간이 제각각 — 심각도 중

| 항목 | 내용 |
|---|---|
| 페이지 | clergy, worship, newcomer, community, emmaus, giving, index, visit, greenchurch 외 |
| 위치 | 18px `.card h3` `style.css:892-896`, `.info-card h3` `935-941`, `.newcomer-cta h3` `2515-2519`; 16px(`--fs-body`) `.value-card h3` `1316`, `.communion-card h3` `2672`, `.step-title` `2638`, `.liturgy-card-title` `2573`, `.space-name` `2980`, `.anglican-pillar-title` `1903`, `.mission-mark__title` `2012`, `.links-card-name` `3913`; 16.32px `.resource-title` `2729`(1.02rem); 16.8px `.story-value-title` `3642`·`.bcp-section-title` `1862`(1.05rem); 20.8px `.logo-anglican-title` `1743`·`.placeholder-title` `3572`(1.3rem); 14.4px `.nurture-part-title` `3514`; 모바일 오버라이드 `3330`(1.05rem) |
| 현상 | 카드 제목이 14.4/16/16.32/16.8/18/20.8px 6단계로 흩어져 있고, 같은 `h3`도 페이지에 따라 18px(community·emmaus·giving·index·visit·worship), 16px(clergy), 16.8px(newcomer 모바일)입니다. 자간도 `-0.01em`(`.card h3`)·`-0.015em`(`.story-value-title`)·`0.06em`(`.minister-cat-title` `1370`)·`normal`로 혼재합니다. `.nurture-part-title`은 본문(14.4px)과 같은 크기라 제목으로 보이지 않습니다. |
| 증거 | 측정(390px) 카드 제목 24개 조합(위 위치 참고). `h3` 클래스 없는 요소: 18px 6페이지 / 16px 2페이지. `.newcomer-cta h3`는 데스크톱 18px, 모바일 16.8px(`3330`). `.nurture-part-title` 14.4/25.2/700. |
| 영향 | 같은 위계의 카드 제목이 페이지마다 달라 보이고, 토큰 밖 값(1.02/1.05rem)이 쌓입니다. |
| 제안 수정 | 카드 제목을 2단(대: `--fs-lead` 18px, 소: `--fs-body` 16px)으로 정리하고 `1.02rem`/`1.05rem`을 토큰으로 대체합니다. 자간은 `-0.01em` 하나로(또는 모두 normal) 통일합니다. `.nurture-part-title`은 최소 16px로 올립니다. |

### TYP-07 · h2 역할의 크기가 페이지마다 다름(11.5~32px) — 심각도 중

| 항목 | 내용 |
|---|---|
| 페이지 | privacy, smallgroup, clergy, newcomer, hopecenter, faq, links, 서브 CTA |
| 위치 | privacy `privacy.html:47,50,63,66,69,72,77` 인라인 `font-size:1.05rem`; smallgroup `app.js:921` 인라인 `1.25rem`; clergy `app.js:1079` `<h2 class="section-title" style="font-size:1.4rem;">`; `.next-step-cta-title` `style.css:2421-2428`(800, clamp 1.5~2.1rem); `.newcomer-intro-title` `2329`(1.5rem, 모바일 `3325` 1.3rem); `.placeholder-title` `3572`(1.3rem); `.faq-cat-title` `2130`(`--fs-lead`); `.links-group-title` `3880`(0.72rem, 0.25em, 대문자 스타일) |
| 현상 | h2가 11.52px(links, eyebrow 크기) ~ 32px(`.section-title`)까지 흩어져 있습니다. privacy의 h2는 16.8px라 본문 16px과 거의 같아 구분이 약하고, 같은 `.section-title` 클래스가 clergy 하위 블록에서만 인라인으로 22.4px입니다. CTA 제목은 굵기 800(섹션 제목은 700)입니다. |
| 증거 | 측정(390px, 비-푸터 h2): `section-title` 32px(9페이지) / 22.4px(clergy 인라인) / `next-step-cta-title` 24px 800 / `newcomer-intro-title` 20.8px / `placeholder-title` 20.8px / smallgroup h2 20px / `faq-cat-title` 18px / privacy h2 16.8px / `links-group-title` 11.52px. 푸터 `h2`(`style.css:3035-3038`)는 12.48px·0.18em·대문자 스타일. |
| 영향 | 같은 레벨(h2) 제목의 시각 위계가 페이지마다 달라 일관성이 떨어지고, privacy는 제목이 본문과 구분되기 어렵습니다. |
| 제안 수정 | h2 단계를 2종(대: `.section-title`, 소: 20.8~22.4px)으로 정의해 클래스로 처리하고 인라인 style은 제거합니다. privacy h2는 최소 1.25rem·`--heading` 색 유지. `.links-group-title`은 h2 대신 eyebrow 스타일 클래스임을 명시하거나 크기를 올립니다. |

### TYP-08 · 일부 `<button>` 안 텍스트가 Arial로 렌더링됨 — 심각도 중

| 항목 | 내용 |
|---|---|
| 페이지 | gallery.html, index.html, visit.html, sundays.html |
| 위치 | `.photo-item`(button) `style.css:4121-4133`(font-family 없음), 자식 `.photo-cat-badge` `4168`, `.photo-caption` `4175`, `.photo-date` `4181`; `.map-copy-btn` `3769-3783`; `.lit-cal-nav` `1133-1146`. 반면 `.lect-track-btn` `2868`, `.photo-filter-btn` `4102`, `.bulletin-row` `4849`, `.more-toggle` `5107` 등은 `font-family: inherit` 선언. 전역 button 리셋 없음(`style.css`의 button 규칙은 `1068`의 `font: inherit`(`.season-ribbon-seg`뿐)) |
| 현상 | `font-family: inherit`이 빠진 버튼은 브라우저 기본(Arial 계열)을 씁니다. 갤러리 사진 위 분류·캡션·날짜와 주소 "복사" 버튼, 달력 ◀▶가 해당합니다. 한글은 시스템 CJK 폴백 폰트로 표시되어 사이트 본문과 서체가 다릅니다. |
| 증거 | 측정: 전 페이지 Arial 80건 — `p.photo-date`·`span.photo-cat-badge`·`p.photo-caption`(button.photo-item 안, gallery), `button.map-copy-btn`(index·visit 각 1건, 텍스트 "복사"), `button.lit-cal-nav`(sundays). 같은 gallery의 `.photo-filter-btn`은 Pretendard. |
| 영향 | 갤러리 캡션과 복사 버튼만 서체가 달라 보이고, 기기별 폴백 폰트에 따라 모양이 달라집니다. 렌더링 폴백 폰트 실물은 미확인. |
| 제안 수정 | 전역 한 줄 `button, input, select, textarea { font-family: inherit; }`을 리셋 영역에 추가합니다. 개별 `font-family: inherit` 7곳은 정리 가능합니다. |

### TYP-09 · 인라인 style로 하드코딩된 타이포그래피 — 심각도 중

| 항목 | 내용 |
|---|---|
| 페이지 | worship/newcomer(app.js 카드), clergy, giving, sundays, smallgroup, privacy, greenchurch, emmaus |
| 위치 | `app.js:851,891-892,918-930,952-957,1079,1291-1299,2545-2547,2736-2739`(총 28개 태그); `greenchurch.html:102,264,339`; `emmaus.html:286`; `privacy.html:40,47-77` |
| 현상 | 인라인 `font-size`가 토큰과 맞지 않는 값(0.78/0.8/0.82/0.82em/0.83/0.85/0.88/0.92/1.4/1.45rem)이고, line-height도 1.7/1.8/1.9/2(`app.js:930`, `greenchurch.html:264,339`)로 직접 지정됩니다. 연락처·성품일 등은 0.83rem(13.28px), 0.78rem(12.48px)입니다. 같은 `.story-value-text`가 greenchurch.html:102에서만 인라인으로 0.82rem(13.12px)이라 같은 페이지의 다른 `.story-value-text`(14.4px)와 크기가 다릅니다. |
| 증거 | 측정(390px): `p.story-value-text[inline]` 13.12px vs `p.story-value-text` 14.4px(greenchurch), sundays `p[inline]` 13.12px·13.28px·14.4px, clergy 연락처 13.28px, emmaus `p[inline]` 12.8px. 인라인 속성 집계: font-size 약 31곳, line-height 7곳, font-weight 14곳, letter-spacing 1곳. |
| 영향 | 토큰 수정이 이 요소들에는 적용되지 않아 TYP-02 개선 시 누락됩니다. 모바일에서 13px대 글자도 여기서 나옵니다. |
| 제안 수정 | 인라인을 기존 클래스(`.card-desc`, `.resource-desc`, 신규 `.text-note`)로 바꾸고 값은 토큰으로 대체합니다. 최소 크기는 올림(0.83→`--fs-sm` 이상). 콘텐츠 규칙(CLAUDE.md "HTML에 하드코딩 금지")과도 맞습니다. |

### TYP-10 · 토큰 밖 font-size 값이 많음(소형 9종·중형 8종) — 심각도 하

| 항목 | 내용 |
|---|---|
| 페이지 | 전체 |
| 위치 | 소형: `0.72rem` 18곳(`568,1109,1418,1501,1530,1752,2314,2414,2786,2986,3122,3347,3400,3468,3635,3880,4014,4877`), `0.7rem` 8곳(`240,1475,2084,3069,3328,3451,3706,4450`), `0.68rem` 6곳(`628,836,1817,2892,3136,3159`), `0.66rem` `623`, `0.62rem` `320,1194,1243`, `0.6rem` `1232`, `0.76rem` `2897`. 중형: `1.05rem` 7곳(`1340,1862,2799,3330,3601,3642,4265`), `1.02rem` `2729`, `1.2rem`·`1.25rem`·`1.3rem`·`1.35rem`·`1.5rem` 다수 |
| 현상 | 같은 "작은 라벨" 역할에 0.6~0.76rem 9종이 쓰이고, 토큰(`--fs-label` 0.78rem)이 있는데도 더 작은 값을 직접 씁니다. 제목·리드에도 1.02/1.05/1.2/1.25/1.3/1.35/1.5rem이 섞입니다. |
| 증거 | `style.css` 선언 파싱: font-size 303건 중 토큰 아닌 rem 74건, 서로 다른 값 37종(위 표 2-1). |
| 영향 | 크기 조정 시 한 곳씩 찾아야 하고, 작은 글자가 계속 늘어납니다. TYP-03·04의 원인입니다. |
| 제안 수정 | 최소 크기 토큰(예: 12.5px 이상)을 하나 정해 0.6~0.76rem을 모두 그 값으로 흡수합니다(크기가 커지는 방향). 1.02/1.05rem은 `--fs-body`/`--fs-lead`로 흡수합니다. |

### TYP-11 · 본문 행간이 21종으로 난립, 일부는 2.0 — 심각도 하

| 항목 | 내용 |
|---|---|
| 페이지 | worship, newcomer, smallgroup, greenchurch, giving, 전 페이지 푸터 |
| 위치 | 1.95: `.liturgy-body` `style.css:2561`, `.newcomer-intro-body` `2338`; 2.0: smallgroup 목록 li, greenchurch 목록(`greenchurch.html:339`), `app.js:930`; 1.9: `.worship-card-desc` `2683`, `.logo-history` `1766`, `.footer-col .footer-brand-meta` `3086` |
| 현상 | 본문 행간이 1.6/1.65/1.7/1.75/1.8/1.85/1.9/1.95/2.0으로 9단계입니다. 같은 문구인 홈 `.card-desc`(1.75, 25.2px)와 worship `.worship-card-desc`(1.9, 27.4px)처럼 같은 크기·내용이어도 행간이 다릅니다. 2.0은 14.4px 목록에 쓰여 줄 사이가 지나치게 벌어집니다. |
| 증거 | 측정(390px): `p.liturgy-body` 16px/31.2px(1.95), smallgroup `li` 14.4px/28.8px(2.0), greenchurch `li` 14.72px/29.44px(2.0), index `p.card-desc` 25.2px vs worship `p.worship-card-desc` 27.36px(둘 다 14.4px). 선언 빈도: line-height 21종(위 표 2-1). |
| 영향 | 페이지별 글 밀도가 달라 보입니다. 너무 좁은 문제는 TYP-05에만 있습니다. |
| 제안 수정 | 본문 행간을 `--lh-body`(1.75)·`--lh-relaxed`(1.9) 2종으로 통일하고 2.0은 1.9로 낮춥니다(글자 크기는 유지). |

### TYP-12 · 중복·불필요한 타이포 선언 — 심각도 하

| 항목 | 내용 |
|---|---|
| 페이지 | 전체(CSS) |
| 위치 | 기본값과 동일한 미디어쿼리 재선언 9건: `style.css:631`(`.btn-hero-primary`), `1242`·`1243`·`1244`(`.lit-cal-*`), `2266`(`.faq-q`), `3285`(`.dropdown li a`), `3327`(`.newcomer-key-row`), `3336`(`.footer-service-row`), `3347`(`.bio-year`). 동일 규칙 이중 선언: `style.css:3822`와 `3823`(`.map-card--compact .map-btn`, 둘 다 `font-size: var(--fs-md)`, 패딩만 0.75rem/0.7rem으로 다름). 토큰과 같은 값을 직접 쓴 곳 26건: line-height 1.75 `106,1849,1904,2435,2740,3080,3653,4030`, 1.9 `1760,1766,1855,2603,2683,2686,3086,3388,3580`, 1.2 `232,3064,3072`; letter-spacing 0.08em `2361,3124,3637,4227`, 0.2em `3453` |
| 현상 | 값이 같아 효과 없는 재선언과 토큰 우회 직접 입력이 있습니다. |
| 증거 | 선언 파싱(media 값 == 같은 선택자 기본값 비교, 토큰 값 일치 비교). |
| 영향 | 실제 렌더링 결함은 없지만 토큰을 바꿔도 이 곳이 안 따라오고 유지보수 비용이 큽니다. |
| 제안 수정 | 중복 재선언 삭제, 직접 입력은 `var(--lh-*)`/`var(--ls-*)`로 교체. 렌더링 변화 없음. |

### TYP-13 · 한글 소형 라벨에 넓은 자간(0.18~0.34em) — 심각도 하

| 항목 | 내용 |
|---|---|
| 페이지 | 전 페이지 헤더·푸터, index, clergy, links, emmaus, newcomer |
| 위치 | `.nav-logo-sub` `style.css:240`(0.34em), `.footer-brand-sub` `3071`(0.34em), `.logo-lockup-tag` `1714`(0.34em), `.hero-label` `455-463`(0.24em, 모바일 `623` 0.18em), `.links-group-title` `3880-3882`(0.25em), `.footer-col h2` `3035-3038`(0.18em), `.emmaus-scripture-ref` `3399`(0.15em) |
| 현상 | 한글 라벨에 영문 대문자용 자간을 적용했습니다. 로고 부제("녹색교회" 0.34em)는 브랜드 연출로 보이지만, 안내 라벨까지 같은 방식입니다. 반대로 카드 본문 일부는 음수 자간(`.story-value-text` `3655` -0.005em, `.card h3` -0.01em)입니다. |
| 증거 | 측정(390px): `span.nav-logo-sub` 11.2px/3.81px(0.34em), `div.hero-label` 10.56px/1.9px(0.18em), `h2.links-group-title` 11.52px/2.88px(0.25em), 푸터 `h2` 12.48px/2.25px(0.18em). 위 요소가 11~12px대와 겹쳐 가독성이 더 떨어짐. |
| 영향 | 작은 한글에 넓은 자간은 단어 구분을 약화시킵니다. 로고 부제는 영향이 작습니다. |
| 제안 수정 | 한글 라벨은 자간을 0.05em 이하로, 영문 대문자 eyebrow만 `--ls-eyebrow`를 씁니다. 로고 부제는 디자인 의도이므로 유지 여부를 확인합니다. |

### TYP-14 · 교회 소식 페이지에서 제목 단계 건너뜀(h1→h3) — 심각도 하

| 항목 | 내용 |
|---|---|
| 페이지 | news.html |
| 위치 | `app.js:2128`(`<h3 class="news-post-title">`), 클래스 `style.css:5324` |
| 현상 | 페이지 구조가 h1("교회 소식") 다음 바로 h3(게시글 제목)이며 h2가 없습니다. 날짜 목록은 button이고 h2가 아닙니다. |
| 증거 | 측정(news@390, @1440): `h1` → `h3.news-post-title`(16px/22.4px/700). 다른 페이지에서는 건너뜀 없음(footer h2 제외, community·giving·visit·worship의 `h2.sr-only`는 의도된 숨김 제목). |
| 영향 | 스크린리더 제목 탐색에서 단계가 건너뛰어집니다. 시각 크기 역전은 없습니다. |
| 제안 수정 | 게시글 제목을 h2로(크기는 `.news-post-title` 그대로) 바꾸거나 날짜 구분을 h2로 둡니다. |

## 4. 미확인 항목

1. **다크 모드 타이포그래피**: 측정은 라이트만 수행했습니다(글자 크기·행간은 모드에 따라 바뀌지 않는 CSS라고 보이지만 `prefers-color-scheme` 블록 안의 font 선언은 전수 확인하지 않았습니다).
2. **실제 렌더링된 폰트 파일**: Pretendard 로드는 `baseline`의 `pretendardLoaded: true`를 근거로 했습니다. CDP로 실제 사용 폰트 확인(`CSS.getPlatformFontsForNode`)과 CDN CSS의 family 이름 확인은 도구 오류로 끝내지 못했습니다. TYP-08 Arial 폴백이 기기에서 어떤 한글 서체로 보이는지도 미확인입니다.
3. **상태·조건부 UI**: 닫힌 FAQ 답변, 갤러리 라이트박스(`.gallery-lb-title` 1.05rem `4265`), 검색 오버레이, 모바일 내비 드롭다운, 열기 전 `more-body` 등은 측정에서 제외했습니다(숨김 요소 제외). 내비게이션/헤더 글자는 역할 비교에서 제외했습니다.
4. **TYP-03·02 적용 후 레이아웃 영향**: 달력 칸 폭·카드 높이·줄바꿈 변화는 수정 전이라 확인하지 않았습니다.
5. **실제 기기**: iOS Safari·안드로이드의 글자 크기 설정, 200% 확대 시 동작은 미확인입니다.
6. **여러 줄 한글 제목 행간**: `.page-hero h1` 1.15, `.hero h1` 1.18(`style.css:468,698`)은 제목이 두 줄로 줄바꿈되는 폭에서 확인하지 않았습니다(측정한 폭에서는 한 줄).
7. **data.js 콘텐츠 자체의 서식**(마크다운·강조 태그에 따른 글자 크기)은 렌더러 출력만 측정했고 데이터는 직접 검토하지 않았습니다.
