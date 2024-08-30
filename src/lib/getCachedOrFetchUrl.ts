import { getCache, storeCache } from '@/dbServer';
import { z } from 'zod';
import { InvalidUrlError, RequestFailedError } from '@/lib/errors';

export type RetrieveResult = {
  data: string | null;
  isCache: boolean;
};

export const urlStringSchema = z.string().url();

export const getCachedOrFetchUrl = async (
  urlString: string
): Promise<RetrieveResult> => {
  const { success, data } = urlStringSchema.safeParse(urlString);
  if (!success) throw new InvalidUrlError(urlString);

  const url = new URL(data);
  const path = url.pathname + url.search;

  // If the path is in the cache, return the cache
  const cache = getCache(path);
  if (cache) return { data: cache.data, isCache: true };

  // If the path is NOT in the cache, fetch and return the data
  try {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.text();
      storeCache(path, data);

      return { data, isCache: false };
    }
    // If the request fails, throw an error
    throw new RequestFailedError(response!, urlString);
  } catch (error) {
    throw error;
  }
};
