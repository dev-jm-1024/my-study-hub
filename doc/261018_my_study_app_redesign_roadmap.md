# my-study-app Apple 스타일 리디자인 — 로드맵

- **작성일:** 2026-10-18 · **근거:** [실행 계획서](./261018_my_study_app_redesign_plan.md) (규칙·토큰·동작 명세·에이전트 구성) · **준비 기록·인수인계·새 세션 프롬프트:** [261018 준비 기록](./261018_my_study_app_redesign_prep_log.md)
- **디자인 정본:** https://claude.ai/artifact/KRGAtS74ioPBUPmT6UZnsL · 사본 [`261018_redesign_mockups/`](./261018_redesign_mockups/)
- **목적:** 디자인 수정 순서를 챕터(Ch0~Ch9)로 나누고, 챕터마다 **목표 → 작업(담당 에이전트·모델·묶음·소유 파일) → 완료 판정**을 둔다. 세션이 끊겨도 "현재 위치"로 이어간다.
- **사용 규칙:**
  1. 진행은 리드 플레이북(`.claude/skills/redesign/SKILL.md`)을 따른다. **챕터 1개 = 터미널 세션 1개 = 에이전트 팀 1개** — IntelliJ 터미널에서 `./scripts/redesign-lead.sh <챕터>`.
  2. 작업이 끝나면 `[ ]`→`[x]`, 맨 위 "현재 위치"를 갱신한다(chore-runner).
  3. **같은 묶음(A, B, C…) = 동시에 실행, 다음 묶음은 앞 묶음이 끝난 뒤.** 같은 묶음 안에서 소유 파일은 겹치지 않는다.
  4. 챕터 = 1커밋. 검수 PASS + 사용자 화면 확인 뒤에 커밋한다.

> **현재 위치:** `RD-8-1` — Ch7 완료(2026-10-20), Ch8 시작 전 · Ch8 착수 전에 Ch8 섹션의 "Ch6에서 넘어온 것"·"Ch7에서 넘어온 것" 먼저 읽기
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
| [x] | RD-1-1 | `index.css`: `tokens.css` 다음 줄에 `@import './styles/tokens.legacy.css';` | chore | A | `src/index.css` |
| [x] | RD-1-2 | `base.css`: body 글꼴·배경(패턴 제거)·크기·자간·`keep-all`·`::selection`을 토큰으로 | style | A | `src/styles/base.css` |
| [x] | RD-1-3 | 다크·예외 점검 — `home-intro.css` 형광펜(`--hl` 지역 변수), `home-sections.css`의 `.t-*` 색조(color-mix) 대비, 앱 CSS에 남은 크림 리터럴 | architect | B | `src/styles/home-intro.css`, `src/styles/home-sections.css`(`.t-*` 블록만) |
| [x] | RD-1-3b | 대비 미달 8건 수정(RD-1-3 점검 목록 12~19번 — 비율·hover 필터) · 리드 추가 | style | B′ | `src/styles/{home-sections,doc-list,home-rails}.css` 해당 규칙 |
| [x] | RD-1-4 | 감사 재측정 → 부록 A | chore | C | 이 문서 부록 A |
| [x] | RD-1-5 | 검수 (글자 대비 포함) | reviewer | C | — |
| [x] | RD-1-6 | 🙋 D2 화면 확인 — 홈·자료실·Books, 1440/390, 라이트/다크 | 사용자 | D | — |

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
| [x] | RD-2-0 | 🙋 D5 Books 태그 바로가기(`/books?tag=`) 도입 여부 | 리드 | — | — |
| [x] | RD-2-1 | `buildNavMenus()` — 네 규칙 적용, D5 결과에 맞춘 Books 링크 | data | A | `src/utils/navMenus.ts` |
| [x] | RD-2-2 | `useNavMenu` 훅 — 계획서 4.1 표 전부(지연·Esc·라우트·포커스·터치·reduced-motion) | architect | A | `src/hooks/useNavMenu.ts`, `src/constants/ui.ts` |
| [x] | RD-2-3 | `Navbar` 재작성 + `NavPanel`(열 렌더) + 바깥 덮개 + `navbar.css` 토큰화 | ui | B | `src/components/Navbar.tsx`, `src/components/NavPanel.tsx`(신규), `src/styles/navbar.css` |
| [x] | RD-2-4 | `--header-height` 사용처 → `--bar-h` (navbar.css 제외) | style | B | `src/styles/{layout,responsive,download-page,view-transition,command-palette}.css` 중 사용처 |
| [x] | RD-2-5 | 빌드·감사 | chore | C | — |
| [x] | RD-2-6 | 검수 | reviewer | C | — |
| [x] | RD-2-7 | 🙋 D2 화면 확인 — 메뉴 4개 열기/전환/닫기, 다크 | 사용자 | D | — |

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
| [x] | RD-3-0 | 🙋 D3 진입 연출 유지 여부 | 리드 | — | — |
| [x] | RD-3-1 | `HeroIntro` 호환 — 한 줄 제목에서 모임 위치, 배지 모양(아이콘 규격), reduced-motion | architect | A | `src/components/HeroIntro.tsx`, `src/styles/home-intro.css` |
| [x] | RD-3-2 | 히어로·숫자 스트립 마크업, 레일 사용 제거(컴포넌트 파일은 남김 — 정리는 Ch5) | ui | A | `src/pages/HomePage.tsx`, `src/styles/home-hero.css` |
| [x] | RD-3-3 | 홈 3열 레이아웃 → 단일 컬럼 CSS | style | A | `src/styles/home-rails.css`(레이아웃 블록), `src/styles/responsive.css`(`.home-*` 블록) |
| [x] | RD-3-4 | 빌드·감사 | chore | B | — |
| [x] | RD-3-5 | 검수 | reviewer | B | — |
| [x] | RD-3-6 | 🙋 D2 화면 확인 | 사용자 | C | — |

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
| [x] | RD-4-1 | `PdfItem.addedAt?` 추가 + git 이력으로 채우기(문서별 근거 해시 보고, 못 찾으면 비움) | data | A | `src/types/index.ts`, `src/data/pdfs.ts` |
| [x] | RD-4-2 | `useInfiniteCarousel` 훅 | architect | A | `src/hooks/useInfiniteCarousel.ts`, `src/constants/ui.ts` |
| [x] | RD-4-3 | 선택자 `topTopics`·`docShare`·`latestDocs`·`isNewTopic` | data | B | `src/utils/home.ts` |
| [x] | RD-4-4 | `FeaturedSection` (대표 타일 2 + 문서 비중) | ui | C | `src/components/home/FeaturedSection.tsx`(신규), `src/styles/home-featured.css`(신규) |
| [x] | RD-4-5 | `LatestShelf` (훅 사용, 페이드·점·버튼) | ui | C | `src/components/home/LatestShelf.tsx`(신규), `src/styles/home-latest.css`(신규) |
| [x] | RD-4-6 | `HomePage` 연결 — 기존 '바로가기' 자리를 두 섹션으로 교체, CSS import | ui | D | `src/pages/HomePage.tsx`, `src/index.css` |
| [x] | RD-4-7 | 빌드·감사 | chore | E | — |
| [x] | RD-4-8 | 검수 | reviewer | E | — |
| [x] | RD-4-9 | 🙋 D2 화면 확인 — 셸프 10칸 이상 넘겨 튐 없는지 | 사용자 | F | — |

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
| [x] | RD-5-0 | 🙋 D4 시계·스택 비율 삭제 여부 | 리드 | — | — |
| [x] | RD-5-1 | `TopicGroups` + `CategoryRow` 새 규격 (`.cat-badge/.cat-title/.cat-count` 유지) | ui | A | `src/components/CategoryRow.tsx`, `src/components/home/TopicGroups.tsx`(신규), `src/styles/home-sections.css` |
| [x] | RD-5-2 | 프로필·달력 위젯 개편 (`uploadDays` prop) | ui | A | `src/components/ProfileCard.tsx`, `src/components/MiniCalendar.tsx`, `src/components/home/AboutSection.tsx`(신규), `src/styles/home-about.css`(신규), `src/styles/home-layout.css`(home-rails.css에서 이름 변경) |
| [x] | RD-5-3 | 선택자 `uploadDaysInMonth` | data | A | `src/utils/home.ts` |
| [x] | RD-5-4 | 책·GitHub 카드 + 푸터 | ui | A | `src/components/home/MoreSection.tsx`(신규), `src/components/Footer.tsx`, `src/styles/footer-misc.css` |
| [x] | RD-5-5 | `HomePage` 연결 + D4에 따라 안 쓰게 된 import 제거 | ui | B | `src/pages/HomePage.tsx`, `src/index.css` |
| [x] | RD-5-6 | 빌드·감사 + D4 '삭제'면 사용처 0건 확인 후 `Clock.tsx`·`StackRatio.tsx` 삭제 | chore | C | 해당 파일 |
| [x] | RD-5-7 | 검수 | reviewer | C | — |
| [x] | RD-5-8 | 🙋 D2 화면 확인 | 사용자 | D | — |
| [x] | RD-5-9 | (D2 사용자 요청) 최근 문서 셸프 연속 흐름 — rAF 서브픽셀 흐름 32px/s · 멈춤·재개 500ms 감속/가속 · 스냅 없음 · 화면 밖 정지 · 셸프 안 포커스 중 이음매 보정 쉼 + 셸프 카드 배지 제거 | architect | E | `src/hooks/useInfiniteCarousel.ts`, `src/constants/ui.ts`, `src/components/home/LatestShelf.tsx`, `src/styles/home-latest.css` |
| [x] | RD-5-10 | (D2 사용자 요청) 주제 행 hover 하이라이트가 행 사이를 미끄러지듯 이동(카드마다 `.topic-glide` 하나) + 주제 목록·대표 타일 배지 제거(히어로 군무 배지는 유지, 주제 색은 `topicStyle`로 통일) | ui | E | `src/components/CategoryRow.tsx`, `src/components/home/TopicGroups.tsx`, `src/styles/home-sections.css`, `src/components/home/FeaturedSection.tsx`, `src/styles/home-featured.css`, `src/data/topics.ts`, `src/components/HeroIntro.tsx` |
| [x] | RD-5-11 | (D2 사용자 요청) 달력 범례에 '매주 일요일에 올리는 것이 목표예요' + Velog 버튼 브랜드 색(simple-icons `siVelog.hex` → `--brand`, 글자 `--inv-surface`) | ui | E | `src/components/home/AboutSection.tsx`, `src/components/ProfileCard.tsx`, `src/components/MiniCalendar.tsx`, `src/styles/home-about.css` |

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
| [x] | RD-6-1 | `paginateSections` + `usePagination` 정리 | architect | A | `src/utils/paginateSections.ts`(신규), `src/hooks/usePagination.ts` |
| [x] | RD-6-2 | `Sidebar` → 분리 패널 (`--sidebar-width`→`--sidebar-w`) | ui | A | `src/components/Sidebar.tsx`, `src/styles/download-page.css` |
| [x] | RD-6-3 | `PdfPreview` → 시트 (sheet-open/close 전환 이름 유지) | ui | A | `src/components/PdfPreview.tsx`, `src/styles/pdf-preview.css` |
| [x] | RD-6-4 | `DownloadPage` — 헤더·공지·세그먼트·문서 행·페이저 | ui | B | `src/pages/DownloadPage.tsx`, `src/styles/doc-list.css` |
| [x] | RD-6-5 | 빌드·감사 | chore | C | — |
| [x] | RD-6-6 | 검수 | reviewer | C | — |
| [x] | RD-6-7 | 🙋 D2 화면 확인 — Java·Spring·Kotlin, 라이트/다크 | 사용자 | D | — |
| [x] | RD-6-8 | 사용자 D2 추가 — 데스크톱 사이드바 화면 고정(fixed)·높이 고정, 자료실 푸터를 본문 열에 맞춤 | ui | D | `src/styles/download-page.css` |

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
| [x] | RD-7-1 | `useDrawer` 훅 (포커스 가두기·되돌리기, 스크롤 잠금, Esc) | architect | A | `src/hooks/useDrawer.ts`(신규) |
| [x] | RD-7-2 | Navbar 모바일 메뉴 | ui | A | `src/components/Navbar.tsx`(모바일 부분), `src/styles/navbar.css` |
| [x] | RD-7-3 | 자료실 사이드 메뉴 — `Sidebar` 드로어 모드, 토글 버튼 교체 | ui | B | `src/components/Sidebar.tsx`, `src/pages/DownloadPage.tsx`(토글 부분), `src/styles/download-page.css` |
| [x] | RD-7-4 | `responsive.css` 재작성(경계 통합, `.sidebar` 오버레이 규칙 삭제) + 홈 모바일 블록 | style | B | `src/styles/responsive.css`, `src/styles/home-*.css`(모바일 블록) |
| [x] | RD-7-5 | 빌드·감사 — @media 경계 2종 확인 | chore | C | — |
| [x] | RD-7-6 | 검수 | reviewer | C | — |
| [x] | RD-7-7 | 🙋 D2 화면 확인 — 390px 홈·자료실(메뉴 열고 닫기)·다크 | 사용자 | D | — |

**완료 판정**
```bash
command grep -rhoE '@media \([^)]*width[^)]*\)' my-study-app/src/styles | sort -u   # max-width: 734px / 1068px 계열만
```
- 사이드 메뉴 열림 시 Tab이 패널 밖으로 안 나감, 닫으면 버튼으로 포커스 복귀, 배경 스크롤 안 됨

**Ch6에서 넘어온 것**
- 스크롤 잠금: `base.css`의 `html { overflow-x: clip }` 때문에 body만 잠그면 뒤 화면이 스크롤된다 → html도 함께 잠근다(`PdfPreview.tsx`의 `useDialogBehavior` 참고). `html { scrollbar-gutter: stable }`(base.css)이 있어 잠가도 화면 폭이 그대로다(View Transition 취소 방지). CommandPalette도 같은 문제.
- `useDialogBehavior`(PdfPreview.tsx — Esc·html+body 잠금·포커스 진입/가둠/복귀)를 RD-7-1 `useDrawer`와 공용 훅으로 뽑을지 결정.
- 닫힌 서랍의 링크에 Tab 포커스가 들어간다(inert 필요). `.sidebar-mobile-toggle`에 `:focus-visible` 링·`aria-expanded`/`aria-controls` 없음.
- `.sidebar-backdrop` z-index 89·blur 2px, `responsive.css` `.sidebar` z-index 90 리터럴(토큰 `--z-drawer` 200).
- `responsive.css` `.page-wrapper` 줄의 `--spacing-*`(앱에 정의 없음), 경계 1024/768/480/380.
- 시트 ≤734px는 전체 화면(모바일 시트 목업 없음) — 390 D2에서 함께 확인.
- 데스크톱 사이드바는 ≥1025px에서 `position: fixed`(RD-6-8). 경계를 1068로 옮길 때 `download-page.css`의 `@media (min-width: 1025px)` 블록·`.download-layout::before` 자리표시·`body:has(.download-layout) .site-footer-inner` 푸터 규칙도 함께 옮긴다.

**Ch7 진행 메모 (2026-10-19, 세션 중단 — 작업 트리에 미커밋으로 남음)**
- 끝난 것: RD-7-1 `useDrawer`·`useMediaQuery`·`lockScroll`(+내부 `isTopLock` — 겹친 모달은 잠금 건 순서가 층, 맨 위만 Esc·Tab 처리) · PdfPreview·CommandPalette가 공용 훅/잠금 사용(useDialogBehavior 삭제) / RD-7-2 햄버거 / RD-7-3 자료실 서랍 / RD-7-4 경계 통합·홈 모바일 / RD-7-5 빌드·감사(부록 A) / 리드: HomePage 모바일 placeholder 짧게(`useMediaQuery`).
- 사용자 결정: 햄버거 = Apple식 전체 화면 메뉴(바 아래 `--bar-bg-open`+블러, NAV_ITEMS 24px, 구분선, SOCIAL_LINKS 3개 ↗) · Books·Vibe/GitHub·⌘K 경계도 Ch7에서 734로 · 태블릿(735~) 대표 타일 2열(최대 2열 식) · ≤734 셸프 이전·다음 숨김(일시정지만) · 대표 타일 배지 없음(Ch5 결정 유지).
- 리드 승인 구현 판단: Navbar `<Link>`+isCurrent(자료실 = '/'·'/download/*'), panelRef = header 전체, returnFocusRef = 토글(Safari) · Sidebar `open: isOpen`+media(넓어지면 닫히고 다시 좁혀도 안 열림), 서랍 모드 `div role=dialog aria-modal`(1068 경계에서 재생성), 폭 `min(--sidebar-w, 100vw − --sp-8 − --sp-2)`, `--dur-base`, ≤1068 브레드크럼 숨김, 덮개 블러 없음, 과목 선택 뒤 서랍 검색어 유지 · 셸프 `--latest-inset` 100vw→100cqw(`.home-page` container) · 가로 폰 히어로 블록(높이 조건, 폭 경계 아님).
- ~~남은 것: RD-7-6 검수~~ → 2026-10-20 세션에서 끝남(아래).
- 기록(다음 챕터로): static CSS 옛 경계(Ch9 D6), command-palette.css `.nav-search` 죽은 규칙·vibe.css `.dl-title 1.3rem`(무효)·`--spacing-*`(layout.css·footer-misc.css)(Ch8).

**Ch7 진행 메모 2 (2026-10-20, 검수 PASS 후 세션 종료 — 외장하드 분리, 여전히 미커밋)**
- RD-7-6 검수: 1차 FIX 2 → ui-builder 반영 → 재검수 **PASS**(남은 FIX 0). 서랍 하네스 45/45, 햄버거 30/30, 경계 734 ×13·1068 ×1뿐, 새 리터럴 0, `npm run build` 통과.
  - FIX-1 자료실 헤더 ≤734: 'N개 문서'가 별도 줄 오른쪽에 붙던 것(리드 의심 맞음) → 배지 | h1 + 바로 아래 'N개 문서'(callout, 숫자 600), eyebrow 숨김. `.main-content` 한정 grid, 마크업·전환 짝(`.dl-count`) 그대로.
  - FIX-2 자료실 본문 ≤734 간격·페이저(데스크톱 값 그대로였음 — 작업표에 담당 없던 부분): intro sp-4, 공지 sp-5/sp-4/gap sp-3, 목록·그룹 sp-6, 행 gap sp-3, 페이저 버튼 줄 가운데 + 아래 범위(foot).
  - FIX-3(리드 결정, 목업 정본): 세그먼트 ≤734 화면 끝까지(`--dl-pad-l/r`), 넘칠 때만 페이드 유지(화면 가장자리에서).
  - 위치: `download-page.css` ≤734 블록(:718~777). 리드: `home-featured.css:47` `--feat-min` 주석(목업 440 → 320, 태블릿 2열 결정).
- 사용자 결정: 모바일 문서 행 = Ch6 결정 유지(미리보기+받기 둘 다 글 아래 줄, 목업의 '받기'만과 다름 — 의도).
- 기록(다음 챕터로): ① `command-palette.css:32` `.cmdk-overlay` z-index 200 리터럴 — 미리보기 시트(`--z-sheet` 300) 연 채 ⌘K면 팔레트가 시트 뒤에 열림(Ch7 전부터, 회귀 아님) → RD-8-3에서 `calc(var(--z-sheet) + 1)` 또는 토큰 ② `.doc-pager-btns` 줄바꿈 없음 — 페이지 5개 이상이면 390에서 넘침(지금 최대 3) → 문서 늘면 ≤734 `flex-wrap: wrap; justify-content: center`(Ch9) ③ `utils/viewTransition.ts`가 `transition.ready` 미처리 — 전환 건너뛰면 콘솔 InvalidStateError(Ch9) ④ 시트 iframe 포커스 시 Esc 안 먹음(교차 출처, 기록만).
- ~~다음 세션 시작점 = RD-7-7 D2~~ → 2026-10-20 사용자 D2 OK, 커밋 (`./scripts/redesign-lead.sh 7`): 리드가 `cd my-study-app && npm run dev -- --host`로 띄우고 PC·iPhone 주소 안내 → 사용자가 ① `/download/java` 390 라이트(헤더·간격, '주제 전환' 서랍 ✕·덮개·과목 선택으로 닫기, iPhone Safari 포커스 복귀·배경 스크롤) ② `/` 390 다크(햄버거 열고 닫기, 셸프 페이드·대표 타일 2열·숫자 2×2) ③ `/download/java` 390 다크(미리보기 시트 전체 화면·문서 행 배치) 확인. 고칠 점 없으면 마무리: RD-7-7 `[x]`, 현재 위치 → Ch8, 부록 B Ch7 줄, 커밋.
- 커밋 범위: `my-study-app/src/` Ch7 변경(diff 18파일 + 신규 `hooks/useDrawer.ts`·`hooks/useMediaQuery.ts`·`utils/scrollLock.ts`) + 로드맵(`git add -f`). **`README.md`·`gateway/`는 Ch7과 무관 — 넣지 않는다.** 메시지 초안: `feat(redesign): Ch7 모바일 — 734/1068 경계·자료실 서랍·햄버거 전체 화면 메뉴·홈/자료실 ≤734 정리`.

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
| [ ] | RD-8-2 | `GitHubPage`·`VibeCodingPage` (`?kind=macos\|web` 읽기 — Ch2 Vibe 메뉴 링크) | ui | A | `src/pages/{GitHubPage,VibeCodingPage}.tsx`, `src/styles/vibe.css` |
| [ ] | RD-8-3 | `NotFoundPage`·`CommandPalette` | ui | A | `src/pages/NotFoundPage.tsx`, `src/components/CommandPalette.tsx`, `src/styles/command-palette.css` |
| [ ] | RD-8-4 | 빌드·감사 | chore | B | — |
| [ ] | RD-8-5 | 검수 | reviewer | B | — |
| [ ] | RD-8-6 | 🙋 D2 화면 확인 | 사용자 | C | — |

**완료 판정**
- 세 페이지와 ⌘K가 새 토큰만 사용(해당 CSS 리터럴 색 0, 주제 색 제외), `npm run build` 통과

**Ch6에서 넘어온 것**
- GitHub·Vibe 헤더가 Ch6의 새 `.dl-head` 모양(48px 제목·L 배지)을 따른다 — 숫자 줄(`.dl-count` 구조)·배지 단색은 이 챕터에서 다시 본다. `.dl-head` max-width 820px 리터럴.
- `doc-list.css`의 GitHub 행 규칙과 `vibe.css`에 옛 변수(`--border-glass`·`--transition-*`·rem 리터럴), `vibe.css` `@media (max-width:560px) .dl-title`(지금은 `.dl-head .dl-title`이 이겨서 효과 없음).
- `--transition-base`·`--transition-fast`·`--spacing-*`는 앱 CSS 어디에도 정의가 없다.
- `tintClass`(data/topics)는 이제 CommandPalette만 쓴다 → RD-8-3에서 `topicStyle`로.

**Ch7에서 넘어온 것**
- `command-palette.css:32` `.cmdk-overlay` z-index 200 리터럴 — 미리보기 시트(`--z-sheet` 300)를 연 채 ⌘K면 팔레트가 시트 뒤에 열림(Ch7 전부터, 회귀 아님) → RD-8-3에서 `calc(var(--z-sheet) + 1)` 또는 토큰.
- `command-palette.css` `.nav-search` 죽은 규칙, `vibe.css` `.dl-title 1.3rem`(효과 없음) 정리.
- 정의 없는 `--spacing-*` 남은 곳: `layout.css:5`(3건)·`footer-misc.css:84·96·97`.

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

**Ch7에서 넘어온 것**
- 정적 사이트 CSS(`src/main/resources/static/css`)의 옛 폭 경계(480·768·1024px 위주) — D6에서 import 제거 시 함께 정리.
- `.doc-pager-btns` 줄바꿈 없음 — 페이지 5개 이상이면 390px에서 넘침(지금 최대 3) → 문서가 늘면 ≤734 `flex-wrap: wrap; justify-content: center`.
- `utils/viewTransition.ts`가 `transition.ready` 거부를 처리하지 않음 — 전환을 건너뛰면 콘솔 InvalidStateError.
- 미리보기 시트 iframe에 포커스가 있으면 Esc가 안 먹음(교차 출처, 기록만).

---

## 부록 A. 감사 기록 (chore-runner가 채움)

| 시점 | 리터럴 색 (src/styles 합계) | 옛 변수 사용 수 | @media 경계 종류 | 비고 |
|---|---|---|---|---|
| Ch0 기준선 (RD-0-2) | 12 | 384 | 12종 | 2026-10-19 · 토큰 파일 포함 시 리터럴 색 64 · 옛 변수 legacy 파일 히트 제외 0 · max-width:480px ×4, max-width:560px ×3, max-width:768px ×2, min-width:1101px ×2, prefers-reduced-motion ×2 · @media 12종은 tokens.css의 734px 포함(리터럴 색은 토큰 파일 제외 — 기준 다름) |
| Ch1 후 (RD-1-4) | 8 | 380 | 12종 | 2026-10-19 · 기준선 대비 리터럴 색 −4(12→8), 옛 변수 −4(384→380), @media 12종 유지 · 토큰 파일 포함 시 리터럴 색 60(기준선 64) · 리터럴 8줄 전부 `home-sections.css`의 `.t-*` 주제 색(색 19개, 줄 8개) · 옛 변수 상위: text-muted 62, text-primary 50, border-glass 39, accent-ink 34 · 완료 판정(새 크림 리터럴) 0건 · `npm run build` 통과 · `src/data/stacks.ts`에 리터럴 색 17줄(스택 브랜드 색, 감사 범위 밖 — styles 감사에 안 잡힘) |
| Ch2 후 (RD-2-5) | 8 | 343 | 12종 | 2026-10-19 · Ch1 대비 리터럴 색 0(8→8), 옛 변수 −37(380→343, 주로 navbar.css 재작성), @media 12종 유지 · 토큰 파일 포함 시 리터럴 색 60 · 리터럴 8줄은 Ch1과 같은 `home-sections.css`의 `.t-*` 주제 색 · 옛 변수 상위: text-muted 61, text-primary 45, border-glass 36, accent-ink 31 · `navbar.css` 리터럴 색 0 · 추가 확인: `header-height` → `tokens.legacy.css` 주석 1건 · `nav-search` → `command-palette.css`만(쓰는 곳 없음, Ch8 정리) · `theme-toggle`·`header-inner`·`nav-links` 0건, logo-text 히트 2 = `.nav-logo-text`(사용 중, `Navbar.tsx:36`) + `.download-logo-text`(사용처 0, Ch6 정리 후보) · navbar.css 감사 예외: 열 폭 지역 변수 2개(`--nav-col-l: 220px`·`--nav-col-s: 160px`), 시간·translateY 리터럴 · `@media (prefers-reduced-motion)` ×3(navbar.css 신규 1) · `npm run build` 통과 · 마무리: footer-misc.css .to-top z-index 90 → calc(var(--z-scrim) - 1)(드롭다운 덮개 아래, 검수 사소한 것 1) |
| Ch3 후 (RD-3-4) | 8 | 314 | 10종 | 2026-10-19 · Ch2 대비 리터럴 색 0(8→8), 옛 변수 −29(343→314), @media 12→10종(−2 = 레일 레이아웃의 `min-width: 1101px`·`max-width: 1100px` 삭제 · 현재 목록: 1024·380·480·560·620·720·734·768px, orientation: landscape, prefers-reduced-motion) · 토큰 파일 포함 시 리터럴 색 60(tokens.css 52 + 나머지 8) · 옛 변수 상위: text-muted 56, text-primary 42, border-glass 35, text-secondary 28·accent-ink 28(동률) · `npm run build` 통과(tsc -b + vite build, 경고 0) · 3번 확인: `home-layout\|home-rail` 1건 = `src/index.css:22` `@import './styles/home-rails.css'`(파일명 매치 — 정상, 파일은 홈 레이아웃·레일 컴포넌트 규칙을 담고 Ch5에서 재검토) · ProfileCard·StackRatio·Clock·MiniCalendar(HomePage.tsx) 0건 · `--hl`·introMark·ratio-fill·max-width:480px(home-intro.css) 0건 · home-hero·home-intro·home-rails 리터럴 색 0 · 세 파일 @media 2종(734px ×2, prefers-reduced-motion ×2) · `src/components/home/` = HeroNewPill.tsx 1개 |
| Ch4 후 (RD-4-7) | 8 | 304 | 11종 | 2026-10-19 · Ch3 대비 리터럴 색 0(8→8), 옛 변수 −10(314→304), @media 10→11종(+1 = `(hover: hover)` — home-latest.css 버튼·받기 hover 2곳, 폭 경계 아님) · 토큰 파일 포함 시 리터럴 색 60(tokens.css 52 + home-sections.css `.t-*` 8) · `npm run build` 통과(tsc -b + vite build, 경고 0, 1721 모듈) · `quick-` 19→0줄(바로가기 제거) · 신규 home-featured.css·home-latest.css 리터럴 색 0 · 감사 예외 지역 변수: `--feat-min`·`--feat-tile-min-h`·`--feat-legend-min`(home-featured.css), `--latest-card-w`·`--latest-card-min-h`·`--latest-fade-w`·`--latest-dot-on-w`·`--latest-inset`(home-latest.css), 마스크 그라데이션 `black`(알파), 주제 색 인라인 `--topic` · addedAt 95/96(근거 없음 1 = exception '예외상황', pdfUrl '') · utils/home.ts MENU_DATA는 키 조회만(순회 0) |
| Ch5 후 (RD-5-6·D2 반영) | 8 | 229 | 10종 | 2026-10-19 · RD-5-6 시점 대비 리터럴 색 0(8→8), 옛 변수 0(229→229), @media 종류 10종 유지(블록 수만 변화: `(hover: hover)` 3→4, `(prefers-reduced-motion: reduce)` 7→6 — home-sections.css:78 `(hover: hover) and (prefers-reduced-motion: reduce)` 복합 블록 1개가 생김) · Ch4 대비 리터럴 색 0(8→8), 옛 변수 −75(304→229), @media 11→10종(−1 = `max-width: 620px` 블록 소멸) · 토큰 파일 포함 시 리터럴 색 60(tokens.css 52 + home-sections.css `.t-*` 8줄 188–195) · 옛 변수 상위: text-muted 33, text-primary 30, border-glass 27, text-secondary 20·accent-ink 20(동률) · `npm run build` 통과(tsc -b + vite build, 경고 0, 1726 모듈) · 신규 CSS 리터럴 색: home-about.css 0, home-more.css 0, home-sections.css 0(`.t-*` 8줄만) · 신규 `.home-empty-clear`(home-hero.css:183–197)는 리터럴 색 0 · D4: `Clock.tsx`·`StackRatio.tsx` 삭제 — 사용처 0건, `.dash-`·`.ratio-`·`.clock-`·`.stk-` 0건 · 이름 변경: `home-rails.css` → `home-layout.css`(import `src/index.css:22`, 파일 주석 갱신) · 파일명 매치: `home-section\|cat-list\|home-panel\|dash-card\|profile-email\|cal-sun` 1건 = `src/index.css:23` `@import './styles/home-sections.css'`(파일명 매치 — 정상) · 감사 예외 지역 변수: `--topic-min`(home-sections.css:10), `--about-min`(home-about.css:11), `--profile-img`(home-about.css:32), `--cal-dot`·`--cal-dot-gap`·`--cal-sr`(home-about.css:96–98), `--cal-sep`(home-about.css:187), `--more-min`·`--more-cover-w`·`--more-cover-h`(home-more.css:10–12) · 인라인 변수 예외: `--brand`(ProfileCard.tsx:50, simple-icons 브랜드 색 — 주제 색 `--topic`과 같은 데이터 예외, 설명 ProfileCard.tsx:18) · 크기 리터럴(px) — 포커스 링 `outline: 2px` + `outline-offset`: home-about.css:90–91, home-featured.css:40–41·86–87, home-latest.css:47–48·163–164, home-more.css:127–128, home-sections.css:96–97(offset −2px), footer-misc.css:52–53, home-hero.css:119–120·142–143·196–197(196–197 = `.home-empty-clear:focus-visible`), navbar.css:156–157 · 구분선 `1px solid var(--sep)`: home-more.css:57·64, home-latest.css:134, home-sections.css:136 · color-mix 85%: home-about.css:87–88(`.profile-btn--solid:hover`·`.profile-btn--brand:hover`, 토큰끼리) · color-mix 50%: home-sections.css:60 `.topic-glide`(토큰끼리, `.cat-row:hover`는 제거됨) |
| Ch6 후 (RD-6-5) | 8 | 84 | 10종 | 2026-10-19 · Ch5 대비 리터럴 색 0(8→8), 옛 변수 −145(229→84), @media 종류 10종 유지(목록: 380·480·560·720·734·768·1024px, orientation: landscape, hover: hover, prefers-reduced-motion — 1068px 경계는 아직 없음) · 토큰 파일 포함 시 리터럴 색 60(tokens.css 52 + home-sections.css `.t-*` 8) · 리터럴 8줄은 Ch5와 같은 `home-sections.css`의 `.t-*` 주제 색 · 옛 변수 상위: text-muted 18, border-glass 12, text-primary 10, bg-surface-hover 7·accent-ink 7 · `npm run build` 통과(tsc -b + vite build, 1728 모듈) · 감사 예외 지역 변수: `--avatar`, `--intro-max`, `--text-basis`, `--fade-w`, 인라인 `--topic`(TSX 주입) · mask 알파용 `var(--label)`(`.doc-seg-scroll` 가장자리 페이드) · `scrollbar-gutter` 추가(`base.css` `html { scrollbar-gutter: stable }`, 시트 열기 전환 보호) · 정의 없는 `--spacing-*`·`--transition-base/fast`는 남김(Ch7·Ch8 몫) |
| Ch7 후 (RD-7-5) | 8 | 80 | 5종 | 폭 경계 2종(734·1068) — Ch7 목표 달성 · 2026-10-19 · Ch6 대비 리터럴 색 0(8→8), 옛 변수 −4(84→80 — HEAD src 전체 84 재측정과 일치, −4 = responsive.css 옛 변수 4건 제거(HEAD 4 → 0)), @media 10→5종(−5 = 380·480·560·720·768·1024px 블록 소멸, 1068px 신규 +1 · 현재 목록: 734·1068px, orientation: landscape, hover: hover, prefers-reduced-motion) · 폭 경계 grep(`width` 포함 @media): 734px·1068px 두 값만 · 토큰 파일 포함 시 리터럴 색 60(tokens.css 52 + home-sections.css `.t-*` 8) · 옛 변수 상위: text-muted 18, border-glass 12, text-primary 10, bg-surface-hover 7·accent-ink 7 · `npm run build` 통과(tsc -b + vite build, 경고 0, 1731 모듈) · 새 파일·크게 바뀐 파일 리터럴 색 0: navbar.css, download-page.css, home-featured.css, home-latest.css, home-hero.css, responsive.css · 추가 확인: `.sidebar-backdrop`은 새 서랍 덮개 이름으로 유지(옛 z 89·blur 제거, 5건: download-page.css:656·702·712·720 + Sidebar.tsx:99) · `sidebar--open`·`mobile-menu-ext`·`nav-arr`·`useDialogBehavior` 0건 · `--spacing-` 남은 곳 6건: layout.css:5(3)·footer-misc.css:84·96·97(Ch8 몫) · 감사 예외 지역 변수: download-page.css(`--dl-pad-l`·`--dl-pad-r`·`--dl-side-min`·`--dl-side`·`--intro-max`·`--text-basis`·`--avatar`·`--fade-w`·`--fade-start`·`--fade-end`·`--drawer-left`), home-about.css(`--about-min`·`--profile-img`·`--cal-dot`·`--cal-dot-gap`·`--cal-sr`·`--cal-sep`), home-featured.css(`--feat-min`·`--feat-tile-min-h`·`--feat-legend-min`), home-latest.css(`--latest-card-w`·`--latest-card-min-h`·`--latest-fade-w`·`--latest-dot-on-w`·`--latest-inset`), home-more.css(`--more-min`·`--more-cover-w`·`--more-cover-h`), home-sections.css(`--topic-min`), navbar.css(`--nav-col-l`·`--nav-col-s`·`--mobile-menu-top`) · 시간 리터럴: command-palette.css·footer-misc.css·home-hero.css·home-intro.css(인트로 타임라인 예외)·navbar.css·view-transition.css·download-page.css(692·698) · translateY 리터럴: command-palette.css:55, footer-misc.css:77, home-hero.css:9, home-intro.css:80(110%), navbar.css:194·314·315, vibe.css:26 · 별칭 변수(토큰 참조, 리터럴 아님): home-featured.css `--feat-bg`·`--feat-fg`·`--feat-chip`·`--feat-link` 등, home-intro.css `--intro-tile`·`--intro-tile-fs` · legacy 정적 CSS(`src/main/resources/static/css`, 범위 밖): 26파일 중 22파일이 폭 @media 보유, 값은 480·768·1024px 위주(+ 280·500·560·1080·1400px 단발, `min-width: 769px` ×2 — Ch9 D6 기록용) |
| Ch8 후 | | | | |
| **Ch9 목표** | **0** (주제 색 제외) | **0** | **2** | |

## 부록 B. 커밋 기록

| Ch | 커밋 | 날짜 | 메모 |
|---|---|---|---|
| 0 | `fba73e7` | 2026-10-19 | 토큰·상수 연결, 화면 변화 0 · 예외: tokens.css color-scheme로 다크 모드 스크롤바(.sidebar·.cmdk-list)·포커스 링이 시스템 다크 스타일(의도, 사용자 승인) |
| 1 | `483e73b` | 2026-10-19 | 전 페이지 재스킨(호환 레이어 연결)·본문 글꼴/17px/1.5/keep-all · 예외: 라이트 `--label-2` #66666B(목업 #6E6E73 → `--fill` 위 4.5:1, 사용자 승인), `:root:has(body.dark)` color-scheme, 형광펜 accent 임시(Ch3 D3) · 대비 미달 21건 수정(RD-1-3b·검수 FIX 2 포함) · Ch5 정리 거리: MiniCalendar `cal-sun` 클래스, `.profile-nick` transition:filter, stacks.ts:16 주석 |
| 2 | `a937698` | 2026-10-19 | 상단 블러 바 52px + 메뉴 4 드롭다운(데이터 자동 생성 buildNavMenus) + useNavMenu(hover-intent·Esc·바깥·라우트·키보드·터치) + 바깥 블러 덮개 · --header-height→--bar-h · D5 도입(링크만, 읽기는 Ch8) · 리드 결정: 외부 링크 전부 ↗, reduced-motion은 지연 유지·애니메이션만 끔, 패널 링크 View Transition 없음 · 남은 거리: Books 표지 순서(목업과 반대, 사용자 '나중에'), .download-logo-text(Ch6), .nav-search(Ch8), ≤1024 서랍 .sidebar z 90이 덮개 위(Ch7), 작은 링크 32px·새 탭 SR 안내(Ch9) |
| 3 | `1da2e45` | 2026-10-19 | 한 줄 히어로("백엔드 학습 기록, 한곳에." · NEW 알약 자리 · CTA 2 · 검색 ⌘K 힌트) + 숫자 스트립 4칸(≤734px 2×2) + 좌우 레일 제거 → `--container` 단일 컬럼(`.home-page`/`.home-main`) · D3: 진입 연출 유지·형광펜 제거(팝 + 마침표 페이드), 배지 `--icon-l`/모바일 `--icon-m`, INTRO_MS 2200·카운트업 1340ms · NEW 알약 `HeroNewPill topic={null}`(Ch4 RD-4-6에서 isNewTopic 연결) · 리드 결정: ⌘K 힌트 유지, '자료실 둘러보기' = 검색어 비우고 #topics(reduced-motion instant, scroll-margin `--sp-6`), 홈→푸터 128px 유지(`.home-page` 아래 `--sp-8`, Ch5 재조정), `.home-main` 위 여백 보정(옛 `.home-section` 48px, Ch4 재조정) · 검수 FIX 1(reduced-motion 스크롤) · 남은 거리: 둘러보기 뒤 포커스 이동(Ch4), 검색 0건 화면 안내 버튼(Ch5), 레일 컴포넌트·home-rails.css 위치(Ch5), 모바일 검색창 그림자·짧은 placeholder(Ch7), 가로 모드 히어로 여백(Ch7), 검색 × 버튼 스타일·⌘K 플랫폼 표기·연출 타이밍 상수 constants 이전(Ch9) |
| 4 | `c121363` | 2026-10-19 | 대표 타일 2(topTopics — 1위 반전, 타일 전체 링크 → 자료실 헤더 전환 `.feat-badge/.feat-name/.feat-count`) + 문서 비중 타일(docShare 상위 6 + 기타, 막대 aria-hidden·범례) + 최근 문서 셸프(useInfiniteCarousel — 최소 3벌·순간 보정·4초 자동·hover/포커스/탭 숨김 정지·reduced-motion 꺼짐·복제 aria-hidden/tabIndex −1) + `PdfItem.addedAt` 95/96(git 이력, 정적 사이트 init 2025-11-13이 하한) + utils/home.ts 선택자(newestTopic → 히어로 NEW 알약, NAV_MENUS에 isNewTopic 연결) · 사용자 결정: 셸프 화면 끝까지(풀블리드 — 첫 카드 제목 줄 정렬, 페이드는 화면 가장자리 `min(64/40px, inset + card-pad)`) · 리드 결정: 타일 설명 = DESC, 비중 문장 'A · B 두 주제가 전체 문서 N개 중 P%를 차지합니다.', latestDocs 같은 날짜는 주제 라운드 로빈·빈 pdfUrl 제외, NEW 21일째 포함·미래 날짜 제외, addedAt = PDF 연결일 기준, 빠른 연타 덜컥거림 수용(브라우저 한계), aria-roledescription 한국어(캐러셀/슬라이드), 다크 반전 타일 = 일반 면(토큰 규칙) · Ch3 거리 해소: 둘러보기 뒤 #topics 포커스, `.home-main` 위 여백 → `> :first-child` `--section` · 검수 FIX 1(kafka addedAt 2026-03-21 → 2025-11-13) · 남은 거리: `.home-topics` 간격·주제 목록 개편(Ch5), 클래식 스크롤바에서 100vw로 셸프 약 7.5px 넘침(clip됨, Ch7), 셸프 점 진입 연출·머리 줄 버튼 포커스 시 회전 정지(APG 권고)·타일 링크 이름 길이(aria-labelledby 검토)(Ch9), PDF 꼬리표 목업 대비 2px 차이(기록만) |
| 5 | `8dcad24` | 2026-10-19 | 주제 인셋 그룹 그리드(`auto-fit`·`minmax(min(100%, 440px), 1fr)` + stretch — 같은 줄 그룹 끝선 일치, 검색 결과는 `auto-fill`로 1건도 절반 폭 유지), 행 → 자료실 헤더 전환은 `.cat-title`·`.cat-count` · '기록하는 사람': 프로필(이메일 제거, GitHub 단색, Velog 브랜드 초록 `--brand`·글자 `--inv-surface`) + 이번 달 달력(addedAt 점 날짜 아래, 빈 달이면 '이번 달에 올린 문서가 아직 없어요', 매주 일요일 목표 한 줄) · '함께 보면 좋은 것들': 책 최근 3권(태그 없으면 저자 표시), GitHub 3개, `HOME_MORE_PREVIEW_COUNT` · 새 푸터(`SOCIAL_LINKS`, 새 탭 ↗) · D4: Clock·StackRatio 삭제, home-rails.css → home-layout.css 이름 변경, 검색 0건이면 '검색어 지우기' 버튼 · 사용자 결정: 달력은 이번 달 고정, 이메일 제거, 책 태그 없으면 저자 표시, 셸프 연속 흐름(RD-5-9), hover 하이라이트 미끄러짐·배지 제거(주제 목록·대표 타일·셸프, 히어로 군무 배지는 유지 — RD-5-10), 일요일 목표 한 줄, Velog 색(RD-5-11) · 리드 결정: Velog 글자색 `--inv-surface`(7.9:1), dl-badge는 도착 화면에서 페이드만 · 검수 FIX: Tab 포커스 때 셸프가 이음매 보정으로 한 벌 튀던 문제(Ch4부터 있었음) · 남은 거리: stacks.ts:16 크림 주석(Ch8/9), MoreSection `REPO_DATA.slice` 인라인 숫자(Ch9), 검색 결과 수 라이브 영역(Ch9), 다른 페이지 푸터 위 여백(Ch8), 히어로 군무 배지 흰 글자 대비(기록만) |
| 6 | `0dc7cc7` | 2026-10-19 | 자료실 데스크톱 — 분리 사이드바(프로필 줄·주제 검색 `searchTopics` 홈과 공용·그룹 행 S 배지·선택 = 파란 채움) + 본문 760(브레드크럼·L 배지 헤더·h1 과목 이름만·DESC 소개·공지 카드) + 소분류 세그먼트(≥2, 넘칠 때만 가장자리 페이드) + 문서 행 `.doc-*`(번호 칸 `splitDocNumber`·미리보기·받기 알약·준비 중) + 페이징 `paginateSections`/`useSectionPagination`(전체·소분류 공통 10개, '앞 페이지에서 이어짐', 목록 맨 위가 지나갔을 때만 스크롤, overflow-anchor 보정) + 미리보기 시트 760(번호·위치·설명, 포커스 진입·가둠·복귀, html+body 잠금, 좁은 경계 734) · 사용자 결정: 배지 유지, 시트 760, D2 — 탭·페이지 전환 등장 효과 끔·세그먼트 페이드·묶음 수 = 소분류 전체 · 리드 결정: `html { scrollbar-gutter: stable }`(클래식 스크롤바에서 시트 열기 전환 ABORT 방지 — 검수 FIX-A, 짧은 페이지 오른쪽 15px 빔), 공용 `.dl-head` 새 모양이 GitHub·Vibe에도, `<main>` 랜드마크, 내려받기 파일명 = 원래 제목 · 검수 FIX: A(위), B(페이저 끝 화살표 aria-disabled — 포커스 유실) · 정리: download-page.css 옛 정적 규칙 12 + 옛 사이드바, doc-list.css 자료실 전용 `.dl-*`, vibe.css 죽은 `.dl-btn/.dl-preview/.dl-actions/.dl-crumb*`, 옛 `usePagination` · HEAD 버그 수정: 시트 스크롤 잠금 미작동 · 남은 거리: Ch7·Ch8 섹션 "Ch6에서 넘어온 것", 목업 미세 차이(.doc-num 자간·.doc-title 줄간격·.doc-soon 패딩·.dl-head-text 기본 폭·덮개 블러 20 vs 10 — 기록만), iframe 포커스 시 Esc 안 먹음(교차 출처, 기록만), `AVATAR_SIZE`(Sidebar.tsx)와 CSS `--avatar` 값 중복 · D2 추가(RD-6-8, 사용자 요청): 데스크톱 사이드바 `position: fixed` + 높이 = 화면 − 바 − 2×`--sp-3`(페이지 끝·짧은 과목에서도 같은 자리), `.download-layout::before` 자리표시, 자료실 푸터 글자를 본문 열 시작선에 맞춤(`body:has(.download-layout)`), 사이드바–본문 간격 50→48px(설계값 `--sp-7`) |
| 7 | | 2026-10-20 | 모바일 — 반응형 폭 경계 7종 → 2종(734·1068, @media 10→5종) · `useDrawer`(포커스 진입·가둠·복귀, Esc, 스크롤 잠금) + `useMediaQuery` + `utils/scrollLock`(html+body 잠금, 겹친 모달은 잠금 순서가 층 — 맨 위만 Esc·Tab), PdfPreview·CommandPalette가 공용 훅 사용(`useDialogBehavior` 삭제) · 햄버거 = Apple식 전체 화면 메뉴(바 아래 `--bar-bg-open`+블러, NAV_ITEMS 24px, SOCIAL_LINKS ↗) · 자료실 서랍(≤1068 '주제 전환' → 왼쪽 패널 `role=dialog aria-modal`, ✕·덮개·Esc·과목 선택으로 닫힘, 넓어지면 닫힘, 브레드크럼 숨김) · 홈 ≤734: 셸프 `100cqw` 풀블리드 + 페이드·이전/다음 숨김, 대표 타일 2열(태블릿 735~ 포함), 숫자 2×2, 짧은 검색 placeholder, 가로 폰 히어로(높이 조건) · Books·Vibe/GitHub·⌘K 경계도 734 · 사용자 결정: 전체 화면 햄버거, 태블릿 2열, ≤734 셸프 버튼 숨김, 모바일 문서 행 = 미리보기+받기 둘 다 글 아래(Ch6 유지) · 리드 결정: 세그먼트 ≤734 화면 끝까지(목업 정본), 서랍 덮개 블러 없음, 서랍 폭 `min(--sidebar-w, 100vw − --sp-8 − --sp-2)` · 검수 FIX: 자료실 헤더 ≤734(배지 \| h1 + 바로 아래 'N개 문서'), 자료실 본문 ≤734 간격·페이저 · 남은 거리: Ch8·Ch9 섹션 "Ch7에서 넘어온 것" |
| 8 | | | |
| 9 | | | 병합 커밋 |
