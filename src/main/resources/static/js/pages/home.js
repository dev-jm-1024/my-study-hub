// home.js - 홈페이지 로직

class HomePage {
    constructor() {
        this.categories = [];
        this.init();
    }

    init() {
        console.log('HomePage.init() called');
        
        // 데이터 로드
        this.loadCategories();
        console.log('Categories loaded:', this.categories.length);
        
        // 카테고리 카드 렌더링
        this.renderCategories();
        console.log('Categories rendered');
        
        // 이벤트 설정 (렌더링 후 약간의 딜레이)
        setTimeout(() => {
            this.setupEvents();
            console.log('Events setup completed');
        }, 100);
        
        // 애니메이션 (약간 딜레이)
        setTimeout(() => {
            this.playAnimations();
        }, 200);
    }

    loadCategories() {
        // MENUS와 MENU_DATA에서 카테고리 정보 가져오기
        if (typeof MENUS !== 'undefined' && typeof MENU_DATA !== 'undefined') {
            this.categories = MENUS.map(menu => ({
                ...menu,
                count: MENU_DATA[menu.key] ? MENU_DATA[menu.key].length : 0
            }));
        }
    }

    renderCategories() {
        const grid = document.getElementById('categoryGrid');
        if (!grid) {
            console.error('categoryGrid element not found!');
            return;
        }
        
        console.log('Rendering', this.categories.length, 'categories');

        grid.innerHTML = this.categories.map((category, index) => {
            // svg로 끝나는지 체크
            const isSvg = category.icon.endsWith('.svg');
            const iconHTML = isSvg 
                ? `<img src="${category.icon}" alt="${category.name}" class="category-icon">` 
                : `<i class="${category.icon} category-icon"></i>`;
            
            // 특수 케이스 처리
            let href;
            let target = '';
            if (category.key === 'senior-center-search') {
                href = 'https://senior-citizen-app-841691750528.asia-northeast3.run.app/';
                target = 'target="_blank"';
            } else if (category.key === 'github') {
                href = 'jm-github.html';
            } else {
                // 키를 소문자로 변환하여 파일명 생성 (JUnit -> junit)
                const normalizedKey = category.key.toLowerCase();
                href = `download-${normalizedKey}.html`;
            }
            
            return `
                <a href="${href}" ${target} class="category-card" data-index="${index}">
                    ${iconHTML}
                    <div class="category-name">${category.name}</div>
                    <div class="category-count">${category.count}개 문서</div>
                </a>
            `;
        }).join('');
    }
    playAnimations() {
        // 임시로 애니메이션 비활성화 (디버깅용)
        return;
        
        if (typeof gsap !== 'undefined') {
            // Hero 애니메이션
            gsap.from('.hero-title', {
                y: 30,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out',
                clearProps: 'all'
            });

            gsap.from('.hero-subtitle', {
                y: 20,
                opacity: 0,
                duration: 0.6,
                delay: 0.2,
                ease: 'power2.out',
                clearProps: 'all'
            });

            gsap.from('.hero-link', {
                y: 20,
                opacity: 0,
                duration: 0.5,
                stagger: 0.1,
                delay: 0.4,
                ease: 'power2.out',
                clearProps: 'all'
            });

            // 카테고리 카드 애니메이션
            gsap.from('.category-card', {
                y: 50,
                opacity: 0,
                duration: 0.6,
                stagger: 0.05,
                delay: 0.6,
                ease: 'power2.out',
                clearProps: 'all'
            });
        }
    }

    setupEvents() {
        // 검색 기능 (선택사항)
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));
        }
        
        // 카테고리 카드 이벤트 처리 (모바일 최적화)
        // 여러 번 시도하여 확실히 바인딩
        this.attachCardEvents();
        
        // DOM 변경 감지 (동적 추가된 카드도 처리)
        const observer = new MutationObserver(() => {
            this.attachCardEvents();
        });
        
        const grid = document.getElementById('categoryGrid');
        if (grid) {
            observer.observe(grid, { childList: true, subtree: true });
        }
    }
    
    attachCardEvents() {
        const categoryCards = document.querySelectorAll('.category-card');
        console.log('=== attachCardEvents called ===');
        console.log('Found category cards:', categoryCards.length);
        
        if (categoryCards.length === 0) {
            console.warn('No category cards found!');
            return;
        }
        
        categoryCards.forEach((card, index) => {
            // 이미 이벤트가 바인딩되어 있는지 확인
            if (card.dataset.eventsAttached === 'true') {
                console.log(`Card ${index} already has events attached`);
                return;
            }
            
            card.dataset.eventsAttached = 'true';
            console.log(`Attaching events to card ${index}:`, card.href);
            
            // 클릭 이벤트 (PC 및 모바일 모두)
            card.addEventListener('click', (e) => {
                console.log('=== Category card CLICKED ===');
                console.log('Href:', card.href);
                console.log('Text:', card.textContent.trim());
                console.log('Event:', e);
                
                // 모바일에서 링크가 작동하지 않는 경우 수동으로 이동
                if (e.target.closest('.category-card')) {
                    const href = card.getAttribute('href');
                    const target = card.getAttribute('target');
                    
                    if (href) {
                        console.log('Manually navigating to:', href);
                        if (target === '_blank') {
                            window.open(href, '_blank');
                        } else {
                            window.location.href = href;
                        }
                    }
                }
                // 링크의 기본 동작도 유지
            }, { passive: false });
            
            // 터치 이벤트 (모바일)
            card.addEventListener('touchend', (e) => {
                console.log('=== Category card TOUCHED ===');
                console.log('Href:', card.href);
                console.log('Event:', e);
                // 링크의 기본 동작은 유지
            }, { passive: true });
            
            // 터치 시작 (디버깅용)
            card.addEventListener('touchstart', (e) => {
                console.log('=== Category card TOUCH STARTED ===');
                console.log('Href:', card.href);
            }, { passive: true });
            
            // 마우스 다운 (디버깅용)
            card.addEventListener('mousedown', (e) => {
                console.log('=== Category card MOUSE DOWN ===');
                console.log('Href:', card.href);
            }, { passive: true });
        });
        
        console.log('=== Events attached to', categoryCards.length, 'cards ===');
    }

    handleSearch(query) {
        const searchTerm = query.toLowerCase().trim();
        const cards = document.querySelectorAll('.category-card');

        cards.forEach(card => {
            const name = card.querySelector('.category-name').textContent.toLowerCase();
            
            if (!searchTerm || name.includes(searchTerm)) {
                card.style.display = 'block';
                gsap.to(card, {
                    opacity: 1,
                    scale: 1,
                    duration: 0.3
                });
            } else {
                gsap.to(card, {
                    opacity: 0,
                    scale: 0.9,
                    duration: 0.3,
                    onComplete: () => {
                        card.style.display = 'none';
                    }
                });
            }
        });
    }
}

// 페이지 로드 시 초기화
let homePage;

// DOMContentLoaded와 load 이벤트 모두 처리
function initializeHomePage() {
    console.log('Initializing HomePage...');
    console.log('Document ready state:', document.readyState);
    console.log('categoryGrid exists:', !!document.getElementById('categoryGrid'));
    
    if (!homePage) {
        console.log('Creating new HomePage instance...');
        homePage = new HomePage();
    } else {
        console.log('HomePage already exists');
    }
}

// DOMContentLoaded에서 먼저 시도
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOMContentLoaded fired');
        initializeHomePage();
    });
} else {
    // 이미 로드된 경우 즉시 실행
    console.log('Document already loaded, initializing immediately');
    initializeHomePage();
}

// load 이벤트에서도 시도 (백업)
window.addEventListener('load', () => {
    console.log('Window load event fired');
    if (!homePage) {
        console.log('HomePage not initialized, creating now...');
        homePage = new HomePage();
    } else {
        console.log('HomePage already initialized');
    }
});