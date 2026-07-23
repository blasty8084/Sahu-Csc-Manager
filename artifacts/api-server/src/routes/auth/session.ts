import { Router, type IRouter } from "express";
import { db, usersTable, userSessionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, auditLog, getClientIp } from "../../lib/auth";
import { fmtUser } from "./helpers";
import { invalidateSessionCache, invalidateUserCache } from "../../lib/auth/sessionCache";
import { asyncHandler } from "../../lib/async-handler";

const router: IRouter = Router();

// ─── POST /auth/logout ────────────────────────────────────────────────────────
router.post("/auth/logout", requireAuth, asyncHandler(async (req, res) => {
  const userId = req.session.userId!;
  const sessionId = req.session.sessionId ?? req.session.sessionToken;

  if (sessionId) {
    await db
      .update(userSessionsTable)
      .set({ isActive: false })
      .where(
        and(
          eq(userSessionsTable.sessionId, sessionId),
          eq(userSessionsTable.userId, userId)
        )
      );
  }

  await db
    .update(usersTable)
    .set({ activeSessionToken: null })
    .where(eq(usersTable.id, userId));

  if (sessionId) await invalidateSessionCache(sessionId);
  await invalidateUserCache(userId);

  await auditLog(userId, "logout", "User logged out", getClientIp(req));
  req.session.destroy(() => {});
  res.json({ message: "Logged out successfully" });
}));

// ─── GET /auth/me ─────────────────────────────────────────────────────────────
router.get("/auth/me", requireAuth, asyncHandler(async (req, res) => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId!));
  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json(await fmtUser(user));
}));

export default router;
