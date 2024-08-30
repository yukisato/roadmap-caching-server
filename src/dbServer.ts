import Database from 'better-sqlite3';
import { ProxyCache } from '@/types/proxyCache';

export const options: Database.Options = {};
export const cacheTableName = 'cache';
export const originUrlTableName = 'origin_url';

// For a singleton DB instance
let db: Database.Database;
export const connect = (): Database.Database => {
  if (!db || !db.open) db = new Database(':memory:', options);

  return db;
};

export const initDb = (): Database.Database => {
  const db = connect();
  db.pragma('journal_mode = WAL');
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

export const storeOriginUrl = (originUrl: string) => {
  const db = connect();
  const count = db
    .prepare<
      [],
      { count: number }
    >(`SELECT COUNT(*) count FROM ${originUrlTableName}`)
    .get()?.count;

  if (count === 0) {
    db.prepare(
      `INSERT INTO ${originUrlTableName} (id, url) VALUES (1, ?);`
    ).run(originUrl);
  } else {
    db.prepare(`UPDATE ${originUrlTableName} SET url = ? WHERE id = 1;`).run(
      originUrl
    );
  }
};
