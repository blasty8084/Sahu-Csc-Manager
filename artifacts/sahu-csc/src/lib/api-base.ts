/**
 * Returns the API base URL for fetch calls.
 * - Production (Vercel): direct Render URL to avoid proxy cookie stripping
 * - Development (Replit): empty string so Vite proxy handles /api/*
 */
export function getApiBase(): string {
  // VITE_API_URL set hai toh directly use karo (production)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, "");
  }
  // Dev: Vite proxy handles /api/* → localhost:8080
  return import.meta.env.BASE_URL?.replace(/\/+$/, "") ?? "";
}
