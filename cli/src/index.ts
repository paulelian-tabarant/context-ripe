#!/usr/bin/env node
import { runInit } from './commands/init.js';

const [, , command, ...args] = process.argv;

async function main(): Promise<void> {
  if (command === 'init') {
    const serverUrl = args[0];
    if (!serverUrl) {
      console.error('Usage: ripe init <server-url>');
      process.exit(1);
    }
    const { exitCode } = await runInit(serverUrl);
    process.exit(exitCode);
  } else {
    console.error(`Unknown command: ${command ?? '(none)'}`);
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
