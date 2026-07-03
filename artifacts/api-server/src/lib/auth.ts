import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import { db, usersTable, auditLogsTable, userSessionsTable } from "@workspace/db";
import { eq, and, gt, not } from "drizzle-orm";
import { logger } from "./logger";

declare module "express-session" {
  interface SessionData {
    userId: number;
    userRole: string;
    sessionToken: string; // v1 backward compat
    sessionId: string;    // v2 multi-device session
  }
}

// ─── Role-permission map ───────────────────────────────────────────────────────
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: ["*"],
  operator: [
    "ledger:view", "ledger:create", "ledger:edit",
    "aeps:view", "aeps:manage",
    "reports:view", "reports:export",
    "services:view",
    "profile:view", "profile:edit",
    "notifications:view",
    "udhari:view", "udhari:manage",
  ],
  user: ["ledger:view", "reports:view", "services:view", "profile:view", "notifications:view", "udhari:view"],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.socket.remoteAddress ?? "unknown";
}

export function parseDevice(userAgent: string = ""): {
  browser: string;
  os: string;
  deviceInfo: string;
  deviceType: "mobile" | "tablet" | "desktop";
} {
  let browser = "Unknown Browser";
  let os = "Unknown OS";

  if (/windows/i.test(userAgent)) os = "Windows";
  else if (/macintosh|mac os/i.test(userAgent)) os = "macOS";
  else if (/android/i.test(userAgent)) os = "Android";
  else if (/iphone|ipad|ios/i.test(userAgent)) os = "iOS";
  else if (/linux/i.test(userAgent)) os = "Linux";
  else if (/cros/i.test(userAgent)) os = "ChromeOS";

  if (/edg\//i.test(userAgent)) browser = "Edge";
  else if (/chrome/i.test(userAgent)) browser = "Chrome";
  else if (/firefox/i.test(userAgent)) browser = "Firefox";
  else if (/safari/i.test(userAgent)) browser = "Safari";
  else if (/opera|opr\//i.test(userAgent)) browser = "Opera";
  else if (/samsung/i.test(userAgent)) browser = "Samsung Browser";
  else if (/ucbrowser/i.test(userAgent)) browser = "UC Browser";

  let deviceType: "mobile" | "tablet" | "desktop" = "desktop";
  if (/ipad|tablet|playbook|silk/i.test(userAgent)) {
    deviceType = "tablet";
  } else if (/android(?!.*tablet)|iphone|ipod|blackberry|windows phone|mobile/i.test(userAgent)) {
    deviceType = "mobile";
  }

  return { browser, os, deviceInfo: `${browser} on ${os}`, deviceType };
}

// ─── requireAuth middleware ────────────────────────────────────────────────────
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  if (req.session.sessionId) {
    // V2: validate against user_sessions table
    const [session] = await db
      .select()
      .from(userSessionsTable)
      .where(
        and(
          eq(userSessionsTable.sessionId, req.session.sessionId),
          eq(userSessionsTable.isActive, true),
          gt(userSessionsTable.expiresAt, new Date())
        )
      );

    if (!session) {
      req.session.destroy(() => {});
      res.status(401).json({ error: "SESSION_REPLACED" });
      return;
    }

    // Throttled lastActivity update (at most once per minute)
    const now = new Date();
    if (now.getTime() - new Date(session.lastActivity).getTime() > 60_000) {
      db.update(userSessionsTable)
        .set({ lastActivity: now })
        .where(eq(userSessionsTable.id, session.id))
        .catch((err) => logger.error({ err }, "Failed to update session lastActivity"));
    }
  } else if (req.session.sessionToken) {
    // V1 backward compat: validate against activeSessionToken
    const [user] = await db
      .select({ activeSessionToken: usersTable.activeSessionToken })
      .from(usersTable)
      .where(eq(usersTable.id, req.session.userId));

    if (user && user.activeSessionToken && user.activeSessionToken !== req.session.sessionToken) {
      req.session.destroy(() => {});
      res.status(401).json({ error: "SESSION_REPLACED" });
      return;
    }
  }

  next();
}

// ─── requireRole middleware ────────────────────────────────────────────────────
export function requireRole(...roles: string[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.session.userId) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId));
    if (!user || !roles.includes(user.role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
}

// ─── requirePermission middleware ─────────────────────────────────────────────
export function requirePermission(permission: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.session.userId) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    const role = req.session.userRole ?? "user";
    const perms = ROLE_PERMISSIONS[role] ?? [];
    if (perms.includes("*") || perms.includes(permission)) {
      next();
      return;
    }
    res.status(403).json({ error: "Forbidden", required: permission });
  };
}

// ─── auditLog helper ──────────────────────────────────────────────────────────
export async function auditLog(
  userId: number | null,
  action: string,
  details: string | null,
  ipAddress: string
): Promise<void> {
  if (userId === null) return;
  try {
    await db.insert(auditLogsTable).values({ userId, action, details, ipAddress });
  } catch (err) {
    logger.error({ err }, "Failed to write audit log");
  }
}
