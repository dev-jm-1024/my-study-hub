import { useId, useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { DESC, topicStyle } from '../../data/topics';
import { docShare, topTopics } from '../../utils/home';
import { useTransitionNavigate } from '../../hooks/useTransitionNavigate';

/* 타일의 이름·문서 수가 자료실 헤더의 같은 조각으로 이어진다 (view-transition.css) */
const TILE_TO_HEAD = { '.feat-name': 'dl-title', '.feat-count': 'dl-count' };

interface FeaturedSectionProps {
  /** '모든 주제 보기' 클릭 — 검색어를 비우고 #topics로 내려간다 */
  onBrowseTopics?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

/** 홈 중단 '가장 많이 쌓인 자료실.' — 문서 수 상위 주제 타일(1위는 반전) + 문서 비중 타일 */
export function FeaturedSection({ onBrowseTopics }: FeaturedSectionProps) {
  const go = useTransitionNavigate();
  const uid = useId();
  const tiles = useMemo(() => topTopics(), []);
  const share = useMemo(() => docShare(), []);

  if (tiles.length === 0 && share.total === 0) return null;

  // 비중 문장은 맨 앞 두 주제로 쓴다 — 주제가 둘 미만이면 생략
  const [first, second] = share.parts;
  const topShare = first && second && share.total > 0
    ? Math.round(((first.count + second.count) / share.total) * 100)
    : null;

  return (
    <section className="home-block" aria-labelledby="featured-h">
      <div className="home-block-head">
        <h2 className="home-block-title" id="featured-h">가장 많이 쌓인 자료실.</h2>
        <a className="home-block-more" href="#topics" onClick={onBrowseTopics}>
          모든 주제 보기
          <ChevronRight size={14} strokeWidth={2.4} aria-hidden="true" />
        </a>
      </div>

      <div className="feat-grid">
        {tiles.map((t, i) => {
          const to = `/download/${t.key}`;
          // 링크 이름은 '과목 이름 + 문서 수'로 짧게 — 칩·설명까지 읽으면 90자가 넘는다. 설명은 보조 설명으로
          const nameId = `${uid}-${t.key}-name`;
          const countId = `${uid}-${t.key}-count`;
          const descId = `${uid}-${t.key}-desc`;
          return (
            <a
              key={t.key}
              className={`feat-tile home-anim${i === 0 ? ' feat-tile--inv' : ''}`}
              href={to}
              aria-labelledby={`${nameId} ${countId}`}
              aria-describedby={descId}
              onClick={e => go(e, to, TILE_TO_HEAD)}
            >
              <div>
                <p className="feat-group">{t.group}</p>
                <h3 className="feat-name" id={nameId}>{t.name}</h3>
                <p className="feat-desc" id={descId}>{DESC[t.key] ?? t.group}</p>
              </div>
              {t.sections.length > 0 && (
                <ul className="feat-chips">
                  {t.sections.map(s => (
                    <li key={s.name} className="feat-chip">
                      {s.name} <span className="feat-chip-n">{s.count}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="feat-foot">
                <p className="feat-count" id={countId}>
                  <span className="feat-count-num">{t.count}</span>
                  <span className="feat-count-unit">개 문서</span>
                </p>
                <span className="feat-cta">
                  자료실 열기
                  <ChevronRight size={14} strokeWidth={2.4} aria-hidden="true" />
                </span>
              </div>
            </a>
          );
        })}

        {share.total > 0 && (
          <div className="feat-share home-anim">
            <div>
              <p className="feat-share-label">문서 비중</p>
              {topShare !== null && (
                <p className="feat-share-desc">
                  {`${first.name} · ${second.name} 두 주제가 전체 문서 ${share.total}개 중 ${topShare}%를 차지합니다.`}
                </p>
              )}
            </div>
            {/* 막대는 그림일 뿐 — 아래 범례가 같은 정보를 글로 준다 */}
            <div className="feat-bar" aria-hidden="true">
              {share.parts.map(p => (
                <span
                  key={p.key}
                  className="feat-bar-seg"
                  style={{ ...topicStyle(p.key), '--share': p.count } as React.CSSProperties}
                />
              ))}
              {share.rest.count > 0 && (
                <span
                  className="feat-bar-seg feat-bar-seg--rest"
                  style={{ '--share': share.rest.count } as React.CSSProperties}
                />
              )}
            </div>
            <ul className="feat-legend">
              {share.parts.map(p => (
                <li key={p.key} className="feat-legend-item">
                  <span className="feat-dot" style={topicStyle(p.key)} aria-hidden="true" />
                  <span className="feat-legend-name">{p.name}</span>
                  <span className="feat-legend-n">{p.count}</span>
                </li>
              ))}
              {share.rest.count > 0 && (
                <li className="feat-legend-item">
                  <span className="feat-dot feat-dot--rest" aria-hidden="true" />
                  <span className="feat-legend-name">기타 {share.rest.topics}개 주제</span>
                  <span className="feat-legend-n">{share.rest.count}</span>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
