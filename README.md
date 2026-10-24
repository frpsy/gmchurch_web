# 대한성공회 광명교회 웹사이트

> 녹색교회, 모든 생명을 환대하는 교회  
> **공식 주소**: https://gmskh.or.kr  
> **개발·미리보기 주소**: https://frpsy.github.io/gmchurch_web

## 개요

빌드 없는 순수 정적 사이트입니다. HTML + CSS + Vanilla JS로만 구성되며, npm 설치나 빌드 명령 없이 파일을 그대로 서빙합니다.

| 항목 | 내용 |
|------|------|
| 개발 저장소 | `frpsy/gmchurch_web` — 모든 작업은 여기서 |
| 공식 저장소 | `lmkhkm/GMSKH_Homepage` — 요청할 때만 개발 `main`을 머지 |
| 배포 | 개발: GitHub Pages(머지 후 1~2분) · 공식: 네이버 클라우드 서버가 2시간마다 `main`을 받아 감 |
| 기술 스택 | HTML5 · CSS3 · Vanilla JS (ES6+) |
| 외부 의존 | Pretendard CDN · Google Maps iframe · Unsplash 이미지 1개 |

## 저장소 2개 운영 (중요)

이 README는 두 저장소에 똑같이 들어 있습니다.

- **개발 저장소** [`frpsy/gmchurch_web`](https://github.com/frpsy/gmchurch_web): 모든 수정·주보 등록은 여기서 PR로 합니다. 머지하면 frpsy.github.io에 1~2분 안에 반영되어 먼저 확인할 수 있습니다.
- **공식 저장소** [`lmkhkm/GMSKH_Homepage`](https://github.com/lmkhkm/GMSKH_Homepage): 직접 고치지 않습니다. 요청이 있을 때 `scripts/release-official.sh`로 개발 `main`을 머지하면, 서버가 **최대 2시간 안에** gmskh.or.kr에 반영합니다.
- 자동 작업: cache-bust(`main`에 js·css·svg 변경 시 `?v=` 갱신), 주보 동기화(주보 이미지 push 시 + 매일 03:00 한국시간)가 두 저장소에서 각각 돕니다.

흐름·주기·충돌 처리 상세는 [docs/REPO-STRUCTURE.md](./docs/REPO-STRUCTURE.md)를 보세요. 서버 설정은 공식 저장소의 `docs/DEPLOY-NCP.md`에 있습니다.

## 파일 구조

```
gmchurch_web/
├── index.html        메인 페이지 (메인 정보 + 예배 · 방문 요약)
├── clergy.html       교회 소개 (성공회란? · 사제 · 철학 · 교회 이야기 · 로고 · 언론)
├── faq.html          자주 묻는 질문 (성공회 오해·궁금증 FAQ, 가안)
├── worship.html      예배 안내 (예배 카드 · 감사성찬례 순서 · 예배 자료)
├── newcomer.html     처음 오신 분 (환영 · 참여 안내 · 전례 · 영성체 · 문의)
├── community.html    공동체 (희망터 · 엠마우스 · 소그룹 · 녹색교회)
├── sundays.html      교회력 허브 (이달의 교회력 · 전례독서 · 절기 · 특별 주일)
├── emmaus.html       엠마우스 코스 상세 페이지
├── hopecenter.html   광명 희망터 상세 페이지
├── smallgroup.html   소그룹 모임 상세 페이지
├── greenchurch.html  녹색교회 상세 페이지
├── links.html        관련 기관 상세 페이지
├── media.html        미디어·자료 허브 (영상 · 사진 · 관련 기관 카드 링크)
├── videos.html       영상 갤러리 상세 페이지
├── gallery.html      사진 갤러리 상세 페이지 (noindex)
├── visit.html        오시는 길 (지도 · 교통 · 주차)
├── giving.html       헌금 (헌금 계좌 · 영수증 안내)
├── privacy.html      개인정보 처리방침 (noindex)
├── data.js           ★ 단일 콘텐츠 소스 (1081줄)
├── app.js            렌더러 모음 + App bootstrap (2211줄)
├── style.css         전체 스타일 (4128줄)
├── favicon.svg       교회 로고 아이콘 ('열린 빛')
├── apple-touch-icon.png
├── images/           brand/(OG 이미지) · clergy/(성직자 사진) · hero/(상단 이미지) · gallery/(카테고리별 사진) · icons.svg
├── fonts/            로고 워드마크 서체 서브셋
├── robots.txt
├── sitemap.xml
├── docs/             저장소 운영 구조(REPO-STRUCTURE.md) · 위키 · 용어집 · audit 보고서
├── scripts/          주보 동기화 · 공식 반영(release-official.sh) · 도메인 교체 · OG 이미지 생성
├── tests/            테스트 코드 (전례력 · 데이터 검증)
└── ARCHITECTURE.md   개발 가이드 (AI·개발자·구조 설명용)
```

## 주요 페이지

- **메인 페이지** (`index.html`) — 교회 소개, 예배 시간, 찾아오시는 길 요약
- **교회 소개** (`clergy.html`) — 성공회 신앙, 관할사제 소개, 교회 철학, 교회 이야기(5대 정체성 서사), 캔터베리 십자가, 언론 보도
- **자주 묻는 질문** (`faq.html`) — 성공회에 대한 흔한 오해와 궁금증(이단·교파·구원·여성 사제·동성애 등)을 출처와 함께 정리 (가안)
- **예배 안내** (`worship.html`) — 주일 예배·어린이 예배, 감사성찬례 순서, 예배 자료 (기도서·성가·성서 온라인 링크)
- **처음 오신 분** (`newcomer.html`) — 환영 인사, 참여 안내 체크리스트, 성공회 전례 소개, 전례 공간 안내, 영성체 안내
- **교회력** (`sundays.html`) — 이달의 교회력, 전례독서, 절기 안내, 특별 주일
- **공동체** (`community.html`) — 광명 희망터, 엠마우스 코스, 소그룹 모임 소개
- **오시는 길** (`visit.html`) — Google Maps 지도, 대중교통, 주차 안내
- **헌금** (`giving.html`) — 헌금 계좌, 기부금 영수증 안내
- **미디어·자료** (`media.html`) — 영상·사진 갤러리, 관련 기관으로 이어지는 허브
- **영상 갤러리** (`videos.html`) — 성공회·신앙·공동체 관련 유튜브 영상 소개
- **사진 갤러리** (`gallery.html`) — 예배·나눔·절기의 순간을 담은 사진 모음

## 콘텐츠 수정 방법

텍스트·일정 등 콘텐츠는 **`data.js`의 `CHURCH_DATA` 객체만 편집**하면 됩니다.  
레이아웃/동작 변경은 `app.js`, 스타일 변경은 `style.css`를 수정합니다.

자세한 구조 설명은 [ARCHITECTURE.md](./ARCHITECTURE.md)를 참고하세요.

## 로컬 실행

```bash
git clone https://github.com/frpsy/gmchurch_web.git
cd gmchurch_web
# 빌드 불필요 — 아무 정적 서버로 바로 실행 가능
npx serve .
# 또는 VS Code Live Server 확장 사용
```

## 기여 방법

```bash
# 개발 저장소에서
git fetch origin main
git checkout -b claude/작업명 origin/main
# 작업 후
npm test
git add 파일
git commit -m "설명"
git push -u origin claude/작업명
# PR 생성 → main에 머지 → GitHub Pages(frpsy.github.io) 자동 배포

# 공식 주소(gmskh.or.kr)에 내보낼 때만 (요청이 있을 때)
scripts/release-official.sh
# → 공식 저장소에 머지 브랜치 push → PR 머지 → 서버가 2시간 안에 반영
```

> **주의**: React · TypeScript · Vite 등 프레임워크·빌드 도구 도입은 위원회 사전 협의 없이 금지입니다.
