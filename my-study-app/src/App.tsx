import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { DownloadPage } from './pages/DownloadPage';
import { BooksPage } from './pages/BooksPage';
import { GitHubPage } from './pages/GitHubPage';

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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}
