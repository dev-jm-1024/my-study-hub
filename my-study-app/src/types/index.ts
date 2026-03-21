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
}

export type Theme = 'light' | 'dark';
