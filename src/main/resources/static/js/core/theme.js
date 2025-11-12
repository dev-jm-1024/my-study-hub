// theme.js - 다크모드 관리

class ThemeManager {
    constructor() {
        this.THEME_KEY = 'tech-docs-theme';
        this.init();
    }

    init() {
        // 저장된 테마 불러오기
        const savedTheme = localStorage.getItem(this.THEME_KEY);
        if (savedTheme === 'dark') {
            document.body.classList.add('dark');
        }
    }

    toggle() {
        const isDark = document.body.classList.toggle('dark');
        localStorage.setItem(this.THEME_KEY, isDark ? 'dark' : 'light');
        
        // 애니메이션 효과
        this.animateThemeChange();
        
        return isDark;
    }

    animateThemeChange() {
        // GSAP로 부드러운 테마 전환 애니메이션
        gsap.fromTo('body', 
            { opacity: 0.95 },
            { 
                opacity: 1, 
                duration: 0.3,
                ease: 'power2.out'
            }
        );
    }

    isDark() {
        return document.body.classList.contains('dark');
    }
}

// 전역 인스턴스
const themeManager = new ThemeManager();