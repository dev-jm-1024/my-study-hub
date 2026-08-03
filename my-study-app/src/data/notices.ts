import type { CategoryNotice } from '../types';

/* 카테고리별 공지 — 자료실 헤더 아래에 노출.
   키가 없는 카테고리는 공지 영역 자체가 렌더되지 않는다. */
export const NOTICES: Record<string, CategoryNotice> = {
  java: {
    body: '이곳의 문서는 자바 기초 문법을 안다는 전제로 쓰였습니다. 기초부터 다지고 싶다면 아래 글을 참고하시거나, 입문서 · 공식 문서를 함께 보시길 권합니다.',
    link: { label: '네이버 블로그 — 자바 기초 정리', href: 'https://blog.naver.com/jon1024/223544059862' },
  },
};
