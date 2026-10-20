/* Vibe 프로젝트 종류 — 상단 메뉴(navMenus.ts)와 /vibe 화면(?kind=)이 같은 규칙·같은 라벨을 쓴다.
   규칙 값은 constants/navigation.ts의 NAV_VIBE_RULE.macTech */

import { NAV_VIBE_RULE } from '../constants/navigation';
import type { VibeProject } from '../data/vibe';

/** 세그먼트·메뉴에 늘어놓는 순서 */
export const VIBE_KINDS = ['macos', 'web'] as const;
export type VibeKind = (typeof VIBE_KINDS)[number];

export const VIBE_KIND_LABEL: Record<VibeKind, string> = { macos: 'macOS 앱', web: '웹' };

const MAC_TECH: readonly string[] = NAV_VIBE_RULE.macTech;

/** techStack에 macTech 중 하나라도 있으면 macOS 앱, 아니면 웹 */
export function vibeKind(p: VibeProject): VibeKind {
  return p.techStack.some(t => MAC_TECH.includes(t)) ? 'macos' : 'web';
}

/** ?kind= 값 검사 — 모르는 값·없는 값은 false (호출한 쪽이 '전체'로 처리한다) */
export function isVibeKind(value: string | null): value is VibeKind {
  return VIBE_KINDS.some(kind => kind === value);
}
