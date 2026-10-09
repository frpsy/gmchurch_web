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
# → PR 생성 → squash merge (저장소 정책: 확인 없이 즉시 머지)
```

- 커밋 메시지·PR 본문·코드 주석은 **한국어**. 주석은 "왜"만 짧게.
- `main`에 직접 push하지 않는다. 항상 브랜치 → PR.
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

## 문체·용어 (대한성공회 기준)

- 정중하고 담백하게. "아름다운·따뜻한·늘·든든한" 같은 꾸밈말을 쓰지 않는다.
- **하느님**(하나님 ✗), **공현절**(주현절 ✗), **감사성찬례**(예배·미사·성찬예배 혼용 ✗)
- 성서 책 이름은 **공동번역**: 마태·마르코·루가·요한, 창세·출애굽, 에페소·필립비·골로사이, 에제키엘, 즈가리야 등
- 성서 인용은 공동번역 본문 그대로. 절 표기는 `5:17`, 반절은 `상/하`(a/b ✗)

## 자주 하는 작업

| 작업 | 어디를 | 참고 |
|---|---|---|
| 문구·일정·연락처 수정 | `data.js` | 해당 키 검색 후 수정 |
| 매주 주보 등록 | `bulletins/YYYYMMDD_N.jpg` + `data/lectionary-overrides.json` | `CLAUDE.md` "주보 등록 절차" |
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
