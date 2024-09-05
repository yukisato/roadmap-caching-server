import { getCache, setCache } from '@/lib/cacheManager';
import { z } from 'zod';
import { InvalidUrlError, RequestFailedError } from '@/lib/errors';
import { getPortNumber } from './dbManager';

export type RetrieveResult = {
  data: string | null;
  isCache: boolean;
};

export const urlStringSchema = z.string().url();

export const getCachedOrFetchUrl = async (
  urlString: string,
): Promise<RetrieveResult> => {
  const { success, data } = urlStringSchema.safeParse(urlString);
  if (!success) throw new InvalidUrlError(urlString);

  const url = new URL(data);
  const path = url.pathname + url.search;

  const cache = getCache(path);
  if (cache) return { data: cache, isCache: true };

  // If the path is NOT in the cache, fetch and return the data
  let response: Response;
  try {
    response = await fetch(url);
    if (response.ok) {
      const data = await response.text();
      setCache(path, data);

      return { data, isCache: false };
    }
    // If the request fails, throw an error
    throw new RequestFailedError(response, urlString);
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(`Unknown error: ${String(error)}`);
  }
};

export const callClearCacheApi = async () => {
  const apiUrl = `http://localhost:${getPortNumber()}/clearCache`;
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new RequestFailedError(response, apiUrl);
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(`Unknown error: ${String(error)}`);
  }
};
