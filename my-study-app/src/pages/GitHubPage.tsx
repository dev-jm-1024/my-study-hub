import type { CSSProperties } from 'react';
import { ArrowUpRight, GitBranch, Github } from 'lucide-react';
import { REPO_DATA } from '../data/repos';
import { STACK } from '../data/stacks';
import { NewTabHint } from '../components/NewTabHint';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useScrollTopOnMount } from '../hooks/useScrollTopOnMount';

/** 언어 이름 → 주제 색(data/stacks.ts). 없는 언어는 undefined — CSS가 회색으로 받는다 */
const langStyle = (language: string): CSSProperties | undefined => {
  const color = STACK[language.toLowerCase()]?.color;
  return color ? ({ '--topic': color } as CSSProperties) : undefined;
};

const TITLE = '실습 코드 저장소';

export function GitHubPage() {
  useDocumentTitle(TITLE);
  useScrollTopOnMount();

  return (
    <main className="page-wrapper">
      <header className="dl-head home-anim">
        <div className="dl-head-badge" aria-hidden="true"><Github size={22} /></div>
        <div className="dl-head-text">
          <p className="dl-eyebrow">GitHub</p>
          <h1 className="dl-title">{TITLE}</h1>
        </div>
        <p className="dl-count">
          <span className="dl-count-num">{REPO_DATA.length}</span>
          <span className="dl-count-unit">개 레포</span>
        </p>
      </header>
      <p className="page-intro home-anim">문서로 정리한 내용을 직접 돌려본 코드입니다.</p>

      <ul className="repo-grid home-anim" role="list">
        {REPO_DATA.map(repo => (
          <li key={repo.repoUrl}>
            <a className="repo-card" href={repo.repoUrl} target="_blank" rel="noopener noreferrer">
              <span className="repo-top">
                <span className="repo-icon" aria-hidden="true"><GitBranch size={16} /></span>
                <ArrowUpRight className="repo-arrow" size={18} aria-hidden="true" />
              </span>
              <span className="repo-name">{repo.title}</span>
              <span className="repo-desc">{repo.description}</span>
              <span className="repo-lang">
                <span className="repo-lang-dot" style={langStyle(repo.language)} aria-hidden="true" />
                {repo.language}
              </span>
              <NewTabHint />
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
