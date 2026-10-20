import { Link } from 'react-router-dom';
import { openCommandPalette } from '../components/CommandPalette';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { NOT_FOUND_TITLE } from '../constants';

export function NotFoundPage() {
  useDocumentTitle(NOT_FOUND_TITLE);
  return (
    <main className="page-wrapper notfound">
      <div className="notfound-code">404</div>
      <h1 className="notfound-title">{NOT_FOUND_TITLE}</h1>
      <p className="notfound-sub">주소가 바뀌었거나 삭제된 자료일 수 있어요.</p>
      <div className="notfound-actions">
        <Link to="/" className="notfound-btn notfound-btn--primary">홈으로</Link>
        <button type="button" className="notfound-btn" onClick={e => openCommandPalette(e.currentTarget)}>자료 검색</button>
      </div>
    </main>
  );
}
