import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Menu, FileText, Download, Clock, ChevronRight, ChevronLeft, Eye } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { PdfPreview } from '../components/PdfPreview';
import { MENUS, MENU_DATA } from '../data/menuData';
import { badgeLabel, tintClass, DOWNLOAD_PAGE_SIZE } from '../data/topics';

export function DownloadPage() {
  const { category = '' } = useParams<{ category: string }>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [preview, setPreview] = useState<{ title: string; url: string } | null>(null);
  const [page, setPage] = useState(1);

  // 대소문자 혼용 처리 (data.js의 'JUnit' 키 등)
  const resolvedKey = Object.keys(MENU_DATA).find(
    k => k.toLowerCase() === category.toLowerCase()
  ) ?? category;

  const pdfs = (MENU_DATA[resolvedKey] ?? []).map(pdf => ({
    ...pdf,
    pdfUrl: pdf.pdfUrl.trim(),
  }));

  const menuInfo = MENUS.find(m => m.key.toLowerCase() === category.toLowerCase());
  const key = menuInfo?.key ?? category;
  const name = menuInfo?.name ?? category;
  const tint = tintClass(key);

  useEffect(() => {
    window.scrollTo(0, 0);
    setSidebarOpen(false);
    setPage(1);
  }, [category]);

  const totalPages = Math.ceil(pdfs.length / DOWNLOAD_PAGE_SIZE);
  const pagePdfs = pdfs.slice((page - 1) * DOWNLOAD_PAGE_SIZE, page * DOWNLOAD_PAGE_SIZE);

  const goPage = (n: number) => {
    setPage(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDownload = (pdfUrl: string, title: string) => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    if (!pdfUrl.startsWith('http')) {
      a.download = `${title}.pdf`;
    }
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="download-layout">
      <Sidebar
        currentCategory={resolvedKey}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="main-content">
        {/* 모바일 사이드바 토글 */}
        <button
          className="sidebar-mobile-toggle"
          onClick={() => setSidebarOpen(prev => !prev)}
        >
          <Menu size={16} />
          카테고리 메뉴
        </button>

        {/* 브레드크럼 */}
        <nav className="dl-crumb home-anim" aria-label="위치">
          <Link to="/">홈</Link>
          <ChevronRight size={13} />
          <span>{menuInfo?.group ?? '자료실'}</span>
          <ChevronRight size={13} />
          <span className="dl-crumb-current">{name}</span>
        </nav>

        {/* 페이지 헤더 */}
        <header className="dl-head home-anim">
          <div className={`dl-head-badge ${tint}`}>{badgeLabel(key, name)}</div>
          <div className="dl-head-text">
            <h1 className="dl-title">{name} 자료실</h1>
          </div>
          <span className="dl-count">{pdfs.length}개 문서</span>
        </header>

        {/* PDF 리스트 */}
        {pdfs.length === 0 ? (
          <div className="dl-empty">
            <Clock size={22} />
            <p>준비 중인 문서입니다.</p>
          </div>
        ) : (
          <>
          <div className="dl-list">
            {pagePdfs.map((pdf, idx) => (
              <div key={(page - 1) * DOWNLOAD_PAGE_SIZE + idx} className={`dl-row home-anim ${tint}`}>
                <div className="dl-badge"><FileText size={18} /></div>
                <div className="dl-main">
                  <div className="dl-row-title">{pdf.title}</div>
                  <div className="dl-row-desc">{pdf.description}</div>
                </div>
                <div className="dl-actions">
                  {pdf.pdfUrl && (
                    <button
                      className="dl-preview"
                      onClick={() => setPreview({ title: pdf.title, url: pdf.pdfUrl })}
                      aria-label="미리보기"
                      title="미리보기"
                    >
                      <Eye size={17} />
                    </button>
                  )}
                  <button
                    className="dl-btn"
                    disabled={!pdf.pdfUrl}
                    onClick={() => handleDownload(pdf.pdfUrl, pdf.title)}
                  >
                    {pdf.pdfUrl ? (
                      <>
                        <Download size={15} />
                        <span>다운로드</span>
                      </>
                    ) : (
                      '준비 중'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="dl-pager" aria-label="페이지">
              <button
                className="dl-pager-btn"
                disabled={page === 1}
                onClick={() => goPage(page - 1)}
                aria-label="이전 페이지"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  className={`dl-pager-num${n === page ? ' active' : ''}`}
                  onClick={() => goPage(n)}
                  aria-current={n === page ? 'page' : undefined}
                >
                  {n}
                </button>
              ))}
              <button
                className="dl-pager-btn"
                disabled={page === totalPages}
                onClick={() => goPage(page + 1)}
                aria-label="다음 페이지"
              >
                <ChevronRight size={16} />
              </button>
            </nav>
          )}
          </>
        )}
      </div>

      {preview && (
        <PdfPreview
          title={preview.title}
          url={preview.url}
          onClose={() => setPreview(null)}
          onDownload={() => handleDownload(preview.url, preview.title)}
        />
      )}
    </div>
  );
}
