# my-study-app Apple 스타일 리디자인 — 작업 기록

- **작성일:** 2026-10-21 · **기간:** 2026-10-18(준비) ~ 2026-10-21(Ch9 마감)
- **브랜치:** `feat/apple-redesign` (main `15f9d7b`에서 분기, 챕터 1개 = 커밋 1개)
- **관련 문서:** [계획서](./261018_my_study_app_redesign_plan.md)(규칙·토큰·동작 명세) · [로드맵](./261018_my_study_app_redesign_roadmap.md)(챕터 작업표·부록 A 감사·부록 B 커밋) · [준비 기록](./261018_my_study_app_redesign_prep_log.md) · [Ch9 전수 검수](./261020_redesign_ch9_review.md) · [인수인계](./261011_my_study_app_handover.md)(§3·§4 문서·도서 추가 절차 — 10-21 갱신) · 디자인 정본 [캔버스](https://claude.ai/artifact/KRGAtS74ioPBUPmT6UZnsL) / 사본 [`261018_redesign_mockups/`](./261018_redesign_mockups/)
- **목적:** 리디자인에서 무엇을 바꿨고, 무엇을 정했고, 무엇이 남았는지를 이 문서 하나로 남긴다. 챕터별 세부는 로드맵 부록 B 커밋 메모에 있다.

---

## 0. 요약

웜 크림 블로그 톤이던 JM Hub(React 19 + Vite, 백엔드 학습 PDF 자료실)를 Apple 스타일 디자인 시스템으로 바꿨다. 색·글자·간격·모서리는 `tokens.css` 토큰만 쓰고, 동작 숫자는 `constants/`로 모았다. 상단은 블러 바와 메뉴 4개 드롭다운, 홈은 한 줄 히어로·숫자·대표 타일·무한 셸프·주제 그룹, 자료실은 분리 사이드바·세그먼트·페이징·미리보기 시트, 모바일은 734/1068 두 경계·전체 화면 햄버거·자료실 서랍으로 정리했다. 마지막 장(Ch9)에서 레거시 정적 CSS 의존을 끊고 다크·접근성·성능을 전수 검수해 FIX 14건을 고쳤다.

| 항목 | 전 (Ch0 기준선) | 후 (Ch9) |
|---|---|---|
| CSS 리터럴 색 (`src/styles`, 토큰 파일 제외) | 12 | **0** |
| 옛 변수 사용 | 384 | **0** |
| `@media` 폭 경계 | 380~1101px 여러 값(`@media` 전체 12종) | **2종**(734 ×14 · 1068 ×1) |
| 정적 사이트 CSS import | 6개(reset·variables·card·button·book·jm-github) + `tokens.legacy.css` | **0** — 앱 `reset.css`만 |
| 첫 방문 이미지(로고·프로필) | 2.6MB | **64KB**(192px 다시 저장) |
| 빌드 CSS | 88kB(Ch9 D6 직전) | 72.9kB (gzip 12.3kB) |

## 1. 현재 상태 (2026-10-21)

| 항목 | 상태 |
|---|---|
| 브랜치 | `feat/apple-redesign` — Ch0~Ch8 커밋 9개 + Ch9 커밋 |
| main | `origin/main`보다 3커밋 앞섬(`62e8f35`·`2522a9e`·`15f9d7b`, 리디자인 전 작업, 미push) |
| 병합·push | 🙋 D7 — 사용자 명시 승인 뒤 리드가 실행(= 배포). 결과는 로드맵 부록 B Ch9 줄 |
| 빌드 | `npm run build` 통과 (tsc -b + vite build, 1738 모듈, JS 353.4kB / gzip 113.3kB, CSS 72.9kB / gzip 12.3kB) |
| 화면 확인 | D2 OK (2026-10-21) |
| 작업 트리(리디자인과 무관) | 파일 권한 변경 193건, `README.md` 수정, 미추적 `gateway/` — 커밋에 넣지 않는다(`git -c core.fileMode=false add <파일>`) |

## 2. 챕터별 결과

| Ch | 커밋 | 바뀐 것 |
|---|---|---|
| 0 준비 | `fba73e7` | 토큰·상수 연결, 화면 변화 0 |
| 1 기반 전환 | `483e73b` | 호환 레이어로 전 페이지 재스킨(뉴트럴 그레이·애플 블루), 본문 17px/1.5/keep-all, 대비 미달 21건 |
| 2 글로벌 내비 | `a937698` | 블러 바 52px + 메뉴 4 드롭다운(데이터 자동 생성) + `useNavMenu`(hover-intent·Esc·바깥·키보드·터치) + 바깥 블러 덮개 |
| 3 홈 상단 | `1da2e45` | 한 줄 히어로·NEW 알약·숫자 스트립, 좌우 레일 제거 → 단일 컬럼 |
| 4 홈 중단 | `c121363` | 대표 타일 2 + 문서 비중 + 최근 문서 무한 셸프(`useInfiniteCarousel`), `PdfItem.addedAt` |
| 5 홈 하단 | `8dcad24` | 주제 그룹 그리드, '기록하는 사람'(프로필·이번 달 달력), 책/GitHub, 새 푸터 · 시계·스택 비율 삭제 |
| 6 자료실 | `0dc7cc7` | 분리 사이드바·소분류 세그먼트·문서 행·페이징(`paginateSections`)·미리보기 시트 |
| 7 모바일 | `2c9dbcc` | 경계 2종, `useDrawer`·`scrollLock`, 전체 화면 햄버거, 자료실 서랍 |
| 8 보조 페이지 | `7bf9b88` | Books·GitHub·Vibe 카드, 세그먼트 공용화, 404, ⌘K 새 토큰 · 리터럴 색 0·옛 변수 0 달성 |
| 9 마감 | (이 커밋) | D6 정적 CSS 끊기, 전수 검수 FIX 14 + 이월 6 + 재검수 3, 사이드바 블러 페이드(D2), 기록·인수인계 |

### Ch9에서 한 것
- **D6 레거시 끊기(RD-9-3):** `index.css`에서 정적 CSS 6개와 `tokens.legacy.css` import 제거, `tokens.legacy.css` 삭제, 앱 `styles/reset.css` 신규(`scroll-behavior: smooth`는 동작 줄이기가 아닐 때만, `button{outline:none}` 뺌). Pretendard `@import`는 `index.css`로 옮겨 유지. 6경로 × 라이트/다크 × 1280/390 × reduced-motion computed style 비교 — 차이는 사라진 옛 변수와 reduced-motion smooth뿐.
- **이월 6건(RD-9-2a):** `ScrollToTop` 동작 줄이기면 즉시 · `viewTransition.ts` `ready`·`updateCallbackDone` 거부 처리 · ≤734 페이저 줄바꿈 · `--text-basis` → `--doc-text-basis`(감사 오탐 0) · ≤734 헤더·소개 문단 규칙 doc-list.css로 합침 · 자료실·Books 알약 hover = `--accent-fill` 바탕(대비 3.70 → 4.70).
- **전수 검수(RD-9-1) → FIX 14(RD-9-2):**

| FIX | 내용 | 담당 |
|---|---|---|
| 1·2·3 | hover 대비 — 셸프 받기 알약, 사이드바 행 숫자, '주제 전환' 그룹 글자 → 4.70 / 12.4 / 11.2 | style |
| 4 | Shift+Tab 포커스가 상단 바 밑에 가림(WCAG 2.4.11) → `main` 안 포커스 요소에 `scroll-margin-top` | style |
| 5 | 첫 진입 연출 중 셸프 점만 떠 있음 → 셸프와 같은 지연 | ui |
| 6 | 모든 탭 제목 'JM Hub' → `useDocumentTitle` '페이지 — JM Hub'(사용자 결정) | ui |
| 7 | 새 탭 링크 스크린 리더 안내 → `NewTabHint`·`NEW_TAB_LABEL`, 공용 `.sr-only` | ui ×2 |
| 8 | 홈 검색 결과 수 라이브 영역(`role=status`) | ui |
| 9 | ⌘K 표기 고정 → `utils/platform.ts` `SEARCH_SHORTCUT`('⌘K' / 'Ctrl K') | ui |
| 10 | 대표 타일 링크 이름 91자 → `aria-labelledby`(이름 + 문서 수) | ui |
| 11 | 이름 없는 묶음만 있는 자료실 h1 → h3 건너뜀 → h2 | ui |
| 12 | 메뉴가 셸프를 덮어도 셸프가 흘러 전체 화면 블러를 60fps로 다시 그림 → `utils/overlay.ts` 층 카운트로 정지(GPU 78.7 → 0.5ms/2초) | architect |
| 13 | `logo.png`·`profile.svg` 각 1.3MB → 192px(사용자 결정, 9.5kB·55kB) | chore |
| 14 | 쓰지 않는 Font Awesome CSS(렌더 차단) 제거 + 죽은 `icon` 데이터 필드 134줄 삭제 | chore |

- **재검수:** FIX 14/14 PASS, 회귀 0. 재검수에서 새로 찾은 3건(리디자인 전부터 있던 동작)도 고침 — 셸프 hover를 native pointerenter/leave로(⌘K를 닫은 뒤 마우스가 셸프 위인데 다시 흐르던 것), 과목이 바뀌면 미리보기 시트 닫기(뒤로 가기 때 이전 과목 시트가 남던 것), `platform.ts` `??`→`||`.
- **D2 사용자 요청(RD-9-7):** 자료실 사이드바 위아래 가장자리 블러 페이드 — 넘칠 때만 켜짐(맨 위 = 아래만, 중간 = 둘 다, 맨 끝 = 위만), `--blur-edge` + `--sidebar`→투명 그라데이션 + 마스크, 높이 `--sp-6`, `scroll-padding-block`으로 키보드 포커스가 띠에 안 가림. 첫 구현은 sticky 오프셋에 스크롤러 padding이 이중으로 들어가 띠가 패널 끝에서 12px 떠 있었다(사용자 지적) → `top/bottom: 0`으로 패널 끝에 붙임.

## 3. 구조 — 어디를 보면 되나

| 자리 | 파일 | 메모 |
|---|---|---|
| 디자인 토큰 | `src/styles/tokens.css` | 라이트 `:root` · 다크 `body.dark` · 모바일 스케일 `@media (max-width: 734px)`. 색은 이 파일에만 |
| 동작 상수 | `src/constants/ui.ts`(경계·페이지 크기·셸프·드롭다운 타이밍·`SITE_NAME`·`NEW_TAB_LABEL`), `links.ts`(외부 링크·`SOCIAL_LINKS`), `navigation.ts`(메뉴 순서·축약 규칙) | 컴포넌트에 숫자를 직접 쓰지 않는다 |
| 주제 색 | `src/data/stacks.ts` `STACK[key].color` → `topicStyle(key)`(`data/topics.ts`)가 인라인 `--topic` | `.t-*` 클래스는 없다 |
| 선택자(파생 계산) | `src/utils/home.ts`(대표 타일·문서 비중·최근 문서·NEW), `navMenus.ts`(드롭다운 데이터), `paginateSections.ts`, `topicSearch.ts`, `vibe.ts` | |
| 동작 훅 | `useNavMenu`(드롭다운), `useInfiniteCarousel`(셸프), `useDrawer`(햄버거·서랍·시트·⌘K 포커스 가둠·Esc·잠금), `useSectionPagination`, `useTransitionNavigate`(View Transition), `useDocumentTitle` | 명세는 계획서 §4 |
| 층·잠금 | `utils/scrollLock.ts`(html+body 잠금, 겹친 층 = 잠금 순서), `utils/overlay.ts`(덮는 층 수 — 셸프 정지 신호) | |
| 화면 전환 짝 | `styles/view-transition.css` + `useTransitionNavigate` `nameParts` | `.cat-title→dl-title`, `.cat-count→dl-count`, 문서 행 ↔ 시트 — 클래스 이름을 바꾸면 짝도 |
| 반응형 | `@media (max-width: 734px)`(모바일)·`(max-width: 1068px)`(태블릿, 자료실 서랍) 둘만 | `BREAKPOINT`(constants)와 같은 값 |

## 4. 결정 모음

**사용자 결정(🙋)**
- D1 10-12 연출 작업을 main에 먼저 커밋하고 브랜치 · D2 챕터마다 화면 확인(직접) · D3 홈 진입 연출 유지·형광펜 제거 · D4 시계·스택 비율 삭제 · D5 `/books?tag=` 도입 · D6 정적 CSS 끊기(reset만 앱으로) · D7 병합·push는 별도 명시 승인.
- 그 밖: 라이트 `--label-2` #66666B(4.5:1) · 셸프 화면 끝까지(풀블리드)·연속 흐름 · hover 하이라이트 미끄러짐·배지 제거 · 달력 이번 달 고정·이메일 제거·Velog 브랜드 색 · 자료실 배지 유지·시트 760 · 전체 화면 햄버거·태블릿 2열·≤734 셸프 버튼 숨김 · 보조 페이지 폭 1080·Books 최근 먼저·Vibe 설명 말줄임 없음·⌘K ≤734 '취소' · Vibe 'JM Study Hub' 설명 문구 · 탭 제목 '페이지 — JM Hub' · 로고·프로필 192px · 알약 hover 파란 채움 확정(D2) · 자료실 사이드바 위아래 블러 페이드(D2 요청).

**리드 결정(주요):** 외부 링크 전부 ↗ · reduced-motion은 지연 유지·움직임만 끔 · `html { scrollbar-gutter: stable }`(시트 전환 보호) · 서랍 덮개 블러 없음 · 알약 hover `--accent-fill`(D2에서 사용자 확인) · Ch9 D6를 전수 검수보다 먼저(끊은 뒤 화면까지 검수가 보게).

## 5. 품질 결과

- **감사:** 로드맵 부록 A — Ch0 12 / 384 / 12종 → Ch9 0 / 0 / 폭 2종. 감사 예외는 지역 변수 px·포커스 링 2px·1px 구분선·시간·translate 리터럴·셸프 마스크 `black`(알파)·데이터 색(`STACK`, Velog `--brand`).
- **접근성(RD-9-1, 72조합 대비 스캔 + Tab 전수):** 글자 대비 실패는 aria-hidden 장식 배지뿐 · 포커스 링 누락 0 · 390에서 44px 미만 0 · 모달 4종 Tab 가둠·Esc·복귀 · 동작 줄이기에서 움직임 0 · `lang`·랜드마크·alt·이름 없는 컨트롤 0. FIX 14건은 §2 표.
- **성능(R7 블러 겹침):** 스크롤 중 블러로 놓친 프레임 증가 없음(M4 Pro 헤드리스, CPU 4×). 정지 상태 재그리기는 FIX-12로 해소. 저사양 폰 GPU는 실기기 확인 몫.

## 6. 알려진 한계·남은 거리 (기록만)

- 드롭다운 작은 링크 32px·메뉴 버튼 폭 28~39px(900) — WCAG 2.5.8(24px) 충족. 44px로 키우면 패널이 약 60px 길어져 목업과 달라진다(사용자 결정 거리).
- 홈 검색 ×는 브라우저 기본 취소 단추(Esc로도 지움).
- 미리보기 시트 iframe에 포커스가 있으면 Esc가 부모로 안 온다(교차 출처 PDF 뷰어).
- 클래식 스크롤바(Windows)에서 덮개가 오른쪽 스크롤바 칸을 덮지 않는다(`scrollbar-gutter: stable`의 부작용).
- 히어로 연출 타이밍(`HeroIntro.tsx` INTRO_MS 등)은 `home-intro.css` ms 지연과 짝이라 constants로 옮기지 않았다(파일 머리 주석이 짝을 밝힘).
- 사이드바 그룹 region 랜드마크 6개, 건너뛰기 링크 없음(랜드마크로 2.4.1 충족).
- 레거시 정적 사이트(`src/main/resources/static/`)는 그대로 남아 있다 — 앱은 더 이상 쓰지 않는다. 지울지는 별도 결정.

## 7. 진행 방식 기록 (에이전트 팀)

- **구성:** 리드(Opus, 메인 세션) + 팀원 ui-builder·style-migrator·data-wirer(Sonnet), chore-runner(Haiku), redesign-architect·redesign-reviewer(Opus). 챕터 1개 = 터미널 세션 1개 = 팀 1개, 동시 3~5명. 플레이북 `.claude/skills/redesign/SKILL.md`, 실행 `./scripts/redesign-lead.sh <N>`.
- **잘 된 것:** 같은 묶음 안 소유 파일을 리드가 미리 나눠 충돌 0 · 여러 팀원이 같이 쓰는 작은 연결 파일(예: Ch9 `platform.ts`·`NewTabHint`)은 리드가 먼저 만들어 묶음 안 의존을 없앰 · 검수자는 읽기 전용 + 헤드리스 Chrome CDP 하네스(새 의존성 없이)로 측정 값까지 냄 · 챕터마다 사용자 화면 확인 뒤 1커밋.
- **알게 된 것:** 팀 모드에 공유 작업 목록 도구가 없다 → 브리프 전체를 스폰 프롬프트에 넣고 묶음 순서는 리드가 직접 끈다 · 나중에 띄운 팀원은 그 전 메시지를 못 받는다 → API는 완료 보고에 넣게 하고 리드가 중계 · 부록 B 커밋 해시는 다음 챕터 마무리에서 채운다 · `grep`은 ugrep 별칭이라 `command grep` · 외장 볼륨 권한 변경 193건 때문에 `git -c core.fileMode=false add <파일>`.

## 8. 다음 작업자에게

- 문서·도서 추가: [인수인계 §3·§4](./261011_my_study_app_handover.md) — 새 문서엔 **`addedAt`을 꼭**(셸프·달력·NEW가 이 값으로 계산).
- 화면을 고칠 때: 계획서 §3 공통 규칙(토큰만·상수에서·소유 파일·접근성 기본값·`npm run build`) — 새 페이지는 `useDocumentTitle`, 새 탭 링크는 `NewTabHint`.
- 디자인 정본은 캔버스, 코드와 다르면 코드가 최신(챕터별 사용자 결정 반영).
