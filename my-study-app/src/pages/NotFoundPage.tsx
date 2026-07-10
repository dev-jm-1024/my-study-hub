import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="page-wrapper notfound">
      <div className="notfound-code">404</div>
      <h1 className="notfound-title">페이지를 찾을 수 없어요</h1>
      <p className="notfound-sub">주소가 바뀌었거나 삭제된 자료일 수 있어요.</p>
      <Link to="/" className="notfound-btn">홈으로 돌아가기</Link>
    </main>
  );
}
