# 저장소 2개 운영 구조 — 개발 저장소와 공식 저장소

> 이 문서는 **두 저장소에 똑같이** 들어 있습니다. 고칠 때는 개발 저장소에서 고치고,
> 공식 저장소에는 다음 반영 때 함께 넘어갑니다. (2026-10-24 작성)

광명교회 홈페이지는 저장소 두 개로 운영합니다. **개발은 한 곳에서만** 하고, 다른 한 곳은
교회 공식 주소로 내보내는 출구 역할만 합니다.

| | 개발 저장소 | 공식 저장소 |
|---|---|---|
| 저장소 | [`frpsy/gmchurch_web`](https://github.com/frpsy/gmchurch_web) | [`lmkhkm/GMSKH_Homepage`](https://github.com/lmkhkm/GMSKH_Homepage) |
| 사이트 주소 | https://frpsy.github.io/gmchurch_web/ (테스트·미리보기용) | https://gmskh.or.kr/ (교회 공식 주소) |
| 배포 방식 | GitHub Pages가 `main`을 바로 배포 | 네이버 클라우드 서버가 `main`을 받아 가서 nginx로 서비스 |
| 반영 시점 | `main` 머지 후 **보통 1~2분 안** | 공식 `main` 반영 후 **최대 2시간 안** (서버 타이머) |
| 하는 일 | 모든 수정·주보 등록·문서 작업 | 개발 저장소 `main`을 **요청이 있을 때만** 머지 |
| 직접 커밋 | 함 (작업 브랜치 → PR → squash 머지) | **하지 않음** (머지 브랜치 PR만) |

## 흐름

```
작업 브랜치 (claude/…, chatgpt/…)
      │  PR → squash 머지
      ▼
frpsy/gmchurch_web  main ──── GitHub Pages (1~2분) ─▶ frpsy.github.io/gmchurch_web   ← 먼저 여기서 확인
      │
      │  사용자가 "공식에 반영해 줘"라고 요청할 때만
      │  scripts/release-official.sh → 머지 브랜치 PR → 머지
      ▼
lmkhkm/GMSKH_Homepage  main
      │  서버가 2시간마다 git fetch (deploy/gmchurch-publish.timer)
      ▼
네이버 클라우드 서버 /srv/gmchurch ──rsync──▶ /var/www/gmchurch ──▶ nginx ──▶ gmskh.or.kr
```

## 자동으로 도는 작업과 주기

| 작업 | 어디서 | 언제 | 하는 일 |
|---|---|---|---|
| GitHub Pages 배포 | 개발 | `main`에 push될 때마다 | frpsy.github.io에 바로 반영 (보통 1~2분) |
| Auto Cache Bust (`cache-bust.yml`) | 두 저장소 각각 | `main`에 `.js`·`.css`·`.svg` 변경이 push될 때 | 모든 HTML의 `?v=`를 그 커밋 SHA로 바꿔 커밋 |
| Sync Sunday Bulletins (`bulletin-sync.yml`) | 두 저장소 각각 | `bulletins/`에 이미지 push 시 + **매일 03:00(한국시간)** | 주보 PDF·목록 갱신, 8주 지난 주보·교회소식 삭제 후 커밋 |
| 서버 배포 타이머 (`deploy/gmchurch-publish.timer`) | 공식 서버 | 서버 부팅 1분 뒤, 이후 **2시간마다** | 공식 `main`이 바뀌었으면 받아서 웹 폴더에 복사 |

- GitHub의 예약 실행(03:00)은 GitHub 사정으로 늦어질 수 있습니다. 2026-10 기록상 실제 실행은 05:47·05:58(한국시간)이었습니다.
- 급할 때(주일 아침 등)는 서버 관리자가 `sudo systemctl start gmchurch-publish.service`로 바로 반영할 수 있습니다.
  서버 접속·설정은 공식 저장소의 [`docs/DEPLOY-NCP.md`](https://github.com/lmkhkm/GMSKH_Homepage/blob/main/docs/DEPLOY-NCP.md)를 봅니다.
- 반영 확인: gmskh.or.kr 첫 화면 소스의 `app.js?v=값`이 공식 `main`의 최신 cache-bust 값과 같으면 배포된 것입니다.

## 공식 저장소에 반영하는 방법

**사용자가 요청할 때만** 합니다. 개발 저장소 `main`이 frpsy.github.io에서 문제없는지 먼저 확인합니다.

```bash
# 개발 저장소 클론 안에서 (공식 저장소 push 권한 필요)
scripts/release-official.sh
# → 공식 저장소에 merge/official-YYYYMMDD-HHMM 브랜치를 올림
# → 안내되는 주소에서 PR을 만들고 머지
```

스크립트가 하는 일 (손으로 할 때도 같은 순서):

1. 공식 저장소 `main`을 받아 `merge/official-…` 브랜치를 만든다
2. 개발 저장소 `main`을 머지한다 (`--no-ff`)
3. **충돌은 전부 개발 저장소 쪽을 채택**한다 — 원본은 개발 저장소이기 때문
4. `node scripts/set-site-url.js https://gmskh.or.kr`로 HTML·sitemap·robots의 절대주소를 공식 도메인으로 바꾼다
5. 루트 `.html`·`.xml`·`.txt`에 `frpsy.github.io/gmchurch_web`이 남지 않았는지 확인한다
6. `npm ci && npm test`가 통과해야 커밋·push 한다
7. PR 머지 → 공식 저장소 cache-bust가 `?v=` 갱신 → 2시간 안에 서버가 받아 감

### 매번 생기는 충돌 (정상)

| 충돌 | 이유 | 처리 |
|---|---|---|
| 모든 HTML의 `?v=` | 두 저장소의 cache-bust가 각자 SHA를 넣음 | 개발 쪽 채택 → 머지 후 공식 cache-bust가 다시 갱신 |
| HTML·sitemap·robots의 주소 | 공식은 `gmskh.or.kr`, 개발은 `frpsy.github.io` | 개발 쪽 채택 → 4단계에서 공식 도메인으로 재적용 |
| `data.js`·주보 파일 (가끔) | 두 저장소의 bulletin-sync가 각자 커밋 | 개발 쪽 채택 → 같은 규칙이라 다음 날 03:00에 다시 맞춰짐 |

### 공식 저장소에만 있는 파일 (건드리지 않음)

`deploy/`(서버 배포 스크립트·타이머·nginx 설정), `404.html`, `docs/DEPLOY-NCP.md`.
개발 저장소에는 없으므로 머지해도 그대로 남습니다. 이 파일을 고칠 일이 생기면 서버 관리자와 상의합니다.

## 지킬 것

- 공식 저장소에서 기능·콘텐츠를 직접 고치지 않는다. 고쳐야 하면 개발 저장소에서 고치고 다시 반영한다.
  (공식에서 직접 고친 내용은 다음 반영 때 충돌이 나면 개발 쪽으로 덮인다)
- 주보 등록도 개발 저장소에서만 한다. 공식 저장소는 반영 때 따라온다.
- 이 구조를 바꾸면 이 문서, `README.md`, `CLAUDE.md`의 Git 워크플로, `AGENTS.md`를 함께 고친다.
