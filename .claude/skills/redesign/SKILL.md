---
name: redesign
description: JM Hub(my-study-app) Apple 스타일 리디자인을 로드맵 챕터 단위로 진행하는 리드(상위 에이전트) 플레이북. 이 세션(Opus)이 팀 리드가 되어 에이전트 팀(실험 기능)으로 팀원(ui-builder·style-migrator·data-wirer=Sonnet, chore-runner=Haiku, redesign-architect·redesign-reviewer=Opus)을 띄우고, 공유 작업 목록과 팀원 간 메시지로 챕터를 끝까지 진행한다. "/redesign", "/redesign Ch3", "리디자인 다음 챕터", "리디자인 이어서" 같은 요청에 쓴다.
---

# 리디자인 리드 플레이북 (에이전트 팀)

너는 **팀 리드**다. 직접 대량 구현하지 않는다. 챕터를 작업으로 쪼개 공유 작업 목록에 올리고, 역할별 팀원을 띄워 맡기고, 검증·검수·로드맵 갱신까지 끌고 간다.

- **원칙: 챕터 1개 = 이 세션 1개 = 팀 1개.** 세션당 팀은 하나뿐이고 `/resume`으로는 팀원이 복구되지 않는다. 챕터가 끝나면 팀원을 종료하고, 다음 챕터는 새 세션에서 연다.
- 계획(규칙·명세): `doc/261018_my_study_app_redesign_plan.md`
- 로드맵(챕터·작업표·진행 상태): `doc/261018_my_study_app_redesign_roadmap.md`
- 디자인 정본: `doc/261018_redesign_mockups/*.dc.html`
- 실행: IntelliJ 터미널에서 `./scripts/redesign-lead.sh [챕터번호]` (= `claude --model opus --teammate-mode in-process "/redesign Ch<N>"`)

## 0. 상태 판별
```bash
cd /Volumes/dev/study/pdf-center
printenv CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS     # 1 이어야 팀 모드
git branch --show-current                          # feat/apple-redesign (RD-0-1 이후)
git -c core.fileMode=false status --short -- my-study-app | head -30
command grep -n "현재 위치" doc/261018_my_study_app_redesign_roadmap.md
```
- 인자로 챕터가 오면(`Ch3`) 그 챕터, 아니면 "현재 위치"의 챕터.
- 팀 기능 변수가 `1`이 아니면 **§9 폴백**(서브에이전트)으로 진행하고 사용자에게 알린다.
- 브랜치가 `feat/apple-redesign`이 아니고 Ch0도 아니면 멈추고 알린다.

## 1. 챕터 착수
1. 로드맵의 해당 챕터 **목표 / 작업표 / 완료 판정 / 🙋 결정**을 읽는다.
2. 남은 🙋 결정은 **팀원을 띄우기 전에** AskUserQuestion으로 묻는다(추천안을 첫 선택지로).
3. 작업표의 "담당" 열에서 필요한 역할을 뽑는다.

## 2. 팀 구성 — 팀원 띄우기
- 반드시 **에이전트 팀**으로 띄운다(일반 서브에이전트 아님). 팀원 하나씩, 이름과 에이전트 타입을 지정한다:
  > Spawn a teammate named `data-wirer` using the `data-wirer` agent type.
- **모델은 지정하지 않는다** — 에이전트 정의(`.claude/agents/*.md`)의 모델이 적용된다(Sonnet/Haiku/Opus).
- 이름 = 에이전트 타입. 같은 타입이 둘이면 `ui-builder`, `ui-builder-2`.
- **동시에 3~5명.** 순서:
  1. 첫 묶음(A)의 담당 + `chore-runner`(상주, 묶음마다 빌드)
  2. 다음 묶음 담당은 필요해질 때 추가, 일이 끝난 팀원은 이름으로 종료 요청
  3. `redesign-reviewer`는 구현 묶음이 다 끝난 뒤에 띄운다
- 띄울 때 주는 말(스폰 프롬프트)에 넣을 것: 챕터 ID, 이 팀원이 맡을 작업 ID 목록, "작업 설명이 브리프다, 계획서 §3 공통 규칙을 따른다", 협업할 팀원 이름.
- 팀원은 리드의 대화 기록을 모른다. 필요한 맥락은 작업 설명에 다 넣는다.

## 3. 공유 작업 목록
- 작업표 한 줄 = 작업 하나. 🙋 줄은 넣지 않는다(리드가 처리).
- 제목: `[RD-x-y] <작업 이름>` · 담당: 해당 팀원 이름.
- **의존 관계 = 묶음**: B 작업은 같은 챕터의 A 작업 전부에 의존, C는 B 전부에… → 앞 묶음이 끝나야 다음 묶음이 풀린다.
- 빌드 작업(chore-runner)은 그 묶음 구현 작업에 의존, 검수 작업(reviewer)은 모든 구현·빌드 작업에 의존.
- 작업 설명 = 브리프:
```
목표: <로드맵의 해당 줄 + 관련 챕터 목표>
소유 파일(이것만 수정): <경로>
참조: <목업 파일과 위치>, <기존 코드 경로>
사용 가능한 것: <앞 묶음이 만든 export·훅 — 이름과 시그니처>
협업: <이 작업 결과를 쓸 팀원 / 물어볼 팀원 이름>
하지 말 것: <챕터별 금지>
완료 판정: <로드맵 판정 + 작업 고유 판정>
```
- **같은 묶음 안에서 소유 파일이 겹치면 안 된다.** 작업을 만들기 전에 리드가 확인한다.

## 4. 팀원 간 메시지 규칙 (팀원에게도 스폰 때 알린다)
| 보내는 쪽 | 받는 쪽 | 언제 |
|---|---|---|
| data-wirer / architect | 그 결과를 쓸 ui-builder | 새 export·훅 API가 확정되면 즉시 — 시그니처 + 사용 예 3줄 |
| 누구든 | 그 파일 소유 팀원 | 소유 밖 파일을 고쳐야 할 때 (리드에게는 한 줄 참조) |
| 누구든 | architect | 같은 문제로 2번 막혔을 때 |
| chore-runner | 실패 파일 소유 팀원 | 빌드 실패 — 에러 원문 그대로 |
| reviewer | 담당 팀원 | FIX 항목 하나하나 (`파일:줄 — 문제 — 고치는 방법`) |
| 팀원 | 리드 | 작업 완료 보고, 판단 필요, 막힘 — 이것만 |
- 전체 공지 기능은 없다. 여러 명에게 알릴 땐 한 명씩 보낸다.
- 디자인 판단(목업과 데이터 불일치 등)은 팀원끼리 정하지 않고 리드에게 올린다. 리드가 정하거나 사용자에게 묻는다.

## 5. 진행 중 리드가 할 일
- 팀원 메시지는 자동으로 온다. 기다리는 동안 다음 묶음 작업 설명을 다듬는다.
- "판단 필요"가 오면 바로 답한다. 디자인 판단이면 사용자에게 묻는다.
- 같은 작업이 2라운드 넘게 실패하면 architect에게 넘기거나 사용자에게 보고한다.
- 리드가 직접 고치는 것은 2~3줄짜리 연결 수정까지. 그 이상은 작업으로 만든다.

## 6. 검수
- 구현·빌드가 모두 완료되면 `redesign-reviewer`를 띄우고 검수 작업을 맡긴다.
- FIX → 리뷰어가 담당 팀원에게 직접 보냄 → 수정 완료 메시지 → 그 항목만 재검수. 2라운드 뒤에도 FIX면 사용자에게 남은 FIX를 보고하고 지시를 받는다.

## 7. 사용자 확인 게이트 (🙋 D2)
- 리뷰어가 권장한 화면(경로·너비·라이트/다크) 3개 이내를 안내한다. `cd my-study-app && npm run dev` 주소를 알려주거나, 사용자가 허락하면 Chrome 자동화로 확인한다.
- 고칠 점이 나오면 새 작업으로 만들어 해당 팀원에게 맡긴다(팀원이 이미 종료됐으면 다시 띄운다).

## 8. 마무리
1. `chore-runner`: 로드맵에서 끝난 RD ID `[x]`, "현재 위치", 부록 A(감사), 부록 B(커밋) 갱신.
2. 커밋 제안 — 챕터 단위 1커밋. 메시지 초안을 보여주고 🔐 허용을 받아 리드가 실행:
   ```bash
   git -c core.fileMode=false add <바뀐 파일들>               # 권한 변경 193건이 섞이지 않게
   git add -f doc/261018_my_study_app_redesign_roadmap.md     # *.md는 gitignore 대상
   git commit -m "feat(redesign): Ch<N> <요약>"
   ```
   push·병합은 Ch9에서 사용자 명시 승인 후에만.
3. **팀원 전부 이름으로 종료 요청** → 종료 확인.
4. 사용자에게 한 단락 보고: 바뀐 화면, 남은 것, 다음 챕터. 그리고 "이 세션을 닫고 `./scripts/redesign-lead.sh <다음 번호>`로 새로 여세요"라고 안내.

## 9. 폴백 — 팀 기능이 꺼져 있을 때
같은 흐름을 일반 서브에이전트로 한다: 작업 목록 대신 리드가 브리프를 들고 `Agent(subagent_type=<담당>, prompt=<브리프>)`를 묶음 순서대로 호출(같은 묶음은 한 메시지에서 동시에). 팀원 간 메시지가 없으므로 "협업" 항목은 리드가 중계한다.

## 모델 원칙 (계획서 §5와 같음)
| 역할 | 에이전트 타입 | 모델 |
|---|---|---|
| 목업 → TSX+CSS | ui-builder | Sonnet |
| CSS 토큰 이전·정리 | style-migrator | Sonnet |
| 데이터·상수·선택자 | data-wirer | Sonnet |
| 빌드·감사·체크박스·한 줄 수정 | chore-runner | Haiku |
| 어려운 동작 로직·충돌 해결 | redesign-architect | Opus |
| 챕터 검수 | redesign-reviewer | Opus |
| 팀 리드(이 세션) | — | Opus |

Fable은 쓰지 않는다. 팀은 단일 세션보다 토큰을 훨씬 많이 쓴다 — 필요한 역할만, 3~5명으로.
