// animations.js - GSAP 애니메이션

class AnimationManager {
    constructor() {
        // GSAP이 로드될 때까지 대기
        if (typeof gsap === 'undefined') {
            console.warn('GSAP이 아직 로드되지 않았습니다.');
            return;
        }
        this.init();
    }

    init() {
        // 페이지 로드 시 초기 애니메이션
        this.pageLoadAnimation();
    }

    // 페이지 로드 애니메이션
    pageLoadAnimation() {
        if (typeof gsap === 'undefined') return;
        
        const tl = gsap.timeline();

        tl.from('.header', {
            y: -100,
            opacity: 0,
            duration: 0.6,
            ease: 'power3.out'
        })
        .from('.sidebar .menu-item', {
            x: -50,
            opacity: 0,
            duration: 0.4,
            stagger: 0.05,
            ease: 'power2.out'
        }, '-=0.3')
        .from('.page-title', {
            y: 30,
            opacity: 0,
            duration: 0.5,
            ease: 'power2.out'
        }, '-=0.2');
    }

    // 카드 애니메이션 (메뉴 전환 시) - 빠른 버전
    animateCards() {
        if (typeof gsap === 'undefined') return;
        
        gsap.fromTo('.card', 
            {
                y: 30,  // 50 → 30 (덜 움직임)
                opacity: 0,
                scale: 0.95  // 0.9 → 0.95 (덜 축소)
            },
            {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.4,  // 0.5 → 0.4
                stagger: 0.05,  // 0.1 → 0.05 (더 빠름)
                ease: 'power2.out',  // back.out보다 빠름
                clearProps: 'all'
            }
        );
    }

    // 제목 전환 애니메이션 - 빠른 버전
    animateTitle() {
        if (typeof gsap === 'undefined') return;
        
        gsap.fromTo('#pageTitle',
            {
                x: -20,  // 30 → 20
                opacity: 0
            },
            {
                x: 0,
                opacity: 1,
                duration: 0.3,  // 0.5 → 0.3
                ease: 'power2.out'
            }
        );
    }

    // 카드 호버 효과 (GSAP 버전)
    cardHoverEffect(card) {
        if (typeof gsap === 'undefined') return;
        
        gsap.to(card, {
            y: -10,
            scale: 1.02,
            duration: 0.3,
            ease: 'power2.out'
        });
    }

    cardLeaveEffect(card) {
        if (typeof gsap === 'undefined') return;
        
        gsap.to(card, {
            y: 0,
            scale: 1,
            duration: 0.3,
            ease: 'power2.out'
        });
    }

    // 다운로드 버튼 클릭 애니메이션
    downloadButtonClick(button) {
        if (typeof gsap === 'undefined') return;
        
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

        // 성공 피드백
        this.showSuccessFeedback(button);
    }

    // 성공 피드백 표시
    showSuccessFeedback(element) {
        if (typeof gsap === 'undefined') return;
        
        const feedback = document.createElement('div');
        feedback.textContent = '✓ 다운로드 준비 중';
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--success);
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            font-weight: 600;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 1000;
        `;
        
        document.body.appendChild(feedback);

        gsap.fromTo(feedback,
            { scale: 0, opacity: 0 },
            { 
                scale: 1, 
                opacity: 1, 
                duration: 0.3,
                ease: 'back.out(1.7)',
                onComplete: () => {
                    setTimeout(() => {
                        gsap.to(feedback, {
                            scale: 0,
                            opacity: 0,
                            duration: 0.3,
                            onComplete: () => feedback.remove()
                        });
                    }, 1500);
                }
            }
        );
    }

    // 검색 결과 없음 애니메이션
    noResultsAnimation() {
        if (typeof gsap === 'undefined') return;
        
        gsap.fromTo('.no-results',
            { scale: 0.8, opacity: 0 },
            { 
                scale: 1, 
                opacity: 1, 
                duration: 0.5,
                ease: 'elastic.out(1, 0.5)'
            }
        );
    }

    // 페이지 전환 효과 (빠른 버전)
    pageTransition(onComplete) {
        if (typeof gsap === 'undefined') {
            onComplete && onComplete();
            return;
        }
        
        const tl = gsap.timeline({
            onComplete: onComplete
        });

        // 더 빠르게: duration 줄이고, stagger 줄임
        tl.to('.card', {
            opacity: 0,
            duration: 0.2,  // 0.3 → 0.2
            stagger: 0.02,  // 0.05 → 0.02
            ease: 'power2.in'
        })
        .to('.page-title', {
            opacity: 0,
            duration: 0.15,  // 0.3 → 0.15
            ease: 'power2.in'
        }, '-=0.15');  // 동시에 시작
    }
}

// 전역 인스턴스 생성 (GSAP 로드 후)
let animationManager;
if (typeof gsap !== 'undefined') {
    animationManager = new AnimationManager();
} else {
    // GSAP이 로드되면 생성
    window.addEventListener('DOMContentLoaded', () => {
        animationManager = new AnimationManager();
    });
}