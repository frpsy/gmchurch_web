# Claude Code 작업 지시서 — 광명교회 홈페이지 P0 작업

> **저장소**: `frpsy/gmchurch_web`  
> **배포**: `https://frpsy.github.io/gmchurch_web`  
> **작성일**: 2026-05-25  
> **업데이트**: 2026-05-27 (P0 전체 완료)  
> **근거 문서**: `docs/committee-audit-2026-05.md` (위원회 audit 보고서)

---

## ✅ P0 작업 완료 현황

모든 P0 작업이 완료되어 main 브랜치에 반영되었습니다.

| 작업 | 내용 | PR | 상태 |
|------|------|----|------|
| P0-1 | Open Graph + Twitter Card 메타 | - | ✅ 완료 |
| P0-2 | robots.txt + sitemap.xml | - | ✅ 완료 |
| P0-3 | JSON-LD 구조화 데이터 | - | ✅ 완료 |
| P0-4 | 접근성 개선 (main, skip-link, focus-visible) | - | ✅ 완료 |
| P0-5 | 주소·연락처 정밀화 (우편번호·지번 추가) | - | ✅ 완료 |
| P0-6 | 개인정보 처리방침 페이지 + 푸터 링크 | - | ✅ 완료 |
| P0-7 | 폰트 preload + Apple Touch Icon | - | ✅ 완료 |

---

## 0. 시작 전 필수 확인

### 0.1 진행 원칙 (위원회 결의)

이 프로젝트는 **빌드 없는 정적 사이트 구조를 엄격히 유지**합니다. 다음은 위원회 사전 협의 없이 금지:

- ❌ React / Vue / Svelte 등 프레임워크 도입
- ❌ TypeScript 마이그레이션
- ❌ 헤드리스 CMS (Sanity / Strapi / Decap 등) 도입
- ❌ 빌드 도구 (Vite / Webpack / Parcel) 도입
- ❌ npm 의존성 신규 추가 (현재 의존성: Pretendard CDN, Google Maps iframe, Unsplash 이미지 1개만)

다음 패턴은 **반드시 유지**:

- ✅ `data.js` → `app.js` 로드 순서
- ✅ `CHURCH_DATA` 단일 객체에 모든 콘텐츠
- ✅ SOLID 의식한 렌더러 패턴 (`*Renderer.render()`)
- ✅ CSS 변수 토큰 (`--green-deep`, `--cream` 등)
- ✅ ID 기반 DOM 접근, 시맨틱 HTML
- ✅ 새 섹션 추가 시 `ARCHITECTURE.md` 동기화

### 0.2 Git 워크플로

```bash
git fetch origin main
git checkout -b claude/작업명 origin/main
# 작업
git add ...
git commit -m "작업명: 설명"
git push -u origin claude/작업명
# PR 생성 → 직접 검토 후 main 머지
```

---

## 1. P0 작업 상세 (완료)

### ✅ P0-1. Open Graph + Twitter Card 메타 추가

**완료 내용**:
- 6개 HTML 모두에 OG·Twitter·canonical 메타 추가
- OG 이미지 `og-image-v2.png` (1200×630) 생성 — Canterbury Cross + 교회명 + 슬로건
- 배포 URL: `https://frpsy.github.io/gmchurch_web`
- `theme-color: #163d24` 적용
- KakaoTalk 공유 미리보기 정상 확인

---

### ✅ P0-2. robots.txt + sitemap.xml

**완료 내용**:
- `robots.txt`: Allow all, Sitemap 명시
- `sitemap.xml`: 6개 페이지 + privacy.html 등록
- 배포 URL: `https://frpsy.github.io/gmchurch_web`

---

### ✅ P0-3. JSON-LD 구조화 데이터

**완료 내용**:
- `index.html` `<head>`에 `Church` 스키마 삽입
- name, address, telephone, geo, sameAs, openingHoursSpecification 포함

---

### ✅ P0-4. 접근성 (a11y) 즉시 개선

**완료 내용**:
- 6개 HTML 모두 콘텐츠를 `<main id="main-content">` 로 감쌈
- `<a href="#main-content" class="skip-link">본문으로 바로가기</a>` 추가 (6개)
- `style.css`에 `:focus-visible` 스타일 추가 (브랜드 그린 outline)
- `.nav-chevron`은 `<button>` 이므로 Enter/Space 자동 동작

---

### ✅ P0-5. 주소·연락처 정밀화

**완료 내용**:
- `data.js` `info` 객체에 우편번호(14335), 지번(노온사동 373-1), addressDetail 추가
- 좌표 (37.4757, 126.8641) 검증 완료
- 카카오 지도 링크 → Android 앱 인터셉트 이슈로 Naver Maps + Google Maps로 교체

---

### ✅ P0-6. 개인정보 처리방침 페이지

**완료 내용**:
- `privacy.html` 신규 작성 (page-hero + 7개 항목)
- 모든 페이지 푸터에 "개인정보 처리방침" 링크 추가
- `sitemap.xml`에 포함

---

### ✅ P0-7. 폰트 preload + Apple Touch Icon

**완료 내용**:
- 6개 HTML `<head>`에 Pretendard `preload` + `crossorigin` 추가
- `apple-touch-icon.png` (180×180) 생성 및 6개 HTML에 link 추가

---

## 2. 추가 완료 항목 (P0 이후)

P0 작업 과정 및 이후에 추가로 완료된 항목들:

| 작업 | 내용 |
|------|------|
| 네비게이션 로고 | 흰 사각형 배경 제거 → 투명 + 흰색 캔터베리 십자가 |
| 히어로 가시성 | 오버레이 강화 (상단 0.5 → 하단 0.8), h1 text-shadow |
| 모바일 줄바꿈 | about-brief-desc 등 어색한 줄바꿈 수정 |
| OG 이미지 캐시 | KakaoTalk 캐시 무효화: og-image.png → og-image-v2.png |
| 지도 링크 | Kakao Android 딥링크 오류 → Google Maps로 교체 |
| 사제 연락처 | tel: → mailto: (이메일로 변경) |
| 헌금 영수증 안내 | receiptInfo 두 문장 사이 줄바꿈 적용 |
| 푸터 로고 | 흰색(#ffffff) fill로 변경, 26px로 증가 |
| 푸터 주소 | 클릭 시 네이버지도로 이동하는 링크 적용 |
| 디자인 개선 | section-pad 9rem, content-max 1200px, --green-deep #0a1f12 |
| 사제 이력 | externalRoles 필드 추가 (교회 밖 활동 태그) |

---

## 3. 다음 단계 (P1 예고)

P0 완료 후 위원회 검토 미팅 → 다음 항목으로 진행:

- **P1-1**. 공지사항 페이지 (`news.html` + `CHURCH_DATA.news`)
- **P1-2**. 주보 아카이브 (`bulletin.html` + 최근 12주 PDF)
- **P1-3**. 메인 hero에 "처음 오셨나요?" CTA 4번째 버튼
- **P1-4**. 평일 성무일도 시간표 (`CHURCH_DATA.worship.daily`)
- **P1-5**. RCL 성서정과 표시 (Year A/B/C 자동 계산)

---

## 4. 질문·이슈 발생 시

- 위원회 결의 사항과 충돌하는 기술 결정 필요 → 작업 중단하고 사용자(상열님)에게 보고
- ARCHITECTURE.md 와 실제 구현이 불일치 발견 → ARCHITECTURE.md 업데이트도 같은 PR에 포함
- 외부 의존성 추가 필요 → 위원회 사전 협의
