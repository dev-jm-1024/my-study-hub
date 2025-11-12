// download.js - 다운로드 페이지 공통 로직

class DownloadPage {
    constructor(category) {
        this.category = category;
        this.cards = [];
        this.filteredCards = [];
        this.searchQuery = '';
        this.init();
    }

    init() {
        // 데이터 로드
        this.loadData();
        
        // 이벤트 리스너 설정
        this.setupEventListeners();
        
        // 카드 렌더링
        this.renderCards();
        
        // 애니메이션
        this.playAnimations();
    }

    loadData() {
        // MENU_DATA에서 해당 카테고리 데이터 가져오기
        if (typeof MENU_DATA !== 'undefined' && MENU_DATA[this.category]) {
            this.cards = MENU_DATA[this.category];
            this.filteredCards = [...this.cards];
        } else {
            console.error(`No data found for category: ${this.category}`);
            this.cards = [];
            this.filteredCards = [];
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
            this.filteredCards = [...this.cards];
        } else {
            this.filteredCards = this.cards.filter(card =>
                card.title.toLowerCase().includes(this.searchQuery) ||
                card.description.toLowerCase().includes(this.searchQuery)
            );
        }
        
        this.renderCards();
        this.playAnimations();
    }

    renderCards() {
        const cardGrid = document.getElementById('cardGrid');
        if (!cardGrid) return;

        // 검색 결과 없음
        if (this.filteredCards.length === 0) {
            cardGrid.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">🔍</div>
                    <p>검색 결과가 없습니다.</p>
                </div>
            `;
            return;
        }

        // 카드 렌더링
        cardGrid.innerHTML = this.filteredCards.map((card, index) => `
            <div class="card" data-index="${index}">
                <i class="${card.icon}"></i>
                <div class="card-title">${card.title}</div>
                <div class="card-description">${card.description}</div>
                <div class="card-footer">
                    <button class="download-btn" onclick="downloadPage.downloadPDF('${card.pdfUrl || ''}', '${card.title}')">
                         다운로드
                    </button>
                </div>
            </div>
        `).join('');
    }

    async downloadPDF(pdfUrl, title) {
        // GSAP 애니메이션
        if (typeof animationManager !== 'undefined') {
            const button = event.target;
            animationManager.downloadButtonClick(button);
        }
        
        // PDF URL이 있으면 다운로드
        if (pdfUrl && pdfUrl.trim()) {
            console.log(`다운로드: ${title} - ${pdfUrl}`);
            
            // 외부 URL인지 확인
            const isExternalUrl = pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://');
            
            setTimeout(async () => {
                if (isExternalUrl) {
                    // 방법 1: 새 탭에서 열기 (가장 안전)
                    window.open(pdfUrl, '_blank');
                    
                    // 선택: fetch로 다운로드 시도 (CORS 허용된 경우만)
                    /* 
                    try {
                        const response = await fetch(pdfUrl);
                        const blob = await response.blob();
                        const blobUrl = URL.createObjectURL(blob);
                        
                        const link = document.createElement('a');
                        link.href = blobUrl;
                        link.download = `${title}.pdf`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        
                        URL.revokeObjectURL(blobUrl);
                    } catch (error) {
                        console.error('다운로드 실패:', error);
                        window.open(pdfUrl, '_blank');
                    }
                    */
                } else {
                    // 내부 URL - 직접 다운로드
                    const link = document.createElement('a');
                    link.href = pdfUrl;
                    link.download = pdfUrl.split('/').pop();
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            }, 500);
        } else {
            console.warn(`PDF URL이 없습니다: ${title}`);
            alert('📄 PDF 파일이 준비 중입니다.\n\n나중에 다시 시도해주세요.');
        }
    }

    playAnimations() {
        if (typeof animationManager !== 'undefined') {
            setTimeout(() => {
                animationManager.animateCards();
            }, 50);
        }
    }

    updateDocumentCount() {
        const countElement = document.querySelector('.document-count');
        if (countElement) {
            countElement.textContent = `${this.cards.length}개 문서`;
        }
    }
}

// 페이지별로 인스턴스 생성
// 예: const downloadPage = new DownloadPage('spring');