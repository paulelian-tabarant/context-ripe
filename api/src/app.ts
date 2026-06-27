import Fastify from 'fastify';
import type Database from 'better-sqlite3';
import { initializeSchema } from './db/schema.js';
import { healthRoutes } from './routes/health.js';

export function buildApp(db: Database.Database) {
  const app = Fastify({ logger: false });
  initializeSchema(db);
  app.register(healthRoutes);
  return app;
}
