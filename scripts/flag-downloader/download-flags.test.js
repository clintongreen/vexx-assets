import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getRetryDelayMs, resolveOutputDir, shouldRetryStatus } from './download-flags.js';

test('retries transient 429 and 5xx responses', () => {
  assert.equal(shouldRetryStatus(429), true);
  assert.equal(shouldRetryStatus(500), true);
  assert.equal(shouldRetryStatus(404), false);
});

test('uses Retry-After when present', () => {
  const response = {
    headers: {
      get(name) {
        return name === 'retry-after' ? '2' : null;
      },
    },
  };

  const delay = getRetryDelayMs(response, 0);
  assert.ok(delay >= 2000);
  assert.ok(delay <= 2500);
});

test('uses the repository flags directory for downloads', () => {
  const outputDir = resolveOutputDir();
  const expectedDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'flags');
  assert.equal(outputDir, expectedDir);
});
