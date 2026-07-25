import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const popupPath = path.resolve(currentDirectory, '../src/popup.js');

test('current-page scan uses activeTab directly instead of optional origin permission', async () => {
  const source = await readFile(popupPath, 'utf8');

  assert.match(source, /chrome\.scripting\.executeScript/);
  assert.match(source, /files:\s*\['scanner-content\.js'\]/);
  assert.match(source, /chrome\.storage\.local\.set/);
  assert.doesNotMatch(source, /QADDEM_POPUP_SCAN_CURRENT/);
});
