import { Github, ExternalLink, Circle } from 'lucide-react';
import { REPO_DATA } from '../data/menuData';
import { useScrollTopOnMount } from '../hooks/useScrollTopOnMount';

export function GitHubPage() {
  useScrollTopOnMount();

  return (
    <div className="github-page page-wrapper">
      {/* 헤더 */}
      <header className="dl-head home-anim">
        <div className="dl-head-badge t-github"><Github size={22} /></div>
        <div className="dl-head-text">
          <div className="dl-eyebrow">GitHub</div>
          <h1 className="dl-title">실습 코드 저장소</h1>
        </div>
        <span className="dl-count">{REPO_DATA.length}개</span>
      </header>

      {/* 레포지토리 리스트 */}
      <div className="dl-list">
        {REPO_DATA.map((repo, idx) => (
          <a
            key={idx}
            className="dl-row home-anim t-github"
            href={repo.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="dl-badge"><Github size={18} /></div>
            <div className="dl-main">
              <div className="dl-row-title">{repo.title}</div>
              <div className="dl-row-desc">{repo.description}</div>
            </div>
            <span className="dl-lang"><Circle size={7} className="dl-lang-dot" /> {repo.language}</span>
            <span className="dl-open"><ExternalLink size={16} /></span>
          </a>
        ))}
      </div>
    </div>
  );
}
