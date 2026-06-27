import { nanoid } from 'nanoid';
import type Database from 'better-sqlite3';
import { findProjectByName, projectExistsByName, insertProject } from '../repositories/projectRepository.js';

export type ProjectResult =
  | { created: true; projectId: string }
  | { created: false; projectId: string };

export function registerProject(db: Database.Database, name: string): ProjectResult {
  const existing = findProjectByName(db, name);
  if (existing) {
    return { created: false, projectId: existing.id };
  }
  const projectId = `proj_${nanoid()}`;
  try {
    insertProject(db, { id: projectId, name });
    return { created: true, projectId };
  } catch (err) {
    const race = findProjectByName(db, name);
    if (race) return { created: false, projectId: race.id };
    throw err;
  }
}
