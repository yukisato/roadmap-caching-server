import { afterEach, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  cacheTableName,
  clearCache,
  connect,
  createTablesIfNotExists,
  getCache,
  getOriginUrl,
  initDb,
  originUrlTableName,
  resetTables,
  storeCache,
  storeOriginUrl,
} from '@/dbServer';
import { InvalidUrlError } from './lib/errors';

describe('`connect()` connects to the DB', () => {
  it('returns the same instance when it is called twice because it is a singleton', () => {
    assert.equal(connect(), connect());

    connect().close();
  });
});

describe('`createTablesIfNotExists()` creates tables', () => {
  it('creates a cache table and an origin_url table', () => {
    const db = connect();
    db.transaction(() => {
      db.prepare(`DROP TABLE IF EXISTS ${cacheTableName}`).run();
      db.prepare(`DROP TABLE IF EXISTS ${originUrlTableName}`).run();
    })();

    const stmt = db.prepare<[string], { name: string }>(
      `SELECT name FROM sqlite_master WHERE type='table' AND name=?`
    );

    assert.equal(stmt.get(cacheTableName)?.name, undefined);
    assert.equal(stmt.get(originUrlTableName)?.name, undefined);
    createTablesIfNotExists();
    assert.equal(stmt.get(cacheTableName)?.name, cacheTableName);
    assert.equal(stmt.get(originUrlTableName)?.name, originUrlTableName);

    db.close();
  });
});

describe('`resetTables()` deletes all records in the DB', () => {
  beforeEach(() => {
    initDb();
  });
  afterEach(() => {
    connect().close();
  });

  it('deletes all records in origin_url and cache table', () => {
    const record = {
      id: 1,
      path: '/test/path',
      data: 'test data',
    };
    const originUrl = 'https://github.com';
    storeCache(record.path, record.data);
    storeOriginUrl(originUrl);

    assert.deepEqual(getCache(record.path), record);
    assert.equal(getOriginUrl(), originUrl);
    resetTables();
    assert.equal(getCache(record.path), null);
    assert.equal(getOriginUrl(), null);
  });
});

describe('`storeCache()` stores the data in the DB', () => {
  describe(`stores proper data`, () => {
    it('stores ["/path/to/target.html", "test data"] in the DB', () => {
      initDb();
      const expected = {
        id: 1,
        path: '/path/to/target.html',
        data: 'test data',
      };
      storeCache(expected.path, expected.data);
      const actual = connect()
        .prepare(`SELECT * FROM ${cacheTableName} WHERE path = ?`)
        .get(expected.path);

      assert.deepEqual(actual, expected);
    });
  });
});

describe('`getCache()` returns a record from the DB if it exists', () => {
  beforeEach(() => {
    initDb();
  });
  afterEach(() => {
    connect().close();
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

describe('`storeOriginUrl()` stores the origin URL in the DB', () => {
  beforeEach(() => {
    initDb();
  });
  afterEach(() => {
    connect().close();
  });

  it('stores the origin URL in the DB', () => {
    const originUrl = 'https://github.com';
    const db = connect();
    const stmt = db.prepare<[], { url: string }>(
      `SELECT url FROM ${originUrlTableName} WHERE id = 1`
    );

    assert.equal(stmt.get()?.url, undefined);
    storeOriginUrl(originUrl);
    assert.equal(stmt.get()?.url, originUrl);
  });

  it('throws InvalidUrlError when an non-URL string is provided', () => {
    assert.throws(() => storeOriginUrl('non-url'), InvalidUrlError);
  });
});

describe('`getOriginUrl()` returns the origin URL from the DB', () => {
  beforeEach(() => {
    initDb();
  });
  afterEach(() => {
    connect().close();
  });

  it('returns the origin URL from the DB', () => {
    const originUrl = 'https://github.com';
    const db = connect();
    const stmt = db.prepare<[], { url: string }>(
      `SELECT url FROM ${originUrlTableName} WHERE id = 1`
    );

    assert.equal(stmt.get()?.url, undefined);
    storeOriginUrl(originUrl);
    assert.equal(getOriginUrl(), originUrl);
  });

  it('returns `null` if there is no origin URL in the DB', () => {
    assert.equal(getOriginUrl(), null);
  });
});
