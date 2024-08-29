import { afterEach, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  cacheTableName,
  clearCache,
  connect,
  getCache,
  initDb,
  storeCache,
} from '@/dbServer';
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

describe('`storeCache()` stores the data in the DB', () => {
  let db: Database;
  beforeEach(() => {
    db = initDb();
  });
  afterEach(() => {
    db.close();
  });

  describe(`stores proper data`, () => {
    it('stores ["/path/to/target.html", "test data"] in the DB', () => {
      const expected = {
        id: 1,
        path: '/path/to/target.html',
        data: 'test data',
      };
      storeCache(expected.path, expected.data);
      const actual = db
        .prepare(`SELECT * FROM ${cacheTableName} WHERE path = ?`)
        .get(expected.path);

      assert.deepEqual(actual, expected);
    });
  });
});

describe('`getCache()` returns a record from the DB if it exists', () => {
  let db: Database;
  beforeEach(() => {
    db = initDb();
  });
  afterEach(() => {
    db.close();
  });

  describe(`when there is a record with the provided path in the DB`, () => {
    it('returns { id: 1, path: "/path/to/target.html", "test data" } when the data is in the DB and the same path is provided', () => {
      const expected = {
        id: 1,
        path: '/path/to/target.html',
        data: 'test data',
      };
      storeCache(expected.path, expected.data);

      assert.deepEqual(getCache(expected.path), expected);
    });
  });

  describe(`when there is no record that matches the provided path in the DB`, () => {
    it('returns `null` when the DB contains only one data { path: "/path/to/target.html", "test data" } and "/different/path" is passed', () => {
      const record = {
        path: '/path/to/target.html',
        data: 'test data',
      };
      storeCache(record.path, record.data);

      assert.equal(getCache('/different/path'), null);
    });
  });
});

describe('`clearCache()` deletes the cache data records in the DB', () => {
  beforeEach(() => {
    initDb();
  });
  afterEach(() => {
    connect().close();
  });

  it('deletes all records in the DB', () => {
    const records = [
      {
        path: '/test1.html',
        data: 'test data 1',
      },
      {
        path: '/test2.html',
        data: 'test data 2',
      },
    ];
    records.forEach(({ path, data }) => storeCache(path, data));
    const stmt = connect().prepare<unknown[], { count: number }>(
      `SELECT COUNT(*) count FROM ${cacheTableName}`
    );

    assert.equal(stmt.get()?.count, 2);
    clearCache();
    assert.equal(stmt.get()?.count, 0);
  });
});
