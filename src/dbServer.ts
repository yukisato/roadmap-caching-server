import Database from 'better-sqlite3';

export const options = {};
export const cacheTableName = 'cache';
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
            uri TEXT UNIQUE NOT NULL,
            data TEXT NOT NULL
            )`
  ).run();

  return db;
};

export const storeCache = (uri: string, data: string): Database.RunResult =>
  connect()
    .prepare<
      [string, string]
    >(`INSERT INTO ${cacheTableName} (uri, data) VALUES (?, ?)`)
    .run(uri, data);
