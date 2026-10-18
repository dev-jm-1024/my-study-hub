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
  /** 자동 넘김 간격 */
  intervalMs: 4000,
  /** 화살표·터치·포커스 뒤 자동 넘김을 멈추는 시간 */
  holdAfterInteractMs: 6000,
  /** 스크롤이 멈췄다고 보는 시간 (위치 보정·점 갱신) */
  settleMs: 140,
  /** 무한 반복용으로 목록을 몇 벌 깔지 (가운데 벌 근처에 머문다) */
  copies: 3,
} as const;

/** 상단 드롭다운 메뉴 */
export const NAV_MENU_TIMING = {
  /** 닫혀 있을 때 마우스를 올리고 이만큼 머물러야 연다 (스치기만 하면 안 열림) */
  openDelayMs: 120,
  /** 헤더를 벗어난 뒤 닫기까지 */
  closeDelayMs: 200,
} as const;
