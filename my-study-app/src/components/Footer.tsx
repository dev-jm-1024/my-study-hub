import { ArrowUpRight } from 'lucide-react';
import { SOCIAL_LINKS } from '../constants';

/** 외부 링크 화살표 크기(px) — 푸터 글자(cap 12px)에 맞춘다 */
const ARROW_SIZE = 10;

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <p className="site-footer-copy">© {year} JM Study Hub · 직접 공부하고 정리한 자료</p>
        <nav className="site-footer-links" aria-label="외부 링크">
          {SOCIAL_LINKS.map(link => (
            <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
              {link.label}
              <ArrowUpRight size={ARROW_SIZE} aria-hidden="true" />
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
