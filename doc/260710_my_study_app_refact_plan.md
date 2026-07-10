# my-study-app 리팩토링 계획서

- **작성일:** 2026-07-10 · **개정:** v1.1 (같은 날 2차 점검 — 보안·절단 경계·순서 의존성 위험 반영, §10·§11 신설) → **v1.2** (2026-07-11 3종 문서 정합 점검 — 실행 계획서의 확정 결정·정정 2건 반영)
- **문서 우선순위:** 실행 방법·결정사항이 본 문서와 [실행 계획서](./260710_my_study_app_refact_execute_plan.md)·[로드뷰](./260710_my_study_app_refact_execute_roadview.md) 간에 어긋나면 **실행 계획서의 "실행 결정사항"이 우선**한다. 계약 C1~C14·위험 R1~R15의 규범은 본 문서.
- **대상:** `my-study-app/` (React 19 + TypeScript + Vite 6 SPA)
- **성격:** 순수 구조 리팩토링 — **기능·디자인·동작 100% 보존**, 코드 배치와 책임 분리만 변경
- **⚠️ 라인 번호 주의:** 본 문서의 라인 번호는 **참고치**다. 2차 점검에서 계획 작성 중에도 `index.css`가 1784→1796줄로 변한 것이 실측됐다(활발히 편집 중인 working tree). 실행 시 정본은 **섹션 주석 마커**이며, CSS 절단 전 §7.1의 중괄호 균형 검증을 반드시 통과해야 한다 (R12).

---

## 1. 목표와 비목표

### 1.1 목표
1. 한 파일에 몰린 역할·책임을 React / CSS / TS 설계 원칙(SRP, SoC, DRY, colocation)에 맞게 분리한다.
2. 사람이든 AI든 "어디를 고치면 되는지"가 파일 이름만 보고 판단 가능한 구조를 만든다.
3. 주제(카테고리) 하나를 추가할 때 수정해야 하는 파일 수를 줄인다 (현재 3개 → 1개).

### 1.2 비목표 (절대 하지 않는 것)
| 항목 | 이유 |
|---|---|
| UI/UX·디자인 변경 | 본 리팩토링의 전제 조건. 렌더링 결과(DOM 구조, 클래스명, CSS 규칙)는 그대로 유지 |
| CSS Modules / Tailwind / styled-components 도입 | `t-${key}`, `home-anim` 등 **런타임에 문자열로 조립되는 클래스**가 다수 → 해시화되면 스타일 유실. 전역 `body.dark` 의존도 있음 |
| 레거시 static CSS(`src/main/resources/static/css/`) 이동·수정 | `index.css`가 `@import '../../src/main/resources/static/css/...'`로 참조 중. Dockerfile·Netlify 빌드 경로가 이 상대경로에 의존 |
| 데이터 내용 수정 | `menuData.ts`의 PDF URL·제목·설명 등은 1글자도 변경하지 않음 (파일 분할만) |
| 레거시 Vanilla 앱(`static/js/`)과의 데이터 통합 | React `menuData.ts` ↔ 레거시 `data.js` 중복은 인지하되 범위 밖 (레거시 폐기 시점에 정리) |
| 라우팅 경로 변경 | `/download/:category` 등 URL 체계 그대로 |

---

## 2. 현재 상태 진단

### 2.1 파일 인벤토리 (문제 파일 중심)

| 파일 | LOC | 진단 |
|---|---|---|
| `src/index.css` | **1796** | 🔴 앱 전체 스타일 단일 파일. 15개+ 관심사 혼재 (2차 점검 중에도 증가 — 활발히 편집 중) |
| `src/data/menuData.ts` | **246** | 🔴 4개 데이터 도메인(MENUS/MENU_DATA/REPO_DATA/BOOKS) 혼재 |
| `src/pages/DownloadPage.tsx` | 184 | 🟠 key 해석 + 페이지네이션 + DOM 조작 다운로드 + 미리보기 상태 + 렌더 |
| `src/components/CommandPalette.tsx` | 173 | 🟡 인덱스 빌드 로직 + 키보드 처리 + 렌더 (허용 범위, 부분 정리) |
| `src/pages/HomePage.tsx` | 159 | 🟠 검색 상태/필터 + 그룹 빌드 + 인라인 renderRow + 레이아웃 |
| `src/components/GlassCard.tsx` | 19 | 🟢 **사용처 0건** — 글래스모피즘 폐기 후 죽은 코드 |
| `package.json` (`gsap`) | - | 🟢 React 소스 내 `gsap` import **0건** — 미사용 의존성 |

### 2.2 index.css 내부 구조 (실측 섹션 맵)

```
   1-  13  레거시 CSS @import 6건 (reset, variables, card, button, book, jm-github)
  15-  42  React 전용 base (overflow-x: clip, body 폰트/배경)
  43- 213  상단 바 (.header, .nav-*, 모바일 메뉴)
 214- 220  페이지 공통 래퍼 (.page-wrapper)
 221- 323  블로그형 홈 — 진입 애니메이션(.home-anim), Hero, 검색
 324- 570  홈 3단 레이아웃 — 레일, 프로필 카드, 스택 비율, 시계, 달력
 571- 780  홈 섹션 — 섹션 헤더, 바로가기 카드, 주제 리스트 행, t-* 틴트, 책·GitHub 패널
 781- 998  Download/GitHub 리스트 — .dl-*, 페이지네이션, 링크형 행
 999-1127  바이브 코딩 (.vibe-*) + 브레드크럼(.dl-crumb, 1114줄 부근)
1128-1293  명령 팔레트 (.nav-search, .cmdk-*)
1294-1386  PDF 미리보기 모달 (.pdfp-*)
1387-1465  푸터 / 위로가기 / 404
1466-1712  Download 페이지 레이아웃 — 사이드바, 카드, 터치 타겟, 모바일 토글
1713-1796  반응형 통합 블록 (태블릿/폰/소형폰/가로모드)
```

> **v1.1 재실측 (1796줄 기준):** 위 절단 경계 13곳 + EOF, 총 14개 지점 전부에서 중괄호 균형 0 확인 완료 (블록 중간 절단 아님).
> **v1.2 주의:** §7.1의 awk 검증 명령은 절단 경계뿐 아니라 내부 소제목 마커까지 **총 30개**(경계 13 + 소제목 17)를 출력한다 — 30줄이 나오는 것이 정상이며, 전부 balance=0이어야 한다 (2026-07-11 재실측: 30/30 통과).
> v1.0의 라인 맵(1784줄 기준)으로 잘랐다면 4곳(구 1115/1281/1374/1700)이 **열린 블록 내부**였다 — 라인 번호가 아닌 마커 기준 + 실행 시점 균형 재검증이 필수인 실증 사례.

### 2.3 핵심 문제 3가지

**① SRP 위반 — index.css, menuData.ts**
스타일 하나 고치려면 ~1800줄에서 검색해야 하고, 책 한 권 추가하려면 PDF 카탈로그 한복판을 지나야 함.

**② Shotgun Surgery — 카테고리 지식이 3개 파일에 분산**
주제 하나(예: `redis`)를 추가하려면:
- `menuData.ts` → `MENUS` 항목 + `MENU_DATA` PDF 배열
- `topics.ts` → `BADGE`(모노그램) + `DESC`(한 줄 설명)
- `stacks.ts` → `STACK`(색상/로고)

세 파일 중 하나라도 빠뜨리면 폴백(`name.slice(0,2)`, 기본색 `#8E7A70`)으로 조용히 처리되어 **누락을 알아채기 어려움**.

**③ DRY 위반 — 동일 로직 복붙**
- `countOf(key)`: `HomePage.tsx:14`, `Sidebar.tsx:12`, `StackRatio.tsx:6` 3곳 동일 정의
- 대소문자 무시 key 매칭: `DownloadPage.tsx:16-18`(resolvedKey), `DownloadPage.tsx:25`, `Sidebar.tsx:22,39` 산재
- `useEffect(() => window.scrollTo(0,0), [])`: `BooksPage`, `GitHubPage`, `VibeCodingPage` 3곳 반복
- 다운로드 앵커 생성: `DownloadPage.handleDownload` ↔ `PdfPreview.onDownload` 경유로 결합

---

## 3. 반드시 보존해야 할 동작 명세 (계약)

리팩토링 중 어떤 코드를 옮기든 아래 동작은 **바이트 단위로 동일**해야 한다.

| # | 계약 | 위치 | 비고 |
|---|---|---|---|
| C1 | `MENU_DATA`의 `JUnit` 키는 **대문자 유지** | `menuData.ts:125` | `/download/junit`, `/download/JUnit` 모두 lowercase 매칭으로 동작해야 함 |
| C2 | `pdfUrl.trim()` — 데이터에 trailing 개행 존재 | `DownloadPage.tsx:22` | 데이터 파일을 고치지 말고 런타임 trim 유지 |
| C3 | PDF 미리보기의 GitHub → jsDelivr URL 변환 | `PdfPreview.tsx:16-36` | raw.githubusercontent는 octet-stream이라 iframe 불가 |
| C4 | 테마: `body.dark` 클래스 + localStorage `tech-docs-theme` | `ThemeProvider.tsx` | 레거시 Vanilla CSS와 공유하는 규약 |
| C5 | 틴트 클래스 `t-${key.toLowerCase()}` 동적 조립 | `topics.ts:33` | CSS 클래스명 변경 금지의 근거 |
| C6 | 배지 폴백 `BADGE[key] ?? name.slice(0, 2)` | `topics.ts:36` | 통합 시에도 폴백 체인 유지 |
| C7 | 스택 색 폴백: StackRatio 행 `?? '#8E7A70'`, 아이콘 `?? 'var(--text-muted)'` | `StackRatio.tsx:11,49` | 두 폴백이 **서로 다름** — 통일하지 말 것 |
| C8 | 다운로드: `target=_blank` + 비 http URL일 때만 `download` 속성 | `DownloadPage.tsx:44-56` | |
| C9 | 페이지네이션: `DOWNLOAD_PAGE_SIZE=10`, 카테고리 변경 시 page=1 리셋 + scrollTo(0,0) + 사이드바 닫기 | `DownloadPage.tsx:30-34` | effect 내 3개 동작 순서 포함 |
| C10 | ⌘K / `/` 단축키, `open-command-palette` 커스텀 이벤트 | `CommandPalette.tsx:55-77`, `Navbar.tsx:6` | `/`는 입력 중이 아닐 때만 |
| C11 | 모달 열림 시 `document.body.style.overflow='hidden'` 복원 로직 | `CommandPalette`, `PdfPreview` | |
| C12 | 레거시 CSS `@import` 6건의 **경로와 순서** | `index.css:1-13` | Docker/Netlify 빌드가 이 경로에 의존 |
| C13 | `MenuItem.icon`/`PdfItem.icon` 필드(fa-* 문자열)는 React에서 대부분 미사용이지만 **삭제 금지** | `types/index.ts` | 레거시 `data.js`와 스키마 정합 + `BooksPage`는 `book.icon` 폴백 사용 중 |
| C14 | 빈 카테고리(`exception`, pdfUrl `''`) → "준비 중" 비활성 버튼 | `DownloadPage.tsx:95-99,123` | |

---

## 4. 리팩토링 설계 — 단계별 계획

> 각 Phase는 독립 커밋. 어느 단계에서든 이전 커밋으로 롤백 가능해야 한다.

### Phase 0 — 안전망 구축 (코드 변경 없음)

1. **현재 미커밋 작업 먼저 커밋** — git status에 기능 작업(Vibe 페이지, 홈 위젯 등) 다수 존재.
   리팩토링 diff와 기능 diff가 섞이면 리뷰·롤백 불가능. **이것이 선행 조건.**
2. 리팩토링 전용 브랜치 생성: `refactor/my-study-app-structure`
3. 기준선 빌드 스냅샷:
   ```bash
   cd my-study-app && npm run build
   cp ../static-react/assets/index-*.css /tmp/baseline.css   # CSS 기준선 보관
   ```
   → CSS 규칙을 하나도 안 바꾸므로, **모든 Phase 완료 후에도 빌드된 CSS는 기준선과 바이트 동일**해야 한다 (해시 파일명 제외). 이것이 "디자인 무변경"의 기계적 증명.
4. (권장) 주요 6페이지 × 라이트/다크 스크린샷 저장 — TSX 이동 실수를 잡는 최후 방어선.
5. **의존성 취약점 처리 시점 (v1.2 — 실행 계획서 결정 1로 확정):** `npm audit` 기준 6건(high 2 — vite ≤6.4.2 dev 서버 취약점, §10.2 참조)은 **리팩토링 완주 후** 별도 커밋으로 수행한다. 기준선 채취 전 선행하지 않는다 — audit fix를 후행해도 lock에 vite 버전이 고정되어 있어 CSS 바이트 기준선은 전 Phase 유효하며, 리팩토링 커밋과 절대 섞지 않는다.
6. **리팩토링 진행 중에는 기능 편집과 병행 금지** — 병행하면 기준선·라인 맵이 계속 낡는다 (R12 실증: 계획 작성 중에도 index.css가 +12줄 변경됨). 부득이 병행했다면 기준선 재채취 + §2.2 재실측.

### Phase 1 — 죽은 코드 제거 (위험: 최저)

| 작업 | 근거 |
|---|---|
| `src/components/GlassCard.tsx` 삭제 | 전체 소스 grep 결과 사용처 0건 |
| `gsap` 의존성 제거 — 반드시 `npm uninstall gsap`으로 **package-lock.json 동시 갱신 후 lock까지 커밋** | React 소스 내 import 0건. 진입 애니메이션(`home-anim`)은 CSS keyframe이며 GSAP 무관 (`index.css:226` 주석 확인). Docker·Netlify 모두 `npm ci` 사용 → lock 불일치 시 **배포 빌드만 실패** (R13). 레거시 Vanilla 앱의 GSAP은 별도 로드라 무관 |
| `stacks.ts`의 `stackColor` export 제거 | v1.1 확정: 전체 grep 결과 정의만 있고 사용처 0건 (`StackRatio`는 자체 폴백 사용) |

- 검증: `npm run build` 성공 (tsc strict 포함), 홈 진입 애니메이션 동작 확인.

### Phase 2 — index.css 분할 (위험: 중 — 규칙 순서가 생명)

**전략: "연속 슬라이스" 원칙.** 파일을 §2.2의 섹션 경계에서 **자르기만** 하고, 규칙의 순서·내용·선택자·미디어쿼리를 일절 재배치하지 않는다. CSS 캐스케이드는 동일 특이도에서 소스 순서로 승부가 갈리므로, **순서 보존 = 렌더링 보존**.

**결과 구조:**

```
src/
├─ index.css                  ← @import 매니페스트만 남김 (아래 순서 고정)
└─ styles/
   ├─ base.css                (마커 "React 전용 레이아웃 오버라이드" ══ ~ 15-  42줄)
   ├─ navbar.css              (마커 "Plain top bar" ──          ~ 43- 213)
   ├─ layout.css              (마커 "페이지 공통 래퍼" ──        ~214- 220)
   ├─ home-hero.css           (마커 "블로그형 홈" ══             ~221- 323: .home-anim 포함)
   ├─ home-rails.css          (마커 "홈 3단 레이아웃" ══          ~324- 570)
   ├─ home-sections.css       (마커 "섹션 헤더" ──               ~571- 780: t-* 틴트 포함)
   ├─ doc-list.css            (마커 "Download / GitHub 리스트" ══ ~781- 998)
   ├─ vibe.css                (마커 "바이브 코딩" ══              ~999-1127: .dl-crumb 포함)
   ├─ command-palette.css     (마커 "명령 팔레트" ══             ~1128-1293)
   ├─ pdf-preview.css         (마커 "PDF 미리보기 모달" ══        ~1294-1386)
   ├─ footer-misc.css         (마커 "공통 푸터 / 위로가기 / 404" ══ ~1387-1465)
   ├─ download-page.css       (마커 "Download 레이아웃" ──        ~1466-1712)
   └─ responsive.css          (마커 "반응형" ══                  ~1713-1796 — 반드시 마지막 import)

   ※ 절단 기준은 **마커 주석**이며 라인 번호는 v1.1 실측 참고치(파일이 계속 편집 중 — R12).
```

`index.css` 최종 형태:
```css
/* 레거시 static CSS 재활용 — 경로·순서 변경 금지 (Docker/Netlify 의존) */
@import '../../src/main/resources/static/css/common/reset.css';
@import '../../src/main/resources/static/css/common/variables.css';
@import '../../src/main/resources/static/css/components/card.css';
@import '../../src/main/resources/static/css/components/button.css';
@import '../../src/main/resources/static/css/pages/book.css';
@import '../../src/main/resources/static/css/pages/jm-github.css';

/* React 앱 스타일 — 원본 index.css의 섹션 순서 그대로 */
@import './styles/base.css';
@import './styles/navbar.css';
/* ... (위 표 순서대로) ... */
@import './styles/responsive.css';
```

**주의 사항:**
- **절단점 검증 (필수, 자르기 직전 실행):** 각 마커 라인에서 누적 중괄호 균형이 0인지 확인 — 0이 아니면 마커가 열린 블록(미디어쿼리 등) 안에 있다는 뜻이므로 그 지점에서 자르면 CSS가 깨진다.
  ```bash
  awk '{b+=gsub(/\{/,"x")-gsub(/\}/,"x")} /^\/\* ══|^\/\* ──/ {print NR": balance="b}' src/index.css
  # 마커 30개(절단 경계 13 + 내부 소제목 17)가 출력되며 전부 balance=0 이어야 함
  # (v1.2 재실측 2026-07-11: 30/30 통과)
  ```
- `.home-anim`(진입 애니메이션)은 이름과 달리 **모든 페이지가 사용** → `home-hero.css`에 그대로 두되 파일 상단 주석으로 명시.
- `.dl-crumb`(브레드크럼)이 vibe 섹션 라인 범위 안에 있음 — 원 위치 유지(순서 보존 우선), 주석으로만 표기. **"적절한 파일로 재배치"하고 싶어도 이번엔 하지 않는다.**
- 미디어쿼리가 각 섹션 내부(예: 레일 556줄)와 말미 통합 블록(1701-)에 이중 존재 — 절대 병합·이동 금지.
- 새 파일에 추가하는 것은 파일 최상단 한 줄 주석뿐 (minify 시 제거되므로 빌드 결과 무영향).
- **url() 상대경로 재해석 위험 — 해당 없음 확인 (v1.1):** 규칙을 하위 디렉터리 파일로 옮기면 `url()` 상대경로의 기준이 바뀔 수 있으나, 실측 결과 index.css 본문에 `url()`·`@font-face`·`@charset`·`@layer` **0건** (배경 패턴은 레거시 variables.css의 CSS 변수로 정의됨 — 레거시 파일은 이동하지 않으므로 무관).

**검증 (기계적):**
```bash
npm run build && diff /tmp/baseline.css ../static-react/assets/index-*.css
```
→ **diff 0이어야 함.** 1바이트라도 다르면 규칙이 유실/재배열된 것.

### Phase 3 — 데이터 계층 분할 (위험: 낮음)

`menuData.ts` 246줄을 도메인별로 분할. **데이터 리터럴은 잘라내기-이동만, 값 수정 금지.**

```
src/data/
├─ menus.ts        ← MENUS (15개 주제 정의)
├─ pdfs.ts         ← MENU_DATA (PDF 카탈로그) — JUnit 키 주석 포함 이동
├─ repos.ts        ← REPO_DATA
├─ books.ts        ← BOOKS
├─ menuData.ts     ← barrel: export { MENUS } from './menus'; ... (하위호환)
├─ topics.ts       (유지)
├─ stacks.ts       (유지)
└─ vibe.ts / vibe.projects.json / vibe.schema.json (유지)
```

- barrel 유지로 **기존 소비 파일 7곳의 import문 무변경** (HomePage, DownloadPage, BooksPage, GitHubPage, Sidebar, StackRatio, CommandPalette — v1.2 정정: v1.1의 "6곳"은 오기) → diff가 데이터 파일에만 국한.
- (선택) 안정화 후 후속 커밋에서 소비처 import를 개별 모듈로 바꾸고 barrel 제거 가능. 이번 범위에선 barrel 유지 권장.
- **검증:** `npm run build` + 홈 통계 숫자(주제/문서/도서/레포 카운트)가 리팩토링 전과 동일.

### Phase 4 — 공용 유틸·훅 추출 (위험: 낮음~중)

```
src/
├─ utils/
│  ├─ category.ts     ← docCount(key), resolveCategoryKey(param)
│  └─ download.ts     ← triggerDownload(url, title)  (C8 로직 그대로)
└─ hooks/
   ├─ usePagination.ts       ← page 상태 + totalPages + slice + goPage(smooth scroll)
   └─ useScrollTopOnMount.ts ← Books/GitHub/Vibe 3곳의 동일 useEffect
```

**적용 매핑:**

| 신규 모듈 | 대체 대상 |
|---|---|
| `docCount` | `HomePage.tsx:14`, `Sidebar.tsx:12`, `StackRatio.tsx:6` |
| `resolveCategoryKey` | `DownloadPage.tsx:16-18` (MENU_DATA 키 해석). `DownloadPage.tsx:25` / `Sidebar.tsx:39`의 lowercase 비교는 동작 그대로 유틸 경유로 통일 |
| `triggerDownload` | `DownloadPage.handleDownload` 본문 (시그니처·분기 동일) |
| `usePagination` | `DownloadPage`의 page/totalPages/goPage. **주의:** 카테고리 변경 시 리셋 effect(C9)는 순서 보존 — 훅에 `resetKey` 인자로 넘기거나 페이지에 남김. 판단 기준: effect 실행 순서가 바뀌지 않는 쪽 |
| `useScrollTopOnMount` | `BooksPage:5-7`, `GitHubPage:6-8`, `VibeCodingPage:6-8` |

- **검증:** `/download/java`(18건 → 2페이지)에서 페이지 이동·카테고리 전환 시 page 리셋, 다운로드 버튼, "준비 중" 버튼(C14) 확인.

### Phase 5 — 컴포넌트 추출 (위험: 중 — DOM 불변 필수)

원칙: **JSX를 옮기기만 하고, 태그·클래스·속성·key를 1:1 유지.** React DevTools의 컴포넌트 트리가 아니라 **실제 DOM**이 동일한지 본다.

| 추출 | From | 내용 |
|---|---|---|
| `components/CategoryRow.tsx` | `HomePage.renderRow` (43-58줄) | `.cat-row` 마크업 그대로. 검색 결과·그룹 목록 2곳에서 사용 |
| `hooks/useCategorySearch.ts` (선택) | `HomePage:19-29` | query 상태 + filtered useMemo. HomePage가 충분히 얇아지면 생략 가능 |
| `Navbar` 내 `NAV_LINKS` 상수화 | `Navbar.tsx` | 데스크탑/모바일에 중복된 Velog·Blog URL을 상수로 (마크업 불변) |
| `CommandPalette`의 `buildIndex` → `utils/searchIndex.ts` (선택) | `CommandPalette.tsx:12-35` | 순수 함수라 이동 안전. 컴포넌트는 UI만 담당 |

- **하지 않는 것:** `PdfRow` 추출(사용처 1곳 — 과추출), Download/Sidebar/CommandPalette 행 UI 공통화(§6 참조).
- **검증:** 홈 검색("스프링", "인덱스", 무결과 케이스), 바로가기 카드 네비게이션, ⌘K 전 시나리오.

### Phase 6 — 카테고리 메타 통합 (위험: 중상 — 선택적, 마지막)

Shotgun surgery(§2.3-②) 해소. **소비처 API를 바꾸지 않는 파사드 방식**으로 위험 최소화:

1. `src/data/categories.ts` 신설 — 주제당 하나의 레코드:
   ```ts
   interface Category {
     key: string;        // 'JUnit' 대문자 원형 유지 (C1)
     name: string;
     group: string;
     icon: string;       // fa-* 문자열 (C13 — 레거시 정합)
     badge?: string;     // 없으면 name.slice(0,2) 폴백 (C6)
     desc?: string;
     color?: string;     // 없으면 소비처별 폴백 (C7 — 통일 금지)
     brandIcon?: { path: string; title: string };
   }
   export const CATEGORIES: Category[] = [ /* 기존 3파일 값 그대로 병합 */ ];
   ```
2. 기존 export를 **파생값으로 유지** (소비처 무변경):
   - `menus.ts`: `export const MENUS = CATEGORIES.map(...)`
   - `topics.ts`: `BADGE`/`DESC`를 CATEGORIES에서 도출. `GROUP_ORDER`·`tintClass`·`badgeLabel`·`DOWNLOAD_PAGE_SIZE`는 유지
   - `stacks.ts`: `STACK`을 CATEGORIES에서 도출
3. 병합 시 대조표를 만들어 **키 15개 × 속성 5종을 기존 값과 1:1 검수** (특히 kafka 회색 `#6B7280`, linux 골드 `#C99700` 같은 의도적 조정값).
4. **배열 순서 보존 (v1.1 추가, R14):** `CATEGORIES` 배열 순서는 기존 `MENUS` 순서와 동일해야 한다 — 홈/사이드바의 **그룹 내 나열 순서**가 배열 순서에서 나오고, `StackRatio`의 count 동률 정렬 결과도 stable sort라 원 배열 순서에 의존한다. 순서가 바뀌면 눈에 보이는 변화 발생.

- **검증:** 홈 배지 문자·색, 스택 비율 바 색·로고, 사이드바 배지가 Phase 0 스크린샷과 동일. `exception`(로고 없음 → 모노그램 폴백) 확인.
- 이 Phase는 **독립적으로 생략 가능** — Phase 1~5만으로도 1차 목표 달성.

---

## 5. 위험 요소 분석

| # | 위험 | 발생 시나리오 | 영향 | 완화책 |
|---|---|---|---|---|
| R1 | **CSS 캐스케이드 순서 붕괴** | 분할 중 규칙을 "보기 좋게" 재배치 → 동일 특이도 규칙의 승자가 바뀜 | 특정 상태(다크모드, 모바일)에서만 스타일 깨짐 — 육안 검출 어려움 | 연속 슬라이스 원칙 + **빌드 CSS 바이트 diff (diff 0 강제)** |
| R2 | 미디어쿼리 재배치 | 섹션 내부 미디어쿼리를 responsive.css로 "정리"하려는 유혹 | 반응형 레이아웃 회귀 | 금지 명문화 (§4 Phase 2). diff 0 검증이 자동 검출 |
| R3 | 레거시 @import 경로 파손 | styles/ 하위로 옮기며 상대경로 재계산 실수 | 로컬은 되는데 **Docker/Netlify 빌드만 실패** | 레거시 import 6건은 `index.css`에 남김(경로 불변). Netlify는 base=`my-study-app`이라 `../../src/...`가 리포 루트로 해석 — 현행 유지 |
| R4 | JUnit 대문자 키 회귀 | 통합/분할 중 키를 lowercase로 "정규화" | `/download/JUnit` 매칭 실패 또는 배지·색 유실 | C1 계약 + `menuData.ts:124` 주석을 이동 후에도 유지 + 체크리스트에 junit 라우트 포함 |
| R5 | 데이터 값 오염 | 246줄 복사-이동 중 URL 개행·퍼센트 인코딩(%E1 등) 훼손 | 특정 PDF 404 | 잘라내기-붙여넣기(재타이핑 금지). `git diff --word-diff`로 이동 외 변경 0 확인 |
| R6 | 훅 추출로 effect 순서 변경 | usePagination이 리셋 effect를 흡수하면서 실행 순서 변동 | 카테고리 전환 시 스크롤/사이드바 미묘한 회귀 | C9 순서 보존. 확신 없으면 리셋 effect는 페이지 컴포넌트에 잔류 |
| R7 | **미커밋 기능 작업과 뒤섞임** | 현재 working tree에 신규 기능 다수 미커밋 상태 | 리팩토링 롤백 시 기능 작업까지 유실 | **Phase 0에서 기능 커밋 선행** — 미이행 시 리팩토링 착수 금지 |
| R8 | barrel 제거를 성급히 병행 | Phase 3에서 소비처 import 경로까지 일괄 변경 | diff 폭증, 리뷰 불가 | barrel 유지로 소비처 무변경. import 정리는 별도 후속 커밋 |
| R9 | 폴백 체인 "정리" 유혹 | C6/C7의 서로 다른 폴백을 하나로 통일 | 스택 아이콘 색이 미묘하게 변함 | 계약 명세(C7)에 "통일 금지" 명시 |
| R10 | tsconfig strict 옵션과 충돌 | `noUnusedLocals` 등으로 추출 후 잔류 import가 빌드 실패 | 빌드 깨짐 (배포 전 검출되므로 실질 위험 낮음) | 오히려 안전망으로 활용 — 각 Phase 후 `npm run build` 필수 |
| R11 | dev/HMR과 build 결과 차이 | @import 중첩이 dev 서버에선 되는데 빌드에서 다르게 병합 | 배포에서만 깨짐 | Vite는 빌드 시 @import를 소스 순서대로 인라인 병합 — Phase 2 검증을 dev가 아닌 **build 산출물**로 수행 |
| R12 | **문서 라인 번호 부패 (v1.1 실증)** | working tree가 활발히 편집 중 — 계획 작성 중에도 index.css가 1784→1796줄로 +12줄 변경됨. 낡은 라인 맵으로 잘랐다면 4개 경계가 열린 블록 내부였음 | 블록 중간 절단 → CSS 파손 (빌드는 성공하나 규칙 유실 가능) | 섹션 **마커 주석을 정본**으로 절단 + 자르기 직전 중괄호 균형 검증(§4 Phase 2, §7.1) + Phase 0 커밋 후 재실측 |
| R13 | **package-lock 불일치 (v1.1 추가)** | gsap 제거·audit fix 후 lock 미갱신 또는 미커밋 | Docker(`npm ci`)·Netlify(`npm ci && npm run build`) **배포 빌드만 실패** — 로컬에선 재현 안 됨 | `npm uninstall gsap`으로 lock 동시 갱신, 커밋에 package-lock.json 포함 여부 확인 |
| R14 | **배열 순서 변경 (v1.1 추가)** | Phase 6 통합 시 CATEGORIES 순서가 기존 MENUS와 달라짐 | 홈/사이드바 그룹 내 나열 순서 + StackRatio 동률 정렬(stable sort) 순서 변화 — **눈에 보이는 회귀** | CATEGORIES 순서 = 기존 MENUS 순서 유지를 Phase 6 검수 항목에 포함 |
| R15 | **main 병합 = 즉시 배포 (v1.1 추가)** | CI(`.github/workflows/docker.yml`)가 main push 시 Docker Hub `latest` 태그로 자동 빌드·푸시 | 검증 안 된 리팩토링이 프로덕션 이미지로 배포됨 | 리팩토링은 브랜치에서만 진행. main 병합은 §7 체크리스트 전부 통과 후 |

---

## 6. 의도적으로 하지 않는 리팩토링 (검토 후 기각)

| 후보 | 기각 사유 |
|---|---|
| `.cat-row` / `.menu-item` / `.cmdk-item` / `.ratio-row` 행 UI 공통 컴포넌트화 | 개념은 유사하나 DOM 구조·클래스가 각기 다름. 통합 = 마크업 변경 = 디자인 변경 위험. "무변경" 전제와 충돌 |
| CSS 클래스 네이밍 정비 (`pdfp` → `pdf-preview` 등) | 클래스명 변경은 스타일 유실 위험 대비 이득 없음 |
| `vibe.schema.json` ↔ `vibe.ts` 타입 이원화 해소 (codegen) | 도구 체인 추가 비용 > 파일 2개 동기화 비용. 주석으로 상호 참조만 명시 |
| `PdfItem.icon` 등 미사용 필드 제거 | C13 — 레거시 `data.js`와 스키마 정합 유지 |
| React `menuData` ↔ 레거시 `data.js` 데이터 단일화 | 레거시 앱 수명 결정(폐기/유지)이 선행되어야 함 — 별도 과제 |
| `@` path alias로 전체 import 정리 | 순수 미용 변경, diff만 키움. 신규 파일에만 선택적 사용 |

---

## 7. 검증 계획

### 7.1 자동 검증 (각 Phase 종료 시)
```bash
cd my-study-app
npm run build                                                # tsc -b(strict) + vite build
diff /tmp/baseline.css ../static-react/assets/index-*.css    # Phase 2 이후 매번: 반드시 diff 0

# Phase 2 절단 직전 1회: 마커 지점 중괄호 균형 검증 (모두 0이어야 안전한 절단점)
awk '{b+=gsub(/\{/,"x")-gsub(/\}/,"x")} /^\/\* ══|^\/\* ──/ {print NR": balance="b}' src/index.css
```
- CSS는 **전 Phase에 걸쳐 규칙을 1개도 수정하지 않으므로**, 최종 완료 시점까지 바이트 동일이 유지되어야 한다.
- 바이트 동일이면 content hash도 동일 → 산출물 파일명(`index-<hash>.css`)까지 같아야 정상.

### 7.2 수동 체크리스트 (Phase 5, 6 이후 전체 1회씩)

| 영역 | 시나리오 |
|---|---|
| 홈 | 히어로 통계 숫자 4종 / 검색("스프링"→결과, "zzz"→무결과) / 바로가기 4카드 / 그룹 6종 순서 / 좌우 레일 sticky |
| 레일 위젯 | 프로필 카드, 스택 비율 바(색·로고·모노그램 폴백), 시계 동작, 달력 오늘 표시 |
| 다운로드 | `/download/java` 2페이지 페이지네이션 / `/download/spring` 10건 1페이지 / `/download/junit` **소문자 라우트** / `/download/exception` "준비 중" / 브레드크럼 |
| PDF | 미리보기 모달(jsDelivr 인라인 렌더) / 새 탭 / 다운로드 / ESC 닫기 / 배경 스크롤 잠금·복원 |
| 검색 팔레트 | ⌘K 토글 / `/` 열기(입력 중엔 무시) / Navbar 검색 버튼 / ↑↓↵ 이동 / 카테고리·문서 결과 네비게이션 |
| 책/GitHub/Vibe | 커버 이미지 로드 실패 폴백(icon) / 외부 링크 새 탭 / 진입 시 스크롤 최상단 |
| 테마 | 라이트↔다크 토글 / 새로고침 후 유지 / OS 다크 기본값 |
| 반응형 | 1240px↓ 레일 하단 이동 / 태블릿·모바일 사이드바 오버레이 + 백드롭 탭 닫기 / 햄버거 메뉴 |
| 404 | 임의 경로 접근 |

### 7.3 시각 검증 (권장)
- Phase 0 스크린샷(6페이지 × 라이트/다크)과 완료 후 육안 대조.
- CSS diff 0이면 스타일은 보장되므로, 이 단계는 **TSX 이동으로 인한 DOM 구조 실수**를 잡는 용도.

---

## 8. 실행 순서·커밋 전략

```
[선행] 현재 미커밋 기능 작업 커밋 (main)
  └─ branch: refactor/my-study-app-structure
      ├─ commit 1: Phase 1  chore: 미사용 GlassCard·stackColor·gsap 제거 (lock 포함)
      ├─ commit 2: Phase 2  refactor: index.css를 styles/로 섹션 분할 (규칙 무변경)
      ├─ commit 3: Phase 3  refactor: menuData를 도메인별 파일로 분할 (barrel 유지)
      ├─ commit 4: Phase 4  refactor: 공용 유틸·훅 추출 (중복 제거)
      ├─ commit 5: Phase 5  refactor: CategoryRow 추출 및 페이지 슬림화
      ├─ commit 6: Phase 6  refactor: 카테고리 메타 categories.ts로 통합 (선택·게이트)
      └─ commit 7: (완주 후) chore: npm audit fix — v1.2 확정: 선행 아님 (§10.2, lock 포함)
```

- 각 커밋 직후: `npm run build` + CSS diff 0 + 해당 Phase 검증 항목.
- 문제 발생 시 해당 커밋만 revert — Phase 간 의존은 4→5(유틸을 컴포넌트가 사용)만 존재.

---

## 9. 완료 후 기대 구조

```
my-study-app/src/
├─ main.tsx / App.tsx / vite-env.d.ts
├─ index.css                 # @import 매니페스트 (순서 = 캐스케이드 계약)
├─ styles/                   # 13개 파일 — 섹션당 1파일, 규칙은 원본 그대로
├─ components/               # Navbar, Sidebar, Footer, CategoryRow, CommandPalette,
│                            #   PdfPreview, ProfileCard, StackRatio, Clock,
│                            #   MiniCalendar, ScrollToTop, ThemeProvider
├─ pages/                    # Home, Download, Books, GitHub, VibeCoding, NotFound
│                            #   (렌더 중심으로 슬림화)
├─ hooks/                    # usePagination, useScrollTopOnMount, (useCategorySearch)
├─ utils/                    # category.ts, download.ts, (searchIndex.ts)
├─ data/
│  ├─ categories.ts          # (Phase 6) 주제 단일 소스
│  ├─ menus.ts / pdfs.ts / books.ts / repos.ts
│  ├─ menuData.ts            # barrel (하위호환)
│  ├─ topics.ts / stacks.ts  # categories 파생 or 유지
│  └─ vibe.*
└─ types/index.ts
```

**개선 지표:**
- 최대 CSS 파일: 1796줄 → ~250줄 수준 (섹션당 1파일)
- 주제 추가 시 수정 파일: 3개 → 1개 (Phase 6 완료 시)
- 중복 정의: `countOf` 3곳 / 스크롤 effect 3곳 / 다운로드 로직 2곳 → 각 1곳
- 죽은 코드: `GlassCard.tsx`, `stackColor`, `gsap` 의존성 제거

---

## 10. 보안 점검 결과 (v1.1 — 2차 점검, 2026-07-10)

### 10.1 코드 패턴 점검 (전수 grep + 멀티라인 수동 확인)

| 항목 | 결과 |
|---|---|
| `target="_blank"` 외부 링크의 `rel="noopener noreferrer"` | ✅ **누락 0건** — Navbar, Footer, ProfileCard, BooksPage, GitHubPage, VibeCodingPage, PdfPreview 전수 확인. DownloadPage의 프로그래매틱 앵커도 `a.rel = 'noopener noreferrer'` 설정(`DownloadPage.tsx:49`). ※ 단순 grep으로는 4건이 누락처럼 보이나 전부 멀티라인 JSX(rel이 다음 줄) — 오탐 확인 완료 |
| `dangerouslySetInnerHTML` / `innerHTML` / `eval` / `document.write` / `new Function` | ✅ 사용 0건 |
| localStorage | ✅ 테마 문자열(`light`/`dark`)만 저장 — 민감정보 없음 |
| 하드코딩 시크릿 | ✅ 없음 — 데이터 파일은 공개 URL만. CI 자격증명은 GitHub Secrets 사용 확인 |
| ProfileCard의 이메일(mailto) 노출 | ℹ️ 의도된 공개 프로필 정보 — 이슈 아님 |

### 10.2 의존성 취약점 (npm audit 실측)

- **6건: high 2 / moderate 3 / low 1.** 핵심은 `vite ≤ 6.4.2`의 **dev 서버** 취약점(path traversal, 임의 파일 읽기, `server.fs.deny` 우회 등) + react-router-dom 관련.
- **프로덕션 영향: 없음.** 배포물은 정적 파일이고 Nginx/Netlify가 서빙 — vite dev 서버는 프로덕션에 존재하지 않음. 단 로컬 `npm run dev` 사용 중에는 유효한 위험.
- **처리 방침 (v1.2 — 실행 계획서 결정 1로 확정):** `npm audit fix`는 vite 버전을 올림 → minifier 출력이 달라질 수 있어 **CSS 바이트 기준선(§7.1)이 무효화**됨. 따라서 **리팩토링 완주 후** 별도 커밋으로 수행한다 (실행 계획서 §9.3 / 로드뷰 RV-7-3). 후행해도 lock에 vite 버전이 고정되어 기준선은 전 Phase 유효. 리팩토링 커밋과 절대 혼합 금지 + lock 파일 커밋(R13). 수행 후부터 기존 기준선은 무효 — 검증은 "build 성공 + 스모크"로 전환.

### 10.3 리팩토링 자체의 보안 영향

- 코드 이동·분할은 보안 표면을 변경하지 않음: 신규 입력 처리, 네트워크 호출, 저장소 접근, 외부 스크립트 **일절 추가 없음**.
- `gsap` 제거는 공급망(supply chain) 표면 **감소** — 유일한 보안상 변화이며 긍정적.

### 10.4 기존 이슈 — 이번 범위 밖, 후속 백로그로 기록

| 항목 | 내용 | 이번에 안 하는 이유 |
|---|---|---|
| Font Awesome CDN에 SRI 없음 | `index.html`의 cdnjs `<link>`에 `integrity`/`crossorigin` 속성 부재 | 속성 추가는 **기능 변경**(해시 불일치 시 아이콘 전체 미표시) — "무변경" 원칙 위배. 별도 과제로 |
| PDF iframe에 `sandbox` 없음 | 외부(jsDelivr) 콘텐츠를 iframe 임베드 (`PdfPreview.tsx:79`) | `sandbox`는 브라우저 내장 PDF 뷰어 동작을 깨뜨릴 수 있음 — 별도 테스트가 필요한 기능 변경 |

---

## 11. 웹 페이지 영향 매트릭스 — "코드만 바뀌고 페이지는 안 바뀐다"의 근거

> 사용자 관점에서 각 Phase가 실제 웹 페이지에 미치는 영향을 항목별로 명시한다. 목표는 전 항목 "불변".

| Phase | DOM 구조 | CSS 캐스케이드 | 시각(위치·색·크기) | 동작(라우팅·이벤트) | 네트워크·스토리지 | 증명 수단 |
|---|---|---|---|---|---|---|
| 1 죽은 코드 제거 | 불변 (미사용 코드만) | 불변 | 불변 | 불변 | 불변 (gsap은 번들에 애초 미포함 — tree-shaking 이전에 import 자체가 0건) | grep 0건 + build 성공 |
| 2 CSS 분할 | 불변 (CSS는 DOM 무관) | **바이트 동일** | 불변 | 불변 | 불변 (빌드 시 단일 CSS로 병합 — HTTP 요청 수 동일) | 빌드 CSS diff=0 + 산출물 해시 동일 |
| 3 데이터 분할 | 불변 (동일 데이터 렌더) | 불변 | 불변 | 불변 | 불변 | build + 홈 통계 4종 수치 대조 |
| 4 유틸·훅 추출 | 불변 | 불변 | 불변 | ⚠️ 주의 지점 — effect 실행 순서(C9)만 보존하면 불변 | 불변 | §7.2 다운로드·페이징 체크 |
| 5 컴포넌트 추출 | ⚠️ 주의 지점 — JSX 1:1 이동 시 불변 (React 컴포넌트 경계는 DOM에 나타나지 않음) | 불변 | 불변 | 불변 | 불변 | DOM/스크린샷 대조 |
| 6 메타 통합 | 불변 | 불변 | ⚠️ 주의 지점 — 값·**순서**(R14) 1:1 검수 시 불변 | 불변 | 불변 | 배지·색 대조표 + 스크린샷 |

**핵심 논리:**
1. Phase 2에서 "빌드된 CSS 바이트 diff = 0"이 성립하면, 스타일 측면의 페이지 영향은 **정의상 0**이다 — 브라우저가 받는 CSS가 완전히 동일하기 때문.
2. DOM은 JSX가 결정하는데, Phase 5까지 JSX는 "위치만 이동"하고 태그·클래스·속성·순서를 바꾸지 않는다. 동일 DOM + 동일 CSS = 동일 렌더링.
3. 전 Phase에서 **새 런타임 의존성·네트워크 호출·스토리지 키를 추가하지 않는다** — 번들에 새 동작이 들어갈 경로 자체가 없다.
4. ⚠️ 표시된 3곳(C9 effect 순서, JSX 1:1, 메타 값·순서)이 사람 실수가 가능한 전부이며, 각각 §3 계약·§7.2 체크리스트·R14 검수가 방어한다.
