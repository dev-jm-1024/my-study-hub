import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText } from 'lucide-react';
import { MENUS, MENU_DATA } from '../data/menuData';
import { badgeLabel, tintClass } from '../data/topics';
import { lockScroll } from '../utils/scrollLock';

type Result =
  | { kind: 'cat'; id: string; catKey: string; catName: string; title: string; sub: string }
  | { kind: 'doc'; id: string; catKey: string; catName: string; title: string; sub: string };

function buildIndex(): Result[] {
  const cats: Result[] = MENUS.map(m => ({
    kind: 'cat',
    id: `cat-${m.key}`,
    catKey: m.key,
    catName: m.name,
    title: m.name,
    sub: `${m.group} · ${(MENU_DATA[m.key] ?? []).length}개 문서`,
  }));
  const docs: Result[] = [];
  for (const m of MENUS) {
    (MENU_DATA[m.key] ?? []).forEach((pdf, i) => {
      docs.push({
        kind: 'doc',
        id: `doc-${m.key}-${i}`,
        catKey: m.key,
        catName: m.name,
        title: pdf.title,
        sub: [m.name, pdf.section, pdf.description].filter(Boolean).join(' · '),
      });
    });
  }
  return [...cats, ...docs];
}

export function CommandPalette() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const index = useMemo(buildIndex, []);

  const query = q.trim().toLowerCase();
  const results = useMemo(() => {
    if (!query) return index.filter(r => r.kind === 'cat');
    return index
      .filter(r => `${r.title} ${r.sub}`.toLowerCase().includes(query))
      .slice(0, 14);
  }, [query, index]);

  // 열기/닫기 단축키
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      } else if (e.key === '/' && !open) {
        const el = document.activeElement as HTMLElement | null;
        const typing =
          el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
        if (!typing) {
          e.preventDefault();
          setOpen(true);
        }
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('open-command-palette', onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('open-command-palette', onOpen);
    };
  }, [open]);

  // 열린 동안 뒤 화면 스크롤 잠금 — html까지 잠그고, 서랍 위에 겹쳐 열려도 서랍이 닫히기 전엔 안 풀린다.
  // 잠근 순서가 층 순서라, 아래 서랍(useDrawer)은 이 팔레트가 떠 있는 동안 Esc·Tab을 받지 않는다
  useEffect(() => {
    if (!open) return;
    setQ('');
    setActive(0);
    requestAnimationFrame(() => inputRef.current?.focus());
    return lockScroll();
  }, [open]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    const el = listRef.current?.querySelector('.cmdk-item.active') as HTMLElement | null;
    el?.scrollIntoView({ block: 'nearest' });
  }, [active, results.length]);

  const activate = (r?: Result) => {
    if (!r) return;
    setOpen(false);
    navigate(`/download/${r.catKey}`);
  };

  const onInputKey = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(a => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(a => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      activate(results[active]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    }
  };

  if (!open) return null;

  return (
    <div className="cmdk-overlay" onMouseDown={() => setOpen(false)}>
      <div className="cmdk-panel" onMouseDown={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="cmdk-input-wrap">
          <Search size={18} className="cmdk-input-ico" />
          <input
            ref={inputRef}
            className="cmdk-input"
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={onInputKey}
            placeholder="자료 검색 — 주제 또는 문서 제목…"
            aria-label="전체 검색"
          />
          <kbd className="cmdk-esc">ESC</kbd>
        </div>

        <div className="cmdk-list" ref={listRef}>
          {results.length === 0 ? (
            <div className="cmdk-empty">‘{q}’에 대한 결과가 없어요.</div>
          ) : (
            results.map((r, i) => (
              <button
                key={r.id}
                className={`cmdk-item${i === active ? ' active' : ''}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => activate(r)}
              >
                <span className={`cmdk-badge ${tintClass(r.catKey)}`}>
                  {r.kind === 'cat' ? badgeLabel(r.catKey, r.catName) : <FileText size={15} />}
                </span>
                <span className="cmdk-item-main">
                  <span className="cmdk-item-title">{r.title}</span>
                  <span className="cmdk-item-sub">{r.sub}</span>
                </span>
                <span className="cmdk-item-type">{r.kind === 'cat' ? '자료실' : 'PDF'}</span>
              </button>
            ))
          )}
        </div>

        <div className="cmdk-hint">
          <span><kbd>↑</kbd><kbd>↓</kbd> 이동</span>
          <span><kbd>↵</kbd> 열기</span>
          <span><kbd>esc</kbd> 닫기</span>
        </div>
      </div>
    </div>
  );
}
