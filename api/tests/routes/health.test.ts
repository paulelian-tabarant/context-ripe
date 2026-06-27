import { describe, it, expect } from 'vitest';
import Database from 'better-sqlite3';
import { buildApp } from '../../src/app.js';

function buildTestApp() {
  const db = new Database(':memory:');
  return buildApp(db);
}

describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const app = buildTestApp();
    const response = await app.inject({ method: 'GET', url: '/api/health' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });
});
