import { useEffect, useId, useRef, type RefObject } from 'react';
import { X } from 'lucide-react';

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

const FOCUSABLE = 'a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';

/**
 * 모달 공통 동작을 한 덩어리로: Esc로 닫기 · 화면 스크롤 잠금 · 열릴 때 initialFocus로 포커스 ·
 * Tab이 panel 안에서만 돌기(iframe은 정지점 하나) · 닫힐 때 열기 전 포커스 복귀.
 * 마운트 한 번에 설치한다 — 부모가 리렌더해 onClose 모양이 바뀌어도 포커스를 다시 뺏지 않는다.
 * Ch7 useDrawer와 겹치면 이 훅을 공용으로 뽑는다.
 */
function useDialogBehavior(
  panel: RefObject<HTMLElement | null>,
  initialFocus: RefObject<HTMLElement | null>,
  onClose: () => void,
) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const root = panel.current;
    if (!root) return;

    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const html = document.documentElement;
    // html에 overflow-x: clip(base.css)이 걸려 있어 body의 overflow가 화면 스크롤로 전파되지 않는다 → html도 잠근다
    html.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    initialFocus.current?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = root.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      // 안쪽 이동은 브라우저에 맡기고, 가장자리·바깥에서 시작할 때만 안으로 되돌린다
      if (!root.contains(active)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
      html.style.overflow = '';
      document.body.style.overflow = '';
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [panel, initialFocus]);
}

export function PdfPreview({ title, url, onClose, onDownload, num, where, desc }: PdfPreviewProps) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  useDialogBehavior(panelRef, closeRef, onClose);

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
