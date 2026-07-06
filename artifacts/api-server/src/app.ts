import express, { type Express } from "express";
import cors from "cors";
import compression from "compression";
import pinoHttp from "pino-http";
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import helmet from "helmet";
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import router from "./routes";
import { logger } from "./lib/logger";
import { ensureVapidKeys } from "./lib/vapid";
import { pool } from "@workspace/db";

const PgSession = ConnectPgSimple(session);

ensureVapidKeys().catch((e) => logger.error({ err: e }, "VAPID init failed"));

const app: Express = express();

app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
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

app.use(helmet({ contentSecurityPolicy: false }));
app.use(hpp());
app.use(compression());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts, please try again later" },
});

// Registration / OTP endpoints are common brute-force & spam targets — keep
// these tighter than the general API limiter.
const authWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});

// OTP verification endpoints (short numeric code) need a stricter limit than
// OTP request endpoints to make guessing impractical.
const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts, please try again later" },
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    store: new PgSession({
      pool,
      tableName: "session",
      createTableIfMissing: true,
      pruneSessionInterval: 60 * 60, // prune expired sessions every hour
    }),
    secret: process.env.SESSION_SECRET ?? "sahu-csc-secret-key-change-in-production",
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

export default app;
