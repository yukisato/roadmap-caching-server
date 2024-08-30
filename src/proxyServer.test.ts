import assert from 'node:assert/strict';
import { beforeEach, afterEach, describe, it } from 'node:test';
import { getHandler, startProxyServer } from '@/proxyServer';
import express from 'express';
import request from 'supertest';
import { connect, initDb, storeOriginUrl } from '@/dbServer';
import { NoOriginUrlError } from '@/lib/errors';

describe('getHandler()', () => {
  beforeEach(() => {
    initDb();
  });
  afterEach(() => {
    connect().close();
  });

  it('returns the actual data fetched from the origin URL with `x-cache: MISS` header for the first, then returns the data with `x-cache: HIT` header for the second access', async () => {
    const origin = 'https://raw.githubusercontent.com';
    storeOriginUrl(origin);
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

  it('throws NoOriginUrlError when there is no origin URL in the DB', async () => {
    const app = express();
    app.get(/.*/, getHandler);

    assert.rejects(async () => await request(app).get('/'), NoOriginUrlError);
  });
});

describe('`startProxyServer()` starts the proxy server', () => {
  beforeEach(() => {
    initDb();
  });
  afterEach(() => {
    connect().close();
  });

  it('fetches data from the origin server', async () => {
    const port = 3010;
    const originUrl = 'https://raw.githubusercontent.com';
    const path = '/yukisato/roadmap-caching-server/main/etc/test.json';
    const server = startProxyServer(port, originUrl);

    const actual = await fetch(`http://localhost:${port}${path}`);
    const expected = await fetch(originUrl + path);

    assert.ok(actual.ok);
    assert.equal(await actual.text(), await expected.text());

    server.close();
  });
});
