import { useEffect } from 'react';
import { X, ExternalLink, Download } from 'lucide-react';

interface PdfPreviewProps {
  title: string;
  url: string;
  onClose: () => void;
  onDownload: () => void;
}

/**
 * raw.githubusercontent / github.com/raw 는 PDF를 다운로드(octet-stream)로 내려주므로
 * iframe 인라인 렌더가 안 됨. jsDelivr CDN 은 같은 파일을 application/pdf 로 내려줘
 * 브라우저 내장 뷰어로 인라인 표시됨 → GitHub URL을 jsDelivr로 변환.
 */
function toEmbeddable(url: string): string {
  try {
    const u = new URL(url);
    const seg = u.pathname.replace(/^\//, '').split('/');
    if (u.hostname === 'raw.githubusercontent.com') {
      const [owner, repo, branch, ...rest] = seg;
      if (owner && repo && branch && rest.length) {
        return `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch}/${rest.join('/')}`;
      }
    }
    if (u.hostname === 'github.com' && seg[2] === 'raw') {
      const [owner, repo, , branch, ...rest] = seg;
      if (owner && repo && branch && rest.length) {
        return `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch}/${rest.join('/')}`;
      }
    }
    return url;
  } catch {
    return url;
  }
}

export function PdfPreview({ title, url, onClose, onDownload }: PdfPreviewProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const embedUrl = toEmbeddable(url);

  return (
    <div className="pdfp-overlay" onMouseDown={onClose}>
      <div
        className="pdfp-panel"
        onMouseDown={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`${title} 미리보기`}
      >
        <div className="pdfp-head">
          <span className="pdfp-title">{title}</span>
          <div className="pdfp-actions">
            <a className="pdfp-btn" href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={15} />
              <span>새 탭</span>
            </a>
            <button className="pdfp-btn" onClick={onDownload}>
              <Download size={15} />
              <span>다운로드</span>
            </button>
            <button className="pdfp-close" onClick={onClose} aria-label="닫기">
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="pdfp-body">
          <iframe className="pdfp-frame" src={embedUrl} title={`${title} 미리보기`} />
        </div>
        <div className="pdfp-hint">미리보기가 표시되지 않으면 ‘새 탭’으로 열어 주세요.</div>
      </div>
    </div>
  );
}
