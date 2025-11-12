// book.js - 추천도서 페이지 로직

class BookPage {
    constructor() {
        this.books = [];
        this.filteredBooks = [];
        this.searchQuery = '';
        this.init();
    }

    init() {
        // 데이터 로드
        this.loadData();
        
        // 이벤트 리스너 설정
        this.setupEventListeners();
        
        // 카드 렌더링
        this.renderBooks();
        
        // 애니메이션
        this.playAnimations();
    }

    loadData() {
        // MENU_DATA에서 도서 데이터 가져오기
        if (typeof MENU_DATA !== 'undefined' && MENU_DATA.books) {
            this.books = MENU_DATA.books;
            this.filteredBooks = [...this.books];
        } else {
            console.error('No book data found');
            // 기본 샘플 데이터
            this.books = [
                {
                    title: '이펙티브 자바',
                    author: '조슈아 블로크',
                    publisher: '인사이트',
                    description: '자바 플랫폼 모범 사례 완벽 가이드. 자바 언어의 핵심 기능과 라이브러리를 효과적으로 사용하는 방법을 제시합니다.',
                    coverUrl: '',
                    purchaseUrl: 'https://www.yes24.com/Product/Goods/65551284',
                    icon: 'fa-solid fa-book'
                },
                {
                    title: '스프링 부트와 AWS로 혼자 구현하는 웹 서비스',
                    author: '이동욱',
                    publisher: '프리렉',
                    description: '스프링 부트와 AWS를 활용한 웹 서비스 개발 실전 가이드. 배포까지 한 번에 배우는 풀스택 개발 입문서입니다.',
                    coverUrl: '',
                    purchaseUrl: 'https://www.yes24.com/Product/Goods/83849117',
                    icon: 'fa-solid fa-book'
                },
                {
                    title: '클린 코드',
                    author: '로버트 C. 마틴',
                    publisher: '인사이트',
                    description: '애자일 소프트웨어 장인 정신. 읽기 좋고, 이해하기 쉽고, 수정하기 쉬운 코드를 작성하는 방법을 알려줍니다.',
                    coverUrl: '',
                    purchaseUrl: 'https://www.yes24.com/Product/Goods/11681152',
                    icon: 'fa-solid fa-book'
                }
            ];
            this.filteredBooks = [...this.books];
        }
    }

    setupEventListeners() {
        // 검색 이벤트
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));
        }
    }

    handleSearch(query) {
        this.searchQuery = query.toLowerCase().trim();
        
        if (!this.searchQuery) {
            this.filteredBooks = [...this.books];
        } else {
            this.filteredBooks = this.books.filter(book =>
                book.title.toLowerCase().includes(this.searchQuery) ||
                book.author.toLowerCase().includes(this.searchQuery) ||
                book.publisher.toLowerCase().includes(this.searchQuery) ||
                book.description.toLowerCase().includes(this.searchQuery)
            );
        }
        
        this.renderBooks();
        this.playAnimations();
    }

    renderBooks() {
        const bookGrid = document.getElementById('bookGrid');
        if (!bookGrid) return;

        // 검색 결과 없음
        if (this.filteredBooks.length === 0) {
            bookGrid.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">
                        <i class="fa-solid fa-book"></i>
                    </div>
                    <p>검색 결과가 없습니다.</p>
                </div>
            `;
            return;
        }

        // 도서 카드 렌더링
        bookGrid.innerHTML = this.filteredBooks.map((book, index) => {
            const coverHtml = book.coverUrl 
                ? `<img src="${book.coverUrl}" alt="${book.title}" class="book-cover">`
                : `<div class="book-icon"><i class="${book.icon || 'fa-solid fa-book'}"></i></div>`;
            
            return `
                <div class="book-card" data-index="${index}">
                    ${coverHtml}
                    <div class="book-title">${book.title}</div>
                    <div class="book-author">${book.author}</div>
                    <div class="book-publisher">${book.publisher}</div>
                    <div class="book-description">${book.description}</div>
                    <div class="book-card-footer">
                        ${book.purchaseUrl ? `
                            <button class="book-btn" onclick="bookPage.openPurchasePage('${book.purchaseUrl}', '${book.title}')">
                                구매하기
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    openPurchasePage(purchaseUrl, title) {
        // 버튼 클릭 애니메이션만 (피드백 메시지 없이)
        if (typeof gsap !== 'undefined') {
            const button = event.target;
            const tl = gsap.timeline();
            
            tl.to(button, {
                scale: 0.9,
                duration: 0.1
            })
            .to(button, {
                scale: 1.1,
                duration: 0.2
            })
            .to(button, {
                scale: 1,
                duration: 0.2
            });
        }
        
        // 구매 페이지 URL이 있으면 새 탭에서 열기
        if (purchaseUrl && purchaseUrl.trim()) {
            console.log(`구매 페이지 열기: ${title} - ${purchaseUrl}`);
            window.open(purchaseUrl, '_blank');
        } else {
            console.warn(`구매 페이지 URL이 없습니다: ${title}`);
            alert('📚 구매 페이지 URL이 준비 중입니다.\n\n나중에 다시 시도해주세요.');
        }
    }

    playAnimations() {
        if (typeof animationManager !== 'undefined' && typeof gsap !== 'undefined') {
            setTimeout(() => {
                // 도서 카드 애니메이션
                gsap.fromTo('.book-card', 
                    {
                        y: 30,
                        opacity: 0,
                        scale: 0.95
                    },
                    {
                        y: 0,
                        opacity: 1,
                        scale: 1,
                        duration: 0.4,
                        stagger: 0.05,
                        ease: 'power2.out',
                        clearProps: 'all'
                    }
                );
            }, 50);
        }
    }

    updateDocumentCount() {
        const countElement = document.querySelector('.document-count');
        if (countElement) {
            countElement.textContent = `${this.books.length}권`;
        }
    }
}

// 페이지별로 인스턴스 생성
// const bookPage = new BookPage();

