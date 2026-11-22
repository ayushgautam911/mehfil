import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateQrToken, signQrToken, buildQrPayload, verifyQrPayload } from './qr.js';

test('signQrToken is deterministic for the same token', () => {
  const token = 'abc123';
  assert.equal(signQrToken(token), signQrToken(token));
});

test('generateQrToken returns unique 64-char hex tokens', () => {
  const a = generateQrToken();
  const b = generateQrToken();
  assert.match(a, /^[0-9a-f]{64}$/);
  assert.notEqual(a, b);
});

test('verifyQrPayload accepts a freshly signed payload and returns the token', () => {
  const token = generateQrToken();
  const payload = buildQrPayload(token, signQrToken(token));
  const result = verifyQrPayload(payload);
  assert.equal(result.valid, true);
  assert.equal(result.token, token);
});

test('verifyQrPayload rejects a tampered signature', () => {
  const token = generateQrToken();
  const sig = signQrToken(token);
  const tampered = sig.slice(0, -1) + (sig.slice(-1) === 'a' ? 'b' : 'a'); // same length, different value
  const result = verifyQrPayload(buildQrPayload(token, tampered));
  assert.equal(result.valid, false);
  assert.equal(result.reason, 'bad_signature');
  assert.equal(result.token, null);
});

test('verifyQrPayload rejects a signature minted for a different token', () => {
  const token = generateQrToken();
  const other = generateQrToken();
  const result = verifyQrPayload(buildQrPayload(token, signQrToken(other)));
  assert.equal(result.valid, false);
});

test('verifyQrPayload flags malformed payloads', () => {
  for (const bad of ['', 'noseparator', null, undefined, 42, {}]) {
    const result = verifyQrPayload(bad as unknown);
    assert.equal(result.valid, false);
    assert.equal(result.reason, 'malformed');
  }
});
