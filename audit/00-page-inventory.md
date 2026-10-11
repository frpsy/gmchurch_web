# 00. 페이지 인벤토리 · 점검 환경

- 기준 커밋: `05777d2` (main, 2026-10-11) · 작업 브랜치: `improve/ui-consistency`
- 스택: 바닐라 HTML/CSS/JS, 빌드 없음. 로드 순서 `data.js` → `app.js` (`CLAUDE.md:19-21`)
- 배포: **GitHub Pages(main 자동 배포)**. 작업 지시서의 `gmchurchweb.netlify.app`은 `CLAUDE.md:25`에 따라 종료된 Netlify 주소이며 저장소에 Netlify 설정 파일이 없음 → 배포 설정은 점검·변경 대상에서 제외
- 실행: `python3 -m http.server 8000` (로컬 정적 서버). 빌드 단계 없음 → "빌드 성공" 기준은 `npm test`(Vitest 117개) 통과 + 렌더링 콘솔 오류 0건으로 대체
- 스타일: `style.css` 단일 파일(약 166KB), `:root` 디자인 토큰 이미 존재(`style.css:15-`), `@media` 71개, 다크모드 블록 다수
- 콘텐츠: `data.js`(`CHURCH_DATA`) 원본, 렌더러는 `app.js`

## 점검 대상 페이지 (20개)

| # | 파일 | 제목 | 렌더러 | noindex |
|---|---|---|---|---|
| 1 | index.html | 대한성공회 광명교회 (홈) | IndexRenderer | |
| 2 | clergy.html | 교회 소개 | Anglican/Clergy/AboutNav/Press | |
| 3 | faq.html | 자주 묻는 질문 | FaqRenderer | |
| 4 | worship.html | 예배와 기도 | WorshipRenderer | |
| 5 | bulletin.html | 주일 주보 | BulletinRenderer | ✓ |
| 6 | news.html | 교회 소식 | NewsRenderer | ✓ |
| 7 | newcomer.html | 처음 오신 분 | NewcomerRenderer | |
| 8 | community.html | 공동체 | CommunityRenderer | |
| 9 | giving.html | 헌금 | GivingRenderer | |
| 10 | media.html | 미디어·자료 | MediaHubRenderer | |
| 11 | videos.html | 영상 갤러리 | MediaRenderer | |
| 12 | gallery.html | 사진 갤러리 | PhotoGalleryRenderer | ✓ |
| 13 | links.html | 관련 기관 | LinksRenderer | |
| 14 | sundays.html | 교회력 | SundaysRenderer | |
| 15 | visit.html | 오시는 길 | VisitRenderer | |
| 16 | hopecenter.html | 광명 희망터 | 정적 | |
| 17 | emmaus.html | 엠마우스 코스 | 정적 | |
| 18 | smallgroup.html | 소그룹 모임 | SmallGroupRenderer | |
| 19 | greenchurch.html | 녹색교회 | 정적 | |
| 20 | privacy.html | 개인정보 처리방침 | 정적 | ✓ |

제외: `google65f0b8b3b88f2479.html` (검색엔진 소유 확인 파일, 화면 아님)

## 점검 해상도·도구

- 해상도: 360, 390, 768, 1024, 1440px (라이트). 다크모드는 390, 1440px
- 도구: Playwright Chromium(헤드리스) — `audit/tools/capture.py`
- 기준선: `audit/screenshots/baseline/` (140장, 83MB — 용량 때문에 커밋하지 않음, 스크립트로 재생성 가능), 계산된 스타일 `audit/metrics/baseline.json`
- 렌더링 환경 주의: 서버 환경의 Chromium·Noto CJK 폰트 기준. Pretendard 웹폰트는 로드 확인됨(`pretendardLoaded: true`). 실제 iOS Safari·안드로이드 기기 렌더링은 **미확인**

## 기준선 자동 점검 결과 (변경 전)

- 가로 스크롤(문서 scrollWidth > viewport): 20페이지 × 5해상도 **0건**
- 콘솔 오류: **0건**
- 깨진 이미지: 0건 (bulletin.html의 빈 src 1건은 렌더러가 채우기 전 자리표시 — 검수에서 확인)
