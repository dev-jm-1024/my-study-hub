import { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { badgeLabel } from '../../data/topics';
import { STACK } from '../../data/stacks';
import { formatAddedAt, isRecentDate, latestDocs } from '../../utils/home';
import { useInfiniteCarousel } from '../../hooks/useInfiniteCarousel';

/** 주제 색을 CSS 변수로만 넘긴다 (색이 없는 주제는 CSS의 폴백) */
const topicVars = (color: string | undefined) => ({ '--topic': color }) as React.CSSProperties;

/** 홈 '최근 올라온 문서.' — 가장 최근에 올라온 문서 카드를 끝없이 도는 가로 셸프로 (동작은 useInfiniteCarousel이 맡는다) */
export function LatestShelf() {
  const docs = useMemo(() => latestDocs(), []);
  const shelf = useInfiniteCarousel({ count: docs.length });

  if (docs.length === 0) return null;

  return (
    <section className="home-block latest" aria-labelledby="latest-h" aria-roledescription="캐러셀">
      <div className="home-block-head">
        <h2 className="home-block-title" id="latest-h">최근 올라온 문서.</h2>
        {shelf.looping && (
          <div className="latest-controls">
            <button type="button" className="latest-btn" aria-label={shelf.pauseLabel} onClick={shelf.togglePause}>
              {shelf.paused
                ? <Play size={14} fill="currentColor" aria-hidden="true" />
                : <Pause size={14} strokeWidth={3} fill="currentColor" aria-hidden="true" />}
            </button>
            <button type="button" className="latest-btn" aria-label="이전 문서" onClick={shelf.prev}>
              <ChevronLeft size={16} strokeWidth={2.4} aria-hidden="true" />
            </button>
            <button type="button" className="latest-btn" aria-label="다음 문서" onClick={shelf.next}>
              <ChevronRight size={16} strokeWidth={2.4} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      <div className="latest-region home-anim" {...shelf.regionProps}>
        <div className="latest-track" {...shelf.scrollerProps}>
          {/* 같은 목록을 여러 벌 깐다 — 가운데 벌만 실제, 나머지는 끝없이 도는 것처럼 보이게 하는 복제 */}
          {Array.from({ length: shelf.copies }, (_, set) => {
            const clone = set !== shelf.middle;
            return docs.map((doc, i) => (
              <article
                key={`${set}-${i}`}
                className="latest-card"
                {...(clone
                  ? { 'aria-hidden': true }
                  : { role: 'group', 'aria-roledescription': '슬라이드', 'aria-label': `${i + 1} / ${docs.length}` })}
              >
                <p className={`latest-date${isRecentDate(doc.addedAt) ? ' latest-date--new' : ''}`}>
                  {formatAddedAt(doc.addedAt)}{doc.opensTopic ? ' · 새 자료실' : ''}
                </p>
                <p className="latest-topic">
                  <span className="latest-badge" style={topicVars(STACK[doc.topicKey]?.color)} aria-hidden="true">
                    {badgeLabel(doc.topicKey, doc.topicName)}
                  </span>
                  <span className="latest-topic-name">
                    {doc.topicName}{doc.section ? ` · ${doc.section}` : ''}
                  </span>
                </p>
                <h3 className="latest-title">{doc.title}</h3>
                <p className="latest-desc">{doc.desc}</p>
                <div className="latest-foot">
                  <span className="latest-tag">PDF</span>
                  <a
                    className="latest-get"
                    href={doc.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${doc.title} PDF 받기`}
                    tabIndex={clone ? -1 : undefined}
                  >
                    <span className="latest-get-pill">받기</span>
                  </a>
                </div>
              </article>
            ));
          })}
        </div>

        {/* 가장자리 페이드 — 장식이라 포인터를 통과시킨다 */}
        {shelf.looping && (
          <>
            <div className="latest-fade latest-fade--start" aria-hidden="true" />
            <div className="latest-fade latest-fade--end" aria-hidden="true" />
          </>
        )}
      </div>

      {shelf.looping && (
        <div className="latest-dots" aria-hidden="true">
          {docs.map((_, i) => (
            <span key={i} className={`latest-dot${i === shelf.index ? ' latest-dot--on' : ''}`} />
          ))}
        </div>
      )}
    </section>
  );
}
