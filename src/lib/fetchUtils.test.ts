import { clearCache, getCache, setCache } from '@/lib/cacheManager';
import { InvalidUrlError, RequestFailedError } from '@/lib/errors';
import { callClearCacheApi, getCachedOrFetchUrl } from '@/lib/fetchUtils';
import { ProxyServerCloser, startProxyServer } from '@/proxyServer';
import assert from 'node:assert/strict';
import { after, afterEach, before, beforeEach, describe, it } from 'node:test';
import { v4 as uuidV4 } from 'uuid';

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

describe('callClearCacheApi() calls and clears the cache indirectly', () => {
  let closeProxyServer: ProxyServerCloser;
  before(async () => {
    closeProxyServer = (
      await startProxyServer(3010, 'https://github.com/yukisato')
    ).closeProxyServer;
  });
  after(async () => {
    await closeProxyServer();
  });

  it('deletes all the cache data', async () => {
    clearCache();
    const testData = [
      {
        path: '/path/to/target.html',
        data: uuidV4(),
      },
      {
        path: '/path/to/target2.html',
        data: uuidV4(),
      },
    ];
    testData.forEach(({ path, data }) => {
      setCache(path, data);
    });

    assert.equal(getCache(testData[0].path), testData[0].data);
    assert.equal(getCache(testData[1].path), testData[1].data);
    await callClearCacheApi();
    assert.equal(getCache(testData[0].path), null);
    assert.equal(getCache(testData[1].path), null);
  });
});
