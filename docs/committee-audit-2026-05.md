# 광명교회 홈페이지 — 위원회 audit 보고서 (현재 코드베이스 반영)

> **작성일**: 2026-05-25  
> **업데이트**: 2026-05-27 (P0 완료 반영)  
> **저장소**: `frpsy/gmchurch_web` (main 브랜치 점검)  
> **배포**: `https://frpsy.github.io/gmchurch_web` (GitHub Pages)  
> **현 구조**: 빌드 없는 정적 사이트 (HTML 7개 + Vanilla JS 2개 + CSS 1개, 총 ~3,050줄)

-----

## 0. 전체 인상 — 위원회 합의

**현 코드베이스 수준은 예상보다 매우 높습니다.** 다음과 같은 강점이 명확합니다:

- ✅ **데이터/렌더링/스타일 분리가 깔끔**: `data.js`(single source of truth) + `app.js`(렌더러) + `style.css`(스타일) 구조가 SOLID 원칙을 의식하고 작성됨
- ✅ **전례력 자동 계산**: Meeus/Jones/Butcher 알고리즘으로 부활절 산출 → 8개 절기 자동 매핑은 한국 교회 홈페이지 중 드문 수준
- ✅ **빌드 없는 정적 사이트**: Netlify 자동 배포, 비기술자도 `data.js`만 편집하면 콘텐츠 수정 가능
- ✅ **CSS 변수 기반 디자인 토큰**: `--green-deep`, `--cream` 등 일관된 팔레트
- ✅ **CLAUDE.md 문서화 수준 우수**: 다른 개발자(또는 AI)가 즉시 작업 가능한 구조

**즉, 첫 미팅 결과서(`광명교회_홈페이지_위원회_미팅결과.md`)에서 제안했던 “Next.js + TypeScript + CMS”는 과잉 설계였습니다.** 현 vanilla 구조가 이 규모 교회 홈페이지에 더 적합합니다. 아래 audit은 **현 구조를 유지하면서 개선할 항목**에 초점을 둡니다.

-----

## 1. 첫 미팅 제안 → 현 코드베이스 매핑 (제안 자체 점검)

|첫 미팅 제안                           |현 상태                     |결론                                     |
|----------------------------------|-------------------------|---------------------------------------|
|Next.js + TypeScript + Tailwind 권장|빌드 없는 vanilla HTML/CSS/JS|❌ **제안 철회** — 현 구조 유지                  |
|shadcn/ui 컴포넌트 시스템                |CSS 변수 + 자체 클래스          |❌ **제안 철회** — 이미 일관된 시스템 존재            |
|헤드리스 CMS (Sanity/Strapi)          |`data.js` 단일 객체 편집       |⚠️ **장기 검토** — 현재는 사제가 직접 git 편집 가능하면 충분|
|MDX for 콘텐츠                       |data.js 객체 필드            |⚠️ **장기 검토** — 설교 아카이브 늘어나면 그때          |
|8개 대메뉴 사이트맵                       |6개 메뉴 + 22개 앵커           |✅ **현 구조 적정** — 메뉴 늘리지 말고 콘텐츠 깊이       |

**위원회 합의**: 첫 미팅서의 Phase 1/2/3 우선순위는 유지하되, 기술 스택 권장사항은 폐기. **“현재 vanilla 정적 사이트 구조를 유지하면서 누락된 페이지·기능·품질만 채워넣는다”** 원칙.

-----

## 2. 코드베이스 점검 결과 (체크리스트)

### 2.1 SEO·메타데이터

|항목                                  |상태|비고                           |
|------------------------------------|--|-----------------------------|
|`<title>` 페이지별 설정                   |✅ |6개 페이지 모두 적절                 |
|`<meta description>`                |✅ |모든 페이지 존재                    |
|`<html lang="ko">`                  |✅ |                             |
|Open Graph 태그 (og:title, og:image 등)|✅ |`og-image-v2.png` (1200×630) 적용, KakaoTalk 확인|
|Twitter Card 태그                     |✅ |summary_large_image 적용        |
|`robots.txt`                        |✅ |완료                           |
|`sitemap.xml`                       |✅ |7개 페이지 등록 (privacy.html 포함) |
|JSON-LD 구조화 데이터 (`Church`, `Place`) |✅ |index.html Church 스키마 삽입     |
|캐노니컬 URL (`<link rel=”canonical”>`) |✅ |6개 HTML 모두 적용               |
|파비콘                                 |✅ |`favicon.svg` 캔터베리 십자가       |
|애플 터치 아이콘                           |✅ |`apple-touch-icon.png` 180×180 |
|`theme-color` 메타                    |✅ |`#163d24` 적용                 |

**우선순위 ★★★**: OG 태그는 카카오톡 공유가 교회 홍보의 주 채널이므로 즉시 추가 필요.

### 2.2 접근성 (a11y)

|항목                                      |상태|비고                                                      |
|----------------------------------------|--|--------------------------------------------------------|
|`<html lang="ko">`                      |✅ |                                                        |
|`<h1>` 페이지별 1개                          |✅ |6개 페이지 모두 정확히 1개                                        |
|시맨틱 태그 사용 (nav, section, header, footer)|✅ |27회 사용                                                  |
|**`<main>` 태그**                         |✅ |7개 페이지 모두 `<main id="main-content">` 적용                |
|ARIA 속성 (aria-label, aria-expanded 등)   |✅ |app.js에서 다수 사용 (햄버거 메뉴 등)                              |
|`:focus` 스타일                            |✅ |`:focus-visible` 스타일 적용 (그린 outline)                    |
|`:focus-visible`                        |✅ |완료                                                      |
|`prefers-reduced-motion` 대응             |✅ |1회 정의 (Ken Burns 애니메이션)                                 |
|이미지 `alt` 속성                            |⚠️ |HTML에 `<img>` 자체가 거의 없음 (SVG 인라인 위주) — 큰 문제 아님          |
|색 대비비 (WCAG AA)                         |🔍 |별도 검증 필요 — `#0a1f12` on `#f7f4ed`는 통과 추정               |
|키보드 네비게이션                               |✅ |`.nav-chevron`은 `<button>` — Enter/Space 동작               |
|Skip to main content 링크                 |✅ |7개 페이지 모두 추가                                            |
|폰트 크기 조절 토글                             |❌ |고령 신자 위해 검토 가치                                          |

**우선순위 ★★★**: `<main>` 태그 추가, `:focus-visible` 스타일 추가는 즉시 가능한 큰 개선.

### 2.3 성능

|항목                                 |상태 |비고                                                  |
|-----------------------------------|---|----------------------------------------------------|
|Pretendard CDN preconnect          |✅  |`<link rel="preconnect">` 적용                        |
|폰트 preload                         |✅  |preload + crossorigin 적용                                |
|`font-display: swap`               |🔍  |Pretendard 기본값 확인 필요                                |
|CSS·JS 미니파이                        |❌  |정적 사이트라 빌드 단계 없음 — Netlify asset optimization 켤 수 있음|
|이미지 최적화                            |N/A|외부 Unsplash 이미지 1개만 사용 (hero)                       |
|Hero 이미지 lazy load                 |❌  |LCP 이미지라 오히려 preload 권장                             |
|Google Maps iframe `loading="lazy"`|✅  |app.js에 적용됨                                         |
|캐시 헤더 (`_headers` Netlify)         |🔍  |Netlify 기본값 적용 중일 것                                 |
|Service Worker (PWA)               |❌  |검토 가치 — 오프라인 주보 열람 등                                |

**우선순위 ★★**: 폰트 preload 추가, Netlify asset optimization 활성화는 빠른 개선.

### 2.4 모바일·반응형

|항목                            |상태|비고                                  |
|------------------------------|--|------------------------------------|
|뷰포트 메타 (viewport-fit=cover 포함)|✅ |iPhone 노치 대응                        |
|모바일 미디어 쿼리                    |✅ |`@media (max-width: 768px)`, `480px`|
|iPhone safe-area-inset 대응     |✅ |`@supports (padding: env(...))`     |
|햄버거 메뉴                        |✅ |app.js로 토글                          |
|터치 타겟 44x44px                 |🔍 |nav-chevron 등 별도 측정 필요              |
|가로 스크롤 방지                     |🔍 |모바일에서 별도 확인 필요                      |

### 2.5 보안·운영

|항목                    |상태 |비고                           |
|----------------------|---|-----------------------------|
|HTTPS                 |✅  |Netlify 자동                   |
|외부 링크 `rel="noopener"`|✅  |MapHelper에서 적용               |
|CSP 헤더                |❌  |`_headers` 파일로 Netlify 설정 가능 |
|폼 제출                  |N/A|현재 폼 없음 (새가족 등록 폼 추가 시 검토)   |
|환경변수 노출               |N/A|환경변수 자체 없음                   |
|개인정보 처리방침 페이지         |✅  |`privacy.html` 작성 완료, 푸터 링크 추가   |

### 2.6 콘텐츠·정보 정합성

|항목                   |상태|비고                                                                                                        |
|---------------------|--|----------------------------------------------------------------------------------------------------------|
|교회 주소                |✅ |”경기도 광명시 아방리 2길 10” — 사제 확인 완료. 우편번호(14335)·지번(노온사동 373-1) 추가|
|우편번호                 |✅ |`14335` 추가                                                                                                |
|사업자(고유번호)·교회 등록번호    |❌ |헌금 페이지에 기부금 영수증 안내 텍스트 추가 (receiptInfo)                                                                    |
|지도 링크                |✅ |카카오맵 Android 딥링크 이슈로 Naver Maps + Google Maps로 교체. 푸터 주소 → 네이버지도 링크|
|사제 연락처 노출            |✅ |이메일(mailto:) 링크로 변경                                                                                       |
|이메일 노출               |⚠️ |`bsyg2000@hanmail.net` — 스팸 봇 크롤링 대상, 난독화 장기 검토                                                           |
|전례력 8절기 매핑           |✅ |대한성공회 기도서 기준 정확                                                                                           |

**우선순위 ★★★**: 주소 정확성 즉시 확인 필요. 검색·내비게이션·신뢰도에 직결.

### 2.7 사이트맵 누락 페이지 (첫 미팅 제안 대비)

현재 6개 페이지 (index, clergy, worship, community, visit, giving)로 운영 중. 첫 미팅 Phase 1 MVP 대비 누락:

|페이지·기능         |상태|우선순위|비고                                          |
|---------------|--|----|--------------------------------------------|
|처음 오셨나요? 전용 페이지|⚠️ |★★  |worship.html#newcomer로 부분 커버 중. 별도 페이지 가치 검토|
|공지사항           |❌ |★★★ |**가장 큰 누락** — 교회 운영 핵심                      |
|주보 아카이브        |❌ |★★★ |PDF 링크 모음이라도 시급                             |
|설교 영상·원고       |❌ |★★  |유튜브 라이브 URL 1개만 있음                          |
|교회 캘린더         |❌ |★★  |일정 공유 핵심                                    |
|새가족 등록 폼       |❌ |★★  |Netlify Forms로 무빌드 구현 가능                    |
|사진 갤러리         |❌ |★   |                                            |
|봉사부서·구역 안내     |❌ |★   |community.html에 통합 가능                       |
|개인정보 처리방침      |✅ |★★★ |`privacy.html` 완료                            |
|사이트맵·푸터 링크     |⚠️ |★   |FooterRenderer에 일부 있음                       |

-----

## 3. 위원회 관점별 추가 코멘트

### 3.1 사제단 코멘트

- ✅ **전례력 자동화 우수**: 절기 자동 표시는 다른 교회에 자랑할 만한 수준
- ⚠️ **주일 성서정과(Lectionary) RCL Year A/B/C 연동** 권장: 현 절기 정보 옆에 “오늘의 말씀(이사 ◯장, 시편 ◯편, 골로새 ◯장, 마태 ◯장)” 추가
- ⚠️ **시카고-램베스 4개조** 신앙고백 페이지 검토 (“성공회란?” 섹션 보강)
- ⚠️ **평일 성무일도(아침·저녁기도) 시간표** 누락 — 현재 worship.html은 주일 성찬례만

### 3.2 기존 신자 코멘트

- ✅ 사제 소개·연락처가 명확함
- ❌ **주보·공지사항이 없어 매주 갱신할 동적 콘텐츠가 부재** — 신자가 다시 방문할 이유가 약함
- ❌ **카카오톡 채널·오픈채팅 링크 누락** — sns 객체에 추가 가능

### 3.3 새신자 코멘트

- ✅ “처음 오시는 분” 콘텐츠가 worship.html#newcomer에 있음 (성공회 전례·예배 순서·영성체·체크리스트)
- ⚠️ **메인 페이지 hero에 “처음 오셨나요?” CTA 버튼 없음** — 현재 3개 버튼은 “교회 소개·예배 안내·오시는 길”
- ⚠️ **FAQ 형식 콘텐츠** 추가 가치: 비신자도 성찬 받을 수 있나요? 헌금은 꼭? 복장은?
- ✅ 주소·지도·버스·주차 안내가 visit.html에 잘 정리됨

### 3.4 웹 전문가 코멘트 (수정·구체화)

- ✅ **코드 품질 우수**: SOLID 원칙 의식한 렌더러 구조, CSS 변수 토큰화, 명확한 책임 분리
- ⚠️ **타입 안정성**: TypeScript 마이그레이션은 과잉. 대신 `data.js` 상단에 JSDoc `@typedef`로 스키마 명시 권장
- ⚠️ **테스트 부재**: 앵커 검증 스크립트만 있음. Playwright로 6페이지 스모크 테스트 1개만 추가해도 큰 안전망
- ⚠️ **린트·포맷터**: ESLint·Prettier 설정 누락 — `.editorconfig`만이라도 추가
- ⚠️ **app.js ~807줄**: 임계점 근접. 추후 페이지별 렌더러 분리 검토 (지금은 ok)
- ⚠️ **style.css ~1443줄**: 마찬가지. CSS layer(@layer)로 구조화 또는 페이지별 분리 검토

### 3.5 신자 회장 코멘트

- 개발 비용·운영 부담 대비 효율 매우 좋음
- 사제·간사가 `data.js` 직접 편집할 수 있도록 **편집 가이드 1페이지** 작성 필요
- GitHub MCP를 통한 PR 워크플로가 정착되면 비기술자도 안전하게 콘텐츠 수정 가능

-----

## 4. Claude Code 작업 지시

### 4.1 즉시 처리 (Phase 0 — 1주 이내)

`docs/claude-code-tasks/` 디렉토리에 다음 작업들을 개별 PR로 분리해 진행:

**P0-1. SEO·공유 메타 추가** (예상 30분)

- 6개 HTML 모두에 OG 태그 추가 (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`, `og:locale=ko_KR`, `og:site_name`)
- Twitter Card (`summary_large_image`)
- 캐노니컬 URL
- `theme-color` 메타 (브랜드 그린 `#163d24`)
- 애플 터치 아이콘 (`favicon.svg` 베이스로 PNG 생성하거나 SVG 그대로)
- **OG 이미지** 1200×630 만들기 — 광명교회 로고 + “대한성공회 광명교회” + 슬로건. `og-image.png`로 저장
- 메타값은 `data.js`에서 끌어오지 말고 HTML에 직접 작성 (크롤러는 JS 실행 안 함)

**P0-2. robots.txt + sitemap.xml** (예상 15분)

- 정적 파일로 작성. 6페이지만 등록
- `Sitemap: https://gmchurchweb.netlify.app/sitemap.xml` robots.txt에 명시

**P0-3. JSON-LD 구조화 데이터** (예상 30분)

- index.html에 `Church` 스키마 (name, address, telephone, geo, sameAs[유튜브·인스타·블로그], openingHoursSpecification)
- visit.html에 동일하게
- 사제 소개에 `Person` 스키마 (clergy 배열 기반)

**P0-4. 접근성 즉시 개선** (예상 1시간)

- 6개 HTML에서 콘텐츠 영역을 `<main>`으로 감싸기
- `<a href="#main" class="skip-link">본문 바로가기</a>` 추가 (CSS로 sr-only, focus 시 표시)
- style.css에 `:focus-visible` 스타일 추가 (브랜드 그린 outline)
- nav-chevron이 키보드(Enter/Space)로 동작하는지 확인

**P0-5. 주소·연락처 정확성 확인** (사제 확인 필요, 코드 작업 후)

- “아방리 2길 10” 정확한 행정동·도로명 확인
- 우편번호 추가
- 좌표(37.4757, 126.8641)도 실제 위치 일치 검증
- `data.js` info 객체 업데이트

**P0-6. 개인정보 처리방침 페이지** (예상 1시간)

- `privacy.html` 신규 작성
- 수집 항목: 새가족 등록 폼 만들 때 본격화. 현재는 “전화·이메일 문의 시 수집되는 정보, 보유 기간, 제3자 제공 없음” 정도
- 푸터에 링크 추가

### 4.2 단기 (Phase 1 — 2~4주)

**P1-1. 공지사항 페이지** (`news.html` + `CHURCH_DATA.news` 배열)

- 최소 형태: 제목·날짜·본문(짧은 HTML 또는 마크다운 문자열)·태그
- 최신 3개를 index.html 메인에도 노출

**P1-2. 주보 아카이브** (`bulletin.html`)

- `CHURCH_DATA.bulletins`: `[{ date, title, pdfUrl, thumbnail? }]`
- 최근 12주 노출, 그 이상은 “더 보기”로 페이지네이션 또는 연도별 그룹
- PDF는 Netlify에 `/bulletins/2026/2026-05-25.pdf` 식으로 저장

**P1-3. 메인 hero CTA 재구성**

- 4번째 버튼 “처음 오셨나요?” 추가 → `worship.html#newcomer`로 이동
- 또는 처음 오시는 분 전용 페이지 `firsttime.html` 분리 검토

**P1-4. 평일 성무일도 시간표 추가**

- `CHURCH_DATA.worship.daily` 배열 추가
- worship.html에 섹션 추가

**P1-5. RCL 성서정과 표시**

- worship.html 현재 절기 배지 옆 또는 별도 카드에 이번 주 4개 성서정과 표시
- `CHURCH_DATA.lectionary` 또는 별도 `lectionary.js` 모듈
- Year A/B/C 자동 계산 (2025-26은 Year C)

### 4.3 중기 (Phase 2 — 1~3개월)

- **새가족 등록 폼** (Netlify Forms 무빌드 구현)
- **설교 아카이브** (유튜브 영상 임베드 + 원고)
- **교회 캘린더** (Google Calendar embed 또는 자체 렌더)
- **사진 갤러리**
- **카카오톡 채널 등 SNS 확장**

### 4.4 보고 형식

이 audit 보고서를 저장소에 커밋해 작업의 기준 문서로 삼습니다:

```
docs/
├── committee-audit-2026-05.md  (이 문서)
├── claude-code-tasks/
│   ├── P0-1-og-meta.md
│   ├── P0-2-sitemap.md
│   ├── P0-3-jsonld.md
│   ├── P0-4-a11y.md
│   ├── P0-6-privacy.md
│   ├── P1-1-news.md
│   ├── P1-2-bulletin.md
│   └── ...
└── content-editing-guide.md   (비기술자용 data.js 편집 매뉴얼)
```

각 작업 파일은 다음 형식:

- 목적
- 영향 범위 (어떤 파일을 수정하는지)
- 변경 사항 상세
- 테스트 방법
- 예상 작업 시간

### 4.5 진행 원칙

- 기존 코드 스타일·아키텍처(SOLID 렌더러 패턴, `data.js` 단일 소스) **엄격히 유지**
- TypeScript·React·CMS 도입 **금지** (별도 위원회 결의 전까지)
- 모든 작업은 별도 브랜치 → PR → 직접 검토 후 main 머지
- `CLAUDE.md` 업데이트도 같은 PR에 포함
- 외부 의존성 추가 시 위원회 사전 협의 (현재 외부 의존: Pretendard CDN, Google Maps iframe, Unsplash 이미지 1개)

-----

## 5. 위원회 다음 미팅 안건

1. P0 작업 결과 검토 (1주 후)
1. 주보·공지 PDF 업로드 워크플로 결정 (사제·간사 누가, 어떻게)
1. 카카오톡 채널·교회 SNS 운영 주체
1. 도메인 결정: `gmchurchweb.netlify.app` 유지 vs 커스텀 도메인(`gmchurch.kr` 등)
1. 새가족 등록 폼 도입 시 개인정보 처리방침 본격 작성
