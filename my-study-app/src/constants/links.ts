/* 외부 링크 — Navbar·Footer·ProfileCard·드롭다운에 흩어져 있던 주소의 단일 출처 */

export const LINKS = {
  github: 'https://github.com/dev-jm-1024',
  velog: 'https://velog.io/@dlwoals1024/posts',
  blog: 'https://blog.naver.com/jon1024',
  /** 자료실 PDF 원본 저장소 */
  docHub: 'https://github.com/dev-jm-1024/study-doc-hub',
} as const;

export interface SocialLink {
  label: string;
  /** 상단 바처럼 좁은 곳에서 쓰는 짧은 이름 */
  shortLabel: string;
  href: string;
}

/** 상단 바(짧은 이름)·푸터(긴 이름)에 같은 순서로 노출 */
export const SOCIAL_LINKS: readonly SocialLink[] = [
  { label: 'Velog', shortLabel: 'Velog', href: LINKS.velog },
  { label: '네이버 블로그', shortLabel: 'Blog', href: LINKS.blog },
  { label: 'GitHub', shortLabel: 'GitHub', href: LINKS.github },
];
