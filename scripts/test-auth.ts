#!/usr/bin/env tsx
/**
 * SAHU CSC — Auth & session test suite.
 * Can be run standalone: PORT=8080 npx tsx scripts/test-auth.ts
 * Or imported by scripts/test-api.ts for the combined run.
 */

import { ok, fail, warn, section, get, post, extractCookie, printSummary, CYAN, BOLD, RESET, BASE, waitForServer, RED, GREEN } from "./test-utils.js";

// ── Public endpoints ──────────────────────────────────────────────────────────
export async function runPublicTests() {
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
      body.configured
        ? ok("GET /setup-status", "all secrets configured")
        : warn("GET /setup-status", `missing: ${body.missing?.map((m: any) => m.key).join(", ")}`);
    } else {
      fail("GET /setup-status", `HTTP ${status}`);
    }
  }
}

// ── Auth protection (unauthenticated) ─────────────────────────────────────────
export async function runAuthProtectionTests() {
  section("Auth protection (unauthenticated requests)");

  for (const path of ["/services", "/ledger", "/notifications", "/dashboard", "/profile"]) {
    const { status } = await get(path);
    status === 401
      ? ok(`GET ${path} → 401 (protected)`, "correct")
      : fail(`GET ${path}`, `expected 401, got ${status}`);
  }
}

// ── Login — invalid credentials ───────────────────────────────────────────────
export async function runLoginInvalidTests() {
  section("Login — invalid credentials");

  {
    const { status } = await post("/auth/login", { identifier: "admin", password: "wrong_password_xyz" });
    status === 401
      ? ok("POST /auth/login (wrong password) → 401")
      : fail("POST /auth/login (wrong password)", `expected 401, got ${status}`);
  }

  {
    const { status } = await post("/auth/login", { identifier: "no_such_user_xyz", password: "anything" });
    status === 401
      ? ok("POST /auth/login (unknown user) → 401")
      : fail("POST /auth/login (unknown user)", `expected 401, got ${status}`);
  }
}

// ── Admin session ─────────────────────────────────────────────────────────────
export async function runAdminTests() {
  section("Admin session");

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    warn("ADMIN_PASSWORD secret not set — skipping admin login tests");
    return;
  }

  const { status, body, raw } = await post("/auth/login", { identifier: "admin", password: adminPassword });
  if (status === 200 && body?.role === "admin") {
    ok("POST /auth/login (admin)", `role=${body.role}`);
  } else {
    fail("POST /auth/login (admin)", `HTTP ${status} — wrong password or account locked`);
    return;
  }

  const adminCookie = extractCookie(raw);
  if (!adminCookie) return;

  {
    const { status, body } = await get("/auth/me", adminCookie);
    status === 200 && body?.username
      ? ok("GET /auth/me", `username=${body.username}`)
      : fail("GET /auth/me", `HTTP ${status}`);
  }

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
    ["/audit-logs",                 "audit logs (admin)"],
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

  section("Admin — logout");
  {
    const { status } = await post("/auth/logout", {}, adminCookie);
    status === 200 ? ok("POST /auth/logout") : fail("POST /auth/logout", `HTTP ${status}`);
  }
  {
    const { status } = await get("/dashboard", adminCookie);
    status === 401
      ? ok("GET /dashboard after logout → 401 (session invalidated)")
      : warn("GET /dashboard after logout", `got ${status}, expected 401`);
  }
}

// ── Operator session ──────────────────────────────────────────────────────────
export async function runOperatorTests() {
  section("Operator session");

  const opPassword = process.env.OPERATOR_PASSWORD;
  if (!opPassword) {
    warn("OPERATOR_PASSWORD secret not set — skipping operator login tests");
    return;
  }

  const { status, body, raw } = await post("/auth/login", { identifier: "operator", password: opPassword });
  if (!(status === 200 && body?.role === "operator")) {
    fail("POST /auth/login (operator)", `HTTP ${status}`);
    return;
  }
  ok("POST /auth/login (operator)", `role=${body.role}`);
  const opCookie = extractCookie(raw);

  const { status: usersStatus } = await get("/users", opCookie);
  usersStatus === 403
    ? ok("GET /users as operator → 403 (role enforced)")
    : warn("GET /users as operator", `expected 403, got ${usersStatus}`);

  const { status: auditStatus } = await get("/audit-logs", opCookie);
  auditStatus === 403
    ? ok("GET /audit-logs as operator → 403 (role enforced)")
    : warn("GET /audit-logs as operator", `expected 403, got ${auditStatus}`);

  const { status: ledgerStatus } = await get("/ledger", opCookie);
  ledgerStatus === 200
    ? ok("GET /ledger as operator → 200")
    : fail("GET /ledger as operator", `HTTP ${ledgerStatus}`);
}

// ── Standalone entry point ────────────────────────────────────────────────────
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(`\n${BOLD}SAHU CSC — Auth Test Suite${RESET}`);
  console.log(`Target: ${CYAN}${BASE}${RESET}\n`);

  process.stdout.write("  Waiting for API server...");
  const ready = await waitForServer();
  if (!ready) {
    process.stdout.write(` ${RED}timeout${RESET}\n`);
    fail("API server did not become ready within 15 s");
    printSummary();
    process.exit(1);
  }
  process.stdout.write(` ${GREEN}ready${RESET}\n`);

  await runPublicTests();
  await runAuthProtectionTests();
  await runLoginInvalidTests();
  await runAdminTests();
  await runOperatorTests();
  printSummary();
}
