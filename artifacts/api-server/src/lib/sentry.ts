/**
 * Sentry APM — server-side initialisation.
 *
 * No-ops completely when SENTRY_DSN is absent so local / dev environments
 * never crash or spam the console.  Import `initSentry` at the very top of
 * app.ts (before any other middleware is registered) and call
 * `setupSentryErrorHandler(app)` after all routes.
 *
 * Sensitive data policy:
 *   – Request bodies are stripped from every event (may contain passwords /
 *     OTPs / financial fields).
 *   – Only userId and role are attached as user context — no PII.
 */

import * as Sentry from "@sentry/node";

let _initialized = false;

/** Call once, before Express middleware is registered. */
export function initSentry(): void {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return; // no-op in dev / when DSN is not configured

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? "development",
    // Sample 10 % of traces in production; adjust via SENTRY_TRACES_SAMPLE_RATE.
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
    beforeSend(event) {
      // Strip request body — it may contain passwords, OTPs, or account numbers.
      if (event.request) delete event.request.data;
      return event;
    },
  });

  _initialized = true;
}

/** True after initSentry() ran with a valid DSN. */
export function isSentryEnabled(): boolean {
  return _initialized;
}

/**
 * Register Sentry's Express error-capture handler.
 * Must be called AFTER all routes, BEFORE any custom error-handler middleware.
 */
export function setupSentryErrorHandler(app: import("express").Express): void {
  if (!_initialized) return;
  Sentry.setupExpressErrorHandler(app);
}

/** Manually capture an exception with optional extra context (no PII). */
export function captureException(
  error: unknown,
  extra?: Record<string, unknown>,
): void {
  if (!_initialized) return;
  Sentry.captureException(error, extra ? { extra } : undefined);
}
