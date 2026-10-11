# 03. 디자인 기준서

기존 사이트의 분위기(숲 녹색, Pretendard)와 현재 값을 최대한 보존하고 **불일치만 한 기준으로 정리**합니다. 굵게 표시한 값이 현재와 달라지는 곳입니다. 출처: `02-verify-typography-layout.md` 6장, `02-verify-design-color.md` 7장.

## 1. 타이포그래피

| 역할 | 크기(390 / 1440) | 굵기 | 행간 | 자간 | 비고 |
|---|---|---|---|---|---|
| 홈 히어로 h1 | **32px**(28→32) / 60.8px | 800 | 1.18 | -0.025em | 사진 위 전용, `text-wrap: balance` |
| 서브 히어로 h1 | 35.2px / 54.4px | 700 | 1.15 | -0.02em | 현행 |
| 히어로 부제 | 15.2px / 17.6px | 400 | 1.7 | normal | 현행 |
| 서브 히어로 eyebrow | 15.2px / 17.6px | 600 | 1.7 | 0.2em 대문자 | 명시 규칙으로 고정 |
| 섹션 h2 대 `.section-title` | 32px / 44.8px | 700 | 1.2 | -0.03em | 현행 |
| 섹션 h2 소 | **20.8px** | 700 | 1.3 | -0.01em | clergy 22.4·privacy 16.8·smallgroup 20 통일 |
| CTA h2 | 24px / 33.6px | 800 | 1.25 | 현행 | 어두운 면 위 디스플레이 |
| 리드 | 18.4px / 22.4px | 700 | **1.55** | -0.025em | 1.45→1.55 |
| 카드 제목 대 | 18px | 700 | 1.75 | -0.01em | `--fs-lead` |
| 카드 제목 소 | 16px | 700 | 1.75 | normal | 16.3·16.8px 폐기 |
| 본문 | 16px | 400 | 1.75 | normal | `--fs-body` |
| 장문 본문 | 16px | 400 | **1.9** | normal | 1.95·2.0 정리 |
| 카드·목록 설명 | **15.2px**(14.4/13.6에서 상향) | 400 | 1.75 | normal | 신규 `--fs-desc` |
| UI 텍스트(내비·버튼) | 14.4px | 600 | 1.4~1.75 | normal | `--fs-sm` 유지 |
| 보조 UI | 13.6px | 400~600 | 1.55~1.75 | normal | `--fs-md` 유지, 문장 본문 금지 |
| 캡션·라벨 하한 | 12.48px | 400~700 | 1.5 | 0.02em | `--fs-label`, 이보다 작은 값 금지(달력 모바일 예외) |
| 본문 구역 eyebrow | **12.48px**(10.88에서 상향) | 600 | 1.5 | 0.2em 영문 대문자 | CTA·주교 eyebrow 동일 |
| 한글 기능 라벨 | 12.48px 이상 | 600 | 1.5 | **0.05em 이하** | 영문용 넓은 자간 금지 |

- 굵기: 400 본문 / 500 보조 UI / 600 버튼·eyebrow / 700 제목 / 800은 사진·어두운 면 위 디스플레이에만
- 단위는 rem과 `clamp()`만(현행 유지). 본문·카드 설명 글자 크기는 줄이지 않는다
- 제목·푸터 주소는 `text-wrap: balance`(미지원 브라우저는 무시)
- 본문 링크: 색 `--theme` + 밑줄 1px(offset 2px), 굵기 600

## 2. 간격

| 토큰 | 값 | 용도 |
|---|---|---|
| `--space-1`~`--space-3` | 4 / 8 / 12px | 아이콘 간격, 칩 내부, eyebrow 아래 |
| `--space-4` | 1rem | 기본 간격 |
| `--space-4h` (신규) | 1.25rem | 카드 그리드 gap |
| `--space-5` | 1.5rem | 카드 안쪽(모바일) |
| `--space-6h` (신규) | 1.75rem | 모바일 hero 직후 섹션 위 |
| `--space-6` | 2rem | 블록 사이 |
| `--space-7` | 2.5rem | hero 직후 섹션 위(PC), 모바일 섹션 패딩 |
| `--space-8` | 3.5rem | 단독 섹션 하단 |
| `--section-pad` | 6rem / ≤768px 2.5rem | 섹션 상하 패딩(하나) |

- 섹션의 첫·마지막 자식 margin은 0. 예외는 `.section--tight-bottom` 하나
- 히어로 높이 PC 350px, 모바일 291px(현행). `.page-hero + .section`·`.gc-page-nav + .section` 첫 섹션 padding-top 2.5rem / 1.75rem
- 컨테이너 `--content-max` 1200px, 읽기 폭 `--content-narrow` 820px(faq·links), `--content-read` 760px(emmaus·privacy)
- 새·수정 코드만 토큰 사용, 기존 값 일괄 치환 금지

## 3. 색

| 역할 | 토큰 | 라이트 | 다크 | 대비(라이트 / 다크) |
|---|---|---|---|---|
| 바탕 | `--cream` | `#f2f3ef` | `#0f1b16` | 본문 15.62 / 13.64 |
| 카드 | `--white` | `#ffffff` | `#16241e` | 17.40 / 12.42 |
| 틴트 면 | `--green-light` (+라이트 `--gold-bg` 흡수) | `#e7eee8` | `#1b3029` | 6.73 / 4.71 |
| 어두운 띠 | `--green-deep` | `#173a2e` | `#10241d` | 흰 글자 12.49 |
| 본문 | `--text` | `#1a1a1a` | `#e6e2d6` | 15.62 / 13.64 |
| 보조 텍스트 | `--text-muted` | `#4d4c46` | `#a4a89a` | 7.73 / 7.27 |
| 제목 | `--heading` | `#112f25` | `#ecefe2` | 14.41 / 13.80 |
| 주색(링크·버튼·포커스) | `--theme` | `#285a47` | `#66a284` | 7.94 / 5.41 |
| 보조색(어두운 면 위만) | `--gold`(세이지) | `#a8bd9f` | `#b5c9b0` | 6.21 / 9.25 |
| 경계선 | `--border` | `#dde3dc` | `#2a4036` | 장식용 |

- 고정 토큰(모드 무관): `--ink-on-light #173a2e`, `--ink-on-sage #142c24`, `--brand-mid #285a47`, `--green-hover #e3e7d2`, `--red-hover #9b1c1c`, `--on-dark-1/2/3 rgba(255,255,255,.92/.78/.70)`
- 병합: `#163a2e→#173a2e`, `#2a5a48→#285a47`, 라이트 `--gold-bg→--green-light`
- 병합하지 않음: `#f6f4ee`/`#f0ece4`(항상 밝은 면), 다크 서피스 6단계, 스켈레톤, 카카오·네이버 브랜드색
- 본문 텍스트 대비 4.5:1 이상. 대비를 낮추는 변경 금지. 하드코딩 hex 대신 토큰(`CLAUDE.md` 색상 규칙)

## 4. 포커스 링

1. 기본 `outline: 3px solid var(--theme); outline-offset: 3px` (현행 유지)
2. 어두운 녹색 면(내비·푸터·히어로·CTA) 위: `outline-color: var(--gold)`
3. 사진 위·라이트박스: 흰색
4. 막대에 꽉 찬 요소(드롭다운): offset -3px 안쪽. 이동하는 카드: 바깥 2px
5. `outline: none`은 `:focus:not(:focus-visible)` 외에 사용 금지

## 5. 버튼·카드

- 버튼: 공용 `.btn` 베이스는 `btn-next`(47개) 값에 맞춰 흡수. 패딩 약 .85rem × 1.7rem, 최소 높이 44px, 14.4px/600. 주 CTA·필터·칩은 pill, 히어로·지도·더보기 같은 네모형은 `--radius-sm`(8px), 소형 칩 `--radius-xs`(4px). hover `translateY(var(--lift-1))`
- 카드: radius `--radius-md`(14px), 인물·주교·영상 카드만 `--radius-lg`(20px). 테두리 1px `--border`, 강조 띠는 왼쪽 4px 또는 위 3px 한 방향. hover `translateY(var(--lift-2))` + `--hover-shadow-sm`
- 이모티콘 직접 사용 금지(`images/icons.svg` 아이콘 팩만, `CLAUDE.md` 규칙)

## 6. 반응형 기준점

360 / 390 / 768 / 1024 / 1440px로 점검. 기존 `@media` 기준점(480, 768, 1010·1099 내비 구간)은 변경하지 않음.
