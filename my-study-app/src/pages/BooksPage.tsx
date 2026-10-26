import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowUpRight, BookOpen, GalleryHorizontal, LayoutGrid } from 'lucide-react';
import { SegmentBar } from '../components/SegmentBar';
import { BookShelf } from '../components/BookShelf';
import { BOOKS, BOOK_FILTER_TAGS } from '../data/books';
import { useScrollTopOnMount } from '../hooks/useScrollTopOnMount';
import { useScrollTopOnPush } from '../hooks/useScrollTopOnPush';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { NEW_TAB_LABEL } from '../constants';
import type { BookItem } from '../types';

const STORE_LABELS: [domain: string, label: string][] = [
  ['kyobobook.co.kr', '교보문고'],
  ['yes24.com', 'YES24'],
  ['coupang.com', '쿠팡'],
  ['smartstore.naver.com', '스마트스토어'],
];

// 구매 링크 도메인으로 버튼 문구를 정한다. 목록에 없는 곳은 '구매하기'.
const storeLabel = (url: string): string => {
  try {
    const host = new URL(url).hostname;
    return STORE_LABELS.find(([d]) => host === d || host.endsWith(`.${d}`))?.[1] ?? '구매하기';
  } catch {
    return '구매하기';
  }
};

// '전체' 탭의 값 — 태그 이름과 겹치지 않는다
const ALL = '';

// books.ts 배열 끝이 최근 추가 — 새 책이 먼저 오게 뒤집는다 (홈 recentBooks·Books 메뉴와 같은 규칙, 원본은 건드리지 않는다)
const RECENT_FIRST = [...BOOKS].reverse();

// 책이 한 권도 없는 태그는 탭에서 뺀다. 순서는 상단 Books 메뉴(navMenus의 buildBooks)와 같은 규칙 —
// 권수 내림차순, 동률은 BOOK_FILTER_TAGS 순서(sort가 안정 정렬). '전체'는 맨 앞
const TABS = [
  { key: ALL, label: '전체', count: BOOKS.length },
  ...BOOK_FILTER_TAGS
    .map(tag => ({ key: tag, label: tag, count: BOOKS.filter(b => b.tags?.includes(tag)).length }))
    .filter(t => t.count > 0)
    .sort((a, b) => b.count - a.count),
];

/* 보기 방식 — 가로로 넘기는 진열대(기본) · 한눈에 보는 그리드. 고른 방식은 이 브라우저에 기억해 다음에 열 때도 그대로다
   (태그 필터와 달리 주소에 싣지 않는다 — 상단 메뉴 링크로 들어와도 유지되도록) */
type View = 'shelf' | 'grid';
const VIEW_KEY = 'tech-docs-books-view';
const VIEW_TABS = [
  { key: 'shelf', label: '', ariaLabel: '진열대로 보기', icon: <GalleryHorizontal size={18} strokeWidth={2.2} aria-hidden="true" /> },
  { key: 'grid', label: '', ariaLabel: '그리드로 보기', icon: <LayoutGrid size={18} strokeWidth={2.2} aria-hidden="true" /> },
];
const readView = (): View => {
  try {
    return localStorage.getItem(VIEW_KEY) === 'grid' ? 'grid' : 'shelf';
  } catch {
    return 'shelf';   // 저장소를 못 쓰는 환경(사생활 보호 모드 등)
  }
};

/* 표지. 이미지가 없거나 깨지면 바탕색 칸에 책 아이콘을 둔다. 제목이 바로 아래 글로 있으므로 이미지는 장식(alt="") */
function BookCover({ coverUrl }: { coverUrl: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="bk-cover">
      {coverUrl && !failed ? (
        <img src={coverUrl} alt="" loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <BookOpen className="bk-cover-empty" strokeWidth={1.5} aria-hidden="true" />
      )}
    </div>
  );
}

/* 카드 — 표지 타일 아래에 분류 · 제목 · 설명 · 저자가 가운데로 이어지고 맨 아래에 구매 알약 (Apple 제품 카드 순서) */
function BookCard({ book }: { book: BookItem }) {
  const store = storeLabel(book.purchaseUrl);
  return (
    <li className="bk-card">
      <BookCover coverUrl={book.coverUrl} />
      <div className="bk-body">
        {book.tags && book.tags.length > 0 && <p className="bk-tags">{book.tags.join(' · ')}</p>}
        <h2 className="bk-title">{book.title}</h2>
        <p className="bk-desc">{book.description}</p>
        <p className="bk-author">{book.publisher ? `${book.author} · ${book.publisher}` : book.author}</p>
      </div>
      <a
        className="bk-buy"
        href={book.purchaseUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${book.title} — ${store} ${NEW_TAB_LABEL}`}
      >
        <span className="bk-buy-pill">
          {store}
          <ArrowUpRight size={14} strokeWidth={2.4} aria-hidden="true" />
        </span>
      </a>
    </li>
  );
}

const TITLE = '백엔드 개발자 추천 도서';

export function BooksPage() {
  useDocumentTitle(TITLE);
  useScrollTopOnMount();
  useScrollTopOnPush();   // 상단 메뉴 링크로 태그가 바뀌면 새 목록의 맨 위부터 — 세그먼트·뒤로 가기는 그대로

  // 필터는 주소(?tag=)가 정본 — 상단 메뉴 링크로 같은 페이지에서 태그만 바뀌어도 바로 반영된다. 모르는 값은 전체
  const [params, setParams] = useSearchParams();
  const tag = params.get('tag') ?? ALL;
  const selected = TABS.some(t => t.key === tag) ? tag : ALL;

  const selectTag = (key: string) => {
    const next = new URLSearchParams(params);
    if (key === ALL) next.delete('tag');
    else next.set('tag', key);
    setParams(next, { replace: true });
  };

  const [view, setView] = useState<View>(readView);
  const selectView = (key: string) => {
    const next: View = key === 'grid' ? 'grid' : 'shelf';
    setView(next);
    try {
      localStorage.setItem(VIEW_KEY, next);
    } catch {
      /* 저장은 못 해도 이번 화면에서는 바뀐다 */
    }
  };

  const shown = selected === ALL ? RECENT_FIRST : RECENT_FIRST.filter(b => b.tags?.includes(selected));
  const cards = shown.map(book => <BookCard key={book.title} book={book} />);

  return (
    // .bk-page는 화면 폭(스크롤바 제외)을 cqw로 재는 기준 — 진열대만 화면 끝까지 펼친다 (books.css)
    <div className="bk-page">
      <main className="page-wrapper">
        {/* 페이지 헤더 — 숫자는 필터와 무관한 전체 권수 */}
        <header className="dl-head home-anim">
          <div className="dl-head-badge" aria-hidden="true">
            <BookOpen size={22} />
          </div>
          <div className="dl-head-text">
            <p className="dl-eyebrow">Books</p>
            <h1 className="dl-title">{TITLE}</h1>
          </div>
          <p className="dl-count">
            <span className="dl-count-num">{BOOKS.length}</span>
            <span className="dl-count-unit">권</span>
          </p>
        </header>
        <p className="page-intro home-anim">실무와 학습에 도움이 되는 도서를 엄선했습니다.</p>

        {/* 필터를 바꿔도 등장 효과가 다시 돌지 않게 .home-anim은 래퍼에만 둔다. 보기 방식 전환이 왼쪽, 태그 필터가 오른쪽 */}
        <div className="bk-bar home-anim">
          <div className="bk-view">
            <SegmentBar label="보기 방식" tabs={VIEW_TABS} selected={view} onSelect={selectView} />
          </div>
          <div className="bk-seg">
            <SegmentBar label="태그 필터" tabs={TABS} selected={selected} onSelect={selectTag} />
          </div>
        </div>

        {shown.length === 0 ? (
          <p className="bk-empty">해당 태그의 도서가 없어요.</p>
        ) : view === 'grid' ? (
          // 보기 방식이 바뀔 때만 새로 그려 등장 효과가 다시 돈다 (태그가 바뀔 때는 그대로)
          <div className="bk-grid-wrap home-anim">
            <ul className="bk-grid" role="list" aria-label="추천 도서">{cards}</ul>
          </div>
        ) : (
          // 등장 효과는 바뀌지 않는 래퍼에, 진열대는 태그가 바뀔 때 새로 그려 처음 위치로 돌아간다
          <div className="bk-shelf-wrap home-anim">
            <BookShelf key={selected} label="추천 도서">{cards}</BookShelf>
          </div>
        )}
      </main>
    </div>
  );
}
