# 02. 검수 1 — 타이포그래피·레이아웃 독립 검증

- 검수일: 2026-10-11 · 기준 커밋 `05777d2` · 브랜치 `improve/ui-consistency` (작업 트리 깨끗, 소스 수정 없음)
- 대상: `audit/01-investigation-typography.md` (TYP-01~14), `audit/01-investigation-layout.md` (LAY-01~14)
- 방법: 조사팀 결론을 쓰지 않고 `style.css`·`app.js`·`*.html`을 grep으로 다시 읽고, Playwright Chromium(`http://localhost:8000`, 라이트)으로 다시 측정했습니다. 수정안은 `add_style_tag`로 주입해 효과와 부작용을 시험했습니다(파일은 건드리지 않음).
- 검증 스크립트·스크린샷: `/tmp/claude-0/-home-claude/aecbfe46-a9d3-53b1-bf88-8b5ab3b19d54/scratchpad/v1/` (`a.py` 전 페이지 계산값, `c.py` 문장 텍스트 크기, `d.py`·`e.py`·`n.py` 홈 히어로·검색 오버레이·가로 화면, `f.py`·`g.py` 섹션 여백, `j.py`·`l.py`·`k.py` 달력 라벨, `i.py` 교차 배경 시각 확인)
- 판정 기준: 확정 = 코드와 렌더링 모두에서 재현 / 오탐 = 재현은 되나 의도된 디자인이거나 결함이 아님 / 보류 = 이번 검수에서 확인 못 함

## 0. 결과 요약

| 구분 | 건수 | 비고 |
|---|---|---|
| 확정 | 27 (TYP 14, LAY 13) | 그중 범위·수치를 정정한 것 9건(TYP-01·03·04·06·07·08·11·13, LAY-04) |
| 오탐 | 0건(항목 전체 기준) / 부분 오탐 7곳 | 항목 안에서 결함이 아닌 하위 주장을 아래 4장에 명시 |
| 보류 | 1 (LAY-12) + 세부 보류 6건 | 4장 참조 |

중복 병합 묶음(수정은 묶음 단위로 한 번에 처리):

| 묶음 | 항목 | 한 줄 기준 |
|---|---|---|
| G-MIN 글자 크기 하한 | TYP-02, 03, 10 (+TYP-09 일부) | 문장형 설명은 15.2px(신규 `--fs-desc`), 라벨·캡션 하한 12.48px |
| G-EYE eyebrow | TYP-04, LAY-10, TYP-10 일부 | 본문 구역 eyebrow 한 종류, 서브 히어로 eyebrow는 명시적 별도 규칙 |
| G-INL 인라인 style | TYP-09, LAY-10, LAY-11, LAY-08, LAY-07 | 인라인 → 기존 클래스 또는 소수 신규 클래스 |
| G-LH 행간 | TYP-05, TYP-11 | 한 줄 1.2~1.4, 여러 줄 제목·리드 1.55, 본문 1.75, 장문 1.9 |
| G-HEAD 제목 위계 | TYP-06, TYP-07, TYP-01 | 카드 제목 2단, h2 2단 |
| G-SEC 섹션 여백 | LAY-03, 04, 07 | 섹션 패딩 하나, 섹션 가장자리 내부 margin 0 |
| G-CLN 죽은 규칙 정리 | TYP-12, LAY-13 | 동작 변화 없는 정리, 마지막 라운드 |

## 1. 조사팀과 달라진 핵심 사실 (코드로 확인한 것)

1. 토큰 `--fs-sm`(0.9rem)·`--fs-md`(0.85rem)를 전역에서 올리면 안 됩니다. `--fs-sm`은 상단 메뉴 `.nav-link`(`style.css:264`)·`.dropdown li a`(`303`)에, `--fs-md`는 `.btn-nav-live`(`338`)·`.gc-nav-link`(`4585`) 등에 쓰입니다. 769~1099px 구간 내비는 이미 `style.css:5149-5155` 주석대로 "1010px 아래에서 메뉴가 잘리는" 상태라, 토큰을 올리면 내비가 먼저 깨집니다. 조사팀 TYP-02 제안 (b)는 채택하지 않고 문장형 설명용 신규 토큰으로 갈음합니다.
2. 서브 히어로 eyebrow(`worship.html:39` 등)가 부제와 같은 15.2px인 것은 `.page-hero p`(`style.css:701`)가 `.section-eyebrow`를 덮어쓰기 때문이 맞습니다. 그러나 렌더링은 사진 위 흰색 대문자 자간 3px 라벨로 읽히고 부제(400, 자간 normal)와 구분됩니다(`worship_hero.png`). 결함이 아니라 우연히 만들어진 의도에 가까워 크기는 유지하고 규칙만 명시합니다. 진짜 문제는 본문 구역 eyebrow(10.88px)입니다.
3. `.nav-badge`(`style.css:320`, 0.62rem)는 현재 `data.js`에 `badge` 값이 없어 어떤 페이지에서도 렌더링되지 않습니다(`app.js:155,3058`은 있으나 데이터 0건). TYP-03의 "전 페이지 내비 배지"는 사실이 아닙니다.
4. LAY-04의 greenchurch는 해당하지 않습니다. greenchurch의 `<nav class="gc-page-nav">`는 `#intro` 뒤(`greenchurch.html:58`)에 있고 히어로 바로 다음 섹션은 `#intro`입니다. 해당 페이지는 videos·gallery·links·sundays 4개입니다(히어로 다음 형제가 nav, 첫 섹션 padding-top 96px/모바일 40px 확인).
5. TYP-08의 Arial 버튼 중 텍스트가 있는 것은 `.photo-item`(갤러리 분류·캡션·날짜), `.map-copy-btn`("복사"), `.lit-cal-nav`(◀▶)입니다. 내비 햄버거·닫기 버튼도 Arial이지만 아이콘뿐이라 영향이 없습니다.
6. 달력 라벨(TYP-03)을 올리면 2~3줄로 접히는 긴 라벨("왕이신 그리스도 주일")에서 360px 칸 폭(45px)상 단어 중간 줄바꿈이 생깁니다(`l.py`). 크기 상향은 가능하지만 모바일 값은 시각 확인이 필요합니다.

## 2. 항목별 판정

범례: 심각도는 검수 기준(조사팀과 다르면 표기). 라운드 1 토큰 / 2 색 / 3 타이포 / 4 레이아웃 / 5 컴포넌트 / 6 텍스트.

### 타이포그래피

| ID | 판정 | 검수 심각도 | 요약 |
|---|---|---|---|
| TYP-01 | 확정(수치 정정) | 중 | 홈 h1이 ≤480px에서만 28px로 h2(32px)보다 작음 |
| TYP-02 | 확정(해법 변경) | 상 | 390px 문장 텍스트 54.3%가 15px 미만 |
| TYP-03 | 확정(범위 정정) | 중 | 달력 라벨 9.92px·범례 9.6px 등 초소형 |
| TYP-04 | 확정(범위 정정) | 중 | 본문 eyebrow 4종 크기, 서브 히어로 규칙은 우연 |
| TYP-05 | 확정 | 중 | 여러 줄 한글(FAQ 질문·홈 리드) 행간 1.45 |
| TYP-06 | 확정(축소) | 하 | 카드 제목 오프스케일 값과 `.nurture-part-title` |
| TYP-07 | 확정(축소) | 중 | h2가 11.5~32px, privacy·links가 문제 |
| TYP-08 | 확정(범위 정정) | 중 | 일부 button 글꼴이 Arial |
| TYP-09 | 확정 | 중 | 인라인 font-size·line-height가 토큰 우회 |
| TYP-10 | 확정(G-MIN에 병합) | 하 | 토큰 밖 소형 값 |
| TYP-11 | 확정(축소) | 하 | 행간 값 난립, 2.0·1.95 정리 |
| TYP-12 | 확정(부분 검증) | 하 | 중복·동일 값 재선언 |
| TYP-13 | 확정(축소) | 하 | 한글 기능 라벨의 넓은 자간 |
| TYP-14 | 확정 | 하 | news에서 h1→h3 |

#### TYP-01 · 확정 (심각도 상 → 중)
- 코드: `style.css:464-472` `.hero h1 { font-size: clamp(2rem, 5.2vw, 3.8rem); font-weight: 800 }`, `style.css:3351` `@media (max-width:480px) { .hero h1 { font-size: 1.75rem } }`.
- 재측정: index@390 h1 28px/800, 같은 페이지 `.section-title` 32px. index@481 h1 32px = h2 32px(역전 해소되지만 동급), @768 39.9px. 역전 구간은 ≤480px뿐이라 조사팀이 쓴 "360~480px"가 정확합니다. 서브 h1은 35.2px/700. 심각도는 홈 히어로가 사진 위 전면 스플래시라 상으로 보지 않고 중으로 낮춥니다.
- 수정: `style.css:3351`을 `.hero h1 { font-size: 2rem; text-wrap: balance; }`로. 단순히 2rem만 주면 390px에서 "모든 생명을 환대하는 / 교회"로 한 단어가 외톨이가 되므로 `text-wrap: balance` 필수(시험: 2줄 "모든 생명을 / 환대하는 교회", 폭 162/193px). 3.5~35.2px로 서브 h1에 맞추는 안은 홈 히어로가 3줄이 될 수 있어 채택하지 않음.
- 부작용 시험: 360×640에서 히어로 버튼 하단 488 → 509px, 스크롤 표시 535px 위라 겹치지 않음. 390×844, 360×740도 정상.
- 굵기 800(홈)·700(서브)은 오탐으로 분류(4장). 영향: index만. 회귀 위험: 낮음. 라운드 3.

#### TYP-02 · 확정 (해법 변경)
- 재측정: 390px, 내비 제외 40자 이상 텍스트 노드 17,137자 중 9,302자(54.3%)가 15px 미만(조사팀 53.5%와 일치). 상위: `.story-value-text` 14.4px 2,704자, `.logo-ref-text` 12.5px, `.resource-desc` 13.6px, 인라인 `<p>` 14.4/12.8/13.1px 등.
- 해법: 토큰(`--fs-sm`, `--fs-md`)은 올리지 않습니다(1장 사실 1). 대신 `:root`(`style.css:68-72` 부근)에 `--fs-desc: 0.95rem`(15.2px)을 추가하고 문장형 설명 클래스의 `font-size`만 교체합니다.
  - `--fs-sm`(0.9rem)에서 올림: `.card-desc` 906, `.story-value-text` 3651, `.space-desc` 2993, `.video-desc` 4028, `.emmaus-stage-desc` 3477, `.bishop-desc` 4509, `.worship-card-desc`·`.worship-card-detail` 2683·2686, `.logo-history` 1765, `.bio-text` 1523, `.minister-cat-note` 1378
  - `--fs-md`(0.85rem)에서 올림: `.resource-desc` 2738, `.links-card-desc` 3918, `.anglican-pillar-desc` 1904, `.anglican-pillar-note` 1906, `.logo-element-desc` 1791, `.mission-mark__en` 2013, `.emmaus-scripture-caption` 3417
  - `--fs-label`(12.48px)에서 올림: 문장형인 `.logo-ref-text`, `.bio-source` 1565, `.iona-link-card__desc` 1978은 `--fs-md`(13.6px) 이상으로
  - 푸터 `.footer-brand-meta` 3084(12.48px)는 `--fs-md`로
- 인라인(app.js 891·892·928·956·957·2546·2547·2738·2739, greenchurch.html:102·264·339, emmaus.html:286)은 TYP-09 클래스화 때 함께 올립니다. 인라인을 그대로 두면 토큰·클래스 수정이 닿지 않습니다.
- 영향: 거의 전 페이지(카드 높이·줄바꿈 증가). 카드는 `align-items: stretch`라 높이는 행 단위로 함께 커짐. 회귀 위험: 중(카드 3열 줄 수 증가, 360px 확인 필수). 라운드 1(토큰 추가) → 3(적용).

#### TYP-03 · 확정 (범위 정정)
- 재측정: sundays `.lit-cal-label` 9.92px, `.lit-cal-legend-tag` 9.6px(`style.css:1194`, `1232`, 모바일 반복 `1243`), `.lect-track-tag` 10.88px(`2892`, 0.68rem), 홈 `.hero-label` 모바일 10.56px(`style.css:623` 0.66rem, 한글 "대한성공회 광명교회", 자간 0.18em).
- 오탐 부분: `.nav-badge`는 렌더링되지 않음(1장 사실 3).
- 시험(`l.py`): 라벨 12px로 올려도 칸 넘침 0, 최장 3줄, 행 높이만 +8px(75→83px). 다만 360px(칸 폭 45px)에서 "왕이신 그리스도 주일"의 "그리스도"(4글자)가 칸 안쪽 폭 39px를 넘어 `overflow-wrap: break-word`로 단어 중간에서 끊깁니다. 9.92px에서도 이미 3줄이었으므로 새 결함은 아니지만 12px에서는 더 눈에 띕니다.
- 수정: 데스크톱 `.lit-cal-label` 1194 → `0.75rem`, `.lit-cal-legend-tag` 1232 → `0.72rem`(범례는 칸 폭 제약이 없으므로 `--fs-label`까지 가능), `.hero-label` 623 → `font-size: var(--fs-label); letter-spacing: 0.12em`. 모바일 `.lit-cal-label`(1243)은 `0.7rem`(11.2px)으로 하고 단어 중간 끊김은 `word-break: keep-all`이 이미 걸려 있으므로 칸 높이로 흡수. 모바일 값은 보류(세부 보류 B-3).
- 영향: sundays, index. 회귀 위험: 중. 라운드 3. 색 팀 COL-02(지난 날짜 opacity .4)와 같은 칸이므로 색 라운드와 함께 최종 스크린샷 확인.

#### TYP-04 · 확정 (범위 정정) → G-EYE
- 재측정: 서브 히어로 eyebrow 15.2px(390)/17.6px(1440), 600, 자간 3.04px, 흰색(photo hero). 본문 구역 `.section-eyebrow` 10.88px 600 ls 2.18px(`style.css:835-842`). CTA 11.52px 700, 주교 11.2px 700.
- 오탐 부분: 서브 히어로 eyebrow의 15.2px는 의도된 라벨로 읽힘(2장 1장 사실 2). 크기를 "부제와 구분되게 줄이라"는 제안은 채택하지 않음.
- 조정안(하나의 기준): 본문 계열 eyebrow를 한 크기로: `.section-eyebrow` 835 `font-size: var(--fs-label)`(12.48px), `.next-step-cta-eyebrow`(2413) `.bishop-eyebrow`(4450)도 `var(--fs-label)`. 자간 `var(--ls-eyebrow)`(0.2em)은 영문 대문자 전용으로 유지, 굵기는 600(어두운 면 위 CTA만 700 허용). 서브 히어로는 `.page-hero .section-eyebrow { font-size: clamp(0.95rem, 2vw, 1.1rem); line-height: 1.7; margin: 0 0 var(--space-3); display: block; }`로 명시(현재 렌더링 그대로).
- 인라인 `style="display:block; margin-bottom:0.75rem;"`(18개 html, 5곳은 무의미한 `justify-content:center` 포함)는 위 규칙으로 흡수해 제거(G-INL). LAY-10은 이 항목으로 병합.
- 영향: 전 서브 페이지(18)+본문 eyebrow 전부. 회귀 위험: 낮음(본문 eyebrow가 10.88→12.48px로 커져 한 줄 길이가 늘어남, "Anglican Cycle of Prayer" 등 긴 라벨 360px 확인). 라운드 3, 인라인 제거는 라운드 5.

#### TYP-05 · 확정 → G-LH
- 재측정: `.faq-q-text` 16px/lh 23.2px(1.45) 3줄(높이 70px), `.about-brief-lead` 18.4px/1.45. `style.css:75` `--lh-heading: 1.45`를 `style.css:1585`와 `2165`가 사용.
- 수정: `:root`에 `--lh-snug: 1.55`(여러 줄 제목·리드용) 추가, `style.css:1585`와 `2165`를 `var(--lh-snug)`로. 1.55는 현재보다 넓어지는 방향이고 한 줄 제목에 쓰이는 `--lh-heading`은 건드리지 않음. `.news-post-title`(5324, 1.4)와 `.video-title`(1.5)도 여러 줄이 될 수 있으므로 같은 토큰으로.
- 영향: faq, index, news, videos. FAQ 질문 3줄 높이 +7px 정도. 회귀 위험: 낮음. 라운드 3.

#### TYP-06 · 확정 (축소) → G-HEAD
- 재측정(390px): 카드 h3가 18px(`.card h3`·`.info-card h3`·`.newcomer-cta h3` 데스크톱), 16px(value·communion·step·liturgy·space·pillar·mission·links), 16.3px(`.resource-title`), 16.8px(`.story-value-title`·`.bcp-section-title`·newcomer 모바일 `.newcomer-cta h3`), 20.8px(`.logo-anglican-title`·`.placeholder-title`), 14.4px(`.nurture-part-title`)로 확인.
- 판정: 16px와 18px의 2단은 카드 크기·밀도에 따른 의도로 보이므로 유지(오탐). 결함은 (a) 오프스케일 16.3px/16.8px, (b) 14.4px 제목, (c) h3가 clergy에서만 16px로 보이는 불일치(다른 페이지 같은 `.card h3`는 18px).
- 수정: `.resource-title`(2729, 1.02rem), `.story-value-title`(3642)·`.bcp-section-title`(1862)(1.05rem), 모바일 `.newcomer-cta h3`(3330)를 `var(--fs-body)`(16px)로. `.nurture-part-title`(3512~3514) `var(--fs-sm)` → `var(--fs-body)`. `1.02rem/1.05rem`은 제목에서 폐기. 카드 제목 자간은 18px 계열 `-0.01em`만 유지하고 나머지는 normal(현행 유지).
- 영향: worship·index·sundays·greenchurch·clergy·newcomer·emmaus. 회귀 위험: 낮음(0.3~0.8px 변화). 라운드 3.

#### TYP-07 · 확정 (축소) → G-HEAD
- 재측정(390px): `.section-title` 32px, clergy 인라인 22.4px(`app.js:1079`), CTA 24px/800, `.newcomer-intro-title` 20.8px, smallgroup 인라인 20px(`app.js:921`), `.faq-cat-title` 18px, privacy h2 16.8px(인라인, `privacy.html:47` 등 7곳), `.links-group-title` 11.5px(`style.css:3880`, 한글 "대한성공회" 등, 자간 0.25em).
- 오탐 부분: clergy 하위 블록 22.4px는 "섹션 안 소제목"이라는 별도 위계로 볼 수 있어 크기 자체는 유지. 다만 인라인은 클래스로 이전.
- 결함: (1) `.links-group-title`이 h2인데 11.5px 라벨 크기라 그룹 제목이 본문보다 작음, (2) privacy h2 16.8px가 본문 16px와 거의 같음, (3) smallgroup h2 20px 인라인.
- 기준: h2는 2단 — 대 `.section-title`(32/44.8px), 소 `.section-title--sub: 1.4rem`(clergy 하위 블록, privacy 1.25rem 이상으로 통일하려면 소단 1.25~1.4rem 한 값 `1.3rem`). 제안: 소단 `1.3rem`(20.8px; 현재 newcomer·placeholder·smallgroup과 같은 값). clergy 22.4px는 20.8px로 줄어드는 대신 위계가 한 값으로 통일됩니다(글자 크기 감소가 아닌 제목 간 정리이므로 허용, 본문 아님).
- 수정: `.links-group-title` 3880 → `font-size: var(--fs-lead); letter-spacing: 0; text-transform: none; color: var(--heading)`, privacy 인라인 h2 → `.privacy-h2 { font-size: 1.3rem }` 클래스(G-INL), smallgroup `app.js:921`·clergy `app.js:1079` 클래스화. `.next-step-cta-title` 800은 어두운 면 위 디스플레이로 유지(오탐).
- 영향: links, privacy, smallgroup, clergy. 회귀 위험: 낮음. 라운드 3(+5).

#### TYP-08 · 확정 (범위 정정)
- 재측정: gallery `.photo-item` 안 분류·캡션·날짜, index·visit `.map-copy-btn`("복사"), sundays `.lit-cal-nav`가 Arial(내비 아이콘 버튼은 텍스트 없음, 영향 없음). `style.css:4121-4134` `.photo-item`에 `font-family`가 없고, 전역 button 리셋 없음(`style.css:160,171`은 포커스 규칙).
- 수정: 리셋 영역 `style.css:94-98` 부근(body 규칙 앞)에 `button, input, select, textarea { font-family: inherit; }` 한 줄 추가. 개별 `font-family: inherit`(`2868, 2926, 4102, 4715, 4849, 5046, 5107`)는 라운드 6 정리 때 삭제 가능(남겨도 무해). `font: inherit` 전체는 버튼 line-height가 바뀌므로 쓰지 않음.
- 영향: gallery, index, visit, sundays. 회귀 위험: 낮음(글꼴만 바뀌며 "복사" 버튼 폭이 미세하게 변할 수 있음). 색 팀 COL-01(`.photo-cat-badge` 대비)과 같은 선택자이므로 라운드 2·3 충돌 없이 순서만 지키면 됨. 라운드 3.

#### TYP-09 · 확정 → G-INL
- 재검증: `app.js` 인라인 font-size 라인 891·892·918·921·928·930·952·956·957·1079·1291·1296-1299·2545-2547·2736-2739, `greenchurch.html:102·264·339`, `emmaus.html:286`, `privacy.html:47-77`. 값은 0.78/0.8/0.82/0.83/0.88/0.9/0.92/1.4/1.45rem으로 토큰 밖. `greenchurch.html:102`는 같은 `.story-value-text`(14.4px)를 13.1px로 덮어씀을 렌더링에서도 확인.
- 수정: 인라인 → 다음 신규 클래스 최소 세트로 이전하고 값은 토큰으로: `.text-note { font-size: var(--fs-md); color: var(--text-muted) }`(연락처·성품일·출처), `.text-desc { font-size: var(--fs-desc); line-height: var(--lh-body); color: var(--text-muted) }`, `.prose-list { font-size: var(--fs-desc); line-height: var(--lh-relaxed) }`, `.privacy-h2`. 신규 클래스를 만들기 전에 `ARCHITECTURE.md` 클래스 목록에서 기존(`.card-desc`, `.resource-desc`)으로 해결되는지 먼저 확인(`CLAUDE.md` 원칙 3). 색 팀 DES-05/06(인라인 중복)과 같은 작업이므로 한 번에.
- 영향: giving, sundays, clergy, smallgroup, privacy, greenchurch, emmaus, 홈 일부. 회귀 위험: 중(인라인이 클래스보다 특이도가 높아 클래스 이전 시 다른 규칙과 충돌 가능, 페이지별 스크린샷 비교 필수). 라운드 5.

#### TYP-10 · 확정 (G-MIN에 병합)
- 재검증: grep으로 `font-size: 0.72rem` 18, `0.7rem` 8, `0.68rem` 6, `0.66rem` 1, `0.62rem` 3, `0.6rem` 1, `0.76rem` 1, `1.05rem` 7, `1.02rem` 1 모두 조사팀 수치와 일치(font-size 선언 전체 305).
- 수정: 라벨·캡션 역할의 0.6~0.76rem은 `var(--fs-label)`로 흡수(전부 커지는 방향). 단 달력 라벨(TYP-03)·로고 부제(`.nav-logo-sub` 240, 브랜드 연출)는 예외. 1.02/1.05rem → `--fs-body`(TYP-06).
- 영향: 전체. 회귀 위험: 중(뱃지·칩 폭 증가, 한 줄에 쓰던 칩 줄바꿈). 라운드 3. 한 번에 일괄 치환하지 말고 선택자별로.

#### TYP-11 · 확정 (축소) → G-LH
- 재검증: 행간 1.95(`2561`, `2338`), 2.0(smallgroup li, `greenchurch.html:339`, `app.js:930`), 1.9 외 1.85 9건, 1.8 5건, 1.7 8건, 1.6 7건 등 확인.
- 오탐 부분: 홈 `.card-desc`(1.75)와 worship `.worship-card-desc`(1.9)가 "같은 문구"라는 주장은 틀림. 홈은 3열 짧은 카드, worship은 2열 긴 단락이라 역할이 다릅니다. 2단 기준(카드 짧은 설명 1.75 / 장문 단락 1.9)에 이미 맞음.
- 기준: 한 줄 UI 1.2~1.4, 여러 줄 제목·리드 1.55(`--lh-snug`), 본문·카드 설명 1.75(`--lh-body`), 장문 1.9(`--lh-relaxed`).
- 수정: 1.95·2.0 → `var(--lh-relaxed)`(`2561`, `2338`, smallgroup li, `greenchurch.html:339`, `app.js:930`). 1.85 → 1.9, 1.8 중 짧은 설명(`.space-desc` 2995, `.emmaus-stage-desc` 3479, `.emmaus-scripture-caption` 3419) → 1.75(0.05 차이만 줄고 글자 크기가 15.2px로 커지므로 순증). 읽기 편의가 줄어드는 변경은 하지 않음(2.0→1.9만 줄어들며 장문 기준 상한 내).
- 영향: worship, newcomer, smallgroup, greenchurch, emmaus, 푸터. 회귀 위험: 낮음. 라운드 3.

#### TYP-12 · 확정 (부분 검증) → G-CLN
- 직접 확인한 것: `style.css:3822`·`3823`이 같은 선택자를 이중 선언(패딩 0.75rem/0.7rem, 뒤의 0.7rem이 이김), `631` `.btn-hero-primary { font-size: var(--fs-sm) }`가 기본(`518-529`)과 동일 값 재선언.
- 보류: 조사팀이 든 나머지 7건 중복(`1242-1244`, `2266`, `3285`, `3327`, `3336`, `3347`)과 "토큰과 같은 값 직접 입력 26건"은 이번에 줄 단위로 재검증하지 않음(B-5).
- 수정: 3822 삭제(3823 유지, 렌더링 불변) 등. 렌더링 변화 없음. 영향 없음. 회귀 위험: 낮음. 라운드 6(마지막).

#### TYP-13 · 확정 (축소)
- 재측정: `.links-group-title`(h2, 한글) 11.5px/자간 0.25em, 푸터 `.footer-col h2`(한글 "예배와 기도") 12.5px/0.18em, `.hero-label`(한글) 0.24em(모바일 0.18em), `.nav-logo-sub`·`.footer-brand-sub`("녹색교회") 0.34em.
- 오탐 부분: 로고 부제 0.34em은 로고 락업의 브랜드 연출이라 유지(`1714`, `3071`, `240`). 반대로 한글 기능 라벨에는 영문용 자간이 부적절.
- 수정: 한글 기능 라벨만 `letter-spacing: 0.05em` 이하: `.links-group-title` 3882(TYP-07과 함께), `.footer-col h2` 3038 → `0.04em`(`text-transform: uppercase`는 영문 항목 "YouTube" 등이 있어 유지), `.hero-label` 458 → `0.12em`(데스크톱), 623 → 삭제. 영문 eyebrow는 `--ls-eyebrow` 유지.
- 영향: links, 전 페이지 푸터, index. 회귀 위험: 낮음. 라운드 3.

#### TYP-14 · 확정
- 코드: `app.js:2128` `<h3 class="news-post-title">`, 페이지에 h2 없음(news@390 측정 일치).
- 수정: `h3` → `h2`(클래스 그대로 크기 유지, `style.css:5324`). 영향: news만. 회귀 위험: 낮음(전역 h2 규칙 없음, 푸터 h2는 `.footer-col h2` 한정). 라운드 6(마크업이라 6, 앱 JS 한 줄).

### 레이아웃·간격

| ID | 판정 | 검수 심각도 | 요약 |
|---|---|---|---|
| LAY-01 | 확정 | 중 | `class` 속성 중복 4곳, 교차 배경 미적용 |
| LAY-02 | 확정 | 중 | 360px 검색 닫기 버튼이 10px 이탈 |
| LAY-03 | 확정 | 중 | worship 등 섹션 가장자리 내부 margin 중복 |
| LAY-04 | 확정(범위 정정) | 중 | nav가 낀 4개 페이지 첫 섹션 패딩 96px |
| LAY-05 | 확정 | 하 | community 카드 링크 정렬(1024px만) |
| LAY-06 | 확정 | 하 | 낮은 뷰포트에서 홈 히어로 하단 잘림 |
| LAY-07 | 확정 | 하 | greenchurch `#intro` 인라인 패딩 |
| LAY-08 | 확정 | 하 | clergy 인라인 흰 배경 |
| LAY-09 | 확정 | 하 | 읽기 폭 760/820/860 혼재 |
| LAY-10 | 확정(TYP-04 병합) | 하 | 서브 히어로 eyebrow 인라인 반복 |
| LAY-11 | 확정(TYP-09 병합) | 하 | 인라인 간격·크기·색 |
| LAY-12 | 보류 | 하 | 2단 카드 내부 빈 공간 |
| LAY-13 | 확정 | 하 | 덮어쓰인 죽은 규칙, 미사용 클래스, 문서 수치 |
| LAY-14 | 확정 | 하 | 간격 토큰 2.5% 사용 |

#### LAY-01 · 확정
- 코드: `emmaus.html:87,253`, `greenchurch.html:68,394`가 `class="section" id="…" class="gc-section-alt"` 형태. HTML 파서는 두 번째 `class`를 무시.
- 재측정: 1440에서 emmaus `#stages`·`#references`, greenchurch `#climate`·`#animals` 배경 `rgba(0,0,0,0)`, 정상 적용된 clergy `#identity`·worship `#eucharist-order`·`#daily-office`·sundays `#lectionary`·`#special`은 `rgb(231,238,232)`.
- 의도 판단(보류였던 부분을 해소): 같은 페이지 안에서 2번째·4번째 섹션이 번갈아 지정되는 패턴이고(emmaus `#intro`(없음)/`#stages`(띠)/`#nurture`/`#join`/`#references`(띠), worship·sundays도 동일 교차), 클래스를 주입한 렌더링에서 흰 카드가 띠 위에서 선명하게 분리되고 어긋남이 없음(`emmaus_alt.png`, `greenchurch_alt.png`). 작성자의 교차 띠 의도가 맞음.
- 수정: 4곳 모두 `class="section gc-section-alt" id="…"`. 다크모드 규칙(`style.css:829-834`)이 함께 적용됨. 영향: emmaus, greenchurch. 회귀 위험: 낮음(절기별 `--theme-light`가 바뀌어도 기존 3개 페이지와 동일 규칙). 색 라운드(2)에서 `.gc-section-alt` 위 eyebrow·각주 대비를 같이 확인. 라운드 4.

#### LAY-02 · 확정
- 재측정: 360px `.menu-search-box` 16~322, `.menu-search-input` 59~307(248px), `.menu-overlay-close` 330~370(뷰포트 360 초과 10px). 390px은 334~374로 들어옴.
- 시험: `.menu-search-box, .menu-search-input { min-width: 0 }` 주입 → 360px close 304~344, box 16~296로 정상. 390px은 변화 없음.
- 수정: `style.css:4695` `.menu-search-box`에 `min-width: 0;`, `4708` `.menu-search-input`에 `min-width: 0;` 추가. 영향: 전 페이지(검색 오버레이). 회귀 위험: 낮음. 라운드 4.

#### LAY-03 · 확정 → G-SEC
- 재측정(1440/390, 섹션 내부 첫·마지막 자식 위치): worship `#eucharist-order`·`#daily-office`·`#resources` 위 160/아래 152px (390: 64/76px), `#bcp-hymnal` 96/136px, `#services-section` 40/96px. hopecenter 40/160px(390: 28/80), smallgroup 40/152px(28/76), links 96/144px(40/72). 표준 섹션은 96/96px(40/40). 조사팀 수치와 일치.
- 원인 코드: `style.css:2288-2291` `.liturgy-guide { margin: 4rem auto 0 }`, `2557` `.liturgy-section { margin-bottom: 3.5rem }`, `3565-3567` `.placeholder-wrap { margin: 4rem auto }`, `3878` `.links-group { margin-bottom: 3rem }`. `style.css:5143-5144`·`5172-5174`에 이미 "섹션 맨 앞 블록 margin-top 0"을 주는 규칙이 있으나 hero 직후 섹션만 일부 커버.
- 기준(하나): 섹션 여백은 `--section-pad`만. 섹션의 첫 자식 위 margin과 마지막 자식 아래 margin은 0.
- 수정: 새 규칙 하나 `.section > .container > :first-child { margin-top: 0 } .section > .container > :last-child, .section > .container > :last-child > :last-child { margin-bottom: 0 }`를 `style.css:5143` 뒤(전역, 모바일 한정 규칙을 전체로 확대)에 두고, `.liturgy-guide`(`:first-child`일 때), `.liturgy-section:last-child`, `.placeholder-wrap`, `.links-group:last-child`를 위 규칙이 이기도록 특이도 확인. 영향: worship, hopecenter, smallgroup, links(히어로 아래 간격이 줄어듦). 회귀 위험: 중(섹션 간 호흡이 줄어드는 방향의 시각 변화, worship 3개 띠 섹션 시각 확인). 라운드 4.

#### LAY-04 · 확정 (범위 정정) → G-SEC
- 재측정: videos·gallery·links·sundays는 `.page-hero`(sundays는 히어로 래퍼) 다음 형제가 `<nav class="gc-page-nav">`이고 그다음 섹션의 padding-top이 96px(390: 40px), 일반 서브는 40px(28px). greenchurch는 제외(1장 사실 4).
- 수정: `style.css:5136-5139`(≥769) `.page-hero + .section, .gc-page-nav + .section { padding-top: 2.5rem }`, `5162-5163`(≤768) `1.75rem`. sundays `#monthly` 위 첫 블록 margin 확인.
- 영향: videos, gallery, links, sundays. 회귀 위험: 중(sticky nav 바로 아래 콘텐츠가 가까워짐, 스크롤 시 sticky nav와의 겹침 확인). 라운드 4.

#### LAY-05 · 확정 (심각도 하)
- 재측정: community 1024px(3열)에서 카드 높이 290px로 같고 링크 하단 249/249/223px(26px 차). 768·1440은 동일. 4번째 카드(링크 없음)는 3열에서 단독 둘째 줄.
- 시험: `#community-full .card { display:flex; flex-direction:column }` + `.community-detail-link { margin-top:auto; align-self:flex-start }` → 링크 하단 233/233/233px로 정렬됨. 단 카드가 인라인 `text-align:center`라 `align-self:center`로 해야 현재 모양 유지.
- 수정: `style.css:3360` `.community-detail-link`에 `margin-top: auto`를 주려면 카드를 flex 열로 만들어야 하며 `.card`(874)는 전역 클래스라 `#community-full .card`로 한정. 4번째 카드 단독 배치는 `auto-fit` 그리드의 결과이며 디자인 판단이므로 LAY-12와 함께 보류.
- 영향: community 1024px대. 회귀 위험: 낮음. 라운드 5.

#### LAY-06 · 확정
- 재측정: 568×320에서 `.hero` 높이 320px, 버튼 하단 348px로 `overflow:hidden`에 잘림, 360×560·360×640·390×844는 정상(`style.css:372-381`, `3295`).
- 시험: `@media (max-width:768px) { .hero { min-height: max(100svh, 560px) } }` → 높이 560px, 버튼 하단 464px로 정상.
- 수정: `style.css:3295` `min-height: 100svh` → `min-height: max(100svh, 560px)`. 영향: index 가로 화면. 회귀 위험: 낮음(일반 세로 화면은 100svh가 이김). 라운드 4.

#### LAY-07 · 확정
- 코드: `greenchurch.html:47` `style="padding-top:3rem; padding-bottom:3rem;"`. 측정 48/48px(모바일도 48/48px, 표준은 hero 직후 40/96 → 28/40).
- 수정: 인라인 제거. 단 greenchurch `#intro`는 바로 뒤에 sticky nav가 있어 아래 여백이 96px이면 과함 → `.section--tight-bottom { padding-bottom: var(--space-8) }`(3.5rem) 클래스로 `#intro`만. 위쪽은 `.page-hero + .section` 규칙(LAY-04 기준)이 적용. 영향: greenchurch. 회귀 위험: 낮음. 라운드 5.

#### LAY-08 · 확정
- 코드: `clergy.html:95,114` 인라인 `background:var(--white)`, 같은 효과의 `.section--white`(`style.css:1660`)를 index는 사용(`index.html:99,118`).
- 수정: `class="section section--white" id="…"`로 교체, 인라인 제거(렌더링 불변). 영향: clergy. 회귀 위험: 낮음. 라운드 5.

#### LAY-09 · 확정
- 코드: `links.html:51` `max-width:860px`, `emmaus.html:254` `760px`, `privacy.html:40` `760px`, `style.css:2112` `.container--narrow { 820px }`(faq).
- 기준: 읽기 폭 2단 — `--content-read: 760px`(순수 글: emmaus·privacy), `--content-narrow: 820px`(목록·카드 혼합: faq·links). links 860 → 820으로 줄이면 카드가 40px 좁아지므로 카드 줄바꿈 확인 필요.
- 수정: 토큰 2개 추가(라운드 1), `.container--narrow`·`.container--read` 클래스로 인라인 3곳 이전(라운드 5). 영향: faq, links, emmaus, privacy. 회귀 위험: 중(links 카드 폭). 라운드 1→5.

#### LAY-10 · 확정 → TYP-04에 병합
- 재검증: grep으로 `class="section-eyebrow" style="…display:block…"`가 18개 html(bulletin, clergy, community, emmaus, faq, gallery, giving, greenchurch, hopecenter, links, media, newcomer, news, smallgroup, sundays, videos, visit, worship)에 있음. 조사팀의 "17개"는 18개가 맞음. `justify-content:center` 포함 5곳(emmaus, faq, greenchurch, hopecenter, smallgroup)은 `display:block`이라 무효.
- 수정: TYP-04의 `.page-hero .section-eyebrow` 규칙으로 흡수하고 인라인 제거. 라운드 5.

#### LAY-11 · 확정 → TYP-09에 병합
- 재검증: privacy 17, greenchurch 11, emmaus 8, clergy 3, links 2개 인라인. `greenchurch.html:264`(line-height 1.9)와 `339`(2)의 같은 목록 스타일 불일치 확인. 처리는 TYP-09와 동일(`.prose-list`로 1.9 통일). 라운드 5.

#### LAY-12 · 보류
- 이번 검수에서 직접 측정하지 않았고(worship 2열 카드 빈 공간 284px/41px, clergy `.values-grid` CTA), 내용 밀도에 따른 디자인 판단 요소가 큼. CTA를 카드 하단에 맞추는 부분(`margin-top:auto`)은 LAY-05와 같은 컴포넌트 규칙이므로 라운드 5에서 함께 검토. 나머지는 사용자 디자인 의견 필요.

#### LAY-13 · 확정 → G-CLN
- 재검증: `--section-pad`는 `style.css:50`(6rem), `3201`(3.5rem, ≤768, 이후 `5159`의 2.5rem이 덮음), `5225`(print). `.next-step-cta` `2501`(4rem, ≤560)은 `5192`(3rem)에 덮임. `.lectionary-cal`(`2762-2770`)은 css/js/html 어디에도 사용처가 없음(`.lectionary-cal-wrap`은 `2755`에 별도 존재). 문서: `ARCHITECTURE.md:623` `--section-pad: 7rem`(실제 6rem), `637` 모바일 히어로 306px(실제 291px, `style.css:691`).
- 수정: 죽은 규칙(3201의 `--section-pad`, `3203-3206`, `2501`, `.lectionary-cal`) 삭제, `ARCHITECTURE.md` 수치 정정. 렌더링 변화 없음. 회귀 위험: 낮음(삭제 전 `grep`·측정 재확인). 라운드 6.

#### LAY-14 · 확정(정책)
- 재검증: `var(--space-*)` 사용 16회(2:3, 3:3, 4:3, 5:4, 6:2, 8:1, 1·7은 0), margin/padding/gap 줄 446개. 비토큰 빈출: 1.25rem 42, 0.85rem 25, 1.1rem 22, 1.75rem 18, 1.4rem 15(줄 단위 집계, 조사팀의 선언 단위 집계와 약간 다르나 경향 동일).
- 수정: 일괄 치환 금지. `--space-4h: 1.25rem`, `--space-6h: 1.75rem` 두 값만 추가하고 신규·수정 코드부터 토큰 사용. 영향: 없음(추가만). 회귀 위험: 없음. 라운드 1.

## 3. 충돌·조정 결정 (하나의 기준)

| 쟁점 | 충돌한 제안 | 결정 |
|---|---|---|
| 본문 크기 | TYP-02 (b) 토큰 전역 상향 vs 내비 폭(`style.css:5149`) | 토큰 유지, 문장형 설명 전용 `--fs-desc: 0.95rem` 신설 |
| 본문 행간 | TYP-11(1.75/1.9 2단) vs TYP-05(제목 1.45 → 1.75 제안) | 여러 줄 제목·리드는 1.55(`--lh-snug`), 본문 1.75, 장문 1.9 — 제목에 1.75를 주지 않음 |
| 섹션 패딩 | LAY-03(내부 margin 제거) vs LAY-04(nav 후 패딩) vs LAY-07(인라인) | `--section-pad` 6rem/2.5rem 하나, hero·nav 직후 2.5rem/1.75rem, 가장자리 내부 margin 0, 예외는 `.section--tight-bottom` 하나 |
| eyebrow | TYP-04(서브 히어로 줄이기) vs 실제 렌더링 | 본문 eyebrow 12.48px 하나, 서브 히어로는 현행 `clamp(0.95rem,2vw,1.1rem)`를 명시적 규칙으로 고정 |
| h2 위계 | TYP-07 vs 디자인 팀 DES(인라인 중복) | 대(`.section-title`)·소(1.3rem) 2단, 인라인 클래스화는 G-INL에서 한 번에 |
| 굵기 | 홈 h1 800 vs 서브 h1 700, CTA 800 vs 섹션 제목 700 | 오탐: 800은 사진·어두운 면 위 디스플레이 전용(홈 히어로·CTA 제목), 라이트 면 제목은 700 |
| 달력 라벨 | TYP-03 상향 vs 칸 폭, 색 팀 COL-02(지난 날짜 opacity .4) | 데스크톱 12px, 모바일 11.2px(시각 확인 후 확정), 색 라운드에서 opacity와 함께 최종 확인 |
| `.photo-*` 버튼 | TYP-08(font-family) vs COL-01(분류 글자 대비) | 같은 선택자: 라운드 2(색)·3(글꼴) 순서로 하되 같은 스크린샷 세트로 확인 |
| 인라인 제거 | TYP-09·LAY-10·11 vs DES-05·06 | 한 번에 한 페이지씩, 클래스는 최소 세트(`.text-note`, `.text-desc`, `.prose-list`, `.privacy-h2`, `.container--read`, `.section--tight-bottom`) |

## 4. 오탐·보류 상세

부분 오탐(항목은 확정이나 하위 주장이 틀리거나 의도):
1. TYP-03: `.nav-badge` 초소형 문제 — 현재 렌더링되지 않음.
2. TYP-04: 서브 히어로 eyebrow가 부제와 같은 크기여서 문제라는 주장 — 사진 위 대문자·자간 라벨로 구분되며 의도로 판단.
3. TYP-07: clergy 하위 블록 22.4px, CTA 제목 800 — 위계상 의도(단, 22.4→20.8px 통일은 선택).
4. TYP-11: `.card-desc` 1.75 vs `.worship-card-desc` 1.9가 같은 역할이라는 주장 — 짧은 카드와 장문 단락이라 역할이 다름.
5. TYP-13: 로고 부제 "녹색교회" 자간 0.34em — 브랜드 락업 연출.
6. TYP-01: 홈 h1 굵기 800 vs 서브 700 — 사진 위 스플레이 전용 굵기로 판단.
7. LAY-04: greenchurch 포함 주장 — 해당 없음.

보류:
- 항목: LAY-12.
- B-1 다크모드 타이포·간격(측정 안 함, 라이트만 검증).
- B-2 실제 iOS/안드로이드 기기, 글자 크기 200% 확대.
- B-3 달력 모바일 라벨 11.2px의 단어 중간 줄바꿈 허용 여부(디자인 판단 필요, 사용자 확인 권장).
- B-4 `.nav-logo-sub` 등 로고 부제 자간 유지 여부(브랜드 판단).
- B-5 TYP-12 나머지 중복 7건·토큰 동일값 26건의 줄 단위 재검증.
- B-6 `--fs-desc` 15.2px 적용 후 전 페이지 카드 높이·줄바꿈(수정 후 5해상도 재측정 필요).
- B-7 `.lect-track-tag`(0.68rem)·`.lect-track-hint`(0.76rem)의 모바일 수정 전후 확인.

## 5. 권장 수정 순서

| 라운드 | 항목 | 비고 |
|---|---|---|
| 1 토큰 | `--fs-desc 0.95rem`, `--lh-snug 1.55`, `--space-4h/6h`, `--content-read 760px`, `--content-narrow 820px` 추가 | 추가만, 렌더링 변화 없음 |
| 2 색 | (본 검수 범위 외) | LAY-01 교차 배경은 색 라운드에서 대비 확인 |
| 3 타이포 | TYP-01, 02, 03, 04(규칙), 05, 06, 07, 08, 10, 11, 13 | G-MIN을 먼저, 이어서 G-LH, G-HEAD |
| 4 레이아웃 | LAY-01, 02, 03, 04, 06 | LAY-01·02·06은 독립·저위험이므로 먼저 |
| 5 컴포넌트 | TYP-04 인라인 제거, TYP-09/LAY-11, LAY-05, LAY-07, 08, 09, LAY-10 | 페이지별 스크린샷 비교 |
| 6 텍스트·정리 | TYP-12, 14, LAY-13, LAY-14 정책 | `npm test`(117개) 통과 확인 |

각 라운드 후: `npm test`, 20페이지×(360/390/768/1024/1440) 가로 스크롤 0건, 콘솔 오류 0건, `audit/metrics/baseline.json`과 비교.

## 6. 디자인 기준서 초안 입력

### 6-1. 타이포 스케일 (현재 값 보존, 불일치만 정리. 굵게 표시한 것이 변경점)

| 역할 | 글자 크기(390 / 1440) | 굵기 | 줄간격 | 자간 | 비고 |
|---|---|---|---|---|---|
| 홈 히어로 h1 | 32px(**28→32**) / 60.8px | 800 | 1.18 | -0.025em | 사진 위 전용, `text-wrap: balance` |
| 서브 히어로 h1 | 35.2px / 54.4px | 700 | 1.15 | -0.02em | 현행 |
| 히어로 부제 | 15.2px / 17.6px | 400 | 1.7 | normal | 현행 |
| 서브 히어로 eyebrow | 15.2px / 17.6px | 600 | 1.7 | 0.2em 대문자 | **명시적 규칙으로 고정** |
| 섹션 h2 대 `.section-title` | 32px / 44.8px | 700 | 1.2 | -0.03em | 현행 |
| 섹션 h2 소 | **20.8px** | 700 | 1.3 | -0.01em | clergy 22.4·privacy 16.8·smallgroup 20 통일 |
| CTA h2 | 24px / 33.6px | 800 | 1.25 | 현행 | 어두운 면 위 디스플레이 |
| 리드(홈 소개) | 18.4px / 22.4px | 700 | **1.55** | -0.025em | 1.45→1.55 |
| 카드 제목 대 | 18px | 700 | 1.75(상속) | -0.01em | `--fs-lead` |
| 카드 제목 소 | 16px | 700 | 1.75 | normal | **16.3·16.8px 폐기, 14.4px 제목 승격** |
| 본문 | 16px | 400 | 1.75 | normal | `--fs-body` |
| 장문 본문(예배·소개) | 16px | 400 | **1.9** | normal | 1.95·2.0 정리 |
| 카드·목록 설명 | **15.2px**(14.4/13.6에서 상향) | 400 | 1.75 | normal | 신규 `--fs-desc` |
| UI 텍스트(내비·버튼) | 14.4px | 600 | 1.4~1.75 | normal | `--fs-sm` 유지 |
| 보조 UI(푸터·칩 설명) | 13.6px | 400~600 | 1.55~1.75 | normal | `--fs-md` 유지, 문장 본문 금지 |
| 캡션·라벨 하한 | 12.48px | 400~700 | 1.5 | 0.02em | `--fs-label`, 이보다 작은 값 금지(달력 모바일만 11.2px 예외) |
| 본문 구역 eyebrow | **12.48px**(10.88에서 상향) | 600 | 1.5 | 0.2em 영문 대문자 | CTA·주교 eyebrow도 동일 |
| 한글 기능 라벨 | 12.48px 이상 | 600 | 1.5 | **0.05em 이하** | `.links-group-title`·푸터 h2·`.hero-label` |

굵기 역할: 400 본문, 500 보조 UI, 600 버튼·eyebrow·FAQ 질문, 700 제목, 800은 사진·어두운 면 위 디스플레이(홈 히어로·CTA)에만.
행간 단계: 1(아이콘) / 1.2(큰 제목) / 1.3~1.4(한 줄 UI) / 1.55(여러 줄 제목·리드) / 1.75(본문) / 1.9(장문).
단위: font-size·line-height에 px 없음(현행 유지), rem과 `clamp()`만.

### 6-2. 간격 스케일

| 토큰 | 값 | 용도 |
|---|---|---|
| `--space-1` | 0.25rem(4px) | 아이콘·글자 사이 |
| `--space-2` | 0.5rem(8px) | 칩 내부, 작은 간격 |
| `--space-3` | 0.75rem(12px) | eyebrow 아래, 버튼 사이 |
| `--space-4` | 1rem(16px) | 기본 간격, 문단 사이 |
| `--space-4h` (신규) | 1.25rem(20px) | 카드 그리드 gap, 모바일 gutter 하한 |
| `--space-5` | 1.5rem(24px) | 카드 안쪽(모바일), 블록 사이 |
| `--space-6h` (신규) | 1.75rem(28px) | 모바일 섹션 제목 아래, hero 직후 섹션 위 |
| `--space-6` | 2rem(32px) | 블록 사이 |
| `--space-7` | 2.5rem(40px) | hero 직후 섹션 위(데스크톱), 모바일 섹션 패딩 |
| `--space-8` | 3.5rem(56px) | 섹션 제목 블록 아래(데스크톱), 단독 섹션 하단 |
| `--section-pad` | 6rem(96px) / ≤768px 2.5rem | 섹션 상하 패딩(하나), 섹션 가장자리 자식 margin은 0 |

- 히어로: PC min-height 350px, 모바일 291px(현행 보존). 첫 섹션 padding-top은 `.page-hero + .section`·`.gc-page-nav + .section` 모두 2.5rem(PC)/1.75rem(모바일).
- 컨테이너: `--content-max` 1200px, 좌우 `clamp(1.25rem, 5vw, 2.5rem)`(현행), 읽기 폭 `--content-narrow` 820px(faq·links), `--content-read` 760px(emmaus·privacy·장문).
- 카드: 안쪽 2.5rem 2.25rem(현행), 모바일 1.5rem. 카드 그리드 gap 1.25rem(`--space-4h`).
- 규칙: 새·수정 코드는 위 토큰만 사용하고, 기존 0.4/0.6/0.7/1.1/1.4rem 등은 건드릴 때만 가까운 토큰으로 교체(일괄 치환 금지).
