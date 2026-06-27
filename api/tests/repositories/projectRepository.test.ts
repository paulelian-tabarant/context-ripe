import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { initializeSchema } from '../../src/db/schema.js';
import {
  findProjectByName,
  insertProject,
} from '../../src/repositories/projectRepository.js';

function buildTestDb() {
  const db = new Database(':memory:');
  initializeSchema(db);
  return db;
}

describe('projectRepository', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = buildTestDb();
  });

  describe('findProjectByName', () => {
    it('returns undefined when project does not exist', () => {
      expect(findProjectByName(db, 'my-project')).toBeUndefined();
    });

    it('returns the project row after insertion', () => {
      insertProject(db, { id: 'proj_abc', name: 'my-project' });
      expect(findProjectByName(db, 'my-project')).toEqual({ id: 'proj_abc', name: 'my-project' });
    });
  });

  describe('insertProject', () => {
    it('throws on duplicate name', () => {
      insertProject(db, { id: 'proj_abc', name: 'my-project' });
      expect(() => insertProject(db, { id: 'proj_xyz', name: 'my-project' })).toThrow();
    });
  });
});
