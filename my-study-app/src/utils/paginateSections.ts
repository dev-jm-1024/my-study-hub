/* 자료실 문서 목록 — 소분류 세그먼트·페이지 자르기·제목 앞 번호 떼기 (계획서 §4.3).
   고른 범위('전체' 또는 소분류 하나)를 소분류 순서대로 한 줄로 편 뒤 size씩 자르고, 자른 조각을 다시 소분류별로 묶는다.
   소분류 순서 = 처음 나온 순서. section이 없거나 빈 문서는 이름 없는 묶음('')으로 모인다. */

import { DOWNLOAD_PAGE_SIZE } from '../constants/ui';
import type { PdfItem } from '../types';

/** 세그먼트 '전체'의 key. 이름 있는 소분류는 빈 문자열일 수 없으므로 겹치지 않는다 */
export const ALL_SECTIONS = '';

export interface SectionTab {
  /** 선택 값 — '전체'는 ALL_SECTIONS, 나머지는 소분류 이름 */
  key: string;
  label: string;
  count: number;
}

export interface DocEntry {
  pdf: PdfItem;
  /** 번호 칸에 넣을 글자 — 제목 앞 번호, 없으면 소분류 안 순번 */
  num: string;
  /** 번호를 뗀 제목 */
  title: string;
  /** 넘겨받은 items 배열에서의 위치 — 탭·페이지가 바뀌어도 그대로라 key로 쓴다 */
  index: number;
}

export interface DocGroup {
  /** 소분류 이름. ''이면 소분류 없음 → 제목 없이 목록만 */
  name: string;
  /** 소분류 전체 문서 수 (이 페이지에 보이는 수가 아님) */
  count: number;
  /** 앞 페이지에서 이어지는 묶음 → "· 앞 페이지에서 이어짐" */
  cont: boolean;
  docs: DocEntry[];
}

export interface SectionPage {
  groups: DocGroup[];
  /** 최소 1. 페이저는 pageCount > 1일 때만 */
  pageCount: number;
  /** 범위 밖 요청은 1..pageCount로 보정한 값 */
  page: number;
  /** 실제로 적용된 선택 — 탭이 없거나 없는 소분류를 고르면 ALL_SECTIONS */
  selected: string;
  /** "11–20 / 25개"용. 1부터, end 포함. 문서가 없으면 0–0 / 0 */
  range: { start: number; end: number; total: number };
}

interface Section {
  name: string;
  docs: { pdf: PdfItem; index: number }[];
}

const NUMBERED = /^(\d+(?:[.-]\d+)*)\.?\s+(.+)$/;

/** `1. 스프링부트 시작`→1, `1-1. …`→1-1, `1.1 웹 개발…`→1.1. 번호가 없으면(`MongoDB 필기 - 2.시작하기`·`$ cat …`) 순번 i+1 */
export function splitDocNumber(title: string, i: number): { num: string; title: string } {
  const m = NUMBERED.exec(title);
  return m ? { num: m[1], title: m[2] } : { num: String(i + 1), title };
}

function toSections(items: PdfItem[]): Section[] {
  const byName = new Map<string, Section>();
  items.forEach((pdf, index) => {
    const name = pdf.section?.trim() ?? '';
    let s = byName.get(name);
    if (!s) byName.set(name, (s = { name, docs: [] }));
    s.docs.push({ pdf, index });
  });
  return [...byName.values()];
}

/** 세그먼트 버튼 — 이름 있는 소분류가 2개 이상일 때만 ['전체', ...소분류]. 빈 배열이면 세그먼트를 숨긴다 */
export function sectionTabs(items: PdfItem[]): SectionTab[] {
  const named = toSections(items).filter(s => s.name);
  if (named.length < 2) return [];
  return [
    { key: ALL_SECTIONS, label: '전체', count: items.length },
    ...named.map(s => ({ key: s.name, label: s.name, count: s.docs.length })),
  ];
}

export function paginateSections(
  items: PdfItem[],
  selected: string,
  page: number,
  size: number = DOWNLOAD_PAGE_SIZE,
): SectionPage {
  const sections = toSections(items);
  const hasTabs = sections.filter(s => s.name).length > 1;
  const sel = hasTabs && sections.some(s => s.name && s.name === selected) ? selected : ALL_SECTIONS;

  const pool = sections
    .filter(s => sel === ALL_SECTIONS || s.name === sel)
    .flatMap(s => s.docs.map((d, i) => ({ ...d, i, section: s })));

  const per = Math.max(1, Math.floor(size) || 1);
  const pageCount = Math.max(1, Math.ceil(pool.length / per));
  const cur = Math.min(Math.max(1, Math.floor(page) || 1), pageCount);
  const startIdx = (cur - 1) * per;
  const slice = pool.slice(startIdx, startIdx + per);

  const groups: DocGroup[] = [];
  for (const { pdf, index, i, section } of slice) {
    let g = groups[groups.length - 1];
    if (!g || g.name !== section.name) {
      g = { name: section.name, count: section.docs.length, cont: i > 0, docs: [] };
      groups.push(g);
    }
    g.docs.push({ pdf, index, ...splitDocNumber(pdf.title, i) });
  }

  return {
    groups,
    pageCount,
    page: cur,
    selected: sel,
    range: {
      start: slice.length ? startIdx + 1 : 0,
      end: startIdx + slice.length,
      total: pool.length,
    },
  };
}
