import type Database from 'better-sqlite3';

export interface ProjectRow {
  id: string;
  name: string;
}

export function findProjectByName(
  db: Database.Database,
  name: string
): ProjectRow | undefined {
  return db
    .prepare<[string], ProjectRow>('SELECT id, name FROM projects WHERE name = ?')
    .get(name);
}

export function insertProject(
  db: Database.Database,
  project: ProjectRow
): { inserted: true } | { inserted: false; existingId: string } {
  try {
    db.prepare('INSERT INTO projects (id, name) VALUES (?, ?)').run(project.id, project.name);
    return { inserted: true };
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      'code' in err &&
      (err as { code: string }).code === 'SQLITE_CONSTRAINT_UNIQUE'
    ) {
      const existing = findProjectByName(db, project.name);
      if (!existing) throw err;
      return { inserted: false, existingId: existing.id };
    }
    throw err;
  }
}
