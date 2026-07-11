/* 주제(카테고리) 공통 표시 헬퍼 — 홈 / 사이드바 / 다운로드에서 공유 */

/* 2글자 모노그램 배지 */
export const BADGE: Record<string, string> = {
  api: 'Ap', spring: 'Sp', java: 'Jv', kotlin: 'Kt', linux: 'Lx', jsp: 'Jp',
  mysql: 'My', mongodb: 'Mo', oop: 'OO', kafka: 'Kf', network: 'Nw',
  webserver: 'Ws', querydsl: 'Qd', JUnit: 'Ju', exception: 'Ex',
};

/* 주제별 한 줄 설명 */
export const DESC: Record<string, string> = {
  api: 'REST · GraphQL · gRPC · WebSocket',
  spring: 'DI · 부트 · Security · REST API',
  java: '람다 · 스트림 · Optional · 컬렉션',
  kotlin: '문법 · 널 안정성 · 컬렉션',
  linux: '명령어 · 파일시스템 · 권한',
  jsp: '서블릿 · JDBC · 세션 · JSTL',
  mysql: '인덱스 · 트랜잭션 · JOIN',
  mongodb: '도큐먼트 모델 · 시작하기',
  oop: '절차지향 vs 객체지향 · SOLID',
  kafka: '이벤트 스트리밍 · 개념과 구조',
  network: 'OSI 7계층 · 프로토콜',
  webserver: 'Nginx vs Apache',
  querydsl: 'Q타입 · 동적 쿼리',
  JUnit: '단위 테스트 기초',
  exception: '예외 설계 · 핸드북',
};

/* 한글 검색 별칭 — 이름/설명/그룹이 영문이라 한글 검색어가 안 걸리는 경우 보완 */
export const ALIASES: Record<string, string[]> = {
  spring: ['스프링', '스프링부트'],
  java: ['자바'],
  kotlin: ['코틀린'],
  linux: ['리눅스'],
  oop: ['객체지향'],
  kafka: ['카프카'],
  network: ['네트워크'],
  webserver: ['웹서버', '웹 서버'],
  exception: ['예외', '예외처리'],
};

/* 홈/사이드바 그룹 노출 순서 */
export const GROUP_ORDER = ['프로그래밍', '프레임워크', '데이터베이스', '인프라', '아키텍처', '테스팅'];

/* 배지 색조 클래스 (index.css의 .t-* 와 매칭) */
export const tintClass = (key: string) => `t-${key.toLowerCase()}`;

/* 배지 라벨 (매핑 없으면 이름 앞 2글자) */
export const badgeLabel = (key: string, name: string) => BADGE[key] ?? name.slice(0, 2);

/* 자료실 페이징 전역 설정 — 페이지당 문서 수 (넘치면 페이지 분할) */
export const DOWNLOAD_PAGE_SIZE = 10;
