import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { LoginBody } from "@workspace/api-zod";
import { hashPassword, comparePassword, requireAuth, auditLog, getClientIp } from "../lib/auth";
import { createNotification } from "../lib/notify";

const router: IRouter = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { identifier, password } = parsed.data;
  const [user] = await db
    .select()
    .from(usersTable)
    .where(
      or(
        eq(usersTable.username, identifier),
        eq(usersTable.email, identifier),
        eq(usersTable.mobile, identifier)
      )
    );

  if (!user || !user.isActive) {
    res.status(401).json({ error: "Invalid credentials" });
    await createNotification(
      "Failed Login Attempt",
      `Failed login attempt for identifier: ${identifier}`,
      "warning"
    );
    return;
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    await createNotification(
      "Failed Login Attempt",
      `Failed login for user: ${user.username}`,
      "warning"
    );
    return;
  }

  req.session.userId = user.id;
  req.session.userRole = user.role;

  await auditLog(user.id, "login", `User logged in`, getClientIp(req));
  await createNotification(
    "User Login",
    `${user.username} logged in successfully`,
    "info",
    user.id
  );

  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    mobile: user.mobile ?? null,
    role: user.role,
    fullName: user.fullName ?? null,
  });
});

router.post("/auth/logout", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  await auditLog(userId, "logout", `User logged out`, getClientIp(req));
  req.session.destroy(() => {});
  res.json({ message: "Logged out successfully" });
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId!));
  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    mobile: user.mobile ?? null,
    role: user.role,
    fullName: user.fullName ?? null,
  });
});

export default router;
