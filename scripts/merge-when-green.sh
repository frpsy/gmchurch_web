#!/usr/bin/env bash
#
# PR의 `test` 검사가 실제로 통과한 것을 확인한 뒤에만 squash 머지한다.
# 개발(frpsy/gmchurch_web)·공식(lmkhkm/GMSKH_Homepage) 저장소 모두에 쓴다.
#
# 사용:  scripts/merge-when-green.sh <PR번호> [저장소]
#   저장소 기본값: frpsy/gmchurch_web
#
# 막는 실수(2026-11-26):
#  - PR을 만든 직후에는 검사가 아직 잡히지 않는다. 그때 결과를 보면 실패로 오인하거나
#    검사 없이 머지하게 된다 → `test` 검사가 뜰 때까지 기다린다.
#  - Netlify 검사는 끝나지 않고 남을 수 있다(서비스 종료) → `test` 검사만 본다.
#  - 다시 push한 직후에는 이전 커밋의 통과 결과가 보일 수 있다 → PR 머리 커밋의 검사만 본다(#835).
#  - 그사이 다른 세션이 먼저 머지하면 충돌(CONFLICTING)한다 → 머지하지 않고 멈춘다.
#    공식 반영 PR이면 그 PR을 닫고 scripts/release-official.sh를 다시 실행한다.
#  - 네트워크가 잠깐 끊기면(TLS 시간 초과 등) gh 호출을 몇 번 다시 시도한다.
#
# 종료 코드: 0 머지함 | 1 test 실패 | 2 검사가 시작되지 않음 | 3 충돌 | 4 그 밖의 오류
set -uo pipefail

PR="${1:?PR 번호를 주세요}"
REPO="${2:-frpsy/gmchurch_web}"
CHECK="test"

retry() { # 네트워크 오류에 대비해 최대 4번 시도
    local n=0 out
    while :; do
        if out=$("$@" 2>&1); then printf '%s' "$out"; return 0; fi
        n=$((n + 1))
        [ "$n" -ge 4 ] && { printf '%s' "$out" >&2; return 1; }
        sleep $((n * 5))
    done
}

state_of_test() { # PR 머리 커밋의 test 검사 결과(pass/fail/pending)를 돌려준다. 아직 없으면 빈 문자열
    # 다시 push한 직후 이전 커밋의 통과 결과를 읽지 않도록, 지금 머리 커밋(SHA)의 검사만 본다.
    local sha
    sha=$(retry gh pr view "$PR" -R "$REPO" --json headRefOid --jq .headRefOid) || return 0
    retry gh api "repos/$REPO/commits/$sha/check-runs" --jq \
        ".check_runs | map(select(.name == \"$CHECK\")) | sort_by(.started_at) | last
         | if . == null then \"\" elif .status != \"completed\" then \"pending\"
           elif .conclusion == \"success\" then \"pass\"
           elif (.conclusion == \"cancelled\" or .conclusion == \"skipped\") then \"cancel\" else \"fail\" end" 2>/dev/null
}

echo "[$REPO #$PR] '$CHECK' 검사를 기다립니다."
bucket=""
for _ in $(seq 1 60); do            # 최대 약 10분
    bucket=$(state_of_test || true)
    case "$bucket" in
        pass) break ;;
        fail|cancel) echo "  '$CHECK' 검사가 실패했습니다. 머지하지 않습니다."; \
                     retry gh pr checks "$PR" -R "$REPO" || true; exit 1 ;;
    esac
    sleep 10
done
if [ "$bucket" != "pass" ]; then
    echo "  '$CHECK' 검사가 ${bucket:-시작되지 않았습니다}. 머지하지 않습니다."; exit 2
fi
echo "  '$CHECK' 통과."

# 머지 가능 여부: GitHub가 계산을 마칠 때까지(UNKNOWN) 잠시 기다린다
mergeable=""
for _ in $(seq 1 12); do
    mergeable=$(retry gh pr view "$PR" -R "$REPO" --json mergeable --jq .mergeable || true)
    [ "$mergeable" != "UNKNOWN" ] && [ -n "$mergeable" ] && break
    sleep 5
done
if [ "$mergeable" = "CONFLICTING" ]; then
    echo "  충돌(CONFLICTING). 머지하지 않습니다."
    [ "$REPO" != "frpsy/gmchurch_web" ] && \
        echo "  공식 반영 PR이면: gh pr close $PR -R $REPO --delete-branch 후 scripts/release-official.sh 다시 실행"
    exit 3
fi
if [ "$mergeable" != "MERGEABLE" ]; then
    echo "  머지 가능 여부를 확인하지 못했습니다($mergeable)."; exit 4
fi

# 머지(브랜치가 이 기기의 worktree에 걸려 있어도 원격 브랜치 삭제는 진행된다)
retry gh pr merge "$PR" -R "$REPO" --squash --delete-branch >/dev/null 2>&1 || true
state=$(retry gh pr view "$PR" -R "$REPO" --json state --jq .state || true)
if [ "$state" = "MERGED" ]; then
    echo "  머지했습니다."
    exit 0
fi
echo "  머지되지 않았습니다(상태: $state)."; exit 4
