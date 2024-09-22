import assert from 'node:assert/strict';
import {
  after,
  afterEach,
  before,
  beforeEach,
  describe,
  it,
  mock,
} from 'node:test';
import { clearCache, getCache, setCache } from '@/lib/cacheManager';
import { RequestFailedError } from '@/lib/errors';
import { callClearCacheApi, getCachedOrFetchUrl } from '@/lib/fetchUtils';
import {
  type ProxyServerCloser,
  clearCacheHandler,
  startProxyServer,
} from '@/proxyServer';
import express from 'express';
import request from 'supertest';
import { setPortNumber } from './dbManager';

describe('getCachedOrFetchUrl()', () => {
  beforeEach(() => {
    clearCache();
  });
  afterEach(() => {
    clearCache();
  });

  describe('when data is in the cache', () => {
    it('returns actual data with `isCache: false` first, then returns the data with `isCache: true` for the second request', async () => {
      const url =
        'https://raw.githubusercontent.com/yukisato/roadmap-caching-server/main/etc/test.json';
      const expectedData = 'test data';
      mock.method(globalThis, 'fetch', (internalUrl: URL) => {
        assert.deepEqual(new URL(url), internalUrl);

        return {
          ok: true,
          text: async () => expectedData,
        };
      });

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
    it('it throws RequestFailedError when the uri is not found ', async () => {
      const notExistUrl =
        'https://github.com/yukisato/roadmap-caching-server/blob/main/' +
        'it-does-not-exist.txt';
      mock.method(globalThis, 'fetch', (url: URL) => {
        assert.deepEqual(new URL(notExistUrl), url);

        return { ok: false };
      });

      assert.rejects(
        async () => await getCachedOrFetchUrl(notExistUrl),
        RequestFailedError,
      );
    });
  });
});

describe('callClearCacheApi() calls and clears the cache indirectly', () => {
  it('calles the clearCache API', async () => {
    const portNumber = 3010;
    const apiUrl = `http://localhost:${portNumber}/clearCache`;
    let isApiCalled = false;
    mock.method(globalThis, 'fetch', (url: string) => {
      assert.equal(url, apiUrl);
      isApiCalled = true;

      return {
        ok: true,
      };
    });

    setPortNumber(portNumber);
    await callClearCacheApi();
    assert.ok(isApiCalled);
  });
});
