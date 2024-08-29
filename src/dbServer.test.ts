import { afterEach, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { cacheTableName, connect, initDb, storeCache } from '@/dbServer';
import { Database } from 'better-sqlite3';

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

describe('`storeCache()` stores the data in the cache database', () => {
  let db: Database;
  beforeEach(() => {
    db = initDb();
  });
  afterEach(() => {
    db.close();
  });

  describe(`stores proper data`, () => {
    it('stores ["/path/to/target.html", "test data"] in the cache database', () => {
      const expected = {
        id: 1,
        uri: '/path/to/target.html',
        data: 'test data',
      };
      storeCache(expected.uri, expected.data);
      const actual = db
        .prepare(`SELECT * FROM ${cacheTableName} WHERE uri = ?`)
        .get(expected.uri);

      assert.deepEqual(actual, expected);
    });
  });
});
