import type { FastifyPluginAsync } from 'fastify';
import type { ProjectService } from '../services/ProjectService.js';

interface ProjectRouteOptions {
  projectService: ProjectService;
}

const projectSchema = {
  body: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string', minLength: 1 },
    },
    additionalProperties: false,
  },
} as const;

export const projectRoutes: FastifyPluginAsync<ProjectRouteOptions> = async (app, opts) => {
  app.post<{ Body: { name: string } }>(
    '/api/projects',
    { schema: projectSchema },
    async (request, reply) => {
      const result = opts.projectService.registerProject(request.body.name);

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
