import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { NAV_ITEMS } from '../constants';
import type { NavColumn, NavLink as NavLinkItem, NavMenuKey } from '../constants';
import { NAV_MENUS } from '../utils/navMenus';
import { NewTabHint } from './NewTabHint';

/* 드롭다운 패널 안쪽 — 메뉴 하나의 열 목록. 열기·닫기·위치는 Navbar와 useNavMenu 몫이다.
   열 구성은 utils/navMenus.ts가 만든다. 라벨의 '↗'·'›'는 여기서 붙인다 */

type LinkSize = 'large' | 'small';

/** 외부 링크 화살표 크기(px) — 링크 글자 크기(t3 / foot)에 맞춘다 */
const ARROW_SIZE: Record<LinkSize, number> = { large: 12, small: 10 };

interface PanelLinkProps {
  link: NavLinkItem;
  size: LinkSize;
  onExternalClick: () => void;
}

function PanelLink({ link, size, onExternalClick }: PanelLinkProps) {
  const className = `nav-panel-link nav-panel-link--${size}${link.muted ? ' is-muted' : ''}`;

  if (link.href) {
    return (
      <a
        className={className}
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onExternalClick}
      >
        {link.label}
        <ArrowUpRight size={ARROW_SIZE[size]} aria-hidden="true" />
        <NewTabHint />
      </a>
    );
  }

  return (
    <Link className={className} to={link.to ?? '/'}>
      {link.label}
      {link.muted && <span aria-hidden="true">›</span>}
    </Link>
  );
}

interface NavPanelProps {
  menu: NavMenuKey;
  /** 새 탭으로 여는 외부 링크를 눌렀을 때 — 라우트가 안 바뀌므로 패널을 직접 닫는다 */
  onExternalClick: () => void;
}

export function NavPanel({ menu, onExternalClick }: NavPanelProps) {
  const label = NAV_ITEMS.find(item => item.key === menu)?.label ?? menu;
  const columns: NavColumn[] = NAV_MENUS[menu];

  return (
    <section className="nav-panel-section" aria-label={`${label} 메뉴`}>
      {columns.map(col => {
        const linkSize: LinkSize = col.size === 'large' ? 'large' : 'small';
        return (
          <div key={col.heading} className={`nav-col nav-col--${col.size}`}>
            <p className="nav-col-heading">{col.heading}</p>

            {col.covers && (
              <ul className="nav-covers">
                {col.covers.map(cover => (
                  <li key={cover.title}>
                    <Link className="nav-cover" to={cover.to} aria-label={cover.title}>
                      <img src={cover.coverUrl} alt="" loading="lazy" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <ul className="nav-col-list">
              {col.links.map(link => (
                <li key={link.label}>
                  <PanelLink link={link} size={linkSize} onExternalClick={onExternalClick} />
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
}
