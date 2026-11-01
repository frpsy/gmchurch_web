# AGENTS.md — AI 공동작업자 안내 (ChatGPT·Codex 등)

> 이 저장소는 여러 AI가 이어서 작업한다. **규칙의 원본은 [`CLAUDE.md`](CLAUDE.md)** 이고,
> 이 파일은 Claude가 아닌 에이전트가 같은 규칙으로 일하기 위한 요약이다.
> 둘이 다르면 `CLAUDE.md`가 우선한다. 규칙을 바꾸면 `CLAUDE.md`를 고치고 이 파일은 요약만 맞춘다.

## 프로젝트 한눈에

- **대한성공회 광명교회** 홈페이지 — `https://frpsy.github.io/gmchurch_web/`
- 바닐라 HTML + CSS + JS, **빌드 없음**. `main`에 머지되면 GitHub Pages가 자동 배포
- **Netlify는 종료됨** — PR의 `netlify[bot]` 배포 미리보기 코멘트·링크는 무시한다 (미리보기는 로컬 서버로)
- 콘텐츠는 전부 `data.js`의 `CHURCH_DATA` → `app.js`의 렌더러가 HTML의 빈 `<div id="…-full">`을 채움
- 전례독서: `data/lectionary-year-a.json`(가해)·`lectionary-year-b.json`(나해) + 주보 기록 `data/lectionary-overrides.json`
- 테스트: `npm test` (Vitest 90개). 로컬 미리보기: `python3 -m http.server 8000` → `http://localhost:8000`

## 저장소 2개 운영 규칙 (중요)

- 모든 작업은 이 저장소 `frpsy/gmchurch_web`에서만 한다.
- 공식 교회 저장소 `lmkhkm/GMSKH_Homepage`(gmskh.or.kr)에는 `scripts/release-official.sh`로 이 저장소 `main`을 머지한다. 직접 작업 금지. **주보·교회소식 등록은 항상 두 저장소에 동시에 머지**하고(사용자 지시 2026-11-01), 그 밖의 작업은 **사용자가 요청할 때만** 반영한다.
- 반영 시점: 개발 저장소는 머지 후 1~2분(GitHub Pages), 공식은 공식 `main` 머지 후 최대 2시간(서버 타이머). 상세는 `docs/REPO-STRUCTURE.md`.

- **모바일 주보 배포 원칙 (2026-11-01 사용자 확정)** — 모바일 주보와 본문·성가 악보 이미지는 공개 저장소에 반영하고 GitHub Pages의 `/jubo/`에 웹 배포한다(사용자 명시 승인, 2026-11-01). 교우가 웹에서 열어 보도록 하되, 링크 안내는 비공개 교회 밴드에서만 한다. 공개 홈페이지 본문·메뉴·푸터·사이트맵·공개 게시물에는 모바일 주보 링크나 홍보를 추가하지 않는다. “홈페이지에 게시하지 않는다”는 웹 배포 금지가 아니라 홈페이지에서 연결·홍보하지 않는다는 뜻이다. 이 범위의 커밋·푸시·PR·머지는 기존 자동 처리 절차로 진행하며 공개 접근 가능성을 이유로 매번 재승인을 요청하지 않는다. 비공개 밴드에 링크를 올려도 공개 저장소/GitHub Pages의 대상 파일 자체가 비공개로 전환되지는 않는다. 원본 PDF·악보 이미지의 공개 여부와 검색 제외는 별도로 관리하고, robots.txt나 링크 숨김만으로 비공개·검색 제외가 완료됐다고 기록하지 않는다.
- **성가 악보 원칙 (2026-11-01 사용자 확정)** — 단성판을 기본으로 사용하고 수록되지 않은 곡은 전체판에서 가져온다. 해당 곡의 악보 이미지를 그대로 기존 토글 안에 넣는다. PDF 전체 열기나 #page 링크로 대체하지 않는다. 원본 파일명은 영어로 단성판(unison)·전체판 및 분할 번호(part-01 등)를 구분하고, 문서의 자료명은 ‘성가’로 기록한다.

- 모바일 주보(`jubo/`): 이름은 "주보". 주보에 인쇄된 순서만 싣고 봉사자 구역·묵상란은 두지 않으며, 본기도는 사제·회중 응답 뒤에 본문을 둔다. 홈페이지에서 연결하지 않고(교우에게만 주소 안내), 주보 작업을 마치면 항상 모바일 주보를 만들어 링크(`https://frpsy.github.io/gmchurch_web/jubo/`)를 사용자에게 준다. 성경 본문(`readings.json`)·성가 악보·기도문을 토글 안에서 바로 보여 준다. 스크롤 중 다른 요소를 스크롤하거나 `scroll-behavior: smooth`·`backdrop-filter`를 쓰지 않는다. 링크는 `tests/juboLinks.test.js`가 점검한다. 상세는 CLAUDE.md 6-1.

## 작업 순서 (매번)

```bash
git fetch origin main
git checkout -b 작업자/작업명 origin/main      # 예: chatgpt/fix-footer-link
npm ci                                        # 최초 1회
# ... 수정 ...
npm test                                      # 반드시 통과
git add 수정한파일...                          # git add -A 금지
git commit -m "fix: 무엇을 왜 고쳤는지"         # 타입: feat/fix/refactor/chore/docs
git push -u origin 작업자/작업명
# → PR 생성 → squash merge (저장소 정책: 작업이 끝나면 커밋·푸시·PR·머지를 묻지 않고 자동으로 진행하고, 보고는 "머지했습니다"만 한 줄로. 처리할 것 없는 PR 알림은 보고하지 않는다)
```

- 커밋 메시지·PR 본문·코드 주석은 **한국어**. 주석은 "왜"만 짧게.
- `main`에 직접 push하지 않는다. 항상 브랜치 → PR.
- 홈페이지 PR은 사용자가 상시 머지를 허용했다(2026-10-18). 검증 후 별도 확인 없이 squash 머지한다.
- PR은 만들자마자 머지하므로 PR 알림 구독(`subscribe_pr_activity`)은 하지 않는다(알림마다 응답이 늘어 사용 한도를 쓴다). 자세한 기준은 `CLAUDE.md`.
- `?v=` 캐시 번호는 머지 후 CI(`cache-bust.yml`)가 자동 갱신하므로 손대지 않아도 된다.

## 꼭 지킬 것 (어기면 사이트가 깨지거나 내용이 틀어짐)

1. **콘텐츠는 `data.js`에만.** HTML에 문구를 직접 쓰지 않는다. (예외: `clergy.html`의 교회 이야기 `#identity`, 렌더러 없는 상세 페이지)
2. **새 페이지 = 메뉴 연결.** `data.js`의 `navigation` 또는 푸터에서 갈 수 있어야 한다. 모든 HTML에 skip-link·`#main-nav`·`#main-content`·`#main-footer` 필수.
3. **색은 CSS 변수만.** `#rrggbb` 하드코딩 금지 — 다크모드에서 글자가 사라진다. 불가피하면 `@media (prefers-color-scheme: dark)` 대응값을 함께 넣는다. 새 색은 라이트·다크 모두 대비 4.5:1 이상.
4. **새 CSS 클래스 전에** `ARCHITECTURE.md`의 클래스 목록에서 재사용할 것을 먼저 찾는다.
5. **전례독서 병합 규칙은 두 곳에 있다:** `scripts/lib/lectionary.js`(스크립트·테스트)와 `app.js`의 `SundaysRenderer._applyOverrides`(브라우저). 한쪽을 고치면 다른 쪽도.
   연도 파일 목록도 두 곳(`STANDARD_FILES`, `_LECTIONARY_FILES`) — 테스트가 일치 여부를 검사한다.
6. **로고 글자.** 메뉴·푸터 로고 서체는 로고 글자 11자만 담은 서브셋(`fonts/brand-serif.woff2`)이다. `info.name`·`info.tagline`을 바꾸면 서브셋을 다시 만들어야 한다(없는 글자는 기본 서체로 보임).
7. **주보·전례독서는 추측 금지.** 주보 예배 순서면에 인쇄된 값만 기록한다.
8. **디자인 취향.** 설명글·캡션은 가운데 정렬 + 연한 진회색(`color-mix(in srgb, var(--text) 72%, var(--white))`), 문단 바로 뒤 버튼은 위 여백 약 1.25rem. 한 단락의 제목과 본문은 같은 칼럼 폭(예배 페이지 760px)에 둔다. 모호한 요청은 되묻지 않고 합리적으로 해석해 적용한 뒤 해석을 한 줄로 알린다(자세한 기준은 `CLAUDE.md`).

## 문체·용어 (대한성공회 기준)

- 정중하고 담백하게. "아름다운·따뜻한·늘·든든한" 같은 꾸밈말을 쓰지 않는다.
- **하느님**(하나님 ✗), **공현절**(주현절 ✗), **감사성찬례**(예배·미사·성찬예배 혼용 ✗)
- 성서 책 이름은 **공동번역**: 마태·마르코·루가·요한, 창세·출애굽, 에페소·필립비·골로사이, 에제키엘, 즈가리야 등
- 성서 인용은 공동번역 본문 그대로. 절 표기는 `5:17`, 반절은 `상/하`(a/b ✗)

## 자주 하는 작업

| 작업 | 어디를 | 참고 |
|---|---|---|
| 문구·일정·연락처 수정 | `data.js` | 해당 키 검색 후 수정 |
| 매주 주보 등록 | `bulletins/YYYYMMDD_N.jpg` + `data/lectionary-overrides.json` + `data/bulletin-news.json`(교회소식) + `data/bulletin-verses.json`(핵심구절, 공동번역 `bible/` 대조) + `data/worship-order.json`(예배 순서 → `node scripts/build-worship-slides.js`로 예배 슬라이드 생성) — 주보를 받으면 묻지 말고 이미지에서 교회소식·핵심구절까지 직접 작성·검수 | `CLAUDE.md` "주보 등록 절차"·"교회소식 검수 기준"·"교회 지식 쌓기", 용어집 `docs/church-glossary.md`, 위키 `docs/wiki/README.md` |
| 다해(C년) 전례독서 | `data/lectionary-year-c.json` + 목록 두 곳 | **2027-11-28 대림 제1주일 전까지** |
| 메뉴 추가·변경 | `data.js` → `navigation` | 아래 nav 검증 명령 실행 |
| 아이콘 | `images/icons.svg` (아이콘 팩) | 이모티콘 금지 — data.js엔 심볼 이름, app.js는 `icon('name')` |
| 로고·공유 이미지 | `app.js` `ARCH_MARK_PATH`, `scripts/brand/` | 아이콘·OG는 템플릿 HTML을 스크린샷 |

## 커밋 전 검증

```bash
npm test
node -e "
const fs=require('fs');eval(fs.readFileSync('data.js','utf8').replace('const CHURCH_DATA','global.CHURCH_DATA'));
let ok=true;CHURCH_DATA.navigation.forEach(i=>{const[p]=i.href.split('#');if(p&&!fs.existsSync(p)){console.log('MISSING',p);ok=false}
(i.items||[]).forEach(s=>{const[sp]=s.href.split('#');if(sp&&!fs.existsSync(sp)){console.log('MISSING',sp);ok=false}})});if(ok)console.log('All nav links OK')"
```

화면을 바꿨다면 휴대폰 폭(320·390px)과 다크모드에서 직접 확인한다. 가로 스크롤·글자 잘림·버튼 겹침이 없어야 한다.

## 더 깊이

- [`CLAUDE.md`](CLAUDE.md) — 전체 규칙·절차 (원본)
- [`ARCHITECTURE.md`](ARCHITECTURE.md) — `data.js` 스키마, 렌더러 구조, CSS 변수·클래스 목록
- [`docs/chatgpt-handoff.md`](docs/chatgpt-handoff.md) — ChatGPT에 붙여넣는 시작 안내문, 현재 남은 일

- **기준 화면과 재사용 스킬 (2026-11-01 사용자 확정)** — https://frpsy.github.io/gmchurch_web/jubo/ 의 현재 구성을 매주 유지한다. 주보 작업 전에 [모바일 주보 스킬](.agents/skills/gmchurch-mobile-bulletin/SKILL.md)을 읽는다. 상단·탭 → 표지 → 이번 주 말씀 → 예배 순서(본문·악보·기도문 토글) → 교회소식 → 안내 순서를 따른다. 날짜·내용을 갱신하되 사용자 요청 없이 디자인을 재구성하지 않는다.

- **고령 교우의 화면 이동 최소화 (2026-11-01 사용자 확정)** — 예배 중 필요한 성경 말씀 전문·설교의 바탕 본문·기도문·성가 악보는 모바일 주보의 해당 항목 안에서 펼쳐 읽는다. 설교 항목에도 해당 성경 본문 전문을 표시한다. 실제 설교 원고 전문은 제공받은 경우에만 싣고 임의로 만들지 않는다. 악보를 눌러 새 탭·이미지 화면으로 이동시키지 않고 현재 화면에서 두 손가락 확대를 이용한다. 자료가 빠졌다고 외부 링크로 대체하지 말고 원문을 확보해 보완한다. 안내 영역의 선택적 외부 링크와 예배 중 필수 자료를 구분한다.

- **교회 맥락으로 기도문 완성 (2026-11-01 사용자 확인)** — 기도서 양식의 ‘우리 주교 ( )’ 등 교회가 채우는 빈칸은 홈페이지 ‘섬기는 이들’의 `data.js`와 교차 확인한다. 현재 서울교구장 주교는 `CHURCH_DATA.bishop.name`의 김장환(엘리야) 주교다. 모바일 주보의 ‘우리 주교’에는 이 값을 연결해 빈칸을 남기지 않으며 이름을 여러 파일에 하드코딩하지 않는다. 기도서 원본 양식은 보존하고 표시할 때 교회 정보를 적용한다. 다른 인물·직책도 해당 공식 데이터와 확인된 문맥으로 채우되, 미확인 이름·의향은 추측하지 않는다. 과거 인물·연혁을 현재 인물로 일괄 치환하지 않는다.
