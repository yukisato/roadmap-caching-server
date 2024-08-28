import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { connect } from '@/dbServer';

describe('`connect()` connects to the DB', () => {
  it('returns the same instance when it is called twice because it is a singleton', () => {
    assert.equal(connect(), connect());
  });
});
