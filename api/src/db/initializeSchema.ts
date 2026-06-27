import type Database from 'better-sqlite3';

// TODO: Use a migrations system (e.g., better-sqlite3-helper, node-pg-migrate, or Knex)

export function initializeSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id         TEXT    PRIMARY KEY,
      name       TEXT    NOT NULL UNIQUE,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);
}
