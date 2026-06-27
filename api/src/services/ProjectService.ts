import { nanoid } from 'nanoid';
import type { ProjectRepository } from '../repositories/ProjectRepository.js';

export type ProjectResult =
  | { created: true; projectId: string }
  | { created: false; projectId: string };

export class ProjectService {
  constructor(private readonly repository: ProjectRepository) {}

  registerProject(name: string): ProjectResult {
    const existing = this.repository.findByName(name);

    if (existing) {
      return { created: false, projectId: existing.id };
    }

    const projectId = `proj_${nanoid()}`;
    this.repository.insert({ id: projectId, name });

    return { created: true, projectId };
  }
}
