import { useCallback, useSyncExternalStore } from 'react';

/**
 * CSS 미디어 쿼리가 지금 맞는지. 첫 렌더부터 실제 값이고(effect를 기다리지 않는다), 바뀌면 다시 렌더한다.
 *
 * @example
 * const drawerMode = useMediaQuery(`(max-width: ${BREAKPOINT.tablet}px)`);
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    [query],
  );
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches);
}
