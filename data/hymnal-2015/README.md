# 성가

모바일 주보의 성가 원본·악보·색인을 관리하는 기준 폴더다. **단성판을 기본으로 사용하고, 해당 곡이 없으면 전체판을 확인한다.** 모바일 주보에는 악보 이미지를 그대로 넣는다.

## 현재 구조

| 위치 | 역할 | 확인된 상태 |
|---|---|---|
| [index.json](index.json) | 기존 자료의 성가 번호 → 이미지 배열 | 657곡, 96–100번은 원본 색인에 없음 |
| [INDEX.md](INDEX.md) | 번호·제목별 사람이 보는 목록 | 기존 자료 |
| hymns/001.md–hymns/662.md | 곡별 악보 안내 | 원본 색인에 있는 657곡 |
| images/page-0001.jpg–page-0634.jpg | 기존 PDF의 634쪽 악보 이미지 | 원본 내장 JPG 추출, 약 30.1MB |
| [manifest.json](manifest.json) | 원본 출처·해시·페이지별 크기와 해시 | 기존 자료 검증용 |
| [source-index.json](source-index.json) | 원본 제목 색인 사본 | 기존 자료 |
| [sources/README.md](sources/README.md) | 자료별 판·페이지 수·영어 파일명·업로드 상태 | 새로 받은 두 PDF와 기존 자료 구분 |
| [sources/unison/README.md](sources/unison/README.md) | 단성판 보관·처리 기준 | PDF 업로드와 곡별 매핑 대기 |
| [sources/full/README.md](sources/full/README.md) | 전체판 보관·분할 기준 | PDF 분할·업로드 대기 |

이미지와 기존 색인은 이미 이 폴더에 모여 있다. 생성 스크립트·기존 주보가 경로를 사용하므로 현재 경로를 유지한다. 새 자료를 이 색인에 덮어쓰지 않는다.

## 연결된 파일

| 위치 | 역할 |
|---|---|
| ../worship-texts/hymns.json | 교회가 검수한 일부 가사·제목·기존 PDF 쪽 |
| ../worship/YYYYMMDD.book.json | 주별 예식문, 성가 score/scores 이미지 경로 |
| ../../scripts/archive-hymnal-images.py | 원본 PDF에서 이미지·색인 생성 |
| ../../scripts/build-worship-slides.js | 성가 번호에 맞는 악보를 예식문 데이터에 연결 |
| ../../jubo/index.html | 예식문의 악보 이미지를 주보 토글 안에 표시 |
| ../../tests/hymnalImages.test.js | 기존 이미지·색인 정합성 검사 |

## 자료별 구분

기존 보관 자료는 https://dulkuka12.github.io/khymn/ 의 hymnbook.pdf와 hymn-index-final.json에서 왔다. PDF 전체 634쪽의 내장 JPG를 재압축·확대·자르기 없이 추출했고 작사·작곡·저작권 표기도 보존했다. 657곡의 번호 색인이 있고 96–100번은 미확인이다. 이 번호의 페이지는 추측하지 않는다.

새로 받은 단성판은 782쪽·14,913,718바이트, 전체판은 811쪽·144,460,329바이트다. 기존 634쪽 자료와 페이지 번호를 공유하지 않는다. 새 PDF가 기존 자료와 같은 판·같은 수록곡이라고 단정하지 않는다. 단성판 우선은 확정된 운영 원칙이며, 실제 새 이미지 연결은 업로드·번호 매핑 검증 후에 적용한다.

## 매주 사용할 때

1. 인쇄된 주보의 성가 번호를 확인한다.
2. 단성판의 검증된 곡별 매핑이 있으면 우선 사용하고, 해당 곡이 없으면 전체판을 확인한다. 현재 새 두 PDF의 매핑은 대기 상태이므로 기존 검증 자료를 임의로 단성판이라고 부르지 않는다.
3. 기존 자료는 index.json의 hymns에서 number를 찾고 images 전체를 순서대로 읽는다. 한 페이지에 다른 곡이 함께 있으면 성가 번호를 대조한다.
4. data/worship/YYYYMMDD.book.json의 scores에 검증된 이미지 경로를 연결한다.
5. 모바일 주보 항목 안에서 악보를 그대로 보여 준다. PDF 전체 열기·#page 링크로 대체하지 않는다. 예: 기존 661번은 images/page-0633.jpg다.

회중 투사용 슬라이드는 검수된 가사만 보여 준다. 악보 이미지는 모바일 주보·예식문용이며 가사 OCR 데이터와 별개다.

## 배포

모바일 주보는 비공개 교회 밴드에만 게시·안내하고 공개 홈페이지·메뉴·사이트맵에는 연결하지 않는다. 이는 공개 저장소 파일에 접근 제한이 생긴다는 뜻이 아니다. robots.txt·링크 숨김만으로 PDF·이미지 검색 제외를 보장하지 않는다. 원본 업로드·검색 제외가 검증되기 전에는 완료로 표기하지 않는다.

## 재생성

Python의 pypdf·Pillow가 필요하다. 기존 자료에 대해 저장소 루트에서 실행한다.

```sh
python3 scripts/archive-hymnal-images.py /path/to/hymnbook.pdf /path/to/hymn-index-final.json
```

원본 페이지가 단일 스캔 이미지가 아니면 오류로 중단한다. 새 임시 폴더에 생성·검증한 뒤 교체한다. 새 PDF에 기존 source-index.json을 재사용하지 않는다.
