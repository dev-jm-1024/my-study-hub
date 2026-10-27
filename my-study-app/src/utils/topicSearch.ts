/* 주제 검색 규칙 — 홈 검색창과 자료실 사이드바가 같이 쓴다.
   이름·한 줄 설명(DESC)·그룹·한글 별칭(ALIASES) 중 하나라도 검색어를 포함하면 걸린다. 대소문자는 가리지 않는다. */

import { ALIASES, DESC } from '../data/topics';
import type { MenuItem } from '../types';

type SearchableTopic = Pick<MenuItem, 'key' | 'name' | 'group'>;

/** 검색어 정리 — 앞뒤 공백을 떼고 소문자로. 빈 문자열이면 '검색 중이 아님' */
export const normalizeQuery = (q: string): string => q.trim().toLowerCase();

/** 주제 하나가 검색어에 걸리는지. query는 normalizeQuery를 거친 값 — 빈 문자열은 모두 걸린다 */
export function matchesTopicQuery(topic: SearchableTopic, query: string): boolean {
  return (
    topic.name.toLowerCase().includes(query) ||
    (DESC[topic.key] ?? '').toLowerCase().includes(query) ||
    topic.group.toLowerCase().includes(query) ||
    (ALIASES[topic.key] ?? []).some(alias => alias.toLowerCase().includes(query))
  );
}

/** 검색어에 걸리는 주제만, 받은 순서 그대로. 빈 검색어면 전부 돌려준다 (이미 정리한 검색어를 넘겨도 결과가 같다) */
export function searchTopics<T extends SearchableTopic>(topics: readonly T[], q: string): T[] {
  const query = normalizeQuery(q);
  return topics.filter(topic => matchesTopicQuery(topic, query));
}
