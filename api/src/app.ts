import Fastify, { type FastifyInstance } from 'fastify';
import type Database from 'better-sqlite3';
import { initializeSchema } from './db/schema.js';
import { healthRoutes } from './routes/health.js';
import { projectRoutes } from './routes/projects.js';

export function buildApp(
  db: Database.Database,
  options: { logger?: boolean } = {}
): FastifyInstance {
  const app = Fastify({ logger: options.logger ?? true });
  initializeSchema(db);
  app.register(healthRoutes);
  app.register(projectRoutes, { db });
  return app;
}
