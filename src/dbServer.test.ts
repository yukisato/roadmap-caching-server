import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { cacheTableName, connect, initDb } from '@/dbServer';

describe('`connect()` connects to the DB', () => {
  it('returns the same instance when it is called twice because it is a singleton', () => {
    assert.equal(connect(), connect());

    connect().close();
  });
});

describe('`initDb()` creates tables', () => {
  it('creates a cache table', () => {
    const db = connect();
    const stmt = db
      .prepare<
        [string],
        { name: string }
      >(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`)
      .bind(cacheTableName);

    // @ts-ignore for get() argument
    assert.equal(stmt.get()?.name, undefined);
    initDb();
    // @ts-ignore for get() argument
    assert.equal(stmt.get()?.name, cacheTableName);
  });
});
