import { Fragment, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { MENUS, MENU_DATA, BOOKS, REPO_DATA } from '../data/menuData';
import { ALIASES, DESC, GROUP_ORDER, tintClass } from '../data/topics';
import { ProfileCard } from '../components/ProfileCard';
import { StackRatio } from '../components/StackRatio';
import { Clock } from '../components/Clock';
import { MiniCalendar } from '../components/MiniCalendar';
import { CategoryRow } from '../components/CategoryRow';
import { docCount } from '../utils/category';
import { useTransitionNavigate } from '../hooks/useTransitionNavigate';
import { HeroSwarm, useHomeIntro, useCountUp } from '../components/HeroIntro';

const QUICK_KEYS = ['spring', 'java', 'mysql', 'oop'];
/* 바로가기 카드의 주제 칩·문서 수가 자료실 헤더의 배지·문서 수로 이어진다 (view-transition.css) */
const CARD_TO_HEAD = { '.quick-tag': 'dl-badge', '.quick-meta b': 'dl-count' };

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
      m.group.toLowerCase().includes(query) ||
      (ALIASES[m.key] ?? []).some(alias => alias.toLowerCase().includes(query))
    );
  }, [query]);

  const groups = useMemo(
    () =>
      GROUP_ORDER.map(group => ({ group, items: MENUS.filter(m => m.group === group) }))
        .filter(g => g.items.length > 0),
    []
  );

  const go = useTransitionNavigate();

  const intro = useHomeIntro();
  const gatherRef = useRef<HTMLSpanElement>(null);
  const stats = [
    { n: useCountUp(MENUS.length, intro), label: '주제' },
    { n: useCountUp(TOTAL_DOCS, intro), label: '문서' },
    { n: useCountUp(BOOKS.length, intro), label: '추천 도서' },
    { n: useCountUp(REPO_DATA.length, intro), label: '실습 레포' },
  ];

  return (
    <main className={`page-wrapper home-layout${intro ? ' home-intro' : ''}`}>
      {/* 왼쪽 레일: 프로필 + 스택 비율 (sticky) */}
      <aside className="home-rail home-rail-left">
        <ProfileCard />
        <StackRatio />
      </aside>

      <div className="home-main">
      {/* Hero */}
      <section className="home-hero">
        <p className="home-eyebrow">Backend Study Archive</p>
        <h1 className="home-title">
          {['백엔드', '개발', '학습', '자료를'].map(w => (
            <Fragment key={w}><span className="home-title-w"><span>{w}</span></span>{' '}</Fragment>
          ))}
          <span ref={gatherRef} className="home-gather">한곳에</span>
        </h1>
        <p className="home-subtitle">직접 공부하고 PDF로 정리했습니다. 다운로드는 자유입니다.</p>
        <div className="home-stats">
          {stats.map(({ n, label }, i) => (
            <Fragment key={label}>
              {i > 0 && <span className="home-stats-sep" aria-hidden="true" />}
              <span><b>{n}</b> {label}</span>
            </Fragment>
          ))}
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
        {/* 제목 뒤에 둬야 배지 무리의 레이아웃 효과가 돌 때 gatherRef가 붙어 있다 */}
        {intro && <HeroSwarm target={gatherRef} />}
      </section>

      {query ? (
        /* 검색 결과 */
        <section className="home-section">
          <div className="home-section-head"><h2>검색 결과 {filtered.length}건</h2></div>
          {filtered.length > 0 ? (
            <div className="cat-list">{filtered.map(m => <CategoryRow key={m.key} item={m} />)}</div>
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
                    onClick={e => go(e, `/download/${key}`, CARD_TO_HEAD)}
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
              <div className="cat-list">{items.map(m => <CategoryRow key={m.key} item={m} />)}</div>
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
