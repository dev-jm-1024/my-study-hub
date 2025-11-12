// app.js - Vue 앱 메인 로직

const { createApp } = Vue;

createApp({
    data() {
        return {
            menus: MENUS,
            activeMenu: 'api',
            pageTitle: 'API 관련 문서',
            currentCards: [],
            searchQuery: '',
            isDark: themeManager.isDark()
        };
    },
    
    computed: {
        // 검색 필터링된 카드
        filteredCards() {
            if (!this.searchQuery.trim()) {
                return this.currentCards;
            }
            
            const query = this.searchQuery.toLowerCase();
            return this.currentCards.filter(card => 
                card.title.toLowerCase().includes(query) ||
                card.description.toLowerCase().includes(query)
            );
        }
    },
    
    methods: {
        // 메뉴 선택
        selectMenu(menuKey, menuName) {
            if (this.activeMenu === menuKey) return;
            
            // 페이지 전환 애니메이션
            if (typeof animationManager !== 'undefined') {
                animationManager.pageTransition(() => {
                    this.activeMenu = menuKey;
                    this.pageTitle = `${menuName} 관련 문서`;
                    this.currentCards = MENU_DATA[menuKey] || [];
                    this.searchQuery = '';
                    
                    // 새 카드 애니메이션
                    this.$nextTick(() => {
                        animationManager.animateCards();
                        animationManager.animateTitle();
                    });
                });
            } else {
                // 애니메이션 없이 바로 전환
                this.activeMenu = menuKey;
                this.pageTitle = `${menuName} 관련 문서`;
                this.currentCards = MENU_DATA[menuKey] || [];
                this.searchQuery = '';
            }
        },
        
        // 테마 토글
        toggleTheme() {
            this.isDark = themeManager.toggle();
        },
        
        // 검색 처리
        handleSearch() {
            if (typeof animationManager === 'undefined') return;
            
            // 검색 결과 없을 때 애니메이션
            if (this.filteredCards.length === 0) {
                this.$nextTick(() => {
                    animationManager.noResultsAnimation();
                });
            } else {
                // 검색 결과 카드 애니메이션
                this.$nextTick(() => {
                    animationManager.animateCards();
                });
            }
        },
        
        // 문서 열기
        openDocument(card) {
            console.log('문서 열기:', card.title);
            // TODO: 실제 문서 페이지로 이동
            // window.location.href = `/docs/${this.activeMenu}/${card.slug}.html`;
        },
        
        // PDF 다운로드
        downloadPDF(title) {
            const button = event.target;
            
            if (typeof animationManager !== 'undefined') {
                animationManager.downloadButtonClick(button);
            }
            
            console.log('PDF 다운로드:', title);
            // TODO: 실제 다운로드 로직
            // window.location.href = `/downloads/${title}.pdf`;
        }
    },
    
    mounted() {
        // 초기 카드 로드
        this.currentCards = MENU_DATA[this.activeMenu] || [];
        
        // 초기 카드 애니메이션
        if (typeof animationManager !== 'undefined') {
            this.$nextTick(() => {
                animationManager.animateCards();
            });
        }
    }
}).mount('#app');