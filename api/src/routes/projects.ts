import type { FastifyPluginAsync } from 'fastify';
import type Database from 'better-sqlite3';
import { registerProject } from '../services/projectService.js';

interface ProjectRouteOptions {
  db: Database.Database;
}

export const projectRoutes: FastifyPluginAsync<ProjectRouteOptions> = async (app, opts) => {
  app.post<{ Body: { name: string } }>(
    '/api/projects',
    {
      schema: {
        body: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', minLength: 1 },
          },
          additionalProperties: false,
        },
      },
    },
    async (request, reply) => {
      const result = registerProject(opts.db, request.body.name);
      if (result.created) {
        return reply.code(201).send({ projectId: result.projectId });
      }
      return reply.code(409).send({
        projectId: result.projectId,
        message: 'Project already exists',
      });
    }
  );
};
