import { flushSync } from 'react-dom';

/**
 * DOM 갱신을 View Transition으로 감싼다. 연출은 styles/view-transition.css.
 * 미지원 브라우저·'동작 줄이기' 설정에서는 애니메이션 없이 바로 갱신한다.
 * kind는 전환 동안 <html data-vt="...">로 노출돼 CSS가 전환 종류별로 연출을 고른다.
 */
export function withViewTransition(kind: string, update: () => void): Promise<void> {
  if (
    typeof document.startViewTransition !== 'function' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    update();
    return Promise.resolve();
  }

  const root = document.documentElement;
  root.dataset.vt = kind;
  const transition = document.startViewTransition(() => flushSync(update));
  return transition.finished
    .catch(() => {}) // 전환이 건너뛰어져도 갱신 자체는 끝났다
    .finally(() => {
      if (root.dataset.vt === kind) delete root.dataset.vt;
    });
}

/**
 * root 안에서 selector에 맞는 요소에 전환 이름을 붙인다.
 * 같은 이름이 한 화면에 둘이면 전환이 통째로 취소되므로, 출발 쪽 이름은 클릭한 요소에만 그때그때 붙인다.
 */
export function nameParts(root: Element, names: Record<string, string>) {
  for (const [selector, name] of Object.entries(names)) {
    const el = root.querySelector<HTMLElement>(selector);
    if (el) el.style.viewTransitionName = name;
  }
}
