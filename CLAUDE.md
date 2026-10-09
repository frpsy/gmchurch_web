# 광명교회 웹사이트 — Claude 작업 기준

> **작업 흐름**: 이 파일 확인 → 작업 전 검증 → 구현 → 커밋 전 검증 → 푸시

---

## 핵심 3원칙

1. **콘텐츠는 data.js만** — 텍스트·메뉴·주소·일정 등 모든 데이터는 `CHURCH_DATA`에만 존재. HTML에 직접 하드코딩 금지.
2. **페이지 추가 = nav 동기화** — 새 HTML 파일은 반드시 nav(data.js) 또는 footer에서 도달 가능해야 한다.
3. **스타일은 재사용 먼저** — 새 CSS 클래스 전에 `ARCHITECTURE.md`의 클래스 목록에서 기존 클래스 확인.

---

## 프로젝트 스택

| 항목 | 내용 |
|---|---|
| 방식 | 바닐라 HTML + CSS + JS, 빌드 없음 |
| 배포 | GitHub Pages (`main` 브랜치 자동 배포) — **Netlify는 사용하지 않음** (아래 참고) |
| 로드 순서 | `data.js` → `app.js` (CHURCH_DATA 전역 변수) |
| 테스트 | `npm test` (Vitest, 90개) |
| CI | `cache-bust.yml` — main 머지 시 `?v=` 자동 갱신 |

> **Netlify 미사용**: 예전에 쓰던 Netlify는 종료되었다. PR에 `netlify[bot]`의 "Deploy Preview" 코멘트나 `deploy-preview-N--gmchurchweb.netlify.app` 링크가 보여도 **무시한다** — 확인·재시도·수정 대상이 아니고, 미리보기는 로컬(`python3 -m http.server 8000`)로 한다. 이 봇 알림만으로 PR 대응(푸시·코멘트)을 시작하지 않는다. (저장소에는 Netlify 설정 파일이 없다. 봇이 계속 뜨면 GitHub 쪽 Netlify 앱 연결을 해제해야 한다.)

---

## 전체 페이지 & 렌더러

| 파일 | 역할 | 렌더러 (app.js) |
|---|---|---|
| `index.html` | 홈 | IndexRenderer |
| `clergy.html` | 교회 소개 (교회 이야기 `#identity` 정적 HTML 포함) | AnglicanRenderer, ClergyRenderer, AboutNavRenderer, PressRenderer |
| `faq.html` | 자주 묻는 질문 (성공회 오해·궁금증, 가안) | FaqRenderer |
| `worship.html` | 예배 | WorshipRenderer |
| `bulletin.html` | 주일 주보 (noindex, 예배와 기도 메뉴) | BulletinRenderer |
| `newcomer.html` | 처음 오신 분 | NewcomerRenderer |
| `community.html` | 공동체 | CommunityRenderer |
| `giving.html` | 헌금 | GivingRenderer |
| `media.html` | 미디어·자료 허브 (카드 링크) | MediaHubRenderer |
| `videos.html` | 영상 갤러리 (미디어·자료 메뉴) | MediaRenderer |
| `gallery.html` | 사진 갤러리 (noindex, 미디어·자료 메뉴) | PhotoGalleryRenderer |
| `links.html` | 관련 기관 (미디어·자료 메뉴) | LinksRenderer |
| `sundays.html` | 교회력 허브 — 이달의 교회력·전례독서·절기·특별 주일 (교회력 메뉴) | SundaysRenderer |
| `visit.html` | 오시는 길 | VisitRenderer |
| `hopecenter.html` | 광명 희망터 상세 | — |
| `emmaus.html` | 엠마우스 코스 상세 | — |
| `smallgroup.html` | 소그룹 모임 상세 | SmallGroupRenderer |
| `greenchurch.html` | 녹색교회 상세 (교회 소개 메뉴) | — |
| `privacy.html` | 개인정보처리방침 (noindex) | — |

---

## 내비게이션 구조 (현재)

실제 소스: `data.js` → `CHURCH_DATA.navigation`

```
교회 소개 (clergy.html)
  성공회란? / 대한성공회 / 섬기는 이들 / 교회 이야기(clergy.html#philosophy — 철학·이야기 두 섹션을 하나로) / 녹색교회(greenchurch.html)

예배와 기도 (worship.html)
  주일 감사성찬례 / 어린이 예배 / 감사성찬례 순서 / 성무일과(매일기도) / 예배 자료 / 공동기도서와 성가 / 주일 주보(bulletin.html)

교회력 (sundays.html)
  이달의 교회력 / 전례독서(sundays.html#lectionary) / 절기 안내(sundays.html#seasons) / 특별 주일(sundays.html#special)

처음 오신 분 (newcomer.html)
  인사말 / 참여 안내 / 성공회 전례란? / 전례 공간 안내 / 영성체 안내 / 자주 묻는 질문(faq.html) / 문의하기

공동체 (community.html)
  광명 희망터 / 엠마우스 코스 / 소그룹 모임

미디어·자료 (media.html, 허브 — 카드 링크만)
  영상 갤러리(videos.html) / 사진 갤러리(gallery.html) / 관련 기관(links.html)

오시는 길 (visit.html)
  주소·교통 / 주차 안내
```

Footer 전용 링크: `giving.html`(봉헌 안내), `clergy.html#logo-intro`(로고 소개), `clergy.html#press`(언론 보도), `privacy.html`

---

## 작업 전 검증 — 항상 실행

```bash
# nav 링크 파일 존재 확인
node -e "
const fs=require('fs');
eval(fs.readFileSync('data.js','utf8').replace('const CHURCH_DATA','global.CHURCH_DATA'));
let ok=true;
CHURCH_DATA.navigation.forEach(item=>{
  const [p]=item.href.split('#');
  if(p&&!fs.existsSync(p)){console.log('MISSING:',p);ok=false;}
  (item.items||[]).forEach(sub=>{
    const [sp]=sub.href.split('#');
    if(sp&&!fs.existsSync(sp)){console.log('MISSING:',sp,'←',sub.label);ok=false;}
  });
});
if(ok)console.log('All nav links OK');
"

# 테스트
npm test
```

---

## 커밋 전 체크리스트

- [ ] `npm test` 통과
- [ ] 새 HTML 파일 → `data.js navigation` 항목 추가 또는 footer 링크 추가
- [ ] 삭제한 HTML 파일 → nav·footer 링크도 제거
- [ ] `data.js`/`app.js`/`style.css` 수정 → 모든 HTML `?v=` 날짜 갱신 (아래 커맨드)
- [ ] 새 CSS 클래스 → `style.css`에 정의 존재 확인
- [ ] 모든 HTML에 4개 필수 요소 존재 확인

---

## 에셋 버전 수동 갱신

```bash
TODAY=$(date +%Y%m%d)
for f in *.html; do
  sed -i \
    "s/style\.css?v=[0-9A-Za-z_-]*/style.css?v=${TODAY}/g
     s/data\.js?v=[0-9A-Za-z_-]*/data.js?v=${TODAY}/g
     s/app\.js?v=[0-9A-Za-z_-]*/app.js?v=${TODAY}/g" "$f"
done
echo "Done: $TODAY"
```

> CI(`cache-bust.yml`)가 main 머지 후 커밋 SHA로 자동 갱신하므로, PR 작업 중 수동 갱신은 선택사항이지만 로컬 테스트에 도움이 된다.

---

## 모든 HTML 필수 구조

```html
<body>
  <a href="#main-content" class="skip-link">본문으로 바로가기</a>
  <nav id="main-nav" class="nav-header"></nav>
  <main id="main-content">
    <!-- 페이지 콘텐츠 -->
  </main>
  <footer id="main-footer"></footer>
  <script src="data.js?v=YYYYMMDD"></script>
  <script src="app.js?v=YYYYMMDD"></script>
</body>
```

---

## 새 페이지 추가 절차

1. HTML 파일 생성 (위 필수 구조 사용, 기존 페이지에서 `<head>` 복사)
2. `data.js`에 데이터 추가
3. `app.js`에 렌더러 추가 + `App.init()` 조건부 호출
   ```js
   const PageRenderer = {
       render() {
           const el = document.getElementById('page-full');
           if (!el) return;
           // ...
       }
   };
   // App.init() 안에:
   PageRenderer.render();
   ```
4. `data.js navigation`에 메뉴 항목 추가
5. `ARCHITECTURE.md` 동기화 (파일 목록, 렌더러 목록, nav 구조)

---

## 주보 등록 절차 (매주)

> **표준(`data/lectionary-year-a.json`·`lectionary-year-b.json` — 연도별 파일을 날짜순으로 이어 붙임)이 기본, 주보 기록(`data/lectionary-overrides.json`)이 그 위에 덮인다.** 교회는 주마다 연속(A)/짝(B) 트랙을 오가고(RCL은 트랙에 따라 제1독서·시편이 다름), 맥추감사주일 같은 특별 주일은 표준에 없는 독서를 쓴다. **손으로 만질 곳은 overrides 하나뿐** — 나머지(특별 주일명, `worship.currentReadings`/`nextReadings` fallback)는 sync가 자동 파생한다.
>
> **추측 금지 — 주보 예배 순서면에 인쇄된 값만 기록한다.**

1. 이미지 복사: `bulletins/YYYYMMDD_N.jpg` (표지부터 순서대로)
2. **예배 순서면(주 본문·성시) 확인** → `data/lectionary-overrides.json`에 그 주 항목 추가
   - 제1독서가 창세기·출애굽기 등 연속 서사면 `"track": "A"`, 예언서 등 복음과 짝이면 `"track": "B"`
   - **트랙 A일 때 주보 성시가 표준과 다르면** `"psalm": "시편 N편"` 추가 (표준 단일 시편은 트랙 B값이라 A에선 어긋남)
   - 특별 주일(맥추감사 등)은 `koreanName` + `readings`(네 본문 전체) 지정
   - 주보가 시편 대신 층계성가를 부르면 시편 생략 가능(표준 지정 시편이 그대로 표시됨)
3. `node scripts/sync-bulletins.js` 실행 → PDF 생성 + data.js 자동 갱신
   - 끝에 **⚠️ 트랙 미기록 / ℹ️ 시편 미기록** 경고가 뜨면 해당 주 overrides를 보완
4. `npm test` (병합·표기·overrides 형식 검증 포함)
5. 만료(13주 FIFO) 항목은 sync가 자동 삭제. overrides의 과거 항목은 그대로 둬도 무방

> ⚠️ 병합 규칙은 `scripts/lib/lectionary.js`(스크립트·테스트용)와 `app.js`의 `_applyOverrides`(브라우저용) 두 곳에 있다 — 빌드가 없어 공유 불가. 한쪽을 고치면 반드시 다른 쪽도 함께 고칠 것.

### 전례독서 연도 파일 추가 (매년 대림절 전)

표준 독서는 교회력 1년(대림 제1주일 ~ 왕이신 그리스도 주일) 단위 파일이다. 가해(A) 2025-11-30~2026-11-22, 나해(B) 2026-11-29~2027-11-21이 있고, **다해(C)는 2027-11-28 대림 제1주일 전까지 추가**해야 전례독서가 멈추지 않는다.

1. `data/lectionary-year-c.json` 작성 — 기존 파일과 같은 스키마·표기(공동번역 책 이름, `a/b`→`상/하`, 선택절 괄호 제거, 연중 시기 `firstReadingA`=연속·`firstReadingB`=짝, `psalm`=짝 독서 시편)
2. 파일 목록 두 곳 갱신: `scripts/lib/lectionary.js`의 `STANDARD_FILES`, `app.js`의 `SundaysRenderer._LECTIONARY_FILES` (테스트가 두 목록 일치를 검사)
3. `npm test` — 날짜 연속성(7일 간격)·필수 필드·표기 규칙 자동 검증

---

## 코드 규칙

### 문체 (한국어 콘텐츠)
- 정중하고 담백하게 — 과도한 수식어("아름다운", "따뜻한", "늘", "든든한") 지양
- `draft-banner` 클래스 / `badge: "임시"` — 정식 전환 시 반드시 제거

### 주석
- 한국어 사용, 꼭 필요한 경우만 (WHY 중심, WHAT 설명 금지)

### 색상·다크모드 규칙 (모드·OS 무관 가독성 필수)
> 사이트는 `@media (prefers-color-scheme: dark)`로 다크모드를 지원한다. **OS/브라우저 설정과 무관하게 모든 텍스트가 항상 읽혀야 한다.**

- **색은 반드시 CSS 변수로** — 배경/텍스트 모두 `var(--white)`, `var(--cream)`, `var(--text)`, `var(--heading)`, `var(--green-light)` 등 다크모드에서 자동 전환되는 토큰을 쓴다. 이 변수들은 라이트/다크에서 짝을 이뤄 대비가 보장된다.
- **하드코딩 색상(`#rrggbb`) 금지** — 특히 `background`에 밝은 hex(`#fff`, `#dce8dd`, 파스텔)를 직접 쓰면 다크모드에서 밝은 글자와 겹쳐 사라진다. 불가피하면 `@media (prefers-color-scheme: dark)` 블록에 다크 대응값을 **반드시 함께** 추가한다(예: `.btn-hero-primary`, `.page-hero`).
- **`:hover`/`:focus` 상태도 검사** — 호버 시 배경만 밝은 hex로 바꾸는 패턴(`.about-brief-award:hover`)도 다크모드에서 글자가 사라진다. 상태 색도 변수 또는 다크 오버라이드로.
- **JS로 주입하는 색 주의** — `app.js`가 `--season`/`--season-light`(전례력 절기색, `data.js`의 하드코딩 hex)를 `:root` 인라인 스타일로 주입한다. 인라인 변수는 미디어쿼리로 못 덮으므로, 그 변수를 쓰는 요소는 다크 블록에서 `background`/`color` **속성 자체**를 재선언(`color-mix(in srgb, var(--season) N%, var(--white)/(--heading))`)해 덮는다.
- **대비 검증** — 새 색 조합은 본문 텍스트 기준 WCAG AA(4.5:1) 지향. 라이트·다크 양쪽에서 실제로 확인할 것.

### 금지 사항
- HTML에 직접 콘텐츠 하드코딩 (data.js를 거쳐야 함)
- nav에 링크 없이 새 페이지 추가
- 기존 CSS 클래스 확인 없이 동일 목적의 새 클래스 추가
- `clergy.html`의 `id="philosophy"` 중복 사용 금지 (이미 섹션에 존재)
- 렌더러가 없는 페이지에 `id="xxx-full"` div 추가 후 렌더러 연결 누락

---

## Git 워크플로

```bash
# 작업 브랜치 생성 (항상 최신 main 기반)
git fetch origin main
git checkout -b claude/작업명 origin/main

# 커밋
git add 파일명...   # 절대 git add -A 사용 금지 (환경변수 파일 등 포함 위험)
git commit -m "타입: 설명"

# 푸시 후 PR 생성 → 즉시 머지
git push -u origin claude/작업명
```

커밋 타입: `feat` / `fix` / `refactor` / `chore` / `docs`

> **PR 정책**: PR 생성 후 별도 확인 없이 squash merge로 즉시 머지한다.

---

## 깊은 참조

- **`ARCHITECTURE.md`** — data.js 스키마 전체, 렌더러 상세 구조, CSS 변수·클래스 목록, 앵커 스크롤 로직
- **`tests/`** — data 구조 검증 (churchData.test.js), 전례력 계산 (liturgicalCalendar.test.js), 전례독서 병합·표기 (lectionaryMerge/Overrides.test.js), 연도 파일 연속성 (lectionaryYears.test.js)
- **`docs/`** — 위원회 audit, 작업 지시서
- **`AGENTS.md`** — ChatGPT 등 다른 AI용 규칙 요약 (이 파일이 원본. 규칙을 바꾸면 AGENTS.md 요약도 맞출 것) · 인계 안내문은 `docs/chatgpt-handoff.md`
