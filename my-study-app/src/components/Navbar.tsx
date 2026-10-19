import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ArrowUpRight, Moon, Sun, Menu, X, Search } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { NavPanel } from './NavPanel';
import { useNavMenu } from '../hooks/useNavMenu';
import { LINKS, NAV_ITEMS, SOCIAL_LINKS } from '../constants';

const openSearch = () => window.dispatchEvent(new Event('open-command-palette'));

const mobileClass = ({ isActive }: { isActive: boolean }) =>
  `mobile-menu-item${isActive ? ' active' : ''}`;

/* 상단 바에는 Velog·Blog만 (GitHub는 내부 페이지 링크가 따로 있다) */
const NAV_LINKS = SOCIAL_LINKS
  .filter(link => link.href !== LINKS.github)
  .map(({ shortLabel, href }) => ({ label: shortLabel, href }));

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = useNavMenu();
  const closeMobile = () => setMobileOpen(false);

  const themeLabel = theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환';
  const ThemeIcon = theme === 'dark' ? Sun : Moon;

  return (
    <>
      <header className={`header${nav.open ? ' is-open' : ''}`} {...nav.headerProps}>
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
                </a>
              ))}
            </nav>

            <div className="nav-actions">
              <button
                type="button"
                className="nav-icon-btn"
                aria-label="검색 (⌘K)"
                {...nav.closerProps}
                onClick={openSearch}
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

            {/* 모바일 버튼 */}
            <div className="mobile-nav-actions">
              <button type="button" className="nav-icon-btn" onClick={openSearch} aria-label="검색">
                <Search size={17} />
              </button>
              <button type="button" className="nav-icon-btn" onClick={toggleTheme} aria-label={themeLabel}>
                <ThemeIcon size={17} />
              </button>
              <button
                type="button"
                className="mobile-menu-toggle"
                onClick={() => setMobileOpen(prev => !prev)}
                aria-label={mobileOpen ? '메뉴 닫기' : '메뉴 열기'}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
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

        {/* 모바일 드롭다운 */}
        {mobileOpen && (
          <div className="mobile-menu">
            <NavLink to="/" end className={mobileClass} onClick={closeMobile}>Home</NavLink>
            <NavLink to="/books" className={mobileClass} onClick={closeMobile}>Books</NavLink>
            <NavLink to="/github" className={mobileClass} onClick={closeMobile}>GitHub</NavLink>
            <NavLink to="/vibe" className={mobileClass} onClick={closeMobile}>Vibe</NavLink>
            {NAV_LINKS.map(link => (
              <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="mobile-menu-item mobile-menu-ext">
                {link.label} <span className="nav-arr">↗</span>
              </a>
            ))}
          </div>
        )}
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
