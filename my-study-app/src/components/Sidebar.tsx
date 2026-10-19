import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { MENUS } from '../data/menuData';
import { badgeLabel, topicStyle, GROUP_ORDER } from '../data/topics';
import { docCount, matchesKey } from '../utils/category';
import { isPreparingTopic } from '../utils/home';
import { searchTopics } from '../utils/topicSearch';
import { useTransitionNavigate } from '../hooks/useTransitionNavigate';

/* 이미지 한 변 — download-page.css의 --avatar와 같은 값 (불러오기 전에 자리를 잡는다) */
const AVATAR_SIZE = 40;

/* GROUP_ORDER 순서로 묶기 (+ 목록에 없는 그룹은 뒤에 붙임). MENUS는 정적 데이터라 한 번만 계산한다 */
const known = new Set(GROUP_ORDER);
const extraGroups = [...new Set(MENUS.filter(m => !known.has(m.group)).map(m => m.group))];
const GROUPS = [...GROUP_ORDER, ...extraGroups]
  .map((group, i) => ({ group, id: `sidebar-group-${i}`, items: MENUS.filter(m => m.group === group) }))
  .filter(g => g.items.length > 0);

const TOTAL_TOPICS = MENUS.length;
const TOTAL_DOCS = MENUS.reduce((sum, m) => sum + docCount(m.key), 0);

interface SidebarProps {
  currentCategory?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ currentCategory, isOpen = false, onClose }: SidebarProps) {
  const go = useTransitionNavigate();
  const [q, setQ] = useState('');
  const panelRef = useRef<HTMLElement>(null);

  // 검색에 걸린 주제만 — 걸린 행이 없는 그룹은 통째로 숨긴다
  const groups = GROUPS
    .map(g => ({ ...g, items: searchTopics(g.items, q) }))
    .filter(g => g.items.length > 0);

  // 선택된 행이 패널의 보이는 영역 밖이면 패널 안에서만 스크롤한다 (scrollIntoView는 창까지 움직일 수 있다)
  useEffect(() => {
    const panel = panelRef.current;
    const row = panel?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!panel || !row) return;
    const p = panel.getBoundingClientRect();
    const r = row.getBoundingClientRect();
    // 패널 안쪽 여백까지 남겨서 모서리에 붙지 않게
    const pad = getComputedStyle(panel);
    const top = p.top + parseFloat(pad.paddingTop);
    const bottom = p.bottom - parseFloat(pad.paddingBottom);
    if (r.top < top) panel.scrollTop -= top - r.top;
    else if (r.bottom > bottom) panel.scrollTop += r.bottom - bottom;
  }, [currentCategory]);

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} aria-hidden="true" />}
      <aside
        ref={panelRef}
        className={`sidebar${isOpen ? ' sidebar--open' : ''}`}
        aria-label="주제 목록"
      >
        <div className="sidebar-profile">
          <img
            className="sidebar-avatar"
            src="/profile.svg"
            alt=""
            width={AVATAR_SIZE}
            height={AVATAR_SIZE}
          />
          <div className="sidebar-profile-text">
            <p className="sidebar-profile-name">이재민의 자료실</p>
            <p className="sidebar-profile-meta">{TOTAL_TOPICS}개 주제 · {TOTAL_DOCS}개 문서</p>
          </div>
        </div>

        <label className="sidebar-search">
          <Search size={16} strokeWidth={2.2} aria-hidden="true" />
          <input
            type="search"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="주제 검색"
            aria-label="주제 검색"
            autoComplete="off"
          />
        </label>

        {groups.map(({ group, id, items }) => (
          <section key={group} className="sidebar-group" aria-labelledby={id}>
            <h2 className="sidebar-group-title" id={id}>{group}</h2>
            <ul className="sidebar-list">
              {items.map(menu => {
                const active = !!currentCategory && matchesKey(menu.key, currentCategory);
                return (
                  <li key={menu.key}>
                    <Link
                      to={`/download/${menu.key}`}
                      className="sidebar-row"
                      aria-current={active ? 'page' : undefined}
                      onClick={e => { onClose?.(); go(e, `/download/${menu.key}`); }}
                    >
                      <span className="sidebar-badge" style={topicStyle(menu.key)} aria-hidden="true">
                        {badgeLabel(menu.key, menu.name)}
                      </span>
                      <span className="sidebar-name">{menu.name}</span>
                      <span className="sidebar-count">
                        {isPreparingTopic(menu.key) ? '준비 중' : docCount(menu.key)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        {groups.length === 0 && <p className="sidebar-empty" role="status">일치하는 주제가 없어요.</p>}
      </aside>
    </>
  );
}
