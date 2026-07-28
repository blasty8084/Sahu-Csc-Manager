import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { Readable } from "stream";
import { env } from "./env";

const rawEndpoint = env.B2_BUCKET_ENDPOINT.trim();
const B2_ENDPOINT = /^https?:\/\//i.test(rawEndpoint)
  ? rawEndpoint
  : `https://${rawEndpoint}`;

export const B2_BUCKET = env.B2_BUCKET_NAME;

// B2 is always configured — env.ts guarantees the required vars are present.
export const b2Client = new S3Client({
  endpoint: B2_ENDPOINT,
  region: "auto",
  credentials: {
    accessKeyId: env.B2_KEY_ID,
    secretAccessKey: env.B2_APP_KEY,
  },
});

/** Always true — kept for call-site compatibility. */
export function isB2Configured(): boolean {
  return true;
}

/** Upload a Buffer or Readable stream to B2 */
export async function uploadToB2(
  key: string,
  body: Buffer | Readable,
  contentType: string,
): Promise<void> {
  if (!b2Client) throw new Error("B2 not configured");
  await b2Client.send(
    new PutObjectCommand({
      Bucket: B2_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

/** Generate a pre-signed GET URL valid for `expiresIn` seconds (default 1 hour) */
export async function getB2SignedUrl(
  key: string,
  expiresIn = 3600,
): Promise<string> {
  if (!b2Client) throw new Error("B2 not configured");
  return getSignedUrl(
    b2Client,
    new GetObjectCommand({ Bucket: B2_BUCKET, Key: key }),
    { expiresIn },
  );
}

/** Delete an object from B2 — silently ignores not-found */
export async function deleteFromB2(key: string): Promise<void> {
  if (!b2Client) throw new Error("B2 not configured");
  await b2Client.send(new DeleteObjectCommand({ Bucket: B2_BUCKET, Key: key }));
}

/** Download an object from B2 as a Node.js Readable stream */
export async function downloadFromB2(key: string): Promise<Readable> {
  if (!b2Client) throw new Error("B2 not configured");
  const res = await b2Client.send(
    new GetObjectCommand({ Bucket: B2_BUCKET, Key: key }),
  );
  return res.Body as Readable;
}