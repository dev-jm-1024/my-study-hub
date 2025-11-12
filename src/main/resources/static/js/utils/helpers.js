// helpers.js - 유틸리티 함수들

/**
 * 디바운스 함수
 * @param {Function} func - 실행할 함수
 * @param {number} wait - 대기 시간(ms)
 * @returns {Function}
 */
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 쓰로틀 함수
 * @param {Function} func - 실행할 함수
 * @param {number} limit - 제한 시간(ms)
 * @returns {Function}
 */
function throttle(func, limit = 300) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * URL 파라미터 가져오기
 * @param {string} param - 파라미터 이름
 * @returns {string|null}
 */
function getUrlParameter(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

/**
 * 로컬 스토리지 안전하게 저장
 * @param {string} key - 키
 * @param {any} value - 값
 */
function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('LocalStorage save error:', error);
        return false;
    }
}

/**
 * 로컬 스토리지에서 가져오기
 * @param {string} key - 키
 * @returns {any|null}
 */
function loadFromStorage(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error('LocalStorage load error:', error);
        return null;
    }
}

/**
 * 파일 다운로드 트리거
 * @param {string} url - 다운로드 URL
 * @param {string} filename - 파일명
 */
function downloadFile(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * 검색 하이라이트
 * @param {string} text - 원본 텍스트
 * @param {string} query - 검색어
 * @returns {string} HTML 문자열
 */
function highlightText(text, query) {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

/**
 * 날짜 포맷팅
 * @param {Date|string} date - 날짜
 * @returns {string} YYYY-MM-DD 형식
 */
function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * 배열 섞기 (Fisher-Yates)
 * @param {Array} array - 섞을 배열
 * @returns {Array} 섞인 배열
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}