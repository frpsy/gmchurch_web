# Claude Code 작업 지시서 — 광명교회 홈페이지 P0 작업

> **저장소**: `frpsy/gmchurch_web`
> **배포**: `gmchurchweb.netlify.app`
> **작성일**: 2026-05-25
> **근거 문서**: `docs/committee-audit-2026-05.md` (위원회 audit 보고서)

-----

## 0. 시작 전 필수 확인

### 0.1 진행 원칙 (위원회 결의)

이 프로젝트는 **빌드 없는 정적 사이트 구조를 엄격히 유지**합니다. 다음은 위원회 사전 협의 없이 금지:

- ❌ React / Vue / Svelte 등 프레임워크 도입
- ❌ TypeScript 마이그레이션
- ❌ 헤드리스 CMS (Sanity / Strapi / Decap 등) 도입
- ❌ 빌드 도구 (Vite / Webpack / Parcel) 도입
- ❌ npm 의존성 신규 추가 (현재 의존성: Pretendard CDN, Google Maps iframe, Unsplash 이미지 1개만)

다음 패턴은 **반드시 유지**:

- ✅ `data.js` → `app.js` 로드 순서
- ✅ `CHURCH_DATA` 단일 객체에 모든 콘텐츠
- ✅ SOLID 의식한 렌더러 패턴 (`*Renderer.render()`)
- ✅ CSS 변수 토큰 (`--green-deep`, `--cream` 등)
- ✅ ID 기반 DOM 접근, 시맨틱 HTML
- ✅ 새 섹션 추가 시 `CLAUDE.md` 동기화

### 0.2 Git 워크플로

각 P0 작업을 **개별 PR로 분리**. 한 PR에 여러 P0 항목 섞지 말 것:

```bash
git fetch origin main
git checkout -b claude/p0-1-og-meta origin/main
# 작업
git add ...
git commit -m "P0-1: Open Graph 메타 태그 추가"
git push -u origin claude/p0-1-og-meta
# GitHub MCP로 PR 생성
```

PR 제목 규칙: `P0-N: 작업명` 또는 `P1-N: 작업명`

-----

## 1. P0 작업 목록 (1주 이내 완료 목표)

### P0-1. Open Graph + Twitter Card 메타 추가

**목적**: 카카오톡·페이스북·X에서 홈페이지 링크 공유 시 미리보기 정상 출력. 교회 홍보의 주 채널.

**영향 파일**: 모든 HTML 6개 (`index.html`, `clergy.html`, `worship.html`, `community.html`, `visit.html`, `giving.html`), 신규 OG 이미지 1개

**작업 내용**:

1. **OG 이미지 생성**: `og-image.png` (1200×630px)
- 배경: `--green-deep` (#163d24) 또는 `--cream` (#f7f4ed)
- 중앙: ACGM 모노그램 또는 광명교회 로고
- 텍스트: “대한성공회 광명교회” + 슬로건 “모든 생명을 환대하는 교회”
- Pretendard 폰트 사용
- 저장 위치: 저장소 루트 `og-image.png`
1. **6개 HTML `<head>`에 추가** (페이지별 title/description 값은 기존 유지):

```html
<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="대한성공회 광명교회">
<meta property="og:title" content="[페이지별 title과 동일]">
<meta property="og:description" content="[페이지별 description과 동일]">
<meta property="og:url" content="https://gmchurchweb.netlify.app/[해당파일]">
<meta property="og:image" content="https://gmchurchweb.netlify.app/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="ko_KR">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="[페이지별 title과 동일]">
<meta name="twitter:description" content="[페이지별 description과 동일]">
<meta name="twitter:image" content="https://gmchurchweb.netlify.app/og-image.png">

<!-- 기타 -->
<link rel="canonical" href="https://gmchurchweb.netlify.app/[해당파일]">
<meta name="theme-color" content="#163d24">
```

1. **주의**: OG 태그는 크롤러가 JavaScript를 실행하지 않으므로 **반드시 HTML에 직접 작성**. `data.js`에서 동적 주입 금지.

**테스트**:

- 카카오톡에 `https://gmchurchweb.netlify.app` 붙여넣기 → 미리보기 정상 출력 확인
- <https://www.opengraph.xyz/> 에 URL 입력해 검증

**예상 시간**: 30분 (OG 이미지 디자인 별도)

-----

### P0-2. robots.txt + sitemap.xml

**목적**: 검색엔진(구글·네이버·다음) 크롤링 가이드 및 6개 페이지 명시적 등록.

**영향 파일**: 신규 `robots.txt`, 신규 `sitemap.xml` (저장소 루트)

**작업 내용**:

`robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://gmchurchweb.netlify.app/sitemap.xml
```

`sitemap.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://gmchurchweb.netlify.app/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://gmchurchweb.netlify.app/clergy.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://gmchurchweb.netlify.app/worship.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://gmchurchweb.netlify.app/community.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://gmchurchweb.netlify.app/visit.html</loc>
    <changefreq>yearly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://gmchurchweb.netlify.app/giving.html</loc>
    <changefreq>yearly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>
```

**테스트**:

- 배포 후 `https://gmchurchweb.netlify.app/robots.txt`, `sitemap.xml` 접근 가능 확인
- 구글 서치 콘솔, 네이버 웹마스터 도구 등록 안내 (PR 설명란에 명시)

**예상 시간**: 15분

-----

### P0-3. JSON-LD 구조화 데이터

**목적**: 검색엔진에 “이것은 교회”임을 명시. 구글 비즈니스 프로필·지식 그래프 인식률 향상.

**영향 파일**: `index.html`, `visit.html`, `clergy.html` (각 `<head>` 또는 `</body>` 직전)

**작업 내용**:

**index.html에 추가** (Church 스키마):

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Church",
  "name": "대한성공회 광명교회",
  "alternateName": "성 디모테오 성당",
  "url": "https://gmchurchweb.netlify.app",
  "logo": "https://gmchurchweb.netlify.app/og-image.png",
  "image": "https://gmchurchweb.netlify.app/og-image.png",
  "telephone": "+82-2-2686-0091",
  "faxNumber": "+82-2-2686-0092",
  "email": "bsyg2000@hanmail.net",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "아방리2길 10",
    "addressLocality": "광명시",
    "addressRegion": "경기도",
    "postalCode": "14335",
    "addressCountry": "KR"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 37.4757,
    "longitude": 126.8641
  },
  "foundingDate": "1990-02-11",
  "sameAs": [
    "https://www.youtube.com/[유튜브 채널 URL]",
    "https://www.instagram.com/[인스타 URL]",
    "https://blog.naver.com/[네이버 블로그 URL]"
  ],
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Sunday",
      "opens": "10:30",
      "closes": "12:00",
      "description": "주일 감사성찬례"
    }
  ],
  "parentOrganization": {
    "@type": "ReligiousOrganization",
    "name": "대한성공회 서울교구"
  }
}
</script>
```

**주의사항**:

- `sameAs` URL은 `CHURCH_DATA.sns` 객체의 실제 값으로 교체
- 예배 시간은 `CHURCH_DATA.worship.main[0].time` 값과 일치시킬 것
- **이 데이터는 HTML에 직접 작성** (data.js에서 동적 생성 금지 — 크롤러 미실행)

**visit.html, clergy.html**도 동일 스키마 적용 (페이지 맥락에 맞춰 일부 필드만 사용해도 무방)

**테스트**:

- <https://search.google.com/test/rich-results> 에 URL 입력 → 오류 없음 확인
- <https://validator.schema.org> 추가 검증

**예상 시간**: 30분

-----

### P0-4. 접근성 (a11y) 즉시 개선

**목적**: 스크린리더 사용자·키보드 사용자 접근성 보장. 고령 신자 비율 높은 교회에 특히 중요.

**영향 파일**: 6개 HTML, `style.css`, 일부 `app.js`

**작업 내용**:

**① `<main>` 태그 추가** (6개 HTML 모두)

현재 구조:

```html
<nav id="main-nav">...</nav>
<header class="hero">...</header>
<section>...</section>
<section>...</section>
<footer id="main-footer">...</footer>
```

변경 후:

```html
<nav id="main-nav">...</nav>
<main id="main-content">
  <header class="hero">...</header>
  <section>...</section>
  <section>...</section>
</main>
<footer id="main-footer">...</footer>
```

서브 페이지(clergy/worship/community/visit/giving)는 `.page-hero` 도 `<main>` 안으로:

```html
<main id="main-content">
  <div class="page-hero">...</div>
  <section>...</section>
</main>
```

**② Skip to main content 링크**

`<body>` 첫 자식으로 (6개 HTML 모두):

```html
<a href="#main-content" class="skip-link">본문 바로가기</a>
```

`style.css`에 추가:

```css
.skip-link {
    position: absolute;
    top: -100px;
    left: 1rem;
    z-index: 9999;
    background: var(--green-deep);
    color: var(--white);
    padding: 0.75rem 1.25rem;
    border-radius: var(--radius-sm);
    font-weight: 700;
    text-decoration: none;
    transition: top 0.2s;
}
.skip-link:focus {
    top: 1rem;
}
```

**③ `:focus-visible` 스타일** (`style.css` 상단 또는 reset 섹션)

```css
/* 키보드 포커스 표시 (마우스 클릭 시는 표시 안 함) */
*:focus {
    outline: none;
}
*:focus-visible {
    outline: 3px solid var(--green-mid);
    outline-offset: 2px;
    border-radius: 4px;
}

/* nav-link, 버튼 등 이미 outline이 있는 곳은 별도 처리 */
.nav-link:focus-visible,
.btn-outline:focus-visible,
.nav-toggle:focus-visible,
.nav-chevron:focus-visible {
    outline: 3px solid var(--gold);
    outline-offset: 3px;
}
```

**④ nav-chevron 키보드 동작 확인**

`app.js`의 `NavRenderer._bindEvents()`에서 `.nav-chevron`이 button 요소인지 확인. button이면 Enter/Space가 자동 click 발화. 만약 div라면 button으로 변경.

(CLAUDE.md상 이미 `<button class="nav-chevron">`로 되어있어 OK 추정. 실제 동작 검증만)

**테스트**:

- 키보드 Tab으로만 6페이지 모두 네비게이션 가능
- Tab 첫 누름 → “본문 바로가기” 링크 보임 → Enter → 본문으로 점프
- 모든 인터랙티브 요소(링크·버튼·햄버거·드롭다운)에 포커스 윤곽선 표시
- 마우스 클릭 시에는 윤곽선 안 보임

**예상 시간**: 1시간

-----

### P0-5. 주소·연락처 메타 정밀화

**목적**: 사제님 확인 결과 주소 자체는 정확함 확인 (네이버 지도: 아방리2길 10, 지번 노온사동 373-1, 우편번호 14335). `data.js`에 우편번호·지번 추가.

**영향 파일**: `data.js`

**작업 내용**:

`CHURCH_DATA.info`를 다음과 같이 확장:

```javascript
info: {
    name: "대한성공회 광명교회",
    subName: "성 디모테오 성당",
    slogan: "모든 생명을 환대하는 교회",
    vision: "하느님 나라를 살아가는 사랑의 공동체",
    established: "1990년 2월 11일",

    // 주소 (도로명 + 지번 + 우편번호)
    address: "경기도 광명시 아방리2길 10",
    addressShort: "경기도 광명시 아방리2길 10",
    addressJibun: "광명시 노온사동 373-1",  // 지번 (네이버 지도 기준)
    postalCode: "14335",
    addressDetail: {
        country: "KR",
        region: "경기도",
        city: "광명시",
        street: "아방리2길 10",
        postalCode: "14335"
    },

    // 좌표 (visit.html iframe과 일치)
    geo: {
        latitude: 37.4757,
        longitude: 126.8641
    },

    phone: "02-2686-0091",
    fax: "02-2686-0092",
    email: "bsyg2000@hanmail.net"
}
```

**visit.html 렌더링 시 우편번호·지번 표시**: `VisitRenderer`에서 location 카드에 다음 형식 출력:

```
[지도 iframe]
📍 경기도 광명시 아방리2길 10
   (지번) 광명시 노온사동 373-1
   우편번호 14335
```

**테스트**:

- visit.html에서 새 주소 정보가 정상 표시
- index.html 메인의 visit-preview에도 반영

**예상 시간**: 20분

-----

### P0-6. 개인정보 처리방침 페이지

**목적**: 전화·이메일 게시 중. 향후 새가족 등록 폼 도입 대비. 법적 최소 요건 충족.

**영향 파일**: 신규 `privacy.html`, `app.js`(PrivacyRenderer 또는 정적 HTML), `data.js`(navigation에 추가는 X — 푸터에만 노출)

**작업 내용**:

**① `privacy.html` 신규 작성** (기존 페이지 구조 답습 — page-hero + section + main-content)

내용 구성:

1. **수집하는 개인정보 항목**
- 전화·이메일 문의 시 자발적으로 제공한 정보 (이름, 연락처)
- 향후 새가족 등록 시 추가 항목은 별도 고지
1. **수집·이용 목적**: 교회 안내, 사목 활동, 공동체 소통
1. **보유 및 이용 기간**: 교적 등록 시 신자 자격 유지 기간, 단순 문의는 응답 후 1년
1. **제3자 제공**: 원칙적으로 제공하지 않음. 법령 요구 시 예외
1. **개인정보 보호 책임자**: 관할사제 민숙희 (010-8652-0688, [bsyg2000@hanmail.net](mailto:bsyg2000@hanmail.net))
1. **이용자 권리**: 열람·정정·삭제·처리정지 요구 가능
1. **시행일**: 2026년 ◯월 ◯일

**② 푸터에 링크 추가**

`app.js`의 `FooterRenderer.render()`에 `<a href="privacy.html">개인정보 처리방침</a>` 추가.

**③ 사이트맵 누락 페이지 처리**

`sitemap.xml`(P0-2)에 `privacy.html` 추가:

```xml
<url>
  <loc>https://gmchurchweb.netlify.app/privacy.html</loc>
  <changefreq>yearly</changefreq>
  <priority>0.3</priority>
</url>
```

**테스트**:

- 모든 페이지 푸터에 “개인정보 처리방침” 링크 노출
- 링크 클릭 시 정상 페이지 이동
- 페이지 자체가 nav에는 노출되지 않음 (푸터에만)

**예상 시간**: 1시간 (내용 작성 포함)

-----

### P0-7. 폰트 preload + Apple Touch Icon

**목적**: 첫 페인트 시 텍스트 깜빡임 감소. iOS 홈화면 추가 시 아이콘 정상 표시.

**영향 파일**: 6개 HTML

**작업 내용**:

**① Pretendard preload** (각 HTML `<head>`, 기존 preconnect 다음 줄):

```html
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="preload" as="style" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css">
```

(`preconnect`에 `crossorigin` 속성 추가 — 폰트 CORS 대응)

**② Apple Touch Icon**

`favicon.svg`를 베이스로 PNG 변환한 `apple-touch-icon.png` (180×180px) 생성 후 저장소 루트에 저장.

각 HTML `<head>`에 추가:

```html
<link rel="apple-touch-icon" href="apple-touch-icon.png">
```

**테스트**:

- Lighthouse 성능 점수 확인 (이전 대비 LCP 개선)
- iPhone Safari에서 홈화면 추가 → 광명교회 아이콘 정상

**예상 시간**: 30분 (아이콘 변환 포함)

-----

## 2. 작업 진행 순서 권장

병렬 가능한 작업이 많지만, **충돌 최소화를 위한 순서**:

```
1주차:
  Day 1-2:  P0-1 (OG 메타)            ← OG 이미지 디자인 포함
  Day 2:    P0-2 (sitemap/robots)     ← 독립
  Day 2-3:  P0-3 (JSON-LD)            ← P0-1과 같은 HTML 영역
  Day 3-4:  P0-4 (a11y)               ← HTML 구조 변경, 가장 영향 큼
  Day 4:    P0-5 (주소 메타)           ← data.js만 수정
  Day 5:    P0-6 (개인정보)            ← 신규 파일
  Day 5:    P0-7 (폰트/아이콘)         ← HTML head만
```

각 작업 후 Netlify 배포 확인 → 다음 작업 시작.

-----

## 3. 작업 완료 후 보고

각 PR 머지 후 `docs/p0-completion-report.md`에 다음 형식으로 기록:

```markdown
## P0-N. [작업명]
- PR: #N
- 머지 일자: 2026-MM-DD
- 변경 파일: ...
- 검증 결과: [Lighthouse 점수 변화 / OG 미리보기 스크린샷 / 키보드 네비 테스트 결과 등]
- 남은 이슈: 없음 / [있다면 기재]
```

-----

## 4. 다음 단계 (P1 예고)

P0 완료 후 위원회 검토 미팅 → 다음 항목으로 진행:

- **P1-1**. 공지사항 페이지 (`news.html` + `CHURCH_DATA.news`)
- **P1-2**. 주보 아카이브 (`bulletin.html` + 최근 12주 PDF)
- **P1-3**. 메인 hero에 “처음 오셨나요?” CTA 4번째 버튼
- **P1-4**. 평일 성무일도 시간표 (`CHURCH_DATA.worship.daily`)
- **P1-5**. RCL 성서정과 표시 (Year A/B/C 자동 계산)

-----

## 5. 질문·이슈 발생 시

- 위원회 결의 사항과 충돌하는 기술 결정 필요 → 작업 중단하고 사용자(상열님)에게 보고
- CLAUDE.md 와 실제 구현이 불일치 발견 → CLAUDE.md 업데이트도 같은 PR에 포함
- 외부 의존성 추가 필요 → 위원회 사전 협의