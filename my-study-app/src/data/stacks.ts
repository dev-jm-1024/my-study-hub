/* 스택 시각화 — 브랜드 로고(simple-icons) + 색상. 개념형 스택은 모노그램 폴백 */
import {
  siSpringboot,
  siMysql,
  siMongodb,
  siApachekafka,
  siJunit5,
  siKotlin,
  siLinux,
  siNginx,
  siDocker,
} from 'simple-icons';

export interface StackVisual {
  /** 막대·아이콘 색 (밝은 배경 대비 위해 일부 브랜드색은 살짝 조정) */
  color: string;
  /** 브랜드 로고 SVG path (없으면 모노그램) */
  icon?: { path: string; title: string };
}

export const STACK: Record<string, StackVisual> = {
  spring:    { color: '#6DB33F', icon: siSpringboot },
  mysql:     { color: '#4479A1', icon: siMysql },
  mongodb:   { color: '#47A248', icon: siMongodb },
  kafka:     { color: '#6B7280', icon: siApachekafka }, // 원색 검정 → 회색
  JUnit:     { color: '#25A162', icon: siJunit5 },
  kotlin:    { color: '#7F52FF', icon: siKotlin },
  linux:     { color: '#C99700', icon: siLinux },       // 원색 노랑 → 진한 골드
  webserver: { color: '#009639', icon: siNginx },
  docker:    { color: '#2496ED', icon: siDocker },
  // 로고 없음 → 브랜드/상징 색상 + 모노그램
  java:      { color: '#E76F00' },
  jsp:       { color: '#C74634' },
  oop:       { color: '#6E7F92' },
  'system-design': { color: '#3E8E9E' },
  network:   { color: '#6E7CA8' },
  api:       { color: '#6683A0' },
  querydsl:  { color: '#7C6EA8' },
  exception: { color: '#B0604E' },
};
