import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { CONTRACT_DATA } from '../src/lib/contract-data.js';
import {
  isBridgeRequest,
  permissionPatternForUrl,
  safeScanUrl,
} from '../src/lib/contract.js';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const sharedContractPath = path.resolve(
  currentDirectory,
  '../../../packages/shared/src/bridge-contract.json',
);

test('extension contract remains identical to shared website contract', async () => {
  const shared = JSON.parse(await readFile(sharedContractPath, 'utf8'));
  assert.deepEqual(CONTRACT_DATA, shared);
});

test('safe URL validation blocks internal networks and unsafe schemes', () => {
  assert.equal(safeScanUrl('javascript:alert(1)'), null);
  assert.equal(safeScanUrl('http://10.0.0.2/jobs'), null);
  assert.equal(safeScanUrl('http://localhost:3000/admin'), null);

  const url = safeScanUrl('https://careers.example.com/jobs/1#apply');
  assert.ok(url);
  assert.equal(url.hash, '');
  assert.equal(permissionPatternForUrl(url), 'https://careers.example.com/*');
});

test('bridge request validation rejects malformed envelopes', () => {
  assert.equal(
    isBridgeRequest({
      messageType: CONTRACT_DATA.messageTypes.request,
      protocol: CONTRACT_DATA.protocol,
      requestId: 'request_12345678',
      command: 'SCAN_URL',
      payload: {
        url: 'https://example.com/jobs',
        depth: 'deep',
      },
    }),
    true,
  );

  assert.equal(
    isBridgeRequest({
      messageType: CONTRACT_DATA.messageTypes.request,
      protocol: 'wrong-protocol',
      requestId: 'request_12345678',
      command: 'SCAN_URL',
      payload: {
        url: 'https://example.com/jobs',
        depth: 'unlimited',
      },
    }),
    false,
  );
});
