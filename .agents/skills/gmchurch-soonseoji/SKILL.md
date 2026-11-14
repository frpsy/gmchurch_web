---
name: gmchurch-soonseoji
description: 광명교회 순서지(모바일 주보 jubo/) 제작 요청 시 사용한다. "순서지", "주보제작", 주보 이미지 전달 때 주보 이미지부터 두 저장소 배포·링크 보고까지 한 번에 진행하는 실행 절차와 사용자가 확정한 상시 규칙을 담는다.
---
# 순서지 제작 (실행 절차)

"순서지"는 모바일 주보(`jubo/`)를 줄여 부르는 말이다(2026-11-05). 페이지 이름은 "주보"로 유지한다. 이 문서는 실행 순서와 상시 규칙의 요약이고, 상세 근거는 아래 문서를 먼저 읽는다.

## 먼저 읽을 것
1. `AGENTS.md` "주보 요점"
2. `docs/mobile-bulletin-rules.md`(운영 원칙, 우선) → `docs/bulletin-procedure.md` 6-1 → `.agents/skills/gmchurch-mobile-bulletin/SKILL.md`(화면 구성·모바일 확인 상세)
3. 사용자 후속 지시가 문서보다 우선한다. 규칙이 바뀌면 같은 작업에서 위 문서와 이 스킬도 함께 고친다.

## 요청어
- 주보 이미지만 오면 묻지 않고 한 세트로 진행: 홈페이지 주보 게시(`bulletin.html`) + 순서지 제작 + 주보 내용 텍스트 정리. 예배 슬라이드 생성은 하지 않는다.
- `주보제작`: 제작·검수·두 저장소 배포·링크 보고까지. `주보검수`: 점검·보고만(게시·수정 금지).

## 제작 순서
1. 주보 이미지를 읽어 예배 순서·교회소식을 옮긴다. 인쇄된 값만 쓰고 이름·본문은 추측하지 않는다(위키·`data.js`·용어집으로 확인, 읽기 어려운 글자는 보고에 남긴다).
2. `data/worship-order.json`에 그 주 항목을 넣고 `node scripts/build-worship-slides.js`로 `data/worship/YYYYMMDD.book.json`을 만든다.
3. `data/jubo/YYYYMMDD.json`에 호수·날짜·표지 그림·예배 시간·본기도를 적고, `data/jubo/index.json`의 `dates` 맨 앞에 새 날짜를 넣는다.
4. 독서 본문은 `node scripts/extract-bible.js "<구절>" --write`로 `data/worship-texts/readings.json`에 넣는다. 쉼표로 이은 구절의 키는 짧은 책 이름(`야고 1:17-18,21-27`)으로 적는다.
5. 성시는 비우지 않는다. `node scripts/extract-psalm.js <편> --write` 후 `lines`를 `worship-order.json`에 넣는다(교회 관례: 1~6절 + 영광송). 주보 본문이 그 주 시편과 다르면 올바른 본문으로 채우고 보고에 적는다.
6. 성가 악보는 단성판 우선(없으면 전체판), 번호·제목·이미지를 대조하고 여러 쪽은 순서대로 모두 넣는다. `book.json` 생성 뒤 `node scripts/hymnal-web-exclude.js`를 실행한다.
7. `data/bulletin-news.json`·`data/bulletin-verses.json`을 채우고, 교회소식은 인쇄된 글과 줄 단위로 대조한다(소그룹 명단 등 빠진 줄 없게).
8. 홈페이지 주보 게시판용 이미지를 `bulletins/`에 두고 `node scripts/sync-bulletins.js`를 실행한다(최근 8개만 유지).
9. `npm test` 통과 확인 → 브랜치 → 커밋(한국어 메시지, `git add -A` 금지) → PR → squash 머지까지 묻지 않고 끝낸다.
10. 개발 머지 뒤 같은 작업 안에서 `scripts/release-official.sh` → 공식 PR → squash 머지(주보·교회소식 포함 항상 두 곳).

## 순서지 상시 규칙 (사용자 확정)
- **온 가족 예배 예식문(2026-11-15)**: 따로 받은 예식문 PDF가 있으면 순서·봉사자는 주보대로, 글은 예식문대로 `type: "text"` 항목에 적는다. 찬양 악보는 PDF에서 뽑아 `data/worship/scores/`에, 기도문 사이 악보는 `lines`의 `{img}` 줄로 넣는다(상세 `docs/bulletin-procedure.md` 6-1).
- **디자인 고정(2026-11-05)**: 데이터만 교체한다. 레이아웃·색·버튼·문구 요소를 바꾸지 않는다. 홈페이지에서 순서지로 링크하지 않는다.
- **주보에 인쇄된 순서만** 싣는다(`extra` 제외). 다음 주 봉사자 구역·묵상란은 두지 않는다.
- **텍스트가 최우선(2026-11-08)**: 악보가 틀려도 성시·독서 등 본문 텍스트는 비우지 않는다. 악보 불일치는 보고에만 적는다.
- **성시는 회중 강조 없이 내용만(2026-11-08)**: ○·◉·굵은 글씨 없이 절 번호와 본문만. 데이터의 `mark`는 슬라이드용이라 지우지 않는다.
- **성가는 악보가 있으면 가사 글자를 넣지 않는다(2026-11-08)**: 악보 이미지만 보이고 `lines` 가사는 순서지에 그리지 않는다(렌더러 처리, 데이터는 그대로). 악보가 없을 때만 텍스트로 보완한다.
- **설교 란에는 성경 본문을 넣지 않는다(2026-11-08)**: 복음 본문은 복음 항목에만 싣는다.
- **펼침 기본값(2026-11-08)**: 성서 본문(독서·복음)만 접고 나머지(성가 악보·성시·기도문)는 펼친다. 상단 버튼은 「전부 접기」 ↔ 「기본대로 펼치기」.
- 본기도는 사제·회중 응답 뒤에 본문. 교회와 세상을 위한 기도는 기도서 1양식 전문, 이끄는 사람은 "기도자". 회중 응답(`refrain`)은 지난 주 값을 가져오지 않고 확인한다.
- 문체는 정중·담백, 하느님·감사성찬례 등 표기와 성서 책 이름은 공동번역.
- 자료가 빠졌다고 외부 링크로 대체하지 않는다. 원문을 확보해 보완한다.

## 제작 후 누락 점검 (매번)
- 순서지의 성시·기도서(N쪽)·성가·성서 본문이 빠지지 않았는지 확인한다. 본문은 모두 저장소에 있다(`data/worship-texts/` bcp·psalms·responses, `bible/`, `data/hymnal-2015/`). 새 기도서 쪽은 `bcp.json`에 추가하고 `worship-order`에는 `type: bcp`로 쓴다.
- `tests/worshipCompleteness.test.js`·`tests/psalms.test.js`·`tests/juboLinks.test.js`가 통과해야 한다.
- 화면을 바꿨다면 390px·412px, 라이트·다크에서 모든 항목을 펼쳐 확인한다. 스크롤 중 `scrollIntoView`·`scrollLeft`, `backdrop-filter`, `scroll-behavior: smooth`는 쓰지 않는다.

## 완료 보고
- "머지했습니다"와 링크, 사용자가 판단할 사항(고친 것·읽기 어려운 글자·악보 불일치)만 짧게 적는다.
- 링크는 URL 단독 한 줄로 쓴다(날짜별 링크는 요청 시에만). 실제 접속·배포 확인 전에는 완료라고 쓰지 않고 공식은 반영 지연(최대 2시간)을 명시한다.

https://gmskh.or.kr/jubo/

https://frpsy.github.io/gmchurch_web/jubo/
