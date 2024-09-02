import {
  connect,
  createTableIfNotExists,
  portConfigTableName,
} from '@/dbServer';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

describe('`connect()` connects to the DB', () => {
  it('returns the same instance when it is called twice because it is a singleton', () => {
    assert.equal(connect(), connect());

    connect().close();
  });
});

describe('`createTableIfNotExists()` creates tables', () => {
  it('creates a cache table and an origin_url table', () => {
    const db = connect();
    db.prepare(`DROP TABLE IF EXISTS ${portConfigTableName}`).run();

    const stmt = db.prepare<[string], { name: string }>(
      `SELECT name FROM sqlite_master WHERE type='table' AND name=?`
    );

    assert.equal(stmt.get(portConfigTableName)?.name, undefined);
    createTableIfNotExists();
    assert.equal(stmt.get(portConfigTableName)?.name, portConfigTableName);

    db.close();
  });
});
