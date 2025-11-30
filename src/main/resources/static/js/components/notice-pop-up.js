// notice-pop-up.js - 공지사항 팝업 관리

/**
 * ============================================
 * 팝업 메시지 수정 위치 2: JavaScript 설정
 * ============================================
 * 
 * 아래 noticeConfig 객체를 수정하여 팝업 메시지를 변경할 수 있습니다.
 * 
 * 수정 방법:
 * 1. title: 팝업 제목 변경
 * 2. message: 팝업 메시지 변경
 * 3. showDetails: true로 설정하면 추가 정보 표시
 * 4. details: 추가 정보 내용 (배열로 여러 항목 추가 가능)
 * 
 * 예시:
 * const noticeConfig = {
 *     title: "새로운 기능이 추가되었습니다!",
 *     message: "최신 기능을 확인해보세요.",
 *     showDetails: true,
 *     details: ["기능 1", "기능 2", "기능 3"]
 * };
 */
const noticeConfig = {
    // 팝업 제목
    title: "새로운 문서가 추가되었습니다!",
    
    // 팝업 메시지
    message: "최신 학습 자료를 확인해보세요.",
    
    // 추가 정보 표시 여부
    showDetails: true,
    
    // 추가 정보 내용 (배열로 여러 항목 추가 가능)
    details: [
        "Spring Boot",
        "MySQL", 
        "Java"
    ]
};

class NoticePopup {
    constructor() {
        this.popup = null;
        this.closeButton = null;
        this.overlay = null;
        this.isVisible = false;
        this.config = noticeConfig; // 설정 저장
        this.init();
    }

    init() {
        // 팝업 요소 찾기
        this.popup = document.getElementById('noticePopup');
        if (!this.popup) {
            console.warn('Notice popup element not found');
            return;
        }

        this.closeButton = document.getElementById('noticePopupClose');
        this.overlay = this.popup.querySelector('.notice-popup-overlay');

        // 메시지 업데이트 (설정된 내용으로)
        this.updateMessage();

        // 이벤트 리스너 설정
        this.setupEventListeners();
    }

    /**
     * 팝업 메시지를 설정된 내용으로 업데이트
     */
    updateMessage() {
        const titleElement = document.getElementById('noticePopupTitle');
        const messageElement = document.getElementById('noticePopupMessage');
        const detailsElement = document.getElementById('noticePopupDetails');

        // 제목 업데이트
        if (titleElement && this.config.title) {
            titleElement.textContent = this.config.title;
        }

        // 메시지 업데이트
        if (messageElement && this.config.message) {
            messageElement.textContent = this.config.message;
        }

        // 추가 정보 업데이트
        if (detailsElement && this.config.showDetails && this.config.details && this.config.details.length > 0) {
            // 추가 정보를 리스트 형태로 표시
            const detailsHTML = `
                <div class="notice-popup-details-list">
                    ${this.config.details.map(detail => `
                        <div class="notice-popup-detail-item">
                            <i class="fa-solid fa-check-circle"></i>
                            <span>${detail}</span>
                        </div>
                    `).join('')}
                </div>
            `;
            detailsElement.innerHTML = detailsHTML;
            detailsElement.style.display = 'block';
        } else if (detailsElement) {
            detailsElement.style.display = 'none';
        }
    }

    setupEventListeners() {
        // 닫기 버튼 클릭
        if (this.closeButton) {
            this.closeButton.addEventListener('click', () => {
                this.hide();
            });
        }

        // 오버레이 클릭 시 닫기
        if (this.overlay) {
            this.overlay.addEventListener('click', () => {
                this.hide();
            });
        }

        // ESC 키로 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
    }

    show() {
        if (!this.popup) return;

        this.isVisible = true;
        this.popup.classList.add('show');
        
        // GSAP 애니메이션 (사용 가능한 경우)
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(this.popup.querySelector('.notice-popup-content'),
                {
                    scale: 0.9,
                    y: 20,
                    opacity: 0
                },
                {
                    scale: 1,
                    y: 0,
                    opacity: 1,
                    duration: 0.4,
                    ease: 'back.out(1.7)'
                }
            );

            gsap.fromTo(this.popup.querySelector('.notice-popup-overlay'),
                {
                    opacity: 0
                },
                {
                    opacity: 1,
                    duration: 0.3,
                    ease: 'power2.out'
                }
            );
        }

        // 스크롤 방지
        document.body.style.overflow = 'hidden';
    }

    hide() {
        if (!this.popup) return;

        // GSAP 애니메이션 (사용 가능한 경우)
        if (typeof gsap !== 'undefined') {
            const content = this.popup.querySelector('.notice-popup-content');
            const overlay = this.popup.querySelector('.notice-popup-overlay');

            const tl = gsap.timeline({
                onComplete: () => {
                    this.popup.classList.remove('show');
                    this.isVisible = false;
                    document.body.style.overflow = '';
                }
            });

            tl.to(content, {
                scale: 0.9,
                y: 20,
                opacity: 0,
                duration: 0.3,
                ease: 'power2.in'
            })
            .to(overlay, {
                opacity: 0,
                duration: 0.2,
                ease: 'power2.in'
            }, '-=0.2');
        } else {
            // GSAP이 없는 경우 CSS 트랜지션 사용
            this.popup.classList.remove('show');
            this.isVisible = false;
            document.body.style.overflow = '';
        }
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
}

// 전역 인스턴스
let noticePopup;

// 초기화 함수 (외부에서 호출 가능)
function initNoticePopup() {
    if (!noticePopup) {
        noticePopup = new NoticePopup();
    }
    return noticePopup;
}

// DOMContentLoaded 시 초기화 시도
document.addEventListener('DOMContentLoaded', () => {
    // 컴포넌트가 이미 로드된 경우
    if (document.getElementById('noticePopup')) {
        noticePopup = new NoticePopup();
    }
});

// 컴포넌트가 동적으로 로드된 후에도 초기화 가능하도록
// 전역 함수로 export
window.initNoticePopup = initNoticePopup;

