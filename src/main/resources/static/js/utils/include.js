// include.js - 컴포넌트 로드 유틸리티

/**
 * 현재 페이지의 루트 경로를 계산하는 함수
 * @returns {string} 루트 경로
 */
function getBasePath() {
    const path = window.location.pathname;
    
    console.log('getBasePath - pathname:', path);
    console.log('getBasePath - hostname:', window.location.hostname);
    console.log('getBasePath - href:', window.location.href);
    
    // 프로젝트 구조: 모든 HTML 파일과 components 폴더가 같은 루트 레벨에 있음
    // 따라서 모든 경우에 빈 문자열 반환
    console.log('getBasePath - all files are at root level, returning empty string');
    return '';
}

/**
 * HTML 컴포넌트를 로드하는 함수
 * @param {string} selector - 대상 요소 선택자
 * @param {string} path - 로드할 HTML 파일 경로
 * @returns {Promise}
 */
function loadComponent(selector, path) {
    // 절대 경로가 아니면 베이스 경로 추가
    const basePath = getBasePath();
    const fullPath = path.startsWith('http') || path.startsWith('/') ? path : basePath + path;
    
    console.log('loadComponent - selector:', selector);
    console.log('loadComponent - original path:', path);
    console.log('loadComponent - basePath:', basePath);
    console.log('loadComponent - fullPath:', fullPath);
    
    return fetch(fullPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load ${fullPath}: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            const element = document.querySelector(selector);
            if (element) {
                // 로드된 HTML 내부의 상대 경로를 수정
                let modifiedHtml = html;
                const basePathForAssets = basePath || './';
                
                // img src 속성 수정 (svg/로 시작하는 상대 경로)
                modifiedHtml = modifiedHtml.replace(/src="(svg\/[^"]+)"/g, (match, path) => {
                    if (!path.startsWith('http') && !path.startsWith('/')) {
                        return `src="${basePathForAssets}${path}"`;
                    }
                    return match;
                });
                
                // href 속성 수정 (상대 경로인 경우만)
                modifiedHtml = modifiedHtml.replace(/href="([^"]+\.html)"/g, (match, path) => {
                    if (!path.startsWith('http') && !path.startsWith('/') && !path.startsWith('../') && !path.startsWith('./')) {
                        return `href="${basePathForAssets}${path}"`;
                    }
                    return match;
                });
                
                element.innerHTML = modifiedHtml;
                console.log(`Successfully loaded component: ${selector}`);
            } else {
                console.warn(`Element not found: ${selector}`);
            }
        })
        .catch(error => {
            console.error('Component load error:', error);
            console.error('Attempted path:', fullPath);
        });
}

/**
 * 여러 컴포넌트를 한번에 로드
 * @param {Array} components - [{selector, path}] 형태의 배열
 * @returns {Promise}
 */
function loadComponents(components) {
    const promises = components.map(comp => 
        loadComponent(comp.selector, comp.path)
    );
    return Promise.all(promises);
}

/**
 * 현재 페이지에 맞는 사이드바 메뉴 활성화
 */
function activateCurrentMenu() {
    const currentPage = window.location.pathname.split('/').pop();
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        if (item.dataset.page === currentPage) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

/**
 * 페이지 초기화 (헤더, 사이드바 로드 + 이벤트 초기화)
 * @returns {Promise}
 */
async function initPage() {
    try {
        // 1. 컴포넌트 로드 (존재하는 요소만)
        const componentsToLoad = [];
        
        // 헤더는 모든 페이지에 있음
        if (document.getElementById('header')) {
            componentsToLoad.push({ selector: '#header', path: 'components/header.html' });
        }
        
        // 사이드바는 일부 페이지에만 있음
        if (document.getElementById('sidebar')) {
            componentsToLoad.push({ selector: '#sidebar', path: 'components/sidebar.html' });
        }
        
        console.log('Loading components:', componentsToLoad.map(c => c.selector));
        
        if (componentsToLoad.length > 0) {
            await loadComponents(componentsToLoad);
        }
        
        // 컴포넌트 로드 후 약간의 딜레이 (DOM 업데이트 대기)
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // 2. 사이드바 활성화
        activateCurrentMenu();
        
        // 3. 테마 토글 버튼 이벤트
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle && typeof themeManager !== 'undefined') {
            // 초기 상태 설정
            if (themeManager.isDark()) {
                themeToggle.classList.add('active');
            } else {
                themeToggle.classList.remove('active');
            }
            
            themeToggle.addEventListener('click', () => {
                const isDark = themeManager.toggle();
                if (isDark) {
                    themeToggle.classList.add('active');
                } else {
                    themeToggle.classList.remove('active');
                }
            });
        } else {
            console.warn('Theme toggle or themeManager not found');
        }
        
        // 4. 로고 클릭 이벤트 (홈으로)
        setTimeout(() => {
            const logo = document.querySelector('.logo');
            if (logo) {
                logo.addEventListener('click', () => {
                    const basePath = getBasePath();
                    window.location.href = basePath + 'index.html';
                });
            }
        }, 100);
        
        // 5. 모바일 햄버거 메뉴 토글
        setupMobileMenu();
        
        return true;
    } catch (error) {
        console.error('Page initialization error:', error);
        console.error('Error stack:', error.stack);
        return false;
    }
}

/**
 * 모바일 메뉴 토글 기능 설정
 */
function setupMobileMenu() {
    // 약간의 딜레이 후 실행 (컴포넌트 로드 대기)
    setTimeout(() => {
        const menuToggle = document.getElementById('mobileMenuToggle');
        const sidebar = document.querySelector('.sidebar');
        
        // 사이드바가 없는 페이지(index.html 등)에서는 버튼 숨김
        if (!sidebar && menuToggle) {
            menuToggle.style.display = 'none';
            return;
        }
        
        if (!menuToggle || !sidebar) {
            console.warn('Mobile menu elements not found:', {
                menuToggle: !!menuToggle,
                sidebar: !!sidebar
            });
            return;
        }
        
        // 오버레이 동적 생성 (사이드바가 있는 페이지에서만)
        let overlay = document.getElementById('sidebarOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'sidebarOverlay';
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);
            console.log('Overlay created dynamically');
        }
        
        // 초기 상태 확실히 설정 (닫힌 상태)
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-label', '메뉴 열기');
        menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
        document.body.style.overflow = ''; // 스크롤 복원
        
        console.log('Mobile menu initialized - sidebar and overlay closed');
        
        initMobileMenuHandlers(menuToggle, sidebar, overlay);
    }, 100);
}

function initMobileMenuHandlers(menuToggle, sidebar, overlay) {
    
    // 메뉴 열기/닫기 함수
    function toggleMenu() {
        const isActive = sidebar.classList.contains('active');
        
        if (isActive) {
            closeMenu();
        } else {
            openMenu();
        }
    }
    
    function openMenu() {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        menuToggle.classList.add('active');
        menuToggle.setAttribute('aria-label', '메뉴 닫기');
        menuToggle.innerHTML = '<i class="fa-solid fa-times"></i>';
        document.body.style.overflow = 'hidden'; // 스크롤 방지
    }
    
    function closeMenu() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-label', '메뉴 열기');
        menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
        document.body.style.overflow = ''; // 스크롤 복원
    }
    
    // 햄버거 버튼 클릭
    menuToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
    });
    
    // 오버레이 클릭 시 닫기
    overlay.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeMenu();
    });
    
    // 사이드바 메뉴 아이템 클릭 시 닫기 (모바일에서만)
    // 링크의 기본 동작은 유지하면서 사이드바만 닫기
    const menuItems = sidebar.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        // 클릭 이벤트 (모바일에서 사이드바 닫기)
        item.addEventListener('click', (e) => {
            // 링크의 기본 동작은 유지 (preventDefault 호출 안 함)
            if (window.innerWidth <= 768) {
                setTimeout(closeMenu, 300); // 애니메이션 후 닫기
            }
        });
        
        // 터치 이벤트도 처리 (모바일 최적화)
        item.addEventListener('touchend', (e) => {
            // 터치 이벤트가 클릭 이벤트로 변환되도록 허용
            // 기본 동작은 유지
            if (window.innerWidth <= 768) {
                setTimeout(closeMenu, 300);
            }
        }, { passive: true });
    });
    
    // ESC 키로 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('active')) {
            closeMenu();
        }
    });
    
    // 화면 크기 변경 시 사이드바 상태 초기화
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth > 768) {
                closeMenu();
            }
        }, 250);
    });
}

// DOMContentLoaded 이벤트에서 자동 초기화
document.addEventListener('DOMContentLoaded', () => {
    // index.html은 자체 초기화 로직이 있으므로 제외
    const isIndexPage = window.location.pathname === '/' || 
                       window.location.pathname === '/index.html' || 
                       window.location.pathname.endsWith('/index.html') ||
                       window.location.pathname.endsWith('index.html');
    
    if (!isIndexPage) {
        initPage();
    }
});