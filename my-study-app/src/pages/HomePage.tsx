import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, ArrowRight } from 'lucide-react';
import { MENUS, MENU_DATA, BOOKS, REPO_DATA } from '../data/menuData';
import { BADGE, DESC, GROUP_ORDER, tintClass } from '../data/topics';
import { ProfileCard } from '../components/ProfileCard';
import { StackRatio } from '../components/StackRatio';
import { Clock } from '../components/Clock';
import { MiniCalendar } from '../components/MiniCalendar';
import { docCount } from '../utils/category';
import type { MenuItem } from '../types';

const QUICK_KEYS = ['spring', 'java', 'mysql', 'oop'];

const TOTAL_DOCS = Object.values(MENU_DATA).reduce((sum, arr) => sum + arr.length, 0);

export function HomePage() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!query) return [];
    return MENUS.filter(m =>
      m.name.toLowerCase().includes(query) ||
      (DESC[m.key] ?? '').toLowerCase().includes(query) ||
      m.group.toLowerCase().includes(query)
    );
  }, [query]);

  const groups = useMemo(
    () =>
      GROUP_ORDER.map(group => ({ group, items: MENUS.filter(m => m.group === group) }))
        .filter(g => g.items.length > 0),
    []
  );

  const go = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(path);
  };

  const renderRow = (m: MenuItem) => (
    <a
      key={m.key}
      className="cat-row home-anim"
      href={`/download/${m.key}`}
      onClick={go(`/download/${m.key}`)}
    >
      <div className={`cat-badge ${tintClass(m.key)}`}>{BADGE[m.key] ?? m.name.slice(0, 2)}</div>
      <div className="cat-main">
        <div className="cat-title">{m.name}</div>
        <div className="cat-desc">{DESC[m.key] ?? m.group}</div>
      </div>
      <span className="cat-count">{docCount(m.key)}</span>
      <span className="cat-chev"><ChevronRight size={18} /></span>
    </a>
  );

  return (
    <main className="page-wrapper home-layout">
      {/* 왼쪽 레일: 프로필 + 스택 비율 (sticky) */}
      <aside className="home-rail home-rail-left">
        <ProfileCard />
        <StackRatio />
      </aside>

      <div className="home-main">
      {/* Hero */}
      <section className="home-hero">
        <p className="home-eyebrow">Backend Study Archive</p>
        <h1 className="home-title">백엔드 개발 학습 자료를 한곳에</h1>
        <p className="home-subtitle">직접 공부하고 PDF로 정리했습니다. 다운로드는 자유입니다.</p>
        <div className="home-stats">
          <span><b>{MENUS.length}</b> 주제</span>
          <span className="home-stats-sep" aria-hidden="true" />
          <span><b>{TOTAL_DOCS}</b> 문서</span>
          <span className="home-stats-sep" aria-hidden="true" />
          <span><b>{BOOKS.length}</b> 추천 도서</span>
          <span className="home-stats-sep" aria-hidden="true" />
          <span><b>{REPO_DATA.length}</b> 실습 레포</span>
        </div>
        <div className="home-search">
          <span className="home-search-ico"><Search size={18} /></span>
          <input
            type="text"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="자료 검색 — Spring, 인덱스, 네트워크…"
            aria-label="자료 검색"
          />
        </div>
      </section>

      {query ? (
        /* 검색 결과 */
        <section className="home-section">
          <div className="home-section-head"><h2>검색 결과 {filtered.length}건</h2></div>
          {filtered.length > 0 ? (
            <div className="cat-list">{filtered.map(renderRow)}</div>
          ) : (
            <p style={{ color: 'var(--text-muted)', padding: '8px 4px' }}>일치하는 자료가 없어요.</p>
          )}
        </section>
      ) : (
        <>
          {/* 바로가기 */}
          <section className="home-section">
            <div className="home-section-head"><h2>바로가기</h2></div>
            <div className="quick-grid">
              {QUICK_KEYS.map(key => {
                const m = MENUS.find(x => x.key === key);
                if (!m) return null;
                return (
                  <a
                    key={key}
                    className={`quick-card home-anim ${tintClass(key)}`}
                    href={`/download/${key}`}
                    onClick={go(`/download/${key}`)}
                  >
                    <span className="quick-tag">{m.name}</span>
                    <h4 className="quick-card-title">{DESC[key]}</h4>
                    <div className="quick-meta"><b>{docCount(key)}개 문서</b> · PDF</div>
                  </a>
                );
              })}
            </div>
          </section>

          {/* 주제별 자료 */}
          {groups.map(({ group, items }) => (
            <section className="home-section" key={group}>
              <div className="home-section-head"><h2>{group}</h2></div>
              <div className="cat-list">{items.map(renderRow)}</div>
            </section>
          ))}
        </>
      )}

      {/* 책 · GitHub 패널 */}
      <section className="home-panel home-anim">
        <div className="grow">
          <h3><span className="tick" />읽은 책 &amp; GitHub</h3>
          <p>추천 도서 정리와 실습 레포지토리도 함께 보세요.</p>
        </div>
        <button className="home-panel-btn" onClick={() => navigate('/books')}>
          책 보러가기 <span className="arr"><ArrowRight size={16} /></span>
        </button>
      </section>
      </div>

      {/* 오른쪽 레일: 시계 + 달력 (sticky) */}
      <aside className="home-rail home-rail-right">
        <Clock />
        <MiniCalendar />
      </aside>
    </main>
  );
}
