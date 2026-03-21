import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

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
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/books" className="nav-link">Books</Link>
          <Link to="/github" className="nav-link">GitHub</Link>
          <a href="https://velog.io/@dlwoals1024/posts" target="_blank" rel="noopener noreferrer" className="nav-link">Velog</a>
          <a href="https://blog.naver.com/jon1024" target="_blank" rel="noopener noreferrer" className="nav-link">Blog</a>
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
          <Link to="/" className="mobile-menu-item" onClick={() => setMobileOpen(false)}>Home</Link>
          <Link to="/books" className="mobile-menu-item" onClick={() => setMobileOpen(false)}>Books</Link>
          <Link to="/github" className="mobile-menu-item" onClick={() => setMobileOpen(false)}>GitHub</Link>
          <a href="https://velog.io/@dlwoals1024/posts" target="_blank" rel="noopener noreferrer" className="mobile-menu-item">Velog</a>
          <a href="https://blog.naver.com/jon1024" target="_blank" rel="noopener noreferrer" className="mobile-menu-item">Blog</a>
        </div>
      )}
    </header>
  );
}
