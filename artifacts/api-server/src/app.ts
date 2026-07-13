import express, { type Express } from "express";
import cors from "cors";
import compression from "compression";
import pinoHttp from "pino-http";
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import helmet from "helmet";
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { Redis } from "@upstash/redis";
import router from "./routes";
import healthRouter from "./routes/health";
import setupStatusRouter from "./routes/setup-status";
import { logger } from "./lib/logger";
import { pool } from "@workspace/db";
import { initSentry, setupSentryErrorHandler } from "./lib/sentry";

// Initialise Sentry before any middleware so it can instrument the full
// request lifecycle.  No-ops when SENTRY_DSN is not set.
initSentry();

const PgSession = ConnectPgSimple(session);

// ── Redis client for shared rate-limit counters ───────────────────────────────
// Only created when CACHE_BACKEND=redis and both Upstash env vars are set.
// Falls back to the default per-process MemoryStore when Redis is absent —
// safe for single-instance dev, but counters are not shared across instances.
const _rlRedis =
  process.env.CACHE_BACKEND === "redis" &&
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

if (_rlRedis) {
  logger.info("Rate limiter: using shared Redis store (cross-instance counters)");
} else {
  logger.info("Rate limiter: using in-process MemoryStore (single-instance only)");
}

// Returns a RedisStore for the given key prefix, or undefined (→ MemoryStore).
const makeRlStore = (prefix: string) =>
  _rlRedis
    ? new RedisStore({
        sendCommand: (...args: string[]) => (_rlRedis as any).sendCommand(args),
        prefix: `rl:${prefix}:`,
      })
    : undefined;

const app: Express = express();

app.set("trust proxy", 1);

// Minimal APM surrogate: no external tracing service is wired up (that would
// need an integration — see replit.md follow-ups), but every request's
// duration is logged, and anything crossing SLOW_REQUEST_MS is logged at
// "warn" with a dedicated `slowRequest: true` flag so it can be grepped/
// alerted on without needing a full APM agent.
const SLOW_REQUEST_MS = Number(process.env.SLOW_REQUEST_MS ?? 500);

app.use(
  pinoHttp({
    logger,
    customLogLevel: (_req, res, err) => {
      if (err || res.statusCode >= 500) return "error";
      if (res.statusCode >= 400) return "warn";
      const responseTime = (res as any).responseTime as number | undefined;
      if (responseTime !== undefined && responseTime > SLOW_REQUEST_MS) return "warn";
      return "info";
    },
    customProps: (_req, res) => {
      const responseTime = (res as any).responseTime as number | undefined;
      return responseTime !== undefined && responseTime > SLOW_REQUEST_MS
        ? { slowRequest: true }
        : {};
    },
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

// This server only ever returns JSON (no HTML/static assets), so CSP mainly
// guards against it ever being coerced into rendering attacker content
// (e.g. an error page, a misconfigured route). "default-src 'none'" with no
// script/style/frame exceptions is safe here and costs nothing functionally.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(hpp());
app.use(compression());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeRlStore("general"),
  // Loopback-only bypass so `pnpm run loadtest` (run from inside this same
  // container, hitting 127.0.0.1 directly) can generate realistic concurrent
  // traffic without tripping the per-IP limiter meant for external abuse.
  // Gated on NODE_ENV !== "production" so this bypass path does not exist at
  // all in production — `req.ip` is derived from X-Forwarded-For (trust
  // proxy is on), which is attacker-controllable, so it must never be
  // trusted for a security-relevant bypass once real traffic is in play.
  skip: (req) =>
    process.env.NODE_ENV !== "production" &&
    (req.ip === "127.0.0.1" || req.ip === "::1" || req.ip === "::ffff:127.0.0.1"),
});
app.use(limiter);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeRlStore("login"),
  message: { error: "Too many login attempts, please try again later" },
});

// Registration / OTP endpoints are common brute-force & spam targets — keep
// these tighter than the general API limiter.
const authWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeRlStore("auth-write"),
  message: { error: "Too many requests, please try again later" },
});

// OTP verification endpoints (short numeric code) need a stricter limit than
// OTP request endpoints to make guessing impractical.
const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeRlStore("otp-verify"),
  message: { error: "Too many attempts, please try again later" },
});

app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
      : ["http://localhost:5000"],
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health/setup-status checks are hit frequently (uptime monitors, orchestrator
// probes) and never need a session — mount them before the session middleware
// so those requests skip the per-request Postgres session-store lookup.
app.use(healthRouter);
app.use(setupStatusRouter);

app.use(
  session({
    store: new PgSession({
      pool,
      tableName: "session",
      createTableIfMissing: true,
      pruneSessionInterval: 60 * 60, // prune expired sessions every hour
    }),
    secret: process.env.SESSION_SECRET ?? (() => { throw new Error("SESSION_SECRET environment variable is required"); })(),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    },
  }),
);

app.use("/api/auth/login", loginLimiter);
app.use("/api/auth/register", authWriteLimiter);
app.use("/api/auth/appeal", authWriteLimiter);
app.use("/api/auth/send-otp", authWriteLimiter);
app.use("/api/auth/forgot-password", authWriteLimiter);
app.use("/api/auth/verify-otp", otpVerifyLimiter);
app.use("/api/auth/reset-password", otpVerifyLimiter);
app.use("/api", router);

// Sentry error handler must come after all routes but before any custom
// error-handler middleware.  No-ops when SENTRY_DSN is not set.
setupSentryErrorHandler(app);

// Generic fallback error handler — keeps the API from leaking stack traces.
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: express.NextFunction,
  ) => {
    logger.error({ err }, "Unhandled error");
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default app;
