import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { gsap } from 'gsap';
import { Menu } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { Sidebar } from '../components/Sidebar';
import { MENUS, MENU_DATA } from '../data/menuData';

export function DownloadPage() {
  const { category = '' } = useParams<{ category: string }>();
  const cardsRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 대소문자 혼용 처리 (data.js의 'JUnit' 키 등)
  const resolvedKey = Object.keys(MENU_DATA).find(
    k => k.toLowerCase() === category.toLowerCase()
  ) ?? category;

  const pdfs = (MENU_DATA[resolvedKey] ?? []).map(pdf => ({
    ...pdf,
    pdfUrl: pdf.pdfUrl.trim(),
  }));

  const menuInfo = MENUS.find(m => m.key.toLowerCase() === category.toLowerCase());

  useEffect(() => {
    window.scrollTo(0, 0);
    setSidebarOpen(false);
    const ctx = gsap.context(() => {
      gsap.from('.card', {
        opacity: 0,
        y: 24,
        duration: 0.4,
        stagger: 0.07,
        ease: 'power2.out',
        clearProps: 'all',
      });
    }, cardsRef);
    return () => ctx.revert();
  }, [category]);

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

        {/* 페이지 헤더 */}
        <GlassCard className="page-header">
          <div className="download-logo">
            {menuInfo && <i className={menuInfo.icon} />}
            <span className="download-logo-text">
              {menuInfo?.name ?? category}
            </span>
          </div>
          <h1 className="page-title">{menuInfo?.name ?? category} 자료실</h1>
          <p className="page-subtitle">
            {menuInfo?.group} 백엔드 개발 학습을 위한 핵심 PDF 문서 모음입니다.
          </p>
          <span className="document-count">{pdfs.length} Documents</span>
        </GlassCard>

        {/* PDF 카드 목록 */}
        <div ref={cardsRef} className="card-grid">
          {pdfs.length === 0 ? (
            <div className="no-results">
              <i className="fa-solid fa-clock fa-2x" />
              <p>준비 중인 문서입니다.</p>
            </div>
          ) : (
            pdfs.map((pdf, idx) => (
              <div key={idx} className="card">
                <div className="card-icon">
                  <i className={pdf.icon} />
                </div>
                <div className="card-title">{pdf.title}</div>
                <div className="card-description">{pdf.description}</div>
                <div className="card-footer">
                  <button
                    className="download-btn"
                    disabled={!pdf.pdfUrl}
                    onClick={() => handleDownload(pdf.pdfUrl, pdf.title)}
                  >
                    {pdf.pdfUrl ? '다운로드' : '준비 중'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
