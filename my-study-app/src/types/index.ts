export interface MenuItem {
  key: string;
  name: string;
  group: string;
  icon: string;
}

export interface PdfItem {
  icon: string;
  title: string;
  description: string;
  pdfUrl: string;
}

export interface RepoItem {
  icon: string;
  title: string;
  description: string;
  repoUrl: string;
  language: string;
  stars: number;
}

export interface BookItem {
  title: string;
  author: string;
  publisher: string;
  description: string;
  coverUrl: string;
  purchaseUrl: string;
  icon: string;
  /** Books 페이지 필터 칩과 매칭되는 태그(없으면 필터 미적용 시에만 노출) */
  tags?: string[];
}

export type Theme = 'light' | 'dark';
