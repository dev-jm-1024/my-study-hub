// data.js - 데이터 관리

const MENU_DATA = {
    exception: [
        { icon: 'fa-solid fa-exclamation-triangle', title: 'Spring Boot 예외상황', description: '프로젝트 예외 기록 및 해결법법', pdfUrl: '' }
    ],
    api: [
        { icon: 'fa-solid fa-book', title: 'API', description: 'API란?', pdfUrl: 'https://plusb3b.kr/pdf/api/API.pdf' },
        { icon: 'fa-solid fa-arrows-rotate', title: 'REST API', description: 'RESTful 아키텍처 원칙 - 쉬는 API?', pdfUrl: 'https://plusb3b.kr/pdf/api/REST_API.pdf' },
        { icon: 'fa-solid fa-diagram-project', title: 'GraphQL', description: 'GraphQL이란? SQL은 아는데 이건 뭐지', pdfUrl: 'https://plusb3b.kr/pdf/api/GraphQL.pdf' },
        { icon: 'fa-solid fa-rocket', title: 'gRPC', description: 'gRPC란? - NPC마을은 아는데 gRPC 이건 뭐지?', pdfUrl: 'https://plusb3b.kr/pdf/api/gRPC.pdf' },
        { icon: 'fa-solid fa-envelope', title: 'SOAP', description: '비누?', pdfUrl: 'https://plusb3b.kr/pdf/api/SOAP.pdf' },
        { icon: 'fa-solid fa-plug', title: 'WebSocket 실시간 통신', description: '양방향 통신', pdfUrl: 'https://plusb3b.kr/pdf/api/WebSocket.pdf' },
    ],
    spring: [
        { icon: 'fa-solid fa-file-pdf', title: '1. 스프링부트 시작', description: 'PDF 다운 받기', pdfUrl: 'https://plusb3b.kr/pdf/springboot-1.pdf' },
        { icon: 'fa-solid fa-file-pdf', title: '2. 웹 애플리케이션 개발', description: 'PDF 다운 받기', pdfUrl: 'https://plusb3b.kr/pdf/springboot-2.pdf' },
        { icon: 'fa-solid fa-file-pdf', title: '3. 데이터로 작업하기', description: 'PDF 다운 받기', pdfUrl: 'https://plusb3b.kr/pdf/springboot-3.pdf' },
        { icon: 'fa-solid fa-file-pdf', title: '4. Spring Security', description: 'PDF 다운 받기', pdfUrl: 'https://plusb3b.kr/pdf/springboot-4.pdf' },
        { icon: 'fa-solid fa-file-pdf', title: '5. 자동-구성속성 이용하기', description: 'PDF 다운 받기', pdfUrl: 'https://plusb3b.kr/pdf/springboot-5.pdf' },
        { icon: 'fa-solid fa-file-pdf', title: '6. REST API 1', description: 'PDF 다운 받기', pdfUrl: 'https://plusb3b.kr/pdf/springboot-6-1.pdf' },
        { icon: 'fa-solid fa-file-pdf', title: '6. REST API 2', description: 'PDF 다운 받기', pdfUrl: 'https://plusb3b.kr/pdf/springboot-6-2.pdf' },
        { icon: 'fa-solid fa-file-pdf', title: '7. RestTemplate', description: 'PDF 다운 받기', pdfUrl: 'https://plusb3b.kr/pdf/springboot-7.pdf' },
        { icon: 'fa-solid fa-clock', title: '8. 비동기 방식으로 메시지 수신하기', description: 'PDF 다운 받기 - 준비 중', pdfUrl: '' },
    ],
    java: [
        { icon: 'fa-solid fa-history', title: '1. 자바 역사 간단하게 보기', description: '자바 8 ~11, 스트림과 함수형 프로그래밍의 등장', pdfUrl: 'https://raw.githubusercontent.com/dev-jm-1024/pdf-download-page/main/modern-java-doc/ch01_%EC%9E%90%EB%B0%94%EC%9D%98_%EC%97%AD%EC%82%AC%EB%A5%BC_%EA%B0%84%EB%8B%A8%ED%9E%88_%EC%9E%90%EB%B0%94%EB%B3%B4%EC%9E%90.pdf' },
        { icon: 'fa-solid fa-cogs', title: '2. 동작 파라미터화 코드 전달', description: 'Predicate, 전략 패턴, 람다까지 동작 파라미터화', pdfUrl: 'https://raw.githubusercontent.com/dev-jm-1024/pdf-download-page/main/modern-java-doc/ch02_%EB%8F%99%EC%9E%91_%ED%8C%8C%EB%9D%BC%EB%AF%B8%ED%84%B0%ED%99%94_%EC%BD%94%EB%93%9C_%EC%A0%84%EB%8B%AC%ED%95%98%EA%B8%B0-%EB%84%88%EC%9D%98_%ED%96%89%EB%8F%99%EC%9D%84_%EA%B0%80%EC%A0%B8%EC%98%A4%EB%A0%B4.pdf' },
        { icon: 'fa-solid fa-bolt', title: '3. 람다 표현식', description: '람다, 함수형 인터페이스, 메소드 참조', pdfUrl: 'https://raw.githubusercontent.com/dev-jm-1024/pdf-download-page/main/modern-java-doc/ch03_%EB%9E%8C%EB%8B%A4%ED%91%9C%ED%98%84%EC%8B%9D.pdf' },
        { icon: 'fa-solid fa-water', title: '4. 스트림 소개팅', description: '스트림 개념, 내부 반복, 파이프라인, 컬렉션과의 차이', pdfUrl: 'https://raw.githubusercontent.com/dev-jm-1024/modern-java/main/JavaStudy/doc/ch04_%EC%8A%A4%ED%8A%B8%EB%A6%BC%EC%86%8C%EA%B0%9C%ED%95%98%EA%B8%B0_%EC%8A%A4%ED%8C%80%EB%8B%A4%EB%A6%AC%EB%AF%B8%EB%8A%94%EC%95%84%EB%8A%94%EB%8D%B0_%EC%8A%A4%ED%8A%B8%EB%A6%BC%EC%9D%80%EB%AD%98%EA%B9%8C.pdf' },
        { icon: 'fa-solid fa-stream', title: '5. 스트림과 데이트', description: '필터링, 매핑, 리듀싱부터 고급 스트림 연산', pdfUrl: 'https://raw.githubusercontent.com/dev-jm-1024/modern-java/main/JavaStudy/doc/ch05_%EC%8A%A4%ED%8A%B8%EB%A6%BC%ED%99%9C%EC%9A%A9%ED%95%98%EA%B8%B0_%EC%8A%A4%ED%8A%B8%EB%A6%BC%EA%B3%BC_%EC%B9%9C%EA%B5%AC%EB%90%98%EC%96%B4%EB%B3%B4%EA%B8%B0.pdf' },
        { icon: 'fa-solid fa-stream', title: '6. 스트림과 결혼', description: '리듀싱·요약, 그룹화와 Collector 동작 원리', pdfUrl: 'https://raw.githubusercontent.com/dev-jm-1024/modern-java/main/JavaStudy/doc/ch06_%EC%8A%A4%ED%8A%B8%EB%A6%BC%EC%9C%BC%EB%A1%9C_%EB%8D%B0%EC%9D%B4%ED%84%B0%EC%88%98%EC%A7%91%ED%95%98%EA%B8%B0.pdf' },
        { icon: 'fa-solid fa-project-diagram', title: '7. 포크조인? 숟가락 조인?', description: '병렬 스트림, Fork/Join, Spliterator', pdfUrl: 'https://raw.githubusercontent.com/dev-jm-1024/modern-java/main/JavaStudy/doc/ch07_%20%ED%8F%AC%ED%81%AC%EC%A1%B0%EC%9D%B8%ED%94%84%EB%A0%88%EC%9E%84%EC%9B%8C%ED%81%AC_%EC%88%9F%EA%B0%80%EB%9D%BD_%EC%A1%B0%EC%9D%B8%EC%9D%80_%EC%97%86%EB%82%98.pdf' },
        { icon: 'fa-solid fa-layer-group', title: '8. 개선된 컬렉션 API', description: 'List, Set, Map', pdfUrl: 'https://raw.githubusercontent.com/dev-jm-1024/modern-java/main/JavaStudy/doc/ch08_%EA%B0%9C%EC%84%A0%EB%90%9C_%EC%BB%AC%EB%A0%89%EC%85%98API.pdf' },
        { icon: 'fa-solid fa-question-circle', title: '11. null 대신 Optional', description: 'NullPointerException 예방과 안전한 Optional 활용법', pdfUrl: 'https://raw.githubusercontent.com/dev-jm-1024/modern-java/main/JavaStudy/doc/ch11_null%EB%8C%80%EC%8B%A0_Optional.pdf' },
        { icon: 'fa-solid fa-question-circle', title: '12. 날짜 / 시간 API', description: 'Java와 데이트 : LocalDate', pdfUrl: '' },

    ],
    kotlin: [
        { icon: 'fa-solid fa-code', title: 'KotlinEssentials.kt', description: '변수, 함수, 조건문, 반복문까지 문법 정리', pdfUrl: 'https://raw.githubusercontent.com/dev-jm-1024/pdf-download-page/main/kotlin-doc/%EB%8F%85%ED%95%99-Kotlin-1.pdf' },
        { icon: 'fa-solid fa-database', title: 'KotlinAdvanced.kt', description: '초기화 지연부터 컬렉션, Null 처리까지 문법 정리', pdfUrl: 'https://raw.githubusercontent.com/dev-jm-1024/pdf-download-page/main/kotlin-doc/%EB%8F%85%ED%95%99-Kotlin-2.pdf' },
    ],
    linux: [
        { icon: 'fa-solid fa-file-pdf', title: '$ cat linux-basics.pdf', description: '기본 명령어 모음집', pdfUrl: 'https://raw.githubusercontent.com/dev-jm-1024/pdf-download-page/main/linux-doc/linux-1-1.pdf' },
        { icon: 'fa-solid fa-folder-open', title: '$ ls -la filesystem.pdf', description: '파일 시스템 완전 정복', pdfUrl: 'https://raw.githubusercontent.com/dev-jm-1024/pdf-download-page/main/linux-doc/linux-1-2.pdf' },
        { icon: 'fa-solid fa-terminal', title: '$ chmod 755 permissions.pdf', description: '사용자 권한 마스터', pdfUrl: 'https://raw.githubusercontent.com/dev-jm-1024/pdf-download-page/main/linux-doc/linux-2-1.pdf' },
        { icon: 'fa-solid fa-network-wired', title: '$ ifconfig network.pdf', description: '네트워크 설정 가이드', pdfUrl: 'https://raw.githubusercontent.com/dev-jm-1024/pdf-download-page/main/linux-doc/linux-2-2.pdf' },
        { icon: 'fa-solid fa-cogs', title: '$ systemctl services.pdf', description: '서비스 관리 완벽 가이드', pdfUrl: 'https://raw.githubusercontent.com/dev-jm-1024/pdf-download-page/main/linux-doc/linux-3-1.pdf' },
        { icon: 'fa-solid fa-code', title: '$ vim scripts.pdf', description: '쉘 스크립트 작성법', pdfUrl: 'https://raw.githubusercontent.com/dev-jm-1024/pdf-download-page/main/linux-doc/linux-3-2.pdf' },
    ],
    jsp: [
        { icon: 'fa-solid fa-globe-americas', title: '1.1 웹 개발 환경 이해', description: '웹 프로그래밍 개요, URL 구조, 개발 환경 설정', pdfUrl: 'https://plusb3b.kr/pdf/jsp/jsp-1-1.pdf' },
        { icon: 'fa-solid fa-code', title: '2.1 Servlet의 개념과 동작', description: 'Servlet의 기본 원리, 매핑 방식, 요청/응답 처리', pdfUrl: 'https://plusb3b.kr/pdf/jsp/jsp-2-1.pdf' },
        { icon: 'fa-solid fa-stream', title: '2.2 초기화 파라미터와 데이터 공유', description: 'Enumeration, ServletConfig, ServletContext 활용', pdfUrl: 'https://plusb3b.kr/pdf/jsp/jsp-2-2.pdf' },
        { icon: 'fa-solid fa-scroll', title: '2.3 JSP 기본 구조와 태그', description: 'JSP 문법, 태그 종류, 내장 객체 개념', pdfUrl: 'https://plusb3b.kr/pdf/jsp/jsp-2-3.pdf' },
        { icon: 'fa-solid fa-share-square', title: '2.4 응답 처리와 액션 태그', description: 'Response, forward vs redirect, include 사용법', pdfUrl: 'https://plusb3b.kr/pdf/jsp/jsp-2-4.pdf' },
        { icon: 'fa-solid fa-cookie-bite', title: '3.1 쿠키와 세션', description: '상태 유지를 위한 Cookie & Session의 개념과 활용', pdfUrl: 'https://plusb3b.kr/pdf/jsp/jsp-3-1.pdf' },
        { icon: 'fa-solid fa-exclamation-circle', title: '3.2 어플리케이션, 예외처리, 자바빈', description: 'JSP에서 전역 데이터, 에러 처리, JavaBean 활용', pdfUrl: 'https://plusb3b.kr/pdf/jsp/jsp-3-2.pdf' },
        { icon: 'fa-solid fa-database', title: '3.3 데이터베이스 & 오라클 개요', description: 'SQL, Oracle DB 기본 개념과 관리자 권한 이해', pdfUrl: 'https://plusb3b.kr/pdf/jsp/jsp-3-3.pdf' },
        { icon: 'fa-solid fa-plug', title: '3.4 SQL 연산자 & JDBC 활용', description: 'JDBC 연결 흐름, SQL 활용 예제와 자바 연동', pdfUrl: 'https://plusb3b.kr/pdf/jsp/jsp-3-4.pdf' },
        { icon: 'fa-solid fa-database', title: '4.1 JDBC 고급 활용', description: 'executeUpdate, PreparedStatement, DAO/DTO', pdfUrl: 'https://plusb3b.kr/pdf/jsp/jsp-4-1.pdf' },
        { icon: 'fa-solid fa-network-wired', title: '4.2 DBCP, EL, JSTL', description: 'DB 커넥션 풀 구성과 JSTL, EL 기본 문법', pdfUrl: 'https://plusb3b.kr/pdf/jsp/jsp-4-2.pdf' },
        { icon: 'fa-solid fa-users-cog', title: '회원관리 & 게시판 구현 1', description: 'DB 설계부터 로그인, 회원가입, 수정, 탈퇴 구현', pdfUrl: 'https://plusb3b.kr/pdf/jsp/jsp-회원관리및게시판구현1.pdf' },
        { icon: 'fa-solid fa-file-alt', title: '회원관리 & 게시판 구현 2', description: '게시글 작성, 수정, 상세 조회, 세션 인증 처리', pdfUrl: 'https://plusb3b.kr/pdf/jsp/jsp-회원관리및게시판구현2.pdf' },
    ],

    mysql: [
        { icon: 'fa-solid fa-server', title: 'MySQL Setup 가이드', description: 'MySQL 8.0을 Windows에 설치하는 방법', pdfUrl: 'https://plusb3b.kr/pdf/mysql/mysql-setup.pdf' },
        { icon: 'fa-solid fa-user-shield', title: 'MySQL 8.0 - 사용자 권한', description: '사용자 식별, 권한 부여, 역할까지 정리', pdfUrl: 'https://plusb3b.kr/pdf/mysql/mysql-ch03.pdf' },
        // { icon: 'fa-solid fa-search', title: 'MySQL - 쿼리 최적화', description: '성능 향상을 위한 쿼리 튜닝 기법', pdfUrl: '' },
        // { icon: 'fa-solid fa-shield-alt', title: 'MySQL - 보안 가이드', description: '데이터베이스 보안 설정 및 관리', pdfUrl: '' },
        // { icon: 'fa-solid fa-sync-alt', title: 'MySQL - 백업 및 복구', description: '데이터 백업 전략과 복구 방법', pdfUrl: '' },
        // { icon: 'fa-solid fa-chart-line', title: 'MySQL - 성능 모니터링', description: '데이터베이스 성능 분석 및 모니터링', pdfUrl: '' },
    ],
    mongodb: [
        { icon: 'fa-solid fa-database', title: 'MongoDB 필기 - 2.시작하기', description: 'MongoDB 기초 개념과 설치 가이드', pdfUrl: 'https://plusb3b.kr/pdf/mongodb/MongoDB_2장_시작하기.pdf' },
        // { icon: 'fa-solid fa-chart-column', title: '집계 파이프라인', description: '데이터 분석과 집계 연산', pdfUrl: '' },
        // { icon: 'fa-solid fa-list-check', title: '인덱싱 전략', description: '쿼리 최적화 방법', pdfUrl: '' },
        // { icon: 'fa-solid fa-copy', title: 'Replication', description: '복제와 고가용성', pdfUrl: '' },
    ],
    oop: [
        { icon: 'fa-solid fa-code-branch', title: '1. 절차지향 vs 객체지향', description: 'TDA 원칙과 책임 중심 설계로 객체지향 구현', pdfUrl: 'https://plusb3b.kr/pdf/oop/oop1.pdf' },
        { icon: 'fa-solid fa-cubes', title: '2. 객체의 종류', description: 'VO, DTO, DAO, Entity의 본질과 올바른 활용법', pdfUrl: 'https://github.com/dev-jm-1024/pdf-download-page/raw/main/oop-doc/oop-2.pdf' },
        { icon: 'fa-solid fa-running', title: '3. 행동', description: '데이터가 아닌 행동 중심 설계와 TDA, 덕 타이핑', pdfUrl: 'https://github.com/dev-jm-1024/pdf-download-page/raw/main/oop-doc/oop-3.pdf' },
        { icon: 'fa-solid fa-cubes', title: '4. SOLID', description: '객체지향 설계의 핵심 원칙: SOLID', pdfUrl: 'https://github.com/dev-jm-1024/pdf-download-page/raw/main/oop-doc/oop-4.pdf' },
        // { icon: 'fa-solid fa-layer-group', title: '다형성', description: '오버로딩과 오버라이딩', pdfUrl: '' },
        // { icon: 'fa-solid fa-shapes', title: '추상화', description: '인터페이스와 추상 클래스', pdfUrl: '' },
    ],
    // systemDesignInterview: [
    //     { icon: 'fa-solid fa-diagram-project', title: '시스템 설계 기초', description: '대규모 시스템 아키텍처 개요', pdfUrl: '' },
    //     { icon: 'fa-solid fa-scale-balanced', title: '로드 밸런싱', description: '부하 분산 전략', pdfUrl: '' },
    //     { icon: 'fa-solid fa-database', title: '데이터베이스 샤딩', description: '수평적 확장 기법', pdfUrl: '' },
    //     { icon: 'fa-solid fa-bolt', title: '캐싱 전략', description: 'Redis, Memcached 활용', pdfUrl: '' },
    //     { icon: 'fa-solid fa-network-wired', title: 'CDN', description: '콘텐츠 전송 네트워크', pdfUrl: '' },
    //     { icon: 'fa-solid fa-code-branch', title: '마이크로서비스', description: '서비스 분산 아키텍처', pdfUrl: '' },
    //     { icon: 'fa-solid fa-clock', title: '비동기 처리', description: '메시지 큐와 이벤트 드리븐', pdfUrl: '' },
    // ],
    kafka: [
        {
            icon: 'fa-solid fa-stream',
            title: 'Kafka란?',
            description: '대용량 이벤트 스트리밍 플랫폼의 개념과 구조',
            pdfUrl: 'https://raw.githubusercontent.com/dev-jm-1024/pdf-download-page/main/kafka-doc/ch01-%EC%B9%B4%ED%94%84%EC%B9%B4%EB%9E%80.pdf'
        },
        {
            icon: 'fa-solid fa-layer-group',
            title: '왜 Kafka를 공부해야 하는가',
            description: 'RabbitMQ, Redis와의 차이점 및 Kafka의 필요성',
            pdfUrl: 'https://raw.githubusercontent.com/dev-jm-1024/pdf-download-page/main/kafka-doc/ch02-%EC%B9%B4%ED%94%84%EC%B9%B4%EB%A5%BC%EA%B3%B5%EB%B6%80%ED%95%B4%EC%95%BC%ED%95%98%EB%8A%94%EC%9D%B4%EC%9C%A0.pdf'
        }
    ],

    network: [
        { icon: 'fa-solid fa-project-diagram', title: '1. 컴퓨터 네트워크', description: '네트워크 기본 개념, 장치, 프로토콜, OSI 7계층 정리', pdfUrl: 'https://raw.githubusercontent.com/dev-jm-1024/pdf-download-page/main/network-doc/network-1.pdf' },
        // { icon: 'fa-solid fa-globe', title: 'HTTP/HTTPS', description: '웹 통신 프로토콜', pdfUrl: '' },
        // { icon: 'fa-solid fa-server', title: 'DNS', description: '도메인 네임 시스템', pdfUrl: '' },
        // { icon: 'fa-solid fa-shield-halved', title: 'SSL/TLS', description: '암호화 통신', pdfUrl: '' },
        // { icon: 'fa-solid fa-route', title: 'TCP/IP', description: '인터넷 프로토콜', pdfUrl: '' },
        // { icon: 'fa-solid fa-wifi', title: '무선 네트워크', description: 'WiFi, Bluetooth 기술', pdfUrl: '' },
    ],
    JUnit: [
        { icon: 'fa-solid fa-vial', title: '1. 단위테스트란?', description: 'JUnit 단위 테스트 기초 개념', pdfUrl: 'https://github.com/dev-jm-1024/pdf-download-page/raw/main/junit-doc/ch1_%EB%8B%A8%EC%9C%84%ED%85%8C%EC%8A%A4%ED%8A%B8.pdf' },
        // { icon: 'fa-solid fa-check-double', title: 'Assertions', description: '테스트 검증 메서드', pdfUrl: '' },
        // { icon: 'fa-solid fa-clock', title: 'Lifecycle', description: '@BeforeEach, @AfterEach', pdfUrl: '' },
        // { icon: 'fa-solid fa-flask', title: 'Mockito', description: '모의 객체 테스팅', pdfUrl: '' },
        // { icon: 'fa-solid fa-chart-line', title: 'Coverage', description: '코드 커버리지 측정', pdfUrl: '' },
        // { icon: 'fa-solid fa-layer-group', title: '통합 테스트', description: 'Integration Testing', pdfUrl: '' },
    ],
    error: [
        { icon: 'fa-solid fa-bug', title: 'debugSpringBoot()', description: 'Spring Boot에서 자주 발생하는 오류를 중심으로 실전 디버깅 전략과 설정 문제 해결 방법을 학습합니다.', pdfUrl: 'https://raw.githubusercontent.com/dev-jm-1024/pdf-download-page/main/error-doc/2025-%EC%BA%A1%EC%8A%A4%ED%86%A4%EB%94%94%EC%9E%90%EC%9D%B8-%EB%94%94%EB%B2%84%EA%B9%85%ED%95%B8%EB%93%9C%EB%B6%81.pdf' },
    ],
    github: [
        { icon: 'fa-brands fa-java', title: 'modern-java', description: 'Modern Java 학습을 위한 실습 코드 모음', repoUrl: 'https://github.com/dev-jm-1024/modern-java', language: 'Java', stars: 0 },
        { icon: 'fa-brands fa-java', title: 'spring-boot-study', description: 'Spring Boot 학습 및 실습 프로젝트', repoUrl: 'https://github.com/dev-jm-1024/game-hub', language: 'Java', stars: 0 },
        { icon: 'fa-brands fa-java', title: 'jsp-servlet-study', description: 'JMS를 이용한 채팅 구현', repoUrl: 'https://github.com/dev-jm-1024/JMS-study', language: 'Java', stars: 0 },
        { icon: 'fa-brands fa-java', title: 'mysql-study', description: 'JSP 공부', repoUrl: 'https://github.com/dev-jm-1024/jsp-study', language: 'SQL', stars: 0 },
        // { icon: 'fa-brands fa-java', title: 'mongodb-study', description: 'MongoDB NoSQL 데이터베이스 실습', repoUrl: 'https://github.com/dev-jm-1024/mongodb-study', language: 'JavaScript', stars: 0 },
        // { icon: 'fa-brands fa-java', title: 'kafka-study', description: 'Apache Kafka 메시지 큐 실습', repoUrl: 'https://github.com/dev-jm-1024/kafka-study', language: 'Java', stars: 0 },
        // { icon: 'fa-brands fa-java', title: 'network-study', description: '네트워크 프로그래밍 학습 자료', repoUrl: 'https://github.com/dev-jm-1024/network-study', language: 'Java', stars: 0 },
        // { icon: 'fa-brands fa-java', title: 'junit-study', description: 'JUnit 테스트 코드 작성 실습', repoUrl: 'https://github.com/dev-jm-1024/junit-study', language: 'Java', stars: 0 },
    ],
    books: [
        {
            title: 'Spring in Action 제 5판',
            author: '크레이그 윌즈',
            publisher: '',
            description: '스프링 5의 강력한 기능과 생산성을 활용한 웹 애플리케이션 개발 ',
            coverUrl: 'https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9791190665186.jpg',
            purchaseUrl: 'https://product.kyobobook.co.kr/detail/S000001942493',
            icon: 'fa-solid fa-book'
        },
        {
            title: '요즘 우아한 개발',
            author: '우아한 형제들',
            publisher: '',
            description: '기획하고 개발하고 회고하라',
            coverUrl: 'https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9791191905458.jpg',
            purchaseUrl: 'https://product.kyobobook.co.kr/detail/S000209185897',
            icon: 'fa-solid fa-book'
        },
        {
            title: 'MongoDB 완벽 가이드',
            author: '크리스티나 초도로우, 마이클 디롤프',
            publisher: '',
            description: 'MONGODB 완벽 가이드',
            coverUrl: 'https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9788979148251.jpg',
            purchaseUrl: 'https://product.kyobobook.co.kr/detail/S000001223746',
            icon: 'fa-solid fa-book'
        },
        {
            title: '자바와 JUnit을 활용한 실용주의 단위 테스트',
            author: '제프랭어, 앤디 헌트, 데이트 토마스',
            publisher: '',
            description: '클린 코드의 핵심, 단위 테스트로 소프트웨어 품질을 향상시킨다! | 가치 있는 단위 테스트를 만들자!',
            coverUrl: 'https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9791160508383.jpg',
            purchaseUrl: 'https://product.kyobobook.co.kr/detail/S000001792858',
            icon: 'fa-solid fa-book'
        },
        {
            title: '아파치 카프카 애플리케이션 프로그래밍 with 자바',
            author: '최원영',
            publisher: '',
            description: '카프카의 개념부터 스트림즈, 커넥트, 스프링 카프카까지',
            coverUrl: 'https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9791165920548.jpg',
            purchaseUrl: 'https://ebook-product.kyobobook.co.kr/dig/epd/ebook/E000002955323',
            icon: 'fa-solid fa-book'
        },
        {
            title: '가상 면접 사례로 배우는 대규모 시스템 설계 기초',
            author: '알렉스 쉬',
            publisher: '',
            description: '가상 면접 사례로 배우는 대규모 시스템 설계 기초',
            coverUrl: 'https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9788966263158.jpg',
            purchaseUrl: 'https://ebook-product.kyobobook.co.kr/dig/epd/ebook/E000003160871',
            icon: 'fa-solid fa-book'
        },
        {
            title: '자바 성능 튜닝 이야기',
            author: '이상민',
            publisher: '',
            description: '개발자가 반드시 알아야 할 자바 성능 튜닝 이야기',
            coverUrl: 'https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9788966260928.jpg',
            purchaseUrl: 'https://product.kyobobook.co.kr/detail/S000001032977',
            icon: 'fa-solid fa-book'
        },
        {
            title: '자바/스프링 개발자를 위한 실용주의 프로그래밍',
            author: '김우근',
            publisher: '',
            description: '객체지향부터 스프링과 테스트까지, 다시 제대로 배우는 애플리케이션 개발',
            coverUrl: 'https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9791158395155.jpg',
            purchaseUrl: 'https://product.kyobobook.co.kr/detail/S000213447953',
            icon: 'fa-solid fa-book'
        },
        {
            title: '모던 자바 인 액션',
            author: '라울-게이브리얼 우르마, 마리오 푸스코, 앨런 마이크 로프트',
            publisher: '',
            description: '람다, 스트림, 함수형, 리액티브 프로그래밍으로 새로워진 자바 마스터하기 | 전문가를 위한 자바8,9,10 기법 가이드',
            coverUrl: 'https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9791162242025.jpg',
            purchaseUrl: 'https://product.kyobobook.co.kr/detail/S000001810171',
            icon: 'fa-solid fa-book'
        },
        {
            title: '헤드 퍼스트 소프트웨어 아키텍처',
            author: '라주 간디, 마크 리처드, 닐 포드',
            publisher: '',
            description: '소프트웨어 아키텍처 사고를 위한 학습 가이드! | 효과적인 시스템 설계를 위한 사고법',
            coverUrl: 'https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9791169213929.jpg',
            purchaseUrl: 'https://product.kyobobook.co.kr/detail/S000217513398',
            icon: 'fa-solid fa-book'
        },
        {
            title: '혼자 공부하는 SQL',
            author: '우재남',
            publisher: '',
            description: 'SQL 기초 다루기',
            coverUrl: 'https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9791162244739.jpg',
            purchaseUrl: 'https://product.kyobobook.co.kr/detail/S000001810432',
            icon: 'fa-solid fa-book'
        },
        {
            title: '혼자 공부하는 네트워크',
            author: '강민철',
            publisher: '',
            description: '네트워크 기초 다루기',
            coverUrl: 'https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9791169212144.jpg',
            purchaseUrl: 'https://product.kyobobook.co.kr/detail/S000212911507',
            icon: 'fa-solid fa-book'
        },
    ],
};

const MENUS = [
    { key: 'api', name: 'API', icon: 'svg/api.svg' },
    { key: 'spring', name: 'Spring Boot', icon: 'svg/spring.svg' },
    { key: 'java', name: 'Modern Java', icon: 'svg/java.svg' },
    { key: 'kotlin', name: 'Kotlin', icon: 'svg/kotlin.svg' },
    { key: 'linux', name: 'Linux', icon: 'svg/linux.svg' },
    { key: 'jsp', name: 'JSP', icon: 'svg/jsp.svg' },
    { key: 'mysql', name: 'MySQL', icon: 'svg/mysql.svg' },
    { key: 'mongodb', name: 'MongoDB', icon: 'svg/mongodb.svg' },
    { key: 'oop', name: 'OOP', icon: 'svg/oop.svg' },
    // { key: 'systemDesignInterview', name: '대규모시스템설계기초', icon: 'svg/systemDesignInterview.svg' },
    { key: 'kafka', name: 'Kafka', icon: 'svg/kafka.svg' },
    { key: 'network', name: 'Network', icon: 'svg/network.svg' },
    { key: 'JUnit', name: 'JUnit', icon: 'svg/junit.svg' },
    { key: 'exception', name: '예외처리 핸드북', icon: 'svg/debugging.svg' },
    { key: 'github', name: 'GitHub', icon: 'svg/github.svg' },
    {key:'senior-center-search', name: 'Senior Center Search', icon: 'svg/senior-center-search.svg' },
];