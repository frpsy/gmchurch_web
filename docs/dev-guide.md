# 개발 가이드 (페이지·내비·검증·코드 규칙·영상)

> AGENTS.md에서 옮긴 상세 참조다(2026-11-07 지침 정리, 내용 변경 없음). 필요한 작업일 때만 읽는다.

## 프로젝트 스택

| 항목 | 내용 |
|---|---|
| 방식 | 바닐라 HTML + CSS + JS, 빌드 없음 |
| 배포 | 개발: GitHub Pages (`main` 자동 배포, 1~2분) · 공식(gmskh.or.kr): 공식 저장소 `main` → 서버가 2시간마다 반영 (`docs/REPO-STRUCTURE.md`) — **Netlify는 사용하지 않음** (아래 참고) |
| 로드 순서 | `data.js` → `app.js` (CHURCH_DATA 전역 변수) |
| 테스트 | `npm test` (Vitest) |
| CI | `cache-bust.yml` — main 머지 시 `?v=` 자동 갱신 · `bulletin-sync.yml` — 주보 이미지 push 시 + 매일 03:00(KST) 주보·교회소식 갱신/만료 삭제 |

> **Netlify 미사용**: 예전에 쓰던 Netlify는 종료되었다. PR에 `netlify[bot]`의 "Deploy Preview" 코멘트나 `deploy-preview-N--gmchurchweb.netlify.app` 링크가 보여도 **무시한다** — 확인·재시도·수정 대상이 아니고, 미리보기는 로컬(`python3 -m http.server 8000`)로 한다. 이 봇 알림만으로 PR 대응(푸시·코멘트)을 시작하지 않는다. (저장소에는 Netlify 설정 파일이 없다. 봇이 계속 뜨면 GitHub 쪽 Netlify 앱 연결을 해제해야 한다.)

## 전체 페이지 & 렌더러

| 파일 | 역할 | 렌더러 (app.js) |
|---|---|---|
| `index.html` | 홈 | IndexRenderer |
| `clergy.html` | 교회 소개 (교회 이야기 `#identity` 정적 HTML 포함) | AnglicanRenderer, ClergyRenderer, HistoryRenderer, AboutNavRenderer, PressRenderer |
| `faq.html` | 자주 묻는 질문 (성공회 오해·궁금증) | FaqRenderer |
| `worship.html` | 예배 | WorshipRenderer |
| `bulletin.html` | 주일 주보 (noindex, 주보·소식 메뉴) | BulletinRenderer |
| `news.html` | 교회 소식 — 주보 교회소식 날짜별 목록 (noindex, 주보·소식 메뉴) | NewsRenderer |
| `newcomer.html` | 처음 오신 분 | NewcomerRenderer |
| `community.html` | 공동체 | CommunityRenderer |
| `giving.html` | 헌금 | GivingRenderer |
| `media.html` | 미디어·자료 허브 (카드 링크) | MediaHubRenderer |
| `videos.html` | 영상 갤러리 (미디어·자료 메뉴) | MediaRenderer |
| `gallery.html` | 사진 갤러리 (noindex, 미디어·자료 메뉴) | PhotoGalleryRenderer |
| `links.html` | 관련 기관 (미디어·자료 메뉴) | LinksRenderer |
| `sundays.html` | 교회력 허브 — 이달의 교회력·전례독서·절기·특별 주일 (교회력 메뉴) | SundaysRenderer |
| `visit.html` | 오시는 길 | VisitRenderer |
| `hopecenter.html` | 광명 희망터 상세 | HopeCenterRenderer |
| `emmaus.html` | 엠마우스 코스 상세 | — |
| `smallgroup.html` | 소그룹 모임 상세 | SmallGroupRenderer |
| `greenchurch.html` | 녹색교회 상세 (교회 소개 메뉴) | — |
| `privacy.html` | 개인정보처리방침 (noindex) | — |
| `jubo/index.html` | 모바일 주보 (noindex, 단독 페이지 — 홈페이지에서 연결하지 않고 교우에게만 주소 안내, 데이터 `data/jubo/`) | 페이지 안 스크립트 |

---

## 내비게이션 구조 (현재)

실제 소스: `data.js` → `CHURCH_DATA.navigation`

```
교회 소개 (clergy.html)
  성공회란? / 대한성공회 / 섬기는 이들 / 교회 이야기(clergy.html#philosophy — 철학·이야기 두 섹션을 하나로) / 교회 연혁(clergy.html#history) / 녹색교회(greenchurch.html)

예배와 기도 (worship.html)
  주일 감사성찬례 / 어린이 예배 / 감사성찬례 순서 / 성무일과(매일기도) / 예배 자료 / 공동기도서와 성가

주보·소식 (bulletin.html)
  주일 주보(bulletin.html) / 교회 소식(news.html)

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

Footer 전용 링크: `giving.html`(헌금 안내), `clergy.html#logo-intro`(로고 소개), `clergy.html#press`(언론 보도), `privacy.html`

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

## 커밋 전 체크리스트

- [ ] `npm test` 통과
- [ ] 새 HTML 파일 → `data.js navigation` 항목 추가 또는 footer 링크 추가
- [ ] 삭제한 HTML 파일 → nav·footer 링크도 제거
- [ ] `data.js`/`app.js`/`style.css` 수정 → 모든 HTML `?v=` 날짜 갱신 (아래 커맨드)
- [ ] 새 CSS 클래스 → `style.css`에 정의 존재 확인
- [ ] 새 단락·섹션 → 데스크톱(1280px)과 모바일(390px)에서 제목·본문 시작 위치가 일치하는지 확인
- [ ] 모든 HTML에 4개 필수 요소 존재 확인

## 에셋 버전 수동 갱신

```bash
TODAY=$(date +%Y%m%d)
for f in *.html; do
  sed -i \
    "s/style\.css?v=[0-9A-Za-z_-]*/style.css?v=${TODAY}/g
     s/data\.js?v=[0-9A-Za-z_-]*/data.js?v=${TODAY}/g
     s/app\.js?v=[0-9A-Za-z_-]*/app.js?v=${TODAY}/g
     s/icons\.svg?v=[0-9A-Za-z_-]*/icons.svg?v=${TODAY}/g" "$f"
done
echo "Done: $TODAY"
```

> CI(`cache-bust.yml`)가 main 머지 후 커밋 SHA로 자동 갱신하므로, PR 작업 중 수동 갱신은 선택사항이지만 로컬 테스트에 도움이 된다.

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

## 새 유튜브 영상 추가 (2026-11-05, 사용자 지시)

- 광명교회 유튜브 채널: `https://youtube.com/channel/UCDaJNUSrCsljsECQpKDBv7A` (`data.js`의 `media.channelUrl`과 같은 주소).
- 사용자가 "유튜브 새로 올라갔어"라고 하면 영상 갤러리(`videos.html`)에 추가한다. 영상 목록은 `data.js`의 `media.videos` 배열이며 항목은 `{ id, title, desc, category }`다. `id`는 영상 주소의 `v=` 값(영상 ID)이다.
- 영상 ID·제목·내용은 채널·영상 페이지에서 확인된 것만 쓴다(추측 금지). 클라우드 환경에서는 채널 목록이 읽히지 않을 수 있으니, 읽히지 않으면 사용자에게 영상 링크를 받는다. `desc`는 영상 설명·자막에서 확인된 내용만 담백하게 쓰고, `category`는 기존 분류(성공회 소개·공동체·설교·신앙 이야기)에서 고른다.
- 새 영상은 배열 맨 앞에 넣는다. 개발·공식 두 저장소에 모두 올린다(위 저장소 2개 운영 규칙).

- **쇼츠 대표 10개 구성 (2026-11-05, 사용자 지시)** — 영상 갤러리 아래 '대표 쇼츠' 가로 목록(`media.shorts.featured`, 조회수·중요도 기준 10개)과 '전체 보기'(`media.shorts.all`, 제목+링크 전체)가 있다. **매주 새 쇼츠가 올라오면 `all` 맨 앞에 `{ id, title }`(해시태그 제외, 확인된 내용이 있으면 `desc`)만 넣는다.** 화면은 `all[0]`을 항상 '최신' 카드로 맨 앞에 보이고, 그 뒤에 대표 10개(`featured`), 나머지는 '나머지 쇼츠 보기' 토글 목록에 자동으로 들어간다(이전 최신은 자동으로 목록으로 내려감). 대표 교체는 사용자 요청이 있을 때만 한다. 소개글(`desc`)은 자막·제목에서 확인된 내용만 쓴다(추측 금지). 목록 확보: `yt-dlp --compat-options no-certifi --ignore-no-formats-error --extractor-args "youtube:player_client=web_embedded" --flat-playlist ".../channel/UCDaJNUSrCsljsECQpKDBv7A/shorts"`. 개발·공식 두 저장소에 모두 올린다.

## 코드 규칙

### 문체 (한국어 콘텐츠)
- 정중하고 담백하게 — 과도한 수식어("아름다운", "따뜻한", "늘", "든든한") 지양
- **이모티콘 직접 사용 금지** — 아이콘은 `images/icons.svg` 아이콘 팩만 쓴다(data.js는 심볼 이름, app.js는 `icon('name')`). 없는 아이콘은 같은 스타일로 심볼을 추가 (`ARCHITECTURE.md` 아이콘 팩 참고)
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

### 디자인 취향 (사용자 선호)
- **설명글·사진 캡션은 가운데 정렬 + 연한 진회색.** 본문색을 `color-mix(in srgb, var(--text) 72%, var(--white))`로 섞어 쓴다(예: `.children-photo-grid figcaption`). 색 변수라 다크모드에서도 자동 전환되며 대비는 AA 이상이다.
- **본문 문단과 버튼은 붙이지 않는다.** 문단 바로 뒤에 버튼이 오면 위 여백(약 1.25rem)을 둔다(예: `.worship-card-desc + .btn-next`).
- **한 단락의 제목과 본문은 같은 칼럼 폭에 둔다.** 예배 페이지 단락은 760px 가운데 칼럼이다. 새 단락을 만들 때 제목만 컨테이너 왼쪽에 붙고 본문이 칼럼 안에 들어가는 어긋남이 생기기 쉽다(공동기도서 단락 `#worship-bcp` 사례, PR #531 → `max-width: 760px; margin: 0 auto;`로 수정). 단락 컨테이너에 칼럼 폭을 직접 준다.
- 취향 판단이 필요한 시각 조정(색 농도·간격)은 "미학적으로 나은 쪽"을 직접 골라 적용하고, 고른 값을 한 줄로 알린다.

### 로고 글자
- 메뉴·푸터 로고 서체는 로고 글자 11자만 담은 서브셋(`fonts/brand-serif.woff2`)이다. `info.name`·`info.tagline`을 바꾸면 서브셋을 다시 만들어야 한다(없는 글자는 기본 서체로 보임).

### 금지 사항
- HTML에 직접 콘텐츠 하드코딩 (data.js를 거쳐야 함)
- nav에 링크 없이 새 페이지 추가
- 기존 CSS 클래스 확인 없이 동일 목적의 새 클래스 추가
- `clergy.html`의 `id="philosophy"` 중복 사용 금지 (이미 섹션에 존재)
- 렌더러가 없는 페이지에 `id="xxx-full"` div 추가 후 렌더러 연결 누락

## 요청 해석 기준

- **끊기거나 모호한 요청**(문장이 중간에 끝남, 대상이 불분명)은 되묻지 않고 가장 합리적인 해석으로 바로 적용한 뒤, **어떻게 해석했는지 한 줄**로 알린다. 사용자가 바로잡으면 그 자리에서 다시 고친다.
- 해석이 크게 갈려 되돌리기 어렵거나(데이터 삭제, 구조 변경) 외부에 공개되는 일만 먼저 묻는다.
- 사용자가 화면을 캡처해 보내면 캡처 속 요소를 코드(`data.js` 키·`app.js` 렌더러·`style.css` 클래스)로 먼저 찾아 확인한 뒤 고친다.

### 사용자 표현 ↔ 화면 요소 (확인된 것만 기록)

| 표현 | 화면 요소 | 위치 |
|---|---|---|
| 어린이 예배 사진 설명 | `children.html` 사진 아래 캡션 | `app.js` `.children-photo-grid figcaption`, `data.js` photos `caption` |
| 예배 카드 설명 문단 | `worship.html` 카드 설명 | `.worship-card-desc`, `data.js` `worship.main[].desc` |
| 어린이 예배 만나보기 버튼 | `worship.html`·홈 카드의 링크 | `.btn-next`(worship), `.about-brief-link`(홈), `data.js` `linkLabel` |

> 새로 표현이 확인되면 이 표에 추가한다. 확인하지 못한 대응은 적지 않는다(추측 금지).

## Git 명령 예시

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
