import { Router, type IRouter } from "express";
import { db, deviceSessionsTable, userSessionsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, auditLog, getClientIp } from "../../lib/auth";
import { invalidateSessionCache } from "../../lib/auth/sessionCache";
import { asyncHandler } from "../../lib/async-handler";

const router: IRouter = Router();

function fmtDevice(d: typeof deviceSessionsTable.$inferSelect, currentFingerprint?: string | null) {
  return {
    id: d.id,
    deviceName: d.deviceName ?? "Unknown Device",
    ipAddress: d.ipAddress ?? "Unknown",
    isTrusted: d.isTrusted,
    trustedUntil: d.trustedUntil ? d.trustedUntil.toISOString() : null,
    lastActive: d.lastActive.toISOString(),
    createdAt: d.createdAt.toISOString(),
    isCurrent: currentFingerprint != null && d.deviceFingerprint === currentFingerprint,
  };
}

// ─── GET /auth/devices — list known/trusted devices for this user ────────────
router.get("/auth/devices", requireAuth, asyncHandler(async (req, res) => {
  const userId = req.session.userId!;
  const devices = await db
    .select()
    .from(deviceSessionsTable)
    .where(eq(deviceSessionsTable.userId, userId))
    .orderBy(desc(deviceSessionsTable.lastActive));

  res.json(devices.map((d) => fmtDevice(d)));
}));

// ─── DELETE /auth/devices/all — forget every known device ─────────────────────
router.delete("/auth/devices/all", requireAuth, asyncHandler(async (req, res) => {
  const userId = req.session.userId!;
  await db.delete(deviceSessionsTable).where(eq(deviceSessionsTable.userId, userId));
  await auditLog(userId, "device.forget_all", "Forgot all known devices", getClientIp(req));
  res.json({ message: "All devices forgotten. Every device will require verification on next login." });
}));

// ─── DELETE /auth/devices/:id — forget a specific device + revoke its session ─
router.delete("/auth/devices/:id", requireAuth, asyncHandler(async (req, res) => {
  const userId = req.session.userId!;
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid device ID" }); return; }

  const [device] = await db
    .select()
    .from(deviceSessionsTable)
    .where(and(eq(deviceSessionsTable.id, id), eq(deviceSessionsTable.userId, userId)));
  if (!device) { res.status(404).json({ error: "Device not found" }); return; }

  if (device.sessionId) {
    await db.update(userSessionsTable).set({ isActive: false }).where(eq(userSessionsTable.sessionId, device.sessionId));
    await invalidateSessionCache(device.sessionId);
  }
  await db.delete(deviceSessionsTable).where(eq(deviceSessionsTable.id, id));

  await auditLog(userId, "device.forget", `Forgot device ${device.deviceName ?? id}`, getClientIp(req));
  res.json({ message: "Device forgotten" });
}));

export default router;
