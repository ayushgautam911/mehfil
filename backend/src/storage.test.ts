import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateEventImage, eventImageObjectName, MAX_IMAGE_BYTES } from './storage.js';

test('validateEventImage accepts common image types within the size limit', () => {
  for (const mime of ['image/jpeg', 'image/png', 'image/webp', 'image/gif']) {
    assert.equal(validateEventImage(mime, 1024), null, `${mime} should be accepted`);
  }
});

test('validateEventImage rejects non-image and unsupported types', () => {
  assert.ok(validateEventImage('application/pdf', 1024));
  assert.ok(validateEventImage('text/html', 1024));
  assert.ok(validateEventImage('image/svg+xml', 1024), 'svg (scriptable) must be rejected');
});

test('validateEventImage enforces the size limit and rejects empty files', () => {
  assert.equal(validateEventImage('image/png', MAX_IMAGE_BYTES), null, 'exactly at limit is OK');
  assert.ok(validateEventImage('image/png', MAX_IMAGE_BYTES + 1), 'over limit rejected');
  assert.ok(validateEventImage('image/png', 0), 'empty rejected');
});

test('eventImageObjectName derives extension from mimetype and never collides', () => {
  const a = eventImageObjectName('image/png');
  const b = eventImageObjectName('image/png');
  // 32 random bytes -> 43 base64url chars: enough entropy that URLs can't be
  // brute-forced even though the bucket is publicly readable (but unlistable).
  assert.match(a, /^events\/[A-Za-z0-9_-]{43}\.png$/);
  assert.match(eventImageObjectName('image/jpeg'), /\.jpg$/);
  assert.notEqual(a, b, 'names are random per upload');
});
