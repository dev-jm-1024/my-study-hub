import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { GlassCard } from '../components/GlassCard';
import { REPO_DATA } from '../data/menuData';

export function GitHubPage() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const ctx = gsap.context(() => {
      gsap.from('.card', {
        opacity: 0,
        y: 24,
        duration: 0.45,
        stagger: 0.08,
        ease: 'power2.out',
        clearProps: 'all',
      });
    }, gridRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="github-page page-wrapper">
      {/* 헤더 */}
      <GlassCard className="page-header">
        <div className="github-logo">
          <i className="fa-brands fa-github fa-2x" />
          <span className="github-logo-text">실습 저장소</span>
        </div>
        <h1 className="page-title">GitHub 실습 코드</h1>
        <p className="page-subtitle">
          백엔드 개발 학습을 위한 실습 코드 저장소 모음입니다.
        </p>
        <span className="document-count">{REPO_DATA.length} Repositories</span>
        <div className="github-tags">
          <span className="github-tag">Java</span>
          <span className="github-tag">Spring Boot</span>
          <span className="github-tag">JSP/Servlet</span>
          <span className="github-tag">MySQL</span>
        </div>
      </GlassCard>

      {/* 레포지토리 카드 */}
      <div ref={gridRef} className="card-grid">
        {REPO_DATA.map((repo, idx) => (
          <div key={idx} className="card">
            <div className="card-icon">
              <i className={repo.icon} />
            </div>
            <div className="card-title">{repo.title}</div>
            <div className="card-description">{repo.description}</div>
            <div className="github-repo-info">
              <span className="github-repo-language">
                <i className="fa-solid fa-circle" /> {repo.language}
              </span>
              <span className="github-repo-stars">
                <i className="fa-solid fa-star" /> {repo.stars}
              </span>
            </div>
            <div className="card-footer">
              <a
                href={repo.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="download-btn"
              >
                저장소 열기 <i className="fa-solid fa-arrow-up-right-from-square" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
