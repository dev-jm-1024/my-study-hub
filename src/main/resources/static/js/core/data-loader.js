// data-loader.js - 동적 데이터 로더 (간단한 난독화)

(function() {
    'use strict';
    
    // 데이터를 인코딩된 형태로 저장 (간단한 Base64 인코딩)
    // 실제로는 더 강력한 암호화를 사용할 수 있습니다
    const encodedData = btoa(JSON.stringify({
        // 여기에 실제 데이터를 넣지 않고, 동적으로 로드하도록 변경
        // 또는 서버 API를 통해 데이터를 가져오도록 변경
    }));
    
    // 데이터 로드 함수
    function loadData() {
        // 방법 1: 현재 페이지에서만 데이터 사용 가능하도록 체크
        if (typeof window === 'undefined' || !window.location) {
            console.error('Invalid access');
            return null;
        }
        
        // 방법 2: Referer 체크 (같은 도메인에서만 접근)
        const referer = document.referrer;
        const currentDomain = window.location.hostname;
        
        // 직접 URL 접근 시 차단
        if (!referer || !referer.includes(currentDomain)) {
            console.warn('Direct access to data file is not allowed');
            // 빈 데이터 반환 또는 에러 처리
            return null;
        }
        
        // 정상적인 경우에만 데이터 반환
        return decodeData(encodedData);
    }
    
    function decodeData(encoded) {
        try {
            return JSON.parse(atob(encoded));
        } catch (e) {
            console.error('Failed to decode data');
            return null;
        }
    }
    
    // 전역으로 export
    window.DataLoader = {
        load: loadData
    };
})();

