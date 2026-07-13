/**
 * @workspace/worker-server — background job processor
 *
 * Consumes jobs from BullMQ queues (backed by Redis via REDIS_URL) that the
 * main api-server pushes asynchronously:
 *   • notifications  — web-push to individual users or all subscribers
 *   • emails         — pre-rendered emails sent via SMTP (nodemailer)
 *   • pdf-generation — async PDF receipt creation (placeholder)
 *   • sms            — SMS sending (stub — no provider configured)
 *
 * A minimal Express health endpoint on PORT (default 8081) lets load-balancers
 * and PM2 verify the process is alive.
 */

import http from "node:http";
import { logger } from "./logger";

// Import connection first — exits immediately if REDIS_URL is missing.
import "./connection";

// Import all workers so they register with BullMQ before the health server starts.
import { notificationWorker } from "./workers/notification.worker";
import { emailWorker }        from "./workers/email.worker";
import { pdfWorker }          from "./workers/pdf.worker";
import { smsWorker }          from "./workers/sms.worker";

const port = Number(process.env.PORT ?? 8081);

// ── Minimal health-check HTTP server ──────────────────────────────────────────
const server = http.createServer((_req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      status: "ok",
      service: "worker-server",
      workers: ["notifications", "emails", "pdf-generation", "sms"],
    }),
  );
});

server.listen(port, () => {
  logger.info({ port }, "Worker server listening (health check)");
  logger.info(
    {
      workers: [
        notificationWorker.name,
        emailWorker.name,
        pdfWorker.name,
        smsWorker.name,
      ],
    },
    "All workers started",
  );
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
async function shutdown() {
  logger.info("Shutting down worker server…");
  await Promise.allSettled([
    notificationWorker.close(),
    emailWorker.close(),
    pdfWorker.close(),
    smsWorker.close(),
  ]);
  server.close(() => {
    logger.info("Worker server stopped");
    process.exit(0);
  });
}

process.on("SIGTERM", shutdown);
process.on("SIGINT",  shutdown);
