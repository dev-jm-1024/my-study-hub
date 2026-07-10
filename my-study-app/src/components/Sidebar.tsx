import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { MENUS, MENU_DATA } from '../data/menuData';
import { badgeLabel, tintClass, GROUP_ORDER } from '../data/topics';

interface SidebarProps {
  currentCategory?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const countOf = (key: string) => (MENU_DATA[key] ?? []).length;

export function Sidebar({ currentCategory, isOpen = false, onClose }: SidebarProps) {
  // GROUP_ORDER 순서로 묶기 (+ 목록에 없는 그룹은 뒤에 붙임)
  const known = new Set(GROUP_ORDER);
  const extraGroups = [...new Set(MENUS.filter(m => !known.has(m.group)).map(m => m.group))];
  const groups = [...GROUP_ORDER, ...extraGroups]
    .map(group => ({ group, items: MENUS.filter(m => m.group === group) }))
    .filter(g => g.items.length > 0);

  const cur = currentCategory?.toLowerCase();

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} aria-hidden="true" />}
      <aside className={`sidebar${isOpen ? ' sidebar--open' : ''}`}>
        <div className="sidebar-inner">
          <Link to="/" className="sidebar-back" onClick={onClose}>
            <ChevronLeft size={16} />
            홈으로
          </Link>

          {groups.map(({ group, items }) => (
            <div key={group} className="menu-group">
              <div className="menu-group-title">{group}</div>
              <ul className="menu-list">
                {items.map(menu => {
                  const active = cur === menu.key.toLowerCase();
                  return (
                    <li key={menu.key}>
                      <Link
                        to={`/download/${menu.key}`}
                        className={`menu-item${active ? ' active' : ''}`}
                        onClick={onClose}
                      >
                        <span className={`menu-badge ${tintClass(menu.key)}`}>
                          {badgeLabel(menu.key, menu.name)}
                        </span>
                        <span className="menu-name">{menu.name}</span>
                        <span className="menu-count">{countOf(menu.key)}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
