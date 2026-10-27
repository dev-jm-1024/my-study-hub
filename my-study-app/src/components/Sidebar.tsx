import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { Link } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { MENUS } from '../data/menuData';
import { badgeLabel, topicStyle, GROUP_ORDER } from '../data/topics';
import { docCount, matchesKey } from '../utils/category';
import { isPreparingTopic } from '../utils/home';
import { searchTopics } from '../utils/topicSearch';
import { BREAKPOINT } from '../constants';
import { useDrawer } from '../hooks/useDrawer';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useTransitionNavigate } from '../hooks/useTransitionNavigate';

/* 이 폭 이하에서는 사이드바가 왼쪽에서 밀려 나오는 서랍이 된다 (download-page.css의 @media와 같은 경계) */
const DRAWER_MEDIA = `(max-width: ${BREAKPOINT.tablet}px)`;

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
  /** 패널 id — 자료실의 '주제 전환' 버튼이 aria-controls로 가리킨다 */
  id?: string;
  currentCategory?: string;
  /** 서랍이 닫힐 때 포커스를 돌려줄 곳 — 열기 버튼. Safari는 버튼을 눌러도 포커스가 가지 않아 열기 직전 요소만으로는 body가 된다 */
  returnFocusRef?: RefObject<HTMLElement | null>;
  /** 서랍(≤1068px)일 때의 열림 상태. 데스크톱에서는 쓰이지 않는다 */
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ id, currentCategory, returnFocusRef, isOpen = false, onClose }: SidebarProps) {
  const go = useTransitionNavigate();
  const [q, setQ] = useState('');
  const fallbackId = useId();
  const panelId = id ?? fallbackId;
  const titleId = `${panelId}-title`;
  const panelRef = useRef<HTMLDivElement>(null);

  // 서랍 모드에서는 role=dialog를 쓸 수 있는 div로, 데스크톱에서는 complementary 영역(aside)으로 그린다
  const drawerMode = useMediaQuery(DRAWER_MEDIA);
  const Panel = drawerMode ? 'div' : 'aside';
  const open = drawerMode && isOpen;

  // 검색에 걸린 주제만 — 걸린 행이 없는 그룹은 통째로 숨긴다
  const groups = GROUPS
    .map(g => ({ ...g, items: searchTopics(g.items, q) }))
    .filter(g => g.items.length > 0);
  const isCurrent = (key: string) => !!currentCategory && matchesKey(key, currentCategory);

  // 서랍이 열리면 포커스를 받을 곳: 현재 과목 행, 검색에 가려져 행이 없으면 ✕ 버튼. 둘 중 하나만 이 ref를 갖는다
  const initialFocusRef = useRef<HTMLElement | null>(null);
  const claimInitialFocus = useCallback((el: HTMLElement | null) => { initialFocusRef.current = el; }, []);
  const hasCurrentRow = groups.some(g => g.items.some(m => isCurrent(m.key)));

  // open이 아니라 isOpen을 넘긴다 — drawerMode로 거르면 넓어지는 순간 훅이 먼저 걷혀 media의 onClose가 불리지 않고,
  // 부모의 열림 상태가 남아 다시 좁아질 때 서랍이 저절로 열린다
  useDrawer({
    open: isOpen,
    onClose: () => onClose?.(),
    panelRef,
    initialFocusRef,
    returnFocusRef,
    media: DRAWER_MEDIA,   // 이 폭을 넘어 넓어지면 닫힌다
  });

  // 넘칠 때만 위·아래 가장자리를 흐리게 — 위로 가려진 내용이 있으면 top, 아래로 더 있으면 bottom.
  // 띠는 CSS(download-page.css의 .sidebar-fade)이고, 여기서는 data-fade-top/bottom 속성만 갱신한다 (SegmentBar와 같은 방식)
  const [fade, setFade] = useState({ top: false, bottom: false });
  const measure = useCallback(() => {
    const el = panelRef.current;
    if (!el) return;
    // 소수 픽셀 오차로 끝에서도 띠가 남지 않게 1px 여유를 둔다
    const top = el.scrollTop > 1;
    const bottom = el.scrollTop < el.scrollHeight - el.clientHeight - 1;
    setFade(f => (f.top === top && f.bottom === bottom ? f : { top, bottom }));
  }, []);

  // 처음 그릴 때와 검색어·서랍 모드로 목록 길이가 달라질 때 — 띠가 한 프레임 어긋나 보이지 않게 레이아웃 직후에 잰다
  useLayoutEffect(measure);

  // 창 크기·서랍 높이가 달라지면 다시 잰다. 서랍 모드가 바뀌면 패널 요소가 새로 만들어지므로 그때마다 다시 건다
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure, drawerMode]);

  // 선택된 행이 패널의 보이는 영역 밖이면 패널 안에서만 스크롤한다 (scrollIntoView는 창까지 움직일 수 있다).
  // 서랍이 열릴 때도 한 번 더 — 닫혀 있는 동안 바뀐 검색·크기에 맞춘다
  useEffect(() => {
    const panel = panelRef.current;
    const row = panel?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!panel || !row) return;
    const p = panel.getBoundingClientRect();
    const r = row.getBoundingClientRect();
    // 모서리에 붙지 않게 안쪽 여백까지, 가장자리 띠에 걸리지 않게 scroll-padding(띠 높이)까지 남긴다 — 둘 중 큰 쪽
    const pad = getComputedStyle(panel);
    const top = p.top + Math.max(parseFloat(pad.paddingTop), parseFloat(pad.scrollPaddingTop) || 0);
    const bottom = p.bottom - Math.max(parseFloat(pad.paddingBottom), parseFloat(pad.scrollPaddingBottom) || 0);
    if (r.top < top) panel.scrollTop -= top - r.top;
    else if (r.bottom > bottom) panel.scrollTop += r.bottom - bottom;
  }, [currentCategory, drawerMode, open]);

  const GroupTitle = drawerMode ? 'h3' : 'h2';   // 서랍에는 머리의 h2 '주제'가 있다

  return (
    <>
      {/* 서랍 뒤 덮개 — 닫혀도 DOM에 남겨 페이드 아웃한다. 키보드·스크린 리더는 ✕·Esc를 쓴다.
          mousedown을 막아 두면 덮개를 눌러도 포커스가 body로 새지 않는다 (useDrawer가 닫을 때 토글로 돌려준다) */}
      <div
        className="sidebar-backdrop"
        data-open={open || undefined}
        onMouseDown={e => e.preventDefault()}
        onClick={onClose}
        aria-hidden="true"
      />
      <Panel
        ref={panelRef}
        id={panelId}
        className="sidebar"
        data-open={open || undefined}
        data-fade-top={fade.top || undefined}
        data-fade-bottom={fade.bottom || undefined}
        onScroll={measure}
        role={drawerMode ? 'dialog' : undefined}
        aria-modal={drawerMode || undefined}
        aria-label={drawerMode ? undefined : '주제 목록'}
        aria-labelledby={drawerMode ? titleId : undefined}
        inert={drawerMode && !open}   // 닫힌 서랍의 링크에 Tab이 들어가지 않게
      >
        <div className="sidebar-fade sidebar-fade--top" aria-hidden="true" />

        {drawerMode && (
          <div className="sidebar-head">
            <h2 className="sidebar-title" id={titleId}>주제</h2>
            <button
              ref={hasCurrentRow ? undefined : claimInitialFocus}
              type="button"
              className="sidebar-close"
              aria-label="주제 목록 닫기"
              onClick={onClose}
            >
              <X size={16} strokeWidth={2.6} aria-hidden="true" />
            </button>
          </div>
        )}

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

        {groups.map(({ group, id: groupId, items }) => (
          <section key={group} className="sidebar-group" aria-labelledby={groupId}>
            <GroupTitle className="sidebar-group-title" id={groupId}>{group}</GroupTitle>
            <ul className="sidebar-list">
              {items.map(menu => {
                const active = isCurrent(menu.key);
                return (
                  <li key={menu.key}>
                    <Link
                      ref={active ? claimInitialFocus : undefined}
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

        <div className="sidebar-fade sidebar-fade--bottom" aria-hidden="true" />
      </Panel>
    </>
  );
}
