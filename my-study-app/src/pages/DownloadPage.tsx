import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PanelLeft, ChevronRight, ChevronLeft, Eye, ArrowUpRight, Clock } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { PdfPreview } from '../components/PdfPreview';
import { SegmentBar } from '../components/SegmentBar';
import { NotFoundPage } from './NotFoundPage';
import { MENUS, MENU_DATA } from '../data/menuData';
import { DESC, badgeLabel, topicStyle } from '../data/topics';
import { NOTICES } from '../data/notices';
import { resolveCategoryKey, matchesKey } from '../utils/category';
import { triggerDownload } from '../utils/download';
import type { DocEntry } from '../utils/paginateSections';
import { withViewTransition } from '../utils/viewTransition';
import { useSectionPagination } from '../hooks/usePagination';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { NOT_FOUND_TITLE } from '../constants';
import { NewTabHint } from '../components/NewTabHint';

interface DocRowProps {
  entry: DocEntry;
  /** 제목 단계 — 묶음 이름(h2)이 있으면 그 아래 h3, 이름 없는 묶음이면 h1 바로 아래 h2 */
  heading: 'h2' | 'h3';
  onPreview: (entry: DocEntry, row: HTMLElement) => void;
}

function DocRow({ entry, heading: Heading, onPreview }: DocRowProps) {
  const { pdf, num, title } = entry;
  const rowRef = useRef<HTMLLIElement>(null);
  return (
    <li ref={rowRef} className="doc-row">
      <span className="doc-num" aria-hidden="true">{num}</span>
      <div className="doc-body">
        <div className="doc-text">
          <Heading className="doc-title">{title}</Heading>
          <p className="doc-desc">{pdf.description}</p>
        </div>
        {pdf.pdfUrl ? (
          <>
            <button
              type="button"
              className="doc-preview"
              onClick={() => rowRef.current && onPreview(entry, rowRef.current)}
              aria-label={`미리보기: ${title}`}
            >
              <Eye size={16} aria-hidden="true" />
              미리보기
            </button>
            <button
              type="button"
              className="doc-get"
              onClick={() => triggerDownload(pdf.pdfUrl, pdf.title)}
              aria-label={`PDF 받기: ${title}`}
            >
              <span className="doc-get-pill">받기</span>
            </button>
          </>
        ) : (
          <span className="doc-soon">준비 중</span>
        )}
      </div>
    </li>
  );
}

interface PreviewState {
  title: string;
  url: string;
  num: string;
  where: string;
  desc: string;
  /** 내려받을 때의 파일 이름 — 번호까지 붙은 원래 제목 */
  fileName: string;
}

export function DownloadPage() {
  const { category = '' } = useParams<{ category: string }>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  // 사용자가 탭·페이지를 바꾼 주제 — 묶음의 등장 효과는 주제에 처음 들어올 때만 돈다
  const [settledKey, setSettledKey] = useState<string | null>(null);

  // 대소문자 혼용 처리 (data.js의 'JUnit' 키 등)
  const resolvedKey = resolveCategoryKey(category);

  const pdfs = useMemo(
    () => (MENU_DATA[resolvedKey] ?? []).map(pdf => ({ ...pdf, pdfUrl: pdf.pdfUrl.trim() })),
    [resolvedKey],
  );

  const menuInfo = MENUS.find(m => matchesKey(m.key, category));
  const key = menuInfo?.key ?? category;
  const name = menuInfo?.name ?? category;
  const intro = DESC[key];
  const notice = NOTICES[resolvedKey];

  // 미리보기 시트는 연 과목의 문서다 — 뒤로 가기 등으로 과목이 바뀌면 시트를 닫는다.
  // 렌더 중에 맞춰야 한 프레임이라도 이전 과목의 시트가 새 과목 위에 남지 않는다 (잠금은 시트가 사라지며 useDrawer가 푼다)
  const [previewKey, setPreviewKey] = useState(resolvedKey);
  if (previewKey !== resolvedKey) {
    setPreviewKey(resolvedKey);
    setPreview(null);
  }
  // 없는 과목 키는 아래에서 NotFoundPage를 그리므로 그 화면의 제목과 맞춘다
  useDocumentTitle(menuInfo ? name : NOT_FOUND_TITLE);

  // 소분류 선택·페이지 상태. 주제(resolvedKey)가 바뀌면 훅이 '전체' 1페이지로 되돌린다
  const list = useSectionPagination(pdfs, resolvedKey);
  const animateGroups = settledKey !== resolvedKey;
  const selectSection = (key: string) => {
    setSettledKey(resolvedKey);
    list.select(key);
  };
  const goPage = (n: number) => {
    setSettledKey(resolvedKey);
    list.goPage(n);
  };

  // 미리보기 창은 누른 행이 펼쳐지며 열리고, 닫으면 그 행으로 다시 접힌다 (view-transition.css의 pdf-sheet)
  const sheetRow = useRef<HTMLElement | null>(null);

  const openPreview = (entry: DocEntry, row: HTMLElement) => {
    const section = entry.pdf.section?.trim();
    const next: PreviewState = {
      title: entry.title,
      url: entry.pdf.pdfUrl,
      num: entry.num,
      where: section ? `${name} · ${section}` : name,
      desc: entry.pdf.description,
      fileName: entry.pdf.title,
    };
    sheetRow.current = row;
    row.style.viewTransitionName = 'pdf-sheet';
    withViewTransition('sheet-open', () => {
      row.style.viewTransitionName = '';
      setPreview(next);
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
    setSettledKey(null);
  }, [category]);

  // 존재하지 않는 카테고리는 404 처리 (exception처럼 문서가 0건인 정식 카테고리는 menuInfo가 있으므로 통과)
  if (!menuInfo) {
    return <NotFoundPage />;
  }

  const { range } = list;

  return (
    <div className="download-layout">
      <Sidebar
        id={sidebarId}
        returnFocusRef={toggleRef}
        currentCategory={resolvedKey}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="main-content">
        {/* 주제 전환 — 서랍(≤1068px)에서만 보인다. '그룹 › 과목'이 브레드크럼과 같은 정보라 이 폭에서는 브레드크럼이 숨는다 */}
        <button
          ref={toggleRef}
          type="button"
          className="sidebar-toggle"
          aria-controls={sidebarId}
          aria-expanded={sidebarOpen}
          aria-label={`주제 전환 — 현재 ${menuInfo.group} ${name}`}
          onClick={() => setSidebarOpen(true)}
        >
          <PanelLeft size={18} strokeWidth={2} aria-hidden="true" />
          <span className="sidebar-toggle-group">{menuInfo.group}</span>
          <ChevronRight className="sidebar-toggle-chevron" size={10} strokeWidth={2.8} aria-hidden="true" />
          <span className="sidebar-toggle-name">{name}</span>
        </button>

        {/* 브레드크럼 */}
        <nav className="doc-crumb home-anim" aria-label="위치">
          <Link to="/">홈</Link>
          <ChevronRight size={10} strokeWidth={2.6} aria-hidden="true" />
          <span>{menuInfo.group}</span>
          <ChevronRight size={10} strokeWidth={2.6} aria-hidden="true" />
          <span className="doc-crumb-current" aria-current="page">{name}</span>
        </nav>

        {/* 페이지 헤더 — 배지·제목·문서 수가 홈에서 이어지는 전환의 도착점 (view-transition.css) */}
        <header className="dl-head home-anim">
          <div className="dl-head-badge" style={topicStyle(key)} aria-hidden="true">{badgeLabel(key, name)}</div>
          <div className="dl-head-text">
            <p className="dl-eyebrow">{menuInfo.group}</p>
            <h1 className="dl-title">{name}</h1>
          </div>
          <p className="dl-count">
            <span className="dl-count-num">{pdfs.length}</span>
            <span className="dl-count-unit">개 문서</span>
          </p>
        </header>
        {intro && <p className="doc-intro home-anim">{intro}</p>}

        {/* 카테고리 공지 */}
        {notice && (
          <aside className="doc-notice home-anim" aria-label={notice.title ?? '공지'}>
            <span className="doc-notice-icon" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 11v6" />
                <path d="M12 7.5h.01" />
              </svg>
            </span>
            <div className="doc-notice-body">
              <p className="doc-notice-label">{notice.title ?? '공지'}</p>
              <p className="doc-notice-text">{notice.body}</p>
              {notice.link && (
                <a
                  className="doc-notice-link"
                  href={notice.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {notice.link.label}
                  <ArrowUpRight size={10} strokeWidth={2.4} aria-hidden="true" />
                  <NewTabHint />
                </a>
              )}
            </div>
          </aside>
        )}

        {/* 목록 영역 — 페이지를 넘기면 이 위쪽(세그먼트 자리)으로 스크롤한다 (usePagination의 listRef) */}
        <div className="doc-list-area" ref={list.listRef}>
          {/* 소분류 세그먼트 — 이름 있는 소분류가 둘 이상일 때만 */}
          {list.tabs.length > 0 && (
            <SegmentBar key={resolvedKey} label="소분류 필터" tabs={list.tabs} selected={list.selected} onSelect={selectSection} />
          )}

          {/* PDF 리스트 */}
          {pdfs.length === 0 ? (
            <div className="doc-empty">
              <Clock size={22} aria-hidden="true" />
              <p>준비 중인 문서입니다.</p>
            </div>
          ) : (
            list.groups.map(g => (
              // 주제가 바뀌면 묶음을 새로 그려 등장 효과가 돌고, 같은 주제 안의 탭·페이지 이동은 즉시 바뀐다
              <div key={`${resolvedKey}|${g.name}`} className={`doc-group${animateGroups ? ' home-anim' : ''}`}>
                {g.name && (
                  <div className="doc-group-head">
                    <h2 className="doc-group-title">{g.name}</h2>
                    <span className="doc-group-count">{g.count}개</span>
                    {g.cont && <span className="doc-group-cont">· 앞 페이지에서 이어짐</span>}
                  </div>
                )}
                <ul className="doc-card">
                  {g.docs.map(d => (
                    <DocRow key={d.index} entry={d} heading={g.name ? 'h3' : 'h2'} onPreview={openPreview} />
                  ))}
                </ul>
              </div>
            ))
          )}

          {/* 페이지 이동 — 문서가 한 페이지를 넘을 때만 */}
          {list.pageCount > 1 && (
            <nav className="doc-pager" aria-label="페이지">
              <p className="doc-pager-range">{range.start}–{range.end} / {range.total}개</p>
              <div className="doc-pager-btns">
                <button
                  type="button"
                  className="doc-pager-btn"
                  aria-label="이전 페이지"
                  aria-disabled={list.page === 1 || undefined}
                  onClick={() => goPage(list.page - 1)}
                >
                  <span className="doc-pager-disc doc-pager-arrow">
                    <ChevronLeft size={14} strokeWidth={2.6} aria-hidden="true" />
                  </span>
                </button>
                {Array.from({ length: list.pageCount }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    type="button"
                    className="doc-pager-btn"
                    aria-label={`${n}페이지`}
                    aria-current={n === list.page ? 'page' : undefined}
                    onClick={() => goPage(n)}
                  >
                    <span className="doc-pager-disc doc-pager-num">{n}</span>
                  </button>
                ))}
                <button
                  type="button"
                  className="doc-pager-btn"
                  aria-label="다음 페이지"
                  aria-disabled={list.page === list.pageCount || undefined}
                  onClick={() => goPage(list.page + 1)}
                >
                  <span className="doc-pager-disc doc-pager-arrow">
                    <ChevronRight size={14} strokeWidth={2.6} aria-hidden="true" />
                  </span>
                </button>
              </div>
            </nav>
          )}
        </div>
      </main>

      {preview && (
        <PdfPreview
          title={preview.title}
          url={preview.url}
          num={preview.num}
          where={preview.where}
          desc={preview.desc}
          onClose={closePreview}
          onDownload={() => triggerDownload(preview.url, preview.fileName)}
        />
      )}
    </div>
  );
}
