import { Router, type IRouter } from "express";
import { createReadStream } from "fs";
import { requireRole, auditLog, getClientIp } from "../../lib/auth";
import { createNotification } from "../../lib/notify";
import { asyncHandler } from "../../lib/async-handler";
import { listBackups, createBackup, getBackupForDownload, deleteBackup, restoreBackup, upload } from "../../services/backupCore";
import { getSchedule, saveSchedule, type BackupScheduleInput } from "../../services/backupSchedule";
import { analyzeUpload, doSelectiveImport, doFullImport } from "../../services/backupImport";

const router: IRouter = Router();

router.get("/backups", requireRole("admin"), asyncHandler(async (_req, res) => {
  res.json(await listBackups());
}));

// ── POST /backups — create pg_dump backup ────────────────────────────────────
router.post("/backups", requireRole("admin"), asyncHandler(async (req, res) => {
  try {
    const backup = await createBackup();
    await auditLog(req.session.userId!, "backup.create", `Created backup: ${backup.filename}`, getClientIp(req));
    await createNotification("Backup Created", `Database backup ${backup.filename} created successfully`, "success", req.session.userId!);
    res.status(201).json(backup);
  } catch (err: any) {
    res.status(500).json({ error: `Backup failed: ${err.message}` });
  }
}));

router.get("/backups/schedule", requireRole("admin"), asyncHandler(async (_req, res) => {
  res.json(await getSchedule());
}));

// ── POST /backups/schedule — save + apply schedule ────────────────────────────
router.post("/backups/schedule", requireRole("admin"), asyncHandler(async (req, res) => {
  const { enabled, frequency, time, days, retention } = req.body as BackupScheduleInput;
  if (!["daily", "weekly", "custom"].includes(frequency)) {
    res.status(400).json({ error: "Invalid frequency. Use: daily, weekly, custom" }); return;
  }
  if (!/^\d{2}:\d{2}$/.test(time)) {
    res.status(400).json({ error: "Invalid time format. Use HH:MM (24-hour)" }); return;
  }
  if (!Array.isArray(days) || days.some((d) => d < 0 || d > 6)) {
    res.status(400).json({ error: "Invalid days. Use 0-6 (0=Sun, 6=Sat)" }); return;
  }
  const cfg = await saveSchedule({ enabled, frequency, time, days, retention });
  await auditLog(req.session.userId!, "backup.schedule_update",
    `Auto-backup schedule updated: enabled=${enabled}, freq=${frequency}, time=${time}, days=${days.join(",")}`,
    getClientIp(req));
  res.json({ message: "Schedule saved and applied.", ...cfg });
}));

// ── POST /backups/analyze — upload .sql, return table list + row counts ───────
router.post("/backups/analyze", requireRole("admin"), upload.single("file"), asyncHandler(async (req, res) => {
  if (!req.file) { res.status(400).json({ error: "No .sql file uploaded" }); return; }
  try {
    res.json(analyzeUpload(req.file.path, req.file.originalname));
  } catch (err: any) {
    res.status(500).json({ error: `Analysis failed: ${err.message}` });
  }
}));

// ── POST /backups/selective-import — import only selected tables ──────────────
router.post("/backups/selective-import", requireRole("admin"), asyncHandler(async (req, res) => {
  const { tmpPath, selectedTables, originalName } = req.body as {
    tmpPath: string; selectedTables: string[]; originalName: string;
  };
  if (!tmpPath || !selectedTables?.length || !originalName) {
    res.status(400).json({ error: "Missing tmpPath, selectedTables, or originalName" }); return;
  }
  try {
    const result = await doSelectiveImport(tmpPath, selectedTables, originalName);
    await auditLog(req.session.userId!, "backup.selective_import",
      `Selective import from "${originalName}" — tables: ${selectedTables.join(", ")}`, getClientIp(req));
    await createNotification("Selective Import Complete",
      `Imported ${selectedTables.length} table(s) from "${originalName}"`, "success", req.session.userId!);
    res.status(201).json({ ...result, message: `Successfully imported ${selectedTables.length} table(s).` });
  } catch (err: any) {
    const status = (err as any).status ?? 500;
    res.status(status).json({ error: status === 500 ? `Selective import failed: ${err.message}` : err.message });
  }
}));

// ── POST /backups/import — full SQL import ────────────────────────────────────
router.post("/backups/import", requireRole("admin"), upload.single("file"), asyncHandler(async (req, res) => {
  if (!req.file) { res.status(400).json({ error: "No .sql file uploaded" }); return; }
  try {
    const backup = await doFullImport(req.file);
    await auditLog(req.session.userId!, "backup.import", `Imported SQL backup: ${req.file.originalname}`, getClientIp(req));
    await createNotification("Backup Imported", `SQL backup "${req.file.originalname}" imported successfully`, "success", req.session.userId!);
    res.status(201).json(backup);
  } catch (err: any) {
    res.status(500).json({ error: `Import failed: ${err.message}` });
  }
}));

// ── GET /backups/:id/download — stream .sql file ──────────────────────────────
router.get("/backups/:id/download", requireRole("admin"), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  try {
    const { filepath, filename, size } = await getBackupForDownload(id);
    await auditLog(req.session.userId!, "backup.download", `Downloaded backup: ${filename}`, getClientIp(req));
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Length", String(size));
    createReadStream(filepath).pipe(res);
  } catch (err: any) {
    res.status((err as any).status ?? 500).json({ error: err.message });
  }
}));

// ── DELETE /backups/:id — remove from DB + disk ───────────────────────────────
router.delete("/backups/:id", requireRole("admin"), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  try {
    const { filename } = await deleteBackup(id);
    await auditLog(req.session.userId!, "backup.delete", `Deleted backup: ${filename}`, getClientIp(req));
    res.json({ message: "Backup deleted." });
  } catch (err: any) {
    res.status((err as any).status ?? 500).json({ error: err.message });
  }
}));

// ── POST /backups/:id/restore — restore from a saved backup ──────────────────
router.post("/backups/:id/restore", requireRole("admin"), asyncHandler(async (req, res) => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  try {
    const { filename } = await restoreBackup(id);
    await auditLog(req.session.userId!, "backup.restore", `Restored backup: ${filename}`, getClientIp(req));
    await createNotification("Backup Restored", `Database restored from ${filename}`, "success", req.session.userId!);
    res.json({ message: `Backup ${filename} restored successfully` });
  } catch (err: any) {
    res.status((err as any).status ?? 500).json({ error: `Restore failed: ${err.message}` });
  }
}));

export default router;
