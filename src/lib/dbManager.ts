import path from 'node:path';
import Database, { SqliteError } from 'better-sqlite3';

export const options: Database.Options = {
  verbose: process.env.SQLITE_DEBUG ? console.log : undefined,
};
export const portConfigTableName = 'port_config';
const dbFilename = path.resolve(__dirname, '../../db.sqlite');

export const connect = (() => {
  // Singleton instance
  let db: Database.Database;

  return (): Database.Database => {
    if (!db || !db.open) db = new Database(dbFilename, options);

    return db;
  };
})();

export const initDb = (): void => {
  configureDb();
  transactionErrorHandler(
    connect().transaction(() => {
      createTableIfNotExists();
      createRecordIfNotExists();
      unsetPortNumber();
    }),
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
      )`,
    )
    .run();
};

export const createRecordIfNotExists = (): void => {
  const db = connect();
  const count =
    db
      .prepare<[], { count: number }>(
        `SELECT COUNT(*) count FROM ${portConfigTableName}`,
      )
      .get()?.count ?? 0;
  if (count === 0)
    db.prepare(
      `INSERT INTO ${portConfigTableName} (port_number) VALUES (null)`,
    ).run();
};

export const unsetPortNumber = (): void => {
  connect()
    .prepare(
      `UPDATE ${portConfigTableName} SET port_number = null WHERE id = 1`,
    )
    .run();
};

export const setPortNumber = (portNumber: number): void => {
  const db = connect();
  db.prepare<[number]>(
    `UPDATE ${portConfigTableName} set port_number = ? WHERE id = 1`,
  ).run(portNumber);
};

export const getPortNumber = (): number | null =>
  connect()
    .prepare<[], { port_number: number | null }>(
      `SELECT port_number FROM ${portConfigTableName} WHERE id = 1`,
    )
    .get()?.port_number ?? null;

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
    }
    if (error instanceof Error) {
      console.error(error.message);
      throw error;
    }

    console.error(error);
    throw new Error(String(error));
  }
};
