import { useRef } from 'react';
import { MENUS } from '../../data/menuData';
import { GROUP_ORDER } from '../../data/topics';
import { CategoryRow } from '../CategoryRow';
import type { MenuItem } from '../../types';

/* 그룹 노출 순서 = GROUP_ORDER, 주제가 없는 그룹은 뺀다 (MENUS는 정적 데이터) */
const GROUPS = GROUP_ORDER
  .map(group => ({ group, items: MENUS.filter(m => m.group === group) }))
  .filter(g => g.items.length > 0);

/**
 * 카드 안에서 마우스가 가리키는 행으로 하이라이트(.topic-glide)가 미끄러진다.
 * 위치·높이만 CSS 변수로 넘기고 움직임은 CSS 전환이 맡는다. 마우스에서만 — 터치·펜은 건드리지 않는다.
 * 카드에 처음 들어올 때(하이라이트가 안 보일 때)는 이동 없이 그 행 자리에서 나타난다.
 */
function useRowGlide() {
  const cardRef = useRef<HTMLDivElement>(null);
  const glideRef = useRef<HTMLSpanElement>(null);
  const rowRef = useRef<HTMLElement | null>(null);

  const hide = () => {
    rowRef.current = null;
    glideRef.current?.removeAttribute('data-on');
  };

  const onPointerOver = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    const card = cardRef.current;
    const glide = glideRef.current;
    if (!card || !glide) return;

    // 행이 아닌 곳(늘어난 카드의 빈 면)이면 하이라이트를 거둔다
    const row = (e.target as Element).closest<HTMLElement>('.cat-row');
    if (!row || !card.contains(row)) return hide();
    if (row === rowRef.current) return;
    rowRef.current = row;

    const cardTop = card.getBoundingClientRect().top;
    const box = row.getBoundingClientRect();
    // 아직 보이는 중이면(페이드 아웃 도중 포함) 이어서 미끄러지고, 안 보이면 이동 전환을 건너뛰고 그 자리에서 나타난다
    const snap = !glide.hasAttribute('data-on') && parseFloat(getComputedStyle(glide).opacity) < 0.05;
    if (snap) glide.setAttribute('data-snap', '');
    glide.style.setProperty('--glide-y', `${box.top - cardTop}px`);
    glide.style.setProperty('--glide-h', `${box.height}px`);
    if (snap) {
      void glide.offsetHeight; // 새 위치를 전환 없이 확정한 뒤에 전환을 되살린다
      glide.removeAttribute('data-snap');
    }
    glide.setAttribute('data-on', '');
  };

  return { cardRef, glideRef, onPointerOver, hide };
}

interface TopicGroupProps {
  /** 그룹 제목 — 없으면 제목(h3) 없이 카드만 그린다 (검색 결과가 이렇게 쓴다) */
  title?: string;
  items: MenuItem[];
}

/** 주제 행을 묶은 인셋 그룹 카드 하나 */
export function TopicGroup({ title, items }: TopicGroupProps) {
  const glide = useRowGlide();

  return (
    <div className="topic-group">
      {title && <h3 className="topic-group-title">{title}</h3>}
      <div
        className="topic-card home-anim"
        ref={glide.cardRef}
        onPointerOver={glide.onPointerOver}
        onPointerLeave={glide.hide}
      >
        {/* hover 하이라이트 — 행 아래 층, 장식이라 읽히지 않는다 */}
        <span className="topic-glide" ref={glide.glideRef} aria-hidden="true" />
        {items.map(m => <CategoryRow key={m.key} item={m} />)}
      </div>
    </div>
  );
}

/** 홈 하단 '주제별로 찾아보기.' — 같은 줄의 그룹 카드는 시작·끝선이 같다 */
export function TopicGroups() {
  return (
    <section className="home-block" aria-labelledby="topics-h">
      <div className="home-block-head">
        <h2 className="home-block-title" id="topics-h">주제별로 찾아보기.</h2>
      </div>

      <div className="topic-grid">
        {GROUPS.map(g => <TopicGroup key={g.group} title={g.group} items={g.items} />)}
      </div>
    </section>
  );
}
