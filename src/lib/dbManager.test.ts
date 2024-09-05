import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import {
  connect,
  createRecordIfNotExists,
  createTableIfNotExists,
  getPortNumber,
  portConfigTableName,
  setPortNumber,
  unsetPortNumber,
} from '@/lib/dbManager';

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
      `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
    );

    assert.equal(stmt.get(portConfigTableName)?.name, undefined);
    createTableIfNotExists();
    assert.equal(stmt.get(portConfigTableName)?.name, portConfigTableName);

    db.close();
  });
});

describe('`createRecordIfNotExists()` creates a record if not exists', () => {
  before(() => {
    createTableIfNotExists();
  });
  after(() => {
    connect().close();
  });

  describe('when the record does not exist', () => {
    it('creates a record', () => {
      const db = connect();
      db.prepare(`DELETE FROM ${portConfigTableName}`).run();
      const stmt = db.prepare<[], { count: number }>(
        `SELECT COUNT(*) count FROM ${portConfigTableName}`,
      );

      assert.equal(stmt.get()?.count, 0);
      createRecordIfNotExists();
      assert.equal(stmt.get()?.count, 1);
    });
  });

  describe('when the record already exists', () => {
    it('does not create a record', () => {
      const db = connect();
      db.prepare(`DELETE FROM ${portConfigTableName}`).run();
      const stmt = db.prepare<[], { count: number }>(
        `SELECT COUNT(*) count FROM ${portConfigTableName}`,
      );

      assert.equal(stmt.get()?.count, 0);
      createRecordIfNotExists();
      assert.equal(stmt.get()?.count, 1);
      createRecordIfNotExists();
      assert.equal(stmt.get()?.count, 1);
    });
  });
});

describe('`unsetPortNumber()` unsets the port config in the table', () => {
  before(() => {
    createTableIfNotExists();
    createRecordIfNotExists();
  });
  after(() => {
    connect().close();
  });

  it('sets null to the record in port_config table', () => {
    const portNumber = 3010;
    const db = connect();
    db.prepare(`UPDATE ${portConfigTableName} SET port_number = ?`).run(
      portNumber,
    );
    const stmt = db.prepare<[], { port_number: number | null }>(
      `SELECT port_number FROM ${portConfigTableName} WHERE id = 1`,
    );

    assert.equal(stmt.get()?.port_number, portNumber);
    unsetPortNumber();
    assert.equal(stmt.get()?.port_number, null);
  });
});

describe('`setPortNumber()` and `getPortNumber()` works as getter/setter using port_no table', () => {
  before(() => {
    createTableIfNotExists();
    createRecordIfNotExists();
  });
  beforeEach(() => {
    unsetPortNumber();
  });
  after(() => {
    connect().close();
  });

  it('gets/sets the port number in the table', () => {
    const portNumber = 3010;

    assert.equal(getPortNumber(), null);
    setPortNumber(portNumber);
    assert.equal(getPortNumber(), portNumber);
  });

  it('can set 0 as the port number', () => {
    const portNumber = 0;

    assert.equal(getPortNumber(), null);
    setPortNumber(portNumber);
    assert.equal(getPortNumber(), portNumber);
  });
});
