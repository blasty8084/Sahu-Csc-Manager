#!/usr/bin/env tsx
/**
 * SAHU CSC — API Health Test Suite
 * Runs against the local API server (port 8080).
 * Usage:  PORT=8080 npx tsx scripts/test-api.ts
 */

const API_PORT = process.env.API_PORT ?? process.env.PORT ?? "8080";
const BASE = `http://localhost:${API_PORT}/api`;

const GREEN  = "\x1b[32m";
const RED    = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN   = "\x1b[36m";
const BOLD   = "\x1b[1m";
const RESET  = "\x1b[0m";

let passed = 0;
let failed = 0;
let warned = 0;

function ok(label: string, detail?: string) {
  passed++;
  console.log(`  ${GREEN}✔${RESET}  ${label}${detail ? `  ${YELLOW}(${detail})${RESET}` : ""}`);
}

function fail(label: string, detail?: string) {
  failed++;
  console.log(`  ${RED}✘${RESET}  ${label}${detail ? `  ${RED}→ ${detail}${RESET}` : ""}`);
}

function warn(label: string, detail?: string) {
  warned++;
  console.log(`  ${YELLOW}⚠${RESET}  ${label}${detail ? `  ${YELLOW}(${detail})${RESET}` : ""}`);
}

function section(title: string) {
  console.log(`\n${BOLD}${CYAN}── ${title} ${"─".repeat(Math.max(0, 50 - title.length))}${RESET}`);
}

async function get(path: string, cookie?: string): Promise<{ status: number; body: any; raw: Response }> {
  const raw = await fetch(`${BASE}${path}`, {
    headers: cookie ? { Cookie: cookie } : {},
  });
  let body: any;
  try { body = await raw.json(); } catch { body = null; }
  return { status: raw.status, body, raw };
}

async function post(path: string, data: object, cookie?: string): Promise<{ status: number; body: any; raw: Response }> {
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

async function del(path: string, cookie?: string): Promise<{ status: number; body: any }> {
  const raw = await fetch(`${BASE}${path}`, {
    method: "DELETE",
    headers: cookie ? { Cookie: cookie } : {},
  });
  let body: any;
  try { body = await raw.json(); } catch { body = null; }
  return { status: raw.status, body };
}

function extractCookie(raw: Response): string {
  return raw.headers.get("set-cookie")?.split(";")[0] ?? "";
}

// ── Wait for server to be ready ───────────────────────────────────────────────
async function waitForServer(maxMs = 15_000): Promise<boolean> {
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

// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n${BOLD}SAHU CSC — API Health Test Suite${RESET}`);
  console.log(`Target: ${CYAN}${BASE}${RESET}\n`);

  // ── 0. Wait for server ────────────────────────────────────────────────────
  process.stdout.write("  Waiting for API server...");
  const ready = await waitForServer();
  if (!ready) {
    process.stdout.write(` ${RED}timeout${RESET}\n`);
    fail("API server did not become ready within 15 s");
    printSummary();
    process.exit(1);
  }
  process.stdout.write(` ${GREEN}ready${RESET}\n`);

  // ── 1. Public endpoints ───────────────────────────────────────────────────
  section("Public endpoints");

  {
    const { status, body } = await get("/healthz");
    if (status === 200 && (body?.status === "ok" || body?.status === "degraded")) {
      ok("GET /healthz", `status=${body.status}, db=${body?.database?.status}`);
    } else {
      fail("GET /healthz", `HTTP ${status}, body=${JSON.stringify(body)}`);
    }

    if (body?.database?.status !== "ok") {
      warn("Database is not healthy", body?.database?.error ?? "check DB connection");
    }
  }

  {
    const { status, body } = await get("/setup-status");
    if (status === 200 && typeof body?.configured === "boolean") {
      if (body.configured) {
        ok("GET /setup-status", "all secrets configured");
      } else {
        warn("GET /setup-status", `missing: ${body.missing?.map((m: any) => m.key).join(", ")}`);
      }
    } else {
      fail("GET /setup-status", `HTTP ${status}`);
    }
  }

  // ── 2. Auth protection ────────────────────────────────────────────────────
  section("Auth protection (unauthenticated requests)");

  for (const path of ["/services", "/ledger", "/notifications", "/dashboard", "/profile"]) {
    const { status } = await get(path);
    if (status === 401) {
      ok(`GET ${path} → 401 (protected)`, "correct");
    } else {
      fail(`GET ${path}`, `expected 401, got ${status}`);
    }
  }

  // ── 3. Login — bad credentials ────────────────────────────────────────────
  section("Login — invalid credentials");

  {
    const { status } = await post("/auth/login", { identifier: "admin", password: "wrong_password_xyz" });
    if (status === 401) {
      ok("POST /auth/login (wrong password) → 401");
    } else {
      fail("POST /auth/login (wrong password)", `expected 401, got ${status}`);
    }
  }

  {
    const { status } = await post("/auth/login", { identifier: "no_such_user_xyz", password: "anything" });
    if (status === 401) {
      ok("POST /auth/login (unknown user) → 401");
    } else {
      fail("POST /auth/login (unknown user)", `expected 401, got ${status}`);
    }
  }

  // ── 4. Login as admin ─────────────────────────────────────────────────────
  section("Admin session");

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    warn("ADMIN_PASSWORD secret not set — skipping admin login tests");
  } else {
    const { status, body, raw } = await post("/auth/login", { identifier: "admin", password: adminPassword });
    if (status === 200 && body?.role === "admin") {
      ok("POST /auth/login (admin)", `role=${body.role}`);
    } else {
      fail("POST /auth/login (admin)", `HTTP ${status} — wrong password or account locked`);
    }

    const adminCookie = extractCookie(raw);

    if (adminCookie) {
      // GET /auth/me
      {
        const { status, body } = await get("/auth/me", adminCookie);
        status === 200 && body?.username
          ? ok("GET /auth/me", `username=${body.username}`)
          : fail("GET /auth/me", `HTTP ${status}`);
      }

      // Authenticated endpoints
      const endpoints: [string, string][] = [
        ["/services",                   "services list"],
        ["/ledger",                     "ledger entries"],
        ["/notifications",              "notifications"],
        ["/notifications/unread-count", "unread count"],
        ["/dashboard",                  "dashboard stats"],
        ["/reports/daily",              "daily report"],
        ["/reports/monthly",            "monthly report"],
        ["/profile",                    "profile"],
        ["/settings",                   "settings"],
        ["/sessions",                   "sessions"],
        ["/audit-logs",                  "audit logs (admin)"],
        ["/users",                      "users list (admin)"],
      ];

      section("Admin — protected endpoints");
      for (const [path, label] of endpoints) {
        const { status } = await get(path, adminCookie);
        if (status === 200) {
          ok(`GET ${path}`, label);
        } else if (status === 404) {
          warn(`GET ${path}`, `404 — route may not exist`);
        } else {
          fail(`GET ${path}`, `HTTP ${status} (${label})`);
        }
      }

      // Logout
      section("Admin — logout");
      {
        const { status } = await post("/auth/logout", {}, adminCookie);
        if (status === 200) {
          ok("POST /auth/logout");
        } else {
          fail("POST /auth/logout", `HTTP ${status}`);
        }
      }

      // Confirm session is dead
      {
        const { status } = await get("/dashboard", adminCookie);
        status === 401
          ? ok("GET /dashboard after logout → 401 (session invalidated)")
          : warn("GET /dashboard after logout", `got ${status}, expected 401`);
      }
    }
  }

  // ── 5. Operator session ───────────────────────────────────────────────────
  section("Operator session");

  const opPassword = process.env.OPERATOR_PASSWORD;
  if (!opPassword) {
    warn("OPERATOR_PASSWORD secret not set — skipping operator login tests");
  } else {
    const { status, body, raw } = await post("/auth/login", { identifier: "operator", password: opPassword });
    if (status === 200 && body?.role === "operator") {
      ok("POST /auth/login (operator)", `role=${body.role}`);
      const opCookie = extractCookie(raw);

      // Operator should NOT access admin-only routes
      const { status: usersStatus } = await get("/users", opCookie);
      usersStatus === 403
        ? ok("GET /users as operator → 403 (role enforced)")
        : warn("GET /users as operator", `expected 403, got ${usersStatus}`);

      const { status: auditStatus } = await get("/audit-logs", opCookie);
      auditStatus === 403
        ? ok("GET /audit-logs as operator → 403 (role enforced)")
        : warn("GET /audit-logs as operator", `expected 403, got ${auditStatus}`);

      // Operator CAN access shared routes
      const { status: ledgerStatus } = await get("/ledger", opCookie);
      ledgerStatus === 200
        ? ok("GET /ledger as operator → 200")
        : fail("GET /ledger as operator", `HTTP ${ledgerStatus}`);

    } else {
      fail("POST /auth/login (operator)", `HTTP ${status}`);
    }
  }

  printSummary();
}

function printSummary() {
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

main().catch(err => {
  console.error(`${RED}Unexpected error:${RESET}`, err);
  process.exit(1);
});
