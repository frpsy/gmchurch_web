# 성가 원본

단성판을 기본으로 사용하고 전체판은 보완 자료로 둔다. 파일명은 영어로 판과 순번을 구분한다. 전송 요청의 16MiB 제한에 맞춰 곡이 시작되는 페이지 경계에서 추가 분할했다. PDF 페이지 수·SHA-256·Git blob SHA를 [manifest.json](manifest.json)에 기록했다.

## 단성판 — 기본

782쪽 전체를 3개로 보관한다. 1번은 전례성가까지, 2번은 일반성가 101–425장, 3번은 426–662장과 뒤쪽 색인이다.

| 파일 | 원본 PDF 쪽 | 쪽수 | 용량(MB) |
|---|---|---|---|
| [hymnal-2015-unison-part-01.pdf](unison/hymnal-2015-unison-part-01.pdf) | 1–148 | 148 | 2.92 |
| [hymnal-2015-unison-part-02.pdf](unison/hymnal-2015-unison-part-02.pdf) | 149–450 | 302 | 5.11 |
| [hymnal-2015-unison-part-03.pdf](unison/hymnal-2015-unison-part-03.pdf) | 451–782 | 332 | 6.91 |

## 전체판 — 보완

811쪽 전체를 25개로 보관한다. 이미지 재압축 없이 페이지 단위로 나눴다. 범위에 누락·중복이 없는 것을 검증했다.

| 파일 | 원본 PDF 쪽 | 쪽수 | 용량(MB) |
|---|---|---|---|
| [hymnal-2015-full-part-01.pdf](full/hymnal-2015-full-part-01.pdf) | 1–29 | 29 | 2.62 |
| [hymnal-2015-full-part-02.pdf](full/hymnal-2015-full-part-02.pdf) | 30–60 | 31 | 7.82 |
| [hymnal-2015-full-part-03.pdf](full/hymnal-2015-full-part-03.pdf) | 61–90 | 30 | 7.19 |
| [hymnal-2015-full-part-04.pdf](full/hymnal-2015-full-part-04.pdf) | 91–119 | 29 | 6.17 |
| [hymnal-2015-full-part-05.pdf](full/hymnal-2015-full-part-05.pdf) | 120–149 | 30 | 5.99 |
| [hymnal-2015-full-part-06.pdf](full/hymnal-2015-full-part-06.pdf) | 150–179 | 30 | 5.60 |
| [hymnal-2015-full-part-07.pdf](full/hymnal-2015-full-part-07.pdf) | 180–209 | 30 | 5.60 |
| [hymnal-2015-full-part-08.pdf](full/hymnal-2015-full-part-08.pdf) | 210–239 | 30 | 6.60 |
| [hymnal-2015-full-part-09.pdf](full/hymnal-2015-full-part-09.pdf) | 240–270 | 31 | 6.06 |
| [hymnal-2015-full-part-10.pdf](full/hymnal-2015-full-part-10.pdf) | 271–299 | 29 | 5.68 |
| [hymnal-2015-full-part-11.pdf](full/hymnal-2015-full-part-11.pdf) | 300–329 | 30 | 6.36 |
| [hymnal-2015-full-part-12.pdf](full/hymnal-2015-full-part-12.pdf) | 330–359 | 30 | 6.35 |
| [hymnal-2015-full-part-13.pdf](full/hymnal-2015-full-part-13.pdf) | 360–389 | 30 | 6.15 |
| [hymnal-2015-full-part-14.pdf](full/hymnal-2015-full-part-14.pdf) | 390–420 | 31 | 6.23 |
| [hymnal-2015-full-part-15.pdf](full/hymnal-2015-full-part-15.pdf) | 421–449 | 29 | 5.57 |
| [hymnal-2015-full-part-16.pdf](full/hymnal-2015-full-part-16.pdf) | 450–479 | 30 | 5.64 |
| [hymnal-2015-full-part-17.pdf](full/hymnal-2015-full-part-17.pdf) | 480–509 | 30 | 5.77 |
| [hymnal-2015-full-part-18.pdf](full/hymnal-2015-full-part-18.pdf) | 510–539 | 30 | 6.30 |
| [hymnal-2015-full-part-19.pdf](full/hymnal-2015-full-part-19.pdf) | 540–569 | 30 | 5.81 |
| [hymnal-2015-full-part-20.pdf](full/hymnal-2015-full-part-20.pdf) | 570–599 | 30 | 5.36 |
| [hymnal-2015-full-part-21.pdf](full/hymnal-2015-full-part-21.pdf) | 600–630 | 31 | 5.67 |
| [hymnal-2015-full-part-22.pdf](full/hymnal-2015-full-part-22.pdf) | 631–659 | 29 | 5.41 |
| [hymnal-2015-full-part-23.pdf](full/hymnal-2015-full-part-23.pdf) | 660–689 | 30 | 5.13 |
| [hymnal-2015-full-part-24.pdf](full/hymnal-2015-full-part-24.pdf) | 690–719 | 30 | 6.05 |
| [hymnal-2015-full-part-25.pdf](full/hymnal-2015-full-part-25.pdf) | 720–811 | 92 | 3.73 |

## 공개 범위

이 폴더는 _config.yml의 exclude로 GitHub Pages 빌드에서 제외한다. 홈페이지·사이트맵에는 PDF 링크를 추가하지 않는다. 모바일 주보의 noindex는 유지한다. GitHub 저장소 자체는 공개이므로 GitHub에서 파일 접근은 가능하고 Google의 모든 검색 결과에 대한 완전한 비노출은 보장하지 않는다. 비공개 교회 밴드에만 주보를 안내하는 원칙과 원본의 접근 권한은 별개다.

[성가 구조](../README.md) · [품질 확인](../QUALITY.md)
