export type CacheData = {
  originUrl: string;
  cache: Record<string, string>;
};

const data: CacheData = {
  originUrl: '',
  cache: {},
};

export const setCache = (path: string, text: string): void => {
  data.cache[path] = text;
};
export const getCache = (path: string): string | null =>
  data.cache[path] || null;
export const clearCache = (): void => {
  data.cache = {};
};
