import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

interface SegmentTab {
  key: string;
  label: string;
  /** 없으면 숫자 칸을 그리지 않는다 */
  count?: number;
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
  const [fade, setFade] = useState({ start: false, end: false });

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
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => ro.disconnect();
  }, [measure]);

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
      <div className="seg" role="group" aria-label={label}>
        {tabs.map(t => (
          <button
            key={t.key}
            type="button"
            className="seg-btn"
            aria-pressed={t.key === selected}
            onClick={() => onSelect(t.key)}
          >
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
