import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderPassEmail, sendPassEmail, emailConfigured } from './email.js';

const event = { name: 'void: warehouse session', date: 'sat apr 26', time: '23:00', venue: 'warehouse — district 2' };

test('renderPassEmail embeds event details, ref and inline QR in the HTML', () => {
  const { html } = renderPassEmail({ memberName: '@cybernaut', event, ref: 'ABCD1234' });
  assert.ok(html.includes(event.name), 'event name present');
  assert.ok(html.includes(event.venue), 'venue present');
  assert.ok(html.includes('ABCD1234'), 'reference present');
  assert.ok(html.includes('cid:passqr'), 'inline QR image reference present');
});

test('renderPassEmail uses the M3HFIL brand (not Hive) and stays dark-themed', () => {
  const { html, text } = renderPassEmail({ memberName: '@cybernaut', event, ref: 'ABCD1234' });
  // Brand: M3HFIL wordmark with the accented "3", no leftover Hive.
  assert.ok(html.includes('M<span style="color:#00ff41;">3</span>HFIL'), 'M3HFIL wordmark present');
  assert.ok(!/hive/i.test(html), 'no "Hive" in HTML');
  assert.ok(text.includes('— M3HFIL'), 'plaintext signed M3HFIL');
  assert.ok(!/hive/i.test(text), 'no "Hive" in plaintext');
  // Dark theme robust to clients that strip <body>/<html> backgrounds.
  assert.ok(html.includes('content="dark"'), 'color-scheme meta present');
  assert.ok(html.includes('bgcolor="#000000"'), 'wrapper bgcolor attribute present');
});

test('renderPassEmail produces a plaintext fallback with the key facts', () => {
  const { text } = renderPassEmail({ memberName: '@cybernaut', event, ref: 'ABCD1234' });
  assert.ok(text.includes(event.name));
  assert.ok(text.includes(event.date));
  assert.ok(text.includes('ABCD1234'));
});

test('renderPassEmail escapes HTML-significant characters', () => {
  const { html } = renderPassEmail({
    memberName: '@x',
    event: { ...event, name: 'rave <script> & "co"' },
    ref: 'REF',
  });
  assert.ok(!html.includes('<script>'), 'raw tag must be escaped');
  assert.ok(html.includes('&lt;script&gt;'));
});

// Precondition is "no SMTP configured". A developer with real SMTP creds in a
// local .env (loaded via dotenv) legitimately can't exercise this path; skip
// there rather than fail. CI has no .env, so this still runs and covers the path.
test('sendPassEmail in dev mode (no SMTP) reports not-configured and does not send or throw', {
  skip: emailConfigured && 'SMTP is configured in the local env (.env); dev/no-send path not applicable',
}, async () => {
  // No SMTP_HOST in the test environment -> dev/no-send mode.
  assert.equal(emailConfigured, false);
  const result = await sendPassEmail({
    to: 'member@example.test',
    memberName: '@cybernaut',
    qrPayload: 'token123:signature456',
    event,
  });
  assert.equal(result.configured, false);
  assert.equal(result.sent, false);
});
