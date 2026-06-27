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

export function projectExistsByName(db: Database.Database, name: string): boolean {
  return db.prepare('SELECT 1 FROM projects WHERE name = ?').get(name) !== undefined;
}

export function insertProject(db: Database.Database, project: ProjectRow): void {
  db.prepare('INSERT INTO projects (id, name) VALUES (?, ?)').run(project.id, project.name);
}
