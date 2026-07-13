import { Router, type IRouter } from "express";
import { pool } from "@workspace/db";
import os from "os";
import v8 from "v8";
import { getBootHealth } from "../lib/boot-tracker";

const router: IRouter = Router();

// Alias /health → /healthz for load-balancers, PM2, and Replit port probes
router.get("/health", (_req, res) => {
  res.json({ status: "ok", version: "4.1.1", uptime: process.uptime() });
});

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
  const vapidEmail = process.env.VAPID_EMAIL ?? "mailto:sahuuttam690@gmail.com";

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
  const heapStats = v8.getHeapStatistics();

  // ── Boot / crash-loop check ─────────────────────────────────────────────────
  const bootHealth = getBootHealth();

  // ── Warnings (human-readable, surfaced to admins in the UI) ─────────────────
  const warnings: string[] = [];
  // NOTE: heapUsed/heapTotal is NOT a good danger signal — V8 normally runs with heapUsed
  // near 90-98% of heapTotal (its *currently allocated* heap) between GC cycles; that's
  // expected steady-state behavior, not a leak. The real ceiling that matters is
  // heap_size_limit (the point where V8 throws "JavaScript heap out of memory").
  const heapLimitRatio = heapStats.heap_size_limit > 0 ? mem.heapUsed / heapStats.heap_size_limit : 0;
  const memFreeRatio = totalMem > 0 ? freeMem / totalMem : 1;

  if (dbLatencyMs !== null && dbLatencyMs > 800) {
    warnings.push(`Database response is slow (${dbLatencyMs} ms). This can make every page feel laggy.`);
  }
  if (heapLimitRatio > 0.9) {
    warnings.push("Server memory (heap) usage is very high — the process may restart unexpectedly.");
  }
  if (memFreeRatio < 0.1) {
    warnings.push("System memory is nearly exhausted.");
  }
  if (bootHealth.crashLoopSuspected) {
    warnings.push(
      `Server has restarted ${bootHealth.recentBootCount} times in the last 5 minutes. ` +
      "This usually means a duplicate workflow/process is fighting over the same port — " +
      "check for stray processes and restart cleanly.",
    );
  }
  const elapsedSoFarMs = Date.now() - startTime;
  if (elapsedSoFarMs > 500) {
    warnings.push(`This health check itself took ${elapsedSoFarMs} ms to respond — the server may be overloaded.`);
  }

  // ── Overall status ──────────────────────────────────────────────────────────
  // VAPID is optional — its absence does not degrade overall API health
  const overallStatus: "ok" | "degraded" | "error" =
    dbStatus === "error" ? "error" :
    (vapidStatus === "ephemeral" || warnings.length > 0) ? "degraded" :
    "ok";

  const totalResponseTimeMs = Date.now() - startTime;

  res.json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    responseTimeMs: totalResponseTimeMs,
    warnings,
    boot: bootHealth,

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
        heapSizeLimitBytes: heapStats.heap_size_limit,
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
