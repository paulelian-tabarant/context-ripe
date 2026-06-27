import type Database from 'better-sqlite3';

export type ProjectRow = {
  id: string;
  name: string;
};

export class ProjectRepository {
  constructor(private readonly db: Database.Database) {}

  findByName(name: string): ProjectRow | undefined {
    return this.db
      .prepare<[string], ProjectRow>('SELECT id, name FROM projects WHERE name = ?')
      .get(name);
  }

  insert(project: ProjectRow): void {
    this.db
      .prepare('INSERT INTO projects (id, name) VALUES (?, ?)')
      .run(project.id, project.name);
  }
}
