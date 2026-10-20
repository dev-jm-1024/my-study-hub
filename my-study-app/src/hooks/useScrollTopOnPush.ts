import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * 같은 페이지에서 주소가 새 이동(PUSH)으로 바뀌면 맨 위로 올린다 — 상단 메뉴·햄버거·링크로 ?tag=·?kind=가 바뀌거나 '모든 책'으로 올 때.
 * 세그먼트 클릭(replace)과 뒤로/앞으로(POP)는 스크롤을 그대로 둔다.
 * html의 scroll-behavior: smooth에 끌려가지 않게 동작 줄이기 설정과 무관하게 즉시 이동한다.
 * 페이지가 처음 열릴 때의 맨 위 이동은 useScrollTopOnMount가 맡는다
 */
export function useScrollTopOnPush() {
  const { key } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    if (navType === 'PUSH') window.scrollTo({ top: 0, behavior: 'instant' });
  }, [key, navType]);
}
