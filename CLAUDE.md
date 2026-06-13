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
| 배포 | GitHub Pages (`main` 브랜치 자동 배포) |
| 로드 순서 | `data.js` → `app.js` (CHURCH_DATA 전역 변수) |
| 테스트 | `npm test` (Vitest, 60개) |
| CI | `cache-bust.yml` — main 머지 시 `?v=` 자동 갱신 |

---

## 전체 페이지 & 렌더러

| 파일 | 역할 | 렌더러 (app.js) |
|---|---|---|
| `index.html` | 홈 | IndexRenderer |
| `clergy.html` | 교회 소개 (교회 이야기 `#identity` 정적 HTML 포함) | AnglicanRenderer, ClergyRenderer, PressRenderer |
| `faq.html` | 자주 묻는 질문 (성공회 오해·궁금증, 가안) | FaqRenderer |
| `worship.html` | 예배 | WorshipRenderer |
| `bulletin.html` | 주일 주보 (noindex, 예배와 기도 메뉴) | BulletinRenderer |
| `newcomer.html` | 처음 오신 분 | NewcomerRenderer |
| `community.html` | 공동체 | CommunityRenderer |
| `giving.html` | 헌금 | GivingRenderer |
| `media.html` | 교회 영상·관련 기관 | MediaRenderer, LinksRenderer |
| `gallery.html` | 사진 게시판 (noindex, 미디어·자료 메뉴) | PhotoGalleryRenderer |
| `links.html` | 관련 기관 (standalone) | LinksRenderer |
| `sundays.html` | 교회력 허브 — 이달의 교회력·전례독서·절기·특별 주일 (교회력 메뉴) | SundaysRenderer |
| `visit.html` | 오시는 길 | VisitRenderer |
| `hopecenter.html` | 광명 희망터 상세 | — |
| `emmaus.html` | 엠마우스 코스 상세 | — |
| `smallgroup.html` | 소그룹 모임 상세 | SmallGroupRenderer |
| `greenchurch.html` | 녹색교회 상세 (공동체 메뉴) | — |
| `privacy.html` | 개인정보처리방침 (noindex) | — |

---

## 내비게이션 구조 (현재)

실제 소스: `data.js` → `CHURCH_DATA.navigation`

```
교회 소개 (clergy.html)
  성공회란? / 대한성공회 / 섬기는 이들 / 교회 철학 / 교회 이야기(clergy.html#identity)

예배와 기도 (worship.html)
  주일 감사성찬례 / 어린이 예배 / 감사성찬례 순서 / 성무일과 / 세계성공회 중보기도 / 예배 자료 / 주일 주보(bulletin.html)

교회력 (sundays.html)
  이달의 교회력 / 전례독서(sundays.html#lectionary) / 절기 안내(sundays.html#seasons) / 특별 주일(sundays.html#special)

처음 오신 분 (newcomer.html)
  인사말 / 참여 안내 / 성공회 전례란? / 전례 공간 안내 / 영성체 안내 / 자주 묻는 질문(faq.html) / 문의하기

공동체 (community.html)
  광명 희망터 / 엠마우스 코스 / 소그룹 모임 / 녹색교회(greenchurch.html)

미디어·자료 (media.html)
  교회 영상 / 사진 게시판(gallery.html) / 관련 기관

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
- **`tests/`** — data 구조 검증 (churchData.test.js), 전례력 계산 (liturgicalCalendar.test.js)
- **`docs/`** — 위원회 audit, 작업 지시서
