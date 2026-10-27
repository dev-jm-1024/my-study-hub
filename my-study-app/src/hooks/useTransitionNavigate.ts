import { useNavigate } from 'react-router-dom';
import { withViewTransition, nameParts } from '../utils/viewTransition';

/**
 * 링크 클릭을 View Transition 페이지 이동으로 바꾼다.
 * morph: 클릭한 요소 안의 selector → 다음 화면에서 같은 이름을 가진 요소로 이어질 전환 이름
 */
export function useTransitionNavigate() {
  const navigate = useNavigate();

  return (e: React.MouseEvent<HTMLElement>, to: string, morph?: Record<string, string>) => {
    // ⌘/Ctrl 클릭(새 탭) 등은 브라우저 기본 동작에 맡긴다
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (morph) nameParts(e.currentTarget, morph);
    withViewTransition('page', () => {
      navigate(to);
      // html의 scroll-behavior: smooth 때문에 새 화면이 스크롤 도중에 찍히지 않도록 즉시 맨 위로
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  };
}
