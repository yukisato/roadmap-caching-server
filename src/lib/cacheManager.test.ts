import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  clearCache,
  getCache,
  getOriginUrl,
  setCache,
  setOriginUrl,
} from '@/lib/cacheManager';

describe('`setCache()` and `getCache()` stores/retrieves the data in the cache', () => {
  it('set and get the data in the cache', () => {
    const testData = {
      path: '/path/to/target.html',
      data: 'test data',
    };

    assert.notEqual(getCache(testData.path), testData.data);
    setCache(testData.path, testData.data);
    assert.equal(getCache(testData.path), testData.data);
  });
});

describe('`clearCache()` removes the data in the cache', () => {
  it('removes the the cache and getCache() returns `null` for the same path', () => {
    const expected = {
      path: '/path/to/target.html',
      data: 'test data',
    };

    setCache(expected.path, expected.data);
    clearCache();
    assert.equal(getCache(expected.path), null);
  });
});

describe('`setOriginUrl()` and `getOriginUrl()` stores/retrieves the data in the originUrl', () => {
  it('set and get the data in the originUrl', () => {
    const expected = 'https://github.com/yukisato';

    assert.notEqual(getOriginUrl(), expected);
    setOriginUrl(expected);
    assert.equal(getOriginUrl(), expected);
  });
});
