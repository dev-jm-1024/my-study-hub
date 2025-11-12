// jm-github.js - GitHub 리포지토리 페이지

class GitHubPage {
    constructor() {
        this.repos = [];
        this.filteredRepos = [];
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
        // MENU_DATA에서 GitHub 리포지토리 데이터 가져오기
        if (typeof MENU_DATA !== 'undefined' && MENU_DATA.github) {
            this.repos = MENU_DATA.github;
            this.filteredRepos = [...this.repos];
        } else {
            console.error('No GitHub repository data found');
            this.repos = [];
            this.filteredRepos = [];
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
            this.filteredRepos = [...this.repos];
        } else {
            this.filteredRepos = this.repos.filter(repo =>
                repo.title.toLowerCase().includes(this.searchQuery) ||
                repo.description.toLowerCase().includes(this.searchQuery) ||
                (repo.language && repo.language.toLowerCase().includes(this.searchQuery))
            );
        }
        
        this.renderCards();
        this.playAnimations();
    }

    renderCards() {
        const cardGrid = document.getElementById('cardGrid');
        if (!cardGrid) return;

        // 검색 결과 없음
        if (this.filteredRepos.length === 0) {
            cardGrid.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">
                        <i class="fa-brands fa-github"></i>
                    </div>
                    <p>검색 결과가 없습니다.</p>
                </div>
            `;
            return;
        }

        // 카드 렌더링
        cardGrid.innerHTML = this.filteredRepos.map((repo, index) => `
            <div class="card" data-index="${index}">
                <div class="card-icon">
                    <i class="${repo.icon || 'fa-brands fa-github'}"></i>
                </div>
                <div class="card-title">${repo.title}</div>
                <div class="card-description">${repo.description}</div>
                <div class="github-repo-info">
                    ${repo.language ? `
                        <span class="github-repo-language">${repo.language}</span>
                    ` : ''}
                    ${repo.stars !== undefined && repo.stars > 0 ? `
                        <span class="github-repo-stars">
                            <i class="fa-solid fa-star"></i>
                            ${repo.stars}
                        </span>
                    ` : ''}
                </div>
                <div class="card-footer">
                    <button class="download-btn" onclick="githubPage.openRepository('${repo.repoUrl || ''}', '${repo.title}')">
                        리포지토리 보기
                    </button>
                </div>
            </div>
        `).join('');
    }

    openRepository(repoUrl, title) {
        // GSAP 애니메이션
        if (typeof animationManager !== 'undefined') {
            const button = event.target;
            animationManager.downloadButtonClick(button);
        }
        
        // GitHub 리포지토리 URL이 있으면 새 탭에서 열기
        if (repoUrl && repoUrl.trim()) {
            console.log(`리포지토리 열기: ${title} - ${repoUrl}`);
            window.open(repoUrl, '_blank');
        } else {
            console.warn(`리포지토리 URL이 없습니다: ${title}`);
            alert('📦 리포지토리 URL이 준비 중입니다.\n\n나중에 다시 시도해주세요.');
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
            countElement.textContent = `${this.repos.length}개 리포지토리`;
        }
    }
}

// 페이지별로 인스턴스 생성
// const githubPage = new GitHubPage();

