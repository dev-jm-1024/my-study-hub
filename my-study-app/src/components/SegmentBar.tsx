import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

interface SegmentTab {
  key: string;
  label: string;
  /** 없으면 숫자 칸을 그리지 않는다 */
  count?: number;
  /** 글자 앞에 그리는 아이콘(장식). 글자 없이 아이콘만 쓰면 label을 비우고 ariaLabel을 준다 */
  icon?: ReactNode;
  /** 접근 이름·툴팁 — 아이콘만 있는 칸에 필요하다 */
  ariaLabel?: string;
}

interface SegmentBarProps {
  tabs: SegmentTab[];
  selected: string;
  onSelect: (key: string) => void;
  /** role=group의 aria-label */
  label: string;
}

/* 세그먼트 필터. 가로로 넘칠 때만 가장자리를 흐리게 — 스크롤 위치에 따라 오른쪽(더 있음)·왼쪽(가려짐) 페이드가 켜진다.
   페이드는 CSS 마스크(segment.css)이고, 여기서는 data-fade-start/end 속성만 갱신한다.
   탭 목록이 통째로 바뀌는 화면(자료실 주제 전환)은 부모가 key로 새로 그려 스크롤 위치가 처음으로 돌아간다 */
export function SegmentBar({ tabs, selected, onSelect, label }: SegmentBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const segRef = useRef<HTMLDivElement>(null);
  const [fade, setFade] = useState({ start: false, end: false });
  // 선택 알약의 transition은 처음 자리를 잡은 다음 프레임부터 — 처음 그릴 때 0에서 미끄러져 나오지 않게
  const [ready, setReady] = useState(false);
  const firstSelect = useRef(true);

  // 선택된 칸의 위치·폭을 알약에 넘긴다 (CSS 변수 — 움직임은 segment.css의 transition이 맡는다).
  // 둘 다 바(.seg) 기준 상대값이라 가로 스크롤 중에도 안 변하고, 소수 픽셀까지 맞는다
  const placeThumb = useCallback(() => {
    const seg = segRef.current;
    if (!seg) return;
    const btn = seg.querySelector<HTMLElement>('.seg-btn[aria-pressed="true"]');
    const s = seg.getBoundingClientRect();
    const b = btn?.getBoundingClientRect();
    seg.style.setProperty('--thumb-x', `${b ? b.left - s.left : 0}px`);
    seg.style.setProperty('--thumb-w', `${b ? b.width : 0}px`);
  }, []);

  // 선택·탭 목록이 바뀐 렌더 직후 (페인트 전이라 한 프레임도 어긋나 보이지 않는다)
  useLayoutEffect(placeThumb);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // 선택한 칸이 바 가장자리(페이드 폭 안)에 걸리거나 가려져 있으면 바도 같이 부드럽게 밀어 준다.
  // 처음 그릴 때와 동작 줄이기에서는 움직임 없이 맞춘다
  useEffect(() => {
    const el = scrollRef.current;
    const btn = segRef.current?.querySelector<HTMLElement>('.seg-btn[aria-pressed="true"]');
    if (!el || !btn) return;
    const pad = parseFloat(getComputedStyle(el).scrollPaddingLeft) || 0;
    const bar = el.getBoundingClientRect();
    const b = btn.getBoundingClientRect();
    const delta = b.left < bar.left + pad ? b.left - (bar.left + pad)
      : b.right > bar.right - pad ? b.right - (bar.right - pad)
      : 0;
    if (delta) {
      const still = firstSelect.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollBy({ left: delta, behavior: still ? 'auto' : 'smooth' });
    }
    firstSelect.current = false;
  }, [selected]);

  const measure = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    // 소수 픽셀 오차로 끝에서도 페이드가 남지 않게 1px 여유를 둔다
    const start = el.scrollLeft > 1;
    const end = el.scrollLeft < el.scrollWidth - el.clientWidth - 1;
    setFade(f => (f.start === start && f.end === end ? f : { start, end }));
  }, []);

  // 처음 그릴 때 페이드 없이 한 프레임 보이지 않게 레이아웃 직후에 잰다
  useLayoutEffect(measure, [measure]);

  // 창 크기·글꼴 로딩·선택(굵기) 변화로 바 폭이 달라지면 다시 잰다
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // 폭이 달라지면(글꼴 로딩·창 크기) 페이드와 알약 자리를 함께 다시 맞춘다
    const ro = new ResizeObserver(() => { measure(); placeThumb(); });
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => ro.disconnect();
  }, [measure, placeThumb]);

  // 키보드로 포커스가 옮겨 온 칸이 페이드 영역(scroll-padding = 페이드 폭)에 걸리지 않게 바를 밀어 준다.
  // 브라우저는 일부만 보이는 칸이면 스크롤하지 않는 경우가 있어 직접 계산한다. 마우스 클릭은 누르는 순간 칸이 움직이지 않도록 제외
  const revealFocused = (e: React.FocusEvent<HTMLElement>) => {
    const el = scrollRef.current;
    if (!el || !e.target.matches(':focus-visible')) return;
    const pad = parseFloat(getComputedStyle(el).scrollPaddingLeft) || 0;
    const bar = el.getBoundingClientRect();
    const btn = e.target.getBoundingClientRect();
    if (btn.left < bar.left + pad) el.scrollLeft -= bar.left + pad - btn.left;
    else if (btn.right > bar.right - pad) el.scrollLeft += btn.right - (bar.right - pad);
  };

  return (
    <div
      ref={scrollRef}
      className="seg-scroll"
      data-fade-start={fade.start || undefined}
      data-fade-end={fade.end || undefined}
      onScroll={measure}
      onFocus={revealFocused}
    >
      <div ref={segRef} className="seg" role="group" aria-label={label} data-ready={ready || undefined}>
        <span className="seg-thumb" aria-hidden="true" />
        {tabs.map(t => (
          <button
            key={t.key}
            type="button"
            className="seg-btn"
            aria-pressed={t.key === selected}
            aria-label={t.ariaLabel}
            title={t.ariaLabel}
            onClick={() => onSelect(t.key)}
          >
            {t.icon}
            {t.label}
            {t.count !== undefined && (
              <>
                {/* 보이는 모양은 그대로(flex 안 공백은 그려지지 않는다), 접근 이름만 'Java 5'로 읽힌다 */}
                {' '}
                <span className="seg-count">{t.count}</span>
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
