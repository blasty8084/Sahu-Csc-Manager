import { execSync } from "child_process";
import { statSync, mkdirSync, existsSync, unlinkSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { db, backupsTable } from "@workspace/db";
import { BACKUP_DIR, parseSqlBlocks } from "./backupCore";

const FRIENDLY: Record<string, string> = {
  ledger: "Ledger Transactions",
  aeps_daily: "AePS Daily Sessions",
  aeps_transactions: "AePS Transactions",
  udhari_customers: "Udhari Customers",
  udhari_entries: "Udhari Entries",
  users: "Users & Accounts",
  user_sessions: "Login Sessions",
  settings: "Business Settings",
  notifications: "Notifications",
  audit_logs: "Audit Logs",
  receipt_counters: "Receipt Counters",
  push_subscriptions: "Push Subscriptions",
  password_reset_tokens: "Password Reset Tokens",
  backups: "Backup Records",
};

// ── analyze — parse uploaded .sql, return table list ─────────────────────────
export interface AnalyzeResult {
  tables: Array<{ name: string; label: string; rowCount: number }>;
  originalName: string;
  tmpPath: string;
}

export function analyzeUpload(tmpPath: string, originalName: string): AnalyzeResult {
  const blocks = parseSqlBlocks(readFileSync(tmpPath, "utf8"));
  const tables = blocks
    .filter((b) => b.rows.filter((r) => r.trim()).length > 0)
    .map((b) => ({ name: b.table, label: FRIENDLY[b.table] ?? b.table,
      rowCount: b.rows.filter((r) => r.trim()).length }));
  return { tables, originalName, tmpPath };
}

// ── selective import — restore only chosen tables ─────────────────────────────
export interface SelectiveImportResult { id: number; tablesImported: string[]; }

export async function doSelectiveImport(
  tmpPath: string, selectedTables: string[], originalName: string
): Promise<SelectiveImportResult> {
  const dbUrl = process.env["DATABASE_URL"];
  if (!dbUrl) throw new Error("DATABASE_URL not configured");
  if (!existsSync(tmpPath))
    throw Object.assign(new Error("Upload session expired. Please re-upload the file."), { status: 400 });

  mkdirSync(BACKUP_DIR, { recursive: true });
  const blocks = parseSqlBlocks(readFileSync(tmpPath, "utf8"));
  const chosen = blocks.filter((b) => selectedTables.includes(b.table));
  if (chosen.length === 0)
    throw Object.assign(new Error("None of the selected tables were found in the backup."), { status: 400 });

  const lines: string[] = ["SET session_replication_role = replica;"];
  for (const block of chosen) {
    lines.push(`-- Importing table: ${block.table}`);
    lines.push(`DELETE FROM "${block.table}";`);
    lines.push(block.header, ...block.rows, "\\.", "");
  }
  lines.push("SET session_replication_role = DEFAULT;");

  const selectiveFile = path.join(BACKUP_DIR, `selective_${Date.now()}.sql`);
  writeFileSync(selectiveFile, lines.join("\n"), "utf8");
  const size = statSync(selectiveFile).size;

  try {
    execSync(`psql "${dbUrl}" -f "${selectiveFile}"`, { stdio: "pipe" });
  } catch (err) {
    try { unlinkSync(selectiveFile); } catch {}
    throw err;
  }

  const filename = `selective_import_${Date.now()}_${originalName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const [backup] = await db.insert(backupsTable).values({ filename, size }).returning();
  try { unlinkSync(tmpPath); } catch {}
  try { unlinkSync(selectiveFile); } catch {}
  return { id: backup.id, tablesImported: selectedTables };
}

// ── full import — run entire uploaded .sql ────────────────────────────────────
export interface FullImportResult { id: number; filename: string; size: number; createdAt: string; }

export async function doFullImport(file: Express.Multer.File): Promise<FullImportResult> {
  const dbUrl = process.env["DATABASE_URL"];
  if (!dbUrl) throw new Error("DATABASE_URL not configured");

  const { renameSync } = await import("fs");
  const originalName = file.originalname;
  const tmpPath = file.path;
  const filename = `imported_${Date.now()}_${originalName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const finalPath = path.join(BACKUP_DIR, filename);

  mkdirSync(BACKUP_DIR, { recursive: true });
  renameSync(tmpPath, finalPath);
  const size = statSync(finalPath).size;

  try {
    execSync(`psql "${dbUrl}" -f "${finalPath}"`, { stdio: "pipe" });
  } catch (err) {
    try { unlinkSync(finalPath); } catch {}
    try { unlinkSync(tmpPath); } catch {}
    throw err;
  }

  const [backup] = await db.insert(backupsTable).values({ filename, size }).returning();
  return { id: backup.id, filename: backup.filename, size: backup.size,
    createdAt: backup.createdAt instanceof Date ? backup.createdAt.toISOString() : (backup.createdAt ?? "") };
}
