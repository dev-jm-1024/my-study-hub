import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { MENUS } from '../data/menuData';

interface SidebarProps {
  currentCategory?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

// MENUS의 group 기준으로 묶기
function groupMenus() {
  const groups: Record<string, typeof MENUS> = {};
  for (const menu of MENUS) {
    if (!groups[menu.group]) groups[menu.group] = [];
    groups[menu.group].push(menu);
  }
  return groups;
}

export function Sidebar({ currentCategory, isOpen = false, onClose }: SidebarProps) {
  const groups = groupMenus();

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} aria-hidden="true" />}
      <aside className={`sidebar${isOpen ? ' sidebar--open' : ''}`}>
      <div className="sidebar-inner">
        {/* 홈으로 */}
        <Link to="/" className="sidebar-back" onClick={onClose}>
          <ChevronLeft size={16} />
          홈으로
        </Link>

        {/* 그룹별 메뉴 */}
        {Object.entries(groups).map(([groupName, menus]) => (
          <div key={groupName} className="menu-group">
            <div className="menu-group-title">
              <span className="menu-group-title-icon">
                <i className="fa-solid fa-folder" />
              </span>
              {groupName}
            </div>
            <ul className="menu-list">
              {menus.map(menu => (
                <li key={menu.key}>
                  <Link
                    to={`/download/${menu.key}`}
                    className={`menu-item${currentCategory === menu.key ? ' active' : ''}`}
                    onClick={onClose}
                  >
                    <i className={menu.icon} />
                    <span>{menu.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </aside>
    </>
  );
}
