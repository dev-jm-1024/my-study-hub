import { useNavigate } from 'react-router-dom';
import { MENUS, MENU_DATA } from '../data/menuData';
import { badgeLabel } from '../data/topics';
import { STACK } from '../data/stacks';

const countOf = (key: string) => (MENU_DATA[key] ?? []).length;

/** 브랜드 로고(SVG) 또는 모노그램 배지 */
function StackIcon({ k, name }: { k: string; name: string }) {
  const v = STACK[k];
  const color = v?.color ?? 'var(--text-muted)';
  return (
    <span className="stk-ic" style={{ ['--stk' as string]: color }}>
      {v?.icon ? (
        <svg viewBox="0 0 24 24" width="13" height="13" fill={color} aria-hidden="true">
          <path d={v.icon.path} />
        </svg>
      ) : (
        <span className="stk-mono">{badgeLabel(k, name)}</span>
      )}
    </span>
  );
}

export function StackRatio() {
  const navigate = useNavigate();

  const items = MENUS.map(m => ({ key: m.key, name: m.name, count: countOf(m.key) }))
    .filter(x => x.count > 0)
    .sort((a, b) => b.count - a.count);

  const total = items.reduce((s, x) => s + x.count, 0);
  const max = items.length ? items[0].count : 1;

  return (
    <div className="dash-card">
      <div className="dash-head">
        <span className="dash-title">스택별 문서 비율</span>
        <span className="dash-sub">{total}개 문서</span>
      </div>

      <div className="ratio-list">
        {items.map(item => {
          const pct = Math.round((item.count / total) * 100);
          return (
            <button
              key={item.key}
              className="ratio-row"
              style={{ ['--c' as string]: STACK[item.key]?.color ?? '#8E7A70' }}
              onClick={() => navigate(`/download/${item.key}`)}
              title={`${item.name} · ${item.count}개 (${pct}%)`}
            >
              <span className="ratio-top">
                <StackIcon k={item.key} name={item.name} />
                <span className="ratio-name">{item.name}</span>
                <span className="ratio-val">{item.count}</span>
              </span>
              <span className="ratio-track">
                <span
                  className="ratio-fill"
                  style={{ width: `${Math.max((item.count / max) * 100, 6)}%` }}
                />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
