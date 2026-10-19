/* 상단 드롭다운 4종의 열 구성 선택자.
   규칙 값은 constants/navigation.ts, 재료는 data/*. 과목·책·레포가 늘어도 이 파일은 고치지 않는다.
   라벨 약속: 보조 링크(muted)에 '›', 외부 링크(href)에 '↗'를 넣지 않는다 — NavPanel이 붙인다. */

import {
  NAV_ARCHIVE_RULE,
  NAV_BOOKS_RULE,
  NAV_GITHUB,
  NAV_VIBE_RULE,
  type NavColumn,
  type NavLink,
  type NavMenuKey,
} from '../constants/navigation';
import { BOOKS, BOOK_FILTER_TAGS } from '../data/books';
import { MENUS } from '../data/menus';
import { REPO_DATA } from '../data/repos';
import { VIBE_PROJECTS } from '../data/vibe';
import { docCount } from './category';

export interface BuildNavMenusOptions {
  /** NEW 주제 판정(Ch4에서 addedAt 기준으로 넘긴다). 기본은 NEW 없음 */
  isNewTopic?: (key: string) => boolean;
}

interface Topic {
  key: string;
  name: string;
  group: string;
  docs: number;
}

const topicLink = (t: Topic): NavLink => ({ label: t.name, to: `/download/${t.key}` });

function buildArchive(isNewTopic: (key: string) => boolean): NavColumn[] {
  const { largeHeading, largeCount, minDocs, maxPerColumn, columns } = NAV_ARCHIVE_RULE;

  // 문서 수 내림차순, 동률은 MENUS 순서 (Array.prototype.sort는 안정 정렬)
  const ranked: Topic[] = MENUS.map(m => ({ key: m.key, name: m.name, group: m.group, docs: docCount(m.key) }))
    .sort((a, b) => b.docs - a.docs);

  const shown = new Set<string>();
  const take = (topics: Topic[]): Topic[] => {
    topics.forEach(t => shown.add(t.key));
    return topics;
  };

  const large = take(ranked.slice(0, largeCount));
  const result: NavColumn[] = [{
    heading: largeHeading,
    size: 'large',
    links: [{ label: '모든 주제', to: '/' }, ...large.map(topicLink)],
  }];

  columns.forEach(col => {
    const groups: readonly string[] = col.groups;
    const picked = take(
      ranked
        .filter(t => !shown.has(t.key) && groups.includes(t.group) && (t.docs >= minDocs || isNewTopic(t.key)))
        .slice(0, maxPerColumn),
    );
    if (picked.length > 0) {
      result.push({ heading: col.heading, size: 'small', links: picked.map(topicLink) });
    }
  });

  // 어느 열에도 못 올린 주제(문서 수 미달·새 그룹 포함)는 마지막 열 끝에 한 줄로 묶는다
  const rest = ranked.length - shown.size;
  if (rest > 0) {
    const last = result[result.length - 1];
    result[result.length - 1] = {
      ...last,
      links: [...last.links, { label: `그 외 ${rest}개 주제`, to: '/', muted: true }],
    };
  }
  return result;
}

function buildBooks(): NavColumn[] {
  const { largeHeading, tagCount, coverHeading, newCoverCount } = NAV_BOOKS_RULE;

  // 책 수 내림차순, 동률은 BOOK_FILTER_TAGS 순서
  const tags = BOOK_FILTER_TAGS
    .map(tag => ({ tag, count: BOOKS.filter(b => b.tags?.includes(tag)).length }))
    .filter(t => t.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, tagCount);

  // books.ts 배열 끝이 최근 추가 — 새 책이 먼저 오게 뒤집는다
  const covers = BOOKS.slice(-newCoverCount).reverse()
    .map(b => ({ title: b.title, coverUrl: b.coverUrl, to: '/books' }));

  return [
    {
      heading: largeHeading,
      size: 'large',
      links: [
        { label: '모든 책', to: '/books' },
        ...tags.map(({ tag }) => ({ label: tag, to: `/books?tag=${encodeURIComponent(tag)}` })),
      ],
    },
    {
      heading: coverHeading,
      size: 'covers',
      covers,
      links: [{ label: `추천 도서 ${BOOKS.length}권 모두 보기`, to: '/books', muted: true }],
    },
  ];
}

function buildGithub(): NavColumn[] {
  return [
    NAV_GITHUB.large,
    {
      heading: NAV_GITHUB.repoHeading,
      size: 'small',
      links: REPO_DATA.map(r => ({ label: r.title, href: r.repoUrl })),
    },
    NAV_GITHUB.source,
  ];
}

function buildVibe(): NavColumn[] {
  const { largeHeading, projectHeading, macTech } = NAV_VIBE_RULE;
  const mac: readonly string[] = macTech;

  const macCount = VIBE_PROJECTS.filter(p => p.techStack.some(t => mac.includes(t))).length;
  const webCount = VIBE_PROJECTS.length - macCount;

  const links: NavLink[] = [{ label: '모든 프로젝트', to: '/vibe' }];
  if (macCount > 0) links.push({ label: 'macOS 앱', to: '/vibe?kind=macos' });
  if (webCount > 0) links.push({ label: '웹', to: '/vibe?kind=web' });

  return [
    { heading: largeHeading, size: 'large', links },
    {
      heading: projectHeading,
      size: 'small',
      links: VIBE_PROJECTS.map(p => {
        const href = p.link ?? p.github;
        return href ? { label: p.name, href } : { label: p.name, to: '/vibe' };
      }),
    },
  ];
}

export function buildNavMenus(opts: BuildNavMenusOptions = {}): Record<NavMenuKey, NavColumn[]> {
  const { isNewTopic = () => false } = opts;
  return {
    archive: buildArchive(isNewTopic),
    books: buildBooks(),
    github: buildGithub(),
    vibe: buildVibe(),
  };
}

/** 데이터가 정적이라 모듈 로드 때 한 번 계산한다. NEW 판정이 필요하면 buildNavMenus({ isNewTopic })를 쓴다 */
export const NAV_MENUS: Record<NavMenuKey, NavColumn[]> = buildNavMenus();
