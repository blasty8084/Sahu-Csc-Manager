import { Router, type IRouter } from "express";
import { db, usersTable, userSessionsTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { LoginBody } from "@workspace/api-zod";
import { comparePassword, auditLog, getClientIp, parseDevice } from "../../lib/auth";
import {
  notifyLoginSuccess,
  notifyLoginFailed,
  notifyAccountLocked,
} from "../../services/notificationTemplates";
import { randomUUID } from "crypto";
import { fmtUser } from "./helpers";
import { asyncHandler } from "../../lib/async-handler";

const router: IRouter = Router();

const MAX_ATTEMPTS = 3;
const LOCK_MINUTES = 5;

// ─── POST /auth/login ─────────────────────────────────────────────────────────
router.post("/auth/login", asyncHandler(async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues?.[0]?.message ?? "Validation failed" });
    return;
  }
  const { identifier, password } = parsed.data;
  const rememberMe = req.body.rememberMe === true || req.body.rememberMe === "true";

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

  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const clientIp = getClientIp(req);
  const { browser, os, deviceInfo } = parseDevice(req.headers["user-agent"]);

  if (user.status === "PENDING") {
    await auditLog(user.id, "login.failed_inactive", `Login blocked — account pending approval from ${deviceInfo}`, clientIp);
    res.status(403).json({ error: "Your account is pending admin approval. Please wait for an administrator to approve your request.", pending: true });
    return;
  }
  if (!user.isActive || user.status === "DELETED" || user.status === "INACTIVE" || user.status === "SUSPENDED") {
    await auditLog(user.id, "login.failed_inactive", `Login blocked — account status: ${user.status} from ${deviceInfo}`, clientIp);
    if (user.status === "DELETED" && user.rejectionReason) {
      res.status(401).json({
        error: `Your registration was declined. Reason: ${user.rejectionReason}`,
        rejected: true,
        rejectionReason: user.rejectionReason,
      });
    } else if (user.status === "DELETED") {
      res.status(401).json({
        error: "Your registration was declined. Please contact administrator.",
        rejected: true,
      });
    } else {
      res.status(401).json({ error: "Account is not active. Please contact administrator." });
    }
    return;
  }

  if (user.status === "LOCKED" && user.lockedUntil) {
    if (new Date() < user.lockedUntil) {
      const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60_000);
      await auditLog(user.id, "login.failed_locked", `Login blocked — account locked, ${minutesLeft}m remaining, from ${deviceInfo}`, clientIp);
      res.status(401).json({
        error: `Account temporarily locked. Try again in ${minutesLeft} minute${minutesLeft !== 1 ? "s" : ""}.`,
        locked: true,
        lockedUntil: user.lockedUntil.toISOString(),
      });
      return;
    }
    await db
      .update(usersTable)
      .set({ status: "ACTIVE", failedLoginAttempts: 0, lockedUntil: null })
      .where(eq(usersTable.id, user.id));
    user.status = "ACTIVE";
    user.failedLoginAttempts = 0;
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    const attempts = (user.failedLoginAttempts ?? 0) + 1;
    if (attempts >= MAX_ATTEMPTS) {
      const lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60_000);
      await db
        .update(usersTable)
        .set({ failedLoginAttempts: attempts, status: "LOCKED", lockedUntil })
        .where(eq(usersTable.id, user.id));
      await auditLog(user.id, "login.failed_max_attempts", `Account locked after ${MAX_ATTEMPTS} failed attempts from ${deviceInfo}`, clientIp);
      await notifyAccountLocked(user.id, clientIp, attempts);
      res.status(401).json({
        error: `Too many failed attempts. Account locked for ${LOCK_MINUTES} minutes.`,
        locked: true,
        lockedUntil: lockedUntil.toISOString(),
      });
    } else {
      await db
        .update(usersTable)
        .set({ failedLoginAttempts: attempts })
        .where(eq(usersTable.id, user.id));
      await auditLog(user.id, "login.failed_password", `Wrong password attempt ${attempts}/${MAX_ATTEMPTS} from ${deviceInfo}`, clientIp);
      await notifyLoginFailed(user.id, clientIp, deviceInfo, attempts, MAX_ATTEMPTS);
      res.status(401).json({
        error: "Invalid credentials",
        attemptsLeft: MAX_ATTEMPTS - attempts,
      });
    }
    return;
  }

  const sessionId = randomUUID();
  const sessionDuration = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000;
  const expiresAt = new Date(Date.now() + sessionDuration);

  await db
    .update(usersTable)
    .set({ failedLoginAttempts: 0, status: "ACTIVE", lockedUntil: null, activeSessionToken: sessionId })
    .where(eq(usersTable.id, user.id));

  await db.insert(userSessionsTable).values({
    userId: user.id,
    sessionId,
    deviceInfo,
    browser,
    os,
    ipAddress: getClientIp(req),
    rememberMe,
    expiresAt,
  });

  req.session.userId = user.id;
  req.session.userRole = user.role;
  req.session.sessionToken = sessionId;
  req.session.sessionId = sessionId;
  req.session.cookie.maxAge = sessionDuration;

  await auditLog(user.id, "login", `Logged in from ${deviceInfo}`, getClientIp(req));
  await notifyLoginSuccess(user.id, clientIp, deviceInfo);

  res.json(fmtUser(user));
}));

export default router;
