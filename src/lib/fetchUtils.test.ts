import { clearCache } from '@/lib/cacheManager';
import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { getCachedOrFetchUrl } from '@/lib/fetchUtils';
import { InvalidUrlError, RequestFailedError } from '@/lib/errors';

describe('getCachedOrFetchUrl()', () => {
  beforeEach(() => {
    clearCache();
  });
  afterEach(() => {
    clearCache();
  });

  describe('when data is in the cache', () => {
    it('returns actual data with `isCache: false` first, then returns the data with `isCache: true` when it is called again', async () => {
      const url =
        'https://raw.githubusercontent.com/yukisato/roadmap-caching-server/main/etc/test.json';
      const expectedData = await (await fetch(url)).text();

      assert.deepEqual(await getCachedOrFetchUrl(url), {
        isCache: false,
        data: expectedData,
      });
      assert.deepEqual(await getCachedOrFetchUrl(url), {
        isCache: true,
        data: expectedData,
      });
    });
  });

  describe('when the wrong uri is passed', () => {
    it('it throws InvalidUrlError when the uri is invalid ', async () => {
      assert.rejects(
        async () => await getCachedOrFetchUrl('invalid-url'),
        InvalidUrlError
      );
    });
    it('it throws RequestFailedError when the uri is not found ', async () => {
      const notExistUrl =
        'https://github.com/yukisato/roadmap-caching-server/blob/main/' +
        'it-does-not-exist.txt';
      assert.rejects(
        async () => await getCachedOrFetchUrl(notExistUrl),
        RequestFailedError
      );
    });
  });
});
