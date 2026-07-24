import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const extensionRoot = path.resolve(currentDirectory, '..');
const sourceDirectory = path.join(extensionRoot, 'src');

async function collectScripts(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const scripts = [];

  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      scripts.push(...(await collectScripts(absolute)));
      continue;
    }

    if (/\.(?:js|mjs|cjs)$/.test(entry.name)) scripts.push(absolute);
  }

  return scripts;
}

for (const script of await collectScripts(sourceDirectory)) {
  const result = spawnSync(process.execPath, ['--check', script], {
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    process.exit(result.status ?? 1);
  }
}

const manifest = JSON.parse(
  await readFile(path.join(sourceDirectory, 'manifest.json'), 'utf8'),
);

if (manifest.manifest_version !== 3) {
  throw new Error('Chrome extension must use Manifest V3.');
}
if (manifest.background?.service_worker !== 'service-worker.js') {
  throw new Error('Manifest service worker path is invalid.');
}
if (!Array.isArray(manifest.optional_host_permissions)) {
  throw new Error('Optional host permissions are required for explicit per-origin scanning.');
}

console.log('[Qaddem Extension] Syntax and manifest validation passed.');
