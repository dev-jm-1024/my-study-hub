export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <span className="site-footer-copy">© {year} JM Study Hub · 직접 공부하고 정리한 자료</span>
        <nav className="site-footer-links" aria-label="외부 링크">
          <a href="https://velog.io/@dlwoals1024/posts" target="_blank" rel="noopener noreferrer">Velog</a>
          <a href="https://blog.naver.com/jon1024" target="_blank" rel="noopener noreferrer">네이버 블로그</a>
          <a href="https://github.com/dev-jm-1024" target="_blank" rel="noopener noreferrer">GitHub</a>
        </nav>
      </div>
    </footer>
  );
}
