import assert from 'node:assert/strict';
import { after, afterEach, before, beforeEach, describe, it } from 'node:test';
import {
  clearCache,
  getCache,
  setCache,
  setOriginUrl,
} from '@/lib/cacheManager';
import {
  type ProxyServerCloser,
  clearCacheHandler,
  getHandler,
  startProxyServer,
} from '@/proxyServer';
import express from 'express';
import request from 'supertest';
import { v4 as uuidV4 } from 'uuid';

describe('`clearCacheHandler()` clears the cache', () => {
  it('clears the cache', async () => {
    const testData = {
      path: '/path/to/target.html',
      data: uuidV4(),
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

describe('`startProxyServer()` starts the proxy server', () => {
  const port = 3010;
  const originUrl = 'https://raw.githubusercontent.com';
  const path = '/yukisato/roadmap-caching-server/main/etc/test.json';
  let closeProxyServer: ProxyServerCloser;

  before(async () => {
    closeProxyServer = (await startProxyServer(port, originUrl))
      .closeProxyServer;
  });
  after(async () => {
    await closeProxyServer();
  });

  it('fetches data from the origin server', async () => {
    const actual = await fetch(`http://localhost:${port}${path}`);
    const expected = await fetch(originUrl + path);

    assert.ok(actual.ok);
    assert.equal(await actual.text(), await expected.text());
  });
});
