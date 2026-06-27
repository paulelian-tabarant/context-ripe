import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import nock from 'nock';
import {
  mkdtempSync,
  rmSync,
  existsSync,
  readFileSync,
  mkdirSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runInit } from '@/commands/runInit.js';

describe('runInit', () => {
  let tmpDir: string;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'ripe-test-'));
    nock.cleanAll();
    nock.disableNetConnect();
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
    nock.cleanAll();
    nock.enableNetConnect();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('exits 0 with warning when .ripe/config.json already exists', async () => {
    mkdirSync(join(tmpDir, '.ripe'), { recursive: true });
    writeFileSync(join(tmpDir, '.ripe/config.json'), '{}');

    const result = await runInit('http://localhost:3000', { cwd: tmpDir });

    expect(result.exitCode).toBe(0);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('already exists')
    );
  });

  it('creates .ripe/config.json with projectId and serverUrl on 201', async () => {
    nock('http://localhost:3000')
      .post('/api/projects', { name: tmpDir.split('/').pop() })
      .reply(201, { projectId: 'proj_abc123' });

    const result = await runInit('http://localhost:3000', { cwd: tmpDir });

    expect(result.exitCode).toBe(0);

    const config = JSON.parse(
      readFileSync(join(tmpDir, '.ripe/config.json'), 'utf-8')
    ) as { projectId: string; serverUrl: string };

    expect(config.projectId).toBe('proj_abc123');
    expect(config.serverUrl).toBe('http://localhost:3000');
  });

  it('writes config and exits 0 on 409 when user confirms', async () => {
    nock('http://localhost:3000')
      .post('/api/projects')
      .reply(409, { projectId: 'proj_existing', message: 'Project already exists' });

    const result = await runInit('http://localhost:3000', {
      cwd: tmpDir,
      promptFn: async () => true,
    });

    expect(result.exitCode).toBe(0);

    const config = JSON.parse(
      readFileSync(join(tmpDir, '.ripe/config.json'), 'utf-8')
    ) as { projectId: string };

    expect(config.projectId).toBe('proj_existing');
  });

  it('exits 0 without writing config on 409 when user declines', async () => {
    nock('http://localhost:3000')
      .post('/api/projects')
      .reply(409, { projectId: 'proj_existing', message: 'Project already exists' });

    const result = await runInit('http://localhost:3000', {
      cwd: tmpDir,
      promptFn: async () => false,
    });

    expect(result.exitCode).toBe(0);
    expect(existsSync(join(tmpDir, '.ripe/config.json'))).toBe(false);
  });

  it('exits 1 and prints to stderr when server is unreachable', async () => {
    nock('http://localhost:3000')
      .post('/api/projects')
      .replyWithError('connect ECONNREFUSED 127.0.0.1:3000');

    const result = await runInit('http://localhost:3000', { cwd: tmpDir });

    expect(result.exitCode).toBe(1);
    expect(errorSpy).toHaveBeenCalled();
  });
});
