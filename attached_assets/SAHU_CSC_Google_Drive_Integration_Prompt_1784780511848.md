# Replit Agent 4 Prompt — Google Drive Storage Integration

## Overview
Integrate Google Drive as file storage using Service Account authentication.
Store receipt PDFs, profile photos, and exported reports on Google Drive.
Fall back to local `/tmp/` if credentials not configured.

---

## Credentials Required

| Key | Value | Status |
|---|---|---|
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Full service account JSON content | Add to Replit Secrets |
| `GOOGLE_DRIVE_FOLDER_ID` | Target Google Drive folder ID | Add to Replit Secrets |

---

## 1. Install Dependencies

```bash
pnpm --filter @workspace/api-server add googleapis multer
pnpm --filter @workspace/api-server add -D @types/multer
```

---

## 2. Google Drive Service

Create `artifacts/api-server/src/services/googleDrive.ts`:

```typescript
import { google } from 'googleapis';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';

function getAuth() {
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!json) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON not set');
  const credentials = JSON.parse(json);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });
}

export const driveAvailable = !!process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

async function getDrive() {
  const auth = getAuth();
  return google.drive({ version: 'v3', auth });
}

export async function getOrCreateFolder(
  name: string,
  parentId: string,
): Promise<string> {
  const drive = await getDrive();
  const res = await drive.files.list({
    q: `name='${name}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id)',
  });
  if (res.data.files?.length) return res.data.files[0].id!;
  const folder = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    },
    fields: 'id',
  });
  return folder.data.id!;
}

export async function uploadToDrive(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  folder: 'receipts' | 'profiles' | 'exports' | 'documents',
): Promise<{ url: string; fileId: string }> {
  const drive = await getDrive();
  const rootId = process.env.GOOGLE_DRIVE_FOLDER_ID!;
  const folderId = await getOrCreateFolder(folder, rootId);

  const res = await drive.files.create({
    requestBody: { name: filename, parents: [folderId] },
    media: { mimeType, body: Readable.from(buffer) },
    fields: 'id',
  });

  const fileId = res.data.id!;

  await drive.permissions.create({
    fileId,
    requestBody: { role: 'reader', type: 'anyone' },
  });

  return {
    fileId,
    url: `https://drive.google.com/uc?export=download&id=${fileId}`,
  };
}

export async function deleteFromDrive(fileId: string): Promise<void> {
  const drive = await getDrive();
  await drive.files.delete({ fileId });
}

export async function uploadToLocal(
  buffer: Buffer,
  filename: string,
): Promise<{ url: string; fileId: string }> {
  const tmpDir = '/tmp/sahu-csc-uploads';
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  const key = `${Date.now()}-${filename}`;
  fs.writeFileSync(path.join(tmpDir, key), buffer);
  return { fileId: key, url: `/api/files/local/${key}` };
}

export async function uploadFile(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  folder: 'receipts' | 'profiles' | 'exports' | 'documents' = 'receipts',
): Promise<{ url: string; fileId: string; destination: 'drive' | 'local' }> {
  const safeName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  if (driveAvailable) {
    const result = await uploadToDrive(buffer, safeName, mimeType, folder);
    return { ...result, destination: 'drive' };
  }
  console.warn('Google Drive not configured — using local fallback');
  const result = await uploadToLocal(buffer, safeName);
  return { ...result, destination: 'local' };
}

export function cleanupLocalTempFiles(): void {
  const tmpDir = '/tmp/sahu-csc-uploads';
  if (!fs.existsSync(tmpDir)) return;
  const maxAge = 24 * 60 * 60 * 1000;
  fs.readdirSync(tmpDir).forEach((file) => {
    const filePath = path.join(tmpDir, file);
    if (Date.now() - fs.statSync(filePath).mtimeMs > maxAge) {
      fs.unlinkSync(filePath);
    }
  });
}
```

---

## 3. Upload Middleware

Create `artifacts/api-server/src/middleware/upload.ts`:

```typescript
import multer from 'multer';

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error('File type not allowed'));
  },
});
```

---

## 4. File Routes

Create `artifacts/api-server/src/routes/files.ts`:

```
POST /api/files/receipt   → upload receipt PDF to Drive/receipts/
POST /api/files/profile   → upload profile photo to Drive/profiles/
POST /api/files/export    → upload report PDF to Drive/exports/
GET  /api/files/local/:filename → serve local temp files
DELETE /api/files/:fileId → delete from Drive or local
```

---

## 5. Update Existing Features

| Feature | Before | After |
|---|---|---|
| Receipt PDF | Base64 in DB | Upload to Drive → store URL + fileId in DB |
| Profile photo | Not implemented | Upload to Drive → store URL in users table |
| Export report | Lost on restart | Upload to Drive → return download URL |
| Udhari documents | Not implemented | Upload to Drive/documents/ |

---

## 6. Database Schema Updates

Show me before running migration:

```typescript
// receipts table — add:
fileUrl:      text('file_url'),
driveFileId:  text('drive_file_id'),
storageDest:  text('storage_dest').default('local'),

// users table — add:
avatarUrl:    text('avatar_url'),
avatarFileId: text('avatar_file_id'),

// New file_uploads table:
export const fileUploads = pgTable('file_uploads', {
  id:          serial('id').primaryKey(),
  userId:      integer('user_id').references(() => users.id),
  driveFileId: text('drive_file_id').notNull(),
  url:         text('url').notNull(),
  destination: text('destination').notNull(),
  mimeType:    text('mime_type').notNull(),
  sizeBytes:   integer('size_bytes').notNull(),
  folder:      text('folder').notNull(),
  createdAt:   timestamp('created_at').defaultNow(),
});
```

---

## 7. Google Drive Folder Structure

```
SAHU-CSC-Files/ (root — shared with service account)
├── receipts/    ← CSC-2026-NNNN.pdf files
├── profiles/    ← user avatar images
├── exports/     ← monthly report PDFs
└── documents/   ← udhari customer documents
```

---

## 8. Cleanup Job

Add in `artifacts/api-server/src/index.ts`:

```typescript
import { cleanupLocalTempFiles } from './services/googleDrive';
setInterval(cleanupLocalTempFiles, 60 * 60 * 1000);
```

---

## 9. Security — gitignore

Add to `.gitignore`:

```
*service-account*.json
*credentials*.json
sahu-csc-503216-ff711066b67b.json
```

---

## 10. Replit Secrets Setup

| Key | Value |
|---|---|
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Poori JSON file ka content paste karo |
| `GOOGLE_DRIVE_FOLDER_ID` | Drive folder ID (URL ka last part) |

### Drive Folder ID kaise nikalo:

| Step | Kaam |
|---|---|
| 1 | `drive.google.com` kholo |
| 2 | New folder banao: `SAHU-CSC-Files` |
| 3 | Folder pe right click → Share |
| 4 | Service account email add karo (JSON file mein `client_email` field) |
| 5 | Permission: Editor → Share karo |
| 6 | Folder URL se ID copy karo |

```
URL: drive.google.com/drive/folders/1ABCxyz123
ID:                                  1ABCxyz123
```

---

## 11. After Implementation — Test

1. Generate a receipt → confirm PDF in Google Drive receipts/ folder
2. Check drive.google.com → file visible in SAHU-CSC-Files/receipts/
3. Download via URL → file accessible without login
4. Upload profile photo → URL saved in users table
5. Remove GOOGLE_SERVICE_ACCOUNT_JSON → confirm local fallback works
6. Re-add secret → confirm Drive works again

Show me all new and modified files before running any migration.

---

## Do Not Change

- Any existing UI design or branding
- Any existing API contracts
- Any existing authentication flow
- Any existing business logic

---

*SAHU CSC Manager | blasty8084 | July 2026*
