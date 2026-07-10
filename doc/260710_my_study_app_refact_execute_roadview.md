# my-study-app 리팩토링 실행 로드뷰 (Roadview)

- **작성일:** 2026-07-10 · **근거:** [실행 계획서](./260710_my_study_app_refact_execute_plan.md) · [원 계획서 v1.2](./260710_my_study_app_refact_plan.md)
- **목적:** 실행 계획서의 각 Step을 **중단·재개 가능한 최소 단위(RV-x-x)** 로 세분화한 진행 추적 문서. 세션이 끊겨도 §2 재개 가이드의 상태 판별만으로 정확한 위치에서 이어서 진행한다.
- **사용 규칙:**
  1. 단계 완료 시 체크박스 `[x]` + 아래 "현재 위치"를 갱신한다.
  2. 모든 단계는 **완료 판정**(객관적 명령·기대 출력)을 가진다 — 체크 여부가 불확실하면 판정 명령을 다시 실행한다.
  3. 로드뷰 갱신은 문서 전용 변경이므로 각 Step 커밋에 함께 포함한다 (CSS 바이트 검증과 무관).
  4. **완료 판정에서 "working tree clean"을 볼 때 본 로드뷰 문서의 변경은 예외** — `git status --short -- ':!doc'` 로 확인하면 로드뷰 갱신분이 제외된다.

> **현재 위치:** `RV-3-1` (RV-0~RV-2 완료)
>
> **실측 기록 (RV-0-4에서 기입):** index.css = 1796 줄 / 마커 balance≠0 개수 = 0개 (기대: 1796 / 0개) — 2026-07-11 재확인, 일치

---

## 1. 범례 — 자동 vs 권한 vs 사용자 결정

| 표기 | 의미 | 예 |
|---|---|---|
| 🤖 **자동** | Claude가 단독 수행. 읽기·검증 명령(grep/awk/wc/diff)과 리포 내 파일 생성·편집 | 균형 검증, CSS 절단, barrel 작성 |
| 🔐 **권한 프롬프트** | 상태 변경 Bash 명령 — 실행 시 Claude Code가 허용 여부를 물음. **"허용" 클릭만 필요** (allowlist 등록 시 이후 자동) | `git commit`, `npm uninstall`, `cp /tmp` |
| 🙋 **사용자 결정** | 도구 권한과 무관하게 **사용자의 판단·확인·명시적 승인**이 필요한 사안 | 커밋 범위 확정, go/no-go 게이트, main 병합 |

- ✏️ 파일 편집(Edit/Write)은 권한 모드에 따라 다름: 기본 모드는 편집마다 확인 프롬프트, **acceptEdits 모드면 🤖 자동**. 이 문서에서는 🤖로 분류하고 여기서 일괄 고지한다.

### 1.1 🔐 권한 허용이 필요한 Bash 명령 모아보기 (사전 allowlist 등록 대상)

| 명령 계열 | 사용 지점 | 비고 |
|---|---|---|
| `git add` / `git commit` | RV-0-3, 각 Step 커밋 (RV-1-5, 2-6, 3-5, 4-6, 5-6, 6-6, 7-3) | 필수 6회 + 선택 2회(RV-6-6, 7-3) + 병합 1회 |
| `git checkout -b` | RV-0-5 | 1회 |
| `git rm` | RV-1-1 | 1회 |
| `npm run build` | 전 Step 검증 (10회+) | 가장 빈번 — allowlist 권장 |
| `npm uninstall` | RV-1-2 | 1회 |
| `npm audit fix` | RV-7-3 | 1회, 사용자 결정 후 |
| `cp` (리포 밖 `/tmp`로) | RV-0-6 | 기준선 채취 |
| `mkdir`, `sed ... >` (리포 내 파일 생성) | RV-2-2 | Write 도구로 대체 가능 |
| `git merge` / `git push` | RV-7-4 | **🙋 명시 승인 후에만** — 배포 트리거 |

### 1.2 🙋 사용자 결정 사안 모아보기

| ID | 사안 | 시점 |
|---|---|---|
| D1 | 기능 커밋의 범위·메시지 확정 (전체 1커밋 vs 분리) | RV-0-2 |
| D2 | 스크린샷 방식 — 직접 촬영 / Chrome 자동화 위임(확장 사이트 권한 필요) / 생략 | RV-0-7 |
| D3 | 브라우저 동작 확인 — 직접 확인 vs Chrome 자동화 위임 | RV-1-4(선택), 3-4, 4-5, 5-5, 6-5, 7-1 |
| D4 | **Step 6 go/no-go 게이트** — 통과 판정 후 진행 여부 | RV-6-0 |
| D5 | npm audit fix 실행 여부 (기준선 무효화 수반) | RV-7-3 |
| D6 | **main 병합 + push — 병합 = 즉시 Docker Hub `latest` 배포 (R15). 반드시 별도 명시 승인** | RV-7-4 |

---

## 2. 재개(Resume) 가이드 — 끊겼을 때 여기부터

### 2.1 상태 판별 원샷 (🤖 읽기 전용 — 언제든 실행 가능)

```bash
cd /Users/dev-jm/workspace/study/pdf-center
echo "== 브랜치 ==";        git branch --show-current
echo "== 최근 커밋 ==";     git log --oneline -8
echo "== working tree ==";  git status --short | head -20
echo "== 기준선 ==";        ls -la /tmp/baseline.css 2>/dev/null || echo "없음"
echo "== styles/ 파일수 =="; ls my-study-app/src/styles/ 2>/dev/null | wc -l
echo "== data/ 구성 ==";    ls my-study-app/src/data/
echo "== gsap 잔존 ==";     grep -c '"gsap"' my-study-app/package.json
```

### 2.2 판정표 — 관측 상태 → 재개 지점

| 관측 상태 (위 명령 결과) | 재개 지점 |
|---|---|
| 브랜치=main, 미커밋 기능 파일 다수 | **RV-0-2** (처음부터) |
| main에 기능 커밋 완료, refactor 브랜치 없음 | **RV-0-4** |
| 브랜치=refactor/…, `/tmp/baseline.css` 없음 | **RV-0-6** (기준선 재채취 — Step 0 커밋 시점과 HEAD가 다르면 Step 0 커밋 체크아웃 후 빌드해 채취). **재채취 후 아래 HEAD 행으로 재판정해 원 위치로 복귀** |
| HEAD = `chore: 미사용 GlassCard·stackColor·gsap 제거` | **RV-2-1** |
| HEAD = `refactor: index.css를 styles/로 섹션 분할…` | **RV-3-1** |
| HEAD = `refactor: menuData를 도메인별 파일로 분할…` | **RV-4-1** |
| HEAD = `refactor: 공용 유틸·훅 추출…` | **RV-5-1** |
| HEAD = `refactor: CategoryRow 추출…` | **RV-6-0** |
| HEAD = `refactor: 카테고리 메타 categories.ts로 통합` | **RV-7-1** |
| HEAD = `chore: npm audit fix…` | **RV-7-4** |
| working tree dirty (단계 중간에 끊김) | **로드뷰 문서만 변경된 dirty는 정상**(직전 단계 완료 상태 — 사용 규칙 4). 그 외에는 해당 Step의 각 RV 완료 판정 명령을 위에서부터 실행해 세부 위치 특정. 복구 곤란 시 `git checkout -- .`로 그 Step만 재작업 (직전 커밋은 안전). 신규 untracked 파일(예: RV-2 중단 시 `src/styles/`)은 checkout으로 안 지워짐 — `git clean -nd <경로>`로 대상 확인 후 **경로 한정** `git clean -fd <경로>` |

---

## 3. RV-0 — 선행 조건 (실행 계획서 Step 0 · main 브랜치에서)

- [x] **RV-0-1** 🤖 사전 상태 점검 — §2.1 원샷 실행, 결과 확인.
  - 판정: 미커밋 기능 파일 존재 여부 파악 완료.
- [x] **RV-0-2** 🙋 **[D1] 기능 커밋 범위·메시지 확정** — 기본안 채택: 전체 1커밋 `feat: Vibe 코딩 페이지·홈 위젯 추가 및 리팩토링 계획 문서`.
- [x] **RV-0-3** 🔐 기능 커밋: `git add -A && git commit -m "<확정 메시지>"`
  - 판정: `git status --short -- ':!doc'` 출력 없음(로드뷰 갱신 제외 — 사용 규칙 4) + `git log -1 --oneline` 메시지 일치. → **통과** (커밋 `fbbb13d`, 37 files changed). 커밋 전 전체 변경 파일 시크릿 패턴 grep 0건 확인.
- [x] **RV-0-4** 🤖 재실측 (R12) — `wc -l my-study-app/src/index.css` 와 awk 균형 검증(§2.1 아님, 실행 계획서 §2 ② 명령). 결과를 문서 상단 "실측 기록"에 기입.
  - 판정: 1796줄 + 30개 마커 전부 balance=0. → **통과**, 문서 기재값과 일치.
- [x] **RV-0-5** 🔐 브랜치 생성: `git checkout -b refactor/my-study-app-structure`
  - 판정: `git branch --show-current` = `refactor/my-study-app-structure`. → **통과**.
- [x] **RV-0-6** 🔐 기준선 채취: `cd my-study-app && npm run build && cp ../static-react/assets/index-*.css /tmp/baseline.css`
  - 판정: `ls -la /tmp/baseline.css` 존재 + 빌드 성공 로그. → **통과** (`index-Vp8Lmaed.css`, 53423 bytes).
- [x] **RV-0-7** 🙋 **[D2] (권장) 스크린샷** — 6페이지(홈/다운로드/책/GitHub/Vibe/404) × 라이트/다크. 방식 결정: 직접 / Chrome 자동화(확장 권한) / 생략.
  - 결정: **생략** — CSS 바이트 diff(0 강제) + 수동 체크리스트(RV-7-1)로 대체 검증.

## 4. RV-1 — 죽은 코드 제거 (Step 1 · 이하 refactor 브랜치)

- [x] **RV-1-1** 🔐 `git rm my-study-app/src/components/GlassCard.tsx`
  - 판정: 파일 부재 + `grep -rn "GlassCard" my-study-app/src/` 0건. → **통과**.
- [x] **RV-1-2** 🔐 `cd my-study-app && npm uninstall gsap` — lock 동시 갱신 (R13).
  - 판정: `grep '"gsap"' package.json package-lock.json` 0건. → **통과**.
- [x] **RV-1-3** 🤖 `src/data/stacks.ts`에서 `stackColor` export 삭제.
  - 판정: `grep -rn "stackColor" my-study-app/src/` 0건. → **통과**.
- [x] **RV-1-4** 🔐 검증: `npm run build` 성공 + 🙋 **[D3]** (선택) 홈 진입 애니메이션 확인.
  - 판정: 빌드 성공, tsc 에러 0. → **통과** — CSS 산출물 해시(`index-Vp8Lmaed.css`)가 RV-0-6 기준선과 동일해 애니메이션 CSS 무영향도 기계적으로 증명됨(육안 확인 생략).
- [x] **RV-1-5** 🔐 커밋: `chore: 미사용 GlassCard·stackColor·gsap 제거`
  - 판정: `git show --stat HEAD`에 **package.json + package-lock.json 포함** (R13 핵심). → **통과** (커밋 `544e5d6`).

## 5. RV-2 — index.css 분할 (Step 2 · 최고 주의: 연속 슬라이스, 재배치 금지)

- [x] **RV-2-1** 🤖 절단 직전 균형 재검증 — 실행 계획서 §4 ① awk.
  - 판정: 30개 마커 전부 balance=0. → **통과** (마커 텍스트까지 전수 재확인: 절단 경계 13 + 내부 소제목 17).
- [x] **RV-2-2** 🤖 `src/styles/` 생성 + 절단표(실행 계획서 §4 ②)대로 13개 파일 sed 추출. 각 파일 최상단 한 줄 주석만 추가 허용 (`.home-anim` 전 페이지 사용 주석은 home-hero.css에, `.dl-crumb` 잔류 주석은 vibe.css에).
  - 판정: `ls my-study-app/src/styles/ | wc -l` = 13. → **통과** (라인수 합 1782 = 1796−14, 정확히 일치).
- [x] **RV-2-3** 🤖 index.css를 @import 매니페스트로 교체 (레거시 6건 경로 불변 → styles 13건, responsive.css 마지막).
  - 판정: `grep -c "@import" my-study-app/src/index.css` = 19. → **통과**.
- [x] **RV-2-4** 🤖 분할 무결성: 파일별 중괄호 균형 각각 0 + 13파일 라인수 합 sanity (≈ 원본 1796 − 매니페스트 잔류분 + 헤더 주석 수).
  - 판정: 균형 전부 0. → **통과** (13개 파일 전부 balance=0).
- [x] **RV-2-5** 🔐 핵심 검증: `npm run build && diff /tmp/baseline.css ../static-react/assets/index-*.css`
  - 판정: **diff 출력 0** + 산출물 파일명(content hash) 동일. → **통과** — diff exit code 0, 해시 `index-Vp8Lmaed.css` RV-0-6 기준선과 완전 동일.
- [x] **RV-2-6** 🔐 커밋: `refactor: index.css를 styles/로 섹션 분할 (규칙 무변경)`

## 6. RV-3 — 데이터 계층 분할 (Step 3)

- [ ] **RV-3-1** 🤖 `menus.ts`/`pdfs.ts`/`repos.ts`/`books.ts` 생성 (잘라내기-이동, 값 무수정 — R5, JUnit 대문자 키 주석 동반 — C1) + `menuData.ts`를 barrel로 교체. **소비처 7곳 import 무변경.**
  - 판정: 4파일 존재 + menuData.ts에 re-export만 잔류 + `grep -rln "from.*menuData" my-study-app/src/ | wc -l` = 7 (변동 없음).
- [ ] **RV-3-2** 🤖 값 오염 검사: `git diff --word-diff -- my-study-app/src/data/` — 이동 외 변경 0.
  - 판정: URL·문자열 변경 없음 육안 확인.
- [ ] **RV-3-3** 🔐 검증: build 성공 + CSS diff 0.
- [ ] **RV-3-4** 🙋 **[D3]** 홈 통계 4종(주제/문서/도서/레포) 수치가 리팩토링 전과 동일한지 브라우저 확인.
- [ ] **RV-3-5** 🔐 커밋: `refactor: menuData를 도메인별 파일로 분할 (barrel 유지)`

## 7. RV-4 — 공용 유틸·훅 추출 (Step 4)

- [ ] **RV-4-1** 🤖 `utils/category.ts` 생성 (`docCount`, `resolveCategoryKey`) + 적용: HomePage:14, Sidebar:12, StackRatio:6, DownloadPage:16-18,25, Sidebar:22,39.
  - 판정: `grep -rn "countOf" my-study-app/src/` 0건.
- [ ] **RV-4-2** 🤖 `utils/download.ts` 생성 (`triggerDownload` — C8 분기 그대로) + DownloadPage/PdfPreview 경유 적용.
- [ ] **RV-4-3** 🤖 `hooks/usePagination.ts` + `hooks/useScrollTopOnMount.ts` 생성·적용 (BooksPage:6, GitHubPage:7, VibeCodingPage:7). **C9 리셋 effect(page=1→scrollTo→사이드바 닫기 순서)는 DownloadPage 잔류 (R6).**
  - 판정: 3개 페이지에서 인라인 scrollTo useEffect 소멸, 훅 사용으로 대체.
- [ ] **RV-4-4** 🔐 검증: build 성공 + CSS diff 0.
- [ ] **RV-4-5** 🙋 **[D3]** `/download/java` 2페이지 이동 / 카테고리 전환 시 page 리셋 / 다운로드 버튼 / `/download/exception` "준비 중" (C14) 브라우저 확인.
- [ ] **RV-4-6** 🔐 커밋: `refactor: 공용 유틸·훅 추출 (중복 제거)`

## 8. RV-5 — 컴포넌트 추출 (Step 5 · JSX 1:1, DOM 불변)

- [ ] **RV-5-1** 🤖 `components/CategoryRow.tsx` 추출 — HomePage.renderRow의 `.cat-row` 마크업 그대로, 사용처 2곳(검색 결과·그룹 목록) 교체.
- [ ] **RV-5-2** 🤖 Navbar `NAV_LINKS` 상수화 (데스크탑/모바일 중복 URL 통합, 마크업 불변).
- [ ] **RV-5-3** 🤖 (선택) `utils/searchIndex.ts`(CommandPalette.buildIndex), `hooks/useCategorySearch.ts` — HomePage 두께 보고 진행 중 판단, 생략 가능.
- [ ] **RV-5-4** 🔐 검증: build 성공 + CSS diff 0.
- [ ] **RV-5-5** 🙋 **[D3]** 홈 검색 3케이스("스프링"/"zzz"/빈 입력) + ⌘K·`/`·Navbar 버튼·↑↓↵ 전 시나리오 (C10) 브라우저 확인.
- [ ] **RV-5-6** 🔐 커밋: `refactor: CategoryRow 추출 및 페이지 슬림화`

## 9. RV-6 — 카테고리 메타 통합 (Step 6 · 게이트 통과 시에만)

- [ ] **RV-6-0** 🙋 **[D4] go/no-go 게이트** — 조건: ① RV-1~5 전 판정 통과 ② §10.1 수동 체크리스트 **1차(게이트용)** 수행·통과(🙋 D3 방식) ③ CSS diff 0 유지. **사용자가 진행/생략 결정.** 생략 시 RV-7로 건너뛰고 완료로 간주.
  - 1차 체크리스트 통과 기록: 통과 [ ] · 수행일: ___________
  - 결정 기록: 진행 [ ] / 생략 [ ] · 사유: ___________
- [ ] **RV-6-1** 🤖 `data/categories.ts` 생성 — 15키 레코드, `'JUnit'` 대문자 원형(C1), **배열 순서 = 기존 MENUS 순서 (R14)**.
- [ ] **RV-6-2** 🤖 파생 전환 — `MENUS`/`BADGE`/`DESC`/`STACK`을 CATEGORIES에서 도출 (소비처 API 무변경). `GROUP_ORDER`·`tintClass`·`badgeLabel`·`DOWNLOAD_PAGE_SIZE`·폴백 체인(C6/C7 — 통일 금지) 유지.
- [ ] **RV-6-3** 🤖 대조 검수 — 직전 커밋 값 vs 신규 파생 값, 15키 × 5속성 1:1 비교 (kafka `#6B7280`, linux `#C99700` 등 의도값 포함).
  - 판정: 불일치 0건 + MENUS 배열 순서 동일.
- [ ] **RV-6-4** 🔐 검증: build 성공 + CSS diff 0.
- [ ] **RV-6-5** 🙋 **[D3]** 홈 배지 문자·색 / 스택 비율 바 색·로고 / 사이드바 배지 / `exception` 모노그램 폴백 — RV-0-7 스크린샷과 대조.
- [ ] **RV-6-6** 🔐 커밋: `refactor: 카테고리 메타 categories.ts로 통합`

## 10. RV-7 — 마무리

### 10.1 RV-7-1 수동 체크리스트 (🙋 [D3] — 실행 계획서 §9.1 전문)

> **수행 횟수 (원 계획서 §7.2):** Step 6 **진행** 시 총 2회 — RV-6-0 게이트에서 1차(기록은 RV-6-0에), 리팩토링 완료 후 아래 체크박스로 **최종 2차**. Step 6 **생략** 시 아래 1회만.

- [ ] 홈: 히어로 통계 4종 / 검색 2케이스 / 바로가기 4카드 / 그룹 6종 순서 / 좌우 레일 sticky
- [ ] 레일 위젯: 프로필 카드 / 스택 비율 바 / 시계 / 달력 오늘 표시
- [ ] 다운로드: `/download/java` 2페이지 / `/download/spring` 1페이지 / `/download/junit` 소문자 (C1) / `/download/exception` 준비 중 / 브레드크럼
- [ ] PDF: 미리보기(jsDelivr — C3) / 새 탭 / 다운로드 / ESC / 스크롤 잠금·복원 (C11)
- [ ] 팔레트: ⌘K / `/` / Navbar 버튼 / ↑↓↵ / 결과 네비게이션 (C10)
- [ ] 책·GitHub·Vibe: 커버 폴백 (C13) / 외부 링크 새 탭 / 진입 시 스크롤 최상단
- [ ] 테마: 토글 / 새로고침 유지 / OS 기본값 (C4)
- [ ] 반응형: 1240px↓ 레일 이동 / 사이드바 오버레이 / 햄버거
- [ ] 404: 임의 경로

### 10.2 이후 단계

- [ ] **RV-7-2** 🙋 최종 시각 검증 — RV-0-7 스크린샷과 육안 대조 (TSX 이동 실수 검출용).
- [ ] **RV-7-3** 🙋 **[D5] npm audit fix 승인** → 🔐 `npm audit fix && npm run build` + 스모크 → 🔐 커밋 `chore: npm audit fix (vite 등 취약점 해소)` (lock 포함 — R13).
  - ⚠️ vite 버전 상승 시 **기존 바이트 기준선 무효** — 이후 검증은 build+스모크로 전환.
- [ ] **RV-7-4** 🙋 **[D6] main 병합 — 반드시 별도 명시 승인.** 승인 후 🔐 `git checkout main && git merge refactor/my-study-app-structure && git push`.
  - ⚠️ **push 즉시 GitHub Actions → Docker Hub `latest` 자동 배포 (R15).** §10.1 전 항목 통과 전 병합 금지.

---

## 11. 완료 기준

- [ ] RV-0 ~ RV-5 전 항목 체크 (필수)
- [ ] RV-6 진행 또는 게이트에서 "생략" 결정 기록 (둘 중 하나)
- [ ] RV-7-1 ~ 7-2 통과
- [ ] RV-7-3 수행 또는 후속 백로그 이관 기록
- [ ] RV-7-4는 사용자 승인 시에만 — 미병합 상태로도 리팩토링 자체는 완료
