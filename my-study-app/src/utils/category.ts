import { MENU_DATA } from '../data/menuData';

export const docCount = (key: string) => (MENU_DATA[key] ?? []).length;

export const resolveCategoryKey = (param: string): string =>
  Object.keys(MENU_DATA).find(k => k.toLowerCase() === param.toLowerCase()) ?? param;

export const matchesKey = (key: string, target: string): boolean =>
  key.toLowerCase() === target.toLowerCase();
