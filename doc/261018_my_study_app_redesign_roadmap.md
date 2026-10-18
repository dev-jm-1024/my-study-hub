# my-study-app Apple 스타일 리디자인 — 로드맵

- **작성일:** 2026-10-18 · **근거:** [실행 계획서](./261018_my_study_app_redesign_plan.md) (규칙·토큰·동작 명세·에이전트 구성) · **준비 기록·인수인계·새 세션 프롬프트:** [261018 준비 기록](./261018_my_study_app_redesign_prep_log.md)
- **디자인 정본:** https://claude.ai/artifact/KRGAtS74ioPBUPmT6UZnsL · 사본 [`261018_redesign_mockups/`](./261018_redesign_mockups/)
- **목적:** 디자인 수정 순서를 챕터(Ch0~Ch9)로 나누고, 챕터마다 **목표 → 작업(담당 에이전트·모델·묶음·소유 파일) → 완료 판정**을 둔다. 세션이 끊겨도 "현재 위치"로 이어간다.
- **사용 규칙:**
  1. 진행은 리드 플레이북(`.claude/skills/redesign/SKILL.md`)을 따른다. **챕터 1개 = 터미널 세션 1개 = 에이전트 팀 1개** — IntelliJ 터미널에서 `./scripts/redesign-lead.sh <챕터>`.
  2. 작업이 끝나면 `[ ]`→`[x]`, 맨 위 "현재 위치"를 갱신한다(chore-runner).
  3. **같은 묶음(A, B, C…) = 동시에 실행, 다음 묶음은 앞 묶음이 끝난 뒤.** 같은 묶음 안에서 소유 파일은 겹치지 않는다.
  4. 챕터 = 1커밋. 검수 PASS + 사용자 화면 확인 뒤에 커밋한다.

> **현재 위치:** `RD-1-1` — Ch0 완료(2026-10-19), Ch1 시작 전
>
> **준비 완료(2026-10-18):** 토큰(`tokens.css`·`tokens.legacy.css`)·상수(`constants/*`)·에이전트 6종·플레이북·계획서·목업 사본 — 모두 **미연결**, 화면 변화 0

---

## 1. 범례

| 표기 | 의미 |
|---|---|
| 🙋 | 사용자 결정 — 계획서 §7의 D1~D7 |
| 🔐 | 권한 프롬프트가 뜨는 명령(커밋·브랜치 등) — 리드만 실행 |
| **O / S / H** | Opus / Sonnet / Haiku |
| 담당 | `architect`=redesign-architect(O) · `reviewer`=redesign-reviewer(O) · `ui`=ui-builder(S) · `style`=style-migrator(S) · `data`=data-wirer(S) · `chore`=chore-runner(H) · `리드`=메인 세션(O) |
| 묶음 | A → B → C 순서. 같은 글자는 병렬 |

## 2. 재개 가이드

```bash
cd /Volumes/dev/study/pdf-center
git branch --show-current                                     # feat/apple-redesign 이어야 함 (RD-0-1 이후)
git -c core.fileMode=false status --short -- my-study-app | head -30
command grep -n "현재 위치" doc/261018_my_study_app_redesign_roadmap.md
command grep -n "\[ \] | RD-" doc/261018_my_study_app_redesign_roadmap.md | head -5   # 다음 미완료 작업
```
→ 새 터미널에서 `./scripts/redesign-lead.sh` (또는 `./scripts/redesign-lead.sh <챕터>`). 리드가 위 상태로 다음 미완료 작업부터 팀을 새로 꾸려 잇는다.
- 세션이 끊겼다면 `/resume`하지 말고 새로 연다 — 에이전트 팀원은 `/resume`으로 복구되지 않는다. 끝난 RD는 체크돼 있으니 다시 하지 않는다.

## 3. 챕터 한눈에

| Ch | 이름 | 목표 한 줄 | 주 담당 | 앞 챕터 | 호출 예상 |
|---|---|---|---|---|---|
| 0 | 준비 | 화면은 그대로, 토큰·상수만 연결 | chore·data | — | O1 S1 H2 |
| 1 | 기반 전환 | 전 페이지가 새 색·글꼴·다크 값으로 | style·architect | 0 | O2 S1 H2 |
| 2 | 글로벌 내비·드롭다운 | 블러 바 + 4개 메뉴 플라이아웃 + 바깥 블러 | architect·ui | 1 | O2 S3 H1 |
| 3 | 홈 상단 | 한 줄 히어로·숫자 스트립·좌우 레일 제거 | ui·architect | 2 | O2 S2 H1 |
| 4 | 홈 중단 | 대표 타일 2 + 문서 비중 + 무한 셸프 | architect·data·ui | 3 | O2 S4 H1 |
| 5 | 홈 하단 | 주제 그리드(줄 맞춤)·위젯·책/GitHub·푸터 | ui | 4 | O1 S5 H1 |
| 6 | 자료실 (데스크톱) | 사이드바 패널·세그먼트·페이징·미리보기 시트 | architect·ui | 1 (2 권장) | O2 S3 H1 |
| 7 | 모바일 | 734/1068 스케일·사이드 메뉴·햄버거·경계 통합 | architect·ui·style | 2·4·6 | O2 S3 H1 |
| 8 | 보조 페이지 | Books·GitHub·Vibe·404·⌘K | ui | 1 | O1 S3 H1 |
| 9 | 마감 | 다크·접근성 전수, 레거시 제거, 기록, 병합 | reviewer·chore | 전부 | O2 S1 H3 |

- 기본은 순서대로. 사람 손이 남으면 **Ch6·Ch8은 Ch2 뒤 아무 때나** 병행할 수 있다(홈 파일과 겹치지 않음).
- "호출 예상"은 하위 에이전트 호출 수(재위임 제외). 리드(메인 세션) 비용은 별도.

---

## Ch0 준비 — 화면은 그대로, 토대만 연결

**목표**
1. 리디자인 전용 브랜치에서 시작하고, 지금의 미커밋 작업과 섞이지 않게 한다.
2. `tokens.css`와 `constants/*`를 앱에 연결한다 — **화면 변화 0**.
3. 하드코딩 값의 기준선을 잰다(이후 챕터 진척의 척도, 부록 A).

| | ID | 작업 | 담당 | 묶음 | 소유 파일 |
|---|---|---|---|---|---|
| [x] | RD-0-1 | 🙋 D1 미커밋 작업 처리 → 🔐 `git checkout -b feat/apple-redesign` | 리드 | — | — |
| [x] | RD-0-2 | 감사 3종(리터럴 색·옛 변수·@media 경계) 기준선 → 부록 A | chore | A | 이 문서 부록 A |
| [x] | RD-0-3 | `index.css`: `variables.css` import 바로 다음 줄에 `@import './styles/tokens.css';` | chore | A | `src/index.css` |
| [x] | RD-0-4 | 상수 연결 — `data/topics.ts`의 `DOWNLOAD_PAGE_SIZE`를 `constants/ui` re-export로 / Navbar `NAV_LINKS`·Footer·ProfileCard의 외부 주소를 `LINKS`·`SOCIAL_LINKS`로 | data | A | `src/data/topics.ts`, `src/components/{Navbar,Footer,ProfileCard}.tsx` |
| [x] | RD-0-5 | 검수 — 화면 변화 0 (빌드 CSS에 토큰 블록만 늘었는지) | reviewer | B | — |

**완료 판정**
```bash
cd my-study-app && npm run build
command grep -rnE "velog\.io|blog\.naver\.com/jon1024['\"]" src --include='*.tsx'   # 0건
command grep -rn "DOWNLOAD_PAGE_SIZE = " src                                           # constants/ui.ts 한 곳
```

---

## Ch1 기반 전환 — 한 번에 새 옷 입히기

**목표**
1. 크림·브라운 팔레트를 뉴트럴 그레이 + 애플 블루로 **전 페이지 한 번에** 바꾼다(호환 레이어).
2. 기본 글꼴(SF → Pretendard 폴백), 본문 17px/1.5, 자간 −0.01em, 한글 `keep-all`.
3. 다크 모드가 새 다크 값을 따르고, 형광펜·주제 색조 같은 예외도 어색하지 않다.
4. 레이아웃·구조는 그대로 둔다(구조 변경은 Ch2부터).

| | ID | 작업 | 담당 | 묶음 | 소유 파일 |
|---|---|---|---|---|---|
| [ ] | RD-1-1 | `index.css`: `tokens.css` 다음 줄에 `@import './styles/tokens.legacy.css';` | chore | A | `src/index.css` |
| [ ] | RD-1-2 | `base.css`: body 글꼴·배경(패턴 제거)·크기·자간·`keep-all`·`::selection`을 토큰으로 | style | A | `src/styles/base.css` |
| [ ] | RD-1-3 | 다크·예외 점검 — `home-intro.css` 형광펜(`--hl` 지역 변수), `home-sections.css`의 `.t-*` 색조(color-mix) 대비, 앱 CSS에 남은 크림 리터럴 | architect | B | `src/styles/home-intro.css`, `src/styles/home-sections.css`(`.t-*` 블록만) |
| [ ] | RD-1-4 | 감사 재측정 → 부록 A | chore | C | 이 문서 부록 A |
| [ ] | RD-1-5 | 검수 (글자 대비 포함) | reviewer | C | — |
| [ ] | RD-1-6 | 🙋 D2 화면 확인 — 홈·자료실·Books, 1440/390, 라이트/다크 | 사용자 | D | — |

**완료 판정**
```bash
cd my-study-app && npm run build
command grep -rniE '#(F7F3EA|FAF8F4|EFE8D9|E7DECE|EDE4D3|2B2522|8E7A70|B89F8A|5E4C41)\b' src   # 0건
```
- 되돌리기: `tokens.legacy.css` import 한 줄 삭제로 원복된다(계획서 R1).

---

## Ch2 글로벌 내비·드롭다운

**목표**
1. 52px 반투명 블러 바 — 로고 · 메뉴 4(자료실·Books·GitHub·Vibe) · Velog/Blog · 검색 · 테마.
2. 메뉴마다 **축약형** 드롭다운(목업 `NavPanel.dc.html`): 큰 글씨 첫 열 + 작은 목록 1~2열. 과목은 아이콘 없이 글자만.
3. 열리면 바깥이 블러 + 흐림, 닫힘 = 헤더 이탈·바깥 클릭·Esc·라우트 이동(계획서 4.1).
4. 메뉴 내용은 데이터 + `constants/navigation.ts` 규칙으로 **자동 생성** — 과목·책이 늘어도 손댈 필요 없다.
5. ≤734px은 기존 햄버거 유지, 드롭다운 없음(개편은 Ch7).

| | ID | 작업 | 담당 | 묶음 | 소유 파일 |
|---|---|---|---|---|---|
| [ ] | RD-2-0 | 🙋 D5 Books 태그 바로가기(`/books?tag=`) 도입 여부 | 리드 | — | — |
| [ ] | RD-2-1 | `buildNavMenus()` — 네 규칙 적용, D5 결과에 맞춘 Books 링크 | data | A | `src/utils/navMenus.ts` |
| [ ] | RD-2-2 | `useNavMenu` 훅 — 계획서 4.1 표 전부(지연·Esc·라우트·포커스·터치·reduced-motion) | architect | A | `src/hooks/useNavMenu.ts`, `src/constants/ui.ts` |
| [ ] | RD-2-3 | `Navbar` 재작성 + `NavPanel`(열 렌더) + 바깥 덮개 + `navbar.css` 토큰화 | ui | B | `src/components/Navbar.tsx`, `src/components/NavPanel.tsx`(신규), `src/styles/navbar.css` |
| [ ] | RD-2-4 | `--header-height` 사용처 → `--bar-h` (navbar.css 제외) | style | B | `src/styles/{layout,responsive,download-page,view-transition,command-palette}.css` 중 사용처 |
| [ ] | RD-2-5 | 빌드·감사 | chore | C | — |
| [ ] | RD-2-6 | 검수 | reviewer | C | — |
| [ ] | RD-2-7 | 🙋 D2 화면 확인 — 메뉴 4개 열기/전환/닫기, 다크 | 사용자 | D | — |

**완료 판정**
- 메뉴 위 0.12초 → 열림 / 옆 메뉴로 즉시 전환 / 헤더 밖 0.2초 → 닫힘 / Esc·바깥 클릭·이동 → 닫힘
- Tab으로 메뉴 버튼 → Enter로 열림, `aria-expanded` 갱신
- 열 구성이 `NavPanel.dc.html`과 같다(자료실: 큰 글씨 = 문서 수 상위 3, '그 외 N개 주제')
- `npm run build` 통과

---

## Ch3 홈 상단 — 히어로·숫자·레일 정리

**목표**
1. "백엔드 학습 기록, 한곳에." **한 줄** 헤드라인 + NEW 알약(최신 자료실, 데이터) + CTA 2개 + 검색창(기존 검색 동작 유지).
2. 숫자 스트립 4칸(주제·문서·추천 도서·실습 레포), 카운트업 유지.
3. 좌우 레일(프로필·스택 비율·시계·달력)을 빼고 `--container`(1080px) 단일 컬럼으로.
4. 진입 연출(배지가 '한곳에'로 모임)을 한 줄 제목·새 아이콘 규격에 맞춘다(D3).

| | ID | 작업 | 담당 | 묶음 | 소유 파일 |
|---|---|---|---|---|---|
| [ ] | RD-3-0 | 🙋 D3 진입 연출 유지 여부 | 리드 | — | — |
| [ ] | RD-3-1 | `HeroIntro` 호환 — 한 줄 제목에서 모임 위치, 배지 모양(아이콘 규격), reduced-motion | architect | A | `src/components/HeroIntro.tsx`, `src/styles/home-intro.css` |
| [ ] | RD-3-2 | 히어로·숫자 스트립 마크업, 레일 사용 제거(컴포넌트 파일은 남김 — 정리는 Ch5) | ui | A | `src/pages/HomePage.tsx`, `src/styles/home-hero.css` |
| [ ] | RD-3-3 | 홈 3열 레이아웃 → 단일 컬럼 CSS | style | A | `src/styles/home-rails.css`(레이아웃 블록), `src/styles/responsive.css`(`.home-*` 블록) |
| [ ] | RD-3-4 | 빌드·감사 | chore | B | — |
| [ ] | RD-3-5 | 검수 | reviewer | B | — |
| [ ] | RD-3-6 | 🙋 D2 화면 확인 | 사용자 | C | — |

**완료 판정**
- 1440px에서 제목 한 줄, 390px에서 자연 줄바꿈(`keep-all`)
- 검색 입력 → 결과 목록 동작 그대로, 숫자 카운트업 동작
- 홈에 좌우 레일 없음, `npm run build` 통과

---

## Ch4 홈 중단 — 대표 자료실·문서 비중·최근 문서

**목표**
1. **문서 수 상위 2개** 타일(자동 선정, 1위 반전 타일) + 그 아래 **두 칸 차지** 문서 비중 타일(막대 + 범례, 제목 없음).
2. 최근 올라온 문서 셸프 — 4초 자동 넘김·**무한 반복**·일시정지 버튼·마우스/터치 시 멈춤·점 표시·양쪽 페이드+블러(계획서 4.2).
3. '최근'과 NEW 판단의 근거 데이터 `addedAt`을 도입한다(git 이력 근거, 추정 금지).

| | ID | 작업 | 담당 | 묶음 | 소유 파일 |
|---|---|---|---|---|---|
| [ ] | RD-4-1 | `PdfItem.addedAt?` 추가 + git 이력으로 채우기(문서별 근거 해시 보고, 못 찾으면 비움) | data | A | `src/types/index.ts`, `src/data/pdfs.ts` |
| [ ] | RD-4-2 | `useInfiniteCarousel` 훅 | architect | A | `src/hooks/useInfiniteCarousel.ts`, `src/constants/ui.ts` |
| [ ] | RD-4-3 | 선택자 `topTopics`·`docShare`·`latestDocs`·`isNewTopic` | data | B | `src/utils/home.ts` |
| [ ] | RD-4-4 | `FeaturedSection` (대표 타일 2 + 문서 비중) | ui | C | `src/components/home/FeaturedSection.tsx`(신규), `src/styles/home-featured.css`(신규) |
| [ ] | RD-4-5 | `LatestShelf` (훅 사용, 페이드·점·버튼) | ui | C | `src/components/home/LatestShelf.tsx`(신규), `src/styles/home-latest.css`(신규) |
| [ ] | RD-4-6 | `HomePage` 연결 — 기존 '바로가기' 자리를 두 섹션으로 교체, CSS import | ui | D | `src/pages/HomePage.tsx`, `src/index.css` |
| [ ] | RD-4-7 | 빌드·감사 | chore | E | — |
| [ ] | RD-4-8 | 검수 | reviewer | E | — |
| [ ] | RD-4-9 | 🙋 D2 화면 확인 — 셸프 10칸 이상 넘겨 튐 없는지 | 사용자 | F | — |

**완료 판정**
- `MENU_DATA` 키 순서를 바꿔도 대표 타일 결과가 같다(문서 수 기준)
- 셸프: 끝에서 처음으로 끊김 없음, 점이 현재 카드와 일치, '동작 줄이기'에서 자동 넘김 꺼짐
- 복제 카드는 스크린 리더·Tab에서 빠짐(`aria-hidden`, `tabIndex=-1`)
- `addedAt` 근거 없는 문서 수가 보고됨, `npm run build` 통과

---

## Ch5 홈 하단 — 주제 목록·기록하는 사람·책/GitHub·푸터

**목표**
1. 주제별 인셋 그룹 리스트(아이콘 M, 64px 행, 인셋 구분선). **같은 줄 그룹은 시작·끝선이 항상 같다**(grid + stretch).
2. "기록하는 사람" — 프로필 위젯 + 달력 위젯(문서 올린 날 점 = `addedAt`, **날짜 아래**).
3. 시계·스택 비율 위젯 정리(D4).
4. 책·GitHub 카드, 새 푸터(`SOCIAL_LINKS`).
5. 주제 행 → 자료실 헤더 화면 전환 연출 유지.

| | ID | 작업 | 담당 | 묶음 | 소유 파일 |
|---|---|---|---|---|---|
| [ ] | RD-5-0 | 🙋 D4 시계·스택 비율 삭제 여부 | 리드 | — | — |
| [ ] | RD-5-1 | `TopicGroups` + `CategoryRow` 새 규격 (`.cat-badge/.cat-title/.cat-count` 유지) | ui | A | `src/components/CategoryRow.tsx`, `src/components/home/TopicGroups.tsx`(신규), `src/styles/home-sections.css` |
| [ ] | RD-5-2 | 프로필·달력 위젯 개편 (`uploadDays` prop) | ui | A | `src/components/ProfileCard.tsx`, `src/components/MiniCalendar.tsx`, `src/styles/home-rails.css` |
| [ ] | RD-5-3 | 선택자 `uploadDaysInMonth` | data | A | `src/utils/home.ts` |
| [ ] | RD-5-4 | 책·GitHub 카드 + 푸터 | ui | A | `src/components/home/MoreSection.tsx`(신규), `src/components/Footer.tsx`, `src/styles/footer-misc.css` |
| [ ] | RD-5-5 | `HomePage` 연결 + D4에 따라 안 쓰게 된 import 제거 | ui | B | `src/pages/HomePage.tsx`, `src/index.css` |
| [ ] | RD-5-6 | 빌드·감사 + D4 '삭제'면 사용처 0건 확인 후 `Clock.tsx`·`StackRatio.tsx` 삭제 | chore | C | 해당 파일 |
| [ ] | RD-5-7 | 검수 | reviewer | C | — |
| [ ] | RD-5-8 | 🙋 D2 화면 확인 | 사용자 | D | — |

**완료 판정**
- 항목 수가 다른 두 그룹(예: 데이터베이스 3 / 인프라 5)의 카드 아래 끝이 같다
- 달력 11일 **아래** 점, 다른 날은 점 자리만(줄 높이 일정)
- 주제 행 클릭 → 자료실 헤더로 이어지는 전환 동작, `npm run build` 통과

---

## Ch6 자료실 (데스크톱)

**목표**
1. 사이드바: macOS 설정창식 **분리 패널**(`--sidebar`, 최대 320px, sticky) — 프로필 줄·검색·그룹별 행, 선택 과목 = **애플 블루 채움 + 흰 글자**.
2. 본문 최대 760px — 브레드크럼·헤더(아이콘 L)·소개·공지.
3. 소분류 세그먼트 컨트롤, 문서 행(번호 칸·미리보기·받기 알약).
4. **페이지당 N개** — '전체'·소분류 공통, 소분류가 넘어가면 "앞 페이지에서 이어짐", 페이저(원 32px·터치 44px·간격 20px) (계획서 4.3).
5. 미리보기 시트 새 디자인 + 기존 열기/닫기 전환 유지.

| | ID | 작업 | 담당 | 묶음 | 소유 파일 |
|---|---|---|---|---|---|
| [ ] | RD-6-1 | `paginateSections` + `usePagination` 정리 | architect | A | `src/utils/paginateSections.ts`(신규), `src/hooks/usePagination.ts` |
| [ ] | RD-6-2 | `Sidebar` → 분리 패널 (`--sidebar-width`→`--sidebar-w`) | ui | A | `src/components/Sidebar.tsx`, `src/styles/download-page.css` |
| [ ] | RD-6-3 | `PdfPreview` → 시트 (sheet-open/close 전환 이름 유지) | ui | A | `src/components/PdfPreview.tsx`, `src/styles/pdf-preview.css` |
| [ ] | RD-6-4 | `DownloadPage` — 헤더·공지·세그먼트·문서 행·페이저 | ui | B | `src/pages/DownloadPage.tsx`, `src/styles/doc-list.css` |
| [ ] | RD-6-5 | 빌드·감사 | chore | C | — |
| [ ] | RD-6-6 | 검수 | reviewer | C | — |
| [ ] | RD-6-7 | 🙋 D2 화면 확인 — Java·Spring·Kotlin, 라이트/다크 | 사용자 | D | — |

**완료 판정**
- Java '전체' 3페이지(10/10/5), 2페이지에 "앞 페이지에서 이어짐" / Modern Java 탭 2페이지 / Kotlin 탭·페이저 없음
- 다른 과목 클릭 → 파란 선택 이동 + 1페이지로
- 미리보기 열기·닫기 전환 동작, `npm run build` 통과

---

## Ch7 모바일

**목표**
1. ≤734px 타입·레이아웃 스케일(토큰 `@media`)이 전 화면에 먹는다.
2. 자료실 **사이드 메뉴** — 본문 위 "주제 전환" 버튼 → 왼쪽에서 밀려 나오는 패널(데스크톱 사이드바와 같은 모양), 뒤 흐림, ✕·바깥·Esc·과목 선택 시 닫힘, 포커스 가두기·스크롤 잠금(계획서 4.4). ≤1068px부터 적용.
3. 홈: 셸프 화면 끝까지 + 40px 페이드, 대표 타일 2열, 숫자 2×2.
4. 상단 바: ≤734px 햄버거 메뉴를 새 토큰·`NAV_ITEMS`·`SOCIAL_LINKS`로.
5. 반응형 경계 7종(380~1100) → **2종(734·1068)**.

| | ID | 작업 | 담당 | 묶음 | 소유 파일 |
|---|---|---|---|---|---|
| [ ] | RD-7-1 | `useDrawer` 훅 (포커스 가두기·되돌리기, 스크롤 잠금, Esc) | architect | A | `src/hooks/useDrawer.ts`(신규) |
| [ ] | RD-7-2 | Navbar 모바일 메뉴 | ui | A | `src/components/Navbar.tsx`(모바일 부분), `src/styles/navbar.css` |
| [ ] | RD-7-3 | 자료실 사이드 메뉴 — `Sidebar` 드로어 모드, 토글 버튼 교체 | ui | B | `src/components/Sidebar.tsx`, `src/pages/DownloadPage.tsx`(토글 부분), `src/styles/download-page.css` |
| [ ] | RD-7-4 | `responsive.css` 재작성(경계 통합, `.sidebar` 오버레이 규칙 삭제) + 홈 모바일 블록 | style | B | `src/styles/responsive.css`, `src/styles/home-*.css`(모바일 블록) |
| [ ] | RD-7-5 | 빌드·감사 — @media 경계 2종 확인 | chore | C | — |
| [ ] | RD-7-6 | 검수 | reviewer | C | — |
| [ ] | RD-7-7 | 🙋 D2 화면 확인 — 390px 홈·자료실(메뉴 열고 닫기)·다크 | 사용자 | D | — |

**완료 판정**
```bash
command grep -rhoE '@media \([^)]*width[^)]*\)' my-study-app/src/styles | sort -u   # max-width: 734px / 1068px 계열만
```
- 사이드 메뉴 열림 시 Tab이 패널 밖으로 안 나감, 닫으면 버튼으로 포커스 복귀, 배경 스크롤 안 됨

---

## Ch8 보조 페이지

**목표**
1. Books — 표지 그리드 + 태그 세그먼트 필터 + 구매 알약(D5면 `?tag=` 읽기).
2. GitHub — 레포 카드(언어 점·설명).
3. Vibe — 프로젝트 카드(macOS 앱/웹 구분·설명 2줄·기술 칩·Made with).
4. 404·커맨드 팔레트(⌘K)를 새 토큰·컴포넌트로.

| | ID | 작업 | 담당 | 묶음 | 소유 파일 |
|---|---|---|---|---|---|
| [ ] | RD-8-1 | `BooksPage` | ui | A | `src/pages/BooksPage.tsx`, `src/styles/books.css` |
| [ ] | RD-8-2 | `GitHubPage`·`VibeCodingPage` | ui | A | `src/pages/{GitHubPage,VibeCodingPage}.tsx`, `src/styles/vibe.css` |
| [ ] | RD-8-3 | `NotFoundPage`·`CommandPalette` | ui | A | `src/pages/NotFoundPage.tsx`, `src/components/CommandPalette.tsx`, `src/styles/command-palette.css` |
| [ ] | RD-8-4 | 빌드·감사 | chore | B | — |
| [ ] | RD-8-5 | 검수 | reviewer | B | — |
| [ ] | RD-8-6 | 🙋 D2 화면 확인 | 사용자 | C | — |

**완료 판정**
- 세 페이지와 ⌘K가 새 토큰만 사용(해당 CSS 리터럴 색 0, 주제 색 제외), `npm run build` 통과

---

## Ch9 마감

**목표**
1. 다크 모드 전 화면 점검·수정.
2. 접근성 전수 — 대비·포커스 링·44px·키보드·`prefers-reduced-motion`.
3. 레거시 제거 — 정적 사이트 CSS import(D6), `tokens.legacy.css`, 사용처 0건 CSS·컴포넌트.
4. 감사 목표 달성: 리터럴 색 0(주제 색·토큰 파일 제외) / 옛 변수 0 / @media 2종.
5. 작업 기록 문서 + 인수인계 갱신(문서 추가 절차에 `addedAt`), 🙋 병합·push.

| | ID | 작업 | 담당 | 묶음 | 소유 파일 |
|---|---|---|---|---|---|
| [ ] | RD-9-1 | 전수 검수(다크·접근성·성능: 블러 겹침) → FIX 목록 | reviewer | A | — |
| [ ] | RD-9-2 | FIX 처리 (목록의 담당별) | ui·style·data | B | FIX 목록대로 |
| [ ] | RD-9-3 | 🙋 D6 → reset만 앱으로 옮기고 정적 CSS import 제거, `tokens.legacy.css` 제거, 사용처 0건 정리 | chore | C | `src/index.css`, `src/styles/reset.css`(신규) 등 |
| [ ] | RD-9-4 | 최종 감사·빌드 → 부록 A | chore | D | 이 문서 부록 A |
| [ ] | RD-9-5 | 기록 문서 `doc/2610xx_my_study_app_redesign_log.md` + 인수인계 갱신 | 리드 | D | 문서 |
| [ ] | RD-9-6 | 🙋 D7 → 🔐 main 병합·push (= 배포) | 리드 | E | — |

**완료 판정**
- 부록 A 마지막 줄이 목표값(0 / 0 / 2종), `npm run build` 통과, 리뷰어 PASS, 사용자 승인

---

## 부록 A. 감사 기록 (chore-runner가 채움)

| 시점 | 리터럴 색 (src/styles 합계) | 옛 변수 사용 수 | @media 경계 종류 | 비고 |
|---|---|---|---|---|
| Ch0 기준선 (RD-0-2) | 12 | 384 | 12종 | 2026-10-19 · 토큰 파일 포함 시 리터럴 색 64 · 옛 변수 legacy 파일 히트 제외 0 · max-width:480px ×4, max-width:560px ×3, max-width:768px ×2, min-width:1101px ×2, prefers-reduced-motion ×2 · @media 12종은 tokens.css의 734px 포함(리터럴 색은 토큰 파일 제외 — 기준 다름) |
| Ch1 후 (RD-1-4) | | | | |
| Ch2 후 | | | | |
| Ch3 후 | | | | |
| Ch4 후 | | | | |
| Ch5 후 | | | | |
| Ch6 후 | | | | |
| Ch7 후 | | | 2 목표 | |
| Ch8 후 | | | | |
| **Ch9 목표** | **0** (주제 색 제외) | **0** | **2** | |

## 부록 B. 커밋 기록

| Ch | 커밋 | 날짜 | 메모 |
|---|---|---|---|
| 0 | | 2026-10-19 | 토큰·상수 연결, 화면 변화 0 · 예외: tokens.css color-scheme로 다크 모드 스크롤바(.sidebar·.cmdk-list)·포커스 링이 시스템 다크 스타일(의도, 사용자 승인) |
| 1 | | | |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |
| 6 | | | |
| 7 | | | |
| 8 | | | |
| 9 | | | 병합 커밋 |
