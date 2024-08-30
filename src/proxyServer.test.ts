import assert from 'node:assert/strict';
import { beforeEach, afterEach, describe, it } from 'node:test';
import { getHandler } from '@/proxyServer';
import express from 'express';
import request from 'supertest';
import { connect, initDb, storeOriginUrl } from '@/dbServer';

describe('getHandler()', () => {
  beforeEach(() => {
    initDb();
  });
  afterEach(() => {
    connect().close();
  });

  it('responds with 404', async () => {
    const origin = 'https://raw.githubusercontent.com';
    storeOriginUrl(origin);
    const path = '/yukisato/roadmap-caching-server/main/etc/test.json';
    const app = express();
    app.get(/.*/, getHandler);

    const response = await request(app).get(path);
    const expectedText = await (await fetch(origin + path)).text();

    assert.equal(response.status, 200);
    assert.equal(response.text, expectedText);
  });
});
