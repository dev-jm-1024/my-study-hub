import { Sparkles, ExternalLink, Github } from 'lucide-react';
import { VIBE_PROJECTS } from '../data/vibe';
import { useScrollTopOnMount } from '../hooks/useScrollTopOnMount';

export function VibeCodingPage() {
  useScrollTopOnMount();

  return (
    <div className="vibe-page page-wrapper">
      {/* 헤더 */}
      <header className="dl-head home-anim">
        <div className="dl-head-badge t-vibe"><Sparkles size={22} /></div>
        <div className="dl-head-text">
          <div className="dl-eyebrow">Vibe Coding</div>
          <h1 className="dl-title">바이브 코딩</h1>
          <p className="vibe-sub">AI와 함께 만든 프로젝트들입니다.</p>
        </div>
        <span className="dl-count">{VIBE_PROJECTS.length}개</span>
      </header>

      {/* 프로젝트 카드 */}
      <div className="vibe-grid">
        {VIBE_PROJECTS.map((p, i) => (
          <article key={i} className="vibe-card home-anim">
            <div className="vibe-card-head">
              <h3 className="vibe-card-title">{p.name}</h3>
            </div>
            <p className="vibe-desc">{p.description}</p>

            {p.techStack.length > 0 && (
              <div className="vibe-tags">
                {p.techStack.map(t => <span key={t} className="vibe-tag">{t}</span>)}
              </div>
            )}

            {p.ai && p.ai.length > 0 && (
              <div className="vibe-tools">
                <span className="vibe-tools-label">Made with</span>
                {p.ai.map(a => <span key={a} className="vibe-tool">{a}</span>)}
              </div>
            )}

            {(p.link || p.github) && (
              <div className="vibe-links">
                {p.link && (
                  <a href={p.link} target="_blank" rel="noopener noreferrer" className="vibe-link">
                    <ExternalLink size={14} /> 라이브
                  </a>
                )}
                {p.github && (
                  <a href={p.github} target="_blank" rel="noopener noreferrer" className="vibe-link">
                    <Github size={14} /> GitHub
                  </a>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
