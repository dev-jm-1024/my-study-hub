import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Moon, Sun, Menu, X, Search } from 'lucide-react';
import { useTheme } from './ThemeProvider';

const openSearch = () => window.dispatchEvent(new Event('open-command-palette'));

const navClass = ({ isActive }: { isActive: boolean }) =>
  `nav-link${isActive ? ' active' : ''}`;
const mobileClass = ({ isActive }: { isActive: boolean }) =>
  `mobile-menu-item${isActive ? ' active' : ''}`;

const NAV_LINKS = [
  { label: 'Velog', href: 'https://velog.io/@dlwoals1024/posts' },
  { label: 'Blog', href: 'https://blog.naver.com/jon1024' },
];

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const close = () => setMobileOpen(false);

  return (
    <header className="header">
      <div className="header-inner">
        {/* 로고 */}
        <button
          className="nav-logo"
          onClick={() => { navigate('/'); setMobileOpen(false); }}
        >
          <img src="/logo.png" alt="JM Hub" className="nav-logo-img" />
          <span className="logo-text">JM Hub</span>
        </button>

        {/* 데스크탑 메뉴 */}
        <nav className="nav-links">
          <NavLink to="/" end className={navClass}>Home</NavLink>
          <NavLink to="/books" className={navClass}>Books</NavLink>
          <NavLink to="/github" className={navClass}>GitHub</NavLink>
          <NavLink to="/vibe" className={navClass}>Vibe</NavLink>
          {NAV_LINKS.map(link => (
            <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="nav-link nav-ext">
              {link.label} <span className="nav-arr">↗</span>
            </a>
          ))}
          <button className="nav-search" onClick={openSearch} aria-label="검색 (Command K)">
            <Search size={15} />
            <span>검색</span>
            <kbd>⌘K</kbd>
          </button>
          <div className="nav-divider" />
          <button className="theme-toggle" onClick={toggleTheme} aria-label="테마 전환">
            {theme === 'dark'
              ? <Sun size={18} />
              : <Moon size={18} />
            }
          </button>
        </nav>

        {/* 모바일 버튼 */}
        <div className="mobile-nav-actions">
          <button className="theme-toggle" onClick={openSearch} aria-label="검색">
            <Search size={18} />
          </button>
          <button className="theme-toggle" onClick={toggleTheme} aria-label="테마 전환">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileOpen(prev => !prev)}
            aria-label="메뉴 열기"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* 모바일 드롭다운 */}
      {mobileOpen && (
        <div className="mobile-menu">
          <NavLink to="/" end className={mobileClass} onClick={close}>Home</NavLink>
          <NavLink to="/books" className={mobileClass} onClick={close}>Books</NavLink>
          <NavLink to="/github" className={mobileClass} onClick={close}>GitHub</NavLink>
          <NavLink to="/vibe" className={mobileClass} onClick={close}>Vibe</NavLink>
          {NAV_LINKS.map(link => (
            <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="mobile-menu-item mobile-menu-ext">
              {link.label} <span className="nav-arr">↗</span>
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
