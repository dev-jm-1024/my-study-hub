/* 기기별 표기 — 단축키 글자를 기기에 맞춘다. 동작은 CommandPalette가 ⌘·Ctrl 둘 다 받는다 */

const platform =
  (navigator as Navigator & { userAgentData?: { platform: string } }).userAgentData?.platform ||
  navigator.platform;

/** Apple 기기(macOS·iOS·iPadOS)인가 */
export const IS_APPLE = /mac|iphone|ipad|ipod/i.test(platform);

/** 전역 검색 단축키 표기 — 화면 글자와 aria-label에 같이 쓴다 */
export const SEARCH_SHORTCUT = IS_APPLE ? '⌘K' : 'Ctrl K';
