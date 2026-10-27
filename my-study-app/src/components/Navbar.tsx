import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, Moon, Sun, Search } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { NavPanel } from './NavPanel';
import { openCommandPalette } from './CommandPalette';
import { NewTabHint } from './NewTabHint';
import { useNavMenu } from '../hooks/useNavMenu';
import { useDrawer } from '../hooks/useDrawer';
import { BREAKPOINT, LINKS, NAV_ITEMS, SOCIAL_LINKS } from '../constants';
import type { NavItem } from '../constants';
import { SEARCH_SHORTCUT } from '../utils/platform';

/* 상단 바에는 Velog·Blog만 (GitHub는 내부 페이지 링크가 따로 있다) */
const NAV_LINKS = SOCIAL_LINKS
  .filter(link => link.href !== LINKS.github)
  .map(({ shortLabel, href }) => ({ label: shortLabel, href }));

/* 모바일 */
const MOBILE_QUERY = `(max-width: ${BREAKPOINT.mobile}px)`;
const MOBILE_ICON_SIZE = 18;

/** 지금 위치가 이 메뉴인가 — 자료실은 홈('/')과 주제 페이지('/download/…') 둘 다 */
const isCurrent = (item: NavItem, pathname: string) =>
  item.key === 'archive'
    ? pathname === '/' || pathname.startsWith('/download/')
    : pathname === item.to || pathname.startsWith(`${item.to}/`);

/** 항목 등장 시차용 순번 (CSS가 --i × 시간으로 지연을 만든다) */
const stagger = (index: number) => ({ '--i': index }) as CSSProperties;

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = useNavMenu();
  const { key: locationKey, pathname } = useLocation();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  // 스크롤 잠금·Esc·Tab 가두기·포커스 복귀는 훅이 한다. 범위는 <header> 전체 —
  // 바의 로고·검색·테마·닫기 버튼부터 메뉴 링크까지 Tab이 돈다. 735px 이상으로 넓어지면 닫힌다
  useDrawer({
    open: mobileOpen,
    onClose: closeMobile,
    panelRef: nav.headerProps.ref,
    initialFocusRef: toggleRef,
    returnFocusRef: toggleRef,
    media: MOBILE_QUERY,
  });

  // 링크 밖에서 라우트가 바뀌어도(뒤로 가기 등) 닫는다
  useEffect(() => {
    closeMobile();
  }, [locationKey, closeMobile]);

  // 다시 열 때 지난번 스크롤 위치가 남지 않게 (닫혀 있을 땐 보이지 않으니 열 때 맞춘다)
  useEffect(() => {
    if (mobileOpen) menuRef.current?.scrollTo(0, 0);
  }, [mobileOpen]);

  const themeLabel = theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환';
  const ThemeIcon = theme === 'dark' ? Sun : Moon;

  return (
    <>
      <header
        className={`header${nav.open ? ' is-open' : ''}${mobileOpen ? ' is-mobile-open' : ''}`}
        {...nav.headerProps}
      >
        <div className="nav-bar">
          <div className="nav-bar-inner">
            {/* 로고 */}
            <Link to="/" className="nav-logo" {...nav.closerProps} onClick={closeMobile}>
              <img src="/logo.png" alt="" className="nav-logo-img" />
              <span className="nav-logo-text">JM Hub</span>
            </Link>

            {/* 데스크탑 메뉴 — 메뉴 버튼은 드롭다운을 열고, Velog·Blog는 새 창 */}
            <nav className="nav-menus" aria-label="주요 메뉴">
              {NAV_ITEMS.map(item => (
                <button key={item.key} className="nav-menu-btn" {...nav.getTriggerProps(item.key)}>
                  <span className="nav-menu-label" data-label={item.label}>{item.label}</span>
                </button>
              ))}
              {NAV_LINKS.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-menu-link"
                  {...nav.closerProps}
                  onClick={() => nav.close()}
                >
                  {link.label}
                  <ArrowUpRight size={10} strokeWidth={2.4} aria-hidden="true" />
                  <NewTabHint />
                </a>
              ))}
            </nav>

            <div className="nav-actions">
              <button
                type="button"
                className="nav-icon-btn"
                aria-label={`검색 (${SEARCH_SHORTCUT})`}
                {...nav.closerProps}
                onClick={e => openCommandPalette(e.currentTarget)}
              >
                <Search size={17} />
              </button>
              <button
                type="button"
                className="nav-icon-btn"
                aria-label={themeLabel}
                {...nav.closerProps}
                onClick={toggleTheme}
              >
                <ThemeIcon size={17} />
              </button>
            </div>

            {/* 모바일 버튼 — 검색은 메뉴를 닫고 열고, 테마는 메뉴를 그대로 둔다 */}
            <div className="mobile-nav-actions">
              <button
                type="button"
                className="nav-icon-btn"
                aria-label="검색"
                onClick={e => {
                  closeMobile();
                  openCommandPalette(e.currentTarget);
                }}
              >
                <Search size={MOBILE_ICON_SIZE} />
              </button>
              <button type="button" className="nav-icon-btn" onClick={toggleTheme} aria-label={themeLabel}>
                <ThemeIcon size={MOBILE_ICON_SIZE} />
              </button>
              {/* 두 줄이 ✕로 바뀐다 (CSS가 aria-expanded를 보고 움직인다) */}
              <button
                ref={toggleRef}
                type="button"
                className="mobile-menu-toggle"
                onClick={() => setMobileOpen(prev => !prev)}
                aria-label={mobileOpen ? '메뉴 닫기' : '메뉴 열기'}
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
              >
                <svg
                  width={MOBILE_ICON_SIZE}
                  height={MOBILE_ICON_SIZE}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path className="mobile-menu-bar mobile-menu-bar--top" d="M4 8h16" />
                  <path className="mobile-menu-bar mobile-menu-bar--bottom" d="M4 16h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* 드롭다운 패널 — 높이 전환은 panelProps를 편 요소, 열 등장은 key가 바뀌는 안쪽 래퍼 */}
        <div className="nav-panel" {...nav.panelProps}>
          {nav.shown && (
            <div className="nav-panel-cols" key={nav.panelKey}>
              <NavPanel menu={nav.shown} onExternalClick={() => nav.close()} />
            </div>
          )}
        </div>

        {/* 모바일 메뉴 — 바 아래 화면 전체를 덮는 면. 페이드 아웃하려고 항상 렌더하고, 닫혀 있으면 inert */}
        <nav
          id="mobile-menu"
          ref={menuRef}
          className={`mobile-menu${mobileOpen ? ' is-open' : ''}`}
          aria-label="모바일 메뉴"
          inert={!mobileOpen}
        >
          <ul className="mobile-menu-list">
            {NAV_ITEMS.map((item, i) => (
              <li key={item.key} className="mobile-menu-item" style={stagger(i)}>
                <Link
                  to={item.to}
                  className="mobile-menu-link mobile-menu-link--main"
                  aria-current={isCurrent(item, pathname) ? 'page' : undefined}
                  onClick={closeMobile}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="mobile-menu-list">
            {SOCIAL_LINKS.map((link, i) => (
              <li key={link.href} className="mobile-menu-item" style={stagger(NAV_ITEMS.length + i)}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mobile-menu-link mobile-menu-link--social"
                  onClick={closeMobile}
                >
                  {link.label}
                  <ArrowUpRight size={14} strokeWidth={2.4} aria-hidden="true" />
                  <NewTabHint />
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* 드롭다운이 열리면 바깥을 흐리게 덮는다 — 닫힐 때 페이드 아웃하려고 항상 렌더 */}
      <button
        type="button"
        className={`nav-scrim${nav.open ? ' is-open' : ''}`}
        aria-label="메뉴 닫기"
        {...nav.scrimProps}
      />
    </>
  );
}
