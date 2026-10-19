import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { MENUS } from '../data/menuData';
import { badgeLabel, tintClass } from '../data/topics';

/* ══════════════════════════════════════════════════
   홈 첫 진입 연출 — 흩어진 주제 배지들이 제목의 "한곳에"로 모여든다.
   배지 비행만 여기서(JS: 도착 지점을 재야 해서), 나머지 순서는 styles/home-intro.css.
   두 파일의 시각(ms)이 맞물려 있으니 한쪽을 바꾸면 다른 쪽도 맞춘다.
══════════════════════════════════════════════════ */

const INTRO_MS = 2200;     // 전체 연출이 끝나는 시각 → .home-intro 해제 (가장 늦은 숫자 카운트업 2140 뒤)
const APPEAR_SPREAD = 200; // 배지가 흩어진 자리에 하나씩 나타나는 구간
const GATHER_AT = 500;     // 모여들기 시작 (다 나타난 뒤 잠깐 머문다)
const GATHER_STEP = 14;    // 배지마다 출발 간격 (원을 따라 차례로)
const FLIGHT_MS = 560;
const PATH_STEPS = 12;     // 곡선 경로를 나눌 점 개수

let played = false; // 문서를 새로 불러올 때만 재생 (SPA 안에서 홈으로 돌아올 때는 생략)

/** 이번 진입에서 연출을 재생하는지. 연출이 끝나면 false로 바뀐다 */
export function useHomeIntro() {
  const [playing, setPlaying] = useState(
    () => !played && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  useEffect(() => {
    played = true;
    if (!playing) return;
    // 타이머 대신 빈 애니메이션으로 재서, 개발자 도구에서 느리게 재생해도 연출 도중에 끊기지 않게
    const clock = document.documentElement.animate(null, { duration: INTRO_MS });
    clock.finished.then(() => setPlaying(false), () => {});
    return () => clock.cancel();
  }, [playing]);
  return playing;
}

/**
 * 0부터 target까지 세어 올라간다. enabled가 아니면 바로 target.
 * 시계로 빈 애니메이션을 써서 CSS 연출과 같은 타임라인을 탄다 (개발자 도구에서 느리게 재생해도 함께 느려진다)
 */
export function useCountUp(target: number, enabled: boolean, delay = 1340, duration = 800) {
  const [n, setN] = useState(enabled ? 0 : target);
  useEffect(() => {
    if (!enabled) { setN(target); return; }
    const clock = document.documentElement.animate(null, {
      delay, duration, easing: 'cubic-bezier(0.33, 1, 0.68, 1)', fill: 'both',
    });
    let raf = 0;
    const tick = () => {
      setN(Math.round(target * (clock.effect?.getComputedTiming().progress ?? 1)));
      if (clock.playState !== 'finished') raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); clock.cancel(); };
  }, [target, enabled, delay, duration]);
  return n;
}

/* 고정된 의사 난수 — 새로고침마다 배치가 바뀌지 않게 */
const rand = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

/** 히어로 위에 배지 무리를 띄우고 target(“한곳에”)으로 빨아들인다 */
export function HeroSwarm({ target }: { target: React.RefObject<HTMLElement | null> }) {
  const box = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = box.current;
    const word = target.current;
    if (!root || !word) return;

    const hero = root.getBoundingClientRect();
    const dest = word.getBoundingClientRect();
    const tx = dest.left + dest.width / 2 - hero.left;
    const ty = dest.top + dest.height / 2 - hero.top;
    // 흩뿌릴 타원: 히어로 중 지금 보이는 부분(고정 헤더 아래·뷰포트 안)에서 배지 한 칸씩 안쪽에 내접
    //  → 헤더에 가리거나 화면 밖으로 나가는 배지가 없고, 줄지어 잘린 듯한 가장자리도 생기지 않는다
    const tile = (root.firstElementChild as HTMLElement | null)?.offsetWidth ?? 0;
    const header = document.querySelector('.header')?.getBoundingClientRect().bottom ?? 0;
    const left = Math.max(0, -hero.left) + tile;
    const right = Math.min(hero.width, document.documentElement.clientWidth - hero.left) - tile;
    const top = Math.max(0, header - hero.top) + tile;
    const bottom = Math.min(hero.height, window.innerHeight - hero.top) - tile;
    const cx = (left + right) / 2;
    const cy = (top + bottom) / 2;
    // 가로는 본문 폭(--container) 가장자리를 배지 한 칸 넘는 데까지만 — 넓은 화면에서 너무 흩어지지 않게
    const container = parseFloat(getComputedStyle(root).getPropertyValue('--container')) || Infinity;
    const rx = Math.max(0, Math.min((right - left) / 2, container / 2 + tile));
    const ry = Math.max(0, (bottom - top) / 2);
    const count = root.children.length;
    const anims: Animation[] = [];

    Array.from(root.children).forEach((el, i) => {
      // 출발: 히어로를 둘러싼 타원 위에 흩뿌림
      const angle = -Math.PI / 2 + ((i + 0.5) / count) * Math.PI * 2 + (rand(i + 1) - 0.5) * 0.3;
      const sx = cx + Math.cos(angle) * rx * (0.7 + rand(i + 7) * 0.3);
      const sy = cy + Math.sin(angle) * ry * (0.75 + rand(i + 13) * 0.25);
      const rot = (rand(i + 21) - 0.5) * 40;

      // 비행: 2차 베지어 곡선 — 모든 배지가 같은 방향으로 휘어 소용돌이처럼 모인다
      const mx = (sx + tx) / 2;
      const my = (sy + ty) / 2;
      const kx = mx - (ty - sy) * 0.32;
      const ky = my + (tx - sx) * 0.32;
      const frames: Keyframe[] = [];
      for (let s = 0; s <= PATH_STEPS; s++) {
        const t = s / PATH_STEPS;
        const x = (1 - t) ** 2 * sx + 2 * (1 - t) * t * kx + t ** 2 * tx;
        const y = (1 - t) ** 2 * sy + 2 * (1 - t) * t * ky + t ** 2 * ty;
        frames.push({
          offset: t,
          transform: `translate(${x}px, ${y}px) rotate(${rot * (1 - t)}deg) scale(${1 - 0.65 * t})`,
          opacity: t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3,
        });
      }
      anims.push(el.animate(frames, {
        delay: GATHER_AT + i * GATHER_STEP,
        duration: FLIGHT_MS + rand(i + 3) * 100,
        easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
        fill: 'both',
      }));

      // 등장: 흩어진 자리에서 톡 튀어나온다 (안쪽 배지)
      const chip = el.firstElementChild;
      if (chip) {
        anims.push(chip.animate(
          [{ opacity: 0, transform: 'scale(0.4)' }, { opacity: 1, transform: 'scale(1)' }],
          { delay: rand(i + 31) * APPEAR_SPREAD, duration: 300, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', fill: 'backwards' }
        ));
      }
    });

    return () => anims.forEach(a => a.cancel());
  }, [target]);

  return (
    <div className="intro-swarm" ref={box} aria-hidden="true">
      {MENUS.map(m => (
        <span key={m.key} className="intro-tile">
          <span className={`cat-badge ${tintClass(m.key)}`}>{badgeLabel(m.key, m.name)}</span>
        </span>
      ))}
    </div>
  );
}
