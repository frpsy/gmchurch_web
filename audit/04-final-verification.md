# 04. 최종 검수 (독립 검증)

- 대상: 브랜치 `improve/ui-consistency` (main `05777d2` 이후 커밋 7개) / 검수일 2026-10-12
- 방법: 코드(`grep -n`, `git diff main`)와 렌더링(Playwright Chromium 헤드리스)으로 대조. main은 별도 worktree로 포트 8001, 현재는 8000. 20페이지 × 360/390/768/1024/1440px(라이트) + 다크 390/1440 = 140조합을 main·현재 양쪽 촬영(280장), 소스 수정 없음.
- 스크립트·원자료: `/tmp/claude-0/-home-claude/aecbfe46-a9d3-53b1-bf88-8b5ab3b19d54/scratchpad/final/` (`scan.py`, `analyze*.py`, `data/*.json`, `sheets/`)
- 환경 한계: 서버 환경 Chromium·Noto CJK 기준. 실제 iOS Safari·안드로이드 기기는 **미확인**. 외부 지도·YouTube 썸네일은 이 환경에서 로드되지 않았거나 요청 오류가 기록되지 않아(main도 동일) 외부 리소스 404 판정은 하지 못했습니다.

## 1. 한 줄 결론

확정 58행(라운드 1~6) 중 **해결 47 / 부분해결 8 / 미해결 3**. 의도적 제외 항목은 사유가 모두 맞고 실제로 손대지 않았습니다. 새로 발견한 문제 **10건(상 0 · 중 3 · 하 7)**. 가로 스크롤·콘솔 오류·깨진 이미지·내부 링크 깨짐·뷰포트 이탈은 **0건**이고, `npm test` 117개 통과입니다.

## 2. 확정 목록 대조 (02-verified-issues.md 3절)

판정 기준: 해결 = 코드와 렌더링 모두 확인 / 부분해결 = 일부만 / 미해결 = 코드 변경 없음.

### 라운드 1 — 토큰·정리

| 항목 | 판정 | 근거 |
|---|---|---|
| TYP/LAY 토큰(`--fs-desc` `--lh-snug` `--space-4h/6h` `--content-read/narrow`) | 해결 | `style.css:73,79,92-95` 정의. `--fs-desc` 19회·`--lh-snug` 4회·`--content-*` 3회 사용. `--space-4h/6h`는 정의만(사용 0회, 기준서의 "신규 코드부터" 정책) |
| DES-07·COL-11 hex 교체 | 해결 | `#163a2e` `#2a5a48`은 0건. `#e3e7d2` `#9b1c1c` `#142c24`는 `:root` 토큰 정의 줄에만 남음(`style.css:99-102`) |
| DES-09 `--radius-xs`/`--lift` | 부분해결 | 토큰 신설(`style.css:107-109`)만 됨. `border-radius: 4px` 8곳(`1268,1580,2073,2119,3804,4910,4929` 등)과 `translateY(-2/-4px)`가 그대로고 토큰 사용 0회 |
| COL-10 `--green-dark` 폴백 | 해결 | `grep green-dark style.css` 0건, `var(--theme)`로 교체 |
| COL-12 흰색 알파 토큰 | 해결(정의만) | `--on-dark-1/2/3` 정의, 사용 0회. 원칙("대비 낮추는 치환 금지")상 문제 없음 |
| COL-13 스크롤 내비 색 | 해결 | 다크 스크롤 시 내비 배경 main `rgba(24,58,47,.97)`로 튐 → 현재 `rgba(9,26,20,.96)` 유지(실측) |

### 라운드 2 — 색·접근성

| 항목 | 판정 | 근거 |
|---|---|---|
| COL-01 `.photo-cat-badge` | 해결 | 흰색 `rgba(255,255,255,.9)` + 오버레이 .88(`style.css:4198,4183`). 다크 390 스크린샷에서 분류 글자 확인 |
| COL-02 지난 날짜 | 해결(부작용 FIN-05) | 실측 main 2.18:1(다크 3.35) → 현재 통과. 다만 지난 날짜가 거의 구분되지 않음 |
| COL-03 `.photo-date`·▶ | 해결 | `.85`, `.6` 코드 확인(호버 때만 보이는 요소라 렌더 측정은 안 됨) |
| COL-05 다크 수상 배지 hover | 해결 | 실측 hover 시 화살표 2.58→4.71, 보조글자 3.15→5.76 |
| COL-06 ↗ opacity | 해결 | 실측 2.98:1 → 통과 |
| COL-04 `.step-num` 글자색 | 미해결 | `style.css:2666` `color: #fff` 그대로(영향 0, 보호 수정이라 낮음) |
| COL-07 달력 ◀▶ | 해결 | `opacity: .9`(`style.css:1171`) |
| DES-01 드롭다운 링 | 해결 | 1440 Tab 순회에서 링 대비 3:1 미만 227곳(2.01:1) → 0곳 |
| DES-03·04 링 제거 7곳 복원 | 해결 | outline 없는 Tab 정지: main 64곳(1440: back-to-top 31, 메뉴 트리거 20, photo-item 4, hero-stat 3, 달력 ◀▶ 등) → 현재 2곳(지도 iframe뿐) |
| NEW-1 본문 링크 밑줄 | 해결(다크 부작용 FIN-02) | `.story-value-text a` `.logo-ref-text a` `.emmaus-contact-link` `.detail-link` `.faq-a-text a` `.privacy-doc a` 모두 `text-decoration: underline` |
| NEW-2·3 skip-link·전역 `border-radius` | 해결 | `style.css:165` 추가, 전역 `:focus-visible`의 `border-radius:3px` 삭제 |
| DES-11 지도 iframe 링 | 부분해결 | 규칙 추가(`style.css:3712`). 이 환경에서 Tab으로 iframe에 포커스가 가도 `:focus-visible`이 매칭되지 않아 링이 그려지지 않음(FIN-09, 외부 지도 로드 불가라 실제 브라우저 결과는 미확인) |

### 라운드 3 — 타이포그래피

| 항목 | 판정 | 근거 |
|---|---|---|
| TYP-01 홈 h1 | 해결 | 390 h1 28→32px, 2줄(`모든 생명을 / 환대하는 교회`), 360×640 버튼·스크롤 표시 겹침 없음 |
| TYP-02 문장 텍스트 15px 미만 | 해결 | 390px 본문 40자 이상 글자 중 15px 미만 비율 **61.3% → 11.3%**(main 16,684자 / 현재 16,635자). 남은 건 출처·각주·`.press-link` 등 보조 텍스트 |
| TYP-03 달력 라벨 등 | 해결 | 라벨 9.92→데스크톱 12px/모바일 11.2px, 범례 11.5px, `.hero-label` 0.12em. 360에서 "그리스도" 등 단어 중간 끊김 0건(캔버스 폭 측정, 10~12월 이동하며 확인). 칸 높이 75→80px |
| TYP-04 eyebrow | 해결 | 본문 eyebrow `--fs-label`, 서브 히어로는 `.page-hero .section-eyebrow` 명시 규칙(`style.css:735-739`) |
| TYP-05 `--lh-snug` | 해결 | `.about-brief-lead` `.faq-q` `.news-post-title` `.video-title` 적용 |
| TYP-06 오프스케일 제목 | 해결 | `1.02/1.05rem` 제목 0건, `.nurture-part-title` 16px |
| TYP-07 h2 2단 | 부분해결 | `.links-group-title`(18px, 자간 0)·`.privacy-h2`(20.8px)는 해결. clergy·smallgroup은 값만 1.3rem으로 맞추고 인라인 유지(`app.js:1079`, `:921`), 계획의 클래스화는 안 됨 |
| TYP-08 `font-family: inherit` | 해결 | 양식 컨트롤 비Pretendard: main 88개 → 0개 |
| TYP-10 소형 값 | 부분해결 | 0.6~0.76rem 대부분 `--fs-label`로. 남음: `.logo-ref-num` 0.68rem(`style.css:1849`), 장식 화살표 `::after` 0.68rem 2곳(`3159,3182`), 달력 라벨 0.75/0.7rem(의도된 예외) |
| TYP-11 행간 1.95·2.0·1.85 | 해결 | `style.css`·HTML·`app.js`에서 0건 |
| TYP-13 한글 라벨 자간 | 해결 | `.footer-col h2` 0.04em, `.hero-label` 0.12em, `.links-group-title` 0 |

### 라운드 4 — 레이아웃

| 항목 | 판정 | 근거 |
|---|---|---|
| LAY-01 class 중복 4곳 | 해결 | `grep` 0건, emmaus·greenchurch 교차 띠 적용(다크 부작용 FIN-02) |
| LAY-02 360px 검색 닫기 | 해결 | 360px 닫기 버튼 right 370 → 344(뷰포트 360 안), 390px 변화 없음 |
| LAY-03 섹션 가장자리 margin | 부분해결 | hopecenter 하단 160→96, links 상단 96→40으로 개선. **worship `#eucharist-order`·`#daily-office`·`#resources`는 160/152px, smallgroup 하단 152px가 main과 동일**(FIN-03) |
| LAY-04 첫 섹션 패딩 | 해결 | links·videos·gallery·sundays 첫 섹션 상단 96→40px(390: 40→28px) |
| LAY-06 낮은 뷰포트 히어로 | 해결 | 568×320에서 히어로 320→560px, 버튼 하단 331→452(잘림 없음) |

### 라운드 5 — 컴포넌트

| 항목 | 판정 | 근거 |
|---|---|---|
| DES-05+TYP-09+LAY-10·11 인라인 | 부분해결 | HTML 인라인 `style=` 55 → 12건. 글자 크기·행간은 토큰화. `app.js` 인라인 58건은 개수 그대로(값만 토큰), 계획의 `.text-desc` 미신설 |
| DES-06 중복 규칙 | 부분해결 | `--section-pad` 사문·`.map-btn` 중복·`.next-step-cta` 사문 삭제. `.btn-hero-primary { font-size }` 재선언 등 나머지는 남음 |
| DES-08 카드 hover 2단계 | 미해결 | `translateY(-6/-5/-4/-3px)` 그대로(`style.css:915,2747,958,2036,2653`) |
| DES-10 버튼 공용 베이스 | 미해결 | 변경 없음 |
| LAY-05 community 링크 정렬 | 해결 | 1024px에서 세 카드 링크 하단 정렬 확인 |
| LAY-07 greenchurch `#intro` | 해결 | `.section--tight-bottom`, 인라인 제거 |
| LAY-08 clergy 흰 배경 | 해결 | `.section--white` |
| LAY-09 읽기 폭 | 해결(부작용 FIN-01) | links 860→820 적용, 카드 폭 384→364px |

### 라운드 6 — 텍스트·정리

| 항목 | 판정 | 근거 |
|---|---|---|
| TXT-01·13 별표·책 부호 | 해결 | `greenchurch.html:417` `『동물신학』(<em>Animal Theology</em>)`, 렌더에서 별표 사라짐 |
| TXT-03 첫날 | 해결 | `:117` |
| TXT-04 공백 | 해결 | `:120` 한 줄로 합침 |
| TXT-05 줄표 | 해결 | clergy·greenchurch·emmaus 세 곳 ` — ` |
| TXT-06 4주분 | 해결 | `data.js:1175` |
| TXT-49 `&nbsp;` | 해결 | `app.js:2547` |
| TXT-08 녹색교회 | 해결 | "녹색 교회" 0건 |
| TXT-09 창조세계 | 해결 | "창조 세계" 0건 |
| TXT-10 초대교회 | 해결 | "초대 교회" 0건 |
| TXT-12 성공회 선교정신·람베스 회의 | 해결 | 0건 |
| TXT-16 네이버 지도 | 해결 | "네이버지도" 0건 |
| TXT-42~48 줄바꿈 | 해결 | 제목·푸터 주소·카드 이름의 마지막 줄 3글자 이하 고아: main 52건 → 현재 0건(전 해상도). 부작용은 FIN-04 |
| TYP-14 news h2 | 해결 | `app.js:2128` |
| TYP-12 중복·동일 값 | 부분해결 | `.map-btn` 중복 삭제됨, `.btn-hero-primary` 재선언(`style.css:655`) 남음(원래도 일부만 검증) |
| LAY-13 죽은 CSS·문서 | 해결 | `.lectionary-cal`·모바일 `--section-pad`·`.next-step-cta` 4rem 삭제 확인 |
| DES-12 `ARCHITECTURE.md` 수치 | 해결 | 7rem→6rem, 306→291px 정정. 줄 수는 5382로 적었으나 실제 5381(1줄 차이) |

### 의도적 제외 (사유 확인)

| 항목 | 확인 결과 |
|---|---|
| LAY-12, DES-11 Tab 정지 수, TXT-02·15·17·35 (4절 보류) | 사유 타당(디자인 판단/규범 근거 없음/주보 원문 인쇄). 코드 변경 없음 확인(`이야기가 나누고` 1건·"감사드립니다." 그대로) |
| TXT-11·38 (선택 통일) | 규범상 둘 다 허용이라 보류 타당. "세계 성공회" `data.js` 4건·"성모마리아 송가" 그대로 |
| TXT-14·18 (대량 치환 위험) | 타당. `data.js` diff는 6줄뿐 |
| 교회소식 `data.js:1185-1192`·`data/bulletin-news.json` | 매주 sync가 갱신하므로 제외 타당, diff에 없음 |
| 확인 필요 Q1~Q17 | 전부 미변경(35세/37세 등 확인). 단 Q15(람베스/램베스)는 TXT-12 때문에 띄어쓰기만 바뀜. 철자 `람베스`는 그대로라 질문은 유효 |
| D1~D4 | D1은 문서와 실제가 다름(FIN-08): 모바일 달력 라벨이 "현행 유지"가 아니라 9.92→11.2px로 바뀜. 360에서 깨짐은 없음(위 TYP-03) |

## 3. 회귀 점검 (main 대비)

| 점검 | main | 현재 | 판정 |
|---|---|---|---|
| (a) 문서 가로 스크롤(140조합) | 0 | 0 | 이상 없음 |
| (b) 콘솔 오류·페이지 오류 | 0 | 0 | 이상 없음 |
| (c) 깨진 이미지·로컬 404 | 0 | 0 | 이상 없음(`src`가 빈 `<img>`가 페이지마다 1개(bulletin·gallery는 2개) 있으나 main도 동일, 원인은 미확인) |
| (d) 내부 링크(로컬 html·앵커, 1440 기준 20페이지 합계 1,859개) | 깨짐 0 | 깨짐 0 | 이상 없음 |
| (e) 뷰포트 밖으로 나간 요소 | 0 | 0 | 이상 없음 |
| (f) 텍스트 잘림·컨테이너 밖 글자 | 0 | 0 | 이상 없음(`overflow:hidden`에 걸린 건 `sr-only` h2뿐, 양쪽 동일) |
| (f) 글자 겹침(줄 단위 사각형 검사 5해상도) | 0 | **2**(links 1024·1440) | FIN-01 |
| (f) 360px 달력 칸, 히어로 버튼, 푸터 주소, 갤러리 필터 | - | 이상 없음 | 단어 끊김 0, 버튼이 칸·뷰포트 안, 푸터 주소 2줄 균형, 필터 버튼 줄 정렬 정상 |
| (f) 카드 그리드 | - | 이상 없음 | worship·community·clergy·newcomer·emmaus·greenchurch 육안 확인 |
| 줄바꿈 고아(마지막 줄 3자 이하) | 52 | 0 | 개선 |

변경 영향이 의도 범위(글자 크기 상향, 인라인→클래스, 포커스 링, 섹션 여백)를 넘은 곳은 스크린샷(390 전 페이지 main|현재 비교, 1440·1024·360·다크 선별)에서 **세 곳**이었고 FIN-01·02·05로 정리했습니다. 나머지 페이지 높이 변화는 모두 의도된 범위입니다(index +56, clergy +433, greenchurch +474 등은 글자 상향 영향, videos·gallery -37~-51은 LAY-04, hopecenter -35~-62는 LAY-03).

## 4. 대비 재측정 (WCAG, 일반 4.5:1 / 큰 글자 3:1)

방법: 보이는 텍스트 노드의 계산된 색과 조상 배경을 합성해 비율 계산. 조상에 배경 이미지·그라데이션이 있으면 "수동 확인"으로 분리. 호버·포커스 상태와 `opacity:0`인 갤러리 오버레이는 여기서 측정되지 않아 별도 확인(위 COL 항목).

| 조건 | main 미달 | 현재 미달 | 새로 생긴 미달 | 해소 |
|---|---|---|---|---|
| 라이트 390 | 18 | 4 | 0 | 14 |
| 라이트 1440 | 18 | 4 | 0 | 14 |
| 다크 390 | 14 | 12 | **12** | 14 |
| 다크 1440 | 14 | 12 | **12** | 14 |

- 라이트 "현재 4건"은 홈 히어로 글자(`#hero-label` `#hero-sub` `.btn-outline` `#hero-title`)로, 사진 `<img>` 위라 배경 감지가 안 된 **오탐**입니다(main도 동일, 디자인 점검에서도 사진 위라 3:1 이상으로 이미 오탐 처리). 실제 라이트 미달은 14 → **0**.
- 해소된 14건: `.lit-cal-num/.lit-cal-label`(2.18:1, 다크 3.35) · `.lectionary-ref-ico`(2.98, 다크 2.84).
- 수동 확인 대상(사진·그라데이션 위 글자): 390 148개 / 1440 139개로 main과 동일. 이 중 값이 바뀐 건 `.photo-cat-badge`·`.photo-date`·`.hero-label` 자간뿐이며 코드상 대비는 올라감(사진 위 최악 합성 배경 약 `#2a3c35` 위 흰색 .9 → 8:1 이상, 계산).
- **현재 미달 상위(전부 같은 원인)**: 다크 `greenchurch` 하단 출처 링크 12개(`Vatican 공식 문서`, `Anglican Alliance`, `greenchrist.org` 등), 13.6px, `#66a284` on `#263d32`, **3.92:1** → FIN-02. 라이트 상위 미달은 오탐 4건 외 없음.
- 같은 요소의 대비 하락(통과 유지): 라이트 `.section-eyebrow`/링크 7.13~7.73 → 6.73(링크를 `--theme`로 통일한 결과), 다크 `.gc-section-alt` 안 본문 7.27 → 4.80(띠 배경이 밝아짐), 홈·방문 `.map-btn-arrow` 5.87 → 4.81. 모두 4.5 이상이나 다크 4.80은 여유가 적음.

### 포커스 링 (1440 Tab 순회, 라이트·다크)

| | main | 현재 |
|---|---|---|
| 포커스 정지 수(라이트 / 다크) | 1,019 / 1,072 | 999 / 934(드롭다운 노출 타이밍이 실행마다 달라 총수는 비교 불가, 아래 참고) |
| outline 없음(박스섀도도 없음) | 라이트 64 / 다크 61 | **2 / 2**(둘 다 `iframe.map-embed`) |
| 링 대비 3:1 미만(배경 감지 가능분) | 라이트 229(드롭다운 227 + 홈 히어로 버튼 2) | 라이트 2(홈 히어로 버튼, 사진 위 오탐) / 다크 0 |

390px Tab 정지 순서·개수는 main과 같음. 1440에서 정지 수가 페이지마다 다른 것은 상단 메뉴 드롭다운 항목이 실행마다 Tab 순서에 들어오거나 빠지기 때문이며, giving·index·community를 main·현재 각 2회 반복한 결과 main과 현재가 같은 패턴이라 이번 변경과 무관합니다(원인은 미확인).

## 5. 접근성·표기 규칙 / 테스트

| 점검 | 결과 |
|---|---|
| `npm test` | 9파일 117개 통과(파일 변경 없음) |
| 이모티콘 | `git diff main` 추가 줄에서 0건 |
| 하드코딩 hex | 새 값은 토큰 정의 줄(`--ink-on-*` 등)과 `#fff` 4건(skip-link·달력 ◀▶·갤러리 닫기·메뉴 트리거 포커스, 항상 어두운 면 위). `#fff` 총수 52→55로 기존 관행과 같으나 FIN-10 |
| 다크 규칙(`:hover`/`:focus` 포함) | `.about-brief-award:hover` 다크 해소. 새 링크 색은 FIN-02 |
| 캐시 버스터 | 20페이지 모두 `?v=20261012f`로 일치 |
| `ARCHITECTURE.md` 클래스 목록 | 신규 `.text-note` `.prose-list` `.privacy-*` `.section--tight-bottom` `.container--read` 미기재(FIN-08) |

## 6. 새로 발견한 문제

| ID | 페이지 | 위치 | 현상 | 증거 | 제안 수정 | 심각도 |
|---|---|---|---|---|---|---|
| FIN-01 | links | `style.css:3939-3955`(`.links-card-name`, `.links-card-arrow`), `links.html:51` | LAY-09로 컨테이너가 860→820px이 되어 카드 폭 384→364px. "대한성공회 성 프란시스 수도회(네이버 지도)"가 한 줄로 우상단 ↗ 아이콘에 닿아 5px×13px 겹침(1024·1440) | 줄 단위 글자 사각형 검사 2건(main 0건), 카드 캡처 `final/links_card_cur.png`(main은 여백 있음) | `.links-card-name { padding-right: 1.5rem; }`(화살표 폭만큼) | 중 |
| FIN-02 | greenchurch(다크). emmaus는 해당 요소 없음 | `style.css:859-863`(다크 `.gc-section-alt`), `:3684` `.logo-ref-text a` | LAY-01로 `.gc-section-alt`가 처음 적용되며 다크에서 띠 배경이 `#263d32`로 밝아짐. 그 위 NEW-1 링크(`--theme #66a284`) 12개가 3.92:1(13.6px). 밝아진 띠 위 본문도 7.27→4.80. 기존 주석(`:861`)이 eyebrow만 보정 | 다크 390·1440 대비 측정, 스크린샷 `sheets/greenchurch_390_dark_2.png` | 같은 다크 블록에 `.section.gc-section-alt a:not(.btn) { color: color-mix(in srgb, var(--theme) 60%, var(--heading)); }` 추가(eyebrow와 같은 방식). 또는 다크 띠 배경을 `--green-light` 계열로 낮춤 | 중 |
| FIN-03 | worship, smallgroup | `style.css:2321-2324` `.liturgy-guide { margin: 4rem auto 0 }`, `:2589` `.liturgy-section { margin-bottom: 3.5rem }`, 가장자리 규칙 `:5173-5176` | LAY-03 미해결. 새 규칙이 `.container > :first-child`와 그 자식까지만 닿아, 두 단계 안쪽의 `.liturgy-guide`(margin-top 64px)와 가장자리 `.liturgy-section`(margin-bottom 56px)에는 적용되지 않음. worship `#eucharist-order` `#daily-office` `#resources` 상 160/하 152px(390: 64/76), smallgroup 하 152px로 main과 동일 | 섹션 내부 여백 측정(`data/gaps.json`), DOM 확인: `DIV.container > DIV > DIV.liturgy-guide` | `.section .container > :first-child > .liturgy-guide:first-child { margin-top: 0 }`와 `.section .liturgy-section:last-child { margin-bottom: 0 }`처럼 한 단계 더 깊은 선택자를 추가. 적용 후 worship·smallgroup 재측정 | 중 |
| FIN-04 | index | `style.css:119-120`(`h1,h2,h3,h4 { text-wrap: balance }`), 홈 "다가오는 주일" 카드 제목 | balance가 날짜 사이에서 줄을 나눔. 390px에서 "다가오는 주일 · 10월 / 18일 연중 제29주일"(main은 "…10월 18일 연중 / 제29주일") | 390 비교 `sheets/index_390_0.png` | 날짜를 `<span class="nowrap">10월 18일</span>`로 묶거나 `white-space: nowrap`(렌더러에서 날짜 부분만). 급하지 않음 | 하 |
| FIN-05 | sundays | `style.css:1203-1204` | COL-02 수정으로 지난 날짜가 사실상 구분되지 않음. `--text-muted`(7.7:1)와 `--heading`(14:1)의 차이가 작고, 배경 틴트도 지난 일요일이 앞으로 올 일요일과 같음 | 1440·390 달력 비교(`final/cal1440.png`: 1~10일이 13일 이후와 거의 같은 농도) | 대비 4.5:1을 유지하는 선에서 구분을 주기(예: `color-mix(in srgb, var(--text-muted) 85%, var(--cream))` 정도로 5:1 부근 + 지난 칸 틴트 연하게) | 하 |
| FIN-06 | 전체 | `style.css:915,2747,958,2036,2653`(카드 hover), `:2666`(`.step-num`), 버튼 규칙 | 확정 목록 중 미이행: DES-08 카드 hover 이동 2단계, DES-10 버튼 공용 베이스, COL-04 `.step-num` 글자색, DES-09의 4px·`translateY` 토큰 이관(토큰은 사용 0회). 커밋 메시지에도 언급이 없어 의도된 제외로 볼 근거가 없음 | 코드 대조(2절) | 이번 PR에서 제외한다면 `02-needs-confirmation.md` C절에 후속 작업으로 기록. 하려면 DES-08은 `--lift-2`로 통일, `.step-num`은 `var(--theme-on)` | 하 |
| FIN-07 | clergy, smallgroup, 전체 | `app.js:1079`, `:921` 인라인 `font-size:1.3rem`, `style.css:1849` `.logo-ref-num` 0.68rem, `app.js` 인라인 `style=` 58건 | TYP-07·09·10이 값만 맞추고 클래스화·소형 값 정리는 일부 남음 | 코드 대조 | `.section-title--sub`(1.3rem) 클래스 신설 후 인라인 교체, `.logo-ref-num`을 `--fs-label`로 | 하 |
| FIN-08 | 문서 | `style.css:1275`(옛 주석 "8.8px → 9.9px", 실제 11.2px), `ARCHITECTURE.md`, `audit/02-needs-confirmation.md` D1 | 주석·문서가 실제와 다름: 모바일 달력 라벨 0.7rem 주석이 옛 값. D1은 "모바일 현행 유지"라 썼으나 실제로 바뀜. 신규 클래스 5종과 `gc-section-alt` 미기재. 줄 수 5382(실제 5381) | 코드 대조 | 주석 수정, D1 문구를 "모바일 11.2px 적용"으로, 클래스 표에 추가 | 하 |
| FIN-09 | index, visit | `style.css:3712` `.map-embed:focus-visible` | Tab으로 지도 iframe에 포커스해도 이 환경에서는 `:focus-visible` 매칭이 안 되어 링이 그려지지 않음(`outline 0px`, 20페이지 중 index·visit). 외부 지도가 로드되지 않는 환경이라 실제 Chrome·Safari 결과는 미확인 | Tab 순회 기록 `iframe.map-embed fv:false` | 실기기에서 확인 후, 안 보이면 `.map-card:focus-within { outline: ... }`처럼 부모 박스에 링 | 하 |
| FIN-10 | 전체 | `style.css:165,1178,4331`(skip-link, 달력 ◀▶, 갤러리 닫기. 메뉴 트리거 `:282`는 기존 `#fff` 재사용) | 새 포커스 규칙에 `#fff` 하드코딩 3건 추가(+기존 규칙 재사용 1건). 항상 어두운 면 위이고 기존 `#fff`가 52곳이라 관행과 같지만 CLAUDE.md 하드코딩 금지 문구와는 어긋남 | `git diff main` | `--on-dark-1` 대신 `var(--white)`가 다크에서 바뀌므로, 고정 흰색 토큰(예: `--on-dark-0: #fff`)을 두고 사용 | 하 |

심각도 집계: 상 0 / 중 3 (FIN-01, 02, 03) / 하 7.

## 7. 미확인

- 실기기(iOS Safari·안드로이드) 렌더링, 갤러리 오버레이의 터치 기기 표시(D4).
- 지도 iframe 포커스 링의 실제 브라우저 동작(FIN-09), 외부 리소스(YouTube 썸네일 등) 404.
- 호버·포커스·`opacity:0` 오버레이 상태의 대비 전수 측정(COL-01·03은 코드와 스크린샷 확인까지). 사진·그라데이션 위 글자 148/139개는 수동 확인 대상.
- 다크 390·1440 이외 해상도의 대비, 인쇄 스타일.
- 1440 상단 드롭다운 항목이 Tab 순서에 들어왔다 빠지는 원인(main과 동일 현상).
- 부수 작업: 지시에 따라 `git worktree add`로 만든 `.../final/main_wt`가 `.git/worktrees`에 등록돼 남아 있고 포트 8001 서버가 켜져 있음. 정리하려면 `git worktree remove`가 필요하나 git 조작 금지 규칙에 따라 실행하지 않음.
