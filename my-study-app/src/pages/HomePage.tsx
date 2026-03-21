import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ArrowRight } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { MENUS, MENU_DATA } from '../data/menuData';

export function HomePage() {
  const cardsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.category-card', {
        opacity: 0,
        y: 32,
        duration: 0.5,
        stagger: 0.06,
        ease: 'power2.out',
        clearProps: 'all',
      });
    }, cardsRef);
    return () => ctx.revert();
  }, []);

  return (
    <main className="page-wrapper">
      {/* Hero */}
      <section className="hero">
        <div className="hero-badge">Backend Developer Portal</div>
        <h1 className="hero-title">
          Welcome to JM Study Hub
        </h1>
        <p className="hero-subtitle">
          직접 공부하고 PDF 로 만들었습니다. <br/>
          다운로드는 자유 입니다.
        </p>
        <div className="hero-cta-group">
          <a href="#categories" className="btn-cta-primary">PDF 자료실 가기</a>
          <a href="/github" className="btn-cta-secondary" onClick={e => { e.preventDefault(); navigate('/github'); }}>
            실습 코드 보기
          </a>
        </div>
        <div className="hero-links">
          <a href="https://velog.io" target="_blank" rel="noreferrer" className="hero-link">
            <i className="fa-solid fa-file-text" /> Velog
          </a>
          <a href="https://github.com/dev-jm-1024" target="_blank" rel="noreferrer" className="hero-link">
            <i className="fa-brands fa-github" /> GitHub
          </a>
        </div>
      </section>

      {/* Category Grid */}
      <section id="categories" className="categories-section">
        <div className="section-header">
          <h2 className="section-title">PDF 자료실</h2>
          <p className="section-subtitle">카테고리별 학습 자료를 선택하세요</p>
        </div>
        <div ref={cardsRef} className="category-grid">
          {MENUS.map(menu => {
            const count = (MENU_DATA[menu.key] ?? []).length;
            return (
              <GlassCard
                key={menu.key}
                hover
                className="category-card"
                onClick={() => navigate(`/download/${menu.key}`)}
              >
                <div className="category-card-icon">
                  <i className={menu.icon} />
                </div>
                <div className="category-group">{menu.group}</div>
                <div className="category-name">{menu.name}</div>
                <div className="category-badge">{count} Docs</div>
                <button className="category-card-cta">
                  자료실 이동 <ArrowRight size={14} />
                </button>
              </GlassCard>
            );
          })}
        </div>
      </section>
    </main>
  );
}
