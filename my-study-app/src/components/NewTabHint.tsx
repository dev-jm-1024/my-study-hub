import { NEW_TAB_LABEL } from '../constants';

/** 새 탭으로 열리는 링크의 스크린 리더 안내 — ↗(aria-hidden) 옆에 둔다.
 *  링크에 aria-label이 있으면 이 대신 aria-label 끝에 NEW_TAB_LABEL을 붙인다 */
export function NewTabHint() {
  return <span className="sr-only"> {NEW_TAB_LABEL}</span>;
}
