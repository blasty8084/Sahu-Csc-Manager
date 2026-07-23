import { google } from "googleapis";
import { Readable } from "stream";
import fs from "fs";
import path from "path";

export type DriveFolder = "receipts" | "profiles" | "exports" | "documents";

function getAuth() {
  const json = process.env["GOOGLE_SERVICE_ACCOUNT_JSON"];
  if (!json) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON not set");
  const credentials = JSON.parse(json);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  });
}

export const driveAvailable = !!process.env["GOOGLE_SERVICE_ACCOUNT_JSON"];

async function getDrive() {
  const auth = getAuth();
  return google.drive({ version: "v3", auth });
}

export async function getOrCreateFolder(
  name: string,
  parentId: string,
): Promise<string> {
  const drive = await getDrive();
  const res = await drive.files.list({
    q: `name='${name}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id)",
  });
  if (res.data.files?.length) return res.data.files[0].id!;
  const folder = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    },
    fields: "id",
  });
  return folder.data.id!;
}

export async function uploadToDrive(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  folder: DriveFolder,
): Promise<{ url: string; fileId: string }> {
  const drive = await getDrive();
  const rootId = process.env["GOOGLE_DRIVE_FOLDER_ID"]!;
  const folderId = await getOrCreateFolder(folder, rootId);

  const res = await drive.files.create({
    requestBody: { name: filename, parents: [folderId] },
    media: { mimeType, body: Readable.from(buffer) },
    fields: "id",
  });

  const fileId = res.data.id!;

  await drive.permissions.create({
    fileId,
    requestBody: { role: "reader", type: "anyone" },
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

// ── Local fallback ──────────────────────────────────────────────────────────

const LOCAL_TMP_DIR = "/tmp/sahu-csc-uploads";

export async function uploadToLocal(
  buffer: Buffer,
  filename: string,
): Promise<{ url: string; fileId: string }> {
  if (!fs.existsSync(LOCAL_TMP_DIR)) {
    fs.mkdirSync(LOCAL_TMP_DIR, { recursive: true });
  }
  const key = `${Date.now()}-${filename}`;
  fs.writeFileSync(path.join(LOCAL_TMP_DIR, key), buffer);
  return { fileId: key, url: `/api/files/local/${key}` };
}

export function serveLocalFile(
  key: string,
): { buffer: Buffer; filename: string } | null {
  const filePath = path.join(LOCAL_TMP_DIR, key);
  if (!fs.existsSync(filePath)) return null;
  return { buffer: fs.readFileSync(filePath), filename: key };
}

export function deleteLocalFile(key: string): void {
  const filePath = path.join(LOCAL_TMP_DIR, key);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

// ── Unified upload (Drive when configured, local as fallback) ───────────────

export async function uploadFile(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  folder: DriveFolder = "receipts",
): Promise<{ url: string; fileId: string; destination: "drive" | "local" }> {
  const safeName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  if (driveAvailable) {
    const result = await uploadToDrive(buffer, safeName, mimeType, folder);
    return { ...result, destination: "drive" };
  }
  console.warn("Google Drive not configured — using local /tmp fallback");
  const result = await uploadToLocal(buffer, safeName);
  return { ...result, destination: "local" };
}

// ── Cleanup job (run hourly) ────────────────────────────────────────────────

export function cleanupLocalTempFiles(): void {
  if (!fs.existsSync(LOCAL_TMP_DIR)) return;
  const maxAge = 24 * 60 * 60 * 1000; // 24 h
  for (const file of fs.readdirSync(LOCAL_TMP_DIR)) {
    const filePath = path.join(LOCAL_TMP_DIR, file);
    try {
      if (Date.now() - fs.statSync(filePath).mtimeMs > maxAge) {
        fs.unlinkSync(filePath);
      }
    } catch {
      // ignore — file may have been removed by a concurrent request
    }
  }
}
