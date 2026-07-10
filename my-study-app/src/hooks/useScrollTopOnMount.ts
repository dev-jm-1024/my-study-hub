import { useEffect } from 'react';

export function useScrollTopOnMount() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
}
