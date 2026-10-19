# my-study-app Apple 스타일 리디자인 — 실행 계획서

- **작성일:** 2026-10-18
- **진행 추적:** [로드맵](./261018_my_study_app_redesign_roadmap.md) (챕터·작업표·현재 위치)
- **디자인 정본:** 캔버스 "JM Hub 리디자인 시안" — https://claude.ai/artifact/KRGAtS74ioPBUPmT6UZnsL (비공개, 소유자만 열람)
  · 저장소 사본: [`doc/261018_redesign_mockups/`](./261018_redesign_mockups/)
- **관련 문서:** [인수인계](./261011_my_study_app_handover.md) · [연출 작업 기록](./261012_my_study_app_motion_design_log.md) · [디자인 이슈 목록](./260803_issue.md)
- **목적:** 시안을 실제 앱으로 옮기는 규칙·명세와, 그 일을 나눠 맡을 에이전트 구성을 정한다. 무엇을 어떤 순서로 하는지는 로드맵이 맡는다.

---

## 0. 요약

| 항목 | 내용 |
|---|---|
| 방향 | 웜 크림·브라운 → 뉴트럴 그레이(`#F5F5F7`) + 흰 면 + 애플 블루(`#0071E3`). SF 글꼴(Pretendard 폴백), 큰 제목·넓은 여백, 반투명 블러 바 |
| 이번에 만든 것 | 디자인 토큰 `src/styles/tokens.css`, 호환 레이어 `src/styles/tokens.legacy.css`, 상수 `src/constants/*`, 에이전트 6종 `.claude/agents/*`, 리드 플레이북 `.claude/skills/redesign/`, 본 계획서·로드맵, 목업 사본 |
| 화면 변화 | **아직 0** — 토큰·상수 파일은 만들기만 했고 import하지 않았다. 연결은 로드맵 Ch0(RD-0-3·0-4)부터 |
| 진행 단위 | 챕터 10개(Ch0~Ch9). 챕터 = 1커밋, 끝마다 검수 + 사용자 화면 확인 |
| 에이전트 | **에이전트 팀(실험 기능)** — 리드 = IntelliJ 터미널의 Opus 세션, 팀원 = `.claude/agents` 정의로 스폰(설계/검수 Opus · 구현 Sonnet · 잡무 Haiku), 공유 작업 목록 + 팀원 간 메시지. Fable 미사용 |
| 검증 | `tsc --noEmit` 통과 확인 (2026-10-18). `npm run build`는 연결 후 Ch0에서 |

## 1. 디자인 정본 — 어느 보드가 어느 화면인가

| 사본 파일 | 캔버스 보드 | 대상 화면 | 로드맵 |
|---|---|---|---|
| `Main.dc.html` | 홈 — 데스크톱 (라이트) | `/` 전체, 드롭다운 동작 | Ch2~Ch5 |
| `Menu.dc.html` | 헤더 드롭다운 — 열린 상태 | 바·패널·바깥 블러 | Ch2 |
| `NavPanel.dc.html` | 드롭다운 메뉴 콘텐츠 4종 | 자료실·Books·GitHub·Vibe 메뉴 열 구성 | Ch2 |
| `Archive.dc.html` | 자료실 — 데스크톱 | `/download/:category` | Ch6 |
| `ArchiveMobile.dc.html` | 자료실 — 모바일 (사이드 메뉴) | 자료실 ≤734px | Ch7 |
| `Mobile.dc.html` | 홈 — 모바일 (다크) | 홈 ≤734px, 다크 값 | Ch1·Ch7 |
| `Tokens.dc.html` | 디자인 토큰 & 컴포넌트 | 토큰 표·컴포넌트 견본·레이아웃 규칙 | 전 챕터 |

**목업 읽는 법 (에이전트 공통)**
- 인라인 `style="..."` + `var(--토큰)` 으로 되어 있다. **구조·순서·토큰 단계를 옮기고**, 인라인 스타일을 복사하지 않는다(클래스 + CSS 파일로).
- `{{hole}}`, `<sc-for>`, `<sc-if>`, `<dc-import>`, 하단 `<script type="text/x-dc">`는 목업 도구 문법이다. React map/조건부 렌더/컴포넌트/훅으로 바꾼다.
- `/_blob/...` 이미지는 목업 전용 업로드다. 실제 데이터 주소(`data/books.ts`의 `coverUrl`, `public/profile.svg`)를 쓴다.
- 목업의 하드코딩 데이터(문서 수 25·21, 최근 문서 6건 등)는 **견본**이다. 실제 화면은 `data/*`와 선택자로 계산한다.
- 목업 토큰 이름과 다른 것 하나: 목업 `--hl`/`--hl-soft` → 앱 `--new`/`--new-soft` (home-intro.css의 지역 변수 `--hl`과 충돌 회피).

## 2. 토큰·상수 구조

### 2.1 파일 지도

| 파일 | 역할 | 상태 |
|---|---|---|
| `src/styles/tokens.css` | 디자인 토큰 정본. `:root`(라이트) · `@media (max-width: 734px)`(모바일 스케일) · `body.dark`(다크) | 생성 — 미연결 |
| `src/styles/tokens.legacy.css` | 옛 변수 이름(variables.css) → 새 토큰 연결. 전환 기간 전용, Ch9에서 삭제 | 생성 — 미연결 |
| `src/constants/ui.ts` | 동작 숫자: 경계, 페이지 크기, 대표 타일 수, 셸프 타이밍, 드롭다운 지연, NEW 기간 | 생성 |
| `src/constants/links.ts` | 외부 링크 단일 출처 (`LINKS`, `SOCIAL_LINKS`) | 생성 |
| `src/constants/navigation.ts` | 상단 메뉴 순서(`NAV_ITEMS`)와 드롭다운 **축약 규칙** (`NAV_ARCHIVE_RULE` 등) | 생성 |
| `src/constants/index.ts` | 배럴 | 생성 |

**import 순서 (Ch0·Ch1에서 연결)** — `src/index.css`
```css
@import '../../src/main/resources/static/css/common/reset.css';
@import '../../src/main/resources/static/css/common/variables.css';
@import './styles/tokens.css';          /* RD-0-3 */
@import './styles/tokens.legacy.css';   /* RD-1-1 — 이 줄부터 전 페이지 재스킨 */
/* … 나머지 기존 순서 그대로 … */
```

### 2.2 토큰 요약 (전체는 `tokens.css`)

| 묶음 | 토큰 | 비고 |
|---|---|---|
| 면 | `--bg` `--surface` `--fill` `--sidebar` `--sep` | 라이트 F5F5F7 / FFF / E8E8ED / E8E8ED / D2D2D7 |
| 글자 | `--label` `--label-2` (+ 아이콘 전용 `--glyph-3`) | 글자 색은 둘뿐 |
| 강조 | `--accent`(링크 0066CC) `--accent-fill`(채움·선택 0071E3) `--on-accent` `--new` `--new-soft` | `--new`는 '새로 올라온 것'에만 |
| 반전 타일 | `--inv-surface` `--inv-fill` `--inv-label` `--inv-label-2` `--inv-accent` | 라이트의 어두운 대표 타일. 다크에선 일반 면과 같음 |
| 머티리얼 | `--bar-bg` `--bar-bg-open` `--scrim` `--scrim-modal` `--blur-bar` `--blur-scrim` `--blur-edge` | |
| 그림자 | `--shadow-float/thumb/sheet/cover` `--ring-card` | 거의 쓰지 않는다 |
| 타입 9단계 | `--fs-{display,t1,t2,t3,lead,body,callout,foot,cap}` + 짝 `--lh-*` `--ls-*` | 데스크톱 80/48/32/21/21/17/15/13/12, 모바일 40/32/24/19/17/… |
| 간격 9단계 | `--sp-1`~`--sp-9` = 4·8·12·16·24·32·48·64·96 | |
| 레이아웃 | `--gutter` `--section` `--tile-pad` `--card-pad` `--gap` `--container`(1080) `--container-wide`(1180) `--sidebar-w`(320) `--content-max`(760) `--bar-h`(52) `--row-h`(64) `--touch`(44) | 모바일에서 gutter 20·section 64·tile-pad 24·gap 12 |
| 모서리 | `--r-tile`(28/24) `--r-card`(20) `--r-group`(16) `--r-input`(12) `--r-s`(8) `--r-pill` | |
| 아이콘 | `--icon-s`(24) `--icon-m`(32) `--icon-l`(48) | 모서리 = 크기/4 |
| 모션 | `--ease-out` `--ease-panel` `--ease-drawer` `--dur-fast/base/panel` | |
| 쌓임 | `--z-scrim`(90) `--z-header`(100) `--z-drawer`(200) `--z-sheet`(300) | |

### 2.3 옛 값 → 새 토큰 매핑 (style-migrator 기준표)

| 옛 것 | 새 토큰 | 메모 |
|---|---|---|
| `--bg-root`, 크림 `#F7F3EA` | `--bg` | `--bg-pattern`은 none |
| `--bg-surface`, `#FAF8F4` | `--surface` | |
| `--bg-surface-hover`, `--accent-soft`, `--panel-cool`, `#EFE8D9`/`#EDE4D3` | `--fill` | |
| `--border-glass(-subtle)`, `--border-color`, `#E7DECE` | `--sep` | |
| `--text-primary`, `#2B2522` | `--label` | |
| `--text-secondary`, `--text-muted`, `#8E7A70`/`#B89F8A` | `--label-2` | muted도 글자라 `--glyph-3` 금지 |
| `--cta-bg` | `--accent-fill` | 글자는 `--on-accent` |
| `--accent-ink`, `--primary`, `--color-accent` | `--accent` | |
| `--shadow-glass*` | 대부분 제거, 떠 있는 요소만 `--shadow-float` | |
| `--font-family` / `--font-mono` | `--font` / `--mono` | |
| `--border-radius-sm/md/lg/xl/full` | `--r-input/group/card/tile/pill` | |
| `--spacing-xs/sm/md/lg/xl/2xl/3xl` | `--sp-1/2/4/5/6/7/8` | 수동 매핑(호환 레이어에 없음) |
| `--font-size-sm/base/lg/xl/2xl/3xl` | `--fs-callout/body/body/t3/t3/t2` | 가장 가까운 단계, 수동 |
| `--header-height`(64) | `--bar-h`(52) | Ch2에서만 바꾼다 |
| `--sidebar-width`(272) | `--sidebar-w`(320) | Ch6에서만 바꾼다 |
| `.t-<key>` 의 `--t`(주제 색조) | 유지 | 주제 색은 데이터(`stacks.ts`) |

### 2.4 상수와 선택자

**상수 (`src/constants`)** — 규칙만 두고 목록은 두지 않는다. 과목·책이 늘어도 이 폴더는 그대로다.

| 상수 | 값 | 쓰는 곳 |
|---|---|---|
| `BREAKPOINT` | mobile 734 · tablet 1068 | 훅의 matchMedia (CSS와 같은 값) |
| `DOWNLOAD_PAGE_SIZE` | 10 | 자료실 페이징 (`data/topics.ts`의 같은 이름은 RD-0-4에서 re-export로 교체) |
| `FEATURED_TOPIC_COUNT` | 2 | 홈 대표 타일 |
| `DOC_SHARE_TOP_N` | 6 | 문서 비중 막대 |
| `NEW_BADGE_DAYS` | 21 | NEW 표시 기간 (addedAt 기준) |
| `LATEST_SHELF` | count 6 · 4000ms · hold 6000ms · settle 140ms · copies 3 | 최근 문서 셸프 |
| `NAV_MENU_TIMING` | open 120ms · close 200ms | 드롭다운 |
| `NAV_ARCHIVE_RULE` | 큰 글씨 = 문서 수 상위 3 · 작은 목록 = 문서 2개 이상(NEW 예외) · 열 2개(데이터·인프라 / 설계·기타) · 열당 5 · 나머지 '그 외 N개 주제' | 자료실 메뉴 |
| `NAV_BOOKS_RULE` | 큰 글씨 = 책 많은 태그 3 · 표지 = 최근 추가 4권 | Books 메뉴 |
| `NAV_GITHUB` · `NAV_VIBE_RULE` | 고정 링크 · Swift 계열이면 'macOS 앱' | GitHub·Vibe 메뉴 |

**선택자 (만들 것 — `src/utils/`, 순수 함수)**

| 함수 | 결과 | 로드맵 |
|---|---|---|
| `buildNavMenus()` | `Record<NavMenuKey, NavColumn[]>` | RD-2-1 |
| `topTopics(n)` | 문서 수 상위 n개 `{ key, name, group, count, sections[] }` | RD-4-3 |
| `docShare(topN)` | `{ total, parts: [{ key, name, count, color }], rest }` | RD-4-3 |
| `latestDocs(n)` | addedAt 내림차순 n건 `{ topicKey, section?, title, desc, addedAt }` | RD-4-3 |
| `isNewTopic(key, today)` | 첫 문서 addedAt이 `NEW_BADGE_DAYS` 이내 | RD-4-3 |
| `uploadDaysInMonth(y, m)` | 그 달에 문서를 올린 날짜 배열 | RD-5-3 |
| `paginateSections(sections, sel, page, size)` | `{ groups: [{ name, count, cont, docs }], pageCount, range }` | RD-6-1 |

## 3. 공통 규칙 (모든 에이전트)

1. **토큰만 쓴다.** CSS에 색·글자 크기·간격·모서리 리터럴 금지. 예외: 주제 색(`STACK[key].color`), `tokens.css` 자신.
2. **동작 숫자는 `src/constants`에서.** 없으면 만들지 말고 리드에게 보고(architect만 `constants/ui.ts`에 추가 가능).
3. **새 npm 의존성 금지.** 아이콘은 `lucide-react`, 브랜드 로고는 `simple-icons`(이미 설치).
4. **소유 파일만 수정.** 같은 묶음의 에이전트끼리 파일이 겹치지 않게 리드가 나눈다. 밖을 고쳐야 하면 보고한다.
5. **기존 연출 보존.** `view-transition.css`의 이름과 `useTransitionNavigate`의 `nameParts` 짝(`.cat-title→dl-title`, `.cat-count→dl-count`, 문서 행↔미리보기 시트)을 깨지 않는다. `.cat-badge→dl-badge` 짝은 Ch5에서 주제 행 배지를 빼며 없어졌다 — `dl-badge`는 도착 화면에서 페이드만 한다. 클래스 이름을 바꾸면 짝도 같은 작업에서 바꾼다.
6. **접근성 기본값.** 클릭 요소는 `<button>`/`<a>`, 아이콘 버튼 `aria-label`, 터치 44px, 포커스 링(`:focus-visible`), `prefers-reduced-motion`에서 움직임 끔, 회색 글자 4.5:1.
7. **빌드 통과 후 보고.** `cd my-study-app && npm run build`.
8. **검색은 `command grep`.** 이 환경의 `grep`은 ugrep 별칭이라 결과가 다르다.
9. **git은 리드만.** 하위 에이전트는 읽기(status/diff/log/show)만. 커밋 시 `git -c core.fileMode=false add <파일>`(권한 변경 193건 회피), `*.md`는 `git add -f`.

## 4. 동작 명세 (목업 `<script>`에서 옮긴 것 — architect 기준)

### 4.1 상단 드롭다운 (`useNavMenu`, Ch2)
| 상황 | 동작 |
|---|---|
| 닫힌 상태에서 메뉴 이름에 마우스 | 120ms 머물면 연다 (스치기만 하면 안 열림) |
| 열린 상태에서 다른 메뉴 이름에 마우스 | **즉시** 전환, 열 등장 애니메이션 다시 재생 |
| 로고·Velog·Blog·검색 아이콘에 마우스 | 닫는다 |
| 헤더(바+패널) 밖으로 마우스 | 200ms 뒤 닫는다 (그 사이 돌아오면 취소) |
| 바깥(블러 덮개) 클릭 / Esc / 라우트 이동 | 닫는다. Esc는 포커스를 연 버튼으로 돌려준다 |
| 메뉴 버튼 클릭(터치·키보드) | 열고 닫기 토글. `aria-expanded`, `aria-controls` |
| 열림 표시 | 바 배경 `--bar-bg-open`, 바 아래 선 숨김, 패널 `max-height` 0→콘텐츠 높이(`--dur-panel` `--ease-panel`), 열마다 40/90/140ms 지연 등장(`--ease-out`), 바깥 `--scrim` + `--blur-scrim` |
| ≤734px | 드롭다운 없음. 메뉴 이름은 링크, 햄버거 메뉴 사용(Ch7) |
| reduced-motion | 지연(120/200ms)은 그대로, 패널·열·덮개 애니메이션만 끈다 (2026-10-19 리드 결정 — 지연 0이면 바를 가로지르기만 해도 메뉴가 연달아 열리고, 머물러 연 직후 클릭이 늘 닫기가 된다) |

### 4.2 최근 문서 셸프 (`useInfiniteCarousel`, Ch4 · Ch5 D2에서 연속 흐름으로 개편)
- 목록을 `LATEST_SHELF.copies`(최소 3 — 한 벌이 화면보다 좁으면 훅이 늘린다)벌 깔고 시작 위치를 가운데 벌 첫 칸에 둔다. 위치가 가운데 벌 범위를 벗어나면 벌 하나(`setW`)만큼 **같은 프레임에서 순간 보정**해 끝이 없게 한다(생김새가 같아 안 보인다). 손 스크롤은 `settleMs` 동안 멈춘 뒤 보정.
- **연속 흐름**(10-19 사용자 요청): 한 칸씩 넘기지 않고 `speedPxPerSec`(32)로 멈추지 않고 흐른다. 움직이는 동안 rAF가 트랙을 `transform`으로 소수 px까지 밀고, 멈추면 민 양을 정수 `scrollLeft`로 옮겨 네이티브 스크롤과 잇는다. `scroll-snap`·`scroll-behavior: smooth` 없음.
- 멈춤·재개: 일시정지 · 마우스 올림 · 셸프 안 포커스는 `rampMs`(500) 동안 감속해 멈추고 같은 시간 동안 가속한다. 손가락 닿음 · 가로 휠은 그 자리에서 바로, 탭 숨김 · 셸프가 화면 밖(IntersectionObserver)이면 바로. 화살표·터치·포커스가 끝나면 `holdAfterInteractMs` 쉰 뒤 다시 흐른다. `prefers-reduced-motion`은 처음부터 일시정지(재생을 누르면 감속·가속 없이 흐름).
- 이전/다음: 시작선에 가장 가까운 카드의 앞/뒤 카드를 `glideMs`(500) 동안 시작선으로 미끄러뜨린다(흐르던 속도를 이어받는 곡선, 연타하면 한 칸씩 더).
- 셸프 안에 포커스가 있는 동안: 이음매 보정을 쉰다(브라우저가 포커스 카드를 보이게 스크롤한 자리를 지킨다), 점 = 포커스 카드.
- 일시정지 버튼(`aria-label` 재생/일시정지 전환), 점 표시(현재 칸 = 넓은 알약, `aria-hidden`), 복제 벌은 `aria-hidden` + 안의 링크 `tabIndex=-1`.
- 양쪽 가장자리: 배경색→투명 그라데이션 + `--blur-edge`를 마스크로 페이드. 폭 데스크톱 64px · 모바일 40px. 끝없이 이어지므로 항상 표시.

### 4.3 자료실 페이징 (`paginateSections`, Ch6)
- 고른 범위('전체' 또는 소분류 하나)의 문서를 순서대로 한 줄로 편 뒤 `DOWNLOAD_PAGE_SIZE`씩 자른다. 잘린 조각을 다시 소분류별로 묶는다.
- 한 소분류가 앞 페이지에서 이어지면 그 묶음에 `cont: true` → 제목 옆 "· 앞 페이지에서 이어짐".
- 소분류가 없는 주제(예: Kotlin)는 제목 없이 목록만. 탭(세그먼트)은 이름 있는 소분류가 2개 이상일 때만.
- 페이저는 문서가 N개를 넘을 때만. 표시: "11–20 / 25개" + ‹ 1 2 3 › (원 32px, 터치 44px, 원 사이 약 20px). 주제·소분류를 바꾸면 1페이지로.
- **현재 동작과 다름**: 지금은 소분류가 있으면 페이징하지 않는다(`DownloadPage`). 사용자 요청(10-18)으로 바뀐다.

### 4.4 자료실 사이드바 / 모바일 사이드 메뉴 (Ch6·Ch7)
- 데스크톱: 본문과 다른 색 패널(`--sidebar`, `--r-card`), 최대 `--sidebar-w`, `position: sticky; top: calc(var(--bar-h) + var(--sp-3))`, 패널 안 스크롤. 맨 위 프로필 줄("이재민의 자료실 · N개 주제 · M개 문서") + 흰 검색창 + 그룹별 행(아이콘 S, 15px, 44px). 선택된 과목 = `--accent-fill` 채움 + `--on-accent` 글자·숫자, 굵게.
- ≤1068px: 사이드바 숨김 → 본문 위 "주제 전환" 알약 버튼(사이드바 아이콘 + "그룹 › 과목"). 누르면 왼쪽에서 패널이 밀려 나온다(`--ease-drawer`, 0.32s), 뒤는 `--scrim-modal`. 닫기 = ✕·바깥·Esc·과목 선택. 열리면 포커스를 패널로, 닫히면 버튼으로. 본문 스크롤 잠금(`useDrawer`).

### 4.5 홈 데이터 규칙 (Ch4·Ch5)
- 대표 타일: `topTopics(FEATURED_TOPIC_COUNT)`. 1위는 반전 타일(`--inv-*`). 타일에 소분류 칩(있을 때), 문서 수(`--fs-t2`), "자료실 열기 ›".
- 문서 비중 타일: 두 칸 차지(그리드 `1 / -1`). 막대 = 상위 `DOC_SHARE_TOP_N` + "기타 N개 주제". 제목 없음(10-18 사용자 요청), 설명 문장 하나.
- 주제 그룹: 2열 그리드 + `align-items: stretch` + 카드 `flex: 1` → **같은 줄 그룹의 시작·끝선이 항상 같다**(항목 수와 무관).
- 달력: 날짜 칸 = 숫자(32px) + 그 아래 4px 점 자리(모든 칸에 자리 확보 → 줄 높이 고정). 점 = `uploadDaysInMonth`, 색 `--new`.
- NEW: `isNewTopic` — 히어로 알약·드롭다운에 쓴다.

### 4.6 데이터 추가 — `PdfItem.addedAt`
- 형식 `YYYY-MM-DD`(선택 필드).
- 근거는 git 이력: **경로 제한 없이** 저장소 전체에서 `git log --all --reverse --format='%h %ad' --date=short -S'<pdfUrl 파일명>'`의 첫 커밋(정적 사이트 data.js 시절 포함 — `pdfs.ts` 경로로 제한하면 분할 커밋 f464845 날짜만 나온다). URL이 바뀐 문서는 제목 계보로, PDF가 연결된 날 기준. 첫 채움(RD-4-1) 근거 표는 Ch4 커밋 메모 참고.
- 이후 문서 추가 절차(인수인계 §3.1)에 "addedAt 넣기" 한 줄을 더한다(Ch9 기록 문서에서).

## 5. 에이전트 구성

### 5.1 구조 — 에이전트 팀 (실험 기능)
```
IntelliJ 터미널: ./scripts/redesign-lead.sh <챕터>
  ▼
팀 리드 = 이 세션 (Opus)  ── .claude/skills/redesign/SKILL.md (플레이북)
  │  챕터 → 공유 작업 목록(묶음 = 의존 관계) → 팀원 스폰 → 진행 감독 → 검수 → 화면 확인 → 로드맵 갱신 → 커밋 제안 → 팀원 종료
  │
  │   ┌──────────── 공유 작업 목록 (~/.claude/tasks/<팀>) ────────────┐
  │   │  [RD-4-1] data  →  [RD-4-3] data  →  [RD-4-4] ui  →  [RD-4-7] chore  →  [RD-4-8] reviewer │
  │   └─────────────────────────────────────────────────────────────┘
  ├── data-wirer        (Sonnet) ──SendMessage──▶ ui-builder   (새 export 시그니처)
  ├── redesign-architect(Opus)   ──SendMessage──▶ ui-builder   (훅 API)
  ├── ui-builder(-2)    (Sonnet)
  ├── style-migrator    (Sonnet)
  ├── chore-runner      (Haiku)  ──SendMessage──▶ 실패 파일 담당 (빌드 에러 원문)
  └── redesign-reviewer (Opus)   ──SendMessage──▶ 담당 팀원     (FIX 항목)
```
- **켜는 법:** `.claude/settings.local.json`의 `env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS = "1"` + `teammateMode: "in-process"` (gitignore 대상, 2026-10-18 설정). 실행 스크립트도 같은 변수를 셸에 export한다.
- **표시:** in-process — 팀원이 리드 화면 아래 패널에 뜬다. IntelliJ 터미널에서 그대로 동작(화면 분할은 tmux/iTerm2 필요, 여기엔 tmux 없음).
  조작: ↑/↓ 팀원 선택 · Enter 그 팀원 대화 보기/메시지 보내기 · Esc 선택 해제(보는 중이면 그 팀원 중단) · `x` 팀원 종료 · Ctrl+T 작업 목록.
- **팀원 = 에이전트 정의:** "Spawn a teammate named `ui-builder` using the `ui-builder` agent type." → 정의의 `model`·`tools`·본문이 적용된다. 스폰 때 모델을 따로 말하지 않는다. 팀원은 `SendMessage`와 작업 목록 도구를 추가로 받는다.
- **챕터 1개 = 세션 1개 = 팀 1개.** 세션당 팀은 하나, 리드 고정, 중첩 팀 없음, `/resume`·`/rewind`로 팀원 복구 안 됨 → 챕터가 끝나면 팀원 종료 후 세션을 닫고 다음 챕터는 새로 연다.
- **동시 팀원 3~5명.** reviewer는 구현이 끝난 뒤에 띄운다. 팀은 단일 세션보다 토큰을 훨씬 많이 쓴다.
- **권한:** 팀원은 리드의 권한 모드로 시작하고, 팀원의 권한 프롬프트는 리드 화면에 뜬다. 자주 쓰는 읽기·빌드 명령 7개는 `settings.local.json`의 allow에 넣어 두었다(`npm run build`, `npx tsc *`, `git status/diff/log/show *`, `command grep *`). 커밋·푸시는 넣지 않았다.
- **폴백:** 팀 기능이 꺼져 있으면 같은 흐름을 일반 서브에이전트(Agent 도구)로 한다 — SKILL.md §9.
- 정의 파일: `.claude/agents/<이름>.md` — 각 파일에 "팀원으로 띄워졌을 때" 절(작업 목록 사용법·누구에게 직접 메시지를 보내는지)이 있다.

### 5.2 모델 배정 근거
| 모델 | 맡는 일 | 이유 |
|---|---|---|
| **Opus** | 리드, architect, reviewer | 틀리면 비용이 큰 곳 — 작업 분해·파일 소유 조정, 타이밍·상태가 얽힌 로직(무한 반복, hover-intent, 포커스 가두기), 챕터 통과 판정 |
| **Sonnet** | ui-builder, style-migrator, data-wirer | 명세가 분명한 코드 작성. 양이 가장 많은 일 |
| **Haiku** | chore-runner | 판단이 필요 없는 일 — 명령 실행·숫자 집계·체크박스·import 한 줄·사용처 0건 삭제 |
| Fable | 사용 안 함 | — |

### 5.3 한 챕터의 흐름
1. **착수** — 리드가 로드맵의 목표·작업표·🙋 결정 확인. 결정이 남았으면 **팀원을 띄우기 전에** 사용자에게 묻는다.
2. **작업 목록** — 작업표 한 줄 = 작업 하나, 묶음 = 의존 관계(B는 A 전부 완료 뒤 풀림), 설명 = 브리프(SKILL.md §3).
3. **팀 구성** — 첫 묶음 담당 + chore-runner(상주)를 먼저 띄우고, 다음 묶음 담당은 필요할 때 추가, 끝난 팀원은 종료.
4. **진행** — 팀원은 작업을 맡아 끝내고, 인터페이스는 팀원끼리 직접 넘긴다(SKILL.md §4 메시지 규칙). 리드는 판단 필요·막힘에만 답한다.
5. **검증** — chore-runner가 묶음마다 build + 감사. 실패는 담당 팀원에게 직접.
6. **검수** — 구현이 끝나면 reviewer를 띄운다. FIX는 담당에게 직접, 재검수 최대 2라운드.
7. **화면 확인** — 리뷰어가 고른 화면 3개 이내를 사용자가 확인(🙋 D2).
8. **마무리** — chore-runner가 로드맵 갱신, 리드가 커밋 제안(🔐), 팀원 전원 종료, 세션 닫기.

### 5.4 실행 방법
1. IntelliJ에서 터미널을 하나 연다(프로젝트 루트).
2. `./scripts/redesign-lead.sh` — 로드맵 "현재 위치"부터. 특정 챕터는 `./scripts/redesign-lead.sh 3`.
   (스크립트 = `claude --model opus --teammate-mode in-process "/redesign Ch<N>"`)
3. 리드가 🙋 결정을 묻고 → 팀원을 띄우고 → 진행 상황을 보고한다. 중간에 끼어들 땐 리드에게 말하거나, ↑/↓ + Enter로 특정 팀원에게 직접 메시지.
4. 챕터가 끝나면 리드 안내대로 세션을 닫고 다음 번호로 다시 연다.
5. 팀 기능을 끄려면 `settings.local.json`의 값을 `"0"`으로(새 세션 없이 반영).

## 6. 위험과 대응

| # | 위험 | 대응 |
|---|---|---|
| R1 | 호환 레이어 연결(RD-1-1) 순간 전 페이지 색이 바뀌어 다크·대비 문제가 한꺼번에 드러남 | Ch1에 다크 예외 점검(RD-1-3)과 대비 검수를 묶음. 문제 시 tokens.legacy.css import 한 줄만 되돌리면 원복 |
| R2 | 화면 전환 이름 짝이 깨져 전환이 통째로 취소됨(같은 이름 2개) | 공통 규칙 5, reviewer 검사 5. 클래스 변경은 짝과 같은 작업에서 |
| R3 | 병렬 에이전트가 같은 파일을 고쳐 충돌 | 작업표의 소유 파일 열, 묶음 내 중복 금지(리드가 브리프 전 확인) |
| R4 | 무한 셸프의 위치 튐·포커스가 복제본으로 들어감 | 명세 4.2, architect 담당, 복제 벌 `aria-hidden`+`tabIndex=-1` |
| R5 | `addedAt` 날짜를 추정으로 채움 | data-wirer 규칙: git 근거 없으면 비움 + 목록 보고 |
| R6 | 작업 트리의 무관한 변경(권한 193건·README 등)이 커밋에 섞임 | RD-0-1 🙋 D1, 커밋은 `core.fileMode=false` + 파일 지정 |
| R7 | 블러(backdrop-filter) 겹침으로 저사양 기기 스크롤 끊김 | 블러는 바·드롭다운 덮개·셸프 가장자리만. Ch9 성능 확인 |
| R8 | 레거시 정적 사이트 CSS(`src/main/resources/static/css`)에 계속 의존 | Ch9에서 reset만 앱으로 옮기고 import 제거(🙋 D6) |
| R9 | 에이전트 팀은 실험 기능 — 세션이 끊기면 팀원 복구 불가, 작업 상태 표시가 늦을 수 있음 | 챕터 = 세션 1개로 짧게. 끊기면 새 세션에서 로드맵 "현재 위치"로 재개(체크된 RD는 다시 하지 않음). 기능이 이상하면 SKILL.md §9 서브에이전트 폴백 |
| R10 | 팀 토큰 비용 | 동시 팀원 3~5명, reviewer·architect는 필요할 때만, 끝난 팀원은 바로 종료 |

## 7. 사용자 결정 목록 (🙋)

| ID | 사안 | 시점 | 기본 추천 |
|---|---|---|---|
| D1 | 지금 작업 트리의 미커밋 변경(10-12 연출 작업 + 권한 변경 + README 등) 처리 후 `feat/apple-redesign` 브랜치 생성 | Ch0 시작 | 10-12 연출 작업은 먼저 main에 커밋, 나머지는 그대로 두고 브랜치 |
| D2 | 챕터별 화면 확인 방식 — 직접 / Chrome 자동화 위임 | 매 챕터 끝 | 직접(가장 빠름) |
| D3 | 홈 진입 연출(배지가 '한곳에'로 모임 + 숫자 카운트업) 유지 | Ch3 | 유지(한 줄 제목에 맞춰 조정) |
| D4 | 시계·스택 비율 위젯 삭제 (시안: 시계는 빠지고 달력만, 스택 비율은 '문서 비중' 타일로 대체) | Ch5 | 삭제 |
| D5 | Books 태그 바로가기 `/books?tag=Java` 도입(드롭다운·홈에서 필터 상태로 진입) | Ch2 | 도입(BooksPage가 쿼리를 읽게, Ch8) |
| D6 | 레거시 정적 사이트 CSS import 끊기 | Ch9 | 끊기(reset만 앱으로 이전) |
| D7 | `feat/apple-redesign` → main 병합 + push (= 배포) | Ch9 끝 | 반드시 별도 명시 승인 |

## 8. 이번에 만든 파일

| 파일 | 메모 |
|---|---|
| `my-study-app/src/styles/tokens.css` | 미연결 |
| `my-study-app/src/styles/tokens.legacy.css` | 미연결 |
| `my-study-app/src/constants/{ui,links,navigation,index}.ts` | 아직 아무도 import하지 않음. `tsc --noEmit` 통과 |
| `.claude/agents/{ui-builder,style-migrator,data-wirer,chore-runner,redesign-architect,redesign-reviewer}.md` | `*.md` gitignore 대상 — 커밋하려면 `git add -f .claude` |
| `.claude/skills/redesign/SKILL.md` | 팀 리드 플레이북 (에이전트 팀 + 서브에이전트 폴백) |
| `.claude/settings.local.json` | 팀 기능 플래그·in-process 표시·읽기/빌드 명령 허용 — gitignore 대상 |
| `scripts/redesign-lead.sh` | IntelliJ 터미널용 리드 실행 스크립트 |
| `.gitignore` | `.claude/settings.local.json` 추가 |
| `doc/261018_my_study_app_redesign_plan.md` | 본 문서 |
| `doc/261018_my_study_app_redesign_roadmap.md` | 로드맵 |
| `doc/261018_redesign_mockups/*.dc.html` (7개) | 캔버스 보드 사본 (2026-10-18 21:44 기준) |
