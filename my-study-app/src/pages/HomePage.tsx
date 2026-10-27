import { Fragment, useState, useMemo, useRef } from 'react';
import { flushSync } from 'react-dom';
import { Link } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import { MENUS, MENU_DATA, BOOKS, REPO_DATA } from '../data/menuData';
import { searchTopics } from '../utils/topicSearch';
import { AboutSection } from '../components/home/AboutSection';
import { FeaturedSection } from '../components/home/FeaturedSection';
import { HeroNewPill } from '../components/home/HeroNewPill';
import { LatestShelf } from '../components/home/LatestShelf';
import { MoreSection } from '../components/home/MoreSection';
import { TopicGroup, TopicGroups } from '../components/home/TopicGroups';
import { newestTopic } from '../utils/home';
import { HeroSwarm, useHomeIntro, useCountUp } from '../components/HeroIntro';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { BREAKPOINT } from '../constants';
import { SEARCH_SHORTCUT } from '../utils/platform';

const TOTAL_DOCS = Object.values(MENU_DATA).reduce((sum, arr) => sum + arr.length, 0);

export function HomePage() {
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();
  useDocumentTitle();

  const filtered = useMemo(() => (query ? searchTopics(MENUS, query) : []), [query]);

  const newTopic = useMemo(() => newestTopic(), []);

  const intro = useHomeIntro();
  const gatherRef = useRef<HTMLSpanElement>(null);
  const topicsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  // 좁은 화면에서는 '자료 검색 —' 머리말을 빼야 예시가 잘리지 않는다 (이름은 aria-label이 맡는다)
  const isMobile = useMediaQuery(`(max-width: ${BREAKPOINT.mobile}px)`);
  const stats = [
    { n: useCountUp(MENUS.length, intro), label: '주제' },
    { n: useCountUp(TOTAL_DOCS, intro), label: '문서' },
    { n: useCountUp(BOOKS.length, intro), label: '추천 도서' },
    { n: useCountUp(REPO_DATA.length, intro), label: '실습 레포' },
  ];

  /* 검색 중이면 검색어를 비워 주제 목록이 다시 그려진 뒤에 그 자리로 내려가고, 키보드 포커스도 그 자리로 옮긴다 */
  const browseTopics = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    flushSync(() => setQ(''));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    /* 'auto'는 html의 scroll-behavior: smooth를 따르므로 '동작 줄이기'에서는 'instant'로 끊는다 */
    topicsRef.current?.scrollIntoView({ behavior: reduce ? 'instant' : 'smooth', block: 'start' });
    topicsRef.current?.focus({ preventScroll: true });
  };

  /* 검색 결과가 0건일 때 — 검색어를 비우고 입력창으로 돌아가 바로 다시 칠 수 있게 한다 */
  const clearSearch = () => {
    setQ('');
    searchRef.current?.focus();
  };

  return (
    <main className={`home-page${intro ? ' home-intro' : ''}`}>
      {/* Hero */}
      <section className="home-hero">
        <HeroNewPill topic={newTopic} />
        <p className="home-eyebrow">Backend Study Archive</p>
        <h1 className="home-title">
          {['백엔드', '학습', '기록,'].map(w => (
            <Fragment key={w}><span className="home-title-w"><span>{w}</span></span>{' '}</Fragment>
          ))}
          <span className="home-title-end">
            <span ref={gatherRef} className="home-gather">한곳에</span>
            <span className="home-title-dot">.</span>
          </span>
        </h1>
        <p className="home-subtitle">직접 공부하고 PDF로 정리했습니다.<br />다운로드는 자유입니다.</p>
        <div className="home-cta">
          <a className="home-cta-primary" href="#topics" onClick={browseTopics}>자료실 둘러보기</a>
          <Link className="home-cta-link" to="/books">
            읽은 책 보기 <ChevronRight size={14} strokeWidth={2.4} aria-hidden="true" />
          </Link>
        </div>
        <label className="home-search">
          <Search size={20} aria-hidden="true" />
          <input
            ref={searchRef}
            type="search"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder={isMobile ? 'Spring, 인덱스, 네트워크…' : '자료 검색 — Spring, 인덱스, 네트워크…'}
            aria-label="자료 검색"
          />
          <kbd className="home-search-kbd" aria-hidden="true">{SEARCH_SHORTCUT}</kbd>
        </label>
        {/* 결과 수는 늘 렌더되는 라이브 영역이 읽는다 — 검색어가 없을 땐 비어 있어 처음 열 때는 읽히지 않는다 */}
        <p className="sr-only" role="status">{query ? `검색 결과 ${filtered.length}건` : ''}</p>
        {/* 제목 뒤에 둬야 배지 무리의 레이아웃 효과가 돌 때 gatherRef가 붙어 있다 */}
        {intro && <HeroSwarm target={gatherRef} />}
      </section>

      {/* 숫자로 보기 */}
      <section className="home-stats" aria-label="자료 현황">
        <dl className="home-stats-list">
          {stats.map(({ n, label }) => (
            <div className="home-stat" key={label}>
              <dt>{label}</dt>
              <dd>{n}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="home-main">
        {query ? (
          /* 검색 결과 — 대표 타일·셸프·주제 그룹 자리를 대신한다 */
          <section className="home-block" aria-labelledby="search-h">
            <div className="home-block-head">
              <h2 className="home-block-title" id="search-h">검색 결과 {filtered.length}건.</h2>
            </div>
            {filtered.length > 0 ? (
              /* 주제 목록과 같은 열 폭 — 결과가 적어도 전체 폭으로 늘어나지 않는다 */
              <div className="topic-grid topic-grid--results">
                <TopicGroup items={filtered} />
              </div>
            ) : (
              <div className="home-empty">
                <p className="home-empty-text">일치하는 자료가 없어요.</p>
                <button type="button" className="home-empty-clear" onClick={clearSearch}>검색어 지우기</button>
              </div>
            )}
          </section>
        ) : (
          <>
            {/* 가장 많이 쌓인 자료실 · 최근 올라온 문서 */}
            <FeaturedSection onBrowseTopics={browseTopics} />
            <LatestShelf />

            {/* 주제별 자료 — '자료실 둘러보기'가 내려오는 자리 */}
            <div id="topics" className="home-topics" ref={topicsRef} tabIndex={-1}>
              <TopicGroups />
            </div>
          </>
        )}

        {/* 기록하는 사람 · 함께 보면 좋은 것들 — 검색 중에도 그대로 */}
        <AboutSection />
        <MoreSection />
      </div>
    </main>
  );
}
