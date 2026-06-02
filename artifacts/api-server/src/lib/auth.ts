import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import { db, usersTable, auditLogsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

declare module "express-session" {
  interface SessionData {
    userId: number;
    userRole: string;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
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
