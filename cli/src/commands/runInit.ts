import { existsSync } from 'node:fs';
import { basename, join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { type ProjectRegistrationResult, registerProject } from '../lib/registerProject.js';
import { writeConfig } from '../lib/writeConfig.js';

export interface InitOptions {
  cwd?: string;
  promptFn?: (question: string) => Promise<boolean>;
}

async function defaultPromptFn(question: string): Promise<boolean> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = await rl.question(question);

    return answer.toLowerCase() === 'y';
  } finally {
    rl.close();
  }
}

export async function runInit(
  serverUrl: string,
  options: InitOptions = {}
): Promise<{ exitCode: 0 | 1 }> {
  const cwd = options.cwd ?? process.cwd();
  const promptFn = options.promptFn ?? defaultPromptFn;
  const configPath = join(cwd, '.ripe/config.json');

  if (existsSync(configPath)) {
    console.warn('.ripe/config.json already exists — project is already registered.');
    return { exitCode: 0 };
  }

  const defaultProjectName = basename(cwd);

  let result: ProjectRegistrationResult;
  try {
    result = await registerProject(serverUrl, defaultProjectName);
  } catch (err) {
    console.error(`Error: could not reach server at ${serverUrl}`);

    if (err instanceof Error) console.error(err.message);

    return { exitCode: 1 };
  }

  if (result.status === 201) {
    writeConfig(configPath, { projectId: result.projectId, serverUrl });
    console.log(`Project registered: ${result.projectId}`);

    return { exitCode: 0 };
  }

  const useExisting = await promptFn(
    `A project named '${defaultProjectName}' is already registered on this server. Attach to it? (y/n) `
  );

  if (!useExisting) {
    return { exitCode: 0 };
  }

  writeConfig(configPath, { projectId: result.projectId, serverUrl });
  console.log(`Using existing project ID: ${result.projectId}`);

  return { exitCode: 0 };
}
