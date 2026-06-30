import { Router, type IRouter } from "express";
import { execSync } from "child_process";
import { statSync, mkdirSync, existsSync, unlinkSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import multer from "multer";
import { db, settingsTable, backupsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateSettingsBody } from "@workspace/api-zod";
import { requireAuth, requireRole, auditLog, getClientIp } from "../lib/auth";
import { createNotification } from "../lib/notify";
import { applySchedule, type BackupScheduleConfig } from "../lib/backup-scheduler";

const BACKUP_DIR = path.resolve(process.cwd(), "../../backups");

const upload = multer({
  dest: BACKUP_DIR,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.originalname.endsWith(".sql")) {
      cb(null, true);
    } else {
      cb(new Error("Only .sql files are allowed"));
    }
  },
});

const router: IRouter = Router();

const DEFAULT_SETTINGS: Record<string, string> = {
  businessName: "SAHU CSC Center",
  businessAddress: "Village Road, District",
  businessMobile: "9999999999",
  businessEmail: "",
  businessWebsite: "",
  language: "en",
  theme: "light",
  currency: "INR",
  autoBackup: "false",
  backupFrequencyDays: "7",
};

async function getAllSettings(): Promise<Record<string, string>> {
  const rows = await db.select().from(settingsTable);
  const result: Record<string, string> = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    result[row.key] = row.value;
  }
  return result;
}

function formatSettings(s: Record<string, string>) {
  return {
    businessName: s.businessName ?? DEFAULT_SETTINGS.businessName,
    businessAddress: s.businessAddress ?? DEFAULT_SETTINGS.businessAddress,
    businessMobile: s.businessMobile ?? DEFAULT_SETTINGS.businessMobile,
    businessEmail: s.businessEmail || null,
    businessWebsite: s.businessWebsite || null,
    language: (s.language ?? "en") as "en" | "hi" | "or",
    theme: (s.theme ?? "light") as "light" | "dark",
    currency: s.currency ?? "INR",
    autoBackup: s.autoBackup === "true",
    backupFrequencyDays: parseInt(s.backupFrequencyDays ?? "7", 10),
  };
}

// Public — no auth required — returns only the contact fields safe to expose pre-login
router.get("/settings/contact", async (_req, res): Promise<void> => {
  const settings = await getAllSettings();
  res.json({
    name: settings.businessName ?? DEFAULT_SETTINGS.businessName,
    phone: settings.businessMobile || null,
    email: settings.businessEmail || null,
  });
});

router.get("/settings", requireAuth, async (_req, res): Promise<void> => {
  const settings = await getAllSettings();
  res.json(formatSettings(settings));
});

router.patch("/settings", requireRole("admin"), async (req, res): Promise<void> => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const data = parsed.data as Record<string, any>;
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;
    const strVal = String(value);
    const existing = await db.select().from(settingsTable).where(eq(settingsTable.key, key));
    if (existing.length > 0) {
      await db.update(settingsTable).set({ value: strVal }).where(eq(settingsTable.key, key));
    } else {
      await db.insert(settingsTable).values({ key, value: strVal });
    }
  }

  await auditLog(req.session.userId!, "settings.update", "Updated system settings", getClientIp(req));
  const updated = await getAllSettings();
  res.json(formatSettings(updated));
});

// Backups
router.get("/backups", requireRole("admin"), async (_req, res): Promise<void> => {
  const backups = await db.select().from(backupsTable).orderBy(backupsTable.createdAt);
  res.json(backups.map((b) => ({
    id: b.id,
    filename: b.filename,
    size: b.size,
    createdAt: b.createdAt instanceof Date ? b.createdAt.toISOString() : b.createdAt,
  })));
});

router.post("/backups", requireRole("admin"), async (req, res): Promise<void> => {
  const dbUrl = process.env["DATABASE_URL"];
  if (!dbUrl) { res.status(500).json({ error: "DATABASE_URL not configured" }); return; }

  try {
    mkdirSync(BACKUP_DIR, { recursive: true });
    const filename = `backup_${new Date().toISOString().replace(/[:.]/g, "-")}.sql`;
    const filepath = path.join(BACKUP_DIR, filename);

    execSync(`pg_dump "${dbUrl}" -f "${filepath}"`);
    const size = statSync(filepath).size;

    const [backup] = await db.insert(backupsTable).values({ filename, size }).returning();
    await auditLog(req.session.userId!, "backup.create", `Created backup: ${filename}`, getClientIp(req));
    await createNotification("Backup Created", `Database backup ${filename} created successfully`, "success", req.session.userId!);

    res.status(201).json({
      id: backup.id,
      filename: backup.filename,
      size: backup.size,
      createdAt: backup.createdAt instanceof Date ? backup.createdAt.toISOString() : backup.createdAt,
    });
  } catch (err: any) {
    res.status(500).json({ error: `Backup failed: ${err.message}` });
  }
});

// GET /backups/:id/download — stream the .sql file to the browser
router.get("/backups/:id/download", requireRole("admin"), async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [backup] = await db.select().from(backupsTable).where(eq(backupsTable.id, id));
  if (!backup) { res.status(404).json({ error: "Backup not found" }); return; }

  const filepath = path.join(BACKUP_DIR, backup.filename);
  if (!existsSync(filepath)) {
    res.status(404).json({ error: "Backup file not found on disk" });
    return;
  }

  await auditLog(req.session.userId!, "backup.download", `Downloaded backup: ${backup.filename}`, getClientIp(req));

  res.setHeader("Content-Disposition", `attachment; filename="${backup.filename}"`);
  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader("Content-Length", String(statSync(filepath).size));

  const { createReadStream } = await import("fs");
  createReadStream(filepath).pipe(res);
});

// ── Backup Schedule endpoints ─────────────────────────────────────────────

const SCHEDULE_KEYS = ["backupEnabled", "backupFrequency", "backupTime", "backupDays", "backupRetention"];

router.get("/backups/schedule", requireRole("admin"), async (_req, res): Promise<void> => {
  const rows = await db.select().from(settingsTable);
  const s: Record<string, string> = {};
  for (const r of rows) s[r.key] = r.value;
  res.json({
    enabled: s["backupEnabled"] === "true",
    frequency: s["backupFrequency"] ?? "daily",
    time: s["backupTime"] ?? "02:00",
    days: s["backupDays"] ? s["backupDays"].split(",").map(Number) : [1],
    retention: parseInt(s["backupRetention"] ?? "7", 10),
  });
});

router.post("/backups/schedule", requireRole("admin"), async (req, res): Promise<void> => {
  const { enabled, frequency, time, days, retention } = req.body as {
    enabled: boolean; frequency: string; time: string; days: number[]; retention: number;
  };

  if (!["daily", "weekly", "custom"].includes(frequency)) {
    res.status(400).json({ error: "Invalid frequency. Use: daily, weekly, custom" }); return;
  }
  if (!/^\d{2}:\d{2}$/.test(time)) {
    res.status(400).json({ error: "Invalid time format. Use HH:MM (24-hour)" }); return;
  }
  if (!Array.isArray(days) || days.some((d) => d < 0 || d > 6)) {
    res.status(400).json({ error: "Invalid days. Use 0-6 (0=Sun, 6=Sat)" }); return;
  }

  const toSave: Record<string, string> = {
    backupEnabled: String(enabled),
    backupFrequency: frequency,
    backupTime: time,
    backupDays: days.join(","),
    backupRetention: String(Math.max(1, Math.min(90, retention))),
  };

  for (const [key, value] of Object.entries(toSave)) {
    const existing = await db.select().from(settingsTable).where(eq(settingsTable.key, key));
    if (existing.length > 0) {
      await db.update(settingsTable).set({ value }).where(eq(settingsTable.key, key));
    } else {
      await db.insert(settingsTable).values({ key, value });
    }
  }

  const cfg: BackupScheduleConfig = {
    enabled: Boolean(enabled),
    frequency: frequency as BackupScheduleConfig["frequency"],
    time,
    days,
    retention: Math.max(1, Math.min(90, retention)),
  };
  applySchedule(cfg);

  await auditLog(req.session.userId!, "backup.schedule_update",
    `Auto-backup schedule updated: enabled=${enabled}, freq=${frequency}, time=${time}, days=${days.join(",")}`,
    getClientIp(req));

  res.json({ message: "Schedule saved and applied.", ...cfg });
});

// ── Helper: parse pg_dump SQL into per-table COPY blocks ──────────────────
interface TableBlock {
  table: string;
  header: string;
  rows: string[];
}

function parseSqlBlocks(sql: string): TableBlock[] {
  const blocks: TableBlock[] = [];
  const lines = sql.split("\n");
  let current: TableBlock | null = null;

  for (const line of lines) {
    const copyMatch = line.match(/^COPY (?:public\.)?(\w+)\s*\(/i);
    if (copyMatch) {
      current = { table: copyMatch[1], header: line, rows: [] };
      continue;
    }
    if (current) {
      if (line.trimEnd() === "\\.") {
        blocks.push(current);
        current = null;
      } else {
        current.rows.push(line);
      }
    }
  }
  return blocks;
}

// POST /backups/analyze — upload .sql, return table list + row counts (no DB write)
router.post("/backups/analyze", requireRole("admin"), upload.single("file"), async (req, res): Promise<void> => {
  if (!req.file) { res.status(400).json({ error: "No .sql file uploaded" }); return; }
  const tmpPath = req.file.path;

  try {
    const sql = readFileSync(tmpPath, "utf8");
    const blocks = parseSqlBlocks(sql);

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

    const tables = blocks
      .filter((b) => b.rows.filter((r) => r.trim()).length > 0)
      .map((b) => ({
        name: b.table,
        label: FRIENDLY[b.table] ?? b.table,
        rowCount: b.rows.filter((r) => r.trim()).length,
      }));

    res.json({ tables, originalName: req.file.originalname, tmpPath });
  } catch (err: any) {
    try { unlinkSync(tmpPath); } catch {}
    res.status(500).json({ error: `Analysis failed: ${err.message}` });
  }
});

// POST /backups/selective-import — import only selected tables from a previously analyzed file
router.post("/backups/selective-import", requireRole("admin"), async (req, res): Promise<void> => {
  const { tmpPath, selectedTables, originalName } = req.body as {
    tmpPath: string;
    selectedTables: string[];
    originalName: string;
  };

  if (!tmpPath || !selectedTables?.length || !originalName) {
    res.status(400).json({ error: "Missing tmpPath, selectedTables, or originalName" });
    return;
  }

  if (!existsSync(tmpPath)) {
    res.status(400).json({ error: "Upload session expired. Please re-upload the file." });
    return;
  }

  const dbUrl = process.env["DATABASE_URL"];
  if (!dbUrl) { res.status(500).json({ error: "DATABASE_URL not configured" }); return; }

  const selectiveFile = path.join(BACKUP_DIR, `selective_${Date.now()}.sql`);

  try {
    mkdirSync(BACKUP_DIR, { recursive: true });
    const sql = readFileSync(tmpPath, "utf8");
    const blocks = parseSqlBlocks(sql);
    const chosen = blocks.filter((b) => selectedTables.includes(b.table));

    if (chosen.length === 0) {
      res.status(400).json({ error: "None of the selected tables were found in the backup." });
      return;
    }

    // Build a minimal SQL that only replays the chosen COPY blocks
    const lines: string[] = [
      "SET session_replication_role = replica;", // skip FK checks during restore
    ];
    for (const block of chosen) {
      lines.push(`-- Importing table: ${block.table}`);
      lines.push(`DELETE FROM "${block.table}";`);
      lines.push(block.header);
      lines.push(...block.rows);
      lines.push("\\.");
      lines.push("");
    }
    lines.push("SET session_replication_role = DEFAULT;");

    writeFileSync(selectiveFile, lines.join("\n"), "utf8");
    const size = statSync(selectiveFile).size;

    execSync(`psql "${dbUrl}" -f "${selectiveFile}"`, { stdio: "pipe" });

    const filename = `selective_import_${Date.now()}_${originalName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const [backup] = await db.insert(backupsTable).values({ filename, size }).returning();

    await auditLog(
      req.session.userId!,
      "backup.selective_import",
      `Selective import from "${originalName}" — tables: ${selectedTables.join(", ")}`,
      getClientIp(req)
    );
    await createNotification(
      "Selective Import Complete",
      `Imported ${selectedTables.length} table(s) from "${originalName}"`,
      "success",
      req.session.userId!
    );

    try { unlinkSync(tmpPath); } catch {}
    try { unlinkSync(selectiveFile); } catch {}

    res.status(201).json({
      id: backup.id,
      tablesImported: selectedTables,
      message: `Successfully imported ${selectedTables.length} table(s).`,
    });
  } catch (err: any) {
    try { unlinkSync(selectiveFile); } catch {}
    res.status(500).json({ error: `Selective import failed: ${err.message}` });
  }
});

router.post("/backups/import", requireRole("admin"), upload.single("file"), async (req, res): Promise<void> => {
  const dbUrl = process.env["DATABASE_URL"];
  if (!dbUrl) { res.status(500).json({ error: "DATABASE_URL not configured" }); return; }
  if (!req.file) { res.status(400).json({ error: "No .sql file uploaded" }); return; }

  const originalName = req.file.originalname;
  const tmpPath = req.file.path;
  const filename = `imported_${Date.now()}_${originalName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const finalPath = path.join(BACKUP_DIR, filename);

  try {
    mkdirSync(BACKUP_DIR, { recursive: true });
    const { renameSync } = await import("fs");
    renameSync(tmpPath, finalPath);
    const size = statSync(finalPath).size;

    execSync(`psql "${dbUrl}" -f "${finalPath}"`, { stdio: "pipe" });

    const [backup] = await db.insert(backupsTable).values({ filename, size }).returning();
    await auditLog(req.session.userId!, "backup.import", `Imported SQL backup: ${originalName}`, getClientIp(req));
    await createNotification("Backup Imported", `SQL backup "${originalName}" imported successfully`, "success", req.session.userId!);

    res.status(201).json({
      id: backup.id,
      filename: backup.filename,
      size: backup.size,
      createdAt: backup.createdAt instanceof Date ? backup.createdAt.toISOString() : backup.createdAt,
    });
  } catch (err: any) {
    try { unlinkSync(finalPath); } catch {}
    try { unlinkSync(tmpPath); } catch {}
    res.status(500).json({ error: `Import failed: ${err.message}` });
  }
});

router.post("/backups/:id/restore", requireRole("admin"), async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [backup] = await db.select().from(backupsTable).where(eq(backupsTable.id, id));
  if (!backup) { res.status(404).json({ error: "Backup not found" }); return; }

  const dbUrl = process.env["DATABASE_URL"];
  if (!dbUrl) { res.status(500).json({ error: "DATABASE_URL not configured" }); return; }

  const filepath = path.join(BACKUP_DIR, backup.filename);
  if (!existsSync(filepath)) {
    res.status(404).json({ error: `Backup file not found on disk: ${backup.filename}` });
    return;
  }

  try {
    execSync(`psql "${dbUrl}" -f "${filepath}"`);
    await auditLog(req.session.userId!, "backup.restore", `Restored backup: ${backup.filename}`, getClientIp(req));
    await createNotification("Backup Restored", `Database restored from ${backup.filename}`, "success", req.session.userId!);
    res.json({ message: `Backup ${backup.filename} restored successfully` });
  } catch (err: any) {
    res.status(500).json({ error: `Restore failed: ${err.message}` });
  }
});

export default router;
