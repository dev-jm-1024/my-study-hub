import { useState } from 'react';
import { BOOKS } from '../data/menuData';
import { useScrollTopOnMount } from '../hooks/useScrollTopOnMount';

const FILTER_TAGS = ['Spring Boot', 'Java', 'Architecture', 'Testing', 'Database', 'Kafka'];

export function BooksPage() {
  useScrollTopOnMount();
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = activeTag ? BOOKS.filter(b => b.tags?.includes(activeTag)) : BOOKS;

  return (
    <div className="book-container">
      {/* 헤더 */}
      <header className="book-header home-anim">
        <div className="book-eyebrow">추천 도서</div>
        <h1 className="book-main-title">백엔드 개발자 추천 도서</h1>
        <p className="book-main-subtitle">
          실무와 학습에 도움이 되는 도서를 엄선했습니다.
        </p>
        <div className="book-meta">
          <span className="book-count">{filtered.length}권</span>
          <div className="book-tags">
            {FILTER_TAGS.map(tag => (
              <button
                key={tag}
                type="button"
                className={`book-tag${activeTag === tag ? ' active' : ''}`}
                onClick={() => setActiveTag(prev => (prev === tag ? null : tag))}
                aria-pressed={activeTag === tag}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 도서 그리드 */}
      {filtered.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', padding: '8px 4px' }}>해당 태그의 도서가 없어요.</p>
      ) : (
      <div className="book-grid">
        {filtered.map((book, idx) => (
          <div key={idx} className="book-card home-anim">
            {book.coverUrl ? (
              <div className="book-cover-wrap">
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="book-cover"
                  loading="lazy"
                  onError={e => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                    const icon = e.currentTarget.parentElement?.nextElementSibling;
                    if (icon) (icon as HTMLElement).style.display = 'flex';
                  }}
                />
              </div>
            ) : (
              <div className="book-icon">
                <i className={book.icon} />
              </div>
            )}
            <div className="book-card-body">
              <h3 className="book-title">{book.title}</h3>
              <p className="book-author">{book.author}</p>
              {book.publisher && <p className="book-publisher">{book.publisher}</p>}
              <p className="book-description">{book.description}</p>
            </div>
            <div className="book-card-footer">
              <a
                href={book.purchaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="book-btn"
              >
                교보문고 <i className="fa-solid fa-arrow-up-right-from-square" />
              </a>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
