import type { MenuItem } from '../types';

export const MENUS: MenuItem[] = [
  { key: 'api',       name: 'API',              group: '아키텍처',    icon: 'fa-solid fa-plug' },
  { key: 'spring',    name: 'Spring Boot',       group: '프레임워크',  icon: 'fa-solid fa-leaf' },
  { key: 'java',      name: 'Java',              group: '프로그래밍',  icon: 'fa-brands fa-java' },
  { key: 'kotlin',    name: 'Kotlin',            group: '프로그래밍',  icon: 'fa-solid fa-code' },
  { key: 'linux',     name: 'Linux',             group: '인프라',      icon: 'fa-brands fa-linux' },
  { key: 'jsp',       name: 'JSP',               group: '프레임워크',  icon: 'fa-solid fa-globe' },
  { key: 'mysql',     name: 'MySQL',             group: '데이터베이스', icon: 'fa-solid fa-database' },
  { key: 'mongodb',   name: 'MongoDB',           group: '데이터베이스', icon: 'fa-solid fa-leaf' },
  { key: 'oop',       name: 'OOP',               group: '아키텍처',    icon: 'fa-solid fa-cubes' },
  { key: 'kafka',     name: 'Kafka',             group: '인프라',      icon: 'fa-solid fa-stream' },
  { key: 'network',   name: 'Network',           group: '인프라',      icon: 'fa-solid fa-network-wired' },
  { key: 'webserver', name: 'Web Server',        group: '인프라',      icon: 'fa-solid fa-server' },
  { key: 'querydsl',  name: 'QueryDSL',          group: '데이터베이스', icon: 'fa-solid fa-database' },
  { key: 'JUnit',     name: 'JUnit',             group: '테스팅',      icon: 'fa-solid fa-vial' },
  { key: 'exception', name: '예외처리 핸드북',  group: '테스팅',      icon: 'fa-solid fa-bug' },
];
