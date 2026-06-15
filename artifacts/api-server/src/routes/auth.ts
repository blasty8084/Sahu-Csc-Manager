import { Router, type IRouter } from "express";
import { db, usersTable, userSessionsTable, settingsTable } from "@workspace/db";
import { eq, or, and } from "drizzle-orm";
import { z } from "zod/v4";
import { LoginBody } from "@workspace/api-zod";
import {
  hashPassword,
  comparePassword,
  requireAuth,
  auditLog,
  getClientIp,
  parseDevice,
} from "../lib/auth";
import { createNotification } from "../lib/notify";
import {
  notifyLoginSuccess,
  notifyLoginFailed,
  notifyAccountLocked,
  notifyPasswordChanged,
  notifyPasswordReset,
  notifyNewRegistration,
} from "../services/notificationTemplates";
import { randomUUID } from "crypto";
import { cacheGet, cacheSet } from "../lib/registration-cache";

const router: IRouter = Router();

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

const RegisterBody = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username too long")
    .regex(/^[a-zA-Z0-9_]+$/, "Username may only contain letters, numbers, underscores"),
  email: z.string().email("Invalid email address"),
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number")
    .optional(),
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100).optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

function fmtUser(user: any) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    mobile: user.mobile ?? null,
    role: user.role,
    fullName: user.fullName ?? null,
    profilePicture: user.profilePicture ?? null,
    bio: user.bio ?? null,
    address: user.address ?? null,
    status: user.status ?? "ACTIVE",
  };
}

// ─── POST /auth/register ──────────────────────────────────────────────────────
router.post("/auth/register", async (req, res): Promise<void> => {
  // Check registration toggle server-side (never trust frontend)
  const cached = cacheGet("registration_open");
  let isOpen = cached === "true";
  if (cached === null) {
    const [row] = await db.select().from(settingsTable).where(eq(settingsTable.key, "registration_open"));
    isOpen = row?.value === "true";
    cacheSet("registration_open", isOpen ? "true" : "false", 60_000);
  }
  if (!isOpen) {
    res.status(403).json({ error: "Registration is currently closed. Contact your administrator." });
    return;
  }

  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues?.[0];
    res.status(400).json({ error: firstIssue?.message ?? "Validation failed" });
    return;
  }
  const data = parsed.data;

  // Check uniqueness
  const conditions: any[] = [
    eq(usersTable.username, data.username),
    eq(usersTable.email, data.email),
  ];
  if (data.mobile) conditions.push(eq(usersTable.mobile, data.mobile));

  const [existing] = await db
    .select({ id: usersTable.id, username: usersTable.username, email: usersTable.email, mobile: usersTable.mobile })
    .from(usersTable)
    .where(or(...conditions));

  if (existing) {
    if (existing.username === data.username) {
      res.status(409).json({ error: "Username already taken" });
    } else if (existing.email === data.email) {
      res.status(409).json({ error: "Email already registered" });
    } else {
      res.status(409).json({ error: "Mobile number already registered" });
    }
    return;
  }

  const passwordHash = await hashPassword(data.password);
  const [user] = await db
    .insert(usersTable)
    .values({
      username: data.username,
      email: data.email,
      mobile: data.mobile ?? null,
      fullName: data.fullName ?? null,
      passwordHash,
      role: "operator",
      isActive: false,
      status: "PENDING",
      failedLoginAttempts: 0,
    })
    .returning();

  await auditLog(user.id, "REGISTER_REQUEST", `New registration submitted: ${user.username}`, getClientIp(req));
  await notifyNewRegistration(
    "New Registration Request",
    `${user.username} submitted a registration request — pending approval`
  );

  res.status(201).json({ pending: true, message: "Registration submitted. Awaiting admin approval." });
});

// ─── POST /auth/login ─────────────────────────────────────────────────────────
router.post("/auth/login", async (req, res): Promise<void> => {
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
    await createNotification("Failed Login Attempt", `Failed login for: ${identifier}`, "warning");
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const clientIp = getClientIp(req);
  const { browser, os, deviceInfo } = parseDevice(req.headers["user-agent"]);

  // Account status gate
  if (user.status === "PENDING") {
    await auditLog(user.id, "login.failed_inactive", `Login blocked — account pending approval from ${deviceInfo}`, clientIp);
    res.status(403).json({ error: "Your account is pending admin approval. Please wait for an administrator to approve your request.", pending: true });
    return;
  }
  if (!user.isActive || user.status === "DELETED" || user.status === "INACTIVE" || user.status === "SUSPENDED") {
    await auditLog(user.id, "login.failed_inactive", `Login blocked — account status: ${user.status} from ${deviceInfo}`, clientIp);
    res.status(401).json({ error: "Account is not active. Please contact administrator." });
    return;
  }

  // Locked check — auto-unlock if lock window has passed
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
    // Lock expired — auto-unlock
    await db
      .update(usersTable)
      .set({ status: "ACTIVE", failedLoginAttempts: 0, lockedUntil: null })
      .where(eq(usersTable.id, user.id));
    user.status = "ACTIVE";
    user.failedLoginAttempts = 0;
  }

  // Password check
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

  // ── Success ──────────────────────────────────────────────────────────────────
  const sessionId = randomUUID();
  const sessionDuration = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000;
  const expiresAt = new Date(Date.now() + sessionDuration);

  // Reset failed attempts + store activeSessionToken for V1 compat
  await db
    .update(usersTable)
    .set({ failedLoginAttempts: 0, status: "ACTIVE", lockedUntil: null, activeSessionToken: sessionId })
    .where(eq(usersTable.id, user.id));

  // Create V2 session record
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
  req.session.sessionToken = sessionId; // V1 compat
  req.session.sessionId = sessionId;    // V2
  req.session.cookie.maxAge = sessionDuration;

  await auditLog(user.id, "login", `Logged in from ${deviceInfo}`, getClientIp(req));
  await notifyLoginSuccess(user.id, clientIp, deviceInfo);

  res.json(fmtUser(user));
});

// ─── POST /auth/logout ────────────────────────────────────────────────────────
router.post("/auth/logout", requireAuth, async (req, res): Promise<void> => {
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

  await auditLog(userId, "logout", "User logged out", getClientIp(req));
  req.session.destroy(() => {});
  res.json({ message: "Logged out successfully" });
});

// ─── GET /auth/me ─────────────────────────────────────────────────────────────
router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId!));
  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json(fmtUser(user));
});

export default router;
