import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { LATEST_SHELF } from '../constants';

/**
 * 끝없이 도는 가로 셸프 — 홈 '최근 올라온 문서' (계획서 §4.2). 마크업은 모른다 —
 * 같은 목록을 `copies`벌 깔게 하고, 스크롤을 가운데 벌 근처에 붙잡아 둔다(벌 하나만큼 순간 이동해도 생김새가 같아 안 보인다).
 *   - 자동 넘김: intervalMs마다 한 칸 smooth. 일시정지(재생을 누를 때까지) · 마우스 올림 · 셸프 안 포커스 · 손가락 닿음 ·
 *     탭 숨김 동안 멈추고, 화살표·터치·포커스가 끝나면 holdAfterInteractMs 쉰 뒤 다시 간다
 *   - 동작 줄이기: 처음부터 일시정지(설정이 바뀌면 그쪽을 따른다), 이전/다음(재생을 눌렀다면 자동 넘김도)은 순간 이동
 *   - 창 폭이 바뀌면 지금 칸을 지킨 채 다시 맞춘다. count < 2면 반복·자동 넘김 없이 한 벌만 (looping false)
 *
 * @example
 * const shelf = useInfiniteCarousel({ count: docs.length });
 * <button aria-label={shelf.pauseLabel} onClick={shelf.togglePause}>{shelf.paused ? <Play /> : <Pause />}</button>
 * <button aria-label="이전 문서" onClick={shelf.prev} /> <button aria-label="다음 문서" onClick={shelf.next} />
 * <div {...shelf.regionProps}>                         // 스크롤러 + 양쪽 페이드를 감싸는 요소
 *   <div {...shelf.scrollerProps}>
 *     {Array.from({ length: shelf.copies }, (_, set) => docs.map(doc => {
 *       const clone = set !== shelf.middle;
 *       return <article key={`${set}-${doc.id}`} aria-hidden={clone || undefined}>… <a tabIndex={clone ? -1 : undefined}>받기</a></article>;
 *     }))}
 *   </div>
 * </div>
 * <div aria-hidden="true">{docs.map((_, i) => <span key={i} data-on={i === shelf.index} />)}</div>
 *
 * 렌더 쪽이 지킬 것
 *   1. 카드 = 스크롤러의 직계 자식, 그 밖의 자식 없음(간격은 gap, 페이드는 스크롤러 밖 형제). 카드 폭은 모두 같고 벌마다 같은 순서
 *   2. 스크롤러 overflow-x: auto · scroll-snap-type: x mandatory, 카드 scroll-snap-align: start. 스크롤러 폭은 부모가 정한다.
 *      스크롤러 scroll-behavior: smooth · 카드 scroll-snap-stop: always · 카드 scroll-margin은 쓰지 않는다
 *      (이동 방식은 훅이 고르고, 연타하면 한 번에 여러 칸을 간다). 스크롤러 padding · scroll-padding은 괜찮다.
 *      scroll-snap-type을 스크롤러 style prop으로 주지 않는다 — 연타로 벌을 넘을 때 훅이 인라인으로 잠시 끈다
 *   3. 복제 벌(set !== middle): 카드 aria-hidden, 안의 링크·버튼 tabIndex={-1}. inert는 안 된다 — 보이는 복제 카드도 눌려야 한다
 *   4. 셸프와 조상에 scale 변형(등장 애니메이션 등)을 걸지 않는다 — 카드 위치를 getBoundingClientRect로 잰다
 *   5. looping이 false면 일시정지·이전/다음·점을 숨긴다
 *   6. 일시정지 버튼 모양·라벨은 paused만 따른다 (마우스·포커스로 잠깐 멈춘 것은 버튼에 드러내지 않는다)
 */

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

const subscribeReduced = (onChange: () => void) => {
  const mql = window.matchMedia(REDUCED_QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
};
const isReduced = () => window.matchMedia(REDUCED_QUERY).matches;

const isMouse = (e: React.PointerEvent) => e.pointerType === 'mouse';
const mod = (a: number, n: number) => ((a % n) + n) % n;
const jump = (el: HTMLElement, left: number) => el.scrollTo({ left, behavior: 'instant' });

interface Metrics {
  el: HTMLElement;
  /** 카드 한 칸 (폭 + gap) */
  step: number;
  /** 한 벌 = step × count */
  setW: number;
  /** 첫 카드가 맨 앞에 맞물리는 scrollLeft */
  base: number;
  /** 보이는 폭 */
  width: number;
}

/** 재생/일시정지를 누른 때의 동작 줄이기 설정 — 설정이 바뀌면 이 선택을 버리고 설정을 따른다 */
interface PauseChoice {
  paused: boolean;
  reduced: boolean;
}

export interface InfiniteCarouselOptions {
  /** 실제 카드 수 (복제 제외). 2 미만이면 한 벌만 깔고 반복·자동 넘김을 끈다 */
  count: number;
  intervalMs?: number;
  holdAfterInteractMs?: number;
  settleMs?: number;
}

export function useInfiniteCarousel({
  count,
  intervalMs = LATEST_SHELF.intervalMs,
  holdAfterInteractMs = LATEST_SHELF.holdAfterInteractMs,
  settleMs = LATEST_SHELF.settleMs,
}: InfiniteCarouselOptions) {
  const looping = count >= 2;
  /** 깔 벌 수 — 보통 LATEST_SHELF.copies, 카드가 적어 한 벌이 화면보다 좁으면 늘린다 */
  const [setCount, setSetCount] = useState<number>(LATEST_SHELF.copies);
  const [indexState, setIndex] = useState(0);
  const [choice, setChoice] = useState<PauseChoice | null>(null);
  const reduced = useSyncExternalStore(subscribeReduced, isReduced);
  const paused = choice && choice.reduced === reduced ? choice.paused : reduced;
  const regionRef = useRef<HTMLDivElement>(null);

  const copies = looping ? setCount : 1;
  const middle = Math.floor(copies / 2);
  const index = Math.min(indexState, Math.max(count - 1, 0));

  // 이벤트·타이머·옵저버가 함께 쓰는 동작. ref와 setState만 만지므로 한 번 만들어 계속 쓴다
  const [ctl] = useState(() => {
    // 렌더와 따로 움직이는 값 (렌더 값은 effect가 옮겨 준다)
    const s = {
      el: null as HTMLDivElement | null,
      count: 0,
      copies: 1,
      middle: 0,
      index: 0,
      /** 반복 가능하고 일시정지가 아님 */
      running: false,
      hover: false,
      focusIn: false,
      touching: false,
      holdUntil: 0,
      /** 진행 중인 smooth 이동의 목적지 — 연타는 여기서 한 칸씩 더 간다 */
      pending: null as number | null,
      /** 이동 도중 벌을 옮기느라 스냅을 꺼 두었는지 */
      snapOff: false,
      /** 마지막으로 맞춘 폭·칸 — 높이만 바뀐 리사이즈는 건너뛴다 */
      width: 0,
      step: 0,
      intervalMs: 0,
      holdMs: 0,
      settleMs: 0,
      autoTimer: 0,
      settleTimer: 0,
    };

    const measure = (): Metrics | null => {
      const el = s.el;
      const n = s.count;
      if (!el || n < 2 || el.children.length <= n) return null;
      const first = el.children[0].getBoundingClientRect().left;
      const setW = el.children[n].getBoundingClientRect().left - first;
      if (!(setW > 0)) return null; // 숨겨져 있거나 배치 전
      const pad = parseFloat(getComputedStyle(el).scrollPaddingLeft) || 0;
      const base = el.scrollLeft + first - el.getBoundingClientRect().left - el.clientLeft - pad;
      return { el, step: setW / n, setW, base, width: el.clientWidth };
    };

    /** x를 가운데 벌 범위 [setW − step/2, 2·setW − step/2)로 옮기는 데 더할 값 (벌 단위) */
    const wrapShift = (m: Metrics, x: number) => {
      const lo = m.base + s.middle * m.setW - m.step / 2;
      return -Math.floor((x - lo) / m.setW) * m.setW;
    };

    const indexAt = (m: Metrics, x: number) => mod(Math.round((x - m.base) / m.step), s.count);

    const setIdx = (i: number) => {
      s.index = i;
      setIndex(i);
    };

    /** 진행 중 이동을 잊고 꺼 둔 스냅을 되돌린다 — 멈춤 · 사용자가 직접 스크롤 · 재정렬 */
    const release = () => {
      s.pending = null;
      if (s.snapOff) s.el?.style.removeProperty('scroll-snap-type');
      s.snapOff = false;
    };

    /** 지금 칸을 가운데 벌에서 맨 앞에 (순간) — 처음 · 목록 변화 · 폭 변화 */
    const align = (m = measure()) => {
      if (!m) return;
      // 화면 폭 + 한 칸만큼 양옆에 여유 벌이 있어야 끝에 닿지 않는다
      const need = Math.max(LATEST_SHELF.copies, 2 * Math.ceil((m.width + m.step) / m.setW) + 1);
      if (need !== s.copies) {
        setSetCount(need); // 다시 그린 뒤 layout effect가 다시 맞춘다
        return;
      }
      release();
      s.width = m.width;
      s.step = m.step;
      jump(m.el, m.base + (s.middle * s.count + s.index) * m.step);
      setIdx(s.index);
    };

    /** 스크롤이 멈춘 뒤: 가운데 벌로 순간 보정 + 칸 번호 */
    const settle = () => {
      clearTimeout(s.settleTimer);
      if (s.touching) return; // 손을 뗄 때 다시 부른다 — 끄는 도중의 순간 이동은 iOS에서 튄다
      release();
      const m = measure();
      if (!m) return;
      const x = m.el.scrollLeft;
      const shift = wrapShift(m, x);
      if (shift) jump(m.el, x + shift);
      setIdx(indexAt(m, x + shift));
    };

    const go = (dir: 1 | -1) => {
      const m = measure();
      if (!m) return;
      const { el, step, base } = m;
      // 이동 중이면 그 목적지에서, 아니면 지금 맞물린 칸에서 한 칸
      let to = (s.pending ?? base + Math.round((el.scrollLeft - base) / step) * step) + dir * step;
      // 목적지가 가운데 벌을 벗어나면 출발 전에 벌 하나만큼 옮겨 둔다 — 도착 뒤 보정이 필요 없다.
      // 이동 중이면 지금 위치가 칸 사이라 그대로 옮기면 스냅이 가까운 칸으로 끌어당긴다 → 멈출 때까지 스냅을 끈다
      const shift = wrapShift(m, to);
      if (shift) {
        if (s.pending !== null) {
          el.style.scrollSnapType = 'none';
          s.snapOff = true;
        }
        jump(el, el.scrollLeft + shift);
        to += shift;
      }
      const smooth = !isReduced();
      s.pending = smooth ? to : null;
      el.scrollTo({ left: to, behavior: smooth ? 'smooth' : 'instant' });
      setIdx(indexAt(m, to));
    };

    const blocked = () =>
      !s.running ||
      s.hover ||
      s.touching ||
      document.hidden ||
      // 셸프 안 요소가 포커스를 쥔 채 지워지면 blur가 안 올 수 있어 실제 포커스도 본다
      (s.focusIn && !!regionRef.current?.contains(document.activeElement));

    /** 다음 자동 넘김 예약 — 멈출 조건이 바뀔 때마다 다시 부른다. 풀린 뒤 interval(쉬는 중이면 남은 시간) 기다린다 */
    const schedule = () => {
      clearTimeout(s.autoTimer);
      if (blocked()) return;
      const wait = Math.max(s.intervalMs, s.holdUntil - performance.now());
      s.autoTimer = window.setTimeout(() => {
        if (blocked()) return;
        go(1);
        schedule();
      }, wait);
    };

    const hold = () => {
      s.holdUntil = performance.now() + s.holdMs;
      schedule();
    };

    const onScroll = () => {
      clearTimeout(s.settleTimer);
      s.settleTimer = window.setTimeout(settle, s.settleMs);
    };

    const onTouchEnd = (e: React.TouchEvent) => {
      if (e.touches.length > 0) return;
      s.touching = false;
      hold();
      onScroll(); // 멈춘 채 손을 뗐으면 scroll이 더 안 오므로 여기서 보정을 예약
    };

    return {
      s,
      align,
      schedule,
      stop: () => {
        clearTimeout(s.autoTimer);
        clearTimeout(s.settleTimer);
      },

      prev: () => {
        hold();
        go(-1);
      },
      next: () => {
        hold();
        go(1);
      },

      // React 19 ref 정리 함수 — 스크롤러가 나중에 생기거나 바뀌어도 옵저버가 따라간다
      attachScroller: (el: HTMLDivElement | null) => {
        if (!el) return;
        s.el = el;
        // 폭 변화(734px 경계에서 카드 폭·gap도 바뀜) → 같은 칸으로 다시 맞춘다
        const ro = new ResizeObserver(() => {
          const m = measure();
          if (m && (m.width !== s.width || m.step !== s.step)) align(m);
        });
        ro.observe(el);
        return () => {
          ro.disconnect();
          if (s.el === el) s.el = null;
        };
      },

      onScroll,
      // 사용자가 가로로 직접 굴리면 진행 중이던 목적지는 버린다 (세로 휠은 페이지 스크롤이라 둔다)
      onWheel: (e: React.WheelEvent) => {
        if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) release();
      },
      onTouchStart: () => {
        s.touching = true;
        release();
        schedule();
      },
      onTouchEnd,

      enter: (e: React.PointerEvent) => {
        if (!isMouse(e)) return;
        s.hover = true;
        schedule();
      },
      leave: (e: React.PointerEvent) => {
        if (!isMouse(e)) return;
        s.hover = false;
        schedule();
      },
      pointerDown: () => {
        release();
        hold();
      },
      focus: () => {
        s.focusIn = true;
        hold();
      },
      // 셸프 밖으로 나갈 때만 (안에서 옮겨 다니는 건 그대로 멈춤)
      blur: (e: React.FocusEvent) => {
        const next = e.relatedTarget;
        if (next instanceof Node && regionRef.current?.contains(next)) return;
        s.focusIn = false;
        hold();
      },
    };
  });

  // 목록·벌 수가 바뀌면(처음 포함) 그린 직후 칠하기 전에 제자리로
  useLayoutEffect(() => {
    const { s } = ctl;
    s.count = count;
    s.copies = copies;
    s.middle = middle;
    s.index = Math.min(s.index, Math.max(count - 1, 0));
    ctl.align();
    ctl.schedule();
  }, [ctl, count, copies, middle]);

  // 재생 상태·타이밍
  useEffect(() => {
    Object.assign(ctl.s, {
      running: looping && !paused,
      intervalMs,
      holdMs: holdAfterInteractMs,
      settleMs,
    });
    ctl.schedule();
  }, [ctl, looping, paused, intervalMs, holdAfterInteractMs, settleMs]);

  // 탭이 숨겨지면 멈추고 돌아오면 다시 예약 + 언마운트 시 타이머 정리
  useEffect(() => {
    document.addEventListener('visibilitychange', ctl.schedule);
    return () => {
      document.removeEventListener('visibilitychange', ctl.schedule);
      ctl.stop();
    };
  }, [ctl]);

  return {
    /** 깔 벌 수 (반복이 꺼지면 1) */
    copies,
    /** 실제 벌 번호 — 나머지는 복제 (aria-hidden + 안 링크 tabIndex -1) */
    middle,
    /** 반복·자동 넘김이 켜졌는지 (count ≥ 2). false면 컨트롤·점을 숨긴다 */
    looping,
    /** 맨 앞 카드 번호 0..count-1 — 점 표시. 넘길 때 바로, 스크롤이 멈추면 다시 맞춘다 */
    index,
    /** 사용자 일시정지 또는 동작 줄이기 — 버튼 모양. 마우스·포커스로 잠깐 멈춘 것은 포함하지 않는다 */
    paused,
    pauseLabel: paused ? '자동 넘김 재생' : '자동 넘김 일시정지',
    togglePause: () => setChoice({ paused: !paused, reduced }),
    prev: ctl.prev,
    next: ctl.next,

    /** 스크롤러와 양쪽 페이드를 감싸는 요소 — 마우스 올림·누름·포커스의 범위 */
    regionProps: {
      ref: regionRef,
      onPointerEnter: ctl.enter,
      onPointerLeave: ctl.leave,
      onPointerDown: ctl.pointerDown,
      onFocus: ctl.focus,
      onBlur: ctl.blur,
    },

    /** 가로 스크롤러 — 카드가 직계 자식 */
    scrollerProps: {
      ref: ctl.attachScroller,
      onScroll: ctl.onScroll,
      onWheel: ctl.onWheel,
      onTouchStart: ctl.onTouchStart,
      onTouchEnd: ctl.onTouchEnd,
      onTouchCancel: ctl.onTouchEnd,
    },
  };
}
