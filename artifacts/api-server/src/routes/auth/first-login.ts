import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, auditLog, getClientIp } from "../../lib/auth";
import { asyncHandler } from "../../lib/async-handler";

const router: IRouter = Router();

// ─── PATCH /users/first-login-completed ───────────────────────────────────────
// Marks the first-time-login permission overlay (notifications + file access)
// as shown so it never appears again for this user.
router.patch("/users/first-login-completed", requireAuth, asyncHandler(async (req, res) => {
  const userId = req.session.userId!;

  await db
    .update(usersTable)
    .set({ firstLoginCompleted: true })
    .where(eq(usersTable.id, userId));

  await auditLog(userId, "first_login.completed", "First-login permission overlay completed", getClientIp(req));
  res.json({ message: "First login flow completed", firstLoginCompleted: true });
}));

export default router;
