# 대한성공회 광명교회 웹사이트

> 녹색 교회, 모든 생명을 환대하는 교회  
> **배포 주소**: https://frpsy.github.io/gmchurch_web

## 개요

빌드 없는 순수 정적 사이트입니다. HTML + CSS + Vanilla JS로만 구성되며, npm 설치나 빌드 명령 없이 파일을 그대로 서빙합니다.

| 항목 | 내용 |
|------|------|
| 저장소 | `frpsy/gmchurch_web` |
| 배포 | GitHub Pages (main 브랜치 자동 배포) |
| 기술 스택 | HTML5 · CSS3 · Vanilla JS (ES6+) |
| 외부 의존 | Pretendard CDN · Google Maps iframe · Unsplash 이미지 1개 |

## 파일 구조

```
gmchurch_web/
├── index.html        메인 페이지
├── clergy.html       교회 소개 (성공회·사제·철학·로고·언론)
├── worship.html      예배 안내 + 전례 가이드
├── community.html    공동체 (희망터·엠마우스·소그룹)
├── visit.html        오시는 길 (지도·교통·주차)
├── giving.html       헌금 (봉헌 계좌)
├── privacy.html      개인정보 처리방침
├── data.js           ★ 단일 콘텐츠 소스 (CHURCH_DATA)
├── app.js            렌더러 모음 + App bootstrap (~807줄)
├── style.css         전체 스타일 (~1443줄)
├── favicon.svg       캔터베리 십자가 아이콘
├── apple-touch-icon.png
├── og-image-v2.png   소셜 공유 OG 이미지
├── robots.txt
├── sitemap.xml
├── docs/             위원회 audit 보고서 · 작업 지시서
└── CLAUDE.md         개발 가이드 (AI·개발자용)
```

## 콘텐츠 수정 방법

텍스트·일정 등 콘텐츠는 **`data.js`의 `CHURCH_DATA` 객체만 편집**하면 됩니다.  
레이아웃/동작 변경은 `app.js`, 스타일 변경은 `style.css`를 수정합니다.

자세한 구조 설명은 [CLAUDE.md](./CLAUDE.md)를 참고하세요.

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
git fetch origin main
git checkout -b claude/작업명 origin/main
# 작업 후
git add 파일
git commit -m "설명"
git push -u origin claude/작업명
# PR 생성 → main에 머지 → GitHub Pages 자동 배포
```

> **주의**: React · TypeScript · Vite 등 프레임워크·빌드 도구 도입은 위원회 사전 협의 없이 금지입니다.
