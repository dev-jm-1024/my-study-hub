import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { DOWNLOAD_PAGE_SIZE } from '../constants/ui';
import type { PdfItem } from '../types';
import { ALL_SECTIONS, paginateSections, sectionTabs } from '../utils/paginateSections';

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

interface AnchorLock {
  /** 잠그기 전 <html> 인라인 overflow-anchor */
  prev: string;
  /** 풀기 예약한 rAF. 0 = 아직 커밋 전 */
  frame: number;
}

function unlockAnchor(ref: { current: AnchorLock | null }) {
  const lock = ref.current;
  if (!lock) return;
  cancelAnimationFrame(lock.frame);
  document.documentElement.style.overflowAnchor = lock.prev;
  ref.current = null;
}

/**
 * 자료실 목록의 소분류 선택·페이지 상태 (계획서 §4.3). 마크업은 모른다 — 상태·핸들러와 목록 맨 위에 붙일 ref만 준다.
 *   - resetKey(주제)가 바뀌면 '전체' 1페이지로. 렌더 중에 바로 바꿔 옛 소분류·페이지가 한 번도 그려지지 않는다
 *   - select: 다른 소분류를 고르면 1페이지. 스크롤하지 않는다(세그먼트가 목록 바로 위라 이미 보인다)
 *   - goPage: 바꾼 페이지가 그려진 뒤 목록 맨 위가 화면 위로 올라가 있을 때만 그 자리로 부드럽게 스크롤
 *     (이미 보이면 그대로 둔다). 동작 줄이기면 즉시. 포커스는 누른 페이저 버튼에 그대로 둔다
 *   - 페이지·탭 상태는 URL에 넣지 않는다
 *
 * @example
 * const list = useSectionPagination(pdfs, resolvedKey);
 * {list.tabs.length > 0 && list.tabs.map(t => <button aria-pressed={t.key === list.selected} onClick={() => list.select(t.key)}>…)}
 * <div ref={list.listRef}>{list.groups.map(g => …)}</div>   // 세그먼트부터 감싸는 요소. CSS scroll-margin-top으로 상단 바를 피한다
 * {list.pageCount > 1 && <button onClick={() => list.goPage(list.page + 1)} disabled={list.page === list.pageCount}>…}
 */
export function useSectionPagination(items: PdfItem[], resetKey: string, size: number = DOWNLOAD_PAGE_SIZE) {
  const [state, setState] = useState({ key: resetKey, selected: ALL_SECTIONS, page: 1 });
  let { selected, page } = state;
  if (state.key !== resetKey) {
    selected = ALL_SECTIONS;
    page = 1;
    setState({ key: resetKey, selected, page });
  }

  const view = paginateSections(items, selected, page, size);

  // 아무 요소에나 붙도록 콜백 ref (div·section·ol)
  const listEl = useRef<HTMLElement | null>(null);
  const listRef = useCallback((el: HTMLElement | null) => {
    listEl.current = el;
  }, []);

  /* 페이지를 넘기는 동안 브라우저 스크롤 앵커링을 끈다. 두 페이지에 걸친 묶음(같은 key로 남는 section)을 붙잡고
     위치를 보정하는데, 그 보정이 아래 scrollIntoView보다 늦게 더해져 목록 맨 위를 지나친다 (Chrome, Java '전체' 2→3페이지) */
  const anchorLock = useRef<AnchorLock | null>(null);
  useEffect(() => () => unlockAnchor(anchorLock), []);

  // 잠근 뒤 첫 커밋 = 바뀐 페이지가 DOM에 들어간 직후
  useLayoutEffect(() => {
    const lock = anchorLock.current;
    if (!lock || lock.frame) return;
    const el = listEl.current;
    if (el && el.getBoundingClientRect().top < (parseFloat(getComputedStyle(el).scrollMarginTop) || 0)) {
      const reduce = window.matchMedia(REDUCED_QUERY).matches;
      el.scrollIntoView({ behavior: reduce ? 'instant' : 'smooth', block: 'start' });
    }
    // 바뀐 페이지가 한 번 그려진 다음 프레임에 푼다
    lock.frame = requestAnimationFrame(() => {
      lock.frame = requestAnimationFrame(() => unlockAnchor(anchorLock));
    });
  });

  const select = (key: string) => {
    if (key === view.selected) return;
    setState(s => ({ ...s, selected: key, page: 1 }));
  };

  const goPage = (n: number) => {
    const next = Math.min(Math.max(1, n), view.pageCount);
    if (next === view.page) return;
    const lock = anchorLock.current;
    if (lock) {
      cancelAnimationFrame(lock.frame);
      lock.frame = 0;
    } else {
      const root = document.documentElement;
      anchorLock.current = { prev: root.style.overflowAnchor, frame: 0 };
      root.style.overflowAnchor = 'none';
    }
    setState(s => ({ ...s, page: next }));
  };

  return {
    /** 세그먼트 버튼. 빈 배열이면 세그먼트를 숨긴다 */
    tabs: sectionTabs(items),
    selected: view.selected,
    select,
    page: view.page,
    pageCount: view.pageCount,
    goPage,
    groups: view.groups,
    range: view.range,
    listRef,
  };
}
