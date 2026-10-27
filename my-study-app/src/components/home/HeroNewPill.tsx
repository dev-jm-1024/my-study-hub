import { ChevronRight } from 'lucide-react';
import { useTransitionNavigate } from '../../hooks/useTransitionNavigate';

interface HeroNewPillProps {
  /** 새로 열린 자료실. 없으면 알약을 그리지 않는다 */
  topic: { key: string; name: string } | null;
}

/** 히어로 맨 위 알약 — 가장 최근에 열린 자료실로 안내한다 */
export function HeroNewPill({ topic }: HeroNewPillProps) {
  const go = useTransitionNavigate();
  if (!topic) return null;

  const to = `/download/${topic.key}`;
  return (
    <a className="home-new-pill" href={to} onClick={e => go(e, to)}>
      <span className="home-new-tag">NEW</span>
      {/* 문구를 한 flex 항목으로 묶어 '자료실'과 '이 열렸어요' 사이에 gap이 끼지 않게 한다 */}
      <span>{topic.name} 자료실<span className="home-new-more">이 열렸어요</span></span>
      <ChevronRight className="home-new-chev" size={12} strokeWidth={2.6} aria-hidden="true" />
    </a>
  );
}
