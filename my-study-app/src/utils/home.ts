/* 홈 화면 선택자 — 대표 타일·문서 비중·최근 문서·NEW 판정.
   규칙 값은 constants/ui.ts, 재료는 data/*. 주제 순서의 기준은 MENUS이고 MENU_DATA는 키로만 찾는다
   (MENU_DATA 키 순서가 바뀌어도 결과는 같다). 날짜를 보는 함수는 today를 마지막 인자로 받는다. */

import {
  DOC_SHARE_TOP_N,
  FEATURED_TOPIC_COUNT,
  HOME_MORE_PREVIEW_COUNT,
  LATEST_SHELF,
  NEW_BADGE_DAYS,
} from '../constants/ui';
import { BOOKS } from '../data/books';
import { MENUS, MENU_DATA } from '../data/menuData';
import { STACK } from '../data/stacks';
import type { BookItem, PdfItem } from '../types';
import { resolveCategoryKey } from './category';

export interface TopicRef {
  key: string;
  name: string;
}

export interface TopTopic extends TopicRef {
  group: string;
  count: number;
  /** 소분류별 문서 수 — 처음 나온 순서. 소분류 없는 문서는 제외, 없으면 [] */
  sections: { name: string; count: number }[];
}

export interface DocShareData {
  total: number;
  parts: { key: string; name: string; count: number; color: string | undefined }[];
  /** parts에 못 든 나머지 주제의 수와 문서 합 */
  rest: { topics: number; count: number };
}

export interface LatestDoc {
  topicKey: string;
  topicName: string;
  section?: string;
  title: string;
  desc: string;
  pdfUrl: string;
  addedAt: string;
  /** 이 주제의 자료실이 열린 날(가장 이른 addedAt)의 첫 문서 — 카드에 '새 자료실'을 붙인다 */
  opensTopic: boolean;
}

// ── 데이터 접근 ────────────────────────────────────────────────

/** MENUS key로 문서 목록을 찾는다. 키 대소문자가 달라도 찾는다 */
const docsOf = (key: string): PdfItem[] => MENU_DATA[key] ?? MENU_DATA[resolveCategoryKey(key)] ?? [];

/** 문서 수 내림차순, 동률은 MENUS 순서 (Array.prototype.sort는 안정 정렬) */
const rankedTopics = () =>
  MENUS.map(m => ({ menu: m, docs: docsOf(m.key) })).sort((a, b) => b.docs.length - a.docs.length);

// ── 날짜 ───────────────────────────────────────────────────────
/* 'YYYY-MM-DD'는 Date로 파싱하지 않고 달력 날짜 번호로 바꿔 비교한다.
   문자열 파싱은 UTC 자정이라 시간대에 따라 하루 밀리고, 시각 차 계산은 서머타임에 흔들린다.
   '오늘'만 브라우저 로컬 연·월·일을 쓴다 (사용자가 보는 달력 날짜 기준). */

const DAY_MS = 86_400_000;

function parseYmd(value: string | undefined): { y: number; m: number; d: number } | null {
  const hit = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? '');
  if (!hit) return null;
  const [y, m, d] = [Number(hit[1]), Number(hit[2]), Number(hit[3])];
  const check = new Date(Date.UTC(y, m - 1, d));
  // 2026-02-30 같은 없는 날짜는 거른다
  const valid = check.getUTCFullYear() === y && check.getUTCMonth() === m - 1 && check.getUTCDate() === d;
  return valid ? { y, m, d } : null;
}

/** 1970-01-01을 0으로 하는 날짜 번호. 형식이 틀리면 null */
function dayNumber(value: string | undefined): number | null {
  const ymd = parseYmd(value);
  return ymd ? Date.UTC(ymd.y, ymd.m - 1, ymd.d) / DAY_MS : null;
}

const todayNumber = (today: Date) => Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) / DAY_MS;

/**
 * 그 날짜가 NEW 기간 안인지.
 * 경계: 오늘 − 등록일(일)이 NEW_BADGE_DAYS 이하면 NEW — 21일째 당일까지 포함한다('21일 이내').
 * 예) 10월 11일 등록 → 11월 1일까지 NEW, 11월 2일부터 아님. 오늘보다 미래인 날짜는 아직 NEW가 아니다(날짜 오타 방지).
 */
export function isRecentDate(addedAt: string, today: Date = new Date()): boolean {
  const day = dayNumber(addedAt);
  if (day === null) return false;
  const age = todayNumber(today) - day;
  return age >= 0 && age <= NEW_BADGE_DAYS;
}

/** '10월 11일'. 올해가 아니면 '2025년 11월 13일'. 형식이 틀리면 받은 값 그대로 */
export function formatAddedAt(addedAt: string, today: Date = new Date()): string {
  const ymd = parseYmd(addedAt);
  if (!ymd) return addedAt;
  const md = `${ymd.m}월 ${ymd.d}일`;
  return ymd.y === today.getFullYear() ? md : `${ymd.y}년 ${md}`;
}

/** 주제가 열린 날 — 문서 중 가장 이른 addedAt과, 그 날짜의 첫 문서(데이터 순서) 위치. 날짜 있는 문서가 없으면 null */
function openingOf(docs: PdfItem[]): { date: string; day: number; index: number } | null {
  let opening: { date: string; day: number; index: number } | null = null;
  for (let index = 0; index < docs.length; index++) {
    const date = docs[index].addedAt;
    const day = dayNumber(date);
    // 엄격한 '<' — 같은 날이면 먼저 나온 문서를 유지한다
    if (date && day !== null && (!opening || day < opening.day)) opening = { date, day, index };
  }
  return opening;
}

// ── 선택자 ─────────────────────────────────────────────────────

/** 문서 수 상위 n개 주제. 동률은 MENUS 순서 */
export function topTopics(n: number = FEATURED_TOPIC_COUNT): TopTopic[] {
  return rankedTopics().slice(0, n).map(({ menu, docs }) => {
    const counts = new Map<string, number>();
    docs.forEach(d => {
      if (d.section) counts.set(d.section, (counts.get(d.section) ?? 0) + 1);
    });
    return {
      key: menu.key,
      name: menu.name,
      group: menu.group,
      count: docs.length,
      sections: [...counts].map(([name, count]) => ({ name, count })),
    };
  });
}

/** 문서 수 상위 topN 주제의 비중 + 나머지. 문서 0개 주제는 뺀다. 동률은 MENUS 순서 */
export function docShare(topN: number = DOC_SHARE_TOP_N): DocShareData {
  const ranked = rankedTopics().filter(t => t.docs.length > 0);
  const rest = ranked.slice(topN);
  return {
    total: ranked.reduce((sum, t) => sum + t.docs.length, 0),
    parts: ranked.slice(0, topN).map(({ menu, docs }) => ({
      key: menu.key,
      name: menu.name,
      count: docs.length,
      color: STACK[menu.key]?.color,
    })),
    rest: { topics: rest.length, count: rest.reduce((sum, t) => sum + t.docs.length, 0) },
  };
}

/**
 * 최근 올라온 문서 n건. addedAt이 있고 pdfUrl이 비지 않은 문서만.
 * addedAt 내림차순. 같은 날짜 안에서는 주제별로 한 건씩 돌아가며(라운드 로빈) 고른다 —
 * 주제 순서는 MENUS, 주제 안은 데이터 순서. 한 주제가 같은 날 여러 건이어도 셸프를 독점하지 않는다.
 */
export function latestDocs(n: number = LATEST_SHELF.count): LatestDoc[] {
  const dated = MENUS.flatMap(menu => {
    const docs = docsOf(menu.key);
    const opening = openingOf(docs);
    const seenPerDay = new Map<number, number>();
    return docs.flatMap((doc, index) => {
      const day = dayNumber(doc.addedAt);
      if (day === null || !doc.addedAt || !doc.pdfUrl) return [];
      // 이 주제에서 같은 날짜의 몇 번째 문서인지 (0부터)
      const round = seenPerDay.get(day) ?? 0;
      seenPerDay.set(day, round + 1);
      const item: LatestDoc = {
        topicKey: menu.key,
        topicName: menu.name,
        section: doc.section,
        title: doc.title,
        desc: doc.description,
        pdfUrl: doc.pdfUrl,
        addedAt: doc.addedAt,
        opensTopic: opening?.index === index,
      };
      return [{ day, round, item }];
    });
  });
  // 날짜 내림차순 → 라운드 오름차순. 그래도 같으면 위 생성 순서(MENUS → 주제 안 문서 순)를 안정 정렬이 지킨다
  return dated.sort((a, b) => b.day - a.day || a.round - b.round).slice(0, n).map(({ item }) => item);
}

/** 주제가 열린 날(가장 이른 addedAt)이 NEW 기간 안인지. addedAt 없는 주제는 false */
export function isNewTopic(key: string, today: Date = new Date()): boolean {
  const opening = openingOf(docsOf(key));
  return opening !== null && isRecentDate(opening.date, today);
}

/** 문서가 없거나 모든 문서의 pdfUrl이 비어 있는 주제 — '준비 중' 알약용 */
export function isPreparingTopic(key: string): boolean {
  // 문서가 0개면 every가 true — 없는 키도 '준비 중'
  return docsOf(key).every(doc => !doc.pdfUrl);
}

/**
 * 그 달에 문서가 올라온 '일' 목록 — 달력 점 표시용. 오름차순·중복 제거.
 * month는 1~12 (addedAt의 YYYY-MM-DD와 같은 기준 — Date#getMonth()가 아니라 getMonth() + 1).
 * 형식이 틀렸거나 빈 addedAt은 무시하고, 오늘보다 미래 날짜는 뺀다(날짜 오타 방지).
 * 예) const t = new Date(); uploadDaysInMonth(t.getFullYear(), t.getMonth() + 1, t)
 */
export function uploadDaysInMonth(year: number, month: number, today: Date = new Date()): number[] {
  const now = todayNumber(today);
  const days = new Set<number>();
  for (const menu of MENUS) {
    for (const doc of docsOf(menu.key)) {
      const ymd = parseYmd(doc.addedAt);
      if (!ymd || ymd.y !== year || ymd.m !== month) continue;
      if (Date.UTC(ymd.y, ymd.m - 1, ymd.d) / DAY_MS > now) continue;
      days.add(ymd.d);
    }
  }
  return [...days].sort((a, b) => a - b);
}

/** 최근 추가한 책 n권, 최신순 — books.ts 배열 끝이 최근 추가. Books 메뉴 표지(navMenus)와 같은 결과 */
export function recentBooks(n: number = HOME_MORE_PREVIEW_COUNT): BookItem[] {
  // slice(-0)은 전체 배열이라 0 이하는 따로 거른다
  return n > 0 ? BOOKS.slice(-n).reverse() : [];
}

/** NEW 주제 중 가장 최근에 열린 것(동률은 MENUS 순서). 없으면 null — 히어로 NEW 알약용 */
export function newestTopic(today: Date = new Date()): TopicRef | null {
  let best: (TopicRef & { day: number }) | null = null;
  for (const menu of MENUS) {
    const opening = openingOf(docsOf(menu.key));
    if (!opening || !isRecentDate(opening.date, today)) continue;
    // 엄격한 '>' — 같은 날이면 MENUS에서 앞선 주제를 유지한다
    if (!best || opening.day > best.day) best = { key: menu.key, name: menu.name, day: opening.day };
  }
  return best && { key: best.key, name: best.name };
}
