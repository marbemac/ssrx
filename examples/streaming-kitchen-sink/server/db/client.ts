import Database from 'better-sqlite3';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

export const sqliteDatabase = new Database('sqlite.db', {
  // Can be helpful to debug or see the running queries
  // verbose: (message?: unknown, ...additionalArgs: unknown[]) => {
  //   console.log(message, ...additionalArgs);
  // },
});

export const db: BetterSQLite3Database = drizzle(sqliteDatabase);
