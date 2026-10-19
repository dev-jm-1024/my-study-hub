import { ChevronRight } from 'lucide-react';
import { DESC } from '../data/topics';
import { docCount } from '../utils/category';
import { isNewTopic, isPreparingTopic } from '../utils/home';
import { useTransitionNavigate } from '../hooks/useTransitionNavigate';
import type { MenuItem } from '../types';

/* 행의 제목·문서 수가 자료실 헤더의 같은 조각으로 이어진다 (view-transition.css) */
const ROW_TO_HEAD = { '.cat-title': 'dl-title', '.cat-count': 'dl-count' };

interface CategoryRowProps {
  item: MenuItem;
}

/** 주제 리스트 행 — TopicGroup 카드 안에서 인셋 구분선으로 이어진다. hover 바탕은 행이 아니라 카드의 하이라이트(.topic-glide)가 맡는다 */
export function CategoryRow({ item: m }: CategoryRowProps) {
  const go = useTransitionNavigate();
  const preparing = isPreparingTopic(m.key);

  return (
    <a
      className="cat-row"
      href={`/download/${m.key}`}
      onClick={e => go(e, `/download/${m.key}`, ROW_TO_HEAD)}
    >
      <span className="cat-body">
        <span className="cat-main">
          <span className="cat-title">{m.name}</span>
          <span className="cat-desc">{DESC[m.key] ?? m.group}</span>
        </span>
        {isNewTopic(m.key) && <span className="cat-pill cat-pill--new">NEW</span>}
        {preparing
          ? <span className="cat-pill cat-pill--soon">준비 중</span>
          : <span className="cat-count">{docCount(m.key)}</span>}
        <ChevronRight className="cat-chev" size={14} strokeWidth={2.6} aria-hidden="true" />
      </span>
    </a>
  );
}
