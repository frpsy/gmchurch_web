# 광명교회 웹사이트 — Claude 작업 기준

## 프로젝트 개요

바닐라 HTML + CSS + JS. 빌드 도구 없음. GitHub Pages 정적 배포.

- `data.js` — 모든 콘텐츠 데이터 단일 소스 (nav, footer, 예배, 헌금 등)
- `app.js` — 렌더러 모음 (NavRenderer, FooterRenderer, 각 페이지 컴포넌트)
- `style.css` — 전역 스타일

---

## 페이지 목록 (전체)

| 파일 | 역할 |
|---|---|
| `index.html` | 메인 홈 |
| `clergy.html` | 교회 소개 (성공회란, 섬기는 이들, 교회 철학, 로고, 언론) |
| `story.html` | 교회 이야기 (What We Cherish) |
| `worship.html` | 예배 안내 |
| `newcomer.html` | 처음 오신 분 |
| `community.html` | 공동체 (희망터, 엠마우스, 소그룹, 애찬) |
| `giving.html` | 헌금 |
| `media.html` | 교회 영상 |
| `links.html` | 관련 기관 |
| `visit.html` | 오시는 길 |
| `hopecenter.html` | 광명 희망터 상세 |
| `emmaus.html` | 엠마우스 코스 상세 |
| `smallgroup.html` | 소그룹 모임 상세 |
| `privacy.html` | 개인정보처리방침 |

---

## 내비게이션 규칙 — 반드시 확인

**모든 HTML 페이지는 내비게이션 또는 footer에서 반드시 도달 가능해야 한다.**

- nav 데이터 위치: `data.js` → `CHURCH_DATA.navigation`
- 새 페이지 추가 시 nav 항목(또는 footer 링크)도 반드시 함께 추가
- nav는 JS(`NavRenderer.render()`)로 동적 렌더링 → 모든 `.html`이 `data.js`와 `app.js`를 포함하면 자동 적용됨

### 현재 nav 구조

```
교회 소개 (clergy.html)
  ├ 성공회란?  clergy.html#what-is-anglican
  ├ 대한성공회  clergy.html#ack
  ├ 섬기는 이들  clergy.html#priest-section
  ├ 교회 철학  clergy.html#philosophy
  ├ 교회 이야기  story.html
  ├ 로고 소개  clergy.html#logo-intro
  └ 언론 보도  clergy.html#press

예배 (worship.html)
처음 오신 분 (newcomer.html)

공동체 (community.html)
  ├ 광명 희망터  community.html#hopecenter
  ├ 엠마우스 코스  community.html#emmaus
  ├ 소그룹 모임  community.html#smallgroup
  ├ 주일 애찬  community.html#agape
  └ 헌금  giving.html

미디어·자료 (media.html)
  ├ 교회 영상  media.html
  └ 관련 기관  links.html

오시는 길 (visit.html)
```

---

## 에셋 버전 관리

CSS/JS 변경 시 모든 HTML 파일의 `?v=YYYYMMDD` 쿼리를 당일 날짜로 일괄 갱신해야 한다.

```html
<link rel="stylesheet" href="style.css?v=20260601">
<script src="data.js?v=20260601"></script>
<script src="app.js?v=20260601"></script>
```

CI 워크플로(`bump-asset-version.yml`)가 `app.js`/`style.css` 변경을 감지해 자동 갱신하지만, 수동 작업 시에는 직접 날짜를 업데이트한다.

---

## 커밋 전 체크리스트

- [ ] 새 페이지를 추가했다면 nav 항목도 추가했는가?
- [ ] 페이지를 제거했다면 nav·footer 링크도 제거했는가?
- [ ] `data.js` 또는 `app.js`를 수정했다면 모든 HTML의 `?v=` 날짜를 갱신했는가?
- [ ] 모든 내부 링크(`href`)가 실제 존재하는 파일/앵커를 가리키는가?
- [ ] 새 CSS 클래스를 추가했다면 `style.css`에 정의되어 있는가?
- [ ] 모든 HTML 파일에 `data.js`와 `app.js` `<script>` 태그가 있는가?
- [ ] `<nav id="main-nav" class="nav-header">`, `<footer id="main-footer">` 가 있는가?

---

## 코드 스타일

- 주석: 한국어 사용, 꼭 필요한 경우만
- 텍스트 문체: 정중하고 담백하게. 과도한 수식어("아름다운", "따뜻한" 등)는 지양
- `draft-banner` 클래스: 임시 페이지 안내용. 정식 전환 시 반드시 제거
- 배지(`badge: "임시"`): 정식 전환된 페이지에서 반드시 제거
- 에러 없는 배포를 위해 HTML 유효성, JS 콘솔 오류, 깨진 링크를 항상 확인
