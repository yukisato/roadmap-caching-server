import { describe, it } from 'node:test';
import {
  getOperationalOptions,
  getServerOptions,
} from '@/lib/commandOptionPrser';
import assert from 'node:assert/strict';

describe('`getServerOptions()` parses the command line arguments', () => {
  it('succeeds in parsing the fullfilled command line arguments', () => {
    const argv = ['', '', '--port=1234', '--origin=https://github.com'];
    assert.deepEqual(getServerOptions(argv), {
      port: 1234,
      origin: 'https://github.com',
    });
  });

  it('fails when passed "--port=non-numeric"', () => {
    assert.equal(getServerOptions(['', '', '--port=non-numeric']), undefined);
  });

  it('fails when no arguments are passed', () => {
    assert.equal(getServerOptions([]), undefined);
  });

  it('fails when passed "--origin=non-url"', () => {
    assert.equal(getServerOptions(['', '', '--origin=non-url']), undefined);
  });
});

describe('`getOperationalOptions()` parses the command line arguments', () => {
  it('succeeds in parsing the fullfilled command line arguments', () => {
    assert.deepEqual(getOperationalOptions(['', '', '--clear-cache']), {
      clearCache: true,
    });
  });
});
