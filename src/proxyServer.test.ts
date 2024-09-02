import assert from 'node:assert/strict';
import { beforeEach, afterEach, describe, it, before, after } from 'node:test';
import { clearCacheHandler, getHandler, startProxyServer } from '@/proxyServer';
import express from 'express';
import request from 'supertest';
import {
  clearCache,
  getCache,
  setCache,
  setOriginUrl,
} from '@/lib/cacheManager';
import { v4 as uuidV4 } from 'uuid';
import { Server } from 'node:http';
import { unsetPortNumber } from './lib/dbManager';

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
  let server: Server;

  before(async () => {
    await new Promise((resolve) => {
      server = startProxyServer(port, originUrl, () => resolve(null));
    });
  });
  after(async () => {
    clearCache();
    unsetPortNumber();
    await new Promise((resolve) => server.close(() => resolve(null)));
  });

  it('fetches data from the origin server', async () => {
    const actual = await fetch(`http://localhost:${port}${path}`);
    const expected = await fetch(originUrl + path);

    assert.ok(actual.ok);
    assert.equal(await actual.text(), await expected.text());
  });
});
