import { Router, type IRouter } from "express";
import { db, userSessionsTable, usersTable } from "@workspace/db";
import { eq, and, gt, inArray } from "drizzle-orm";
import { requireRole, auditLog, getClientIp } from "../lib/auth";
import { invalidateSessionCache } from "../lib/auth/sessionCache";

const router: IRouter = Router();

function fmtAdminSession(s: any) {
  return {
    id: s.id,
    sessionId: s.sessionId,
    userId: s.userId,
    username: s.username,
    fullName: s.fullName ?? null,
    role: s.role,
    deviceInfo: s.deviceInfo ?? "Unknown Device",
    browser: s.browser ?? "Unknown",
    os: s.os ?? "Unknown",
    ipAddress: s.ipAddress ?? "Unknown",
    rememberMe: s.rememberMe,
    lastActivity: s.lastActivity instanceof Date ? s.lastActivity.toISOString() : s.lastActivity,
    expiresAt: s.expiresAt instanceof Date ? s.expiresAt.toISOString() : s.expiresAt,
    createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : s.createdAt,
  };
}

// GET /api/admin/sessions — all active sessions across all users
router.get("/admin/sessions", requireRole("admin"), async (_req, res): Promise<void> => {
  const now = new Date();

  const rows = await db
    .select({
      id: userSessionsTable.id,
      sessionId: userSessionsTable.sessionId,
      userId: userSessionsTable.userId,
      username: usersTable.username,
      fullName: usersTable.fullName,
      role: usersTable.role,
      deviceInfo: userSessionsTable.deviceInfo,
      browser: userSessionsTable.browser,
      os: userSessionsTable.os,
      ipAddress: userSessionsTable.ipAddress,
      rememberMe: userSessionsTable.rememberMe,
      lastActivity: userSessionsTable.lastActivity,
      expiresAt: userSessionsTable.expiresAt,
      createdAt: userSessionsTable.createdAt,
    })
    .from(userSessionsTable)
    .innerJoin(usersTable, eq(userSessionsTable.userId, usersTable.id))
    .where(
      and(
        eq(userSessionsTable.isActive, true),
        gt(userSessionsTable.expiresAt, now)
      )
    )
    .orderBy(userSessionsTable.lastActivity);

  res.json(rows.map(fmtAdminSession));
});

// DELETE /api/admin/sessions/:id — revoke a specific session
router.delete("/admin/sessions/:id", requireRole("admin"), async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid session ID" }); return; }

  const [session] = await db
    .select()
    .from(userSessionsTable)
    .where(eq(userSessionsTable.id, id));

  if (!session) { res.status(404).json({ error: "Session not found" }); return; }

  await db.update(userSessionsTable).set({ isActive: false }).where(eq(userSessionsTable.id, id));
  invalidateSessionCache(session.sessionId);

  await auditLog(
    req.session.userId!,
    "admin.session.revoke",
    `Admin revoked session ${id} for userId ${session.userId} (${session.deviceInfo ?? "unknown device"})`,
    getClientIp(req)
  );

  res.json({ success: true, message: "Session revoked" });
});

// DELETE /api/admin/sessions/user/:userId — revoke all sessions for a specific user
router.delete("/admin/sessions/user/:userId", requireRole("admin"), async (req, res): Promise<void> => {
  const userId = parseInt(req.params.userId as string, 10);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid user ID" }); return; }

  const [user] = await db
    .select({ id: usersTable.id, username: usersTable.username })
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const result = await db
    .update(userSessionsTable)
    .set({ isActive: false })
    .where(
      and(
        eq(userSessionsTable.userId, userId),
        eq(userSessionsTable.isActive, true)
      )
    )
    .returning({ id: userSessionsTable.id, sessionId: userSessionsTable.sessionId });

  for (const r of result) invalidateSessionCache(r.sessionId);

  await auditLog(
    req.session.userId!,
    "admin.session.revoke_all_for_user",
    `Admin revoked all ${result.length} session(s) for user ${user.username} (userId ${userId})`,
    getClientIp(req)
  );

  res.json({ success: true, count: result.length, message: `Revoked ${result.length} session(s)` });
});

export default router;
