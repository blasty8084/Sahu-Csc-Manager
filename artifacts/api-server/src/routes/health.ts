import { Router, type IRouter } from "express";
import { pool } from "@workspace/db";
import os from "os";

const router: IRouter = Router();

router.get("/healthz", async (_req, res) => {
  const startTime = Date.now();

  // ── Database check ──────────────────────────────────────────────────────────
  let dbStatus: "ok" | "error" = "ok";
  let dbLatencyMs: number | null = null;
  let dbError: string | undefined;
  let dbVersion: string | undefined;

  try {
    const dbStart = Date.now();
    const result = await pool.query<{ version: string }>("SELECT version() AS version");
    dbLatencyMs = Date.now() - dbStart;
    dbVersion = result.rows[0]?.version?.split(" ").slice(0, 2).join(" ") ?? "PostgreSQL";
    dbStatus = "ok";
  } catch (err: any) {
    dbStatus = "error";
    dbError = err?.message ?? "Unknown database error";
  }

  // ── VAPID check ─────────────────────────────────────────────────────────────
  const vapidPublic = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidEmail = process.env.VAPID_EMAIL ?? "mailto:admin@sahucsc.in";

  // Persistent = keys were set BEFORE server started (from real env secrets)
  // We detect ephemeral keys by checking a flag we set at startup
  const vapidPersistent = !!(process.env.VAPID_KEYS_FROM_ENV);
  const vapidStatus =
    !vapidPublic || !vapidPrivate ? "disabled" :
    vapidPersistent ? "ok" :
    "ephemeral";

  // ── Memory / system info ────────────────────────────────────────────────────
  const mem = process.memoryUsage();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();

  // ── Overall status ──────────────────────────────────────────────────────────
  // VAPID is optional — its absence does not degrade overall API health
  const overallStatus: "ok" | "degraded" | "error" =
    dbStatus === "error" ? "error" :
    vapidStatus === "ephemeral" ? "degraded" :
    "ok";

  const responseTimeMs = Date.now() - startTime;

  res.json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    responseTimeMs,

    server: {
      status: "ok",
      uptime: Math.floor(process.uptime()),
      nodeVersion: process.version,
      platform: process.platform,
      pid: process.pid,
      memory: {
        rssBytes: mem.rss,
        heapUsedBytes: mem.heapUsed,
        heapTotalBytes: mem.heapTotal,
        externalBytes: mem.external,
      },
      system: {
        totalMemBytes: totalMem,
        freeMemBytes: freeMem,
        cpus: os.cpus().length,
        loadAvg: os.loadavg(),
      },
    },

    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs,
      version: dbVersion,
      error: dbError,
    },

    vapid: {
      status: vapidStatus,
      persistent: vapidPersistent,
      publicKeySet: !!vapidPublic,
      privateKeySet: !!vapidPrivate,
      email: vapidEmail,
    },

    environment: process.env.NODE_ENV ?? "development",
  });
});

export default router;
