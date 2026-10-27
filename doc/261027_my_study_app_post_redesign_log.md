# my-study-app 리디자인 이후 작업 기록 (Ch9 이후)

- **작성일:** 2026-10-27 · **브랜치:** `feat/apple-redesign` · **기준 커밋:** `297dba4`
- **관련 문서:** [리디자인 기록](./261021_my_study_app_redesign_log.md)(Ch0~Ch9) · [로드맵](./261018_my_study_app_redesign_roadmap.md) · [인수인계](./261011_my_study_app_handover.md)(§4 도서 추가 절차 — 10-27 갱신) · 새 세션 입력 문구 [`261027_new_session_prompt.txt`](./261027_new_session_prompt.txt)
- **목적:** 리디자인 마감(Ch9) 뒤 사용자 요청으로 화면을 더 고친 내용, 정한 값, 남은 일을 이 문서 하나로 남긴다. 에이전트 팀(`/redesign`) 없이 한 세션에서 요청을 하나씩 처리했고, 디자인 정본은 캔버스가 아니라 **지금 코드**다(아래 변경은 시안에 없다).

---

## 0. 요약

Ch9 이후 요청 열두어 개를 처리했다. 상단 바를 흰색으로, 자료실을 "왼쪽 끝에 붙은 사이드바 + 가운데 본문" 구조로, 소분류 막대를 Apple Mac 페이지식 알약(칸 사이를 미끄러지는 선택 표시)으로 바꿨다. Books는 Apple iPhone '라인업 살펴보기' 방식의 가로 진열대와 그리드 보기를 둘 다 지원하게 했고, 책 5권을 더했으며, 카테고리를 11개에서 6개로 줄였다. 마지막으로 Books 모바일의 막대·카드를 한 단계 줄였다(`297dba4`).

## 1. 현재 상태 (2026-10-27)

| 항목 | 상태 |
|---|---|
| 브랜치 | `feat/apple-redesign` — `main`보다 **14커밋** 앞섬(Ch0~Ch9 10개 + 이후 4개: 아래 3개 + 이 문서를 담은 `docs` 커밋) |
| 이번 커밋 | `849397b` 자료실 사이드바 좌측 고정 열·소분류 알약 막대·헤더 흰색 · `045d687` Books 진열대·그리드 보기, 책 5권 추가, 카테고리 6개 · `297dba4` Books 모바일 막대·카드 축소 · 그 뒤 `docs`(이 문서·새 세션 문구·인수인계) |
| 미커밋 | 없음 — 아래 '작업 트리' 항목(이번 작업과 무관)만 남아 있다 |
| 병합·push | 🙋 D7 보류 중(사용자 명시 승인 전까지 하지 않는다) — 로드맵 RD-9-6. 이번 커밋들도 push하지 않았다 |
| 빌드 | `npm run build` 통과 (1739 모듈, JS 359.7kB / gzip 114.8kB, CSS 77.4kB / gzip 13.1kB) |
| 작업 트리(이번 작업과 무관) | 파일 권한 변경 192건(외장 볼륨), `README.md` 수정, 미추적 `gateway/` — 커밋에 넣지 않는다. 스테이징은 `git -c core.fileMode=false add <파일>`, `doc/*.md`는 `.gitignore`(`*.md`)에 걸려 **`git add -f`** |

## 2. 한 일

### A. 상단 바 흰색
- `tokens.css` 라이트 `--bar-bg: rgba(255,255,255,.8)`, `--bar-bg-open: rgba(255,255,255,.97)`. 다크(검정 계열)는 그대로.
- 시안(`doc/261018_redesign_mockups/`)은 회색 바(`rgba(245,245,247,.8)`)라 **시안과 다르다** — 코드가 최신.

### B. 자료실 레이아웃 — 왼쪽 끝 사이드바
- 사이드바: `position: fixed; left: 0`, 상단 바 아래부터 화면 맨 아래까지, 폭 `--sidebar-w` **360**(320→360), 모서리·그림자·테두리 없이 `--sidebar` 색만 다름. 안쪽 여백 위아래 `--side-pad` 12 · **좌우 `--side-pad-x` 15**(12→15, 흐림 띠 `inset-inline`도 같이).
- 본문 `.main-content`는 사이드바를 뺀 영역의 **가운데**(최대 760). `.download-layout`은 `padding-left: --sidebar-w + --dl-pad-l`. 푸터는 `margin-left: --sidebar-w`로 사이드바 열 오른쪽에서 시작(이전엔 사이드바가 푸터 위로 89px 겹쳤다).
- ≤1068 서랍은 그대로 둥근 떠 있는 패널 — 둥글림은 서랍 블록의 `border-radius: var(--r-card)`로 옮겼다. 서랍도 같은 `--sidebar-w`(폰에서는 화면 폭에 눌려 318px).
- 지운 것: `.download-layout::before` 자리표시, `--dl-side*`, `--container-wide`.
- 1069px에서 본문 폭은 686→646px까지 줄어든다(가로 넘침 없음).

### C. 자료실 제목 옆 글자 배지 제거
- 자료실 헤더의 `Jv·Kt·Sp…` 큰 배지 삭제(마크업·`topicStyle` import). `.dl-head-badge`는 Books·GitHub·Vibe의 **아이콘** 배지만 남아 `--mono` 수식자 없이 단일 규칙(`--label` 바탕 + `--surface` 글자).
- ≤734 헤더는 `.dl-head:has(.dl-head-badge)`일 때만 2열 그리드 — 배지 없는 자료실은 제목 아래 '25개 문서'.
- **남겨 둔 곳:** 사이드바 행의 글자 배지, 홈 주제 목록·히어로 배지, ⌘K 결과 배지. (사용자가 "자료실 메인"이라 해서 본문만 지웠다 — 사이드바도 지우려면 `Sidebar.tsx`의 `.sidebar-badge`)

### D. 소분류 세그먼트 막대 (`SegmentBar.tsx` · `segment.css`) — 자료실·Books·Vibe 공용
- **모양:** 알약 막대 `--seg-bg #E8E8EF`, 선택 알약 `--seg-thumb #1D1D1F`, 선택 글자 `--seg-thumb-label #FFFFFF`(사용자 지정). 다크는 내가 정함: `#2C2C2E` / `#F5F5F7` / `#1D1D1F`(반전).
- **움직임:** 선택 표시는 칸마다가 아니라 `.seg-thumb` **하나**. `SegmentBar`가 선택 칸의 위치·폭을 `getBoundingClientRect`로 재서(바 기준 상대값) `--thumb-x`·`--thumb-w`로 넘기면 `transform`·`width` transition(0.3s, `--ease-drawer`)으로 미끄러진다. 글자색도 같은 시간·곡선. 처음 그릴 때는 제자리, 한 프레임 뒤 `data-ready`에서 transition 켬. `ResizeObserver`로 글꼴 로딩·창 크기 변화 재배치. 선택한 칸이 가려져 있으면 막대도 부드럽게 따라 스크롤(처음·동작 줄이기는 즉시). 선택해도 글자 굵기는 안 바꾼다(칸 폭이 변해 알약 경로와 어긋나므로).
- **크기(데스크톱):** 칸 44px · 글자 17px(`--fs-body`) · 숫자 15px · 좌우 20px · 위아래 바 여백 `--seg-pad-y` **5.5px**(4→5.5, 사용자 +1.5px) → 바 55px. ≤734는 칸 좌우 16px.
- **접근성:** `aria-pressed` 유지, 고대비(forced-colors)에서 선택 표시가 사라지지 않게 `Highlight` 폴백, 대비 라이트 4.68~16.83 · 다크 5.42~15.46.
- `SegmentTab`에 선택 필드 `icon`·`ariaLabel` 추가(Books 보기 전환이 쓴다). 지운 토큰: `--shadow-thumb`.

### E. Books 페이지 (`BooksPage.tsx` · `BookShelf.tsx` · `books.css` · `data/books.ts`)
- **진열대(기본):** Apple iPhone '라인업 살펴보기' 방식. 카드 = 큰 둥근 표지 타일(`--r-tile`, 비율 4/5) + 가운데 정렬 글(분류 · 제목 · 설명 · 저자) + 파란 채움 구매 알약(`--accent-fill`, hover `--accent-fill-hover`). 카드 폭 300. 카드 줄만 화면 끝까지(풀블리드 — `.bk-page`가 `container-type: inline-size`, 인셋은 `100cqw` 계산, 홈 셸프와 같은 방식), `scroll-snap-type: x mandatory`, 첫 카드는 헤더 왼쪽선에 맞춤.
- **이전·다음:** 줄 아래 오른쪽 원형 버튼, 한 화면에 온전히 보이는 카드 수(데스크톱 3장 = 960px)만큼 넘김. 끝에 닿으면 `aria-disabled`로 흐리게(`disabled`는 포커스를 빼앗는다). 줄이 한 화면에 다 들어가면 버튼을 안 그리고, ≤734는 숨김(손으로 밀기).
- **양 끝 블러 페이드:** `.bk-fade`(홈 셸프 `.latest-fade`와 같은 방식 — 바탕색 그라디언트 + `--blur-edge`), **가려진 쪽만** 켜진다(처음엔 오른쪽만, 끝에서는 왼쪽만). 폭 64(모바일 40). `pointer-events: none`.
- **그리드:** 같은 카드를 4열(`--bk-grid-min` 232px), 제목만 17px. ≤734는 한 열 가로 카드(표지 썸네일 왼쪽 — Ch8 사용자 결정 모양 유지). 데스크톱 4열 기준 23권이 5줄(페이지 높이 약 3,380px).
- **보기 전환:** 태그 탭 **왼쪽**에 아이콘 두 개(`GalleryHorizontal`·`LayoutGrid`), `SegmentBar` 재사용. 선택은 `localStorage['tech-docs-books-view']`(`shelf`|`grid`, 기본 shelf, try/catch). 주소(`?tag=`)와 달리 URL에 싣지 않는다 — 상단 메뉴 링크로 들어와도 유지. ≤734에서는 전환이 위, 태그 탭이 그 아래.
- **데이터:** 책 18→**23권**(오브젝트 · 클린 아키텍처 · 개발자를 위한 쉬운 도커 · 혼자 공부하는 컴퓨터 구조+운영체제 · 주니어 백엔드 개발자가 반드시 알아야 할 실무 지식). 추가 전 구매 링크 5개(교보 4 실제 브라우저로 제목 확인, YES24 1)와 표지 5개 확인. `STORE_LABELS`에 `yes24.com → YES24`.
- **카테고리 11→6:** 아래 표. 모든 책에 태그가 하나 이상 있다(없으면 '전체'에서만 보임). 두 군데 속하는 책: 아파치 카프카(Data & Infra + Java & Spring), 이것이 Spring AI다(Java & Spring + AI), 면접을 위한 CS 전공지식 노트(CS + Career). 옛 `?tag=Java` 같은 주소는 '전체'로 열린다.

| 카테고리 | 권수 | 합친 옛 태그 |
|---|---|---|
| Java & Spring | 7 | Java, Spring Boot, Testing |
| Architecture | 5 | — |
| Data & Infra | 5 | Database, Kafka, Docker |
| CS | 4 | CS, Network |
| Career | 3 | — |
| AI | 2 | — |

  (`CS & Network`는 1440px에서 탭 막대가 38px 넘쳐 `CS`로 줄였다. 상단 Books 메뉴 3개: Java & Spring · Architecture · Data & Infra)

### F. Books 모바일(≤734) 축소 — `297dba4` (`books.css`의 모바일 블록만, 자료실·Vibe의 같은 막대는 그대로)

| 항목 | 전 | 후 |
|---|---|---|
| 보기 전환 | 112×55 (버튼 50×44, 아이콘 18) | 92×44 (버튼 40×36, 아이콘 16) |
| 소분류 막대 | 높이 55 · 칸 44 · 글자 17 · 숫자 15 | 높이 44 · 칸 36 · 글자 15 · 숫자 13 |
| 진열대 카드 | 256×551 (타일 256×320) | 208×472 (타일 208×250, 비율 5/6) |
| 진열대 글자 | 제목 19 · 설명 15 · 저자 15 | 제목 17 · 설명 13 · 저자 13 |
| 그리드 카드 | 썸네일 76×106, 높이 189~236 | 썸네일 60×84, 높이 168~205, 제목 15 |
| 구매 알약 | 높이 32 | 높이 28 (눌리는 영역은 44 유지) |

## 3. 결정 기록

- **사용자 결정:** 헤더 흰색(Apple 참고) · 사이드바 왼쪽 밀착·라운드 제거·색만 다르게 · 폭 확대와 안쪽 요소 확대 · 안쪽 좌우 +3px · 소분류 알약(`#E8E8EF`/`#1D1D1F`)과 슥슥 이동 · 위아래 +1.5px · 더 크게 · 자료실 글자 배지 제거 · Books를 iPhone 진열 방식으로 · 양 끝 블러 · 그리드 보기 지원 · 전환 왼쪽/탭 오른쪽 · 카테고리 추상화 · 책 5권 · 모바일 막대·카드 축소.
- **내가 정한 값(되돌려도 된다):** 다크 세그먼트 색 · 카테고리 묶음과 이름(`Java & Spring`/`Data & Infra`/`CS`…) · 책별 태그 배정 · 진열대 카드 폭 300/208·타일 비율 · 그리드 4열·한 열 가로 카드(모바일) · 보기 선택을 `localStorage`에 기억 · 모바일 축소 수치 · 구매 알약 hover 토큰 `--accent-fill-hover`(#0066CC / 다크 #0062C9) · 아이콘 선택.
- **Ch8 사용자 결정을 바꾼 것:** Books ≤734의 "가로 카드" → 진열대 모드는 스와이프 카드로(그리드 모드는 가로 카드 유지).

## 4. 검증 방법과 결과

새 의존성 없이 **헤드리스 Chrome + CDP**(Node 24 전역 `WebSocket`)로 측정했다. 스크립트는 세션 스크래치패드에 있었고 저장소에는 없다 — 필요하면 같은 방식으로 다시 쓴다(`--remote-debugging-port` + `Page.navigate` / `Runtime.evaluate` / `Page.captureScreenshot` / `Input.dispatchMouseEvent`). 개발 서버 `npm run dev`(3000) 필요.

- 레이아웃: 사이드바 `[0, 52, 360, 848]`·모서리 0·그림자 없음, 본문 열 중앙(1440: 중심 873 vs 영역 중심 872.5), 푸터 겹침 0, 1069/1068 경계·390 가로 넘침 없음, 서랍 열림에서 둥근 모서리·그림자 유지.
- 세그먼트: 클릭 70ms에 알약이 시작·목표 사이(예: x=659, 폭 123), 도착 후 칸과 소수 픽셀까지 일치, 가려진 칸 선택 시 `scrollLeft` 31/142 이동. 라이트·다크·모바일·Books·Vibe 모두 일치.
- Books: 카드 높이 일정, 제목·설명 말줄임 0, 버튼 클릭 960px 정확히 이동·복귀, 탭 7개 모두 카드 수 = 탭 숫자, 책 5권 표지 브라우저 로드 성공, 페이드 상태 시작/중간/끝 정상.
- **스크롤 문의:** "스크롤 내린 채 책 카테고리를 누르면 위로 올라간다" — 탭 막대는 안 움직인다(화면 3종·탭 10개·직접/메뉴 진입 20+조합에서 0). 올라가는 건 **상단 Books 드롭다운 링크**(PUSH → `useScrollTopOnPush`가 `instant`로 맨 위, Ch8 FIX의 의도된 동작). 즉시 한 번 점프이지 부드러운 이동이 아니다.

## 5. 알려진 한계·남은 일

- **nginx CSP:** `nginx.conf`의 CSP가 `cdn.jsdelivr.net`을 허용하지 않는데 PDF 미리보기 iframe(`PdfPreview.toEmbeddable`)과 Pretendard CSS(`index.css`)가 jsDelivr를 쓴다. `frame-src`는 `default-src 'self'`로 떨어져 **Docker/nginx 배포에서만** 미리보기가 막힐 가능성이 크다(Netlify는 CSP 헤더 없음). 정적 읽기 추론이고 실행 확인은 안 했다. `cdnjs.cloudflare.com`은 Font Awesome 제거(Ch9)로 이제 필요 없다. → `style-src`·`font-src`·`frame-src`에 jsDelivr 추가 검토.
- **README.md(미커밋)가 현재와 어긋남:** "15개 주제 문서 86건·책 13권"(실제 17키·96건·23권), 문서 추가 안내의 `{ icon, … }`(icon 필드 삭제됨, `addedAt` 필수), `.t-<key>` 색(Ch8에서 삭제), "레거시 `css/common`·`css/components`를 React가 `@import`하니 지우면 안 됨"(Ch9에서 끊김). → 레거시 정적 사이트 삭제 여부도 이 결정에 걸려 있다.
- **Dockerfile:** 상단 주석과 `COPY src/main/resources/static/css/`는 Ch9 이후 필요 없다(무해).
- **로드맵 부록 B:** Ch9 커밋 칸이 비어 있다 → `61659af`로 채우면 된다(다음 챕터가 없어 안 채워졌다).
- **D7 main 병합·push:** 보류. 병합하면 `main`이 14커밋(리디자인 전체 + 이후 작업)을 받는다.
- **사이드바:** 주제 17개가 1440×900에 안 들어가 안에서 스크롤(스크롤바 숨김, 위아래 블러로 암시). 끝에서 더 굴리면 페이지가 같이 스크롤(`overscroll-behavior: auto`) — 요청이 없어 안 고쳤다.
- **Books 스크롤 문의 후속:** 상단 메뉴 링크로 같은 페이지에서 태그만 바꿀 때 맨 위로 올리는 동작을 유지할지(현재) 스크롤을 그대로 둘지는 사용자 결정 대기.
- **Books 진열대 '전체'는 23장이 한 줄**(약 7,800px) — 그리드 보기가 대안. 『클린 아키텍처』 표지는 원본(YES24) 자체가 흰 바탕에 옅은 글씨라 흐려 보인다.
- 시안(`261018_redesign_mockups/`)에는 위 변경(흰 헤더·밀착 사이드바·알약 막대·Books 진열대)이 없다. 시안을 고치려면 별도 작업.
- Ch9에서 넘어온 것: 저사양 폰 GPU 실기기 확인, 클래식 스크롤바에서 덮개가 스크롤바 칸을 안 덮음, 시트 iframe 포커스 시 Esc.

## 6. 다음 작업자에게

- **도서 추가:** [인수인계 §4](./261011_my_study_app_handover.md#4-추천-도서-추가-절차--databooksts). 이제 태그는 6개 추상 카테고리(`BOOK_FILTER_TAGS`) 중에서 **하나 이상** 고른다. 표지·구매처는 교보 말고 YES24·출판사도 쓴다(`https:` 어디든 CSP `img-src`는 통과). 구매 버튼 이름은 `BooksPage.tsx`의 `STORE_LABELS`(교보문고·YES24·쿠팡·스마트스토어).
- **세그먼트를 쓰는 새 화면:** `SegmentBar`를 그대로 쓰면 알약·슬라이드·스크롤 따라가기가 따라온다. 모바일에서 따로 줄이려면 Books처럼 페이지 CSS에서 `--seg-pad-y`와 `.seg-btn`을 덮는다(공용 `segment.css`는 건드리지 않는다).
- **`container-type: inline-size`를 쓰는 곳(`.home-page`, `.bk-page`)** 안에는 `position: fixed` 요소를 두지 않는다(containing block이 바뀐다).
- 화면을 고칠 때: 토큰만(리터럴 색은 `tokens.css`에만), 모바일 폭 경계는 734·1068 두 값만, `npm run build`, 사용자 확인 뒤 커밋.
