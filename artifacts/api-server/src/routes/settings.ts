import { Router, type IRouter } from "express";
import { execSync } from "child_process";
import { statSync, mkdirSync, existsSync, unlinkSync } from "fs";
import path from "path";
import multer from "multer";
import { db, settingsTable, backupsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateSettingsBody } from "@workspace/api-zod";
import { requireAuth, requireRole, auditLog, getClientIp } from "../lib/auth";
import { createNotification } from "../lib/notify";

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
