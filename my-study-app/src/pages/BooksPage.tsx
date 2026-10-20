import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import { SegmentBar } from '../components/SegmentBar';
import { BOOKS, BOOK_FILTER_TAGS } from '../data/books';
import { useScrollTopOnMount } from '../hooks/useScrollTopOnMount';
import { useScrollTopOnPush } from '../hooks/useScrollTopOnPush';
import type { BookItem } from '../types';

const STORE_LABELS: [domain: string, label: string][] = [
  ['kyobobook.co.kr', '교보문고'],
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

function BookCard({ book }: { book: BookItem }) {
  const store = storeLabel(book.purchaseUrl);
  return (
    <li className="bk-card">
      <BookCover coverUrl={book.coverUrl} />
      <div className="bk-body">
        <h2 className="bk-title">{book.title}</h2>
        <p className="bk-author">{book.publisher ? `${book.author} · ${book.publisher}` : book.author}</p>
        <p className="bk-desc">{book.description}</p>
      </div>
      <a
        className="bk-buy"
        href={book.purchaseUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${book.title} — ${store} (새 탭)`}
      >
        <span className="bk-buy-pill">
          {store}
          <ArrowUpRight size={14} strokeWidth={2.4} aria-hidden="true" />
        </span>
      </a>
    </li>
  );
}

export function BooksPage() {
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

  const shown = selected === ALL ? RECENT_FIRST : RECENT_FIRST.filter(b => b.tags?.includes(selected));

  return (
    <main className="page-wrapper">
      {/* 페이지 헤더 — 숫자는 필터와 무관한 전체 권수 */}
      <header className="dl-head home-anim">
        <div className="dl-head-badge dl-head-badge--mono" aria-hidden="true">
          <BookOpen size={22} />
        </div>
        <div className="dl-head-text">
          <p className="dl-eyebrow">Books</p>
          <h1 className="dl-title">백엔드 개발자 추천 도서</h1>
        </div>
        <p className="dl-count">
          <span className="dl-count-num">{BOOKS.length}</span>
          <span className="dl-count-unit">권</span>
        </p>
      </header>
      <p className="page-intro home-anim">실무와 학습에 도움이 되는 도서를 엄선했습니다.</p>

      {/* 필터를 바꿔도 등장 효과가 다시 돌지 않게 .home-anim은 래퍼에만 둔다 */}
      <div className="bk-seg home-anim">
        <SegmentBar label="태그 필터" tabs={TABS} selected={selected} onSelect={selectTag} />
      </div>

      {shown.length === 0 ? (
        <p className="bk-empty">해당 태그의 도서가 없어요.</p>
      ) : (
        <ul className="bk-grid home-anim" role="list">
          {shown.map(book => (
            <BookCard key={book.title} book={book} />
          ))}
        </ul>
      )}
    </main>
  );
}
