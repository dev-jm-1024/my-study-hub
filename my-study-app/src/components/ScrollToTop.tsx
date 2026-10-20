import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export function ScrollToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!show) return null;

  const toTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    /* '동작 줄이기'에서는 부드러운 스크롤 없이 바로 올라간다 */
    window.scrollTo({ top: 0, behavior: reduce ? 'instant' : 'smooth' });
  };

  return (
    <button className="to-top" aria-label="맨 위로" onClick={toTop}>
      <ArrowUp size={18} />
    </button>
  );
}
