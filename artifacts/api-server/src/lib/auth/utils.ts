import bcrypt from "bcryptjs";
import { Request } from "express";
import { db, auditLogsTable } from "@workspace/db";
import { logger } from "../logger";

// ─── Password helpers ──────────────────────────────────────────────────────────
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ─── Network helpers ───────────────────────────────────────────────────────────
export function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.socket.remoteAddress ?? "unknown";
}

// ─── Device detection ──────────────────────────────────────────────────────────
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

// ─── Audit log helper ──────────────────────────────────────────────────────────
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
