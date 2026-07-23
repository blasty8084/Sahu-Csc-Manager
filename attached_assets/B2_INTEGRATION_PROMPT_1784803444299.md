# Task: Backblaze B2 File Storage Integration

## Overview

Integrate **Backblaze B2** (S3-compatible) as an optional file storage backend for two things:

1. **Profile pictures** — currently stored as base64 `TEXT` in the `users` table (DB bloat). Move to B2.
2. **Database backups** — currently stored only on local Replit disk (`./backups/`), which gets wiped on container restarts. Upload to B2 for persistence.

B2 is **fully optional** — if `B2_KEY_ID` is not set, the app must continue to work exactly as it does today (base64 avatars in DB, backups on local disk only). No behavior changes when B2 is absent.

---

## Codebase Context

Read `AGENT.md` fully before starting. Key facts:

- Monorepo with `pnpm workspaces`. Backend: `artifacts/api-server/` (Express 5.2, TypeScript, esbuild bundler).
- Profile picture route: `artifacts/api-server/src/routes/profile.ts` — `POST /profile/avatar`
- Backup service: `artifacts/api-server/src/services/backupCore.ts`
- Build config: `artifacts/api-server/build.mjs` — has an `external[]` array for esbuild
- B2 is S3-compatible → use `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` (no Backblaze-specific SDK needed)
- **Critical**: any new dep added to `api-server` that is also an optional peer of `drizzle-orm` must also be added to `lib/db` — otherwise pnpm creates a second drizzle-orm resolution variant and TypeScript breaks with `"separate declarations of private property 'shouldInlineParams'"`. Check `AGENT.md §12 point 5`.

---

## Step 1 — Install Package

```bash
pnpm --filter @workspace/api-server add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

`@aws-sdk/client-s3` is NOT a drizzle-orm peer dep, so no need to add it to `lib/db`.

---

## Step 2 — New File: `artifacts/api-server/src/lib/b2.ts`

Create this file exactly:

```typescript
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { Readable } from "stream";

const B2_ENDPOINT  = process.env["B2_BUCKET_ENDPOINT"];
const B2_KEY_ID    = process.env["B2_KEY_ID"];
const B2_APP_KEY   = process.env["B2_APP_KEY"];
export const B2_BUCKET = process.env["B2_BUCKET_NAME"] ?? "";

// b2Client is null when env vars are absent — checked by isB2Configured()
export const b2Client =
  B2_KEY_ID && B2_APP_KEY && B2_ENDPOINT
    ? new S3Client({
        endpoint: B2_ENDPOINT,
        region: "auto",
        credentials: {
          accessKeyId: B2_KEY_ID,
          secretAccessKey: B2_APP_KEY,
        },
      })
    : null;

export function isB2Configured(): boolean {
  return b2Client !== null;
}

/** Upload a Buffer or Readable stream to B2 */
export async function uploadToB2(
  key: string,
  body: Buffer | Readable,
  contentType: string,
): Promise<void> {
  if (!b2Client) throw new Error("B2 not configured");
  await b2Client.send(
    new PutObjectCommand({ Bucket: B2_BUCKET, Key: key, Body: body, ContentType: contentType }),
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
```

---

## Step 3 — Update `build.mjs` external array

In `artifacts/api-server/build.mjs`, add these two entries to the `external` array (alongside existing entries like `"sharp"`, `"express"`, etc.):

```javascript
"@aws-sdk/client-s3",
"@aws-sdk/s3-request-presigner",
```

**Why**: esbuild cannot bundle AWS SDK properly (it uses dynamic requires internally). Must be external so Node resolves it from `node_modules` at runtime.

---

## Step 4 — Update Profile Avatar Route

File: `artifacts/api-server/src/routes/profile.ts`

### 4a — Add imports at top of file

```typescript
import { uploadToB2, deleteFromB2, getB2SignedUrl, isB2Configured } from "../lib/b2";
```

### 4b — Update `fmtProfile` function

The `profilePicture` field in the DB will now be either:
- A legacy `data:image/webp;base64,...` string (old rows — still display fine)
- A `b2:avatars/user_123_1234567890.webp` string (new rows — resolve to signed URL)

```typescript
async function fmtProfile(user: any) {
  let profilePicture = user.profilePicture ?? null;

  // Resolve B2 key to a 1-hour pre-signed URL
  if (profilePicture?.startsWith("b2:") && isB2Configured()) {
    try {
      profilePicture = await getB2SignedUrl(profilePicture.slice(3), 3600);
    } catch {
      profilePicture = null; // key missing or B2 down — show no avatar
    }
  }
  // Legacy base64 rows pass through unchanged

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    mobile: user.mobile ?? null,
    fullName: user.fullName ?? null,
    role: user.role,
    profilePicture,
    bio: await decryptField(user.bio),
    address: await decryptField(user.address),
    createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
  };
}
```

### 4c — Replace `POST /profile/avatar` handler

Keep the sharp compression logic exactly the same. Only change what happens after `outputBuffer` is produced:

```typescript
router.post("/profile/avatar", requireAuth, asyncHandler(async (req, res) => {
  const parsed = UpdateAvatarBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const userId = req.session.userId!;
  const dataUrl = parsed.data.profilePicture;

  if (!dataUrl.startsWith("data:image/")) {
    res.status(400).json({ error: "Invalid image format. Must be a base64 data URL." }); return;
  }
  if (dataUrl.length > 7_000_000) {
    res.status(400).json({ error: "Image too large. Maximum size is 5MB." }); return;
  }

  const base64Payload = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const inputBuffer = Buffer.from(base64Payload, "base64");

  let outputBuffer: Buffer;
  try {
    outputBuffer = await sharp(inputBuffer)
      .rotate()
      .resize(AVATAR_MAX_DIMENSION, AVATAR_MAX_DIMENSION, { fit: "cover", withoutEnlargement: true })
      .webp({ quality: AVATAR_WEBP_QUALITY })
      .toBuffer();
  } catch {
    res.status(400).json({ error: "Could not process image. Please upload a valid image file." }); return;
  }

  let profilePicture: string;

  if (isB2Configured()) {
    // Delete old B2 avatar if one exists
    const [existing] = await db
      .select({ profilePicture: usersTable.profilePicture })
      .from(usersTable)
      .where(eq(usersTable.id, userId));
    if (existing?.profilePicture?.startsWith("b2:")) {
      try { await deleteFromB2(existing.profilePicture.slice(3)); } catch {}
    }

    const key = `avatars/user_${userId}_${Date.now()}.webp`;
    await uploadToB2(key, outputBuffer, "image/webp");
    profilePicture = `b2:${key}`; // store key in DB, NOT the base64
  } else {
    // Fallback: store base64 in DB as before
    profilePicture = `data:image/webp;base64,${outputBuffer.toString("base64")}`;
  }

  const [updated] = await db
    .update(usersTable)
    .set({ profilePicture })
    .where(eq(usersTable.id, userId))
    .returning();

  await auditLog(userId, "profile.avatar_update", "User updated profile picture", getClientIp(req));
  res.json({ profilePicture: updated.profilePicture });
}));
```

### 4d — Update `DELETE /profile/avatar` handler

Delete from B2 if the stored value is a B2 key:

```typescript
router.delete("/profile/avatar", requireAuth, asyncHandler(async (req, res) => {
  const userId = req.session.userId!;

  if (isB2Configured()) {
    const [existing] = await db
      .select({ profilePicture: usersTable.profilePicture })
      .from(usersTable)
      .where(eq(usersTable.id, userId));
    if (existing?.profilePicture?.startsWith("b2:")) {
      try { await deleteFromB2(existing.profilePicture.slice(3)); } catch {}
    }
  }

  await db.update(usersTable).set({ profilePicture: null }).where(eq(usersTable.id, userId));
  await auditLog(userId, "profile.avatar_delete", "User removed profile picture", getClientIp(req));
  res.json({ message: "Profile picture removed" });
}));
```

---

## Step 5 — Update Backup Service

File: `artifacts/api-server/src/services/backupCore.ts`

### 5a — Add imports

```typescript
import { createReadStream } from "fs";
import { pipeline } from "stream/promises";
import { createWriteStream } from "fs";
import { uploadToB2, downloadFromB2, deleteFromB2, isB2Configured } from "../lib/b2";
```

### 5b — Update `createBackup`

After `pg_dump` succeeds and the local file exists, upload to B2 (non-blocking — a B2 failure does not fail the backup):

```typescript
export async function createBackup(): Promise<BackupRecord> {
  const dbUrl = process.env["DATABASE_URL"] ?? process.env["NEON_DATABASE_URL"];
  if (!dbUrl) throw new Error("DATABASE_URL not configured");
  mkdirSync(BACKUP_DIR, { recursive: true });
  const filename = `backup_${new Date().toISOString().replace(/[:.]/g, "-")}.sql`;
  const filepath = path.join(BACKUP_DIR, filename);

  execSync(`pg_dump "${dbUrl}" -f "${filepath}"`);
  const size = statSync(filepath).size;

  // Upload to B2 if configured — failure is logged but does not abort the backup
  if (isB2Configured()) {
    try {
      await uploadToB2(`backups/${filename}`, createReadStream(filepath), "application/octet-stream");
      logger.info({ filename }, "Backup uploaded to B2");
    } catch (err) {
      logger.warn({ err, filename }, "B2 upload failed — backup saved locally only");
    }
  }

  const [backup] = await db
    .insert(backupsTable)
    .values({ filename, size })
    .returning();
  return fmt(backup);
}
```

### 5c — Update `getBackupForDownload`

If the local file is missing (Replit restarted and wiped `./backups/`), fetch from B2:

```typescript
export async function getBackupForDownload(id: number) {
  const [backup] = await db.select().from(backupsTable).where(eq(backupsTable.id, id));
  if (!backup) throw Object.assign(new Error("Backup not found"), { status: 404 });

  const filepath = path.join(BACKUP_DIR, backup.filename);

  // Local copy exists — serve directly
  if (existsSync(filepath)) {
    return { filepath, filename: backup.filename, size: statSync(filepath).size };
  }

  // Local missing — try to restore from B2
  if (isB2Configured()) {
    mkdirSync(BACKUP_DIR, { recursive: true });
    const stream = await downloadFromB2(`backups/${backup.filename}`);
    await pipeline(stream, createWriteStream(filepath));
    return { filepath, filename: backup.filename, size: statSync(filepath).size };
  }

  throw Object.assign(new Error("Backup file not found on disk or B2"), { status: 404 });
}
```

### 5d — Update `deleteBackup`

Delete from B2 alongside local disk delete:

```typescript
export async function deleteBackup(id: number): Promise<{ filename: string }> {
  const [backup] = await db.select().from(backupsTable).where(eq(backupsTable.id, id));
  if (!backup) throw Object.assign(new Error("Backup not found"), { status: 404 });

  // Delete local file
  try { unlinkSync(path.join(BACKUP_DIR, backup.filename)); } catch {}

  // Delete from B2
  if (isB2Configured()) {
    try { await deleteFromB2(`backups/${backup.filename}`); } catch {}
  }

  await db.delete(backupsTable).where(eq(backupsTable.id, id));
  return { filename: backup.filename };
}
```

### 5e — Update `restoreBackup`

Same as `getBackupForDownload` — if local file is missing, fetch from B2 first:

```typescript
export async function restoreBackup(id: number): Promise<{ filename: string }> {
  const dbUrl = process.env["DATABASE_URL"] ?? process.env["NEON_DATABASE_URL"];
  if (!dbUrl) throw new Error("DATABASE_URL not configured");

  const [backup] = await db.select().from(backupsTable).where(eq(backupsTable.id, id));
  if (!backup) throw Object.assign(new Error("Backup not found"), { status: 404 });

  const filepath = path.join(BACKUP_DIR, backup.filename);

  // Restore local copy from B2 if needed
  if (!existsSync(filepath) && isB2Configured()) {
    mkdirSync(BACKUP_DIR, { recursive: true });
    const stream = await downloadFromB2(`backups/${backup.filename}`);
    await pipeline(stream, createWriteStream(filepath));
  }

  if (!existsSync(filepath)) {
    throw Object.assign(new Error(`Backup file not found: ${backup.filename}`), { status: 404 });
  }

  execSync(`psql "${dbUrl}" -f "${filepath}"`);
  return { filename: backup.filename };
}
```

---

## Step 6 — Add Secrets to Replit

Add these 4 secrets in **Replit → Secrets tab**:

| Secret Key | Value |
|---|---|
| `B2_KEY_ID` | Application Key ID from Backblaze B2 dashboard |
| `B2_APP_KEY` | Application Key from Backblaze B2 dashboard |
| `B2_BUCKET_NAME` | Your bucket name (e.g. `sahu-csc-storage`) |
| `B2_BUCKET_ENDPOINT` | S3 endpoint from Backblaze (e.g. `https://s3.us-west-004.backblazeb2.com`) |

> **How to get the endpoint**: Backblaze Dashboard → B2 Cloud Storage → your bucket → "Endpoint" field.

---

## Step 7 — Update `.env.example`

Add this section to `.env.example` (after the existing `# ── Cache` section):

```bash
# ── Backblaze B2 File Storage (optional) ──────────────
# Free tier: 10 GB storage, no credit card required for private buckets.
# Sign up at backblaze.com → B2 Cloud Storage → Create Bucket (Private)
# Without these vars the app works exactly as before (base64 avatars, local backups).
B2_KEY_ID=
B2_APP_KEY=
B2_BUCKET_NAME=sahu-csc-storage
B2_BUCKET_ENDPOINT=https://s3.us-west-004.backblazeb2.com
```

---

## Step 8 — Verify

After making all changes:

1. Run `pnpm --filter @workspace/api-server run build` — must succeed with no errors.
2. Restart the API Server workflow.
3. Test with B2 env vars SET:
   - Upload a profile picture → DB should store `b2:avatars/user_X_...webp`, not base64
   - `GET /profile` should return a signed `https://...backblazeb2.com/...` URL
   - Create a backup → check Backblaze dashboard bucket for the `.sql` file
   - Delete the local `./backups/` folder manually, then download a backup → should re-fetch from B2
4. Test with B2 env vars REMOVED — app should work exactly as before.

---

## What NOT to do

- Do NOT change the `users` table schema — `profilePicture` stays as `TEXT`, just the stored value format changes.
- Do NOT make B2 required — `isB2Configured()` must gate every B2 call.
- Do NOT bundle AWS SDK via esbuild — it must stay in `external[]`.
- Do NOT add `@aws-sdk/client-s3` to `lib/db` — it is not a drizzle-orm peer dep.
- Do NOT break existing base64 avatars — `fmtProfile` must pass them through as-is (only `b2:` prefix gets resolved).
- Do NOT remove the `./backups/` local folder logic — keep it as primary; B2 is the redundant copy.
