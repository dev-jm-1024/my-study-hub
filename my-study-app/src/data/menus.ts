import type { MenuItem } from '../types';

export const MENUS: MenuItem[] = [
  { key: 'api',       name: 'API',              group: '아키텍처' },
  { key: 'spring',    name: 'Spring Boot',       group: '프레임워크' },
  { key: 'java',      name: 'Java',              group: '프로그래밍' },
  { key: 'kotlin',    name: 'Kotlin',            group: '프로그래밍' },
  { key: 'linux',     name: 'Linux',             group: '인프라' },
  { key: 'jsp',       name: 'JSP',               group: '프레임워크' },
  { key: 'mysql',     name: 'MySQL',             group: '데이터베이스' },
  { key: 'mongodb',   name: 'MongoDB',           group: '데이터베이스' },
  { key: 'oop',       name: 'OOP',               group: '아키텍처' },
  { key: 'system-design', name: '대규모 시스템 설계', group: '아키텍처' },
  { key: 'kafka',     name: 'Kafka',             group: '인프라' },
  { key: 'network',   name: 'Network',           group: '인프라' },
  { key: 'webserver', name: 'Web Server',        group: '인프라' },
  { key: 'docker',    name: 'Docker',            group: '인프라' },
  { key: 'querydsl',  name: 'QueryDSL',          group: '데이터베이스' },
  { key: 'JUnit',     name: 'JUnit',             group: '테스팅' },
  { key: 'exception', name: '예외처리 핸드북',  group: '테스팅' },
];
