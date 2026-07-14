/**
 * geo-block.ts — India-only geo-restriction middleware
 *
 * Uses the bundled geoip-lite MaxMind database (no external API calls, no
 * latency). Only allows requests originating from India (country code "IN").
 *
 * Exempt paths (always allowed):
 *   /health, /healthz, /api/geo, /api/setup-status
 *   /api/receipts/verify/* (public receipt QR links must work from anywhere)
 *
 * Private / loopback IPs are always allowed so Replit health probes, the dev
 * server, and internal container traffic are never blocked.
 *
 * Set ALLOW_NON_INDIA=true in shared env vars to bypass geo-blocking entirely
 * (useful for admin testing from outside India).
 */

import type { Request, Response, NextFunction } from "express";
import geoip from "geoip-lite";
import { logger } from "./logger";

const ALLOWED_COUNTRY = "IN";

/** Paths that bypass geo-blocking regardless of origin country. */
const EXEMPT_PREFIXES = [
  "/health",
  "/healthz",
  "/api/geo",
  "/api/setup-status",
  "/api/receipts/verify/",
];

/**
 * Returns true for loopback and RFC-1918 private addresses so internal
 * traffic (Replit probes, load tests, dev server) is never blocked.
 */
function isPrivateOrLoopback(ip: string): boolean {
  const raw = ip.replace(/^::ffff:/, "");
  if (raw === "::1" || raw === "127.0.0.1") return true;
  if (raw.startsWith("10.")) return true;
  if (raw.startsWith("192.168.")) return true;
  const parts = raw.split(".").map(Number);
  if (
    parts.length === 4 &&
    parts[0] === 172 &&
    parts[1] >= 16 &&
    parts[1] <= 31
  )
    return true;
  return false;
}

export function geoBlock(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Admin override — set ALLOW_NON_INDIA=true to disable geo-blocking.
  if (process.env.ALLOW_NON_INDIA === "true") {
    next();
    return;
  }

  // Exempt paths are always served regardless of country.
  if (EXEMPT_PREFIXES.some((prefix) => req.path.startsWith(prefix))) {
    next();
    return;
  }

  const ip = req.ip ?? "";

  // No IP (shouldn't happen) or private/loopback — allow through.
  if (!ip || isPrivateOrLoopback(ip)) {
    next();
    return;
  }

  const geo = geoip.lookup(ip);

  // Unknown IP (CDN edge, reserved range not in DB) — fail open rather than
  // blocking legitimate traffic we can't classify.
  if (!geo) {
    next();
    return;
  }

  if (geo.country === ALLOWED_COUNTRY) {
    next();
    return;
  }

  logger.warn(
    { ip, country: geo.country, region: geo.region, path: req.path },
    "Geo-blocked: non-India request rejected",
  );

  res.status(403).json({
    error: "GEO_BLOCKED",
    country: geo.country,
    message:
      "This service is only available in India. / " +
      "यह सेवा केवल भारत में उपलब्ध है। / " +
      "ଏହି ସେବା କେବଳ ଭାରତରେ ଉପଲବ୍ଧ।",
  });
}
