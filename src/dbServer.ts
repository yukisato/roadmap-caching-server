import Database, { SqliteError } from 'better-sqlite3';
import { ProxyCache } from '@/types/proxyCache';
import { InvalidUrlError } from '@/lib/errors';
import { z } from 'zod';
import path from 'node:path';

export const options: Database.Options = {
  verbose: process.env.SQLITE_DEBUG ? console.log : undefined,
};
export const cacheTableName = 'cache';
export const originUrlTableName = 'origin_url';
const dbFilename = path.resolve(__dirname, '../db.sqlite');

export const connect = (() => {
  // Singleton instance
  let db: Database.Database;

  return (): Database.Database => {
    if (!db || !db.open) db = new Database(dbFilename, options);

    return db;
  };
})();

export const configureDb = () => {
  const db = connect();
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = FULL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');
};

export const initDb = (): Database.Database => {
  const db = connect();

  transactionErrorHandler(
    db.transaction(() => {
      db.prepare(
        `CREATE TABLE IF NOT EXISTS ${cacheTableName} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT UNIQUE NOT NULL,
        data TEXT NOT NULL
        )`
      ).run();
      db.prepare(
        `CREATE TABLE IF NOT EXISTS ${originUrlTableName} (id INTEGER NOT NULL, url TEXT NOT NULL)`
      ).run();
      db.prepare(`DELETE FROM ${cacheTableName}`).run();
      db.prepare(`DELETE FROM ${originUrlTableName}`).run();
      db.prepare<[string, string]>(
        `DELETE FROM sqlite_sequence WHERE name IN (?, ?)`
      ).run(cacheTableName, originUrlTableName);
    })
  );

  return db;
};

export const storeCache = (path: string, data: string): Database.RunResult =>
  connect()
    .prepare<
      [string, string]
    >(`INSERT INTO ${cacheTableName} (path, data) VALUES (?, ?)`)
    .run(path, data);

export const getCache = (path: string): ProxyCache | null =>
  connect()
    .prepare<
      [string],
      ProxyCache
    >(`SELECT * FROM ${cacheTableName} WHERE path = ?`)
    .get(path) ?? null;

export const clearCache = () =>
  connect().exec(
    `DELETE FROM ${cacheTableName}; DELETE FROM sqlite_sequence WHERE name = '${cacheTableName}';`
  );

export const originUrlSchema = z.string().url();
export const storeOriginUrl = (originUrl: string) => {
  const url = originUrlSchema.safeParse(originUrl)?.data;
  if (!url) throw new InvalidUrlError(originUrl);

  const db = connect();
  transactionErrorHandler(
    db.transaction(() => {
      const count = db
        .prepare<
          [],
          { count: number }
        >(`SELECT COUNT(*) count FROM ${originUrlTableName}`)
        .get()?.count;

      if (count === 0) {
        db.prepare<[string]>(
          `INSERT INTO ${originUrlTableName} (id, url) VALUES (1, ?);`
        ).run(url);
      } else {
        db.prepare<[string]>(
          `UPDATE ${originUrlTableName} SET url = ? WHERE id = 1;`
        ).run(url);
      }
    })
  );
};

export const getOriginUrl = () =>
  connect()
    .prepare<
      [],
      { url: string }
    >(`SELECT url FROM ${originUrlTableName} WHERE id = 1`)
    .get()?.url ?? null;

/**
 * Handles errors that occur within a database transaction.
 *
 * @param transaction - the transaction to handle errors for
 */
export const transactionErrorHandler = (transaction: Database.Transaction) => {
  try {
    transaction();
  } catch (error) {
    if (error instanceof SqliteError) {
      console.error(error.code, error.name, error.message);
      throw error;
    } else if (error instanceof Error) {
      console.error(error.message);
      throw error;
    } else {
      console.error(error);
      throw new Error(String(error));
    }
  }
};
