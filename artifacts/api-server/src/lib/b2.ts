/**
 * B2 storage — removed. All avatars are stored as base64 data URLs in the
 * database. Backups are stored locally only.
 *
 * Stub exports keep import sites compiling without changes.
 */

export const B2_BUCKET = "";
export const b2Client = null;

export function isB2Configured(): boolean {
  return false;
}

export async function uploadToB2(_key: string, _body: unknown, _contentType: string): Promise<void> {
  throw new Error("B2 storage is not configured");
}

export async function getB2SignedUrl(_key: string, _expiresIn = 3600): Promise<string> {
  throw new Error("B2 storage is not configured");
}

export async function deleteFromB2(_key: string): Promise<void> {
  // no-op — B2 not configured
}

export async function downloadFromB2(_key: string): Promise<never> {
  throw new Error("B2 storage is not configured");
}
