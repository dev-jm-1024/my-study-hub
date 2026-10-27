import { useEffect, useLayoutEffect, useState, useSyncExternalStore } from 'react';
import { LATEST_SHELF } from '../constants';
import { isOverlayOpen, subscribeOverlay } from '../utils/overlay';

/**
 * 끝없이 흐르는 가로 셸프 — 홈 '최근 올라온 문서' (계획서 §4.2). 마크업은 모른다 —
 * 같은 목록을 `copies`벌 깔게 하고, 보이는 위치를 가운데 벌 근처에 붙잡아 둔다(벌 하나만큼 순간 이동해도 생김새가 같아 안 보인다).
 *   - 자동 흐름: speedPxPerSec로 멈추지 않고 왼쪽으로 흐른다. 움직이는 동안은 rAF가 트랙을 transform으로 민다(소수 px까지 매 프레임 고르게,
 *     스크롤 위치는 그대로) — 멈추면 민 양을 scrollLeft로 옮겨 손으로 굴리는 네이티브 스크롤과 이어진다
 *   - 멈춤: 일시정지(재생을 누를 때까지) · 마우스 올림 · 셸프 안 포커스는 rampMs 동안 감속해 멈추고, 풀리면 같은 시간 동안 가속한다.
 *     손가락 닿음 · 가로 휠은 그 자리에서 바로(잡은 것처럼), 탭 숨김 · 셸프가 화면 밖이면 바로(보는 사람 없음),
 *     화면을 덮는 층(모달·드롭다운 — utils/overlay)이 열려 있으면 바로(덮개 블러를 매 프레임 다시 그리지 않게).
 *     다시 흐를 때는 어느 경우든 rampMs 동안 가속한다.
 *     화살표·터치·누름·포커스가 끝나면 holdAfterInteractMs 쉰 뒤 다시 흐른다
 *   - 이전/다음: 시작선에 가장 가까운 카드(점)의 앞/뒤 카드를 glideMs 동안 시작선으로 미끄러뜨린다. 흐르던 속도를 이어받고, 연타하면 한 칸씩 더 간다
 *   - 셸프 안에 포커스가 있는 동안: 브라우저가 포커스 카드를 보이게 스크롤한 자리를 지킨다(이음매 보정을 쉰다), 점은 포커스 카드
 *   - 동작 줄이기: 처음부터 일시정지(설정이 바뀌면 그쪽을 따른다). 이전/다음은 순간 이동, 재생을 눌렀다면 흐르되 감속·가속 없이
 *   - 창 폭이 바뀌면 지금 위치(몇 번째 카드의 몇 %)를 지킨 채 다시 맞춘다. count < 2면 반복·흐름 없이 한 벌만 (looping false)
 *
 * @example
 * const shelf = useInfiniteCarousel({ count: docs.length });
 * <button aria-label={shelf.pauseLabel} onClick={shelf.togglePause}>{shelf.paused ? <Play /> : <Pause />}</button>
 * <button aria-label="이전 문서" onClick={shelf.prev} /> <button aria-label="다음 문서" onClick={shelf.next} />
 * <div {...shelf.regionProps}>                         // 스크롤러 + 양쪽 페이드를 감싸는 요소
 *   <div {...shelf.scrollerProps}>                     // 가로 스크롤 (손·휠)
 *     <div {...shelf.trackProps}>                      // 흐르는 띠 (훅이 transform을 쓴다)
 *       {Array.from({ length: shelf.copies }, (_, set) => docs.map(doc => {
 *         const clone = set !== shelf.middle;
 *         return <article key={`${set}-${doc.id}`} aria-hidden={clone || undefined}>… <a tabIndex={clone ? -1 : undefined}>받기</a></article>;
 *       }))}
 *     </div>
 *   </div>
 * </div>
 * <div aria-hidden="true">{docs.map((_, i) => <span key={i} data-on={i === shelf.index} />)}</div>
 *
 * 렌더 쪽이 지킬 것
 *   1. 카드 = 트랙의 직계 자식, 그 밖의 자식 없음(간격은 gap, 페이드는 스크롤러 밖 형제). 카드 폭은 모두 같고 벌마다 같은 순서
 *   2. 스크롤러 overflow-x: auto, 폭은 부모가 정한다. 시작선(카드를 맞추는 자리)은 스크롤러 scroll-padding-left로 알려 준다.
 *      scroll-snap · scroll-behavior: smooth는 쓰지 않는다 — 흐르는 동안 위치를 훅이 쥐고, 이동 방식도 훅이 고른다
 *   3. 트랙 width: max-content(양끝 여백은 트랙 padding), will-change: transform. 트랙 transform은 훅이 인라인으로 쓰므로 CSS로 주지 않는다
 *   4. 복제 벌(set !== middle): 카드 aria-hidden, 안의 링크·버튼 tabIndex={-1}. inert는 안 된다 — 보이는 복제 카드도 눌려야 한다
 *   5. 셸프와 조상에 scale 변형(등장 애니메이션 등)을 걸지 않는다 — 카드 위치를 getBoundingClientRect로 잰다
 *   6. looping이 false면 일시정지·이전/다음·점을 숨긴다
 *   7. 일시정지 버튼 모양·라벨은 paused만 따른다 (마우스·포커스로 잠깐 멈춘 것은 버튼에 드러내지 않는다)
 */

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

const subscribeReduced = (onChange: () => void) => {
  const mql = window.matchMedia(REDUCED_QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
};
const isReduced = () => window.matchMedia(REDUCED_QUERY).matches;

const isMouse = (e: PointerEvent) => e.pointerType === 'mouse';
const mod = (a: number, n: number) => ((a % n) + n) % n;
const jump = (el: HTMLElement, left: number) => el.scrollTo({ left, behavior: 'instant' });
/** 흐름 속도 램프 0..1 → 0..1 — 양끝 기울기 0이라 멈출 때·출발할 때 툭 끊기지 않는다 */
const ease = (k: number) => k * k * (3 - 2 * k);
/** ∫₀ᵏ ease — 속도 비율 k에서 일정한 비율로 감속해 멈출 때까지 가는 거리 (× speed / 감속률) */
const easeArea = (k: number) => k * k * k * (1 - k / 2);

interface Metrics {
  el: HTMLElement;
  /** 카드 한 칸 (폭 + gap) */
  step: number;
  /** 한 벌 = step × count */
  setW: number;
  /** 첫 카드가 시작선에 맞물리는 보이는 위치 */
  base: number;
  /** 보이는 폭 */
  width: number;
}

/** 화살표 이동 — 지금 위치·속도에서 출발해 목적지에 속도 0으로 닿는 3차 곡선 (위치는 보이는 위치 x) */
interface Glide {
  from: number;
  /** 출발 속도 (px/ms) — 흐르던 속도를 이어받는다 */
  v0: number;
  to: number;
  t0: number;
  dur: number;
}

/** 곡선 위 [위치, 속도(px/ms)] — 에르미트 보간 */
const glideAt = (g: Glide, now: number): [number, number] => {
  const u = Math.min(Math.max((now - g.t0) / g.dur, 0), 1);
  const u2 = u * u;
  const u3 = u2 * u;
  const d = g.to - g.from;
  return [
    g.from + (u3 - 2 * u2 + u) * g.dur * g.v0 + (3 * u2 - 2 * u3) * d,
    (3 * u2 - 4 * u + 1) * g.v0 + ((6 * u - 6 * u2) * d) / g.dur,
  ];
};

/** 재생/일시정지를 누른 때의 동작 줄이기 설정 — 설정이 바뀌면 이 선택을 버리고 설정을 따른다 */
interface PauseChoice {
  paused: boolean;
  reduced: boolean;
}

export interface InfiniteCarouselOptions {
  /** 실제 카드 수 (복제 제외). 2 미만이면 한 벌만 깔고 반복·흐름을 끈다 */
  count: number;
  speedPxPerSec?: number;
  rampMs?: number;
  glideMs?: number;
  holdAfterInteractMs?: number;
  settleMs?: number;
}

export function useInfiniteCarousel({
  count,
  speedPxPerSec = LATEST_SHELF.speedPxPerSec,
  rampMs = LATEST_SHELF.rampMs,
  glideMs = LATEST_SHELF.glideMs,
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

  const copies = looping ? setCount : 1;
  const middle = Math.floor(copies / 2);
  const index = Math.min(indexState, Math.max(count - 1, 0));

  // 이벤트·프레임·타이머·옵저버가 함께 쓰는 동작. ref와 setState만 만지므로 한 번 만들어 계속 쓴다
  const [ctl] = useState(() => {
    // 렌더와 따로 움직이는 값 (렌더 값은 effect가 옮겨 준다).
    // 보이는 위치 x = scrollLeft + shift — 움직이는 동안은 shift(트랙 transform)만 바꾸고, 멈추면 scrollLeft로 옮긴다
    const s = {
      el: null as HTMLDivElement | null,
      track: null as HTMLDivElement | null,
      /** 스크롤러와 페이드를 감싸는 요소 — 마우스 올림·포커스의 범위 */
      region: null as HTMLDivElement | null,
      count: 0,
      copies: 1,
      middle: 0,
      index: 0,
      /** 시작선 위치를 카드 단위로 (0 = 가운데 벌 첫 카드) — 창 폭이 바뀌어도 이 자리를 지킨다 */
      pos: 0,
      /** 반복 가능하고 일시정지가 아님 */
      running: false,
      reduced: false,
      hover: false,
      focusIn: false,
      /** 셸프 안에서 포커스를 쥔 카드 번호 (−1 = 없음) — 그동안 점은 이 카드를 가리킨다 */
      focusCard: -1,
      touching: false,
      /** 셸프가 화면에 걸쳐 있는지 */
      onScreen: false,
      /** 화면을 덮는 층이 열려 있는지 */
      covered: false,
      holdUntil: 0,
      /** 트랙을 왼쪽으로 민 양 (px) */
      shift: 0,
      /** 흐름 속도 비율 0..1 과 향하는 값 */
      k: 0,
      kTo: 0,
      /** 감속해 멈출 자리 (정수 px) — 멈춘 뒤 scrollLeft로 옮길 때 소수점만큼 튀지 않게 */
      stopAt: null as number | null,
      /** 진행 중인 화살표 이동 — 연타는 그 목적지에서 한 칸씩 더 간다 */
      glide: null as Glide | null,
      raf: 0,
      /** 직전 프레임 시각 (−1 = 첫 프레임, 이동 없이 시각만 잡는다) */
      last: -1,
      /** 마지막 측정 — 프레임·스크롤마다 다시 재지 않는다 (배치가 바뀌면 옵저버·align이 다시 잰다) */
      geo: null as Metrics | null,
      /** 마지막으로 맞춘 폭·칸 — 높이만 바뀐 리사이즈는 건너뛴다 */
      width: 0,
      step: 0,
      speed: 0,
      rampMs: 0,
      glideMs: 0,
      holdMs: 0,
      settleMs: 0,
      holdTimer: 0,
      settleTimer: 0,
    };

    const measure = (): Metrics | null => {
      const { el, track } = s;
      const n = s.count;
      if (!el || !track || n < 2 || track.children.length <= n) return null;
      const first = track.children[0].getBoundingClientRect().left;
      const setW = track.children[n].getBoundingClientRect().left - first;
      if (!(setW > 0)) return null; // 숨겨져 있거나 배치 전
      const pad = parseFloat(getComputedStyle(el).scrollPaddingLeft) || 0;
      const base = el.scrollLeft + s.shift + first - el.getBoundingClientRect().left - el.clientLeft - pad;
      s.geo = { el, step: setW / n, setW, base, width: el.clientWidth };
      return s.geo;
    };

    /** x를 가운데 벌 범위 [setW − step/2, 2·setW − step/2)로 옮기는 데 더할 값 (벌 단위) */
    const wrapShift = (m: Metrics, x: number) => {
      const lo = m.base + s.middle * m.setW - m.step / 2;
      return -Math.floor((x - lo) / m.setW) * m.setW;
    };

    const indexAt = (m: Metrics, x: number) => mod(Math.round((x - m.base) / m.step), s.count);

    const setIdx = (i: number) => {
      if (i === s.index) return;
      s.index = i;
      setIndex(i);
    };

    /** 셸프 안 요소가 포커스를 쥐었는지 — 그 요소가 지워지면 blur가 안 올 수 있어 실제 포커스도 본다 */
    const focused = () => s.focusIn && !!s.region?.contains(document.activeElement);

    /** 이음매 보정량 — 셸프 안에 포커스가 있으면 쉰다. 브라우저가 포커스 카드를 보이게 스크롤한 자리는 가운데 벌 범위 밖일 수 있는데,
     *  거기서 벌을 옮기면 포커스 카드가 화면 밖으로 나가고 그 자리엔 복제가 남는다. 벌 수에 화면 폭 + 한 칸 여유가 있어
     *  가운데 벌 카드를 어디에 보여 줘도 끝에 닿지 않는다 */
    const seam = (m: Metrics, x: number) => (focused() ? 0 : wrapShift(m, x));

    /** 보이는 위치를 기록하고 점을 맞춘다 (화살표 이동 중에는 점이 이미 목적지를, 포커스 중에는 포커스 카드를 가리킨다) */
    const note = (m: Metrics, x: number) => {
      s.pos = (x - m.base) / m.step - s.middle * s.count;
      if (s.glide) return;
      setIdx(s.focusCard >= 0 && focused() ? s.focusCard : indexAt(m, x));
    };

    /** 0이면 transform을 지운다 — 멈춘 글자가 소수 px 위치에서 흐려지지 않게 */
    const setShift = (px: number) => {
      s.shift = px;
      if (s.track) s.track.style.transform = px ? `translateX(${-px}px)` : '';
    };

    /** 지금 위치(pos)를 다시 맞춘다 (순간) — 처음 · 목록 변화 · 폭 변화 */
    const align = (m = measure()) => {
      if (!m) return;
      // 화면 폭 + 한 칸만큼 양옆에 여유 벌이 있어야 끝에 닿지 않는다
      const need = Math.max(LATEST_SHELF.copies, 2 * Math.ceil((m.width + m.step) / m.setW) + 1);
      if (need !== s.copies) {
        setSetCount(need); // 다시 그린 뒤 layout effect가 다시 맞춘다
        return;
      }
      if (s.glide) {
        // 이동 도중에 폭이 바뀌면 목적지(점이 가리키는 칸)에 내려놓는다
        s.glide = null;
        s.pos = s.index;
      }
      s.width = m.width;
      s.step = m.step;
      const x = m.base + (s.middle * s.count + s.pos) * m.step;
      setShift(0);
      jump(m.el, Math.round(x));
      note(m, x);
    };

    /** 움직임·스크롤이 멈춘 뒤: 민 양을 scrollLeft로 옮기고(정수 px) 가운데 벌로 순간 보정 + 칸 번호 */
    const settle = () => {
      clearTimeout(s.settleTimer);
      // 손을 떼거나 움직임이 끝날 때 다시 부른다 — 끄는 도중의 순간 이동은 iOS에서 튄다
      if (s.touching || s.raf) return;
      const m = measure();
      if (!m) return;
      const x0 = m.el.scrollLeft + s.shift;
      const shift = seam(m, x0);
      const x = x0 + shift;
      if (shift || s.shift) {
        setShift(0);
        jump(m.el, Math.round(x));
      }
      note(m, x);
    };

    const onScroll = () => {
      clearTimeout(s.settleTimer);
      s.settleTimer = window.setTimeout(settle, s.settleMs);
      // 손으로 굴리는 동안에도 점이 따라간다
      if (!s.raf && s.geo && s.el) note(s.geo, s.el.scrollLeft + s.shift);
    };

    /** 한 프레임 — 화살표 곡선을 따라가거나, 흐름 속도(램프 포함)만큼 민다. 가운데 벌을 벗어나면 같은 프레임에 벌 하나만큼 되돌린다 */
    const frame = (now: number) => {
      s.raf = 0;
      const m = s.geo;
      const el = s.el;
      if (!m || !el) return;
      const dt = s.last < 0 ? 0 : Math.max(now - s.last, 0);
      s.last = now;
      // 스크롤 위치는 매번 다시 읽는다 — 포커스 등으로 브라우저가 옮겼어도 그 자리에서 잇는다
      let x = el.scrollLeft + s.shift;
      const g = s.glide;
      if (g) {
        x = glideAt(g, now)[0];
        if (now >= g.t0 + g.dur) s.glide = null;
      } else {
        const v = s.speed / 1000;
        const k0 = s.k;
        // 속도 비율이 바뀌는 빠르기 (1/ms) — 0이면 그 자리에서 바뀐다
        let rate = s.reduced || s.rampMs <= 0 ? 0 : 1 / s.rampMs;
        if (rate && s.kTo < k0) {
          // 감속: 멈출 자리를 정수 px로 정하고 거기 딱 닿는 감속률로 (보통보다 조금 느리다)
          s.stopAt ??= Math.ceil(x + (v * easeArea(k0)) / rate);
          const left = s.stopAt - x;
          rate = left > 0 ? (v * easeArea(k0)) / left : 0;
        } else {
          s.stopAt = null;
        }
        const k1 = !rate ? s.kTo : s.kTo > k0 ? Math.min(k0 + rate * dt, s.kTo) : Math.max(k0 - rate * dt, s.kTo);
        // 이 프레임에 간 거리를 정확히 적분한다 — 비율이 바뀌는 구간(∫ease) + 그 뒤 일정한 구간
        const ramp = rate ? Math.abs(k1 - k0) / rate : 0;
        x += v * ((rate ? Math.abs(easeArea(k1) - easeArea(k0)) / rate : 0) + ease(k1) * (dt - ramp));
        s.k = k1;
      }
      const moving = !!s.glide || s.k > 0 || s.kTo > 0;
      if (!moving) {
        // 멈췄다 — 정수 px에 내려놓는다 (감속했다면 이미 거기, 그 자리에서 멈췄다면 1px 안쪽 앞으로)
        x = s.stopAt ?? Math.ceil(x - 1e-6);
        s.stopAt = null;
      }
      const w = seam(m, x);
      if (w) {
        x += w;
        if (s.stopAt !== null) s.stopAt += w;
        if (s.glide) {
          s.glide.from += w;
          s.glide.to += w;
        }
      }
      setShift(x - el.scrollLeft);
      note(m, x);
      if (moving) s.raf = requestAnimationFrame(frame);
      else onScroll(); // 잠시 뒤 scrollLeft로 옮긴다
    };

    const kick = () => {
      if (s.raf || !s.geo || !(s.glide || s.k > 0 || s.kTo > 0)) return;
      s.last = -1;
      s.raf = requestAnimationFrame(frame);
    };

    /** 움직임을 그 자리에서 끝낸다 (정수 px로, 화살표 이동은 목적지로) — 탭 숨김 · 언마운트 */
    const halt = () => {
      cancelAnimationFrame(s.raf);
      s.raf = 0;
      s.k = 0;
      s.stopAt = null;
      const el = s.el;
      if (el) setShift((s.glide ? s.glide.to : Math.ceil(el.scrollLeft + s.shift - 1e-6)) - el.scrollLeft);
      s.glide = null;
    };

    const blocked = () =>
      !s.running ||
      !s.onScreen ||
      s.hover ||
      s.touching ||
      s.covered ||
      document.hidden ||
      focused();

    /** 흐를지 다시 정한다 — 멈출 조건이 바뀔 때마다 부른다. 쉬는 중이면 남은 시간 뒤에 다시 본다 */
    const update = () => {
      clearTimeout(s.holdTimer);
      const free = !blocked();
      const wait = s.holdUntil - performance.now();
      if (free && wait > 0) s.holdTimer = window.setTimeout(update, wait);
      s.kTo = free && wait <= 0 ? 1 : 0;
      // 손가락 · 덮는 층 · 탭 숨김 · 화면 밖은 감속 없이 그 자리에서
      if (s.touching || s.covered || document.hidden || !s.onScreen) s.k = 0;
      kick();
    };

    const hold = () => {
      s.holdUntil = performance.now() + s.holdMs;
      update();
    };

    const go = (dir: 1 | -1) => {
      const m = measure();
      if (!m) return;
      const { el, step, base } = m;
      const now = performance.now();
      const g = s.glide;
      const [x, v] = g ? glideAt(g, now) : [el.scrollLeft + s.shift, s.raf ? (s.speed * ease(s.k)) / 1000 : 0];
      // 이동 중이면 그 목적지에서, 아니면 시작선에 가장 가까운 카드(= 점)에서 한 칸. 멈출 자리는 정수 px
      const to = Math.round(base + (Math.round(((g ? g.to : x) - base) / step) + dir) * step);
      s.k = 0;
      s.stopAt = null;
      if (s.reduced) {
        s.glide = null;
        const at = to + wrapShift(m, to);
        setShift(0);
        jump(el, Math.round(at));
        note(m, at);
        return;
      }
      // 반대로 흐르던 속도는 이어받지 않는다 (뒤로 가기 전에 앞으로 밀리지 않게)
      s.glide = { from: x, v0: v * dir > 0 ? v : 0, to, t0: now, dur: s.glideMs };
      setIdx(indexAt(m, to));
      kick();
    };

    const enter = (e: PointerEvent) => {
      if (!isMouse(e)) return;
      s.hover = true;
      update();
    };
    const leave = (e: PointerEvent) => {
      if (!isMouse(e)) return;
      s.hover = false;
      update();
    };

    return {
      s,
      align,
      update,
      stop: () => {
        halt();
        clearTimeout(s.holdTimer);
        clearTimeout(s.settleTimer);
      },
      onVisibility: () => {
        if (document.hidden) {
          halt();
          onScroll();
        }
        update();
      },
      onOverlay: () => {
        s.covered = isOverlayOpen();
        update();
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
        // 폭 변화(734px 경계에서 gap도 바뀜) → 같은 위치로 다시 맞춘다
        const ro = new ResizeObserver(() => {
          const m = measure();
          if (m && (m.width !== s.width || m.step !== s.step)) align(m);
        });
        // 화면 밖에서는 흐르지 않는다 — 보는 사람 없이 매 프레임 그리지 않게
        const io = new IntersectionObserver(entries => {
          s.onScreen = entries[entries.length - 1].isIntersecting;
          update();
        });
        ro.observe(el);
        io.observe(el);
        return () => {
          ro.disconnect();
          io.disconnect();
          if (s.el === el) s.el = null;
        };
      },
      attachTrack: (el: HTMLDivElement | null) => {
        if (!el) return;
        s.track = el;
        return () => {
          if (s.track === el) s.track = null;
        };
      },
      // 마우스 올림은 브라우저의 pointerenter·leave를 그대로 따른다. React onPointerEnter는 멈춰 있는 마우스 밑에서
      // 덮개(검색 팔레트)가 DOM에서 빠질 때 오지 않는다 — 브라우저가 다시 보내는 enter를 빠진 덮개에서 온 것으로 보고 거른다
      attachRegion: (el: HTMLDivElement | null) => {
        if (!el) return;
        s.region = el;
        el.addEventListener('pointerenter', enter);
        el.addEventListener('pointerleave', leave);
        return () => {
          el.removeEventListener('pointerenter', enter);
          el.removeEventListener('pointerleave', leave);
          if (s.region === el) s.region = null;
        };
      },

      onScroll,
      // 사용자가 가로로 직접 굴리면 그 자리에서 잡는다 (세로 휠은 페이지 스크롤이라 둔다)
      onWheel: (e: React.WheelEvent) => {
        if (!(e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY))) return;
        s.glide = null;
        s.k = 0;
        hold();
      },
      onTouchStart: () => {
        s.touching = true;
        s.glide = null;
        update();
      },
      onTouchEnd: (e: React.TouchEvent) => {
        if (e.touches.length > 0) return;
        s.touching = false;
        hold();
        onScroll(); // 멈춘 채 손을 뗐으면 scroll이 더 안 오므로 여기서 보정을 예약
      },

      pointerDown: hold,
      focus: (e: React.FocusEvent) => {
        s.focusIn = true;
        // 포커스를 쥔 카드(트랙의 직계 자식)를 점이 가리킨다
        let card = e.target as Element | null;
        while (card && card.parentElement !== s.track) card = card.parentElement;
        s.focusCard = card && s.track ? mod(Array.prototype.indexOf.call(s.track.children, card), s.count) : -1;
        if (s.focusCard >= 0 && !s.glide) setIdx(s.focusCard);
        hold();
      },
      // 셸프 밖으로 나갈 때만 (안에서 옮겨 다니는 건 그대로 멈춤)
      blur: (e: React.FocusEvent) => {
        const next = e.relatedTarget;
        if (next instanceof Node && s.region?.contains(next)) return;
        s.focusIn = false;
        s.focusCard = -1;
        hold();
        onScroll(); // 점을 시작선 카드로 되돌리고, 쉬던 이음매 보정을 잠시 뒤에
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
    s.pos = Math.min(s.pos, Math.max(count - 1, 0));
    ctl.align();
    ctl.update();
  }, [ctl, count, copies, middle]);

  // 재생 상태·속도·타이밍
  useEffect(() => {
    Object.assign(ctl.s, {
      running: looping && !paused,
      reduced,
      speed: speedPxPerSec,
      rampMs,
      glideMs,
      holdMs: holdAfterInteractMs,
      settleMs,
    });
    ctl.update();
  }, [ctl, looping, paused, reduced, speedPxPerSec, rampMs, glideMs, holdAfterInteractMs, settleMs]);

  // 탭이 숨겨지거나 화면을 덮는 층이 열리면 그 자리에서 멈추고, 걷히면 다시 흐른다 + 언마운트 시 프레임·타이머 정리
  useEffect(() => {
    document.addEventListener('visibilitychange', ctl.onVisibility);
    const unsubscribe = subscribeOverlay(ctl.onOverlay);
    ctl.onOverlay(); // 이미 열린 채로 마운트됐을 때
    return () => {
      document.removeEventListener('visibilitychange', ctl.onVisibility);
      unsubscribe();
      ctl.stop();
    };
  }, [ctl]);

  return {
    /** 깔 벌 수 (반복이 꺼지면 1) */
    copies,
    /** 실제 벌 번호 — 나머지는 복제 (aria-hidden + 안 링크 tabIndex -1) */
    middle,
    /** 반복·흐름이 켜졌는지 (count ≥ 2). false면 컨트롤·점을 숨긴다 */
    looping,
    /** 시작선에 가장 가까운 카드 번호 0..count-1 — 점 표시. 바뀔 때만 다시 그린다. 화살표를 누르면 바로 목적지 */
    index,
    /** 사용자 일시정지 또는 동작 줄이기 — 버튼 모양. 마우스·포커스로 잠깐 멈춘 것은 포함하지 않는다 */
    paused,
    pauseLabel: paused ? '최근 문서 흐름 재생' : '최근 문서 흐름 일시정지',
    togglePause: () => setChoice({ paused: !paused, reduced }),
    prev: ctl.prev,
    next: ctl.next,

    /** 스크롤러와 양쪽 페이드를 감싸는 요소 — 마우스 올림·누름·포커스의 범위 */
    regionProps: {
      ref: ctl.attachRegion,
      onPointerDown: ctl.pointerDown,
      onFocus: ctl.focus,
      onBlur: ctl.blur,
    },

    /** 가로 스크롤러 — 트랙 하나만 담는다 */
    scrollerProps: {
      ref: ctl.attachScroller,
      onScroll: ctl.onScroll,
      onWheel: ctl.onWheel,
      onTouchStart: ctl.onTouchStart,
      onTouchEnd: ctl.onTouchEnd,
      onTouchCancel: ctl.onTouchEnd,
    },

    /** 흐르는 띠 — 카드가 직계 자식. transform은 훅이 쓴다 */
    trackProps: {
      ref: ctl.attachTrack,
    },
  };
}
