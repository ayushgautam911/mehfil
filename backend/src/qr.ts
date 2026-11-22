import crypto from 'crypto';
import { config } from './config.js';

// Security-critical pass/QR helpers, extracted so they are unit-testable in
// isolation from the HTTP routes.

/** Generate a cryptographically-random pass token. */
export function generateQrToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/** HMAC-SHA256 sign a token with the server QR secret. */
export function signQrToken(token: string): string {
  return crypto.createHmac('sha256', config.QR_SECRET).update(token).digest('hex');
}

/** Build the scannable payload string: "<token>:<signature>". */
export function buildQrPayload(token: string, signature: string): string {
  return `${token}:${signature}`;
}

export interface QrVerification {
  valid: boolean;
  token: string | null;
  reason?: 'malformed' | 'bad_signature';
}

/**
 * Verify a scanned payload. Returns the embedded token only when the signature
 * is valid. Uses a constant-time comparison to avoid timing leaks.
 */
export function verifyQrPayload(payload: unknown): QrVerification {
  if (typeof payload !== 'string' || !payload.includes(':')) {
    return { valid: false, token: null, reason: 'malformed' };
  }
  const [token, signature] = payload.split(':');
  if (!token || !signature) {
    return { valid: false, token: null, reason: 'malformed' };
  }
  const expected = signQrToken(token);
  if (signature.length !== expected.length) {
    return { valid: false, token: null, reason: 'bad_signature' };
  }
  const ok = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  return ok ? { valid: true, token } : { valid: false, token: null, reason: 'bad_signature' };
}
