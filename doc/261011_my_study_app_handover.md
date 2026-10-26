# my-study-app 인수인계 (2026-10-11 기준)

- **작성일:** 2026-10-11
- **기준 커밋:** `2522a9e` (feat: 추천 도서 5권 추가) — `main`, **미push 2커밋**
- **관련 문서:** [오늘 작업 기록](./261011_my_study_app_content_add_log.md) · [화면 확인·UI 수정 기록](./261011_my_study_app_ui_check_fix_log.md) · [디자인 이슈 목록](./260803_issue.md) · [버전 관리 목록](./260711_my_study_app_version_control_list.md)
- **목적:** 다음 작업자가 현재 상태, 남은 일, 자료·도서 추가 절차를 이 문서 하나로 파악할 수 있게 한다.
- **갱신 (2026-10-21, 리디자인 Ch9):** §3·§4 절차와 §5를 Apple 스타일 리디자인 뒤 코드에 맞췄다. §1·§2는 10-11 시점 기록 그대로 — 지금 상태는 [리디자인 기록](./261021_my_study_app_redesign_log.md) §1.
- **갱신 (2026-10-27):** §2 #3(도서 태그 결정)은 해결됐고 §4를 책 23권·카테고리 6개 기준으로 고쳤다. Ch9 이후 변경은 [Ch9 이후 작업 기록](./261027_my_study_app_post_redesign_log.md).

---

## 1. 현재 상태

| 항목 | 상태 |
|---|---|
| 브랜치 | `main`, `origin/main`보다 **2커밋 앞섬** (`62e8f35`, `2522a9e`) |
| push | **안 함** — 사용자가 보류 요청 |
| 빌드 | `npm run build` 통과 |
| 화면 확인 | 10-11 저녁 6개 항목 **통과** — 단, 그 뒤 작업 트리 변경 전 상태 기준 ([기록](./261011_my_study_app_ui_check_fix_log.md)) |
| 미커밋 UI 수정 (10-11 저녁) | 도서 구매 버튼 문구(`BooksPage.tsx`), 스택별 문서 비율 내부 스크롤(`StackRatio.tsx`, `home-rails.css`) |
| 작업 트리 (이번 작업과 무관) | 파일 권한 변경 193건(100644→100755), `README.md` 내용 수정(+142/-12), 미추적 `gateway/`. 10-11 20:25 이후 다른 변경 11개 파일 — [기록 §4](./261011_my_study_app_ui_check_fix_log.md#4-이-작업-이후-작업-트리에-생긴-다른-변경) |
| 원본 자료 | `temp/261011/` 그대로 남아 있음 (`*.md`라 gitignore 대상) |

## 2. 남은 일

| # | 할 일 | 비고 |
|---|---|---|
| 1 | ~~화면 확인~~ → **완료(10-11 저녁)**, 재확인 필요 | 6개 항목 통과. 그 뒤 작업 트리가 바뀌어 다시 봐야 한다. 확인 중 나온 UI 수정 2건의 커밋과 남은 일은 [화면 확인·UI 수정 기록 §5](./261011_my_study_app_ui_check_fix_log.md#5-남은-일) |
| 2 | **push** | 사용자 확인 후 `git push origin main` |
| 3 | ~~도서 태그 결정~~ → **해결(10-27)** | 모든 책에 태그가 있고 카테고리는 6개로 정리됐다([Ch9 이후 기록](./261027_my_study_app_post_redesign_log.md) §2-E). 태그 목록은 `data/books.ts`의 `BOOK_FILTER_TAGS`. |
| 4 | `temp/261011/` 정리 | 반영 완료된 원본. 지울지 보관할지 사용자에게 확인 |
| 5 | 권한 변경 193건 정리 | 외장 볼륨(`/Volumes/dev`) 영향으로 보임. 되돌릴지, `git config core.fileMode false`로 무시할지 결정 필요. 그 전까지는 커밋할 때 `git -c core.fileMode=false add <파일>`로 스테이징 |

## 3. 자료실 문서 추가 절차

### 3.1 기존 카테고리에 문서 추가 — `data/pdfs.ts`만 수정

1. `upload.md`의 `https://github.com/dev-jm-1024/study-doc-hub/blob/main/<경로>`를 `https://raw.githubusercontent.com/dev-jm-1024/study-doc-hub/main/<경로>`로 바꾼다. 파일명에 공백·한글이 있으면 퍼센트 인코딩(예: 공백 → `%20`).
2. `curl -sI <raw 주소>`로 200인지 확인한다.
3. `MENU_DATA['<키>']`에서 순서에 맞는 자리에 `{ title, description, pdfUrl, addedAt }`를 넣는다. (`icon` 필드는 2026-10-21 Ch9에서 없앴다 — Font Awesome을 더 쓰지 않는다.)
4. **`addedAt: 'YYYY-MM-DD'`를 꼭 넣는다** — PDF를 연결한 날(오늘). 홈 '최근 올라온 문서' 셸프·이번 달 달력 점·히어로 NEW 알약·드롭다운 NEW(`NEW_BADGE_DAYS` 21일)가 이 값으로 계산된다. 없으면 이 네 곳에 안 나온다. 옛 문서의 날짜 근거는 계획서 §4.6(git 이력 첫 커밋).
5. **그 카테고리에 `section`을 쓰는 항목이 하나라도 있으면** 새 항목에도 `section`을 꼭 붙인다(없으면 이름 없는 묶음으로 따로 모인다). 현재 section을 쓰는 곳은 `spring`, `java`.
   - 소분류가 2개 이상이면 자료실 위에 세그먼트(전체 · 소분류별)가 생긴다. 소분류 순서 = 처음 나온 순서.
   - 페이징은 소분류와 상관없이 10개 단위(`DOWNLOAD_PAGE_SIZE`, `utils/paginateSections.ts`) — 소분류가 페이지를 넘어가면 '앞 페이지에서 이어짐'이 붙는다.
   - 제목 앞 번호(`1. `)는 번호 칸으로 떼어 그린다. 번호가 없으면 소분류 안 순번.

### 3.2 새 카테고리 추가 — 참고 커밋 `e6c56ba`(Docker), `62e8f35`(system-design)

| 파일 | 할 일 | 필수 |
|---|---|---|
| `data/menus.ts` | `{ key, name, group }` — 상단 '자료실' 드롭다운·사이드바·⌘K가 여기서 자동으로 만들어진다 | ✅ |
| `data/pdfs.ts` | `MENU_DATA[key]` | ✅ |
| `data/topics.ts` | `BADGE`(2글자), `DESC`(한 줄 설명), `ALIASES`(한글 검색어) | 권장 — 없으면 배지는 이름 앞 2글자 |
| `data/stacks.ts` | `STACK[key] = { color, icon? }` — **주제 색의 유일한 출처**(배지 — 사이드바·자료실 헤더·⌘K·히어로 연출, 홈 문서 비중 막대, GitHub 언어 점). simple-icons에 로고가 있으면 `si<Name>` import | 권장 — 없으면 주제 색 없음 |
| `data/notices.ts` | 공지가 필요할 때만 | 선택 |

**주의할 점**
- **그룹:** 홈(`HomePage.tsx`)은 `topics.ts`의 `GROUP_ORDER`에 있는 그룹만 그린다. 새 그룹 이름을 쓰면 사이드바에는 나오지만 홈에는 안 나온다. 기존 그룹을 쓰거나 `GROUP_ORDER`에도 추가한다.
- **하이픈 키:** `system-design`처럼 하이픈이 있으면 객체 키에 따옴표가 필요하다(`'system-design': ...`).
- **대소문자:** 라우트는 대소문자를 무시하지만(`utils/category.ts`), `STACK`·`BADGE`·`DESC`는 `menus.ts`의 키와 **글자 그대로** 맞춘다(`JUnit`). 옛 `.t-*` 색조 클래스와 `tintClass`는 Ch8에서 없앴다 — 주제 색은 `topicStyle(key)`(`data/topics.ts`)가 `STACK[key].color`를 인라인 `--topic`으로 넣는다.
- **NEW 표시:** 가장 최근 `addedAt`이 21일 안이면 그 자료실이 히어로 NEW 알약·드롭다운 NEW로 뜬다(`utils/home.ts` `newestTopic`·`isNewTopic`). 새 카테고리를 열 때 `addedAt`을 빠뜨리지 않는다.

## 4. 추천 도서 추가 절차 — `data/books.ts`

1. 배열 **끝**에 `{ title, author, publisher, description, coverUrl, purchaseUrl, tags? }`를 넣는다. 배열 끝 = 최근 추가 — Books 페이지·홈 '함께 보면 좋은 것들'·Books 메뉴가 뒤집어서 새 책을 먼저 보여 준다.
2. **표지:** 기본은 `https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/<ISBN13>.jpg`(기존 18권). 10-27에 추가한 5권은 출판사·YES24 표지(`wikibook.co.kr`·`cdn-prod.hanbit.co.kr`·`image.yes24.com`)다 — `https:`면 CSP(`img-src`)를 통과한다. 어느 쪽이든 넣기 전에 200인지, 맞는 판본인지 확인한다.
3. **구매 링크:** 쇼핑몰 주소는 추적 파라미터(`NaPm`, `nl-au`, `sourceType` 등)를 뺀다.
4. **태그:** `BOOK_FILTER_TAGS`(지금 6개 — Java & Spring · Architecture · Data & Infra · CS · Career · AI)에 있는 값만 세그먼트·Books 메뉴(`?tag=`)에 걸린다. 책마다 **하나 이상** 고른다(두 군데 속해도 된다). 태그가 없는 책은 '전체'에서만 보이고, 홈에선 태그 대신 저자를 보여 준다. 새 카테고리는 탭이 늘어 1440px에서 한 줄을 넘기기 쉬우니 먼저 기존 6개에 맞는지 본다. 옛 이름의 `?tag=` 주소는 '전체'로 열린다.
5. **구매 버튼 이름:** 구매 링크 도메인으로 정한다 — `pages/BooksPage.tsx`의 `STORE_LABELS`(교보문고·YES24·쿠팡·스마트스토어). 목록에 없는 곳은 '구매하기'.
6. **정보 수집:** 네이버 스마트스토어(429)·쿠팡(403)은 자동 요청을 막는다. 제목이나 ISBN을 받아 교보·YES24·출판사 페이지에서 확인하는 편이 빠르다. 교보 상품 페이지는 서버가 제목을 안 내려주므로 실제 브라우저로 열어 제목을 확인한다. 외부에서 정리해 온 목록은 링크 ID가 틀렸을 수 있다 — 추가 전에 확인한다.

## 5. 알아둘 것

- **빌드 산출물:** `static-react/`는 Vite 출력 폴더이고 gitignore 대상이다. 직접 고치지 않는다. Docker·Netlify 배포가 빌드해서 쓴다.
- **레거시 사이트:** `src/main/resources/static/`(Spring 정적 사이트)은 더 이상 갱신하지 않는다. Docker·system-design도 반영하지 않았다. `sidebar.html:65-68`의 대규모 시스템 설계 주석은 링크 대상 파일이 없어 그대로 두었다. **앱은 2026-10-20(Ch9 D6)부터 이 정적 CSS를 import하지 않는다** — reset은 앱 `src/styles/reset.css`로 옮겼다. 정적 사이트를 고쳐도 앱 화면은 바뀌지 않는다.
- **디자인 규칙:** 색·크기·간격은 `src/styles/tokens.css` 토큰만, 동작 숫자는 `src/constants/ui.ts`, 반응형 경계는 734·1068px 둘. 자세한 건 [리디자인 계획서](./261018_my_study_app_redesign_plan.md) §3과 [리디자인 기록](./261021_my_study_app_redesign_log.md).
- **새 탭 링크:** `target="_blank"`에는 ↗(aria-hidden) 옆에 `<NewTabHint />`, aria-label이 있으면 끝에 `NEW_TAB_LABEL`('(새 탭)')을 붙인다.
- **페이지 제목:** 새 페이지는 `useDocumentTitle('<h1과 같은 글>')` — 탭 제목이 '<글> — JM Hub'가 된다.
- **문서 파일:** `.gitignore`에 `*.md`가 있다. `doc/`의 새 문서(이 문서 포함)는 git에 잡히지 않는 로컬 기록이다. 커밋하려면 `git add -f`.
- **검색:** 이 환경의 `grep`은 ugrep 별칭이라 결과가 다를 수 있다. 저장소 전체 검색은 `command grep -rn ...`을 쓴다.
- **Chrome 연동:** Claude in Chrome에 브라우저가 2대(맥 Browser 1, Windows Browser 2) 연결되어 있다. 2026-10-11에는 맥 Chrome이 응답하지 않았다.
