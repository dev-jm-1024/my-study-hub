import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { CommandPalette } from './components/CommandPalette';
import { HomePage } from './pages/HomePage';
import { DownloadPage } from './pages/DownloadPage';
import { BooksPage } from './pages/BooksPage';
import { GitHubPage } from './pages/GitHubPage';
import { VibeCodingPage } from './pages/VibeCodingPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <Navbar />
        {/* 페이지가 짧아도 푸터가 화면 바닥에 붙도록 남는 높이를 채운다 (footer-misc.css) */}
        <div className="app-main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/download/:category" element={<DownloadPage />} />
            <Route path="/books" element={<BooksPage />} />
            <Route path="/github" element={<GitHubPage />} />
            <Route path="/vibe" element={<VibeCodingPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
        <Footer />
        <ScrollToTop />
        <CommandPalette />
      </ThemeProvider>
    </BrowserRouter>
  );
}
