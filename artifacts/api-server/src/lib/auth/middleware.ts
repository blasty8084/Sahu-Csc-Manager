import { Request, Response, NextFunction } from "express";
import { db, usersTable, userSessionsTable } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";
import { logger } from "../logger";
import { sessionValidityCache, userRoleCache } from "./sessionCache";

// ─── Session type augmentation ─────────────────────────────────────────────────
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

// ─── requireAuth middleware ────────────────────────────────────────────────────
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  if (req.session.sessionId) {
    // V2: validate against user_sessions table. Cached for a few seconds since
    // this runs on nearly every request — see sessionCache.ts for the trade-off.
    const sessionId = req.session.sessionId;
    let valid = await sessionValidityCache.get(sessionId);
    let session: { id: number; lastActivity: Date | string } | undefined;

    if (valid === undefined) {
      [session] = await db
        .select()
        .from(userSessionsTable)
        .where(
          and(
            eq(userSessionsTable.sessionId, sessionId),
            eq(userSessionsTable.isActive, true),
            gt(userSessionsTable.expiresAt, new Date())
          )
        );
      valid = !!session;
      await sessionValidityCache.set(sessionId, valid);
    }

    if (!valid) {
      req.session.destroy(() => {});
      res.status(401).json({ error: "SESSION_REPLACED" });
      return;
    }

    // Throttled lastActivity update (at most once per minute). Only runs when
    // we actually fetched the row this request (cache hits skip the DB read
    // entirely, so lastActivity is simply updated on the next cache-miss request).
    if (session) {
      const now = new Date();
      if (now.getTime() - new Date(session.lastActivity).getTime() > 60_000) {
        db.update(userSessionsTable)
          .set({ lastActivity: now })
          .where(eq(userSessionsTable.id, session.id))
          .catch((err) => logger.error({ err }, "Failed to update session lastActivity"));
      }
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
    const userId = req.session.userId;
    let cached = await userRoleCache.get(String(userId));
    if (!cached) {
      const [user] = await db
        .select({ role: usersTable.role, activeSessionToken: usersTable.activeSessionToken })
        .from(usersTable)
        .where(eq(usersTable.id, userId));
      if (!user) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      cached = user;
      await userRoleCache.set(String(userId), cached);
    }
    if (!roles.includes(cached.role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
}

// ─── requirePermission middleware ──────────────────────────────────────────────
export function requirePermission(permission: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.session.userId) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    // Read the same cache-backed current role as requireRole (not the
    // session-cookie-baked req.session.userRole, which never refreshes after
    // login) so a role change takes effect consistently across both guards.
    const userId = req.session.userId;
    let cached = await userRoleCache.get(String(userId));
    if (!cached) {
      const [user] = await db
        .select({ role: usersTable.role, activeSessionToken: usersTable.activeSessionToken })
        .from(usersTable)
        .where(eq(usersTable.id, userId));
      if (!user) {
        res.status(403).json({ error: "Forbidden", required: permission });
        return;
      }
      cached = user;
      await userRoleCache.set(String(userId), cached);
    }
    const perms = ROLE_PERMISSIONS[cached.role] ?? [];
    if (perms.includes("*") || perms.includes(permission)) {
      next();
      return;
    }
    res.status(403).json({ error: "Forbidden", required: permission });
  };
}
