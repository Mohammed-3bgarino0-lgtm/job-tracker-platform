import { cp, mkdir, readFile, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONTRACT_DATA } from '../src/lib/contract-data.js';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const extensionRoot = path.resolve(currentDirectory, '..');
const repositoryRoot = path.resolve(extensionRoot, '../..');
const sourceDirectory = path.join(extensionRoot, 'src');
const outputDirectory = path.join(extensionRoot, 'dist');
const sharedContractPath = path.join(
  repositoryRoot,
  'packages/shared/src/bridge-contract.json',
);

const sharedContract = JSON.parse(await readFile(sharedContractPath, 'utf8'));
if (JSON.stringify(sharedContract) !== JSON.stringify(CONTRACT_DATA)) {
  throw new Error(
    'Extension contract data is out of sync with packages/shared/src/bridge-contract.json.',
  );
}

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });
await cp(sourceDirectory, outputDirectory, { recursive: true });

await rename(
  path.join(outputDirectory, 'bridge-content.cjs'),
  path.join(outputDirectory, 'bridge-content.js'),
);
await rename(
  path.join(outputDirectory, 'scanner-content.cjs'),
  path.join(outputDirectory, 'scanner-content.js'),
);

console.log(`[Qaddem Extension] Built ${CONTRACT_DATA.extensionVersion} at ${outputDirectory}`);
