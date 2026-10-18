/* 상단 내비게이션과 드롭다운 메뉴 구성.
   과목·책·레포·프로젝트 목록은 data/*에서 아래 규칙으로 뽑는다 —
   항목이 늘거나 순위가 바뀌어도 이 파일은 고치지 않는다.
   규칙을 실제 메뉴 데이터로 바꾸는 선택자는 로드맵 RD-2-1(utils/navMenus.ts)에서 만든다. */

import { LINKS } from './links';

export type NavMenuKey = 'archive' | 'books' | 'github' | 'vibe';

export interface NavItem {
  key: NavMenuKey;
  label: string;
  /** 메뉴 이름을 눌렀을 때(드롭다운이 없는 터치 환경 포함) 갈 곳 */
  to: string;
}

/** 상단 바 메뉴 순서. 외부 링크(Velog·Blog)는 constants/links.ts의 SOCIAL_LINKS */
export const NAV_ITEMS: readonly NavItem[] = [
  { key: 'archive', label: '자료실', to: '/' },
  { key: 'books', label: 'Books', to: '/books' },
  { key: 'github', label: 'GitHub', to: '/github' },
  { key: 'vibe', label: 'Vibe', to: '/vibe' },
];

/** 드롭다운 링크 하나 — 내부 경로(to) 또는 외부 주소(href) 중 하나 */
export interface NavLink {
  label: string;
  to?: string;
  href?: string;
  /** '그 외 N개 주제 ›'처럼 보조 링크(label-2 색) */
  muted?: boolean;
}

/** 드롭다운 한 열 — large: 큰 글씨(t3) 첫 열, small: 작은 글씨(foot) 목록 */
export interface NavColumn {
  heading: string;
  size: 'large' | 'small';
  links: readonly NavLink[];
}

/** 자료실 메뉴 축약 규칙 */
export const NAV_ARCHIVE_RULE = {
  largeHeading: '자료실 둘러보기',
  /** 첫 열: '모든 주제' 다음에 문서 수 상위 N개 주제 */
  largeCount: 3,
  /** 작은 목록에 올릴 최소 문서 수. 못 미치면 '그 외 N개 주제'로 묶는다 (NEW 주제는 예외로 올린다) */
  minDocs: 2,
  /** 열 하나에 올릴 최대 항목 수 ('그 외' 링크 제외) */
  maxPerColumn: 5,
  /** 작은 목록 열과 그 열에 넣을 그룹(data/menus.ts의 group). 열 안에서는 문서 수 순 */
  columns: [
    { heading: '데이터 · 인프라', groups: ['데이터베이스', '인프라'] },
    { heading: '설계 · 기타', groups: ['프로그래밍', '프레임워크', '아키텍처', '테스팅'] },
  ],
} as const;

/** Books 메뉴 축약 규칙 */
export const NAV_BOOKS_RULE = {
  largeHeading: 'Books 둘러보기',
  /** 첫 열: '모든 책' 다음에 책이 많은 태그 N개 (동률이면 FILTER_TAGS 순서) */
  tagCount: 3,
  coverHeading: '새로 추가한 책',
  /** books.ts 배열 끝(최근 추가)부터 표지 N장 */
  newCoverCount: 4,
} as const;

/** GitHub 메뉴 — 실습 레포 열은 data/repos.ts에서 전부, 나머지는 고정 */
export const NAV_GITHUB = {
  large: {
    heading: 'GitHub 둘러보기',
    size: 'large',
    links: [
      { label: '모든 레포', to: '/github' },
      { label: '프로필', href: LINKS.github },
    ],
  },
  repoHeading: '실습 레포',
  source: {
    heading: '자료 원본',
    size: 'small',
    links: [{ label: 'study-doc-hub', href: LINKS.docHub }],
  },
} as const satisfies {
  large: NavColumn;
  repoHeading: string;
  source: NavColumn;
};

/** Vibe 메뉴 — 프로젝트 열은 data/vibe.ts에서 전부 */
export const NAV_VIBE_RULE = {
  largeHeading: 'Vibe Coding 둘러보기',
  projectHeading: '프로젝트',
  /** techStack에 이 중 하나라도 있으면 'macOS 앱', 아니면 '웹' */
  macTech: ['Swift', 'SwiftUI', 'AppKit'],
} as const;
