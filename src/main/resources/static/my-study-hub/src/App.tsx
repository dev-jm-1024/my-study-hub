import React, { useState, useEffect } from 'react';
import { Moon, Sun, Menu, X, Download, BookOpen, Github, ExternalLink, FileText, Database, Server, Layers, Terminal, CheckCircle, ChevronLeft, PenLine, ArrowRight } from 'lucide-react';

const pdfCategories = [
  { name: 'Java', count: 10, group: '프로그래밍 언어', icon: <Terminal className="w-5 h-5" /> },
  { name: 'Kotlin', count: 2, group: '프로그래밍 언어', icon: <Terminal className="w-5 h-5" /> },
  { name: 'Spring Boot', count: 7, group: '프레임워크', icon: <Layers className="w-5 h-5" /> },
  { name: 'JSP', count: 12, group: '프레임워크', icon: <Layers className="w-5 h-5" /> },
  { name: 'MySQL', count: 5, group: '데이터베이스', icon: <Database className="w-5 h-5" /> },
  { name: 'MongoDB', count: 1, group: '데이터베이스', icon: <Database className="w-5 h-5" /> },
  { name: 'API', count: 6, group: '아키텍처', icon: <Server className="w-5 h-5" /> },
  { name: 'OOP', count: 4, group: '아키텍처', icon: <Server className="w-5 h-5" /> },
  { name: 'Linux', count: 6, group: '인프라', icon: <Terminal className="w-5 h-5" /> },
  { name: 'Kafka', count: 2, group: '인프라', icon: <Server className="w-5 h-5" /> },
  { name: 'Network', count: 1, group: '인프라', icon: <Server className="w-5 h-5" /> },
  { name: 'Git', count: 1, group: '인프라', icon: <Github className="w-5 h-5" /> },
  { name: 'JUnit', count: 1, group: '테스팅', icon: <CheckCircle className="w-5 h-5" /> },
  { name: '예외처리', count: 1, group: '테스팅', icon: <CheckCircle className="w-5 h-5" /> },
];

const books = [
  { title: 'Clean Code', author: 'Robert C. Martin', link: '#' },
  { title: 'Effective Java', author: 'Joshua Bloch', link: '#' },
  { title: '토비의 스프링 3.1', author: '이일민', link: '#' },
  { title: '객체지향의 사실과 오해', author: '조영호', link: '#' },
  { title: '도메인 주도 개발 시작하기', author: '최범균', link: '#' },
  { title: '자바 ORM 표준 JPA 프로그래밍', author: '김영한', link: '#' },
  { title: 'Real MySQL 8.0', author: '백은빈, 이성욱', link: '#' },
  { title: '가상 면접 사례로 배우는 대규모 시스템 설계 기초', author: '알렉스 쉬', link: '#' },
  { title: '클린 아키텍처', author: 'Robert C. Martin', link: '#' },
  { title: 'HTTP 완벽 가이드', author: '데이빗 고울리 외', link: '#' },
  { title: '리팩터링 2판', author: '마틴 파울러', link: '#' },
  { title: '테스트 주도 개발', author: '켄트 벡', link: '#' },
];

const repos = [
  { name: 'Java-Practice', desc: '자바 핵심 개념 및 알고리즘 실습 코드', stars: 12 },
  { name: 'Spring-Boot-Board', desc: '스프링 부트 기반 게시판 REST API', stars: 34 },
  { name: 'MySQL-Optimization', desc: '쿼리 최적화 및 인덱스 테스트 스크립트', stars: 8 },
  { name: 'Kafka-Event-Driven', desc: '카프카를 활용한 이벤트 기반 아키텍처 예제', stars: 15 },
];

const GlassCard = ({ children, className = '', hover = false, onClick }: { children: React.ReactNode, className?: string, hover?: boolean, onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={`bg-white/40 dark:bg-black/40 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-3xl ${hover ? 'hover:bg-white/50 dark:hover:bg-black/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer' : 'transition-all duration-300'} ${className}`}
  >
    {children}
  </div>
);

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'category' | 'books'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setCurrentView('category');
    window.scrollTo(0, 0);
  };

  const handleHomeClick = () => {
    setCurrentView('home');
    setSelectedCategory(null);
    window.scrollTo(0, 0);
  };

  const handleBooksClick = () => {
    setCurrentView('books');
    window.scrollTo(0, 0);
  };

  const renderCategoryView = () => {
    const category = pdfCategories.find(c => c.name === selectedCategory);
    if (!category) return null;

    // Mock PDF list
    const pdfList = Array.from({ length: category.count }).map((_, i) => ({
      id: i + 1,
      title: `${category.name} 핵심 요약본 Part ${i + 1}.pdf`,
      size: `${(Math.random() * 5 + 1).toFixed(1)} MB`,
      date: `2026-03-${(i + 1).toString().padStart(2, '0')}`
    }));

    return (
      <div className="pt-32 pb-24 px-4 max-w-7xl mx-auto flex flex-col md:flex-row gap-8 min-h-screen">
        {/* Mobile Sidebar Toggle */}
        <button 
          className="md:hidden flex items-center gap-2 mb-4 px-4 py-3 bg-white/40 dark:bg-black/40 backdrop-blur-2xl rounded-2xl border border-white/50 dark:border-white/10 shadow-sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="w-5 h-5" />
          <span className="font-bold">카테고리 메뉴</span>
        </button>

        {/* Sidebar */}
        <aside className={`w-full md:w-72 flex-shrink-0 ${sidebarOpen ? 'block' : 'hidden md:block'}`}>
          <GlassCard className="p-5 sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto">
            <button 
              onClick={handleHomeClick}
              className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-6 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              홈으로 돌아가기
            </button>
            <h3 className="font-extrabold text-lg mb-4 px-2 tracking-tight">PDF 카테고리</h3>
            <div className="space-y-1.5">
              {pdfCategories.map(cat => (
                <button
                  key={cat.name}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setSidebarOpen(false);
                    window.scrollTo(0, 0);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold transition-all flex items-center justify-between ${
                    selectedCategory === cat.name 
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md' 
                      : 'hover:bg-white/50 dark:hover:bg-black/50 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    {React.cloneElement(cat.icon as React.ReactElement, { className: 'w-4 h-4' })}
                    {cat.name}
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full ${
                    selectedCategory === cat.name 
                      ? 'bg-white/20 dark:bg-black/10' 
                      : 'bg-slate-200 dark:bg-slate-800'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          </GlassCard>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <GlassCard className="p-8 md:p-10 mb-8">
            <div className="flex items-center gap-5 mb-5">
              <div className="p-4 bg-white/50 dark:bg-black/50 rounded-2xl text-slate-700 dark:text-slate-300 shadow-sm border border-white/30 dark:border-white/5">
                {React.cloneElement(category.icon as React.ReactElement, { className: 'w-8 h-8' })}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">{category.group}</p>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">{category.name} 자료실</h1>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium text-lg">
              {category.name} 백엔드 개발 학습을 위한 {category.count}개의 핵심 PDF 문서가 준비되어 있습니다.
            </p>
          </GlassCard>

          <div className="space-y-4">
            {pdfList.map(pdf => (
              <GlassCard key={pdf.id} hover className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900/50">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1.5">{pdf.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 font-medium">
                      <span className="bg-white/50 dark:bg-black/50 px-2 py-0.5 rounded-md border border-white/50 dark:border-white/10">{pdf.size}</span>
                      <span>•</span>
                      <span>업데이트: {pdf.date}</span>
                    </div>
                  </div>
                </div>
                <button className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-sm sm:w-auto w-full">
                  <Download className="w-4 h-4" />
                  다운로드
                </button>
              </GlassCard>
            ))}
          </div>
        </main>
      </div>
    );
  };

  const renderBooksView = () => {
    return (
      <div className="pt-32 pb-24 px-4 max-w-7xl mx-auto min-h-screen">
        <button 
          onClick={handleHomeClick}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          홈으로 돌아가기
        </button>
        <div className="flex items-center gap-4 mb-10">
          <div className="p-4 bg-white/60 dark:bg-black/60 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-2xl shadow-sm">
            <BookOpen className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">추천 도서</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book, idx) => (
            <GlassCard key={idx} hover className="p-5 flex items-center gap-5">
              <div className="w-20 h-28 bg-white/50 dark:bg-black/50 rounded-xl flex-shrink-0 flex items-center justify-center border border-white/50 dark:border-white/10 shadow-sm">
                <BookOpen className="w-8 h-8 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h3 className="font-bold text-lg truncate mb-1" title={book.title}>{book.title}</h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">{book.author}</p>
                <a href={book.link} className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white hover:opacity-70 transition-opacity">
                  교보문고 구매 <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen font-sans selection:bg-blue-500/30">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <GlassCard className="px-6 py-3 flex items-center justify-between rounded-full">
            <div 
              className="flex items-center gap-3 cursor-pointer" 
              onClick={handleHomeClick}
            >
              <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-slate-900 font-bold text-lg shadow-md">
                SH
              </div>
              <span className="text-xl font-bold tracking-tight">Study Hub</span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <button onClick={handleHomeClick} className="font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</button>
              <button onClick={handleBooksClick} className="font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Books</button>
              {currentView === 'home' && (
                <>
                  <a href="#pdfs" className="font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors">PDFs</a>
                  <a href="#github" className="font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors">GitHub</a>
                </>
              )}
              <div className="w-px h-6 bg-slate-300 dark:bg-slate-700"></div>
              <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-white/50 dark:hover:bg-black/50 transition-colors">
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>

            {/* Mobile Toggle */}
            <div className="md:hidden flex items-center gap-2">
              <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-white/50 dark:hover:bg-black/50 transition-colors">
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-full hover:bg-white/50 dark:hover:bg-black/50 transition-colors">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-24 left-4 right-4">
            <GlassCard className="p-4 flex flex-col gap-2">
              <button onClick={() => { handleHomeClick(); setMobileMenuOpen(false); }} className="text-left px-4 py-3 rounded-2xl hover:bg-white/50 dark:hover:bg-black/50 font-bold">Home</button>
              <button onClick={() => { handleBooksClick(); setMobileMenuOpen(false); }} className="text-left px-4 py-3 rounded-2xl hover:bg-white/50 dark:hover:bg-black/50 font-bold">Books</button>
              {currentView === 'home' && (
                <>
                  <a href="#pdfs" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-2xl hover:bg-white/50 dark:hover:bg-black/50 font-bold">PDFs</a>
                  <a href="#github" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-2xl hover:bg-white/50 dark:hover:bg-black/50 font-bold">GitHub</a>
                </>
              )}
            </GlassCard>
          </div>
        )}
      </nav>

      {currentView === 'category' ? (
        renderCategoryView()
      ) : currentView === 'books' ? (
        renderBooksView()
      ) : (
        <main className="pt-36 pb-24 px-4 max-w-7xl mx-auto space-y-32">
          {/* Hero Section */}
          <section className="text-center space-y-8 py-16">
            <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-100/50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-semibold text-sm backdrop-blur-md">
              Backend Developer Portal
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight">
              Master Backend<br />
              <span className="text-transparent bg-clip-text bg-slate-900 dark:bg-white">With Study Hub</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
              백엔드 개발자를 위한 학습 자료 포털 사이트입니다. PDF 문서, 추천 도서, GitHub 실습 코드를 한 곳에서 확인하세요.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-8">
              <a href="#pdfs" className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold transition-transform hover:scale-105 shadow-xl">
                PDF 자료실 가기
              </a>
              <a href="#github" className="px-8 py-4 bg-white/50 dark:bg-black/50 backdrop-blur-md border border-slate-300 dark:border-slate-700 hover:bg-white/80 dark:hover:bg-black/80 rounded-full font-bold transition-all shadow-lg">
                실습 코드 보기
              </a>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-6">
              <a href="#" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-2.5 bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/50 dark:border-white/10 hover:bg-white/60 dark:hover:bg-black/60 rounded-full font-bold transition-all shadow-sm text-sm text-slate-700 dark:text-slate-300">
                <PenLine className="w-4 h-4" />
                네이버 블로그
              </a>
              <a href="#" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-2.5 bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/50 dark:border-white/10 hover:bg-white/60 dark:hover:bg-black/60 rounded-full font-bold transition-all shadow-sm text-sm text-slate-700 dark:text-slate-300">
                <FileText className="w-4 h-4" />
                Velog
              </a>
              <a href="#" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-2.5 bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/50 dark:border-white/10 hover:bg-white/60 dark:hover:bg-black/60 rounded-full font-bold transition-all shadow-sm text-sm text-slate-700 dark:text-slate-300">
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </div>
          </section>

          {/* PDF Section */}
          <section id="pdfs" className="space-y-10 scroll-mt-32">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/60 dark:bg-black/60 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-2xl shadow-sm">
                <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-4xl font-extrabold tracking-tight">PDF 자료실</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pdfCategories.map((cat, idx) => (
                <GlassCard 
                  key={idx} 
                  hover 
                  className="p-6 flex flex-col gap-6 group"
                  onClick={() => handleCategoryClick(cat.name)}
                >
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-white/50 dark:bg-black/50 rounded-2xl text-slate-700 dark:text-slate-300 shadow-sm border border-white/30 dark:border-white/5">
                      {cat.icon}
                    </div>
                    <span className="text-xs font-bold px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full shadow-sm">
                      {cat.count} Docs
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">{cat.group}</p>
                    <h3 className="text-2xl font-bold">{cat.name}</h3>
                  </div>
                  <button className="mt-auto flex items-center justify-center gap-2 w-full py-3 bg-white/40 dark:bg-black/40 border border-white/50 dark:border-white/10 group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-slate-900 rounded-2xl font-bold transition-colors shadow-sm">
                    <ArrowRight className="w-4 h-4" />
                    자료실 이동
                  </button>
                </GlassCard>
              ))}
            </div>
          </section>

          {/* GitHub Section */}
          <section id="github" className="space-y-10 scroll-mt-32">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/60 dark:bg-black/60 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-2xl shadow-sm">
                <Github className="w-8 h-8 text-slate-800 dark:text-slate-200" />
              </div>
              <h2 className="text-4xl font-extrabold tracking-tight">실습 저장소</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {repos.map((repo, idx) => (
                <GlassCard key={idx} hover className="p-8 flex flex-col gap-5">
                  <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-bold flex items-center gap-3">
                      <Github className="w-6 h-6" />
                      {repo.name}
                    </h3>
                    <span className="flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 bg-white/50 dark:bg-black/50 border border-white/50 dark:border-white/10 rounded-full shadow-sm">
                      ★ {repo.stars}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 font-medium text-lg">{repo.desc}</p>
                  <a href="#" className="mt-4 inline-flex items-center gap-2 text-sm font-bold hover:opacity-70 transition-opacity">
                    저장소 방문하기 <ExternalLink className="w-4 h-4" />
                  </a>
                </GlassCard>
              ))}
            </div>
          </section>
        </main>
      )}

      <footer className="border-t border-slate-300/50 dark:border-slate-700/50 py-12 text-center text-slate-500 dark:text-slate-400 font-medium">
        <p>© 2026 My Study Hub. All rights reserved.</p>
      </footer>
    </div>
  );
}
