---
name: Google Drive Integration
description: How file storage works — Drive when configured, local /tmp fallback when not. Covers service, routes, schema, and avatar flow.
---

## Rule
Drive is used when `GOOGLE_SERVICE_ACCOUNT_JSON` secret is set. Without it, files go to `/tmp/sahu-csc-uploads/` and are served via `/api/files/local/:filename`. The switch is automatic — no code change needed.

**Why:** Prompt spec required graceful fallback so the app works without credentials during development.

**How to apply:** Any new feature that stores files should call `uploadFile()` from `services/googleDrive.ts` — never write directly to disk or Drive.

## New files
- `artifacts/api-server/src/services/googleDrive.ts` — core Drive service + local fallback
- `artifacts/api-server/src/middleware/upload.ts` — multer memory-storage, 10 MB limit, jpeg/png/webp/pdf only
- `artifacts/api-server/src/routes/files.ts` — POST /files/receipt|profile|export|document, GET /files/local/:filename, DELETE /files/:fileId

## New DB columns (all nullable, no data loss)
- `ledger`: file_url, drive_file_id, storage_dest (default 'local')
- `users`: avatar_url, avatar_file_id
- New table: `file_uploads` (id, user_id, drive_file_id, url, destination, mime_type, size_bytes, folder, created_at)

## Avatar flow change
`POST /profile/avatar` still accepts base64 data URL. When Drive is configured, it uploads WebP to Drive/profiles/, stores URL in `avatar_url` + `avatar_file_id`, and clears `profile_picture`. Without Drive, stores base64 in `profile_picture` as before. `fmtProfile` returns both fields for backward compat.

## Secrets needed to enable Drive
- `GOOGLE_SERVICE_ACCOUNT_JSON` — full JSON content of service account key
- `GOOGLE_DRIVE_FOLDER_ID` — ID of the root shared folder

## Cleanup
`cleanupLocalTempFiles()` runs every hour via `setInterval` in `index.ts`. Deletes local files older than 24 h.
