import { spawn } from 'node:child_process';

const pnpmCommand = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env: process.env,
      stdio: 'inherit',
    });

    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          `${command} ${args.join(' ')} failed with ${signal ? `signal ${signal}` : `exit code ${code ?? 'unknown'}`}`,
        ),
      );
    });
  });
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (databaseUrl) {
    console.log('[Qaddem] DATABASE_URL detected. Applying pending Prisma migrations.');
    await run(pnpmCommand, ['db:deploy']);
  } else {
    console.warn(
      '[Qaddem] DATABASE_URL is not configured. Starting in preview-only mode without persistent storage.',
    );
  }

  const web = spawn(pnpmCommand, ['--filter', '@qaddem/web', 'start'], {
    env: process.env,
    stdio: 'inherit',
  });

  const forwardSignal = (signal) => {
    if (!web.killed) web.kill(signal);
  };

  process.once('SIGTERM', () => forwardSignal('SIGTERM'));
  process.once('SIGINT', () => forwardSignal('SIGINT'));

  web.once('error', (error) => {
    console.error('[Qaddem] Failed to start the web application.', error);
    process.exit(1);
  });

  web.once('exit', (code, signal) => {
    if (signal) {
      console.error(`[Qaddem] Web application stopped with signal ${signal}.`);
      process.exit(1);
    }

    process.exit(code ?? 1);
  });
}

main().catch((error) => {
  console.error('[Qaddem] Production startup failed.', error);
  process.exit(1);
});
