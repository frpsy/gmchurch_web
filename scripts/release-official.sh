#!/usr/bin/env bash
#
# 개발 저장소(frpsy/gmchurch_web) main을 공식 저장소(lmkhkm/GMSKH_Homepage)에
# 반영할 머지 브랜치를 만들어 push 합니다. 절차 설명은 docs/REPO-STRUCTURE.md.
#
# 사용:  scripts/release-official.sh [작업폴더]
#   작업폴더 기본값: 임시 폴더 (끝나면 경로를 알려 줍니다)
#
# 주보·교회소식 등록 직후에는 항상 실행하고, 그 밖의 작업은 사용자가 공식 반영을 요청했을 때만 실행합니다.

set -euo pipefail

DEV_URL="${DEV_URL:-https://github.com/frpsy/gmchurch_web}"
OFFICIAL_URL="${OFFICIAL_URL:-https://github.com/lmkhkm/GMSKH_Homepage}"
OFFICIAL_SITE="https://gmskh.or.kr"
DEV_SITE="https://frpsy.github.io/gmchurch_web"

WORK="${1:-$(mktemp -d)}"
BRANCH="merge/official-$(date +%Y%m%d-%H%M)"

say() { printf '\n== %s\n' "$*"; }

say "공식 저장소 받기 → $WORK/official"
if [ -d "$WORK/official/.git" ]; then
  git -C "$WORK/official" fetch --quiet origin main
else
  git clone --quiet "$OFFICIAL_URL" "$WORK/official"
fi
cd "$WORK/official"
git fetch --quiet "$DEV_URL" main
DEV_SHA="$(git rev-parse --short FETCH_HEAD)"
git checkout --quiet -B "$BRANCH" origin/main

if git merge-base --is-ancestor FETCH_HEAD HEAD; then
  echo "공식 저장소에 이미 개발 main($DEV_SHA)이 들어 있습니다. 할 일이 없습니다."
  exit 0
fi

say "개발 main($DEV_SHA) 머지"
git merge --no-ff --no-commit FETCH_HEAD >/dev/null 2>&1 || true

# 원본은 개발 저장소이므로 충돌은 모두 개발 쪽을 채택한다.
# (?v= 값·도메인·주보 자동 커밋 차이 — 아래에서 도메인을 다시 입힌다)
CONFLICTS="$(git diff --name-only --diff-filter=U)"
if [ -n "$CONFLICTS" ]; then
  echo "충돌 $(echo "$CONFLICTS" | wc -l)개 → 개발 쪽 채택"
  while IFS= read -r f; do
    if git cat-file -e "FETCH_HEAD:$f" 2>/dev/null; then
      git checkout --theirs -- "$f" && git add -- "$f"
    else
      # 개발 쪽에서 삭제된 파일
      git rm --quiet -- "$f"
    fi
  done <<< "$CONFLICTS"
fi

say "공식 도메인 적용"
node scripts/set-site-url.js "$OFFICIAL_SITE" --from "$DEV_SITE"
git add -u

say "검증"
LEFT="$(grep -l "$DEV_SITE" -- *.html *.xml *.txt 2>/dev/null || true)"
if [ -n "$LEFT" ]; then
  echo "개발 주소가 남은 파일이 있습니다: $LEFT" >&2
  exit 1
fi
if [ -n "$(git diff --name-only --diff-filter=U)" ]; then
  echo "해결되지 않은 충돌이 있습니다." >&2
  exit 1
fi
npm ci --silent
npm test

git commit --quiet -m "chore: 개발 저장소 main($DEV_SHA) 공식 반영

- 충돌은 개발 저장소 쪽 채택 (?v= 값·도메인·주보 자동 커밋 차이)
- 절대주소를 $OFFICIAL_SITE 로 재적용
- npm test 통과"

say "push"
git push --quiet -u origin "$BRANCH"

echo
echo "완료: $BRANCH"
echo "PR 만들기: $OFFICIAL_URL/compare/main...$BRANCH?expand=1"
echo "머지 후 서버가 2시간 안에 gmskh.or.kr에 반영합니다."
