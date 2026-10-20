import { useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { SegmentBar } from '../components/SegmentBar';
import { VIBE_PROJECTS } from '../data/vibe';
import { useScrollTopOnMount } from '../hooks/useScrollTopOnMount';
import { useScrollTopOnPush } from '../hooks/useScrollTopOnPush';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { NEW_TAB_LABEL } from '../constants';
import { VIBE_KINDS, VIBE_KIND_LABEL, isVibeKind, vibeKind, type VibeKind } from '../utils/vibe';

const ALL = 'all';

const KIND_COUNT = Object.fromEntries(
  VIBE_KINDS.map(kind => [kind, VIBE_PROJECTS.filter(p => vibeKind(p) === kind).length]),
) as Record<VibeKind, number>;

/** 종류가 둘 다 있을 때만 필터를 그린다 — 하나뿐이면 걸러 낼 것이 없다 */
const SHOW_FILTER = VIBE_KINDS.every(kind => KIND_COUNT[kind] > 0);

const TABS = [
  { key: ALL, label: '전체', count: VIBE_PROJECTS.length },
  ...VIBE_KINDS.map(kind => ({ key: kind, label: VIBE_KIND_LABEL[kind], count: KIND_COUNT[kind] })),
];

const TITLE = '바이브 코딩';

export function VibeCodingPage() {
  useDocumentTitle(TITLE);
  useScrollTopOnMount();
  useScrollTopOnPush();   // 상단 메뉴 링크로 ?kind=가 바뀌면 새 목록의 맨 위부터 — 세그먼트(replace)·뒤로 가기는 그대로

  // URL이 정본(?kind=macos|web) — 모르는 값은 전체. 메뉴 링크로 같은 페이지에서 바뀌어도 바로 반영된다
  const [params, setParams] = useSearchParams();
  const kindParam = params.get('kind');
  const kind = SHOW_FILTER && isVibeKind(kindParam) ? kindParam : null;
  const shown = kind ? VIBE_PROJECTS.filter(p => vibeKind(p) === kind) : VIBE_PROJECTS;

  const selectKind = (key: string) => {
    setParams(prev => {
      const next = new URLSearchParams(prev);
      if (isVibeKind(key)) next.set('kind', key);
      else next.delete('kind');
      return next;
    }, { replace: true });
  };

  return (
    <main className="page-wrapper">
      <header className="dl-head home-anim">
        <div className="dl-head-badge dl-head-badge--mono" aria-hidden="true"><Sparkles size={22} /></div>
        <div className="dl-head-text">
          <p className="dl-eyebrow">Vibe Coding</p>
          <h1 className="dl-title">{TITLE}</h1>
        </div>
        <p className="dl-count">
          <span className="dl-count-num">{VIBE_PROJECTS.length}</span>
          <span className="dl-count-unit">개 프로젝트</span>
        </p>
      </header>
      <p className="page-intro home-anim">AI와 함께 만든 프로젝트들입니다.</p>

      {SHOW_FILTER && (
        <div className="vibe-filter home-anim">
          <SegmentBar label="종류 필터" tabs={TABS} selected={kind ?? ALL} onSelect={selectKind} />
        </div>
      )}

      {/* .home-anim은 목록 래퍼에만 — 필터를 바꿀 때 카드 등장 효과가 다시 돌지 않는다 */}
      <ul className="vibe-grid home-anim" role="list">
        {shown.map(p => (
          <li key={p.name} className="vibe-card">
            <div className="vibe-head">
              <p className="vibe-kind">{VIBE_KIND_LABEL[vibeKind(p)]}</p>
              <h2 className="vibe-name">{p.name}</h2>
            </div>
            <p className="vibe-desc">{p.description}</p>

            {p.techStack.length > 0 && (
              <ul className="vibe-chips" role="list" aria-label="기술 스택">
                {p.techStack.map(t => <li key={t} className="vibe-chip">{t}</li>)}
              </ul>
            )}

            {p.ai && p.ai.length > 0 && (
              <p className="vibe-made">
                <span className="vibe-made-label">Made with</span>{' '}
                <span className="vibe-made-tools">{p.ai.join(' · ')}</span>
              </p>
            )}

            {(p.link || p.github) && (
              <div className="vibe-links">
                {p.link && (
                  <a className="vibe-link" href={p.link} target="_blank" rel="noopener noreferrer" aria-label={`${p.name} 라이브 ${NEW_TAB_LABEL}`}>
                    라이브
                    <ArrowUpRight size={14} strokeWidth={2.4} aria-hidden="true" />
                  </a>
                )}
                {p.github && (
                  <a className="vibe-link" href={p.github} target="_blank" rel="noopener noreferrer" aria-label={`${p.name} GitHub ${NEW_TAB_LABEL}`}>
                    GitHub
                    <ArrowUpRight size={14} strokeWidth={2.4} aria-hidden="true" />
                  </a>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
