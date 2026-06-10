import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import { db, usersTable, auditLogsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

declare module "express-session" {
  interface SessionData {
    userId: number;
    userRole: string;
    sessionToken: string;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  // Single-device enforcement: if the user has an activeSessionToken set,
  // the current session MUST carry a matching token.
  if (req.session.sessionToken) {
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

export async function auditLog(
  userId: number,
  action: string,
  details: string | null,
  ipAddress: string
): Promise<void> {
  try {
    await db.insert(auditLogsTable).values({ userId, action, details, ipAddress });
  } catch (err) {
    logger.error({ err }, "Failed to write audit log");
  }
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.socket.remoteAddress ?? "unknown";
}
