import { Router, type IRouter } from "express";
import { db, userSessionsTable } from "@workspace/db";
import { eq, and, gt, not, desc } from "drizzle-orm";
import { requireAuth, auditLog, getClientIp } from "../lib/auth";

const router: IRouter = Router();

function fmtSession(s: any, currentSessionId?: string) {
  return {
    id: s.id,
    sessionId: s.sessionId,
    deviceInfo: s.deviceInfo ?? "Unknown Device",
    browser: s.browser ?? "Unknown",
    os: s.os ?? "Unknown",
    ipAddress: s.ipAddress ?? "Unknown",
    rememberMe: s.rememberMe,
    isCurrent: s.sessionId === currentSessionId,
    lastActivity: s.lastActivity instanceof Date ? s.lastActivity.toISOString() : s.lastActivity,
    expiresAt: s.expiresAt instanceof Date ? s.expiresAt.toISOString() : s.expiresAt,
    createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : s.createdAt,
  };
}

// GET /api/sessions — list this user's active sessions
router.get("/sessions", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const currentSessionId = req.session.sessionId;

  const sessions = await db
    .select()
    .from(userSessionsTable)
    .where(
      and(
        eq(userSessionsTable.userId, userId),
        eq(userSessionsTable.isActive, true),
        gt(userSessionsTable.expiresAt, new Date())
      )
    )
    .orderBy(desc(userSessionsTable.lastActivity));

  res.json(sessions.map((s) => fmtSession(s, currentSessionId)));
});

// DELETE /api/sessions/others — revoke all sessions except the current one
router.delete("/sessions/others", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const currentSessionId = req.session.sessionId ?? req.session.sessionToken ?? "";

  await db
    .update(userSessionsTable)
    .set({ isActive: false })
    .where(
      and(
        eq(userSessionsTable.userId, userId),
        eq(userSessionsTable.isActive, true),
        not(eq(userSessionsTable.sessionId, currentSessionId))
      )
    );

  await auditLog(userId, "session.revoke_others", "Revoked all other sessions", getClientIp(req));
  res.json({ message: "All other sessions revoked" });
});

// DELETE /api/sessions/:id — revoke a specific session by DB row id
router.delete("/sessions/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid session ID" });
    return;
  }

  const [session] = await db
    .select()
    .from(userSessionsTable)
    .where(and(eq(userSessionsTable.id, id), eq(userSessionsTable.userId, userId)));

  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  await db.update(userSessionsTable).set({ isActive: false }).where(eq(userSessionsTable.id, id));

  // If revoking current session, destroy the express session too
  if (session.sessionId === req.session.sessionId) {
    await auditLog(userId, "session.revoke_self", `Revoked own session ${id}`, getClientIp(req));
    req.session.destroy(() => {});
    res.json({ message: "Session revoked", redirect: true });
    return;
  }

  await auditLog(userId, "session.revoke", `Revoked session ${id}`, getClientIp(req));
  res.json({ message: "Session revoked" });
});

export default router;
