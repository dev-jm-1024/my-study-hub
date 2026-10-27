# Ch6 자료실(데스크톱) — 착수 인수인계

- **결과:** Ch6 완료(2026-10-19) — 진행 기록은 로드맵 부록 B Ch6 줄
- **작성:** 2026-10-19 · 리드 세션이 외장하드(`/Volumes/dev`) 분리 때문에 착수 단계에서 멈춤
- **상태:** 코드 변경 **0**, 팀원 **0명**(띄우지 않음). 로드맵 체크박스 그대로(`RD-6-1`부터)
- **다음 리드가 할 일:** 이 문서의 §1 결정은 **다시 묻지 않는다**. §2 리드 결정·§4 브리프 초안을 그대로 쓰거나 다듬어 팀을 띄운다.

---

## 0. 재개 방법

1. 외장하드 연결 → IntelliJ에서 프로젝트 열기 → 터미널:
   ```bash
   cd /Volumes/dev/study/pdf-center
   ./scripts/redesign-lead.sh 6
   ```
2. 리드는 플레이북 §0 상태 판별 후 이 문서를 읽고 **§1 질문을 건너뛰고** 바로 §2 팀 구성으로 간다.

## 0-1. 외장하드 분리 절차 (이번에 한 것)

1. Claude Code 세션 종료 — `/exit` (작업 디렉터리가 `/Volumes/dev`라 열려 있으면 꺼내기가 막힌다)
2. IntelliJ: 이 프로젝트 창 닫기(File → Close Project). 터미널 탭이 `/Volumes/dev` 안에 있으면 함께 닫힌다
3. `npm run dev` 같은 개발 서버가 떠 있으면 끄기 (이번 세션에서는 띄우지 않음)
4. 아직 붙잡고 있는 프로그램 확인 → 나오는 게 있으면 종료:
   ```bash
   lsof -n 2>/dev/null | command grep -F '/Volumes/dev' | awk '{print $1, $2}' | sort -u
   ```
5. Finder 사이드바에서 꺼내기(⏏) 또는 `diskutil eject /Volumes/dev`
   - "사용 중" 오류가 나면 4번을 다시 확인한다. 미커밋 변경(권한 193건 등)은 디스크에 그대로 남고, 정상적으로 꺼내면 잃는 것은 없다

---

## 1. 사용자 결정 (2026-10-19, 확정)

| 사안 | 결정 |
|---|---|
| 자료실 주제 배지 (Ch5에서 홈은 배지 제거) | **목업대로 유지** — 사이드바 행 S(24px, `--icon-s`) + 헤더 L(48px, `--icon-l`). 색은 Ch5처럼 `topicStyle(key)` → `--topic`으로 통일(`tintClass`/`.t-*` 쓰지 않음), 글자 흰색(`--on-accent`), 색 없는 주제는 `var(--topic, var(--glyph-3))` 폴백 |
| PDF 미리보기 시트 폭 | **목업대로 최대 760px** (지금 900px·90vh). 높이는 화면에서 위아래 여백만 뺀 만큼 |

## 2. 리드 결정 (초안 — 새 리드가 그대로 써도 됨)

**헤더·본문**
- h1 = 주제 이름만(`Java`, 지금은 "Java 자료실"), 위에 그룹 eyebrow(`프로그래밍`), 오른쪽에 `25` 큰 숫자(`--fs-t2`) + "개 문서". `.dl-count`는 숫자 + "개 문서" 전체를 감싼다.
- 소개 문단 = `DESC[key]`. 목업의 Java 전용 소개 문장("가장 많이 쌓인 주제입니다…")은 데이터가 없으므로 넣지 않는다. 필요하면 나중에 `INTRO` 데이터를 추가한다(사용자 보고 거리).
- 공지 = `--surface` 카드(`--r-group`), 파란 원(`--accent-fill`) 정보 아이콘, "공지" 라벨, 본문, 링크 + ↗.
- 화면 전환 짝 유지: `.dl-head-badge`·`.dl-title`·`.dl-count`가 페이지에 **각각 하나씩** 있어야 한다(view-transition.css `page`).

**문서 행**
- 번호 칸(32px, `--fill`, `--mono`): 제목 앞 번호를 떼어 칸에 넣는다. 정규식 `^(\d+(?:[.-]\d+)*)\.?\s+(.+)$` — `1. 스프링부트 시작`→`1`/`스프링부트 시작`, `1-1. …`→`1-1`, `1.1 웹 개발…`→`1.1`, `0. Introduction…`→`0`. 번호가 없으면 소분류 안 순번(i+1). `MongoDB 필기 - 2.시작하기`·`$ cat …`·`KotlinEssentials.kt`는 번호 없음으로 처리.
- 오른쪽: "미리보기"(눈 아이콘 + 글자, `--accent`) + "받기" 알약(32px 알약, 터치 44px, `aria-label="PDF 받기: 제목"`, 동작은 기존 `triggerDownload` 그대로).
- `pdfUrl`이 빈 문서는 버튼 대신 "준비 중" 작은 알약. 사이드바 수 자리도 `isPreparingTopic(key)`면 "준비 중"(목업 `exception`).
- 행 모양: `--surface` 인셋 그룹(`--r-group`), 행 64px(`--row-h`), 구분선은 번호 칸 오른쪽부터(첫 행 없음).

**세그먼트·페이징** (계획서 §4.3)
- 세그먼트는 이름 있는 소분류 ≥2일 때만: "전체 25" + 소분류별(이름 + 수). `role="group" aria-label="소분류 필터"`, 버튼 `aria-pressed`, 넘치면 가로 스크롤(스크롤바 숨김). 선택 = `--surface` 바탕 + 얕은 그림자, 묶음 바탕 `--fill`.
- 페이저는 문서 > N(`DOWNLOAD_PAGE_SIZE`=10)일 때만: 왼쪽 "11–20 / 25개"(tabular-nums), 오른쪽 ‹ 1 2 3 ›(원 32px, 버튼 44px, 현재 = `--label` 바탕 + `--surface` 글자, 끝에서 화살표 `--glyph-3` + disabled), 각 번호 `aria-label="N페이지"`, 현재 `aria-current="page"`.
- 페이지 이동 시 창 맨 위가 아니라 **목록 맨 위**로 부드럽게(`scroll-margin-top: calc(var(--bar-h) + var(--sp-3))`), reduced-motion이면 즉시.
- 주제를 바꾸거나 소분류를 바꾸면 1페이지로. 페이지·탭 상태를 URL 쿼리에 넣지 않는다(현재 동작 유지).

**사이드바** (계획서 §4.4 데스크톱)
- "홈으로" 링크 제거(브레드크럼에 홈이 있음).
- 맨 위 프로필 줄: `/profile.svg` 40px(모서리 10px) + "이재민의 자료실" + "N개 주제 · M개 문서"(데이터로 계산).
- 흰 검색창 "주제 검색": 이름·`DESC`·그룹·`ALIASES`로 거른다. `HomePage.tsx:21-29`와 같은 규칙을 `src/utils/topicSearch.ts`(신규)로 뽑고, 끝나면 리드가 HomePage를 그 함수로 바꾼다(2~3줄). 결과 0건이면 빈 그룹은 숨기고 한 줄 안내.
- 행 = 지금처럼 `<Link>` + `useTransitionNavigate`(라우트 이동), 선택 행 `aria-current="page"`, `--accent-fill` 채움 + `--on-accent` 글자·숫자, 굵게.
- 클래스 `.sidebar`·`.sidebar--open`·`.sidebar-backdrop`과 `isOpen`/`onClose` prop은 **유지** — `responsive.css` ≤1024 서랍과 `view-transition.css`의 `side-nav`가 쓴다(서랍 개편은 Ch7).

**미리보기 시트**
- 760px, `--r-tile`, 덮개 `--scrim-modal` + 블러, z `--z-sheet`. 머리: 번호 칸 + "Java · Modern Java"(작게) + 제목(`--fs-t3`) + 닫기(44px 원, `--fill`). 몸통: 기존 iframe(`toEmbeddable` 유지). 발: 설명 + "새 탭에서 열기"(회색 알약) + "다운로드"(파란 알약). 기존 힌트 문구는 발에 작게 두고 "'새 탭에서 열기'로 열어 주세요"로 고친다.
- `role="dialog" aria-modal aria-labelledby`, Esc·바깥 클릭 닫기, 본문 스크롤 잠금 유지. `.pdfp-panel`(전환 이름 `pdf-sheet`)과 sheet-open/close 연출 유지.
- props가 늘어난다(번호·위치·설명) → RD-6-3이 새 인터페이스를 최종 보고에 적고, 리드가 RD-6-4에 넘긴다.

**레이아웃**
- `.download-layout` = 최대 `--container-wide`(1180) + `--gutter`, flex-wrap, 간격 `--sp-7`. 사이드바 `flex: 1 1 300px; max-width: var(--sidebar-w)`, sticky `top: calc(var(--bar-h) + var(--sp-3))`, 패널 안 스크롤. 본문 `flex: 999 1 560px; max-width: var(--content-max)`(760).
- `--sidebar-width` → `--sidebar-w`.

---

## 3. 조사 결과 (이미 확인한 사실)

- **데이터:** java 25(Modern Java 11·컬렉션 3·JVM 3·GC 4·가상 스레드 4) → '전체' 10/10/5, 2페이지에 컬렉션·JVM·GC가 걸쳐 "앞 페이지에서 이어짐". spring 21(Basic 6·HTTP Client 3·Filter/Interceptor 6·AOP 2·Cache 3·Scheduler 1). kotlin 2(소분류 없음 → 탭·페이저 없음). jsp 13(소분류 없음, 번호 `1.1`식 + 끝 2개는 번호 없음). exception 1(`pdfUrl` 빈 문자열 → 준비 중). 데이터는 전부 소분류가 있거나 전부 없거나 — 섞인 주제는 없다.
- **목업 이미지:** 사이드바 프로필 `_blob/af18…` = `/profile.svg`(Main.dc.html alt "이재민 프로필"), 상단 로고 `_blob/ed96…` = `/logo.png`.
- **공유 클래스 위험:** `GitHubPage.tsx`·`VibeCodingPage.tsx`가 `doc-list.css`의 `.dl-head`·`.dl-head-badge`·`.dl-eyebrow`·`.dl-title`·`.dl-count`·`.dl-list`·`.dl-row`·`.dl-badge`·`.dl-main`·`.dl-row-title`·`.dl-row-desc`·`.dl-lang`·`.dl-open`을 같이 쓴다(개편은 Ch8). → 자료실 문서 행은 **새 클래스 이름**(예: `.doc-*`)으로 만들고, 옛 규칙은 사용처 0건일 때만 지운다. 헤더(`.dl-head` 계열)는 새 모양이 GitHub·Vibe에도 먹어도 되지만 깨지지 않는지 확인한다.
- **`responsive.css`:** ≤1024 `.sidebar` 서랍 규칙이 `--sidebar-width`·`--bg-root`·`--border-glass`를 쓴다(12행). 가로 모드 블록도 `.sidebar`. `.main-content` 패딩(≤1024·768·380)과 `.dl-head-badge` 크기(≤380)도 여기 있다.
- **`usePagination`:** `DownloadPage`만 쓴다 → 모양을 자유롭게 바꿔도 된다.
- **`download-page.css`:** 옛 정적 사이트 규칙(`.card-grid`·`.page-header`·`.page-title`·`.document-count`·`.card-*`·`.download-logo(-text)`·`.download-btn`·`.hero-link`)이 남아 있다 — 사용처 0건 확인 후 삭제 후보(Ch2 감사에서 `.download-logo-text` 사용처 0).
- **`view-transition.css`:** `::view-transition-image-pair(pdf-sheet)`가 `--border-radius-lg`와 `@media (max-width: 560px)`를 쓴다 → 시트 모서리 `--r-tile`로 맞출 때 같이 손볼 곳.
- **재사용할 것:** `isPreparingTopic`(utils/home.ts), `topicStyle`·`badgeLabel`·`DESC`·`ALIASES`·`GROUP_ORDER`(data/topics.ts), `docCount`·`resolveCategoryKey`·`matchesKey`(utils/category.ts), `triggerDownload`, `withViewTransition`.

## 4. 팀 구성·소유 파일 (초안)

동시 4명: `redesign-architect` · `ui-builder` · `ui-builder-2` · `chore-runner`. reviewer는 구현이 끝난 뒤.
작업 목록 도구가 없으니 **브리프 전체를 스폰 프롬프트에** 넣고, "리드 = `team-lead`"를 알린다(메모리 agent-team-no-task-list).

| 묶음 | ID | 담당 | 소유 파일 | 핵심 |
|---|---|---|---|---|
| A | RD-6-1 | redesign-architect | `src/utils/paginateSections.ts`(신규), `src/hooks/usePagination.ts` | `sectionTabs(items)` → `[{label,count}]`·탭 표시 여부, `paginateSections(items, sel, page, size)` → `{ groups:[{name,count,cont,docs:[{pdf,num,title,index}]}], pageCount, page(보정), range:{start,end,total} }`, `splitDocNumber(title, i)`. `usePagination`은 주제·소분류 바뀌면 1페이지, 목록 맨 위 스크롤(ref), reduced-motion. API를 **최종 보고에** 적게 한다(나중 스폰한 RD-6-4가 못 받으므로 리드가 넘김) |
| A | RD-6-2 | ui-builder | `src/components/Sidebar.tsx`, `src/styles/download-page.css`, `src/utils/topicSearch.ts`(신규), `src/styles/responsive.css`의 `.sidebar` 두 블록(≤1024 `.sidebar` 규칙·가로 모드) | §2 사이드바 + 레이아웃 셸(`.download-layout`·`.main-content`). ≤1024 서랍이 계속 열리고 닫히게만 최소 조정(Ch7에서 다시 씀). 옛 규칙 사용처 0건이면 삭제 |
| A | RD-6-3 | ui-builder-2 | `src/components/PdfPreview.tsx`, `src/styles/pdf-preview.css`, `src/styles/view-transition.css`의 `pdf-sheet` 모서리 줄 | §2 미리보기 시트. 새 props를 최종 보고에 |
| B | RD-6-4 | ui-builder | `src/pages/DownloadPage.tsx`, `src/styles/doc-list.css`, `src/styles/responsive.css`의 `.main-content`·`.dl-head-badge` 줄 | 헤더·공지·세그먼트·문서 행·페이저, RD-6-1·6-3 API 연결. GitHub·Vibe 회귀 확인 |
| — | (연결) | 리드 | `src/pages/HomePage.tsx` 검색 필터 2~3줄 | `topicSearch`로 교체 |
| C | RD-6-5 | chore-runner | 로드맵 부록 A | 빌드·감사(리터럴 색·옛 변수·@media) |
| C | RD-6-6 | redesign-reviewer | — | 검수 |
| D | RD-6-7 | 사용자 | — | 🙋 D2 — Java·Spring·Kotlin, 라이트/다크 |

**공통 '하지 말 것'(모든 브리프):** 소유 밖 파일 수정, 새 npm 의존성, CSS 리터럴(주제 색 제외), git 쓰기, `.dl-title`/`.dl-count`/`.dl-head-badge`/`.pdfp-panel` 짝 깨기, `.sidebar` 클래스 이름 변경, ≤1024 서랍 개편(Ch7).

**완료 판정(로드맵 그대로):** Java '전체' 3페이지(10/10/5) + 2페이지 "앞 페이지에서 이어짐" / Modern Java 탭 2페이지 / Kotlin 탭·페이저 없음 / 다른 과목 클릭 → 파란 선택 이동 + 1페이지 / 미리보기 열기·닫기 전환 / `npm run build` 통과.
