import data from './vibe.projects.json';

/**
 * 바이브 코딩 프로젝트 스키마
 * (JSON Schema 정의: ./vibe.schema.json, 데이터: ./vibe.projects.json)
 */
export interface VibeProject {
  /** 프로젝트 이름 */
  name: string;
  /** 프로젝트 설명 */
  description: string;
  /** 기술 스택 (여러 개 가능) */
  techStack: string[];
  /** 사용한 AI 도구 (여러 개 가능) */
  ai?: string[];
  /** GitHub 링크 */
  github?: string;
  /** 기타 링크 (라이브/데모 등) */
  link?: string;
}

export const VIBE_PROJECTS: VibeProject[] = data.projects;
