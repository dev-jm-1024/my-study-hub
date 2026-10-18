import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Menu, Download, Clock, ChevronRight, ChevronLeft, Eye, Megaphone, ExternalLink } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { PdfPreview } from '../components/PdfPreview';
import { NotFoundPage } from './NotFoundPage';
import { MENUS, MENU_DATA } from '../data/menuData';
import { badgeLabel, tintClass, DOWNLOAD_PAGE_SIZE } from '../data/topics';
import { NOTICES } from '../data/notices';
import { resolveCategoryKey, matchesKey } from '../utils/category';
import { triggerDownload } from '../utils/download';
import { withViewTransition } from '../utils/viewTransition';
import { usePagination } from '../hooks/usePagination';
import type { PdfItem } from '../types';

/* section 필드가 하나라도 있으면 소제목별로 묶는다(첫 등장 순서 유지). 없으면 null → 기존 페이징 목록 */
function groupBySection(items: PdfItem[]) {
  if (!items.some(p => p.section)) return null;
  const groups = new Map<string, PdfItem[]>();
  for (const p of items) {
    const name = p.section ?? '기타';
    groups.set(name, [...(groups.get(name) ?? []), p]);
  }
  return [...groups].map(([name, items]) => ({ name, items }));
}

interface DocRowProps {
  pdf: PdfItem;
  num: number;
  tint: string;
  onPreview: (pdf: PdfItem, row: HTMLElement) => void;
}

function DocRow({ pdf, num, tint, onPreview }: DocRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={rowRef} className={`dl-row home-anim ${tint}`}>
      <div className="dl-badge dl-badge-num">{num}</div>
      <div className="dl-main">
        <div className="dl-row-title">{pdf.title}</div>
        <div className="dl-row-desc">{pdf.description}</div>
      </div>
      <div className="dl-actions">
        {pdf.pdfUrl && (
          <button
            className="dl-preview"
            onClick={() => rowRef.current && onPreview(pdf, rowRef.current)}
            aria-label="미리보기"
            title="미리보기"
          >
            <Eye size={17} />
          </button>
        )}
        <button
          className="dl-btn"
          disabled={!pdf.pdfUrl}
          onClick={() => triggerDownload(pdf.pdfUrl, pdf.title)}
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
  );
}

export function DownloadPage() {
  const { category = '' } = useParams<{ category: string }>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [preview, setPreview] = useState<{ title: string; url: string } | null>(null);

  // 대소문자 혼용 처리 (data.js의 'JUnit' 키 등)
  const resolvedKey = resolveCategoryKey(category);

  const pdfs = (MENU_DATA[resolvedKey] ?? []).map(pdf => ({
    ...pdf,
    pdfUrl: pdf.pdfUrl.trim(),
  }));

  const menuInfo = MENUS.find(m => matchesKey(m.key, category));
  const key = menuInfo?.key ?? category;
  const name = menuInfo?.name ?? category;
  const tint = tintClass(key);
  const notice = NOTICES[resolvedKey];

  const { page, setPage, totalPages, pageItems: pagePdfs, goPage } = usePagination(pdfs, DOWNLOAD_PAGE_SIZE);
  const sections = groupBySection(pdfs);

  // 소분류 안에서는 제목에 시리즈명이 빠져 있으므로 미리보기 헤더에 소분류를 붙여 맥락을 유지
  const nextPreview = (pdf: PdfItem) =>
    ({ title: pdf.section ? `${pdf.section} · ${pdf.title}` : pdf.title, url: pdf.pdfUrl });

  // 미리보기 창은 누른 행이 펼쳐지며 열리고, 닫으면 그 행으로 다시 접힌다 (view-transition.css의 pdf-sheet)
  const sheetRow = useRef<HTMLElement | null>(null);

  const openPreview = (pdf: PdfItem, row: HTMLElement) => {
    sheetRow.current = row;
    row.style.viewTransitionName = 'pdf-sheet';
    withViewTransition('sheet-open', () => {
      row.style.viewTransitionName = '';
      setPreview(nextPreview(pdf));
    });
  };

  const closePreview = () => {
    const row = sheetRow.current;
    withViewTransition('sheet-close', () => {
      setPreview(null);
      if (row) row.style.viewTransitionName = 'pdf-sheet';
    }).then(() => {
      if (row) row.style.viewTransitionName = '';
    });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    setSidebarOpen(false);
    setPage(1);
  }, [category]);

  // 존재하지 않는 카테고리는 404 처리 (exception처럼 문서가 0건인 정식 카테고리는 menuInfo가 있으므로 통과)
  if (!menuInfo) {
    return <NotFoundPage />;
  }

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

        {/* 카테고리 공지 */}
        {notice && (
          <aside className={`dl-notice home-anim ${tint}`} aria-label={notice.title ?? '공지'}>
            <span className="dl-notice-icon" aria-hidden="true">
              <Megaphone size={15} />
            </span>
            <div className="dl-notice-body">
              <span className="dl-notice-label">{notice.title ?? '공지'}</span>
              <p className="dl-notice-text">{notice.body}</p>
              {notice.link && (
                <a
                  className="dl-notice-link"
                  href={notice.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {notice.link.label}
                  <ExternalLink size={13} />
                </a>
              )}
            </div>
          </aside>
        )}

        {/* PDF 리스트 */}
        {pdfs.length === 0 ? (
          <div className="dl-empty">
            <Clock size={22} />
            <p>준비 중인 문서입니다.</p>
          </div>
        ) : sections ? (
          /* 소분류가 있으면 소제목별로 묶고 페이징 없이 전부 노출 */
          sections.map(({ name: sectionName, items }) => (
            <section key={sectionName} className="dl-section">
              <div className="dl-section-head home-anim">
                <h2 className="dl-section-title">{sectionName}</h2>
                <span className="dl-section-count">{items.length}</span>
              </div>
              <div className="dl-list">
                {items.map((pdf, idx) => (
                  <DocRow key={idx} pdf={pdf} num={idx + 1} tint={tint} onPreview={openPreview} />
                ))}
              </div>
            </section>
          ))
        ) : (
          <>
          <div className="dl-list">
            {pagePdfs.map((pdf, idx) => (
              <DocRow
                key={(page - 1) * DOWNLOAD_PAGE_SIZE + idx}
                pdf={pdf}
                num={(page - 1) * DOWNLOAD_PAGE_SIZE + idx + 1}
                tint={tint}
                onPreview={openPreview}
              />
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
          onClose={closePreview}
          onDownload={() => triggerDownload(preview.url, preview.title)}
        />
      )}
    </div>
  );
}
