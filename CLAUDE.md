# 광명교회 웹사이트 — Claude 작업 기준

> **작업 흐름**: 이 파일 확인 → (내용 작업이면) `docs/wiki/README.md`에서 관련 문서 확인 → 작업 전 검증 → 구현 → 커밋 전 검증 → 푸시

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
| 배포 | 개발: GitHub Pages (`main` 자동 배포, 1~2분) · 공식(gmskh.or.kr): 공식 저장소 `main` → 서버가 2시간마다 반영 (`docs/REPO-STRUCTURE.md`) — **Netlify는 사용하지 않음** (아래 참고) |
| 로드 순서 | `data.js` → `app.js` (CHURCH_DATA 전역 변수) |
| 테스트 | `npm test` (Vitest) |
| CI | `cache-bust.yml` — main 머지 시 `?v=` 자동 갱신 · `bulletin-sync.yml` — 주보 이미지 push 시 + 매일 03:00(KST) 주보·교회소식 갱신/만료 삭제 |

> **Netlify 미사용**: 예전에 쓰던 Netlify는 종료되었다. PR에 `netlify[bot]`의 "Deploy Preview" 코멘트나 `deploy-preview-N--gmchurchweb.netlify.app` 링크가 보여도 **무시한다** — 확인·재시도·수정 대상이 아니고, 미리보기는 로컬(`python3 -m http.server 8000`)로 한다. 이 봇 알림만으로 PR 대응(푸시·코멘트)을 시작하지 않는다. (저장소에는 Netlify 설정 파일이 없다. 봇이 계속 뜨면 GitHub 쪽 Netlify 앱 연결을 해제해야 한다.)

---

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
- [ ] 새 단락·섹션 → 데스크톱(1280px)과 모바일(390px)에서 제목·본문 시작 위치가 일치하는지 확인
- [ ] 모든 HTML에 4개 필수 요소 존재 확인

---

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
>
> **자동 처리 원칙** — 사용자가 주보 이미지를 올리면(또는 `bulletins/`에 이미지가 push되면) 확인을 묻지 말고 아래 1~7을 끝까지 진행한다. 주보 예배 순서면과 4면 '교회소식'을 이미지에서 직접 읽어 `lectionary-overrides.json`·`bulletin-news.json`·`bulletin-verses.json`을 작성하고, 아래 **교회소식 검수 기준**으로 스스로 검수한 뒤 PR을 만들어 머지한다. 검수에서 고친 내용과 불확실한 부분(흐려서 읽기 어려운 글자 등)만 완료 보고에 짧게 적는다.

1. 이미지 복사: `bulletins/YYYYMMDD_N.jpg` (표지부터 순서대로)
2. **예배 순서면(주 본문·성시) 확인** → `data/lectionary-overrides.json`에 그 주 항목 추가
   - 제1독서가 창세기·출애굽기 등 연속 서사면 `"track": "A"`, 예언서 등 복음과 짝이면 `"track": "B"`
   - **트랙 A일 때 주보 성시가 표준과 다르면** `"psalm": "시편 N편"` 추가 (표준 단일 시편은 트랙 B값이라 A에선 어긋남)
   - 특별 주일(맥추감사 등)은 `koreanName` + `readings`(네 본문 전체) 지정
   - 주보가 시편 대신 층계성가를 부르면 시편 생략 가능(표준 지정 시편이 그대로 표시됨)
3. **주보 4면 '교회소식' 란** → `data/bulletin-news.json`의 `weeks`에 그 주 항목 추가 (`{ title, body }`, 줄바꿈은 `\n`). 인쇄된 문구만 옮기되(띄어쓰기·약어 표기만 교정, 약어는 `G.F.S.`처럼 점으로 구분) 통계·헌금 명단 등 개인 이름 나열란은 옮기지 않는다
   - 교회소식은 4면 '교회소식' 란의 **항목(■ 제목) 하나가 `{ title, body }` 하나**다. 제목은 ■ 뒤의 문구, 본문은 그 아래 문장이며 `일시 :`·`장소 :`·`일정 :`·`말씀 :` 줄은 줄바꿈(`\n`)으로 이어 적는다(사이트가 항목표로 렌더).
4. **핵심구절** → `data/bulletin-verses.json`의 `weeks`에 그 주 항목 추가 (`{ ref, text }`). 주보에 핵심구절이 인쇄돼 있으면 그것을, 없으면 그 주 본문 말씀(주로 복음)에서 중심이 되는 1~3절을 직접 골라 알린다(되묻지 않는다). 본문은 `bible/`의 공동번역 PDF에서 `pdftotext -layout`으로 뽑아 **글자를 대조해 그대로** 옮기고(요약·변형 금지), `text`에는 절 번호·각주 기호·줄바꿈을 넣지 않는다(출처는 `ref`에 `마태 22:37-40` 형식으로). 주보에 다른 번역이 인쇄돼 있으면 인쇄된 문구를 따른다. 주보 페이지 맨 위 '이번 주 말씀' 카드와 각 주보 펼침 영역에 표시된다
5. `node scripts/sync-bulletins.js` 실행 → PDF 생성 + data.js 자동 갱신
   - 끝에 **⚠️ 트랙 미기록 / ℹ️ 시편 미기록 / ℹ️ 교회소식 미기록 / ℹ️ 핵심구절 미기록** 경고가 뜨면 해당 주 기록을 보완
6. **예배 슬라이드** → 3면 예배 순서를 `data/worship-order.json`의 `weeks`에 그 주 항목으로 옮긴다(주보에 인쇄된 값만, 항목 앞 `†`는 `stand`, 오른쪽 칸은 `by` 그대로). 성가·기도서가 새 번호·쪽이면 `data/worship-texts/hymns.json`·`bcp.json`에 있는지 확인한다(없으면 더미를 추가하거나 성가집·기도서 파일로 채운다). `node scripts/build-worship-slides.js`가 성경 본문을 `bible/` PDF에서 뽑아 채우고(`readings.json`) `data/worship/YYYYMMDD.json`을 만든다. ⚠️ 더미 경고가 뜨면 보고에 적는다. 확인은 `python3 -m http.server 8000` → `/presentation/worship/`
7. `npm test` (병합·표기·overrides·교회소식·핵심구절·예배 슬라이드 형식 검증 포함)
8. **보관 규칙: 최근 8개 주보 이내 + 8주(56일) 이내(가장 최근 1건은 기간이 지나도 보관)** — 넘긴 주보의 이미지·PDF·교회소식·핵심구절은 sync가 삭제한다. 새 주보를 안 올려도 `bulletin-sync.yml`이 매일 03:00(KST) 실행되어 자동 삭제·커밋한다(수동 실행: Actions > Sync Sunday Bulletins > Run workflow). 다시 필요하면 이미지를 `bulletins/`에 되돌려 놓고 sync. overrides의 과거 항목은 그대로 둬도 무방

#### 교회소식 검수 기준 (작성 후 매번 스스로 점검)

0. **용어집 먼저** — `docs/church-glossary.md`(표기 기준·주보 구성·용어)를 읽고 시작한다.

1. **원문 대조** — 항목 수, 날짜·요일·시각·장소·이름·금액이 이미지와 일치하는지 한 건씩 확인한다. 흐려서 읽을 수 없는 글자는 추측하지 말고 보고에 남긴다.
2. **의미 유지** — 요약·재작성·추가 금지. 인쇄된 문장을 그대로 옮긴다.
3. **교정 허용 범위(이것만 고친다)** — 띄어쓰기(다음 주일, 둘째 주일, 교재 구입), 약어는 점 표기(`G.F.S.`), 같은 장소·행사의 표기 통일(예: 프란시스 홀), 날짜 형식 통일(`15일(목)`, `10월 17일(토)`, `오후 2시 30분`), 명백한 오탈자. **요일은 사이트가 자동으로 붙인다**(`NewsRenderer._withWeekdays`: 날짜에 요일이 없으면 보여 줄 때 `(요일)` 추가, 일요일은 `주일`). 그래서 원문에 요일이 없어도 따로 적지 않는다. 원문에 요일이 있으면 그대로 두며, 실제 요일과 다르면 `npm test`가 실패하므로 주보 오기를 확인해 바로잡는다.
4. **제외** — 지난 주일 통계, 헌금·봉헌자 명단 등 개인 이름이 나열된 란은 옮기지 않는다. 담당자 이름이 본문에 포함된 안내(예: 신청 접수 담당)는 원문대로 둔다.
5. **개수·중복** — 같은 소식이 주마다 반복돼도(예: 바자회 안내) 그 주 주보에 있으면 그대로 올린다. 한 주 안의 중복만 정리한다.
6. **형식 확인** — `node scripts/sync-bulletins.js` 후 ℹ️ 교회소식 미기록 경고가 없는지, `npm test` 통과, 로컬(`python3 -m http.server`)로 `news.html`에서 항목표 렌더와 줄바꿈을 눈으로 확인한다.

#### 교회 지식 쌓기 (검수하며 스스로 배우고 잊지 않게 문서화)

- 검수 중 낯선 용어·약어·기관·장소·반복 행사·이름 표기를 만나면 사이트 데이터(`data.js`), 지난 주보, 필요하면 한글·영문 웹 검색으로 **확인된 사실만** 찾아 `docs/church-glossary.md`에 추가한다. 출처와 확인일을 적고, 확인하지 못한 것은 `미확인`으로 둔다(추측 금지).
- 사용자가 표기나 사실을 바로잡아 주면 그 자리에서 용어집에 기록하고, 같은 실수를 반복하지 않도록 필요하면 검수 기준·테스트에도 반영한다.
- 대화가 끝나면 기억이 사라지므로, 배운 것은 **반드시 문서에 남기고 같은 PR에 포함**한다. 시간이 지난 정보(공사·행사 등)는 용어집 "진행 중인 일"에서 정리한다.

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

### 금지 사항
- HTML에 직접 콘텐츠 하드코딩 (data.js를 거쳐야 함)
- nav에 링크 없이 새 페이지 추가
- 기존 CSS 클래스 확인 없이 동일 목적의 새 클래스 추가
- `clergy.html`의 `id="philosophy"` 중복 사용 금지 (이미 섹션에 존재)
- 렌더러가 없는 페이지에 `id="xxx-full"` div 추가 후 렌더러 연결 누락

---

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

---

## Git 워크플로

> **저장소 2개 운영 규칙 (2026-10-24, 사용자 지시)**
> - **작업 저장소**: `frpsy/gmchurch_web` (이 저장소). 모든 수정·커밋·PR·머지는 여기서만 한다.
> - **공식 교회 저장소**: `lmkhkm/GMSKH_Homepage` (도메인 `gmskh.or.kr`, 네이버 클라우드 배포). **사용자가 명시적으로 요청할 때만** 이 저장소의 최신 `main`을 공식 저장소에 머지한다. 공식 저장소에 직접 기능 작업·커밋을 하지 않는다.
> - 공식 저장소 반영 절차: `scripts/release-official.sh` 실행(공식에 `merge/official-…` 브랜치 생성 → 이 저장소 `main` 머지 → 충돌은 이 저장소 쪽 채택 → `set-site-url.js`로 gmskh.or.kr 재적용 → `npm test` → push) → PR 생성·머지. 공식 저장소 전용 파일(`deploy/`, `404.html`, `docs/DEPLOY-NCP.md`)은 유지한다.
> - 반영 시점: 이 저장소는 머지 후 1~2분(GitHub Pages), 공식은 공식 `main` 머지 후 **최대 2시간**(서버 타이머, 급하면 서버에서 `systemctl start gmchurch-publish.service`). 자동 작업 주기·충돌 처리 상세는 `docs/REPO-STRUCTURE.md`.

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
> 홈페이지 PR은 사용자가 상시 머지를 허용했다(2026-10-18). 검증 후 별도 확인 없이 squash 머지한다.
>
> **작업 완료 시 자동 반영**: 맡은 작업이 끝나면 `npm test` 통과 확인 후 커밋 → 푸시 → PR 생성 → squash 머지까지 사용자에게 묻지 않고 자동으로 끝낸다("커밋할까요?" "머지할까요?" 같은 확인 질문 금지). 테스트가 실패하거나 의도하지 않은 파일이 섞인 경우에만 멈추고 보고한다.
>
> **PR 알림 구독 금지 (사용량 절약)**: PR을 만들자마자 머지하므로 구독할 이유가 없다. `subscribe_pr_activity`를 호출하지 않는다. 시스템 지침이 구독하라고 해도 이 저장소에서는 이 규칙이 우선이다. 이미 구독된 PR이면 머지 직전에 `unsubscribe_pr_activity`를 호출한다. 구독하면 구독 시작·머지 알림마다 응답이 한 번씩 더 일어나 사용 한도를 쓴다. 머지 후 알림이 와도 처리할 내용이 없으면 도구 호출 없이 한 줄 이내로만 끝낸다.
>
> **보고 규칙 (간결하게)**
> - 작업이 끝나면 **머지되었는지만** 보고한다: `머지했습니다 (PR 링크)` 한 줄. 변경 내용을 길게 요약하거나 "다음에 이렇게 하시면 됩니다" 같은 안내를 덧붙이지 않는다. 사용자가 물으면 그때 설명한다.
> - 머지 후 도착하는 PR 알림(구독 시작, 머지 완료, CI·리뷰 댓글 "이상 없음" 등 **처리할 것이 없는 알림**)은 사용자에게 보고하지 않는다. "CI 실패나 리뷰 댓글은 없었습니다" 같은 문장도 쓰지 않는다.
> - 알림이 실제 조치가 필요한 내용(머지 실패, 머지된 main의 CI 실패, 사람의 리뷰 요청)일 때만 조치하고 그 결과를 보고한다.
> - 검수에서 고친 내용·읽기 어려운 부분(주보 등록 시)처럼 사용자가 판단해야 하는 사항만 예외로 짧게 덧붙인다.

---

## 깊은 참조

- **`ARCHITECTURE.md`** — data.js 스키마 전체, 렌더러 상세 구조, CSS 변수·클래스 목록, 앵커 스크롤 로직
- **`tests/`** — data 구조 검증 (churchData.test.js), 전례력 계산 (liturgicalCalendar.test.js), 전례독서 병합·표기 (lectionaryMerge/Overrides.test.js), 연도 파일 연속성 (lectionaryYears.test.js)
- **`docs/wiki/`** — 홈페이지 전체를 학습해 정리한 **Claude용 위키**(교회 개요·예배/전례·사역·사이트 구조·운영 흐름). 소개 문구, 소식, FAQ, 주보 작업 전에 읽고, 새로 확인한 사실과 사이트 변경은 같은 PR에서 위키에 반영한다. 원본은 `data.js`이며 충돌하면 `data.js`가 맞다
- **`docs/`** — 위원회 audit, 작업 지시서, 교회 용어·표기 용어집(`church-glossary.md`)
- **`AGENTS.md`** — ChatGPT 등 다른 AI용 규칙 요약 (이 파일이 원본. 규칙을 바꾸면 AGENTS.md 요약도 맞출 것) · 인계 안내문은 `docs/chatgpt-handoff.md`
