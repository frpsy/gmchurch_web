# 사이트 구조와 운영 정책

기술 규칙과 스키마는 `CLAUDE.md`, `ARCHITECTURE.md`가 원본이다. 여기에는 지도와 요약만 둔다.

## 스택·배포
바닐라 HTML+CSS+JS, 빌드 없음. GitHub Pages(`main` 자동 배포). 로드 순서 `data.js` → `app.js`. 테스트 `npm test`(Vitest). Netlify는 쓰지 않으며 봇 알림은 무시한다.

## 페이지 지도 (20개)
| 페이지 | 용도 | 비고 |
|---|---|---|
| index | 홈: 소개·예배·다가오는 주일 독서·처음 오셨나요 카드·오시는 길 | |
| clergy | 교회 소개: 성공회란, 대한성공회, 섬기는 이들, 교회 이야기, 교회 연혁(`history`), 로고, 언론 | `#identity`는 정적 HTML |
| faq | 자주 묻는 질문 | 가안 |
| worship | 예배 안내·감사성찬례 순서·성무일과·기도서와 성가 | |
| bulletin | 주일 주보(이미지·PDF) | noindex |
| news | 교회 소식(주보 교회소식, 날짜별 목록) | noindex |
| newcomer | 처음 오신 분: 참여 안내, 전례, 공간, 영성체, 문의 | |
| community | 공동체 허브 | |
| hopecenter / emmaus / smallgroup | 사역 상세 | 엠마우스 가안 |
| greenchurch | 녹색교회 | |
| sundays | 교회력 허브: 이달의 교회력·전례독서·절기·특별 주일 | |
| media / videos / gallery / links | 미디어·자료 | gallery noindex |
| visit | 오시는 길(지도·버스 505, 5627, 5633, 6637 `온신초등학교앞`·무료 주차) | |
| giving | 헌금 안내(계좌, 분기별 재정 공개, 기부금 영수증은 사무실 문의) | |
| privacy | 개인정보 처리방침(시행 2026-05-29, 책임자 관할사제) | noindex |
메뉴: 교회 소개 / 예배와 기도 / **주보·소식**(주일 주보, 교회 소식 — 2026-10-11 예배와 기도에서 분리, 상위 메뉴 8개) / 교회력 / 처음 오신 분 / 공동체 / 미디어·자료 / 오시는 길. 푸터에 봉헌, 로고 소개, 언론 보도, 개인정보.

## 데이터 (`data.js` `CHURCH_DATA` 최상위 키)
`info, ui, home, anglican, logo, ministerSection, clergy, officers, bishop, philosophy, history, aboutJourney, worship, community, giving, visit, sns, press, liveUrl, media, links, faq, sundays, bulletins, photoGallery, navigation`. 콘텐츠는 여기에만 두고 HTML에 직접 쓰지 않는다. `LiturgicalCalendar.compute()`가 오늘의 절기·색을 계산한다.

## 자동화
- `bulletin-sync.yml`: 주보 이미지 push 시 + 매일 03:00(KST) `scripts/sync-bulletins.js` 실행. 보관은 최근 8개·56일 이내(최신 1건은 보존). 테스트 통과 시에만 커밋.
- `cache-bust.yml`: main에 js/css/svg 변경이 머지되면 HTML의 `?v=`를 커밋 SHA로 갱신.
- `sync-bulletins.js`가 하는 일: 이미지→PDF, `bulletins.items`(날짜·주일명·이미지·PDF·교회소식), `worship.currentReadings/nextReadings` 자동 파생, 경고(트랙·시편·교회소식 미기록).

## 정책
- 개인정보: 회원가입·로그인·문의 양식 없음, 자체 쿠키·분석·광고 추적 없음. 외부 서비스(Google 지도, YouTube, Instagram, 네이버, 카카오, jsDelivr, GitHub Pages)로 접속 정보가 전달될 수 있다고 방침에 명시. **이 방침과 어긋나는 기능(분석 스크립트, 입력 폼 등)을 넣지 않는다.**
- 교회소식 날짜에는 요일이 자동으로 붙는다(`NewsRenderer._withWeekdays`, 주보 날짜 기준). 목록의 주 날짜에도 `(주일)`이 붙는다.
- 주보 헌금 명단 등 개인 이름 나열은 사이트에 올리지 않는다.
- 다크모드·색 변수 규칙은 `CLAUDE.md`를 따른다.

## 알려진 이슈 (2026-10-11 위키 작성 중 발견, 요청 시 처리)
- `README.md`의 줄 수 표기(data.js 1081줄 등)가 오래됐다. 현재 data.js 약 1340줄, app.js 약 3200줄, style.css 약 5300줄.
- `README.md` 파일 구조·주요 페이지에 `bulletin.html`, `news.html`이 없고 community 설명에 `녹색교회`가 포함돼 있어 현재 구조와 다르다.
- `emmaus.html`, `faq.html`은 가안 표기가 남아 있다. 정식 전환 시 `draft-banner`/`badge: "임시"`를 제거한다(`CLAUDE.md`).
- `data.js`의 `info.vision`은 `하느님 나라를 살아가는 사랑의 공동체`, 주보는 이를 `교구 표어`라 하고 `교회 표어`는 `함께 배우고, 함께 돌보는 교회`다. 사이트에는 교회 표어가 없다.


## 어린이 예배 소개 (2026-10-18)
- `hopecenter.html` → `HopeCenterRenderer` → `CHURCH_DATA.hopeCenter`(교회 제공 소개문 2026-10-21). 구성: 사진+설립 요약 → 토요일의 나눔 3단계 → 걸어온 길 → 비전 → 함께하기(총무는 `officers`의 `희망터 총무`에서 파생). 사진 `images/hopecenter/`(배달 사진은 받는 분 얼굴·주소 표지판이 보이지 않게 잘라 씀). 검색 색인은 `_extractContent`에서 data로 추출.
- `children.html` → `ChildrenRenderer` → `CHURCH_DATA.childrenWorship`. 예배와 기도 하위 메뉴와 기존 어린이 예배 카드에서 연결. 하단에서 `smallgroup.html#parents`(주일학교 양육자모임)로 연결.
- 사용자가 제공한 소개문, 활동 사진 4장, 예수님과 어린이 그림을 사용. 사진 날짜·참여 연령 등 미확인 사실은 추가하지 않음.
- 시간과 영성체 안내는 `worship.main`의 어린이 예배 항목에서 파생. 장소는 교육관. 이미지 `images/children/`, 반응형 스타일 `.children-*`.
- 2026-10-18 문구를 담백한 표현으로 다듬고(은유·수식 제거, 사실은 기존 내용 그대로), 그림·사진 5종의 색감을 보정함(푸른 기 완화, 대비·채도 소폭 조정, 파일명·크기 동일).
- 2026-10-18 UX 점검: 히어로 버튼 「시간·장소 보기」, 하단 제목 「참여 안내」(「전체 예배 안내」와 구분), 히어로 그림 가장자리의 희미한 세로선 제거, 홈 어린이 예배 카드의 그림 링크는 탭 순서에서 제외(글 링크와 중복). 히어로 그림은 손이 잘리지 않은 원본(1440×720, 비율 2:1)으로 교체함.

- 홈페이지 어린이 예배 카드에도 글씨를 제거한 최종 그림과 소개 페이지 링크를 연결. 사이트 검색의 어린이 예배 결과도 상세 페이지로 이동.
