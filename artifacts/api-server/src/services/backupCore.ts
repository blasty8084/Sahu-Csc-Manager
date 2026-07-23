import { execSync } from "child_process";
import { createReadStream, createWriteStream, statSync, mkdirSync, existsSync, unlinkSync, readdirSync } from "fs";
import { pipeline } from "stream/promises";
import path from "path";
import multer from "multer";
import { db, backupsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";
import { uploadToB2, downloadFromB2, deleteFromB2, isB2Configured } from "../lib/b2";

export const BACKUP_DIR = path.resolve(process.cwd(), "backups");
mkdirSync(BACKUP_DIR, { recursive: true });

export const upload = multer({
  dest: BACKUP_DIR,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.originalname.endsWith(".sql")) cb(null, true);
    else cb(new Error("Only .sql files are allowed"));
  },
});

// ── SQL block parser — shared by analyze and selective-import ─────────────────
export interface TableBlock { table: string; header: string; rows: string[]; }

export function parseSqlBlocks(sqlText: string): TableBlock[] {
  const blocks: TableBlock[] = [];
  const lines = sqlText.split("\n");
  let current: TableBlock | null = null;
  for (const line of lines) {
    const m = line.match(/^COPY (?:public\.)?(\w+)\s*\(/i);
    if (m) { current = { table: m[1], header: line, rows: [] }; continue; }
    if (current) {
      if (line.trimEnd() === "\\.") { blocks.push(current); current = null; }
      else current.rows.push(line);
    }
  }
  return blocks;
}

// ── Shared response shape ─────────────────────────────────────────────────────
export interface BackupRecord { id: number; filename: string; size: number; createdAt: string; }

function fmt(b: { id: number; filename: string; size: number; createdAt: Date | string | null }): BackupRecord {
  return { id: b.id, filename: b.filename, size: b.size,
    createdAt: b.createdAt instanceof Date ? b.createdAt.toISOString() : (b.createdAt ?? "") };
}

// ── list ──────────────────────────────────────────────────────────────────────
export async function listBackups(): Promise<BackupRecord[]> {
  // Auto-sync: register any .sql files on disk that aren't in the DB yet
  try {
    mkdirSync(BACKUP_DIR, { recursive: true });
    const diskFiles = readdirSync(BACKUP_DIR).filter((f) => f.endsWith(".sql"));
    const existing = await db.select().from(backupsTable);
    const existingNames = new Set(existing.map((b) => b.filename));
    for (const filename of diskFiles) {
      if (!existingNames.has(filename)) {
        try {
          await db.insert(backupsTable).values({ filename, size: statSync(path.join(BACKUP_DIR, filename)).size });
          logger.info({ filename }, "Auto-registered orphan backup file");
        } catch {}
      }
    }
  } catch {}
  const backups = await db.select().from(backupsTable).orderBy(backupsTable.createdAt);
  return backups.map(fmt);
}

// ── create (pg_dump) ──────────────────────────────────────────────────────────
export async function createBackup(): Promise<BackupRecord> {
  const dbUrl = process.env["DATABASE_URL"] ?? process.env["NEON_DATABASE_URL"];
  if (!dbUrl) throw new Error("DATABASE_URL not configured");
  mkdirSync(BACKUP_DIR, { recursive: true });
  const filename = `backup_${new Date().toISOString().replace(/[:.]/g, "-")}.sql`;
  const filepath = path.join(BACKUP_DIR, filename);
  execSync(`pg_dump "${dbUrl}" -f "${filepath}"`);
  const size = statSync(filepath).size;

  // B2 is a redundant copy. A storage outage must not make the local backup fail.
  if (isB2Configured()) {
    try {
      await uploadToB2(`backups/${filename}`, createReadStream(filepath), "application/octet-stream");
      logger.info({ filename }, "Backup uploaded to B2");
    } catch (err) {
      logger.warn({ err, filename }, "B2 upload failed — backup saved locally only");
    }
  }

  const [backup] = await db.insert(backupsTable).values({ filename, size }).returning();
  return fmt(backup);
}

// ── download (path lookup) ────────────────────────────────────────────────────
export async function getBackupForDownload(id: number) {
  const [backup] = await db.select().from(backupsTable).where(eq(backupsTable.id, id));
  if (!backup) throw Object.assign(new Error("Backup not found"), { status: 404 });
  const filepath = path.join(BACKUP_DIR, backup.filename);
  if (!existsSync(filepath) && isB2Configured()) {
    mkdirSync(BACKUP_DIR, { recursive: true });
    const stream = await downloadFromB2(`backups/${backup.filename}`);
    await pipeline(stream, createWriteStream(filepath));
  }
  if (!existsSync(filepath)) {
    throw Object.assign(new Error("Backup file not found on disk or B2"), { status: 404 });
  }
  return { filepath, filename: backup.filename, size: statSync(filepath).size };
}

// ── delete ────────────────────────────────────────────────────────────────────
export async function deleteBackup(id: number): Promise<{ filename: string }> {
  const [backup] = await db.select().from(backupsTable).where(eq(backupsTable.id, id));
  if (!backup) throw Object.assign(new Error("Backup not found"), { status: 404 });
  try { unlinkSync(path.join(BACKUP_DIR, backup.filename)); } catch {}
  if (isB2Configured()) {
    try { await deleteFromB2(`backups/${backup.filename}`); } catch {}
  }
  await db.delete(backupsTable).where(eq(backupsTable.id, id));
  return { filename: backup.filename };
}

// ── restore (psql) ────────────────────────────────────────────────────────────
export async function restoreBackup(id: number): Promise<{ filename: string }> {
  const dbUrl = process.env["DATABASE_URL"] ?? process.env["NEON_DATABASE_URL"];
  if (!dbUrl) throw new Error("DATABASE_URL not configured");
  const [backup] = await db.select().from(backupsTable).where(eq(backupsTable.id, id));
  if (!backup) throw Object.assign(new Error("Backup not found"), { status: 404 });
  const filepath = path.join(BACKUP_DIR, backup.filename);
  if (!existsSync(filepath) && isB2Configured()) {
    mkdirSync(BACKUP_DIR, { recursive: true });
    const stream = await downloadFromB2(`backups/${backup.filename}`);
    await pipeline(stream, createWriteStream(filepath));
  }
  if (!existsSync(filepath)) {
    throw Object.assign(new Error(`Backup file not found on disk or B2: ${backup.filename}`), { status: 404 });
  }
  execSync(`psql "${dbUrl}" -f "${filepath}"`);
  return { filename: backup.filename };
}
