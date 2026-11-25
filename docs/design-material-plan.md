# Material Design 3 적용 계획 (2026-11-25)

> 목적: 광명교회 홈페이지에 Google Material Design 3(M3)의 설계 원리를 입힌다. 숲 녹색 테마는 그대로 둔다.
> M3 화면을 그대로 베끼지 않는다. 색 역할, 상태 레이어, 모양, 높이, 움직임, 글자 체계라는 "원리"만 가져온다.

## 1. 현재 구조 (코드 근거)

| 영역 | 현재 상태 | 근거 |
|---|---|---|
| 구조 | 바닐라 HTML 28쪽 + `app.js` 렌더러(3,891줄) + `style.css` 단일 파일(5,776줄) | 저장소 루트 |
| 색 | `--green-*`, `--theme`(절기색으로 JS가 덮어씀), `--gold`(세이지), `--cream`/`--white` 표면. 역할 이름이 아니라 색 이름 중심 | `style.css` `:root` |
| 다크모드 | `prefers-color-scheme: dark`에서 같은 이름 토큰을 다시 정의. 여러 곳에 흩어진 다크 블록 7개 | `style.css` 4390 등 |
| 버튼 | 생김새가 4갈래: `.btn-next`(알약), `.btn-next--primary`(숲녹 알약), `.btn-hero-primary`·`.btn-outline`(8px 모서리), `.btn-live`(빨강 알약) | `style.css` 505~560, 2485~2545 |
| 상호작용 | hover 때 2~4px 떠오름 + 그림자. 터치 기기는 따로 꺼 두고 `opacity: 0.75`로 대신함 | `style.css` 5429~5443 |
| 카드 | 흰 면 + 1px 옅은 테두리, hover 때 테두리 녹색 + 떠오름 | `.card`, `.info-card` |
| 글자 | 크기 토큰(`--fs-*`)과 행간 토큰(`--lh-*`)은 이미 있음. 역할(display/headline/title/body/label) 이름은 없음 | `:root` |
| 움직임 | `--ease-out` 하나와 길이 3단계 | `:root` |

잘 된 점: 토큰 체계, 4px 간격 단위, 대비 4.5:1 관리, 모션 감소 대응이 이미 있다. 그래서 M3는 "새로 짓기"가 아니라 "역할 이름을 붙이고 상호작용 문법을 바꾸는 일"이다.

## 2. M3 DNA와 이 사이트의 차이

| M3 원리 | 이 사이트에서 빠진 것 | 영향 |
|---|---|---|
| 색 역할(primary, on-primary, secondary-container, surface-container, outline) | 색 이름만 있어 "이 색을 어디에 써도 되는가"가 코드에 없다. 다크 대응을 컴포넌트마다 다시 한다 | 큼 |
| 상태 레이어(hover 8%, focus·pressed 10%) | 떠오름 효과로 대신한다. 터치에서는 눌린 느낌이 거의 없다 | 큼 |
| 공통 버튼(filled, tonal, outlined, text) | 버튼 모양·모서리·호버 규칙이 섞여 있다 | 큼 |
| 높이(tonal elevation) | 그림자와 이동만 있다. 표면 단계(container low/high)가 없다 | 중간 |
| 모양 척도(XS 4 · S 8 · M 12 · L 16 · XL 28 · full) | 8/14/20px 세 단계. 비슷하지만 카드 14px가 척도 밖 | 작음 |
| 글자 역할 | 크기 토큰은 있으나 역할 이름이 없다 | 중간 |
| 움직임(standard·emphasized easing) | 곡선 하나 | 작음 |

## 3. 단계별 계획 (중요한 순서)

### 1단계 — 색 역할 토큰 + 상태 레이어 + 공통 버튼 통일 (이번 PR)
가장 먼저 하는 이유: 모든 다음 단계가 이 토큰을 쓴다. 그리고 버튼은 방문자가 실제로 누르는 곳이라 체감이 가장 크다.
- `:root`에 `--md-*` 역할 토큰을 더한다. 기존 토큰은 지우거나 값을 바꾸지 않는다(다른 컴포넌트 영향 0).
  - primary `#285a47`(기존 `--green-mid`와 같은 숲녹), on-primary 흰색. 다크는 `#66a284` / `#0f1b16`.
  - secondary-container(옅은 녹 면), outline(버튼 테두리, 흰 면 대비 4.5:1), 상태 레이어 투명도, M3 높이 1단계 그림자, standard 곡선.
- 버튼을 M3 문법으로 통일한다.
  - `.btn-next` → outlined 버튼(투명 면, outline 테두리, primary 글자).
  - `.btn-next--primary` → filled 버튼(primary 면, on-primary 글자, hover 때 높이 1단계).
  - `.btn-hero-primary`·`.btn-outline`(첫 화면) → 알약 모양으로 맞춘다.
  - 떠오름(`translateY`)을 없애고 상태 레이어(`::before`, currentColor 8%/10%)로 바꾼다. 터치 기기도 같은 방식으로 눌림이 보인다.
- 절기색(`--theme`)은 버튼에서 떼어 낸다. 버튼 색이 절기마다 바뀌지 않고 늘 숲녹이다(테마 그린 유지).

### 2단계 — 표면 단계와 카드
- surface, surface-container-low/high 토큰을 만들고 `.card`, `.info-card`를 M3 카드 3종(elevated·filled·outlined) 중 하나로 정리한다.
- 카드 hover 떠오름을 상태 레이어로 바꾼다. `@media (hover: none)` 예외 목록이 줄어든다.

### 3단계 — 내비게이션
- PC: 드롭다운 메뉴를 M3 메뉴(표면 container, 8px 모서리, 항목 상태 레이어)로.
- 모바일: 햄버거 메뉴를 M3 navigation drawer 문법(활성 항목 secondary-container 알약)으로. 아래 탭바 도입은 설계 결정이라 사용자 확인 후.

### 4단계 — 글자 역할
- `--md-display/headline/title/body/label` 역할 토큰을 기존 `--fs-*` 값 위에 얹는다. 크기 자체는 바꾸지 않고 이름만 정리한 뒤, 어긋난 곳만 맞춘다.

### 5단계 — 칩·목록·입력
- 버스 칩, 필터, 절기 배지를 M3 칩(assist/filter)으로. 검색창은 M3 search bar 모양으로.

### 6단계 — 움직임과 모양 마무리
- emphasized 곡선을 펼침·메뉴 열림에 쓴다. 카드 모서리 14px를 척도(12 또는 16)로 맞춘다.

## 4. 지키는 선
- 테마 그린(숲녹 `#173a2e`/`#285a47`)과 절기색 체계는 바꾸지 않는다.
- 순서지(`jubo/`) 디자인은 고정 규칙이라 손대지 않는다.
- 색은 CSS 변수로만 쓰고, 새 색 토큰은 라이트·다크 값을 함께 둔다. 글자 대비 4.5:1, 테두리 3:1 이상.
- 각 단계는 PR 하나로, PC·500px·다크모드 화면을 찍어 비교한 뒤 머지한다. 휴대폰 실기기는 따로 확인이 필요하다.

## 5. 변경 내역

### 1단계 — 색 역할 토큰 + 공통 버튼 (PR #772, 2026-11-25 병합)
| 무엇을 | 전 | 후 |
|---|---|---|
| 색 토큰 | 색 이름(`--green-mid`, `--theme` 등)만 있음 | `--md-primary`, `--md-on-primary`, `--md-secondary-container`, `--md-outline`, 상태 레이어 투명도, `--md-elevation-1`, `--md-ease-standard`, `--md-button-height` 추가(라이트·다크). 기존 토큰은 그대로 |
| `.btn-next` | 흰 면 + 옅은 테두리, hover 때 떠오름, 테두리가 절기색 | outlined 버튼: 투명 면 + outline 테두리(4.5:1) + 숲녹 글자 |
| `.btn-next--primary` | 짙은 숲녹 면, hover 때 절기색으로 바뀜 | filled 버튼: primary 면, hover 때 높이 1단계. 절기와 무관하게 늘 숲녹 |
| 첫 화면 버튼 | 8px 모서리, hover 떠오름 | 알약 모양, 높이 44px, 상태 레이어 |
| 눌림 표시 | 마우스는 떠오름, 터치는 `opacity 0.75` | 모두 `::before` 상태 레이어(hover 8%, focus·pressed 10%) |
| 다크모드 녹색 섹션 | 섹션 링크 규칙이 버튼 글자색까지 덮어 대비 부족 | 버튼은 규칙에서 제외 |

검증: 테스트 265개 통과. 14쪽 39개 버튼 라이트·다크 대비 4.5:1 이상, 높이 44px 이상.

### 2단계 — 카드 상호작용 (PR #773, 2026-11-25 병합)
| 무엇을 | 전 | 후 |
|---|---|---|
| 정보 카드(`.card`, `.info-card`, `.value-card`, `.anglican-pillar`, `.mission-mark`, `.liturgy-step`) | 누를 수 없는데 hover 때 떠오르고 테두리 색이 바뀌고 아이콘이 커짐 | hover에 반응하지 않음. 누를 수 있는 것처럼 보이지 않게 함 |
| 누르는 카드(`.resource-card`, `.links-card`, `.video-card`, `.shorts-card`, `.value-card--link`, `.newcomer-cta-link`, `.about-next`, `.map-btn`) | 2~4px 떠오름 + 그림자, 카드마다 hover 규칙이 따로 | 한 블록에서 관리. hover는 마우스에서만 outline 테두리 + 높이 1단계 + primary 8% 막. focus 10%, 눌림 10%(터치 포함) |
| 상태 레이어 방식 | — | `--md-layer-hover/focus/pressed` inset 그림자 토큰. 가상요소를 쓰지 않아 기존 `::before`와 겹치지 않음 |
| 터치 기기 예외 목록 | 카드마다 `transform: none` 예외, 눌림은 배경색 교체 | 떠오름이 없어져 목록이 줄었고, 눌림은 상태 레이어로 통일 |

남긴 것: 사진 갤러리 타일 확대, 주보 이미지 확대, 화살표 미세 이동, `.iona-link-card`의 면 색 전환은 그대로 둔다(그림·방향 표시라 의미가 다름).

검증: 테스트 265개 통과. 예배·관련 기관·미디어 쪽에서 라이트·다크 상태 레이어 화면 확인, 스크롤 등장 효과 유지 확인. 마우스 hover 자체는 앱 내장 브라우저가 터치 기기로 잡혀 강제 적용으로만 확인했다. 휴대폰 실기기 미확인.

### 3~6단계 — 내비게이션·글자·칩·모양과 움직임 (2026-11-25)
| 단계 | 무엇을 | 전 | 후 |
|---|---|---|---|
| 3 | PC 드롭다운 | 위쪽 녹색 선, 항목마다 구분선, hover 때 글자가 오른쪽으로 밀림 | M3 메뉴: 떠 있는 표면(높이 2단계), 네 모서리 8px, 항목 48px, 구분선 없이 상태 레이어 |
| 3 | 모바일 메뉴 | 줄마다 구분선, 왼쪽 세로줄로 하위 메뉴 표시 | M3 내비게이션 드로어: 56px 알약 항목, 현재 쪽은 세이지 활성 표시, 펼침 단추는 48px 원 |
| 3 | 전체 메뉴·검색 창 | 14px 모서리, 일반 그림자 | M3 대화상자: XL 모서리(28px), 높이 3단계, 표면 단계 색 |
| 4 | 글자 | `--fs-*` 크기 토큰만 있음 | `--md-display/headline/title/body/label` 역할 토큰. 값은 기존 크기 그대로. 첫 화면·섹션 제목·카드 제목·버튼에 적용 |
| 5 | 사진 필터 | 알약 버튼, 선택되면 짙은 녹색 | M3 filter chip: 8px 모서리, 높이 40px, 선택되면 옅은 녹색 container |
| 5 | 설교 정렬 | 녹색 테두리, 선택 면 `--green-soft` | M3 segmented button 토큰(outline 테두리, secondary-container 선택 면) |
| 5 | 검색창 | 테두리 있는 크림색 알약 | M3 search bar: 테두리 없는 채운 알약 56px, 입력 중 primary 테두리 |
| 6 | 모서리 | 8 / 14 / 20px | M3 척도 8 / 12 / 16 / 28px (`--radius-sm/md/lg/xl`) |
| 6 | 움직임 | 곡선 `cubic-bezier(0.2,0.7,0.3,1)`가 여러 곳에 직접 적힘 | M3 emphasized decelerate(나타남)와 standard(상태 변화) 토큰으로 통일 |

검증: 테스트 265개 통과. PC 메뉴, 모바일 드로어(500px·다크), 전체 메뉴 검색창, 사진 칩, 설교 정렬(다크 선택 대비 10.6:1)을 화면으로 확인했다. 500px에서 6쪽 가로 넘침 없음. 휴대폰 실기기 미확인.

남긴 것: 버스 노선 칩(실제 버스 색 표지), 독서 트랙 토글(`.lect-track`), 절기 배지는 의미가 있는 고유 표지라 모양을 유지했다. 모바일 아래 탭바는 넣지 않았다.
