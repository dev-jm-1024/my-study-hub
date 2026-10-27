import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText } from 'lucide-react';
import { MENUS, MENU_DATA } from '../data/menuData';
import { badgeLabel, topicStyle } from '../data/topics';
import { useDrawer } from '../hooks/useDrawer';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { BREAKPOINT } from '../constants';

const MOBILE_QUERY = `(max-width: ${BREAKPOINT.mobile}px)`;

const OPEN_EVENT = 'open-command-palette';

/** 팔레트를 연다. 여는 버튼을 넘기면 닫을 때 포커스를 그 버튼으로 돌려준다
 *  (Safari는 버튼을 눌러도 포커스가 안 가서 열기 직전 포커스를 믿을 수 없다). 단축키(⌘K·/)로 열 때는 쓰지 않는다 */
export function openCommandPalette(opener?: HTMLElement) {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: { opener } }));
}

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
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const mobile = useMediaQuery(MOBILE_QUERY);
  const uid = useId();
  const listId = `${uid}-list`;
  const optionId = (i: number) => `${uid}-option-${i}`;
  const index = useMemo(buildIndex, []);

  const query = q.trim().toLowerCase();
  const results = useMemo(() => {
    if (!query) return index.filter(r => r.kind === 'cat');
    return index
      .filter(r => `${r.title} ${r.sub}`.toLowerCase().includes(query))
      .slice(0, 14);
  }, [query, index]);
  // 검색어가 바뀐 렌더에서 active가 아직 옛 값이어도 목록 밖을 가리키지 않게
  const selected = Math.max(0, Math.min(active, results.length - 1));

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
    // openCommandPalette(opener)가 detail.opener로 여는 버튼을 실어 보낸다. 없으면 → 열기 직전 포커스
    const onOpen = (e: Event) => {
      const opener = (e as CustomEvent<{ opener?: unknown }>).detail?.opener;
      openerRef.current = opener instanceof HTMLElement ? opener : null;
      setOpen(true);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, [open]);

  // 모달 공통 동작 — 스크롤 잠금 · 입력칸으로 포커스 · Tab은 패널 안에서만 · Esc로 닫기 · 닫히면 연 곳으로 포커스 복귀.
  // 서랍·미리보기 시트 위에 겹쳐 열려도 맨 위 층인 이 팔레트만 Esc·Tab을 받는다
  useDrawer({
    open,
    onClose: () => setOpen(false),
    panelRef,
    initialFocusRef: inputRef,
    returnFocusRef: openerRef,
  });

  // 닫히면 검색어·선택·여는 버튼을 비워, 다음에 열 때 처음 상태로 시작한다 (복귀는 useDrawer의 정리가 먼저 끝낸다)
  useEffect(() => {
    if (open) return;
    setQ('');
    setActive(0);
    openerRef.current = null;
  }, [open]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    const el = listRef.current?.querySelector('[aria-selected="true"]');
    el?.scrollIntoView({ block: 'nearest' });
  }, [selected, results.length]);

  const activate = (r?: Result) => {
    if (!r) return;
    setOpen(false);
    navigate(`/download/${r.catKey}`);
  };

  // Esc는 useDrawer가 받는다 (한글 조합 중 Esc는 건너뛴다)
  const onInputKey = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(Math.min(selected + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(Math.max(selected - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      activate(results[selected]);
    }
  };

  if (!open) return null;

  return (
    <div
      className="cmdk-overlay"
      onMouseDown={e => {
        e.preventDefault(); // 바깥을 눌러 닫을 때 기본 동작이 포커스를 body로 빼앗지 않게
        setOpen(false);
      }}
    >
      <div
        ref={panelRef}
        className="cmdk-panel"
        role="dialog"
        aria-modal="true"
        aria-label="전체 검색"
        onMouseDown={e => {
          e.stopPropagation();
          // 입력칸 밖(항목·여백)을 눌러도 포커스가 입력칸에 남아 ↑↓·Enter가 계속 듣는다
          if (e.target !== inputRef.current) e.preventDefault();
        }}
      >
        <div className="cmdk-input-wrap">
          <Search size={20} strokeWidth={2.2} className="cmdk-input-ico" aria-hidden="true" />
          <input
            ref={inputRef}
            className="cmdk-input"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={results.length > 0 ? optionId(selected) : undefined}
            aria-label="자료 검색"
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={onInputKey}
            placeholder={mobile ? '주제 또는 문서 제목…' : '자료 검색 — 주제 또는 문서 제목…'}
            autoComplete="off"
            spellCheck={false}
          />
          {/* 키보드 없는 좁은 화면에서는 ESC 칩 대신 취소 버튼 (CSS가 734px 경계로 둘 중 하나만 보여 준다) */}
          <kbd className="cmdk-esc" aria-hidden="true">ESC</kbd>
          <button type="button" className="cmdk-cancel" onClick={() => setOpen(false)}>취소</button>
        </div>

        {/* 항목은 Tab 정지점이 아니다 — 입력칸 하나에서 ↑↓·Enter (aria-activedescendant) */}
        <div className="cmdk-list" id={listId} ref={listRef} role="listbox" aria-label="검색 결과">
          {results.map((r, i) => (
            <button
              key={r.id}
              id={optionId(i)}
              type="button"
              role="option"
              tabIndex={-1}
              aria-selected={i === selected}
              className="cmdk-item"
              onMouseMove={() => i !== selected && setActive(i)}
              onClick={() => activate(r)}
            >
              {r.kind === 'cat' ? (
                <span className="cmdk-badge" style={topicStyle(r.catKey)} aria-hidden="true">
                  {badgeLabel(r.catKey, r.catName)}
                </span>
              ) : (
                <span className="cmdk-badge cmdk-badge--doc" aria-hidden="true">
                  <FileText size={16} />
                </span>
              )}
              <span className="cmdk-item-main">
                <span className="cmdk-item-title">{r.title}</span>
                <span className="cmdk-item-sub">{r.sub}</span>
              </span>
              <span className="cmdk-item-type">{r.kind === 'cat' ? '자료실' : 'PDF'}</span>
            </button>
          ))}
        </div>
        {/* 라이브 영역은 늘 DOM에 두어, 내용이 생길 때 스크린 리더가 읽는다 */}
        <div className="cmdk-empty" role="status">
          {results.length === 0 ? `‘${q}’에 대한 결과가 없어요.` : null}
        </div>

        <div className="cmdk-hint" aria-hidden="true">
          <span><kbd>↑</kbd><kbd>↓</kbd> 이동</span>
          <span><kbd>↵</kbd> 열기</span>
          <span><kbd>esc</kbd> 닫기</span>
        </div>
      </div>
    </div>
  );
}
