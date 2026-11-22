import { Storage } from '@google-cloud/storage';
import { randomBytes } from 'crypto';
import { config } from './config.js';

// Image storage is "configured" only when a bucket is provided. Auth comes
// from ADC locally (gcloud auth application-default login) and the instance
// service account on the VM — no key files, nothing secret in the env.
export const imageStorageConfigured = Boolean(config.GCS_EVENT_IMAGES_BUCKET);

let storage: Storage | null = null;
function getStorage(): Storage {
  if (!storage) storage = new Storage();
  return storage;
}

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

// mimetype -> object extension. Doubles as the allowlist: anything not here
// is rejected before we touch the bucket.
const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

// Validate an incoming upload; returns an error message, or null if OK.
// Extracted (pure) so it's unit-testable without GCS.
export function validateEventImage(mimetype: string, sizeBytes: number): string | null {
  if (!IMAGE_EXTENSIONS[mimetype]) {
    return `Unsupported image type "${mimetype}" — use JPEG, PNG, WebP or GIF`;
  }
  if (sizeBytes <= 0) return 'Empty file';
  if (sizeBytes > MAX_IMAGE_BYTES) {
    return `Image is too large (${(sizeBytes / (1024 * 1024)).toFixed(1)} MB) — max ${MAX_IMAGE_BYTES / (1024 * 1024)} MB`;
  }
  return null;
}

// Object name for a new upload: 256 bits of crypto randomness (base64url)
// under events/, extension from the (validated) mimetype. Never user input,
// so names can't collide or traverse — and since the public bucket role
// can't list objects, an unshared URL is effectively unguessable.
export function eventImageObjectName(mimetype: string): string {
  return `events/${randomBytes(32).toString('base64url')}.${IMAGE_EXTENSIONS[mimetype]}`;
}

export function publicObjectUrl(objectName: string): string {
  return `https://storage.googleapis.com/${config.GCS_EVENT_IMAGES_BUCKET}/${objectName}`;
}

// Upload a validated image buffer; resolves to its public URL.
export async function uploadEventImage(buffer: Buffer, mimetype: string): Promise<string> {
  const objectName = eventImageObjectName(mimetype);
  const file = getStorage().bucket(config.GCS_EVENT_IMAGES_BUCKET).file(objectName);
  await file.save(buffer, {
    contentType: mimetype,
    resumable: false,
    metadata: { cacheControl: 'public, max-age=31536000, immutable' },
  });
  return publicObjectUrl(objectName);
}
