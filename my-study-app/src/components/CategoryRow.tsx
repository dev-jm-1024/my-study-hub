import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { BADGE, DESC, tintClass } from '../data/topics';
import { docCount } from '../utils/category';
import type { MenuItem } from '../types';

interface CategoryRowProps {
  item: MenuItem;
}

export function CategoryRow({ item: m }: CategoryRowProps) {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/download/${m.key}`);
  };

  return (
    <a
      className="cat-row home-anim"
      href={`/download/${m.key}`}
      onClick={handleClick}
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
