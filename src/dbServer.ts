import Database, { SqliteError } from 'better-sqlite3';
import path from 'node:path';

export const options: Database.Options = {
  verbose: process.env.SQLITE_DEBUG ? console.log : undefined,
};
export const portConfigTableName = 'port_config';
const dbFilename = path.resolve(__dirname, '../db.sqlite');

export const connect = (() => {
  // Singleton instance
  let db: Database.Database;

  return (): Database.Database => {
    if (!db || !db.open) db = new Database(dbFilename, options);

    return db;
  };
})();

export const initDb = (): void => {
  transactionErrorHandler(
    connect().transaction(() => {
      configureDb();
      createTableIfNotExists();
      createRecordIfNotExists();
    })
  );
};

export const configureDb = () => {
  const db = connect();
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = FULL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');
};

export const createTableIfNotExists = (): void => {
  connect()
    .prepare(
      `CREATE TABLE IF NOT EXISTS ${portConfigTableName} (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        port_number INTEGER CHECK (port_number BETWEEN 0 AND 65535)
      )`
    )
    .run();
};

export const createRecordIfNotExists = (): void => {
  const db = connect();
  const count =
    db
      .prepare<
        [],
        { count: number }
      >(`SELECT COUNT(*) count FROM ${portConfigTableName}`)
      .get()?.count ?? 0;
  if (count === 0)
    db.prepare(
      `INSERT INTO ${portConfigTableName} (port_number) VALUES (null)`
    ).run();
};

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
