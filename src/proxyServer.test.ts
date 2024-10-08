import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import {
  clearCache,
  getCache,
  setCache,
  setOriginUrl,
} from '@/lib/cacheManager';
import { clearCacheHandler, getHandler } from '@/proxyServer';
import express from 'express';
import request from 'supertest';

describe('`clearCacheHandler()` clears the cache', () => {
  it('clears the cache', async () => {
    const testData = {
      path: '/path/to/target.html',
      data: 'test data',
    };

    const app = express();
    app.get('/clearCache', clearCacheHandler);
    const agent = request(app);

    setCache(testData.path, testData.data);
    assert.equal(getCache(testData.path), testData.data);
    const response = await agent.get('/clearCache');
    assert.equal(response.status, 204);
    assert.equal(getCache(testData.path), null);
  });
});

describe('getHandler()', () => {
  beforeEach(() => {
    clearCache();
  });
  afterEach(() => {
    clearCache();
  });

  it('returns the actual data fetched from the origin URL with `x-cache: MISS` header for the first, then returns the data with `x-cache: HIT` header for the second access', async () => {
    const origin = 'https://raw.githubusercontent.com';
    setOriginUrl(origin);
    const path = '/yukisato/roadmap-caching-server/main/etc/test.json';
    const app = express();
    app.get(/.*/, getHandler);
    const agent = request(app);
    const expectedText = await (await fetch(origin + path)).text();

    const response1 = await agent.get(path);
    assert.equal(response1.status, 200);
    assert.equal(response1.text, expectedText);
    assert.equal(response1.headers['x-cache'], 'MISS');

    const response2 = await agent.get(path);
    assert.equal(response2.status, 200);
    assert.equal(response2.text, expectedText);
    assert.equal(response2.headers['x-cache'], 'HIT');
  });
});
