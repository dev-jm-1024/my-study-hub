import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { BREAKPOINT, NAV_MENU_TIMING } from '../constants';
import type { NavMenuKey } from '../constants';
import { addOverlay } from '../utils/overlay';

/* 상단 바 드롭다운의 열고 닫기 (계획서 §4.1). 마크업은 모른다 —
   돌려주는 props를 Navbar가 header · 메뉴 버튼 · 패널 · 덮개 · 닫는 요소(로고·Velog·Blog·검색·테마)에 펼친다.
   - 마우스: 머물면 열고, 열린 동안 옆 메뉴로 즉시 전환, 헤더(바+패널)를 벗어나면 잠시 뒤 닫는다
   - 터치·키보드: 메뉴 버튼 클릭으로 토글 (hover 처리는 pointerType === 'mouse'일 때만)
   - 덮개 클릭 · Esc · 라우트 이동 · 헤더 밖으로 포커스 · ≤734px → 닫는다
   - 열린 동안 덮는 층으로 알린다(utils/overlay) — 덮개 블러 뒤 셸프 흐름이 멈춘다 */

const MOBILE_QUERY = `(max-width: ${BREAKPOINT.mobile}px)`;
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]';

const matches = (query: string) => window.matchMedia(query).matches;
const isMouse = (e: React.PointerEvent) => e.pointerType === 'mouse';
const keepFocus = (e: React.MouseEvent) => e.preventDefault();

/** root 안에서 Tab으로 갈 수 있고 화면에 보이는 요소 (DOM 순서) */
const tabbables = (root: Element) =>
  Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    el => el.tabIndex >= 0 && el.getClientRects().length > 0,
  );

interface MenuState {
  /** 열린 메뉴 */
  open: NavMenuKey | null;
  /** 패널에 그릴 메뉴 — 닫히는 애니메이션 동안 내용이 비지 않게 마지막 값을 유지 */
  shown: NavMenuKey | null;
  /** 열기·전환마다 1씩 — 열 등장 애니메이션을 다시 틀 key */
  panelKey: number;
}

export interface NavMenuCloseOptions {
  /** 연 버튼으로 포커스를 돌려줄지. 생략하면 포커스가 패널 안에 있을 때만 (닫힌 패널은 inert라 포커스를 잃으므로) */
  restoreFocus?: boolean;
}

export function useNavMenu() {
  const [menu, setMenu] = useState<MenuState>({ open: null, shown: null, panelKey: 0 });
  const panelId = useId();
  const { key: locationKey } = useLocation();

  const headerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggers = useRef<Partial<Record<NavMenuKey, HTMLButtonElement | null>>>({});
  /** 이벤트·타이머가 읽는 지금 열린 메뉴 (state는 렌더 시점 값이라 따로 둔다) */
  const openRef = useRef<NavMenuKey | null>(null);
  /** 마우스로 머물러 연 메뉴 — 같은 버튼 위에서의 첫 클릭이 방금 연 메뉴를 닫지 않게 */
  const hoverOpened = useRef<NavMenuKey | null>(null);
  /** 마우스가 실제로 움직여 들어와 있는 메뉴 버튼 (나가면 null) */
  const hovered = useRef<NavMenuKey | null>(null);
  const openTimer = useRef(0);
  const closeTimer = useRef(0);

  // 이벤트·리스너가 함께 쓰는 동작. ref와 setMenu만 만지므로 한 번 만들어 계속 쓴다
  const [actions] = useState(() => {
    const clearTimers = () => {
      clearTimeout(openTimer.current);
      clearTimeout(closeTimer.current);
    };

    /** ms 뒤에 fn. '동작 줄이기'에서도 지연은 그대로 둔다 — 지연은 움직임이 아니고,
        없으면 바를 가로지르기만 해도 메뉴·덮개가 차례로 깜빡인다 (애니메이션 끄기는 CSS 몫) */
    const schedule = (timer: { current: number }, ms: number, fn: () => void) => {
      clearTimeout(timer.current);
      timer.current = window.setTimeout(fn, ms);
    };

    /** sync: 이번 이벤트의 기본 동작 전에 패널 inert까지 반영해야 할 때 */
    const set = (key: NavMenuKey | null, sync = false) => {
      clearTimers();
      if (key !== null && matches(MOBILE_QUERY)) return; // 이 폭에서는 드롭다운 대신 햄버거(Ch7)
      if (openRef.current === key) return;
      openRef.current = key;
      if (key === null) hoverOpened.current = null;
      const update = () =>
        setMenu(s =>
          key === null ? { ...s, open: null } : { open: key, shown: key, panelKey: s.panelKey + 1 },
        );
      if (sync) flushSync(update);
      else update();
    };

    const close = ({ restoreFocus }: NavMenuCloseOptions = {}) => {
      const key = openRef.current;
      const trigger = key ? triggers.current[key] : null;
      const active = document.activeElement;
      const focusBack = restoreFocus ?? !!(active && panelRef.current?.contains(active));
      set(null);
      if (focusBack) trigger?.focus({ preventScroll: true });
    };

    const hoverOpen = (key: NavMenuKey) => {
      set(key);
      if (openRef.current === key) hoverOpened.current = key;
    };

    return {
      clearTimers,
      close,

      enterHeader: () => clearTimeout(closeTimer.current),

      leaveHeader: () => {
        clearTimeout(openTimer.current);
        if (openRef.current !== null) schedule(closeTimer, NAV_MENU_TIMING.closeDelayMs, () => close());
      },

      // pointerenter가 아니라 버튼 위 첫 pointermove에서 시작한다. 페이지 전환(View Transition)·검색 팔레트처럼
      // 화면이 덮였다 걷히면 브라우저가 멈춰 있는 마우스 아래 요소에 enter만 다시 보내는데, 그걸로 메뉴가 열리지 않게
      moveTrigger: (key: NavMenuKey) => {
        if (hovered.current === key) return;
        hovered.current = key;
        clearTimeout(closeTimer.current);
        // 열려 있으면 기다리지 않고 바꾼다
        if (openRef.current !== null) {
          if (openRef.current !== key) hoverOpen(key);
          return;
        }
        schedule(openTimer, NAV_MENU_TIMING.openDelayMs, () => hoverOpen(key));
      },

      // 머무는 시간을 채우기 전에 나가면 열지 않는다
      leaveTrigger: () => {
        clearTimeout(openTimer.current);
        hovered.current = null;
        hoverOpened.current = null;
      },

      clickTrigger: (key: NavMenuKey, byPointer: boolean) => {
        // 머물러 열린 직후 같은 버튼을 누른 것 — '열기'로 보고 닫지 않는다
        if (byPointer && openRef.current === key && hoverOpened.current === key) {
          hoverOpened.current = null;
          return;
        }
        if (openRef.current === key) close();
        else set(key);
      },

      // 포커스가 헤더 밖 요소로 옮겨 갔을 때만 (relatedTarget이 없으면 빈 곳 클릭·창 전환이라 둔다)
      blurHeader: (e: React.FocusEvent<HTMLElement>) => {
        const next = e.relatedTarget;
        if (next instanceof Node && !headerRef.current?.contains(next)) close({ restoreFocus: false });
      },

      // Tab 순서: 패널은 DOM상 바 뒤에 있지만, 연 버튼 바로 뒤에 끼운 것처럼 움직인다
      //   … 연 버튼 → 패널 첫 링크 … 패널 끝 링크 → 버튼 다음 바 요소 … 바 끝 → (닫고) 헤더 밖
      keyHeader: (e: React.KeyboardEvent<HTMLElement>) => {
        const key = openRef.current;
        const header = headerRef.current;
        const panel = panelRef.current;
        if (e.key !== 'Tab' || e.altKey || e.ctrlKey || e.metaKey || !key || !header || !panel) return;
        const trigger = triggers.current[key];
        const bar = tabbables(header).filter(el => !panel.contains(el));
        const at = trigger ? bar.indexOf(trigger) : -1;
        if (at < 0) return;
        const order = [...bar.slice(0, at + 1), ...tabbables(panel), ...bar.slice(at + 1)];
        const from = order.indexOf(document.activeElement as HTMLElement);
        if (from < 0) return;
        const to = order[from + (e.shiftKey ? -1 : 1)];
        if (to) {
          e.preventDefault();
          to.focus();
        } else if (!e.shiftKey) {
          // 바 끝에서 앞으로: 패널을 다시 돌지 않도록 기본 Tab 전에 닫아(inert) 헤더 밖으로 보낸다
          set(null, true);
        }
      },
    };
  });

  const isOpen = menu.open !== null;

  // 덮는 층 — 열린 커밋에서 칠하기 전에 알리고, 닫히거나 언마운트되면 거둔다
  useLayoutEffect(() => (isOpen ? addOverlay() : undefined), [isOpen]);

  // Esc — 열려 있는 동안 문서 전체에서 받는다(마우스로 연 경우 포커스가 헤더 밖일 수 있다).
  // 포커스가 헤더 안이거나 갈 곳 없이 body면 연 버튼으로 돌려주고, 본문 입력칸 등에 있으면 빼앗지 않는다.
  // 다른 층(검색 팔레트 등)이 먼저 처리한 Esc(defaultPrevented)와 한글 조합 중 Esc는 건너뛴다
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented || e.isComposing) return;
      const active = document.activeElement;
      const lost = !active || active === document.body;
      actions.close({ restoreFocus: lost || !!headerRef.current?.contains(active) });
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, actions]);

  // 라우트 이동 → 닫는다. 같은 주소로 다시 가도 key는 바뀐다.
  // 페이지 전환(View Transition)의 새 화면과 같은 커밋에서 닫히도록 layout effect
  useLayoutEffect(() => {
    actions.close();
  }, [locationKey, actions]);

  // 열린 채로 ≤734px이 되면 닫는다 + 언마운트 시 대기 중인 타이머 정리
  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) actions.close();
    };
    mql.addEventListener('change', onChange);
    return () => {
      mql.removeEventListener('change', onChange);
      actions.clearTimers();
    };
  }, [actions]);

  return {
    open: menu.open,
    shown: menu.shown,
    panelKey: menu.panelKey,

    /** <header> — 바와 패널을 함께 감싸는 요소 (마우스 이탈·포커스 이탈·Tab 순서의 범위) */
    headerProps: {
      ref: headerRef,
      onPointerEnter: (e: React.PointerEvent<HTMLElement>) => {
        if (isMouse(e)) actions.enterHeader();
      },
      onPointerLeave: (e: React.PointerEvent<HTMLElement>) => {
        if (isMouse(e)) actions.leaveHeader();
      },
      onBlur: actions.blurHeader,
      onKeyDown: actions.keyHeader,
    },

    /** 메뉴 버튼(<button>) 하나 */
    getTriggerProps: (key: NavMenuKey) => ({
      ref: (el: HTMLButtonElement | null) => {
        triggers.current[key] = el;
      },
      type: 'button' as const,
      'aria-expanded': menu.open === key,
      'aria-controls': panelId,
      onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
        if (isMouse(e)) actions.moveTrigger(key);
      },
      onPointerLeave: (e: React.PointerEvent<HTMLElement>) => {
        if (isMouse(e)) actions.leaveTrigger();
      },
      // detail 0 = 키보드(Enter·Space)로 누른 클릭
      onClick: (e: React.MouseEvent<HTMLElement>) => actions.clickTrigger(key, e.detail > 0),
    }),

    /** 로고 · Velog · Blog · 검색 · 테마 — 올리면(터치는 누르면) 바로 닫고 대기 중인 열기도 취소 */
    closerProps: {
      onPointerEnter: () => actions.close(),
    },

    /** 패널 — 닫혀 있으면 inert (포커스·스크린 리더에서 빠짐) */
    panelProps: {
      id: panelId,
      ref: panelRef,
      inert: !isOpen,
    },

    /** 바깥 덮개(<button>, header 밖 형제) — 눌러도 포커스를 가져가지 않는다 */
    scrimProps: {
      onClick: () => actions.close(),
      onMouseDown: keepFocus,
      tabIndex: -1,
      'aria-hidden': true as const,
    },

    close: actions.close,
  };
}
