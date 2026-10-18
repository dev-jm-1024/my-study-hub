import { ChevronRight } from 'lucide-react';
import { BADGE, DESC, tintClass } from '../data/topics';
import { docCount } from '../utils/category';
import { useTransitionNavigate } from '../hooks/useTransitionNavigate';
import type { MenuItem } from '../types';

/* 행의 배지·제목·문서 수가 자료실 헤더의 같은 조각으로 이어진다 (view-transition.css) */
const ROW_TO_HEAD = { '.cat-badge': 'dl-badge', '.cat-title': 'dl-title', '.cat-count': 'dl-count' };

interface CategoryRowProps {
  item: MenuItem;
}

export function CategoryRow({ item: m }: CategoryRowProps) {
  const go = useTransitionNavigate();

  return (
    <a
      className="cat-row home-anim"
      href={`/download/${m.key}`}
      onClick={e => go(e, `/download/${m.key}`, ROW_TO_HEAD)}
    >
      <div className={`cat-badge ${tintClass(m.key)}`}>{BADGE[m.key] ?? m.name.slice(0, 2)}</div>
      <div className="cat-main">
        <div className="cat-title">{m.name}</div>
        <div className="cat-desc">{DESC[m.key] ?? m.group}</div>
      </div>
      <span className="cat-count">{docCount(m.key)}</span>
      <span className="cat-chev"><ChevronRight size={18} /></span>
    </a>
  );
}
