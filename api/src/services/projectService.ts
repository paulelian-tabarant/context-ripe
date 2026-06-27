import { nanoid } from 'nanoid';
import type Database from 'better-sqlite3';
import { findProjectByName, insertProject } from '../repositories/projectRepository.js';

export type ProjectResult =
  | { created: true; projectId: string }
  | { created: false; projectId: string };

export function registerProject(db: Database.Database, name: string): ProjectResult {
  const existing = findProjectByName(db, name);
  if (existing) {
    return { created: false, projectId: existing.id };
  }
  const projectId = `proj_${nanoid()}`;
  const result = insertProject(db, { id: projectId, name });
  if (result.inserted) {
    return { created: true, projectId };
  }
  return { created: false, projectId: result.existingId };
}
