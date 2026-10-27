import { useEffect, useRef, type RefObject } from 'react';
import { isTopLock, lockScroll } from '../utils/scrollLock';

/**
 * 모달 공통 동작 — 자료실 사이드 메뉴(≤1068px) · 햄버거 메뉴(≤734px) · 문서 미리보기 시트 (계획서 §4.4). 마크업은 모른다.
 *   - open이 true가 될 때 한 번 설치하고, false가 되거나 언마운트되면 걷는다. onClose 등은 최신 값을 읽는다 —
 *     부모가 리렌더해도 다시 설치하지 않으므로 포커스를 다시 뺏지 않는다
 *   - 화면 스크롤 잠금(lockScroll — html·body 둘 다, 겹쳐 걸기)
 *   - 열 때 포커스: initialFocusRef → 범위 안 첫 Tab 정지점 → 패널(잠시 tabindex -1). 이미 그 요소에 있으면 그대로
 *   - Tab은 panelRef 안에서만 돈다. 안쪽 이동은 브라우저에 맡기고, 가장자리·바깥에서 시작할 때만 안으로 되돌린다.
 *     정지점 = 실제로 그려졌고(display:none·visibility:hidden 제외) inert 밖인 것. iframe은 정지점 하나
 *   - Esc → onClose. 한글 조합 중 Esc와 다른 층이 먼저 처리한 Esc(defaultPrevented)는 건너뛰고, 처리한 Esc는 preventDefault
 *   - 모달이 겹치면(서랍 위에 검색 팔레트) 맨 위 층만 Esc·Tab을 받는다 — 층 순서 = 스크롤을 잠근 순서
 *   - 닫을 때 포커스: returnFocusRef → 열기 직전 포커스. 포커스가 범위 안이거나 갈 곳 없이 body일 때만 돌려준다
 *     (검색 팔레트 입력칸처럼 다른 곳으로 간 포커스는 빼앗지 않는다)
 *   - media: 열린 동안 이 쿼리가 거짓이 되면(열릴 때 이미 거짓이어도) onClose
 *
 * @example
 * useDrawer({ open, onClose: () => setOpen(false), panelRef, returnFocusRef: toggleRef, media: `(max-width: ${BREAKPOINT.tablet}px)` });
 * <button ref={toggleRef} aria-expanded={open} onClick={() => setOpen(true)}>주제 전환</button>
 * <aside ref={panelRef} role="dialog" aria-modal="true" inert={!open || undefined}>…</aside>
 *
 * 렌더 쪽이 지킬 것
 *   1. open이 true인 커밋에서 패널이 이미 포커스 가능한 상태여야 한다(display:none·visibility:hidden·inert 해제)
 *   2. 닫힌 패널을 DOM에 남겨 둔다면 inert(또는 display:none)는 컴포넌트가 붙인다 — 훅은 범위 밖을 inert로 만들지 않는다
 *   3. 바깥(덮개) 클릭으로 닫기는 컴포넌트 몫. 덮개 mousedown에 preventDefault를 주면 포커스가 body로 새지 않는다
 */

export interface UseDrawerOptions {
  /** false면 아무것도 설치하지 않는다 */
  open: boolean;
  /** Esc·media 이탈 때 부른다 (최신 값을 읽는다 — 매 렌더 새 함수여도 된다) */
  onClose: () => void;
  /** Tab을 가둘 범위 */
  panelRef: RefObject<HTMLElement | null>;
  /** 열릴 때 포커스. 없으면 범위 안 첫 Tab 정지점, 그것도 없으면 패널 */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** 닫힐 때 포커스. 없으면 열기 직전 document.activeElement */
  returnFocusRef?: RefObject<HTMLElement | null>;
  /** 열린 동안 이 쿼리가 거짓이 되면 onClose (예: '(max-width: 1068px)') */
  media?: string;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';

/** root 안에서 Tab이 멈추는 요소 (DOM 순서) */
const tabbables = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    el =>
      el.tabIndex >= 0 &&
      el.getClientRects().length > 0 &&
      !el.closest('[inert]') &&
      getComputedStyle(el).visibility !== 'hidden',
  );

export function useDrawer(options: UseDrawerOptions): void {
  const { open, media } = options;

  // 설치된 리스너·정리가 읽는 최신 옵션 (아래 effect들보다 먼저 갱신되도록 맨 앞에 둔다)
  const latest = useRef(options);
  useEffect(() => {
    latest.current = options;
  });

  useEffect(() => {
    if (!open) return;
    const { panelRef, initialFocusRef } = latest.current;
    const root = panelRef.current;
    const active = document.activeElement;
    const opener = active instanceof HTMLElement && active !== document.body ? active : null;
    const release = lockScroll();

    let tempTabIndex = false;
    const target = initialFocusRef?.current ?? (root && tabbables(root)[0]) ?? root;
    if (target && target !== document.activeElement) {
      if (target === root && !root.hasAttribute('tabindex')) {
        root.setAttribute('tabindex', '-1');
        tempTabIndex = true;
      }
      target.focus({ preventScroll: true });
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || !isTopLock(release)) return;
      if (e.key === 'Escape') {
        if (e.isComposing) return;
        e.preventDefault();
        latest.current.onClose();
        return;
      }
      if (e.key !== 'Tab' || e.altKey || e.ctrlKey || e.metaKey) return;
      const scope = latest.current.panelRef.current ?? root;
      if (!scope) return;
      const items = tabbables(scope);
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const now = document.activeElement;
      // 안쪽 이동은 브라우저에 맡기고, 가장자리·바깥(패널 자신 포함)에서 시작할 때만 안으로 되돌린다
      if (!now || now === scope || !scope.contains(now)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (e.shiftKey && now === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && now === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keydown', onKey);
      release();
      if (tempTabIndex) root?.removeAttribute('tabindex');
      const scope = latest.current.panelRef.current ?? root;
      const back = latest.current.returnFocusRef?.current ?? opener;
      const now = document.activeElement;
      const lost = !now || now === document.body || !!scope?.contains(now);
      if (lost && back?.isConnected && back !== now) back.focus({ preventScroll: true });
    };
  }, [open]);

  useEffect(() => {
    if (!open || !media) return;
    const mql = window.matchMedia(media);
    const check = () => {
      if (!mql.matches) latest.current.onClose();
    };
    check();
    mql.addEventListener('change', check);
    return () => mql.removeEventListener('change', check);
  }, [open, media]);
}
