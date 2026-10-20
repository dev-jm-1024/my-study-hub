import { useEffect } from 'react';
import { SITE_NAME } from '../constants';

/** 문서 제목(탭·방문 기록)을 '페이지 — JM Hub'로 맞춘다. 페이지 제목이 없으면(홈) 사이트 이름만.
 *  언마운트 때 되돌리지 않는다 — 다음 페이지가 자기 제목을 넣는다 */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} — ${SITE_NAME}` : SITE_NAME;
  }, [title]);
}
