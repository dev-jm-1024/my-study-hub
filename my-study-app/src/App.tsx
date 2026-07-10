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
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/download/:category" element={<DownloadPage />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/github" element={<GitHubPage />} />
          <Route path="/vibe" element={<VibeCodingPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Footer />
        <ScrollToTop />
        <CommandPalette />
      </ThemeProvider>
    </BrowserRouter>
  );
}
