/**
 * Sentry APM — browser-side initialisation.
 *
 * No-ops completely when VITE_SENTRY_DSN is absent so local dev never crashes.
 * Import `initSentry` at the very top of main.tsx and call it before rendering.
 *
 * Sensitive data policy:
 *   – Request bodies are stripped from every event.
 *   – Only userId and role are set as user context — no PII (no phone, email).
 */

import * as Sentry from "@sentry/react";

let _initialized = false;

/** Call once at the application entry point, before React renders. */
export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
    // Strip request bodies — may contain passwords / financial fields.
    beforeSend(event) {
      if (event.request) delete event.request.data;
      return event;
    },
  });

  _initialized = true;
}

/** Manually capture an exception from an error boundary or async handler. */
export function captureException(
  error: unknown,
  extra?: Record<string, unknown>,
): void {
  if (!_initialized) return;
  Sentry.captureException(error, extra ? { extra } : undefined);
}

/**
 * Set the current user context for Sentry events.
 * Only pass userId and role — never PII like phone number or email.
 */
export function setSentryUser(userId: number | string, role?: string): void {
  if (!_initialized) return;
  Sentry.setUser({ id: String(userId), role });
}

/** Clear user context on logout. */
export function clearSentryUser(): void {
  if (!_initialized) return;
  Sentry.setUser(null);
}
