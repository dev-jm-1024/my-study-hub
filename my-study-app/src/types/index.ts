export interface MenuItem {
  key: string;
  name: string;
  group: string;
}

export interface PdfItem {
  /** 자료실 안 소분류. 한 항목이라도 있으면 해당 카테고리는 소제목별로 묶어 보여준다(페이징 없음) */
  section?: string;
  title: string;
  description: string;
  pdfUrl: string;
  /** 문서 등록일 YYYY-MM-DD — git 이력에서 그 문서가 처음 나타난 커밋의 날짜(커밋 %ad). 근거 없으면 생략 */
  addedAt?: string;
}

export interface RepoItem {
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
  /** Books 페이지 필터 칩과 매칭되는 태그(없으면 필터 미적용 시에만 노출) */
  tags?: string[];
}

export interface CategoryNotice {
  /** 생략 시 '공지' 라벨만 표시 */
  title?: string;
  body: string;
  /** 본문 아래에 붙는 외부 링크 */
  link?: { label: string; href: string };
}

export type Theme = 'light' | 'dark';
