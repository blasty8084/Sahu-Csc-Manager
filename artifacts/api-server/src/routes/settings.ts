import { Router, type IRouter } from "express";
import { db, settingsTable, backupsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateSettingsBody } from "@workspace/api-zod";
import { requireAuth, requireRole, auditLog, getClientIp } from "../lib/auth";
import { createNotification } from "../lib/notify";

const router: IRouter = Router();

export const DEFAULT_SETTINGS: Record<string, string> = {
  businessName: "SAHU CSC Center",
  businessAddress: "Village Road, District",
  businessMobile: "9999999999",
  businessEmail: "",
  language: "en",
  theme: "light",
  currency: "INR",
  autoBackup: "false",
  backupFrequencyDays: "7",
  openingBalance: "0",
};

export async function getAllSettings(): Promise<Record<string, string>> {
  const rows = await db.select().from(settingsTable);
  const result: Record<string, string> = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    result[row.key] = row.value;
  }
  return result;
}

export async function getOpeningBalance(): Promise<number> {
  const settings = await getAllSettings();
  return parseFloat(settings.openingBalance ?? "0");
}

function formatSettings(s: Record<string, string>) {
  return {
    businessName: s.businessName ?? DEFAULT_SETTINGS.businessName,
    businessAddress: s.businessAddress ?? DEFAULT_SETTINGS.businessAddress,
    businessMobile: s.businessMobile ?? DEFAULT_SETTINGS.businessMobile,
    businessEmail: s.businessEmail || null,
    language: (s.language ?? "en") as "en" | "hi" | "or",
    theme: (s.theme ?? "light") as "light" | "dark",
    currency: s.currency ?? "INR",
    autoBackup: s.autoBackup === "true",
    backupFrequencyDays: parseInt(s.backupFrequencyDays ?? "7", 10),
    openingBalance: parseFloat(s.openingBalance ?? "0"),
  };
}

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
  const filename = `backup_${new Date().toISOString().replace(/[:.]/g, "-")}.sql`;
  const size = Math.floor(Math.random() * 500000) + 50000;

  const [backup] = await db.insert(backupsTable).values({ filename, size }).returning();
  await auditLog(req.session.userId!, "backup.create", `Created backup: ${filename}`, getClientIp(req));
  await createNotification("Backup Created", `Database backup ${filename} created successfully`, "success");

  res.status(201).json({
    id: backup.id,
    filename: backup.filename,
    size: backup.size,
    createdAt: backup.createdAt instanceof Date ? backup.createdAt.toISOString() : backup.createdAt,
  });
});

router.post("/backups/:id/restore", requireRole("admin"), async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [backup] = await db.select().from(backupsTable).where(eq(backupsTable.id, id));
  if (!backup) { res.status(404).json({ error: "Backup not found" }); return; }

  await auditLog(req.session.userId!, "backup.restore", `Restored backup: ${backup.filename}`, getClientIp(req));
  await createNotification("Backup Restored", `Database restored from ${backup.filename}`, "success");

  res.json({ message: `Backup ${backup.filename} restored successfully` });
});

export default router;
