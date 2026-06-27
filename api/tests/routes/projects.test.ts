import { describe, it, expect, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { buildApp } from '../../src/app.js';

describe('POST /api/projects', () => {
  let app: ReturnType<typeof buildApp>;

  afterEach(async () => {
    await app.close();
  });

  it('returns 201 with projectId for a new project', async () => {
    const db = new Database(':memory:');
    app = buildApp(db, { logger: false });
    const response = await app.inject({
      method: 'POST',
      url: '/api/projects',
      payload: { name: 'my-project' },
    });
    expect(response.statusCode).toBe(201);
    expect(response.json().projectId).toMatch(/^proj_/);
  });

  it('returns 409 with existing projectId for a duplicate name', async () => {
    const db = new Database(':memory:');
    app = buildApp(db, { logger: false });
    const first = await app.inject({
      method: 'POST',
      url: '/api/projects',
      payload: { name: 'my-project' },
    });
    const second = await app.inject({
      method: 'POST',
      url: '/api/projects',
      payload: { name: 'my-project' },
    });
    expect(second.statusCode).toBe(409);
    expect(second.json().projectId).toBe(first.json().projectId);
    expect(second.json().message).toBe('Project already exists');
  });

  it('returns 400 for a missing name field', async () => {
    const db = new Database(':memory:');
    app = buildApp(db, { logger: false });
    const response = await app.inject({
      method: 'POST',
      url: '/api/projects',
      payload: {},
    });
    expect(response.statusCode).toBe(400);
  });

  it('returns 400 for an empty name string', async () => {
    const db = new Database(':memory:');
    app = buildApp(db, { logger: false });
    const response = await app.inject({
      method: 'POST',
      url: '/api/projects',
      payload: { name: '' },
    });
    expect(response.statusCode).toBe(400);
  });
});
