import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sendCustomEmail, emailConfigured } from './email.js';

test('sendCustomEmail in dev mode (no SMTP) reports not-configured and does not send or throw', {
  skip: emailConfigured && 'SMTP is configured in the local env (.env); dev/no-send path not applicable',
}, async () => {
  // No SMTP_HOST in the test environment -> dev/no-send mode.
  assert.equal(emailConfigured, false);
  const result = await sendCustomEmail({
    to: 'member@example.test',
    subject: 'test custom email',
    html: '<p>this is a test</p>',
    text: 'this is a test',
  });
  assert.equal(result.configured, false);
  assert.equal(result.sent, false);
});
