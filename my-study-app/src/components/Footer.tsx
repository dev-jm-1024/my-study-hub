import { SOCIAL_LINKS } from '../constants';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <span className="site-footer-copy">© {year} JM Study Hub · 직접 공부하고 정리한 자료</span>
        <nav className="site-footer-links" aria-label="외부 링크">
          {SOCIAL_LINKS.map(link => (
            <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
