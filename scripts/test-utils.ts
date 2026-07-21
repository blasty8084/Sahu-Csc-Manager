#!/usr/bin/env tsx
/**
 * SAHU CSC — shared test helpers used by all test-*.ts scripts.
 */

export const API_PORT = process.env.API_PORT ?? process.env.PORT ?? "8080";
export const BASE     = `http://localhost:${API_PORT}/api`;

// ── ANSI colours ──────────────────────────────────────────────────────────────
export const GREEN  = "\x1b[32m";
export const RED    = "\x1b[31m";
export const YELLOW = "\x1b[33m";
export const CYAN   = "\x1b[36m";
export const BOLD   = "\x1b[1m";
export const RESET  = "\x1b[0m";

// ── Counters (private; mutated only through ok / fail / warn) ─────────────────
let passed = 0;
let failed = 0;
let warned = 0;

export function ok(label: string, detail?: string) {
  passed++;
  console.log(`  ${GREEN}✔${RESET}  ${label}${detail ? `  ${YELLOW}(${detail})${RESET}` : ""}`);
}

export function fail(label: string, detail?: string) {
  failed++;
  console.log(`  ${RED}✘${RESET}  ${label}${detail ? `  ${RED}→ ${detail}${RESET}` : ""}`);
}

export function warn(label: string, detail?: string) {
  warned++;
  console.log(`  ${YELLOW}⚠${RESET}  ${label}${detail ? `  ${YELLOW}(${detail})${RESET}` : ""}`);
}

export function section(title: string) {
  console.log(`\n${BOLD}${CYAN}── ${title} ${"─".repeat(Math.max(0, 50 - title.length))}${RESET}`);
}

// ── HTTP helpers ──────────────────────────────────────────────────────────────
export async function get(path: string, cookie?: string): Promise<{ status: number; body: any; raw: Response }> {
  const raw = await fetch(`${BASE}${path}`, {
    headers: cookie ? { Cookie: cookie } : {},
  });
  let body: any;
  try { body = await raw.json(); } catch { body = null; }
  return { status: raw.status, body, raw };
}

export async function post(path: string, data: object, cookie?: string): Promise<{ status: number; body: any; raw: Response }> {
  const raw = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify(data),
  });
  let body: any;
  try { body = await raw.json(); } catch { body = null; }
  return { status: raw.status, body, raw };
}

export async function del(path: string, cookie?: string): Promise<{ status: number; body: any }> {
  const raw = await fetch(`${BASE}${path}`, {
    method: "DELETE",
    headers: cookie ? { Cookie: cookie } : {},
  });
  let body: any;
  try { body = await raw.json(); } catch { body = null; }
  return { status: raw.status, body };
}

export function extractCookie(raw: Response): string {
  return raw.headers.get("set-cookie")?.split(";")[0] ?? "";
}

// ── Server readiness ──────────────────────────────────────────────────────────
export async function waitForServer(maxMs = 15_000): Promise<boolean> {
  const deadline = Date.now() + maxMs;
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`${BASE}/healthz`);
      if (r.ok) return true;
    } catch { /* not ready yet */ }
    await new Promise(r => setTimeout(r, 500));
  }
  return false;
}

// ── Summary ───────────────────────────────────────────────────────────────────
export function printSummary() {
  const total = passed + failed + warned;
  console.log(`\n${BOLD}── Summary ${"─".repeat(42)}${RESET}`);
  console.log(`  Total:   ${total}`);
  console.log(`  ${GREEN}Passed:  ${passed}${RESET}`);
  if (warned > 0) console.log(`  ${YELLOW}Warned:  ${warned}${RESET}`);
  if (failed > 0) console.log(`  ${RED}Failed:  ${failed}${RESET}`);

  if (failed === 0 && warned === 0) {
    console.log(`\n  ${GREEN}${BOLD}All checks passed. API is healthy.${RESET}\n`);
  } else if (failed === 0) {
    console.log(`\n  ${YELLOW}${BOLD}All checks passed with warnings. Review SMTP / secret config.${RESET}\n`);
  } else {
    console.log(`\n  ${RED}${BOLD}${failed} check(s) failed. Review the output above.${RESET}\n`);
    process.exit(1);
  }
}
