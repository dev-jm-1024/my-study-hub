# my-study-app Apple 리디자인 준비 작업 기록 · 인수인계

- **작성일:** 2026-10-18
- **대상:** 디자인 시안(캔버스), `my-study-app/src/styles/tokens*.css`, `my-study-app/src/constants/`, `.claude/`(에이전트·플레이북·로컬 설정), `scripts/`, `doc/`
- **기준 커밋:** `2522a9e` (feat: 추천 도서 5권 추가) — `main`, `origin/main`보다 **2커밋 앞섬(미push)**
- **커밋 수:** 0 — **오늘 작업은 전부 커밋하지 않은 상태** (10-12 연출 작업도 아직 미커밋)
- **관련 문서:** [실행 계획서](./261018_my_study_app_redesign_plan.md) · [로드맵](./261018_my_study_app_redesign_roadmap.md) · [목업 사본](./261018_redesign_mockups/) · [10-12 연출 기록](./261012_my_study_app_motion_design_log.md) · [10-11 인수인계](./261011_my_study_app_handover.md)
- **목적:** 오늘 한 일(시안 확정 → 토큰·상수 → 에이전트 팀 세팅)을 남기고, **외장 드라이브를 분리했다가 다시 연결한 뒤** 새 세션이 이 문서 하나로 이어갈 수 있게 한다. 새 세션용 프롬프트는 §7.

---

## 0. 요약

| 구분 | 내용 | 상태 |
|---|---|---|
| 디자인 시안 | Apple 스타일 캔버스 7개 보드 — https://claude.ai/artifact/KRGAtS74ioPBUPmT6UZnsL (비공개) | 확정 ("나머지 세부는 구현하면서 수정") |
| 목업 사본 | `doc/261018_redesign_mockups/` — 보드 7개 + `canvas.json` | 완료 (캔버스 최신본과 동일 확인 22:10) |
| 디자인 토큰 | `tokens.css`(라이트·다크·모바일) + `tokens.legacy.css`(옛 변수 호환) | 생성 · **미연결** (→ Ch0·Ch1 연결, `tokens.legacy.css`는 Ch9 삭제) |
| 상수 | `constants/{ui,links,navigation,index}.ts` | 생성 · 아무도 import 안 함 · `tsc --noEmit` 통과 |
| 계획·로드맵 | 계획서(규칙·명세·에이전트) + 로드맵(Ch0~Ch9, 챕터별 목표·작업표) | 완료 |
| 에이전트 | 하위 6종(`.claude/agents/`) + 리드 플레이북(`.claude/skills/redesign/`) | 완료 |
| 에이전트 팀 | 실험 기능 켬(`.claude/settings.local.json`), IntelliJ용 실행 스크립트 | 설정 완료 · **실제 팀 실행은 아직 안 함** |
| 앱 화면 | 변화 없음 (토큰·상수 미연결) | — |
| 빌드 | `npm run build`는 오늘 돌리지 않음 (연결하는 Ch0에서) | — |

## 1. 진행 순서

| # | 요청 | 결과 |
|---|---|---|
| 1 | "apple스럽게 리뉴얼, 바로 적용 말고 샘플을 아티팩트로" | 캔버스 생성: 홈(데스크톱)·자료실(Java)·홈(모바일 다크)·토큰 4개 보드. 실제 데이터(17주제·96문서·18권·3레포, 최근 커밋 문서) 사용 |
| 2 | 모바일 가로 슬라이드 양옆 블러 / '가장 많이 쌓인' 숫자 / 폰트·색·여백 통일 | 셸프 페이드+블러 추가. 숫자 오류는 **기존 바로가기 키를 그대로 쓴 실수** → 실제 순위로 수정. 9단계 타입·2개 글자색·4의 배수 간격으로 토큰화 |
| 3 | 상위 2개만 + 문서 비중 두 칸, "N개 문서." 제거 / 셸프 자동·무한 / 주제 그룹 시작·끝선 통일 / 달력 점 날짜 아래 / 자료실 N개씩 | 전부 반영. 주제 그룹은 grid + stretch로 **구조적** 정렬, 자료실은 '전체'·소분류 공통 페이징 + "앞 페이지에서 이어짐" |
| 4 | 자료실 사이드바 색 분리(맥 설정창), 모바일은 사이드 메뉴, 선택은 애플 블루 | 분리 패널 + `#0071E3` 선택. 모바일 자료실 보드 추가(왼쪽 드로어). 96개 실데이터로 모든 과목 전환 동작 |
| 5 | 과목 영역 넓게, 자료실 영역 좁게 | 사이드바 최대 320px, 본문 최대 760px |
| 6 | 페이저 간격 넓게, 원 작게 | 원 44→32px, 원 사이 약 20px (터치 영역 44px 유지) |
| 7 | 헤드라인 한 줄 / 헤더 드롭다운 + 바깥 블러 (애플 사이트처럼) | "백엔드 학습 기록, 한곳에." 한 줄. 드롭다운 4종 + 바깥 블러·흐림, 열린 상태 보드 추가 |
| 8 | 드롭다운 빈약 → 풍부하게 → "너무 많다, 축약, 과목은 텍스트만" | 최종: 메뉴마다 큰 글씨 첫 열 + 작은 목록 1~2열, 과목 아이콘 없음. 공용 콘텐츠 보드(`NavPanel`) |
| 9 | 상수·토큰 분리 / 상위·하위 에이전트 계획 / 로드맵·챕터 목표 / 모델 배정 | 토큰·상수 파일, 계획서, 로드맵, 에이전트 6종 + 플레이북 |
| 10 | 에이전트 메시지 통신 실험 기능 활성화 + gitignore / 터미널 하나에서 Opus가 팀원 호출 | 에이전트 팀 켬, `.gitignore`에 로컬 설정 추가, `scripts/redesign-lead.sh` |

## 2. 시안에서 확정된 결정 (구현 기준)

> 상세 명세는 계획서 §4. 여기는 사용자가 직접 정한 것만 모았다.

**전체**
- 크림·브라운 → 뉴트럴 그레이 `#F5F5F7` + 흰 면 + 애플 블루. 링크 글자 `#0066CC`, 채움·선택 `#0071E3`(흰 글자 대비 때문에 iOS `#007AFF` 대신).
- 글자 크기 9단계, 글자 색 2개(`label`·`label-2`), 간격 4의 배수 9단계, 모서리 5단계 — 모든 보드가 같은 토큰.

**홈**
- 히어로 제목 **한 줄**: "백엔드 학습 기록, 한곳에." (모바일은 자연 줄바꿈)
- 좌우 레일(프로필·스택 비율·시계·달력) 없음 → 1080px 단일 컬럼.
- "가장 많이 쌓인 자료실." = **문서 수 상위 2개 타일**(자동 선정) + **문서 비중 타일이 두 칸** 차지, 비중 타일에 "N개 문서." 제목 **없음**.
- "최근 올라온 문서." = **자동 넘김 + 무한 반복**, 일시정지 버튼, 양쪽 페이드+블러(데스크톱 64·모바일 40px).
- "주제별로 찾아보기." = 같은 줄 그룹의 **시작·끝선 항상 일치**(항목 수가 바뀌어도 유지).
- 달력: 문서 올린 날 점은 **날짜 아래**.

**상단 바·드롭다운**
- 반투명 블러 바, 메뉴 4개(자료실·Books·GitHub·Vibe)에 드롭다운. 열리면 **바깥 블러 + 흐림**.
- 드롭다운은 **축약형**: 자료실(큰 글씨 = 모든 주제·문서 수 상위 3, 작은 목록 2열, '그 외 N개 주제'), Books(분류 + 새 책 표지 4), GitHub(레포·원본 저장소), Vibe(분류 + 프로젝트). **과목에 아이콘 없이 텍스트만.**

**자료실**
- 사이드바 = 본문과 다른 색의 **분리 패널(맥 설정창)**, 최대 **320px**, 선택 과목 = **애플 블루 채움 + 흰 글자**. 본문 최대 **760px**.
- **한 페이지에 N개(10)** — '전체'와 소분류 모두. 소분류가 넘어가면 "앞 페이지에서 이어짐". (지금 앱은 소분류가 있으면 페이징하지 않음 → 바뀜)
- 페이저: 원 **32px**, 원 사이 **약 20px**, 누르는 영역 44px.
- 모바일: 사이드바 대신 **왼쪽에서 밀려 나오는 사이드 메뉴**.

## 3. 오늘 만든·바꾼 파일

| 파일 | git 상태 | 메모 |
|---|---|---|
| `my-study-app/src/styles/tokens.css` | 미추적 | 디자인 토큰 정본 — 미연결 |
| `my-study-app/src/styles/tokens.legacy.css` | 미추적 | 옛 변수 → 새 토큰 — 미연결, Ch9에서 삭제 예정 (→ 2026-10-20 Ch9 D6에서 삭제, 정적 CSS import도 끊음) |
| `my-study-app/src/constants/{ui,links,navigation,index}.ts` | 미추적 | 미사용 |
| `doc/261018_redesign_mockups/*.dc.html` (7) + `canvas.json` | 미추적 | 캔버스 사본 |
| `scripts/redesign-lead.sh` | 미추적 | IntelliJ 터미널용 리드 실행 (실행 권한 있음) |
| `.gitignore` | 수정 | `.claude/settings.local.json` 추가 |
| `doc/261018_my_study_app_redesign_{plan,roadmap,prep_log}.md` | **무시됨**(`*.md`) | 커밋하려면 `git add -f` |
| `.claude/agents/*.md` (6), `.claude/skills/redesign/SKILL.md` | **무시됨**(`*.md`) | 커밋하려면 `git add -f .claude/agents .claude/skills` |
| `.claude/settings.local.json` | **무시됨**(의도) | 팀 기능 플래그·in-process·읽기/빌드 명령 허용 7개 |

- 작업 트리에는 오늘 것 말고도 **10-12 연출 작업(미커밋)** 과 권한 변경 193건(외장 볼륨 영향, `core.fileMode=false`로 숨김), `README.md` 수정, 미추적 `gateway/`가 섞여 있다. 처리 방법은 Ch0의 🙋 D1.

## 4. 현재 상태 (2026-10-18 22:10)

| 항목 | 상태 |
|---|---|
| 브랜치 | `main` (리디자인 브랜치 `feat/apple-redesign`은 Ch0 RD-0-1에서 생성 예정) |
| push | 안 함 — `origin/main`보다 2커밋 앞섬(10-11부터 보류 중) |
| 로드맵 현재 위치 | `RD-0-1` — Ch0 시작 전, 🙋 D1 대기 |
| 앱 화면 | 오늘 변경 없음 |
| 디자인 캔버스 | 온라인(claude.ai) — 드라이브와 무관하게 남아 있음 |

## 5. 남은 일

1. **Ch0 시작** — 새 세션(§7 프롬프트 A)에서. 첫 단계가 🙋 D1(미커밋 작업 처리 + 브랜치).
2. 진행 중 물어볼 결정 D2~D7 — 계획서 §7 (화면 확인 방식, 홈 진입 연출 유지, 시계·스택 위젯 삭제, Books 태그 주소, 옛 CSS 끊기, 병합·push).
3. 10-11부터 남은 일(push 보류, 도서 태그, `temp/261011/` 정리, 권한 변경 193건) — [10-11 인수인계 §2](./261011_my_study_app_handover.md#2-남은-일) 그대로.

## 6. 외장 드라이브 분리·재연결

### 6.1 분리 전에
22:10 기준 `/Volumes/dev`를 잡고 있던 것과 정리 방법:

| 프로세스 | 정체 | 정리 |
|---|---|---|
| `claude`, `caffeinate` | 이 Claude Code 세션 | 세션 종료(`/exit`) |
| `aside mcp`, `npm exec …server-pdf`, `mcp-pdf-server`, `desktop-commander` | 이 세션이 띄운 MCP 서버들 | 세션을 끝내면 같이 꺼짐 |
| `idea` | IntelliJ (프로젝트가 드라이브에 있음) | 프로젝트 닫기 또는 IntelliJ 종료 |
| `zsh` 2개 | 드라이브 경로에 있는 터미널 탭 | 탭 닫기 |

- `npm run dev`가 떠 있으면 끈다.
- 저장 안 된 변경은 없다(파일은 전부 드라이브에 기록됨). 커밋은 안 해도 분리에 문제 없다.
- 남은 게 있는지 확인: `lsof -nP 2>/dev/null | awk '$9 ~ /^\/Volumes\/dev/ {print $1, $2}' | sort -u` → 빈 결과면 Finder에서 꺼내기.

### 6.2 드라이브 밖에 있는 것 (분리해도 남거나, 사라지는 것)

| 위치 | 내용 | 분리 영향 |
|---|---|---|
| `~/.claude/projects/-Volumes-dev-study-pdf-center/memory/` | Claude 메모리(`command grep` 규칙, `.env` 글자 차단 훅) | 남음. **경로가 `/Volumes/dev/study/pdf-center`일 때만** 이 메모리를 씀 |
| `~/.claude/settings.json` | 사용자 설정·훅(`block-secret-reads` 등) | 남음 |
| `~/.claude/teams`, `~/.claude/tasks` | 에이전트 팀 실행 중 상태 | 아직 없음. 세션 끝나면 필요 없음 |
| `/private/tmp/claude-501/…/scratchpad` | 오늘 세션 임시 폴더(목업 원본·표지 이미지) | **재부팅 시 사라짐** — 필요한 건 `doc/261018_redesign_mockups/`에 복사해 둠, 표지는 캔버스에 업로드됨 |
| claude.ai 캔버스 | 디자인 시안 원본 | 온라인, 영향 없음 |

### 6.3 다시 연결한 뒤 점검표
```bash
ls -d /Volumes/dev/study/pdf-center            # ① 마운트 경로가 그대로인지 ("/Volumes/dev 1"처럼 바뀌면 안 됨)
cd /Volumes/dev/study/pdf-center
git branch --show-current                      # ② main (Ch0 전)
git -c core.fileMode=false status --short | wc -l   # ③ 22:10 기준 26줄
ls my-study-app/src/constants my-study-app/src/styles/tokens*.css scripts/redesign-lead.sh .claude/agents .claude/skills/redesign   # ④ 오늘 파일
command grep -n "현재 위치" doc/261018_my_study_app_redesign_roadmap.md   # ⑤ RD-0-1
cd my-study-app && npx tsc -p tsconfig.app.json --noEmit && echo TSC OK     # ⑥ 타입 검사
```
- ①이 다르면(볼륨 이름이 바뀌면) Finder에서 볼륨 이름을 `dev`로 되돌린다. 경로가 바뀌면 메모리와 SKILL.md의 `cd` 경로가 어긋난다.

## 7. 새 세션 프롬프트

> 복사용 텍스트 파일: [`261018_redesign_new_session_prompt.txt`](./261018_redesign_new_session_prompt.txt) (아래와 같은 내용 + 보는 순서)

**A. 리디자인 시작 (에이전트 팀으로 Ch0)** — IntelliJ 터미널(프로젝트 루트)에서 `./scripts/redesign-lead.sh 0`로 열면 `/redesign Ch0`이 자동 입력된다. 그냥 `claude`로 열었다면 아래를 붙여 넣는다:
```
외장 드라이브를 다시 연결했어. JM Hub Apple 리디자인을 이어서 하자.
먼저 doc/261018_my_study_app_redesign_prep_log.md(어제 기록·인수인계)의 §6.3 점검표를 돌려서
기록과 다른 점이 있으면 알려줘. 이상 없으면 /redesign 플레이북대로 Ch0을 에이전트 팀으로 진행해.
첫 단계 RD-0-1(D1: 미커밋 작업 처리 + feat/apple-redesign 브랜치)은 팀원을 띄우기 전에 나한테 먼저 물어봐.
```

**B. 점검만 (수정 없이 상태 확인)**
```
외장 드라이브 다시 연결했어. doc/261018_my_study_app_redesign_prep_log.md를 읽고
§6.3 점검표대로 확인만 해줘. 아무것도 수정하지 말고, 결과를 표로 보여준 다음 다음에 할 일을 한 줄로 알려줘.
```

**C. 시안을 더 고치고 싶을 때**
```
리디자인 시안 캔버스 https://claude.ai/artifact/KRGAtS74ioPBUPmT6UZnsL 를 이어서 고치자.
doc/261018_my_study_app_redesign_prep_log.md §2(확정된 결정)를 먼저 읽고 시작해.
고친 내용은 doc/261018_redesign_mockups/ 사본, 계획서, 로드맵에도 반영해줘.
고칠 것: <여기에 적기>
```

**D. 다음 챕터부터 (Ch1 이후)** — 새 터미널에서 `./scripts/redesign-lead.sh <번호>` (프롬프트 입력 불필요). 이전 챕터 세션은 `/resume`하지 말고 닫는다(팀원은 복구되지 않음).

## 8. 알아둘 것

- **`.env` 글자 차단 훅:** 사용자 훅(`block-secret-reads`)이 명령 안에 `.env` 글자만 있어도 막는다(예: `jq '.env.X'`). 훅을 우회하지 말고 `jq 'keys'`·`printenv` 등으로 바꿔 쓴다.
- **검색:** 이 환경의 `grep`은 ugrep 별칭 → `command grep`.
- **문서·에이전트 파일:** `*.md`가 gitignore라 `doc/`·`.claude/`의 md는 git에 안 잡힌다. 커밋하려면 `git add -f`.
- **권한 변경 193건:** 커밋할 땐 `git -c core.fileMode=false add <파일>`로 해당 파일만.
- **에이전트 팀은 실험 기능:** 세션당 팀 1개, `/resume`으로 팀원 복구 안 됨, 토큰을 많이 씀. 이상하면 플레이북 §9(서브에이전트 폴백).
- **팀원 조작(in-process):** ↑/↓ 선택 · Enter 보기/메시지 · Esc 해제(보는 중이면 중단) · `x` 종료 · Ctrl+T 작업 목록.
