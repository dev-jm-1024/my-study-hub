import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { BOOKS } from '../data/menuData';

export function BooksPage() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const ctx = gsap.context(() => {
      gsap.from('.book-card', {
        opacity: 0,
        y: 24,
        duration: 0.45,
        stagger: 0.07,
        ease: 'power2.out',
        clearProps: 'all',
      });
    }, gridRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="book-container">
      {/* 헤더 */}
      <div className="book-header">
        <div className="book-logo">
          <div className="book-logo-icon">
            <i className="fa-solid fa-book-open" />
          </div>
          <span className="book-logo-text">추천 도서</span>
        </div>
        <h1 className="book-main-title">백엔드 개발자 추천 도서</h1>
        <p className="book-main-subtitle">
          실무와 학습에 도움이 되는 도서를 엄선했습니다.
        </p>
        <span className="book-count">{BOOKS.length} Books</span>
        <div className="book-tags">
          <span className="book-tag">Spring Boot</span>
          <span className="book-tag">Java</span>
          <span className="book-tag">Architecture</span>
          <span className="book-tag">Testing</span>
          <span className="book-tag">Database</span>
          <span className="book-tag">Kafka</span>
        </div>
      </div>

      {/* 도서 그리드 */}
      <div ref={gridRef} className="book-grid">
        {BOOKS.map((book, idx) => (
          <div key={idx} className="book-card">
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
    </div>
  );
}
