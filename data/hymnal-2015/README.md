# 성가 2015 악보 이미지

예배 슬라이드 작성 때 성가 번호로 악보를 찾기 위한 보관 자료입니다.

- [번호·제목별 전체 목록](INDEX.md)
- [프로그램용 색인](index.json): `hymns` 배열에서 `number`로 찾고 `images`에 적힌 순서대로 읽습니다.
- `hymns/001.md`–`hymns/662.md`: 원본 색인에 있는 657개 성가의 악보 보기 문서입니다.
- `images/`: 원본 PDF 전체 634페이지를 JPG로 보관합니다. 이미지 중복 저장을 피하려고 성가 번호 대신 PDF 페이지로 이름을 붙였습니다.
- [원본 기록·해시·이미지 크기](manifest.json)
- [원본 제목 색인 사본](source-index.json)

## 출처와 보관 범위

출처는 [온라인 성가 2015](https://dulkuka12.github.io/khymn/)의 `hymnbook.pdf`와 `hymn-index-final.json`입니다. PDF 안에 들어 있는 스캔 이미지를 재압축·확대·자르기 없이 그대로 추출했습니다. 원본에 있는 작사·작곡·저작권 표기도 이미지에 남아 있습니다. 634개 이미지 파일의 내용은 `manifest.json`의 SHA-256으로 확인할 수 있습니다.

성가 번호와 PDF 페이지 번호는 서로 다릅니다. 여러 곡이 한 페이지에 같이 있거나 한 곡이 여러 페이지에 걸칠 수 있습니다. 성가 제목은 원본 색인 표기를 보존했습니다.

원본 색인에는 **96–100번이 없으며**, 해당 번호의 제목·악보 페이지를 추측해 연결하지 않았습니다. 이 번호의 색인이 없어도 PDF 전체 페이지는 빠짐없이 보관했습니다. 빠진 번호는 `manifest.json`의 `missingFromSourceIndex`에서 확인합니다.

## 매주 사용하는 방법

1. 주보에서 성가 번호를 확인합니다.
2. `index.json`에서 번호를 찾거나 `hymns/번호.md`를 엽니다. 번호는 세 자리로 씁니다(예: `hymns/065.md`, `hymns/661.md`).
3. `images` 배열의 이미지 전체를 순서대로 확인합니다. 한 페이지에 다른 곡이 함께 있을 수 있으므로 페이지 안의 성가 번호를 대조합니다.
4. 슬라이드에서 이미지를 사용할 때는 `data/hymnal-2015/`를 기준으로 이미지 경로를 결합합니다.

예시: `index.json`의 `hymns.find(h => h.number === 661).images`는 `images/page-0633.jpg`를 가리킵니다.

가사 OCR·절별 텍스트·가사 검수는 이 자료에 포함하지 않았습니다. 기존 `data/worship-texts/hymns.json`의 검수된 가사와 별개로 관리합니다.

## 다시 생성하기

Python에 `pypdf`와 `Pillow`가 필요합니다. 원본 두 파일을 내려받은 뒤 저장소 루트에서 실행합니다.

```sh
python3 scripts/archive-hymnal-images.py /path/to/hymnbook.pdf /path/to/hymn-index-final.json
```

원본 페이지가 단일 스캔 이미지가 아니면 일부만 저장하지 않고 오류로 중단합니다. 갱신할 때는 새 임시 출력 폴더에서 생성·검증한 뒤 이 폴더를 교체합니다.

## 예식문 자동 연결

`node scripts/build-worship-slides.js`는 `index.json`으로 주보의 성가 번호에 맞는 악보 이미지 전부를 `data/worship/YYYYMMDD.book.json`의 `scores`에 자동 기록합니다. `presentation/worship/book.html`은 이를 인쇄 가능한 예식문에 표시합니다. 원본 페이지에는 인접 성가가 함께 보일 수 있습니다.

회중에게 투사하는 `presentation/worship/index.html`은 기존 원칙대로 **검수된 가사만** 보여 주고, 악보 스캔 이미지는 투사하지 않습니다. 가사가 없는 성가는 성가 번호와 제목을 표시합니다. 가사는 `data/worship-texts/hymns.json`에서 관리합니다.

이 자료의 **온라인 공개·재배포 허용 여부는 별도 확인이 필요**합니다. 외부 공개 범위를 넓히기 전에 사용 권리를 확인합니다.
