# 성가

모바일 주보에는 성가의 원본 악보 이미지를 그대로 넣는다. **단성판을 기본으로 사용**하고 전체판을 보완 자료로 둔다.

## 폴더와 연결 구조

| 위치 | 내용 |
|---|---|
| [sources/unison/](sources/unison/README.md) | 새 단성판 782쪽, 3개 PDF |
| [sources/full/](sources/full/README.md) | 새 전체판 811쪽, 25개 PDF |
| [sources/manifest.json](sources/manifest.json) | 분할 범위·바이트 수·SHA-256·Git blob SHA |
| [index.json](index.json) | 기존 634쪽 자료의 번호 → 이미지 배열 |
| [INDEX.md](INDEX.md) | 기존 자료의 번호·제목별 목록 |
| hymns/001.md–hymns/662.md | 기존 자료의 곡별 안내 657개 |
| images/page-0001.jpg–page-0634.jpg | 기존 634쪽 악보 JPG, 약 30.1MB |
| [manifest.json](manifest.json) | 기존 원본 출처·이미지 해시·크기 |
| [source-index.json](source-index.json) | 기존 제목 색인 사본 |
| ../worship-texts/hymns.json | 검수된 일부 가사·제목·기존 PDF 쪽 |
| ../worship/YYYYMMDD.book.json | 주별 예식문과 score/scores 경로 |
| ../../scripts/archive-hymnal-images.py | 기존 PDF의 내장 이미지·색인 추출 |
| ../../scripts/build-worship-slides.js | 성가 번호에 맞는 이미지 연결 |
| ../../jubo/index.html | 토글 안에서 악보 이미지 표시 |

기존 634쪽 자료와 새 782쪽·811쪽 원본은 페이지 번호가 다르다. 새 PDF에 기존 색인을 덮어쓰거나 그대로 적용하지 않는다. 기존 주보가 쓰는 이미지 경로는 보존했다.

## 원본 보관과 품질

새 PDF는 요청 전송 한도(16MiB)에 맞춰 곡의 시작 페이지 경계에서 더 나눠 업로드했다. 이미지 재압축·축소 없이 페이지를 나눴으며 단성판 782쪽·전체판 811쪽 범위의 누락·중복이 없는 것을 검증했다. [원본 목록](sources/README.md)에서 파일별 범위를 확인한다.

같은 성가 64·65 페이지 비교에서 새 단성판은 1527×2352, 기존 JPG는 610×940 픽셀이었다. 새 단성판을 모바일 주보 원본으로 우선한다. [품질·보관 결과](QUALITY.md).

## 매주 사용하는 방법

1. 인쇄된 주보의 성가 번호를 확인한다.
2. 새 단성판 원본에서 해당 곡의 모든 페이지와 번호·제목을 확인해 악보 이미지를 추출한다.
3. 아직 새 자료로 검증하지 않은 곡은 기존 index.json의 검증된 images 배열을 활용한다. 새 원본의 전체 곡별 이미지 색인은 아직 만들지 않았다.
4. book.json의 score/scores로 이미지 전체를 순서대로 연결한다. 한 페이지에 여러 곡이 있으면 번호를 대조한다.
5. 모바일 주보 토글 안에서 이미지를 그대로 보여 준다. PDF 전체 열기·#page 링크로 대체하지 않는다. 투사용 슬라이드의 검수된 가사 원칙은 유지한다.

기존 자료의 원본 색인에는 96–100번이 없다. 제목·페이지를 추측해 연결하지 않는다. 예를 들어 기존 661번은 images/page-0633.jpg다.

## 배포

모바일 주보와 본문·성가 악보 이미지는 공개 저장소에 반영하고 GitHub Pages의 `/jubo/`에 웹 배포한다(사용자 명시 승인, 2026-11-01). 교우가 웹에서 열어 보도록 하되, 링크 안내는 비공개 교회 밴드에서만 한다. 공개 홈페이지 본문·메뉴·푸터·사이트맵·공개 게시물에는 모바일 주보 링크나 홍보를 추가하지 않는다. “홈페이지에 게시하지 않는다”는 웹 배포 금지가 아니라 홈페이지에서 연결·홍보하지 않는다는 뜻이다. 이 범위의 커밋·푸시·PR·머지는 기존 자동 처리 절차로 진행하며 공개 접근 가능성을 이유로 매번 재승인을 요청하지 않는다. 홈페이지·메뉴·사이트맵에 모바일 주보나 새 원본 PDF 링크를 추가하지 않는다. 새 원본 sources/ 폴더는 _config.yml의 exclude로 GitHub Pages 빌드에서 제외한다. 기존 주보의 noindex는 유지한다.

공개 GitHub 저장소 자체에는 접근 제한이 없으므로 Google에서 절대 노출되지 않는다고 보장하지 않는다. 새 PDF를 홈페이지에 공개하는 경우 응답 헤더 또는 접근 제한을 별도로 검토한다.

## 기존 자료 재생성

기존 자료는 https://dulkuka12.github.io/khymn/ 의 hymnbook.pdf와 hymn-index-final.json에서 왔다. PDF 전체 634쪽의 내장 JPG를 재압축 없이 추출했고 원래의 작사·작곡·저작권 표기를 보존했다. pypdf·Pillow를 준비해 저장소 루트에서 실행한다.

```sh
python3 scripts/archive-hymnal-images.py /path/to/hymnbook.pdf /path/to/hymn-index-final.json
```

단일 스캔 이미지가 아니면 오류로 중단한다. 새 임시 폴더에서 검증 후 교체한다. 새 PDF에 기존 source-index.json을 재사용하지 않는다.

## 2026년 10월 25일 모바일 주보 적용
단성판 65·76·82·83·89·208·258·272·369·500장의 번호와 페이지를 대조해 `unison-verified.json`에 기록했다. `unison-images/`는 원본 내장 이미지를 원래 해상도의 무손실 PNG로 저장했다. 생성기는 검증된 곡에 이 이미지를 우선하며, 기존 색인은 유지한다.
