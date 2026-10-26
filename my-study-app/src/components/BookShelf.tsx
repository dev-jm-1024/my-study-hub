import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BookShelfProps {
  /** 카드(<li className="bk-card">)들 */
  children: ReactNode;
  /** 진열대 영역의 접근 이름 */
  label: string;
}

/* 가로 진열대 (Apple iPhone '라인업 살펴보기' 방식). 카드 줄이 화면 끝까지 흘러 다음 카드가 잘려 보이고,
   스크롤 스냅으로 카드 단위로 멈추며, 오른쪽 아래의 이전·다음 버튼은 한 화면만큼 넘긴다.
   레이아웃(풀블리드 · 스냅 · 인셋)은 books.css가 맡고, 여기서는 양 끝에 닿았는지만 재서 버튼 상태를 정한다.
   카드 목록이 통째로 바뀌는 화면(태그 전환)은 부모가 key로 새로 그려 스크롤 위치가 처음으로 돌아간다 */
export function BookShelf({ children, label }: BookShelfProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: true });

  const measure = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    // 소수 픽셀 오차로 끝에서도 버튼이 살아 있지 않게 1px 여유를 둔다
    const start = el.scrollLeft <= 1;
    const end = el.scrollLeft >= el.scrollWidth - el.clientWidth - 1;
    setEdge(e => (e.start === start && e.end === end ? e : { start, end }));
  }, []);

  // 처음 그릴 때 버튼이 한 프레임 보였다 사라지지 않게 레이아웃 직후에 잰다
  useLayoutEffect(measure, [measure]);

  // 창 크기·표지 로딩으로 줄 길이가 달라지면 다시 잰다
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => ro.disconnect();
  }, [measure]);

  // 한 화면에 온전히 보이는 카드 수만큼 넘긴다(최소 한 장). 시작선은 본문 왼쪽 끝(scroll-padding)
  const page = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    const card = el?.querySelector<HTMLElement>('.bk-card');
    if (!el || !card) return;
    const gap = parseFloat(getComputedStyle(card.parentElement as HTMLElement).columnGap) || 0;
    const inset = parseFloat(getComputedStyle(el).scrollPaddingLeft) || 0;
    const pitch = card.getBoundingClientRect().width + gap;
    const visible = Math.max(1, Math.floor((el.clientWidth - inset) / pitch));
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * visible * pitch, behavior: still ? 'auto' : 'smooth' });
  };

  const canScroll = !(edge.start && edge.end);

  return (
    <div className="bk-shelf" role="region" aria-label={label}>
      {/* 가려진 쪽 가장자리만 흐리게 — 오른쪽에 더 있으면 end, 왼쪽이 가려져 있으면 start. 띠는 CSS(books.css .bk-fade)이고 여기서는 속성만 켠다 */}
      <div
        className="bk-viewport"
        data-fade-start={!edge.start || undefined}
        data-fade-end={!edge.end || undefined}
      >
        <div ref={scrollerRef} className="bk-scroller" onScroll={measure}>
          <ul className="bk-track" role="list">{children}</ul>
        </div>
        <div className="bk-fade bk-fade--start" aria-hidden="true" />
        <div className="bk-fade bk-fade--end" aria-hidden="true" />
      </div>

      {/* 줄이 한 화면에 다 들어가면(책이 적은 태그) 버튼을 그리지 않는다. ≤734px에서는 손으로 밀어 넘기므로 CSS가 감춘다 */}
      {canScroll && (
        <div className="bk-nav">
          <button
            type="button"
            className="bk-nav-btn"
            aria-label="이전 책"
            aria-disabled={edge.start || undefined}
            onClick={() => { if (!edge.start) page(-1); }}
          >
            <ChevronLeft size={16} strokeWidth={2.4} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="bk-nav-btn"
            aria-label="다음 책"
            aria-disabled={edge.end || undefined}
            onClick={() => { if (!edge.end) page(1); }}
          >
            <ChevronRight size={16} strokeWidth={2.4} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
