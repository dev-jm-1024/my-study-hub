#!/usr/bin/env bash
# 리디자인 팀 리드(Opus) 세션을 연다 — IntelliJ 터미널에서 실행.
#
#   ./scripts/redesign-lead.sh        로드맵 '현재 위치'의 챕터부터
#   ./scripts/redesign-lead.sh 3      Ch3를 에이전트 팀으로 진행
#
# 챕터 1개 = 세션 1개 = 팀 1개. 챕터가 끝나면 세션을 닫고 다음 번호로 다시 연다.
# 팀원 보기: ↑/↓ 선택 · Enter 대화 보기/메시지 · Esc 선택 해제(보는 중이면 그 팀원 중단) · x 종료 · Ctrl+T 작업 목록
set -euo pipefail

cd "$(dirname "$0")/.."

# .claude/settings.local.json에도 있지만, 셸에서도 켜 둔다
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1

prompt="/redesign"
if [[ $# -ge 1 ]]; then
  prompt="/redesign Ch${1#Ch}"
fi

exec claude --model opus --teammate-mode in-process "$prompt"
