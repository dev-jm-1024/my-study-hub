# my-study-app 리팩토링 실행 계획서

- **작성일:** 2026-07-10 · **근거 문서:** [260710_my_study_app_refact_plan.md](./260710_my_study_app_refact_plan.md) (v1.2 — 본 문서의 §0 정정 2건과 실행 결정 1이 v1.2에 반영됨)
- **성격:** 원 계획서의 설계를 실행 절차로 변환한 문서. 계약 C1~C14, 위험 R1~R15는 원 계획서를 규범으로 그대로 따른다.
- **실행 결정사항 (확정):**
  1. `npm audit fix`는 **리팩토링 완주 후** 별도 커밋 (기준선 채취 전 선행하지 않음)
  2. **Phase 6 포함** — 단, Step 6의 go/no-go 게이트 통과 시에만 진행

## 0. 사전 검증 결과 (2026-07-10 실측) 및 원 계획서 정정

원 계획서의 주장을 working tree 기준으로 전수 검증했다. 라인 수(index.css 1796 / menuData.ts 246), 마커 중괄호 균형(전부 0), 레거시 @import 6건, 죽은 코드 3종, 중복 로직 위치, CI·Netlify·Docker 설정 모두 **일치**. 정정 2건:

| # | 원 계획서 | 실측 정정 |
|---|---|---|
| 1 | §4 Phase 3 "소비 파일 6곳" | **7곳** — StackRatio, CommandPalette, Sidebar, GitHubPage, BooksPage, DownloadPage, HomePage |
| 2 | §2.2·§7.1 "마커 14개" | awk 정규식이 잡는 마커는 **30개** (절단 경계 13 + 내부 소제목 17). 전부 balance=0이라 결론은 동일 |

**실행 순서 안전 근거 (더블 체크 완료):**
- audit fix를 후행해도 vite 버전이 lock에 고정 → CSS 바이트 기준선이 전 Phase 유효
- Step 1의 `npm uninstall gsap`은 JS 전용 의존성 제거(import 0건, vite 버전 불변) → 기준선 무영향
- Phase 간 의존은 **4→5 하나뿐** → 문제 시 해당 커밋만 revert 가능

## 1. 매 커밋 공통 검증 규칙 (전 Step 적용)

```bash
cd my-study-app
npm run build                                              # ① 매 Step: tsc -b(strict) + vite build 성공
diff /tmp/baseline.css ../static-react/assets/index-*.css  # ② Step 2 이후 매 커밋: 반드시 diff 0
```
- ③ 실패 시 원인 규명 전 다음 Step 진행 금지. 복구 불가 시 해당 커밋 `git revert`.
- ④ 리팩토링 진행 중 **기능 편집 병행 금지**. 부득이 병행 시 기준선 재채취 + 절단표 재실측 (R12).

## 2. Step 0 — 선행 조건 (원 계획서 Phase 0)

```bash
# ① 미커밋 기능 작업을 main에 커밋 (R7 해제 — 이것이 착수 조건)
git add -A     # Vibe 페이지·홈 위젯 등 기능 작업 + doc/ (본 문서 포함)
git commit -m "feat: Vibe 코딩 페이지·홈 위젯 추가 및 리팩토링 계획 문서"

# ② 재실측 (R12) — 아래 두 값이 본 문서의 표와 다르면 §4 절단표부터 갱신
wc -l my-study-app/src/index.css        # 기대값: 1796
awk '{b+=gsub(/\{/,"x")-gsub(/\}/,"x")} /^\/\* ══|^\/\* ──/ {print NR": balance="b}' my-study-app/src/index.css
                                        # 기대값: 30개 마커 전부 balance=0

# ③ 리팩토링 브랜치 생성 (R15 — main 병합 = 즉시 Docker Hub latest 배포이므로 브랜치 필수)
git checkout -b refactor/my-study-app-structure

# ④ CSS 기준선 채취 — "디자인 무변경"의 기계적 증명 기준
cd my-study-app && npm run build
cp ../static-react/assets/index-*.css /tmp/baseline.css
```
- (권장) ⑤ 6페이지(홈/다운로드/책/GitHub/Vibe/404) × 라이트/다크 스크린샷 보관 — TSX 이동 실수를 잡는 최후 방어선.
- `/tmp`는 재부팅 시 삭제됨 — 기준선 유실 시 Step 0 커밋을 체크아웃해 재빌드하면 재채취 가능.
- `npm audit fix`는 여기서 **하지 않는다** (실행 결정 1 — §9 마무리에서 수행).

## 3. Step 1 — 죽은 코드 제거 (Phase 1 · 위험 최저)

```bash
cd my-study-app
git rm src/components/GlassCard.tsx     # 사용처 0건 (실측 확인)
npm uninstall gsap                      # package.json + package-lock.json 동시 갱신 (R13)
# src/data/stacks.ts에서 stackColor export 삭제 (정의만 있고 사용처 0건)
```
- 기준선 무영향 근거: gsap은 JS 전용 의존성으로 CSS 산출물과 무관, vite 버전 불변.
- **검증:** `npm run build` 성공 / `grep -r "gsap\|GlassCard\|stackColor" src/` 0건 / 홈 진입 애니메이션(`home-anim` — CSS keyframe이라 GSAP 무관) 동작 확인.
- **커밋:** `chore: 미사용 GlassCard·stackColor·gsap 제거` — **package-lock.json 포함 필수** (R13: Docker/Netlify가 `npm ci` 사용, lock 불일치 시 배포 빌드만 실패).

## 4. Step 2 — index.css 분할 (Phase 2 · 위험 중 — 최고 주의)

**원칙: 연속 슬라이스.** 마커 경계에서 자르기만 하고 규칙의 순서·내용·선택자·미디어쿼리를 일절 재배치하지 않는다 (R1·R2). 재타이핑 금지 — sed 라인 추출 사용 (R5).

**① 자르기 직전 균형 검증 (필수):**
```bash
awk '{b+=gsub(/\{/,"x")-gsub(/\}/,"x")} /^\/\* ══|^\/\* ──/ {print NR": balance="b}' src/index.css
# 30개 마커 전부 balance=0 이어야 절단 진행. 하나라도 ≠0이면 중단하고 원인 파악.
```

**② 절단표 (실측 2026-07-10, 1796줄 기준 — 정본은 마커, 라인은 참고치):**

| # | 새 파일 | 시작 마커 (섹션 이름) | 실측 범위 | 절단 명령 (재실측 후 라인 확정) |
|---|---|---|---|---|
| 1 | `styles/base.css` | ══ React 전용 레이아웃 오버라이드 | 15–42 | `sed -n '15,42p'` |
| 2 | `styles/navbar.css` | ── Plain top bar (구 Pill Navbar) | 43–213 | `sed -n '43,213p'` |
| 3 | `styles/layout.css` | ── 페이지 공통 래퍼 | 214–220 | `sed -n '214,220p'` |
| 4 | `styles/home-hero.css` | ══ 블로그형 홈 | 221–323 | `sed -n '221,323p'` |
| 5 | `styles/home-rails.css` | ══ 홈 3단 레이아웃 | 324–570 | `sed -n '324,570p'` |
| 6 | `styles/home-sections.css` | ── 섹션 헤더 | 571–780 | `sed -n '571,780p'` |
| 7 | `styles/doc-list.css` | ══ Download / GitHub 리스트 | 781–998 | `sed -n '781,998p'` |
| 8 | `styles/vibe.css` | ══ 바이브 코딩 | 999–1127 | `sed -n '999,1127p'` |
| 9 | `styles/command-palette.css` | ══ 명령 팔레트 (⌘K) | 1128–1293 | `sed -n '1128,1293p'` |
| 10 | `styles/pdf-preview.css` | ══ PDF 미리보기 모달 | 1294–1386 | `sed -n '1294,1386p'` |
| 11 | `styles/footer-misc.css` | ══ 공통 푸터 / 위로가기 / 404 | 1387–1465 | `sed -n '1387,1465p'` |
| 12 | `styles/download-page.css` | ── Download 레이아웃 | 1466–1712 | `sed -n '1466,1712p'` |
| 13 | `styles/responsive.css` | ══ 반응형 | 1713–1796(EOF) | `sed -n '1713,$p'` |

- 1–14줄(레거시 @import 6건 + 구분 주석)은 index.css에 잔류.
- 각 새 파일에 추가 허용되는 것은 **최상단 한 줄 주석뿐** (minify 시 제거 → 빌드 결과 무영향).

**③ index.css를 @import 매니페스트로 교체 (순서 = 캐스케이드 계약):**
```css
/* 레거시 static CSS 재활용 — 경로·순서 변경 금지 (Docker/Netlify 의존, C12/R3) */
@import '../../src/main/resources/static/css/common/reset.css';
@import '../../src/main/resources/static/css/common/variables.css';
@import '../../src/main/resources/static/css/components/card.css';
@import '../../src/main/resources/static/css/components/button.css';
@import '../../src/main/resources/static/css/pages/book.css';
@import '../../src/main/resources/static/css/pages/jm-github.css';

/* React 앱 스타일 — 원본 index.css의 섹션 순서 그대로 (절단표 #1~#13 순) */
@import './styles/base.css';
@import './styles/navbar.css';
@import './styles/layout.css';
@import './styles/home-hero.css';
@import './styles/home-rails.css';
@import './styles/home-sections.css';
@import './styles/doc-list.css';
@import './styles/vibe.css';
@import './styles/command-palette.css';
@import './styles/pdf-preview.css';
@import './styles/footer-misc.css';
@import './styles/download-page.css';
@import './styles/responsive.css';   /* 반드시 마지막 */
```

**주의 (원 계획서 §4 Phase 2):**
- `.home-anim`은 이름과 달리 전 페이지 사용 → `home-hero.css` 잔류, 상단 주석으로 명시.
- `.dl-crumb`(브레드크럼, 1114줄 부근)는 vibe 범위 안 → **원 위치(vibe.css) 유지**, 재배치 금지.
- 섹션 내부 미디어쿼리를 responsive.css로 "정리"하지 않는다 (R2).
- `url()`/`@font-face`/`@charset`/`@layer`는 본문에 0건(실측) — 상대경로 재해석 위험 없음.

**검증:**
```bash
# 분할 파일 각각 중괄호 균형 0 확인
for f in src/styles/*.css; do awk '{b+=gsub(/\{/,"x")-gsub(/\}/,"x")} END{print FILENAME": "b}' "$f"; done
# 라인수 합 sanity (13파일 합 + 매니페스트 ≈ 원본 1796 ± 헤더 주석 수)
wc -l src/styles/*.css src/index.css
# 핵심: 빌드 CSS 바이트 동일 — 1바이트라도 다르면 규칙 유실/재배열
npm run build && diff /tmp/baseline.css ../static-react/assets/index-*.css   # diff 0 필수
ls ../static-react/assets/   # content hash 동일 → 파일명(index-<hash>.css)까지 같아야 정상
```
- **커밋:** `refactor: index.css를 styles/로 섹션 분할 (규칙 무변경)`

## 5. Step 3 — 데이터 계층 분할 (Phase 3 · 위험 낮음)

`menuData.ts` 246줄을 도메인별 분할. **데이터 리터럴은 잘라내기-이동만, 값 수정 금지** (R5).

```
src/data/
├─ menus.ts        ← MENUS (15개 주제)
├─ pdfs.ts         ← MENU_DATA — "JUnit 대문자 키" 주석(menuData.ts:124) 동반 이동 (C1)
├─ repos.ts        ← REPO_DATA
├─ books.ts        ← BOOKS
└─ menuData.ts     ← barrel: export { MENUS } from './menus'; export { MENU_DATA } from './pdfs'; ...
```
- barrel 유지로 **소비처 7곳** (StackRatio, CommandPalette, Sidebar, GitHubPage, BooksPage, DownloadPage, HomePage — 원 계획서의 "6곳"은 오기) import 무변경 (R8 — import 정리는 별도 후속 커밋으로만).
- **검증:** `npm run build` + CSS diff 0 + `git diff --word-diff -- src/data/`로 이동 외 변경 0건 확인 + 홈 통계 4종(주제/문서/도서/레포) 수치 동일.
- **커밋:** `refactor: menuData를 도메인별 파일로 분할 (barrel 유지)`

## 6. Step 4 — 공용 유틸·훅 추출 (Phase 4 · 위험 낮음~중)

| 신규 모듈 | 내용 | 대체 대상 (실측 라인) |
|---|---|---|
| `utils/category.ts` | `docCount(key)`, `resolveCategoryKey(param)` | countOf: HomePage:14, Sidebar:12, StackRatio:6 / key 해석: DownloadPage:16-18,25, Sidebar:22,39 |
| `utils/download.ts` | `triggerDownload(url, title)` — C8 분기(target=_blank, 비http만 download 속성) 그대로 | DownloadPage.handleDownload, PdfPreview.onDownload 경유 |
| `hooks/usePagination.ts` | page 상태 + totalPages + slice + goPage(smooth) | DownloadPage의 페이지네이션 |
| `hooks/useScrollTopOnMount.ts` | mount 시 `window.scrollTo(0,0)` | BooksPage:6, GitHubPage:7, VibeCodingPage:7 |

- **C9 주의:** 카테고리 변경 리셋 effect(page=1 → scrollTo(0,0) → 사이드바 닫기, 이 순서)는 **DownloadPage에 잔류** — 훅으로 흡수하면 effect 실행 순서가 바뀔 수 있음 (R6).
- **검증:** build + CSS diff 0 + `/download/java`(18건→2페이지) 페이지 이동 / 카테고리 전환 시 page 리셋 / 다운로드 버튼 / `/download/exception` "준비 중" 비활성 버튼 (C14).
- **커밋:** `refactor: 공용 유틸·훅 추출 (중복 제거)`

## 7. Step 5 — 컴포넌트 추출 (Phase 5 · 위험 중 — DOM 불변 필수)

**원칙: JSX 이동만, 태그·클래스·속성·key 1:1 유지.** React 컴포넌트 경계는 DOM에 나타나지 않으므로 1:1 이동이면 렌더링 불변.

| 추출 | From | 비고 |
|---|---|---|
| `components/CategoryRow.tsx` | `HomePage.renderRow` | `.cat-row` 마크업 그대로, 사용처 2곳(검색 결과·그룹 목록) |
| `Navbar` 내 `NAV_LINKS` 상수화 | `Navbar.tsx` | 데스크탑/모바일 중복 URL을 상수로, 마크업 불변 |
| (선택) `utils/searchIndex.ts` | `CommandPalette.buildIndex` | 순수 함수라 이동 안전 |
| (선택) `hooks/useCategorySearch.ts` | `HomePage:19-29` | HomePage가 충분히 얇아지면 생략 |

- **하지 않는 것 (원 계획서 §6):** PdfRow 추출(과추출), 행 UI 공통 컴포넌트화, 클래스 네이밍 정비.
- **검증:** build + CSS diff 0 + 홈 검색 3케이스("스프링"→결과 / "zzz"→무결과 / 빈 입력) + ⌘K·`/`·Navbar 버튼·↑↓↵ 전 시나리오 (C10) + Step 0 스크린샷 대조.
- **커밋:** `refactor: CategoryRow 추출 및 페이지 슬림화`

## 8. Step 6 — 카테고리 메타 통합 (Phase 6 · 위험 중상 — 게이트 통과 시에만)

**go/no-go 게이트:** ① Step 1~5 검증 전부 통과 + ② §9.1 수동 체크리스트 1회 전부 통과 + ③ CSS diff 0 유지. **하나라도 미충족 시 Step 6 생략**하고 §9로 — Phase 1~5만으로 1차 목표 달성이므로 생략해도 완료로 간주.

1. `src/data/categories.ts` 신설 — 주제당 1레코드 (key는 `'JUnit'` 대문자 원형 유지 — C1):
   ```ts
   interface Category {
     key: string; name: string; group: string;
     icon: string;                    // fa-* 문자열 (C13 — 레거시 정합, 삭제 금지)
     badge?: string;                  // 없으면 name.slice(0,2) 폴백 (C6)
     desc?: string;
     color?: string;                  // 없으면 소비처별 폴백 (C7 — 두 폴백 서로 다름, 통일 금지)
     brandIcon?: { path: string; title: string };
   }
   ```
2. 기존 export를 파생값으로 유지 (소비처 API 무변경): `MENUS = CATEGORIES.map(...)`, topics.ts의 `BADGE`/`DESC` 도출, stacks.ts의 `STACK` 도출. `GROUP_ORDER`·`tintClass`·`badgeLabel`·`DOWNLOAD_PAGE_SIZE`는 유지.
3. **대조표 검수:** 15키 × 속성 5종을 기존 값과 1:1 대조 — 특히 의도적 조정값(kafka `#6B7280`, linux `#C99700`) 훼손 금지.
4. **배열 순서 = 기존 MENUS 순서 (R14):** 홈/사이드바 그룹 내 나열 순서와 StackRatio stable sort가 배열 순서에 의존 — 순서 변경은 눈에 보이는 회귀.

- **검증:** build + CSS diff 0 + 홈 배지 문자·색 / 스택 비율 바 색·로고 / 사이드바 배지를 Step 0 스크린샷과 대조 + `exception`(로고 없음 → 모노그램 폴백) 확인.
- **커밋:** `refactor: 카테고리 메타 categories.ts로 통합`

## 9. 마무리

### 9.1 수동 체크리스트 (전체 1회 — 원 계획서 §7.2)

- [ ] 홈: 히어로 통계 4종 / 검색("스프링"→결과, "zzz"→무결과) / 바로가기 4카드 / 그룹 6종 순서 / 좌우 레일 sticky
- [ ] 레일 위젯: 프로필 카드 / 스택 비율 바(색·로고·모노그램 폴백) / 시계 / 달력 오늘 표시
- [ ] 다운로드: `/download/java` 2페이지 / `/download/spring` 1페이지 / `/download/junit` 소문자 라우트 (C1) / `/download/exception` "준비 중" / 브레드크럼
- [ ] PDF: 미리보기(jsDelivr 인라인 — C3) / 새 탭 / 다운로드 / ESC 닫기 / 배경 스크롤 잠금·복원 (C11)
- [ ] 팔레트: ⌘K 토글 / `/` 열기(입력 중 무시) / Navbar 버튼 / ↑↓↵ / 카테고리·문서 네비게이션 (C10)
- [ ] 책·GitHub·Vibe: 커버 폴백(icon — C13) / 외부 링크 새 탭 / 진입 시 스크롤 최상단
- [ ] 테마: 라이트↔다크 / 새로고침 유지 / OS 다크 기본값 (C4)
- [ ] 반응형: 1240px↓ 레일 하단 이동 / 사이드바 오버레이+백드롭 닫기 / 햄버거
- [ ] 404: 임의 경로

### 9.2 최종 시각 검증 (원 계획서 §7.3)
- Step 0 스크린샷과 완료 후 육안 대조. CSS diff 0이 스타일을 보장하므로, 이 단계는 **TSX 이동으로 인한 DOM 구조 실수** 검출용.

### 9.3 npm audit fix (실행 결정 1 — 완주 후 별도 커밋)
```bash
cd my-study-app && npm audit fix   # vite 등 6건 (high 2 — dev 서버 취약점, 프로덕션 영향 없음)
npm run build                      # 빌드 성공 + 앱 스모크 테스트 (§9.1 주요 항목 재확인)
```
- **주의:** vite 버전이 오르면 minifier 출력이 달라져 **기존 바이트 기준선은 이후 무효** — 이 커밋부터 검증은 "build 성공 + 스모크"로 전환, 필요 시 기준선 재채취.
- **커밋:** `chore: npm audit fix (vite 등 취약점 해소)` — lock 포함 (R13).

### 9.4 main 병합 게이트 (R15)
- §9.1 전 항목 + CSS diff 검증 이력 통과 후에만 병합. **병합 = 즉시 Docker Hub `latest` 자동 배포**임을 인지하고 진행.

## 10. 부록 — 상시 주의 위험 5종

| 위험 | 실행 중 주의점 |
|---|---|
| R1 캐스케이드 순서 | 규칙을 "보기 좋게" 재배치 금지 — diff 0이 자동 검출 |
| R5 값 오염 | 재타이핑 금지, sed/잘라내기만. URL 개행·퍼센트 인코딩 훼손 주의 |
| R12 라인 부패 | 절단 전 반드시 재실측. 마커가 정본, 라인은 참고치 |
| R13 lock 불일치 | gsap 제거·audit fix 커밋에 package-lock.json 포함 확인 |
| R14 배열 순서 | CATEGORIES 순서 = 기존 MENUS 순서 |
