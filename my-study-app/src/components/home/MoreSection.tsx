import { Link } from 'react-router-dom';
import { ArrowUpRight, ChevronRight, GitBranch } from 'lucide-react';
import { HOME_MORE_PREVIEW_COUNT, LINKS } from '../../constants';
import { BOOKS } from '../../data/books';
import { REPO_DATA } from '../../data/repos';
import { recentBooks } from '../../utils/home';
import { NewTabHint } from '../NewTabHint';

/** 홈 맨 아래 '함께 보면 좋은 것들.' — 책 타일 + GitHub 타일. 행은 보여 주기만 하고, 이동은 타일 맨 아래 링크 하나가 맡는다 */
export function MoreSection() {
  const books = recentBooks();
  const repos = REPO_DATA.slice(0, HOME_MORE_PREVIEW_COUNT);

  if (books.length === 0 && repos.length === 0) return null;

  return (
    <section id="more" className="home-block" aria-labelledby="more-h">
      <div className="home-block-head">
        <h2 className="home-block-title" id="more-h">함께 보면 좋은 것들.</h2>
      </div>

      <div className="more-grid">
        {books.length > 0 && (
          <article className="more-tile">
            <div>
              <p className="more-eyebrow">Books</p>
              <h3 className="more-name">읽은 책 {BOOKS.length}권.</h3>
              <p className="more-desc">공부하면서 곁에 둔 책을 짧게 정리했습니다.</p>
            </div>
            <ul className="more-list">
              {books.map(book => (
                <li key={book.title} className="more-row">
                  <img className="more-cover" src={book.coverUrl} alt="" loading="lazy" />
                  <span className="more-row-text">
                    <span className="more-row-title">{book.title}</span>
                    {/* 태그가 없는 책은 저자로 둘째 줄을 채운다 — 세 행 높이를 같게 */}
                    {(book.tags?.[0] || book.author) && (
                      <span className="more-row-sub">{book.tags?.[0] || book.author}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <Link className="more-link" to="/books">
              모든 책 보기
              <ChevronRight size={14} strokeWidth={2.4} aria-hidden="true" />
            </Link>
          </article>
        )}

        {repos.length > 0 && (
          <article className="more-tile">
            <div>
              <p className="more-eyebrow">GitHub</p>
              <h3 className="more-name">실습 레포 {REPO_DATA.length}개.</h3>
              <p className="more-desc">문서로 정리한 내용을 직접 돌려본 코드입니다.</p>
            </div>
            <ul className="more-list">
              {repos.map(repo => (
                <li key={repo.repoUrl} className="more-row">
                  <span className="more-icon" aria-hidden="true">
                    <GitBranch size={16} />
                  </span>
                  <span className="more-row-text">
                    <span className="more-row-title more-row-title--mono">{repo.title}</span>
                    <span className="more-row-sub">{repo.description}</span>
                  </span>
                </li>
              ))}
            </ul>
            <a className="more-link" href={LINKS.github} target="_blank" rel="noopener noreferrer">
              GitHub에서 보기
              <ArrowUpRight size={14} strokeWidth={2.4} aria-hidden="true" />
              <NewTabHint />
            </a>
          </article>
        )}
      </div>
    </section>
  );
}
