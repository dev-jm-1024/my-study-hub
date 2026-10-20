# RD-9-1 전수 검수 — 다크·접근성·성능(블러) (2026-10-20, reviewer)

## 판정: FIX — 14개 (중간 7 · 낮음 7) / 담당 제안: style 4 · ui 7 · architect(훅) 1 · data·chore 2
빌드 `npm run build` 통과. 회귀(D6·RD-9-2a) 없음. 화면 전환 짝 모두 정상.

## 측정 요약 (하네스: scratchpad/rd91/*.mjs, 결과 out/)
- 글자 대비(scan.mjs): 12경로 × 1280·900·390 × 라이트/다크 = 72조합, 글자 노드 약 6,500개 → 실패는 전부 aria-hidden 주제 모노그램 배지(흰 글자/주제 색 2.57~4.11)뿐. 열린 상태 9종 × 2테마(states.mjs)도 같음.
- hover 대비(hover*.mjs): 실패 3종 → FIX-1·2·3.
- 포커스 링(tabwalk.mjs): 7경로 × 1280·390(+900 자료실) × 2테마 Tab 전수 — 링 없음 0, 링 대비 3:1 미만 0, :focus-visible 미일치 0. 예외: ⌘K 입력칸(캐럿 — 의도), 시트 iframe.
  - D6로 `button{outline:none}`이 빠진 뒤에도 겹침·누락 없음.
- Shift+Tab(tabback.mjs): 상단 바 밑에 완전히 가려지는 포커스 → FIX-4. 같은 규칙 주입 시 0(tabback-fix.mjs).
- 터치(probe-targets): 390에서 44px 미만 0(세그먼트 36px는 ::after로 44px). 900: 드롭다운 작은 링크 32px, 메뉴 버튼 폭 28~39px(간격 32px) → 기록만.
- 키보드(kbd.mjs·states.mjs): 드롭다운 4개 Enter 열기→Tab 패널 첫 링크→Esc 닫고 버튼 복귀 / 햄버거·서랍·시트·⌘K Tab 가둠(30회 이탈 0, Shift+Tab 안쪽)·Esc 닫힘·연 버튼 복귀 / ⌘K·Ctrl+K·`/` 열기, ↓↵ 이동.
- 동작 줄이기(motion.mjs): 6경로 × 1280·390 + 열기 6종 — 움직이는 transition/animation 0, 도는 애니메이션 0, html scroll-behavior auto, 인트로·카운트업 없음, 셸프 처음부터 정지, View Transition 호출 0, 맨 위로 즉시(misc.mjs). 남는 건 색·투명도 페이드뿐(기록만).
- 구조(struct.mjs): lang=ko, main 1개, alt 누락 0, 이름 없는 컨트롤 0, aria-hidden 안 포커스 0, 중복 id 0. 제목 건너뜀 2(FIX-11), document.title 전부 'JM Hub'(FIX-6), 새 탭 안내 Books만(FIX-7).
- 화면 전환(vt.mjs): 홈 주제 행·대표 타일(1280·390)·사이드바 행 → ready ok, 그룹 dl-title·dl-count·dl-badge·site-header·side-nav / 시트 열기·닫기 pdf-sheet ok, 닫힌 뒤 포커스 미리보기 버튼.
- 다크 눈 확인(out/shots/dark-*.jpg 19장): 안 보이는 선·아이콘·로고 없음.

## R7 블러 겹침
| 상태 | 보이는 블러 층 | 화면 대비 면적 | 한 점 최대 겹침 |
|---|---|---|---|
| 평소(홈, 셸프 보임) 1280 / 390 | 바 + 셸프 가장자리 2 | 8.7% / 12.5% | 1 |
| 드롭다운 열림 | 바 + 패널(34%) + 덮개(99%) | 139% | 2 |
| 햄버거 열림(홈 390) | 바 + 메뉴(90%) + 셸프 가장자리 2 | 103% | 2 |
| 시트 열림 1280 / 390 | 바 + 덮개(99%/96%) | 105% / 102% | 2 |
| ⌘K · 서랍 | 바만 | 6% | 1 |
- 스크롤 중(perf2.mjs, 트레이싱, CPU 4×, 1,800px 스와이프 2회 평균): 놓친 프레임 블러 켬/끔 — 홈 390 12~13/13, 홈 1280 드롭다운 열림 1~2/2, 자료실 390 0/2 → 블러 때문에 늘지 않음. GPU 시간 켬/끔 — 56~63/30~33ms, 84~92/29ms, 51/25ms(프레임당 1.2ms 이하). rAF 60fps 전부.
- 가만히 있을 때(perf3.mjs, 2초): 메뉴가 셸프를 덮어도 셸프가 계속 흘러 전체 화면 블러를 매 프레임 다시 그림 → FIX-12.
- 한계: 측정 기기 M4 Pro GPU(헤드리스). CPU 스로틀은 렌더러 메인 스레드만 늦춘다 — 저사양 폰 GPU는 D2 실기기로.

## FIX 목록 (파일별, 같은 파일은 한 담당)
### style (CSS만)
- FIX-1 | 중간 | style | src/styles/home-latest.css:172-174 (+:155 .latest-get-pill transition) | 홈 셸프 '받기' 알약 hover — --sep 바탕 위 --accent 글자 3.70(라이트)/3.88(다크). RD-9-2a에서 자료실·Books 알약만 고치고 셸프가 빠짐 | `.latest-get:hover .latest-get-pill { background: var(--accent-fill); color: var(--on-accent); }` + transition에 color 추가(download-page.css:460과 같게) | hover.mjs: 6장 × 2테마 전부 3.70/3.88
- FIX-2 | 중간 | style | src/styles/download-page.css:212-216 | 사이드바 행 hover(라이트) — color-mix(--sep 50%, --sidebar) 바탕 위 .sidebar-count(--label-2, 13px) 4.22 | `.sidebar-row:not([aria-current='page']):hover .sidebar-count { color: var(--label); }` (대안: 섞는 비율 15% 이하면 4.54지만 hover 바탕 차이가 1.03:1로 거의 안 보임) | hover3.mjs: 숫자·'준비 중' 9종 4.22, 다크 통과
- FIX-3 | 중간 | style | src/styles/download-page.css:586-588 | '주제 전환' 버튼 hover(라이트, ≤1068) — --sep 바탕 위 .sidebar-toggle-group(--label-2) 3.79 | `.sidebar-toggle:hover .sidebar-toggle-group { color: var(--label); }` (FIX-2와 같은 방식) | hover2.mjs 900 라이트 «프로그래밍» 3.79
- FIX-4 | 중간 | style | src/styles/base.css (규칙 추가) | Shift+Tab으로 거꾸로 이동하면 포커스된 요소가 고정 상단 바(52px) 밑에 완전히 가림 — WCAG 2.2 2.4.11(AA). 앞으로 Tab은 문제 없음 | `main :is(a[href], button, input, [tabindex]:not([tabindex="-1"])), .site-footer a { scroll-margin-top: calc(var(--bar-h) + env(safe-area-inset-top, 0px) + var(--sp-3)); }` — html scroll-padding-top은 .home-topics(home-hero.css:201)·.doc-list-area(download-page.css:343)의 scroll-margin과 두 번 더해지고 usePagination.ts:63 기준도 바뀌므로 쓰지 않는다. aside(사이드바)·모달은 범위 밖 | tabback.mjs: 1280 홈 CTA 2·자료실 문서 행 2 / 390 Books 세그먼트 7+구매 2·자료실 2·NEW 알약 1 → 규칙 주입 후 12조합 모두 0

### ui (TSX + 필요한 CSS)
- FIX-5 | 낮음 | ui | src/components/home/LatestShelf.tsx:85 + src/styles/home-intro.css:100 | 셸프 점만 등장 효과가 없음(Ch4 이월) — 첫 진입 연출 0~1.6초 동안 셸프·제목은 opacity 0인데 점 6개만 떠 있음 | 점 래퍼에 `home-anim` + `.home-intro .latest-dots.home-anim { animation-delay: 1590ms; }` | misc2.mjs t≈600·1200ms: region 0 / dots 1 / head 0
- FIX-6 | 중간 | ui | src/pages/{HomePage,DownloadPage,BooksPage,GitHubPage,VibeCodingPage,NotFoundPage}.tsx + 새 훅(hooks/useDocumentTitle.ts) | 모든 라우트 document.title = 'JM Hub' — WCAG 2.4.2(A). 탭·방문 기록·스크린 리더에서 페이지 구분 불가 | 페이지마다 제목 설정(예: '{과목} — JM Hub', '추천 도서 — JM Hub', '페이지를 찾을 수 없어요 — JM Hub'). 문구는 리드 결정 | struct.mjs 8경로 × 2폭 전부 'JM Hub'
- FIX-7 | 낮음 | ui | Navbar.tsx:86-97·200-209 · NavPanel.tsx:25-35 · Footer.tsx:15-18 · ProfileCard.tsx:46-56 · home/MoreSection.tsx:70-73 · home/LatestShelf.tsx:58-64 · DownloadPage.tsx:213-221 · GitHubPage.tsx:34 · VibeCodingPage.tsx:89·95 | 새 탭 링크 안내(Ch2 이월, Ch8 방식 통일) — 새 탭 링크 중 안내가 있는 건 Books 구매·시트 '새 탭에서 열기'뿐, 나머지는 ↗(aria-hidden)만 | aria-label 있는 곳(LatestShelf·Vibe)은 끝에 ' (새 탭)', 없는 곳은 ↗ 옆 숨김 글자 '(새 탭)'. 숨김 글자 유틸(.sr-only)은 base.css에 하나 — FIX-4와 같은 파일이라 담당 조율 필요 | struct.mjs: 홈 0/26, GitHub 0/8, Vibe 0/9 안내
- FIX-8 | 낮음 | ui | src/pages/HomePage.tsx:110-113 | 홈 검색 결과 수 라이브 영역 없음(Ch5 이월) | 늘 렌더되는 숨김 role="status"에 '검색 결과 N건'(검색어 없으면 빈 값) | kbd.mjs: 라이브 영역 0개
- FIX-9 | 낮음 | ui | src/pages/HomePage.tsx:89 · src/components/Navbar.tsx:105 | ⌘K 표기 고정(Ch3 이월) — Windows·Linux에서도 '⌘K'(단축키는 Ctrl+K로 동작함) | 플랫폼 감지로 '⌘K'/'Ctrl K', aria-label도 같이 | kbd.mjs Ctrl+K → 열림
- FIX-10 | 낮음 | ui | src/components/home/FeaturedSection.tsx:43-73 | 대표 타일 링크 접근 이름 91자(Ch4 이월): '프로그래밍 Java 람다 · 스트림 · Optional · 컬렉션 Modern Java 11 … 25개 문서 자료실 열기' | aria-labelledby(이름 + 문서 수, useId) — 설명은 필요하면 aria-describedby | axname.mjs
- FIX-11 | 낮음 | ui | src/pages/DownloadPage.tsx:30 | 이름 없는 묶음만 있는 주제(Kotlin·예외처리)에서 h1 → h3 건너뜀 | 묶음 이름이 없으면 문서 제목을 h2로(클래스 그대로라 CSS 영향 없음) | struct.mjs skips 1→3

### architect (훅 동작) — 없으면 ui
- FIX-12 | 중간 | architect | src/hooks/useInfiniteCarousel.ts (+ 신호: src/utils/scrollLock.ts 잠금 상태 구독, src/hooks/useNavMenu.ts 열림) | R7: 햄버거(블러 90% 면)·드롭다운(블러 덮개 99%)이 홈 셸프를 덮은 채 열려 있어도 셸프가 32px/s로 계속 흐름 → 블러 밑 배경이 매 프레임 바뀌어 전체 화면 블러를 60fps로 다시 그림. 메뉴를 열어 두기만 해도 GPU가 쉬지 않음(햄버거에선 셸프가 보이지도 않음) | 덮는 층(스크롤 잠금 — 햄버거·⌘K·서랍·시트, 드롭다운 열림)이 있는 동안 바로 정지, 닫히면 재개 | perf3.mjs(CPU 4×, 2초 정지 상태): 390 햄버거+흐름 DrawFrame 120·GPU 78.7ms / 셸프 정지 0·0.6ms / 블러 끔 120·35.4ms · 1280 드롭다운+흐름 121·113.2ms / 정지 0·0.1ms / 아무것도 안 엶 120·44.9ms

### data·chore (자산·index.html)
- FIX-13 | 중간 | data(자산) | my-study-app/public/logo.png(1,345KB·1024²) · public/profile.svg(1,315KB, 안에 1254² PNG) | 24px 로고·40/64px 프로필에 원본을 그대로 씀 → 홈·자료실 첫 방문 2.6MB, 다른 페이지 1.3MB(390, 캐시 끔). 리디자인 전부터 있던 것 — Ch9 범위 밖이면 기록만으로 | 같은 이름으로 작게 다시 저장(새 의존성 없이 macOS sips): 로고 96~144px, 프로필 192px — 코드 수정 0 | net.mjs
- FIX-14 | 낮음 | chore(또는 ui) | my-study-app/index.html:9-10 | Font Awesome CSS(cdnjs, 19KB, 렌더 차단) — 앱 사용 0(`<i>`·fa 클래스 렌더 없음). Ch9 목표 3 '사용처 0건' | `<link>`와 주석 삭제 | net.mjs + command grep

## 기록만 (이유)
- Ch2 드롭다운 작은 링크 32px · 메뉴 버튼 폭 28~39px(900): WCAG 2.5.8(AA, 24px) 충족, 드롭다운은 735px 이상 포인터 중심. 44px로 키우면 패널이 약 60px 길어져 목업과 달라짐(바꾸려면 사용자 결정).
- Ch3 홈 검색 ×: 브라우저 기본 취소 단추(Chrome 파란 ×), Esc로도 지움. 바꾸려면 직접 만든 지우기 버튼 + Tab 정지점 추가 = 디자인 결정.
- Ch3 INTRO_MS 등 상수 이전: HeroIntro.tsx:11-16 숫자는 home-intro.css의 ms 지연과 짝 — JS만 constants로 옮기면 짝이 세 파일로 흩어짐. 파일 머리 주석이 짝을 밝힘. §3-2를 엄격히 지키려면 architect 몫.
- Ch4 머리 줄 버튼 포커스 시 흐름 정지: 이미 됨 — 포커스 없을 때 32px/s, 일시정지 버튼 포커스 0px/s, 카드 링크 포커스 0px/s(shelf.mjs). 해소.
- Ch5 stacks.ts:16 크림 주석: Ch8에서 '밝은 배경 대비'로 고쳐짐. 해소.
- Ch5 MoreSection REPO_DATA.slice: HOME_MORE_PREVIEW_COUNT 사용 중. 해소.
- Ch5 히어로 군무 배지 흰 글자: aria-hidden 장식, 2.2초 연출에만, 동작 줄이기면 안 나옴. 사이드바·자료실 헤더·⌘K 모노그램 배지(2.57~4.11)도 모두 aria-hidden + 옆에 이름 글자 → 장식 예외.
- Ch6 AVATAR_SIZE ↔ --avatar: 주석이 짝을 밝힘, width/height 속성은 자리 잡기 힌트일 뿐 크기는 CSS.
- Ch7/8 시트 iframe 포커스 중 Esc: 교차 출처 PDF 뷰어라 키가 부모로 안 옴.
- 클래식 스크롤바에서 덮개가 스크롤바 칸을 안 덮음: scrollbar-gutter: stable 선택의 부작용, Windows 클래식 스크롤바의 오른쪽 띠만.
- ⌘K 입력칸 링 없음: 캐럿이 포커스 표시(command-palette.css:49 의도 주석), 열리면 늘 거기.
- 시트 iframe 포커스 링 없음: 안의 PDF 뷰어가 자체 링을 그림.
- 동작 줄이기에서 남는 색·투명도 페이드(body 테마 0.3s, hover 바탕 0.2s, topic-glide opacity): 움직임 아님.
- 시트 덮개 블러(pdf-preview.css:21-22): R7 허용 목록(바·덮개·셸프 가장자리) 밖이지만 스크롤 잠금 상태라 정적, 측정상 문제 없음.
- 건너뛰기 링크 없음: 랜드마크로 2.4.1 충족. 자료실은 본문까지 Tab 26번(권장 거리).
- 사이드바 그룹 section+aria-labelledby → region 랜드마크 6개(소음, 권장 거리).
- 세그먼트 선택 칸 바탕 대비 약 1.2:1: 굵기·그림자도 함께 표시(Apple 표준 모양).
- data의 icon: 'fa-…' 필드: 렌더 안 되는 죽은 데이터(FIX-14와 함께 정리 거리).
- ⌘K ↵ 이동 뒤 포커스 body: SPA 일반 동작.

## 감사 예외 판정 (목표 4 — chore-runner 재측정과 별개)
- 리터럴 색: styles 0(tokens.css 제외). 예외 인정 — home-latest.css:191-198 mask-image `black`(알파 신호, :187 주석. segment.css처럼 var(--label)로 통일은 선택), stacks.ts 주제 색·ProfileCard `siVelog.hex`→--brand(데이터 예외, Ch5 결정).
- 옛 변수 0.
- @media 폭 2종(734 ×14, 1068 ×1). 비폭 조건(hover, reduced-motion, `(orientation: landscape) and (max-height: 500px)` 높이 조건 — Ch7 결정) 인정.

## 사소한 것
- 낡은 주석: footer-misc.css:83·164, pdf-preview.css:147 "button 기본 규칙(reset.css)이 outline을 지우므로" — D6 뒤로 reset.css는 outline을 지우지 않음.

## 사용자 확인(D2) 권장 화면
1. `/` 1280 라이트·다크 — 셸프 '받기' hover 파란 채움(FIX-1), 첫 진입 연출 중 점 등장(FIX-5), 드롭다운 열어 둔 채 뒤 셸프 멈춤(FIX-12)
2. `/download/java` 900(iPad 또는 창 좁힘) 라이트 — '주제 전환'·사이드바 행 hover 색(FIX-2·3), Shift+Tab으로 거꾸로 갈 때 상단 바에 안 가림(FIX-4)
3. `/` 390 다크 iPhone — 햄버거 열고 잠시 두기(발열·버벅임, FIX-12), 로고·프로필 화질(FIX-13 뒤)

---

## 재검수 (2026-10-21)

### 판정: PASS — FIX-1~14 확인 14/14, 회귀 0
- 빌드 `npm run build` 통과(1738 모듈, CSS 71.66kB, JS 352.40kB), tsc 통과.
- 토큰: 바뀐 CSS의 새 리터럴은 `.sr-only`의 1px뿐(유틸 표준 값, base.css 주석에 예외 명시 — 인정).
- 하네스: 이번 세션 scratchpad `reviewer/*.mjs`(rd91 복사 + ax·plat·overlay·ovmouse·hvfix·intro·srlayout·scrollside·assets·imgdiff·misc3). HEAD(7bf9b88)는 `git archive` 사본을 같은 하네스로 돌려 비교.

### FIX별 확인 (측정값)
- **FIX-1** 셸프 '받기' hover 6장 × 라이트·다크 전부 4.70(이전 3.70/3.88), transition에 color.
- **FIX-2** 사이드바 행 hover(현재 행 제외 16행) 최소 라이트 12.43 / 다크 13.16(이전 4.22).
- **FIX-3** '주제 전환' hover(900) 최소 라이트 11.17 / 다크 10.75(이전 3.79).
- **FIX-4** Shift+Tab 7경로 × 1280·900·390 = 21조합 완전 가림 0·일부 가림 0(이전 1280 홈 2·자료실 2, 390 Books 9·자료실 2·NEW 1). 부작용 없음 — '자료실 둘러보기' 착지 topics.top 84px(1280·390 × 클릭·Enter × 동작 줄이기 켬/끔), 페이징 뒤 목록 top 64px, 사이드바 Shift+Tab 스크롤 값 모두 HEAD와 같음(사이드바는 main 밖). 앞으로 Tab 28조합 링 없음·3:1 미만·가림 0. 화면 전환 짝 그대로.
- **FIX-5** 연출 중 점과 셸프 불투명도 늘 같음(1280: 1866ms까지 0 → 2018ms 0.15 → 2476ms 1 / 390: 1696ms까지 0 → 1848ms 0.54). 동작 줄이기면 처음부터 1, 애니메이션 0.
- **FIX-6** 23경로 × 1280·390 = 46조합에서 h1 + ' — JM Hub', 홈 'JM Hub', /download/zzz·/nope '페이지를 찾을 수 없어요 — JM Hub'. SPA 이동(홈 → Java → Kotlin → 뒤로 → Books → 로고)마다 갱신.
- **FIX-7** 모든 `target="_blank"` 접근 이름을 CDP AX로(23경로 × 2폭, 드롭다운 4, 햄버거, 시트): '새 탭' 정확히 1번·끝이 '(새 탭)'(시트는 '새 탭에서 열기'). 홈 1280 14/14, Books 23/23, 햄버거 15/15, 드롭다운 GitHub 5/5·Vibe 4/4. 숨김 글자 뺀 전후 위치 차이 0, 새는 `.sr-only` 0, 390 가로 넘침 0.
- **FIX-8** role=status 1개, 처음 빈 값 → 'spring' 1건 / 'zzzz' 0건 / 'a' 5건(보이는 행 수와 같음) → 지우면 빈 값. 레이아웃 영향 0.
- **FIX-9** Mac '⌘K', Windows·Linux 에뮬레이션 'Ctrl K' — kbd와 버튼 aria-label('검색 (Ctrl K)') 함께. 'Ctrl K'(47px)도 입력 글자 칸과 안 겹침, Ctrl+K로 열림.
- **FIX-10** 'Java 25개 문서'(11자)·'Spring Boot 21개 문서'(18자), 이전 91자. 설명은 따로 읽힘.
- **FIX-11** 자료실 17개 전부 + 없는 키 × 1280·390 제목 건너뜀 0.
- **FIX-12** perf3(CPU 4×, 2초 정지): 390 햄버거 DrawFrame 120 → 0·GPU 78.7 → 0.4ms, 1280 드롭다운 121 → 0·113.2 → 0.6ms, 아무것도 안 열면 120·49.8ms로 흐름. 층 카운트: 햄버거+⌘K·시트+⌘K는 마지막 층을 닫을 때만 false, 드롭다운+⌘K는 ⌘K 여는 순간 드롭다운이 닫힘(기존 동작, 카운트 정상). 라우트 이동·언마운트·햄버거 연 채 홈 이동 뒤 false, 음수 0. 여는 순간 정지(첫 100ms 0px), 정수 scrollLeft, 닫은 뒤 튐 0 → 램프 → 32px/s. hover·일시정지·화면 밖·holdAfterInteract·포커스·동작 줄이기와 겹쳐도 각 조건 유지.
- **FIX-13** logo.png·profile 내장 PNG 192², rx 258 유지. 3배 밀도 스크린샷 HEAD 대비 평균 채널 차 0.12~0.83/255(가장자리 재표본뿐). 홈·자료실 첫 진입 이미지 2.6MB → 63KB.
- **FIX-14** cdnjs/Font Awesome 요청 0, 'fa-' 0. icon 필드를 뺀 데이터 4파일은 공백 정규화 비교 시 icon만 빠짐, pdfs 96건 그대로.
- **사소한 것(낡은 주석)** 3곳 고쳐짐.

### 새로 발견 (모두 HEAD 7bf9b88에도 있던 기존 동작 — 회귀 아님)
- 낮음: 셸프 위에 마우스를 둔 채 ⌘K를 열고 닫으면 흐름이 다시 시작(덮개가 DOM에서 빠질 때 React onPointerEnter가 다시 안 옴). → 리드가 마감 김에 수정 지시(architect, useInfiniteCarousel 층이 걷힐 때 `:hover` 다시 읽기).
- 낮음: 미리보기 시트를 연 채 뒤로 가기로 다른 과목에 가면 시트가 이전 과목 문서로 남음. → 수정 지시(ui, DownloadPage 과목 키가 바뀌면 시트 닫기).
- 사소: `platform.ts:4` `??`는 userAgentData.platform이 빈 문자열이면 navigator.platform으로 안 넘어감. → 리드가 `||`로 수정.

### 사용자 확인(D2) 권장 화면
1. `/`·`/download/java`·`/books` 1280 라이트·다크(Mac) — 셸프 '받기' hover가 자료실 '받기'·Books 구매 알약과 같은 파란 채움 + 흰 글자(FIX-1·RD-9-2a), 새로고침 직후 점이 셸프와 함께 등장(FIX-5), 드롭다운을 연 채 셸프 정지 → 닫으면 부드럽게 재개(FIX-12)
2. `/download/java` 900(iPad 또는 창 좁힘) 라이트 — '주제 전환'·사이드바 행 hover 글자색(FIX-2·3), 아래에서 Shift+Tab 거꾸로 갈 때 상단 바에 안 가림(FIX-4), 탭 제목 'Java — JM Hub'(FIX-6)
3. `/` 390 다크(iPhone 실기기) — 햄버거 열고 10초 두기(발열·버벅임, FIX-12), 로고·프로필 선명도·둥근 모서리(FIX-13), VoiceOver면 Velog 링크 '(새 탭)' 한 번(FIX-7)

### 추가 재검수 (2026-10-21, 새로 발견 3건)
판정: **PASS** — 3건 모두 해결, 회귀 0. 빌드 통과(tsc 포함, JS 352.69kB, CSS 71.66kB).
- **셸프 hover + ⌘K 재개** (useInfiniteCarousel.ts — 리뷰어 안 `:hover` 다시 읽기는 층이 걷히는 순간 false라, hover를 영역 요소의 native pointerenter/leave로 받게 바꿈): 마우스를 둔 채 ⌘K 열고 Esc → 그대로·1px 움직여도 0px/s(이전 32), 빼면 32. 드롭다운도 같음. 터치(390) 탭 뒤 남은 `:hover`에 안 붙잡힘(hold 6초 뒤 32.5). StrictMode·로고 재진입·뒤로 재진입 뒤 리스너 각 1개. 머리 줄 버튼·카드 링크 포커스 0px/s. FIX-12 회귀(overlay A~N, perf3 DrawFrame 0·GPU 0.1~0.7ms) 그대로.
- **시트 + 뒤로 가기** (DownloadPage.tsx:97-104 `previewKey`): kotlin에서 시트 연 채 뒤로(java) → 시트 없음·html/body 잠금 해제·덮는 층 false, 새 과목 h1과 이전 시트가 함께 있던 순간 0(한 커밋에서 닫힘). 앞으로 가기·시트 위 ⌘K → 다른 과목도 같음, 콘솔 오류 0. 같은 과목 안 세그먼트·페이지·시트 열고 닫기 정상, Esc 닫기 → 그 행 미리보기 버튼으로 포커스 복귀. 화면 전환 짝(sheet-open·close, 홈 → 자료실, 사이드바) ready ok. 과목이 바뀌어 닫히면 포커스는 body(SPA 이동 일반 동작, 기록만).
- **platform.ts `??`→`||`**: userAgentData.platform이 빈 문자열인 에뮬레이션(iPhone UA)에서 'Ctrl K' → '⌘K'. Mac '⌘K'·Windows/Linux 'Ctrl K' 그대로.

### RD-9-7 검수 (2026-10-21, D2 사용자 요청 — 사이드바 가장자리 블러 페이드)
판정: **PASS**. 빌드 통과(CSS 72.92kB, JS 353.42kB).
- **① 화면 전환 짝:** 홈 행·대표 타일(1280·390) → 자료실(side-nav·dl-title·dl-count·dl-badge·site-header), 사이드바 행 → 다른 주제, 시트 열기·닫기(pdf-sheet) 모두 ready ok, 콘솔 오류 0. 기록만: 자료실 첫 진입 때 아래 띠가 --dur-fast 동안 페이드 인(무해).
- **② 블러 층(R7):** 1280 평소 바 + 아래 띠(0.9%) = 2층·최대 겹침 1 / 사이드바 가운데 3층·겹침 1 / 끝 2층 / 시트 열림 바 + 띠 + 덮개 3층·겹침 2(이전과 같음) / 서랍(900·390) 2층·겹침 1. 꺼진 띠는 visibility hidden + opacity 0 — LayerTree backdrop 합성 레이어 0. 닫힌 서랍 안 띠도 합성 0, 본문 스크롤 GPU 띠 뺐을 때와 같음(27.6 vs 29.5ms, CPU 4×). 넘침 없으면(1280×1600) 띠 없음.
- **③ 통과·대비:** 띠 자리 elementFromPoint = 아래 행, hover 바탕·클릭 이동 정상. 글자 대비 스캔(/download/java·spring × 1280·900 × 라이트·다크) 검사·실패 수 RD-9-1과 같음(실패는 aria-hidden 모노그램뿐).
- **④ 리터럴:** 새 색은 마스크 `black` 4곳(알파 신호 예외 주석), 새 px 0.
- **⑤ 경계·크기 변화:** 1069↔1068·서랍 열고 닫기·높이 600/1600/700·900·390·가운데 스크롤 14단계 — data-fade 속성과 실제 넘침 MISMATCH 0.
- **⑥ 띠 끝 위치**(사용자 지적 '틈' 수정 — sticky 오프셋에 스크롤러 padding이 이중으로 들어가 12px 떠 있던 것 → `top: 0`/`bottom: 0`): 1280·900 서랍·390 서랍 × 맨 위·중간·맨 끝 × 라이트·다크 18조합 틈 0px(위·아래·좌우). 픽셀 확인 — 끝 1px 줄 내용 노출 2~9%(띠가 끝 줄까지 덮음), 안쪽 24px에서 93~95%. 행 위치 HEAD·띠 칸 제거 때와 같음. 사이드바 Tab·Shift+Tab 띠 가림 0px, 자료실 전체 Shift+Tab 12조합·Tab 6조합 가림 0. Chrome만 측정(Safari는 도구 없음 — 사용자 D2 눈 확인 OK).
