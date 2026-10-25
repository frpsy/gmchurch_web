# 운영 흐름 요약

상세 절차는 `CLAUDE.md` "주보 등록 절차", 표기는 `../church-glossary.md`가 원본이다.

## 주보를 받았을 때 (묻지 않고 끝까지)
1. 이미지를 `bulletins/YYYYMMDD_N.jpg`로 저장(표지부터).
2. 3면 예배 순서면에서 제1독서·성시·제2독서·복음을 읽어 `data/lectionary-overrides.json` 기록. 연속 서사면 트랙 A(성시가 표준과 다르면 `psalm`), 예언서·복음 짝이면 트랙 B, 특별 주일은 `koreanName`+`readings`. 3면 오른쪽 아래 `다음 주일 봉사자` 표로 **다음 주 독서·성시**도 기록한다.
3. 4면 교회소식을 `data/bulletin-news.json`에 기록(■ 항목 하나 = `{title, body}`, `일시 :` 줄은 `\n`). 통계·헌금 명단은 제외.
4. 핵심구절을 `data/bulletin-verses.json`에 기록(`{ref, text}`). 주보에 인쇄돼 있으면 그것, 없으면 그 주 복음에서 1~3절을 직접 골라 알린다. 본문은 `bible/`의 공동번역 PDF(`pdftotext -layout`)에서 글자 대조해 그대로 옮기고 절 번호·각주 기호는 넣지 않는다.
5. 3면 예배 순서를 `data/worship-order.json`에 기록(`†`는 `stand`, 오른쪽 칸은 `by`). `node scripts/build-worship-slides.js` → 더미 경고 확인 → `/presentation/worship/`에서 눈으로 확인. → `liturgy.md` "예배 슬라이드"
6. `node scripts/sync-bulletins.js` → 경고 확인 → `npm test` → `bulletin.html`(이번 주 말씀 카드)·`news.html`을 눈으로 확인.
7. 커밋·푸시·PR·squash 머지까지 자동. **보고는 `머지했습니다`(+PR 링크)만.** 처리할 것 없는 PR 알림은 보고하지 않는다.

## 검수 원칙
원문 대조, 의미 유지, 교정은 띄어쓰기·약어(G.F.S.)·표기 통일·날짜 형식·명백한 오탈자만. 새로 알게 된 것은 `church-glossary.md`와 이 위키에 확인된 사실만 추가.

## 교차 확인 기록
- 2026-10-11: 주보 1면의 교구장·관할사제·협동사제·신자회장·사제회장·교회위원·건축위원장·희망터 총무, 주소·전화·팩스·봉헌계좌가 `data.js`와 일치. 소식의 `박경준 프란시스 위원`은 `officers`의 `박경준(프란시스)`과 일치.
