import Database from 'better-sqlite3';

export const options = {};
export const cacheTableName = 'cache';
// For a singleton DB instance
let db: Database.Database;
export const connect = (): Database.Database => {
  if (!db || !db.open) db = new Database(':memory:', options);

  return db;
};
