import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, comparePassword, auditLog, securityLog, getClientIp } from "../../lib/auth";
import { notify2faDisabled } from "../../services/notificationTemplates";
import { asyncHandler } from "../../lib/async-handler";
import totpRouter, { clearTotpReplay } from "./2fa-totp";
import backupRouter from "./2fa-backup";
import otpRouter from "./2fa-otp";

const router: IRouter = Router();

// Mount sub-routers — all routes share the same URL prefix set by the parent.
router.use(totpRouter);
router.use(backupRouter);
router.use(otpRouter);

// ─── POST /auth/2fa/disable ──────────────────────────────────────────────────
router.post("/auth/2fa/disable", requireAuth, asyncHandler(async (req, res) => {
  const { currentPassword } = req.body as { currentPassword?: string };
  const userId = req.session.userId!;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  if (!currentPassword || !(await comparePassword(currentPassword, user.passwordHash))) {
    res.status(400).json({ error: "Current password is incorrect" });
    return;
  }

  await db.update(usersTable).set({
    twoFaEnabled: false,
    twoFaMethod: "otp",
    totpSecret: null,
    twoFaVerifiedAt: null,
    backupCodes: null,
  }).where(eq(usersTable.id, userId));

  clearTotpReplay(userId);
  // Clear any in-progress setup secret from session
  delete (req.session as any).setupTotpSecret;

  const ip     = getClientIp(req);
  const device = req.headers["user-agent"] ?? "Unknown";

  await auditLog(userId, "2fa.disabled", "2FA disabled", ip);
  await securityLog(userId, "2fa.disabled", true, ip, null, null);
  await notify2faDisabled(userId, { ip, device: String(device), timestamp: new Date() });
  res.json({ message: "2FA disabled" });
}));

// ─── GET /auth/2fa/status ────────────────────────────────────────────────────
router.get("/auth/2fa/status", requireAuth, asyncHandler(async (req, res) => {
  const userId = req.session.userId!;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  let backupCodesRemaining = 0;
  if (user.backupCodes) {
    try { backupCodesRemaining = JSON.parse(user.backupCodes).length; } catch { /* ignore */ }
  }

  const backupCodesLow = user.twoFaEnabled && backupCodesRemaining <= 3;

  res.json({
    enabled: user.twoFaEnabled,
    method: user.twoFaMethod,
    verifiedAt: user.twoFaVerifiedAt ? user.twoFaVerifiedAt.toISOString() : null,
    backupCodesRemaining,
    totpConfigured: !!user.totpSecret,
    backupCodesLow,
    backupCodesWarning: backupCodesLow
      ? `Only ${backupCodesRemaining} backup code${backupCodesRemaining === 1 ? "" : "s"} left. Regenerate now.`
      : null,
  });
}));

export default router;
