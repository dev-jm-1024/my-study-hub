/* 화면 동작 상수 — tokens.css(모양)와 짝을 이루는 JS 쪽 값(동작·규칙).
   컴포넌트·훅에 숫자를 직접 쓰지 않고 여기서 가져간다. */

/** 반응형 경계(px). tokens.css의 @media (max-width: 734px)와 같은 값을 유지한다 */
export const BREAKPOINT = {
  mobile: 734,
  tablet: 1068,
} as const;

/** 자료실 한 페이지 문서 수 — '전체'와 소분류에 같은 규칙으로 적용 */
export const DOWNLOAD_PAGE_SIZE = 10;

/** 홈 '가장 많이 쌓인 자료실': 문서 수 상위 몇 개를 타일로 띄울지 */
export const FEATURED_TOPIC_COUNT = 2;

/** 홈 '문서 비중' 막대: 따로 그릴 주제 수 (나머지는 '기타 N개 주제'로 합침) */
export const DOC_SHARE_TOP_N = 6;

/** 등록일(addedAt)로부터 며칠 동안 NEW 표시를 할지 */
export const NEW_BADGE_DAYS = 21;

/** 홈 '최근 올라온 문서' 가로 셸프 */
export const LATEST_SHELF = {
  /** 셸프에 올릴 문서 수 */
  count: 6,
  /** 자동 흐름 속도 — 카드 한 칸(300px + 간격)이 약 10초에 시작선을 지나간다 */
  speedPxPerSec: 32,
  /** 흐름이 멈추거나 다시 흐를 때 감속·가속에 걸리는 시간 (멈추는 동안 약 speed × ramp / 2 = 8px 더 간다) */
  rampMs: 500,
  /** 이전/다음 화살표로 한 칸 미끄러지는 시간 */
  glideMs: 500,
  /** 화살표·터치·포커스 뒤 자동 흐름을 멈추는 시간 */
  holdAfterInteractMs: 6000,
  /** 스크롤이 멈췄다고 보는 시간 (위치 보정·점 갱신) */
  settleMs: 140,
  /** 무한 반복용으로 목록을 몇 벌 깔지 (가운데 벌 근처에 머문다). 최소값 — 한 벌이 화면보다 좁으면 훅이 늘린다 */
  copies: 3,
} as const;

/** 홈 '함께 보면 좋은 것들': 책·GitHub 타일에 미리 보여 줄 항목 수 */
export const HOME_MORE_PREVIEW_COUNT = 3;

/** 상단 드롭다운 메뉴 */
export const NAV_MENU_TIMING = {
  /** 닫혀 있을 때 마우스를 올리고 이만큼 머물러야 연다 (스치기만 하면 안 열림) */
  openDelayMs: 120,
  /** 헤더를 벗어난 뒤 닫기까지 */
  closeDelayMs: 200,
} as const;

/** 새 탭으로 열리는 링크의 스크린 리더 안내 (components/NewTabHint · aria-label 끝) */
export const NEW_TAB_LABEL = '(새 탭)';

/** 사이트 이름 — 탭·방문 기록에 보이는 문서 제목의 꼬리 (hooks/useDocumentTitle) */
export const SITE_NAME = 'JM Hub';

/** 없는 주소의 제목 — NotFoundPage의 h1이자 문서 제목. 자료실이 없는 과목 키를 만났을 때도 같은 화면을 그린다 */
export const NOT_FOUND_TITLE = '페이지를 찾을 수 없어요';
