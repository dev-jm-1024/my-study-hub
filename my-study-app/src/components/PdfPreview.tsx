import { useId, useRef } from 'react';
import { X } from 'lucide-react';
import { useDrawer } from '../hooks/useDrawer';

export interface PdfPreviewProps {
  title: string;
  url: string;
  onClose: () => void;
  onDownload: () => void;
  /** 머리의 번호 칸 ("1", "1-1"). 없으면 칸을 그리지 않는다 */
  num?: string;
  /** 제목 위 위치 줄 ("Java · Modern Java"). 없으면 줄을 그리지 않는다 */
  where?: string;
  /** 발의 설명 문장. 없으면 힌트만 남는다 */
  desc?: string;
}

/**
 * raw.githubusercontent / github.com/raw 는 PDF를 다운로드(octet-stream)로 내려주므로
 * iframe 인라인 렌더가 안 됨. jsDelivr CDN 은 같은 파일을 application/pdf 로 내려줘
 * 브라우저 내장 뷰어로 인라인 표시됨 → GitHub URL을 jsDelivr로 변환.
 */
export function toEmbeddable(url: string): string {
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

export function PdfPreview({ title, url, onClose, onDownload, num, where, desc }: PdfPreviewProps) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  // Esc로 닫기 · 화면 스크롤 잠금 · 닫기 버튼으로 포커스 · Tab은 패널 안에서만(iframe은 정지점 하나) · 닫히면 연 행으로 포커스 복귀
  useDrawer({ open: true, onClose, panelRef, initialFocusRef: closeRef });

  const embedUrl = toEmbeddable(url);

  return (
    <div
      className="pdfp-overlay"
      onMouseDown={e => {
        e.preventDefault(); // 바깥을 눌러 닫을 때 기본 동작이 포커스를 body로 빼앗지 않게
        onClose();
      }}
    >
      <div
        ref={panelRef}
        className="pdfp-panel"
        onMouseDown={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={desc ? descId : undefined}
      >
        <div className="pdfp-head">
          {num && <span className="pdfp-num" aria-hidden="true">{num}</span>}
          <div className="pdfp-heading">
            {where && <p className="pdfp-where">{where}</p>}
            <h2 className="pdfp-title" id={titleId}>{title}</h2>
          </div>
          <button ref={closeRef} type="button" className="pdfp-close" onClick={onClose} aria-label="닫기">
            <X size={16} strokeWidth={2.6} />
          </button>
        </div>
        <div className="pdfp-body">
          <iframe className="pdfp-frame" src={embedUrl} title={`${title} 미리보기`} />
        </div>
        <div className="pdfp-foot">
          <div className="pdfp-note">
            {desc && <p className="pdfp-desc" id={descId}>{desc}</p>}
            <p className="pdfp-hint">미리보기가 표시되지 않으면 ‘새 탭에서 열기’로 열어 주세요.</p>
          </div>
          <div className="pdfp-actions">
            <a className="pdfp-pill" href={url} target="_blank" rel="noopener noreferrer">
              새 탭에서 열기
            </a>
            <button type="button" className="pdfp-pill pdfp-pill--primary" onClick={onDownload}>
              다운로드
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
