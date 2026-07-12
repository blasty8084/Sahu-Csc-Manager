// Phase 2 scale-readiness load test: real concurrent-user load at 50/100/200
// connections, covering a read-heavy mix (dashboard/reports/admin overview)
// and a write-heavy mix (ledger entry creation). Uses a disposable temp user
// created and torn down by this script — never touches real seeded data.
//
// Run with: pnpm --filter @workspace/api-server exec tsx src/scripts/loadtest-phase2.ts
// Requires: API Server workflow running on port 8080, ADMIN_PASSWORD secret set.
import autocannon from "autocannon";

const BASE_URL = process.env.LOADTEST_URL ?? "http://127.0.0.1:8080";
const DURATION_S = Number(process.env.LOADTEST_DURATION ?? 10);
const CONNECTION_LEVELS = [50, 100, 200];

interface CookieJar {
  cookie: string;
}

async function login(identifier: string, password: string): Promise<CookieJar> {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });
  if (!res.ok) {
    throw new Error(`login failed for ${identifier}: ${res.status} ${await res.text()}`);
  }
  const setCookie = res.headers.get("set-cookie");
  if (!setCookie) throw new Error(`login for ${identifier} did not return a session cookie`);
  return { cookie: setCookie.split(";")[0] };
}

async function createTempUser(adminCookie: string): Promise<{ id: number; username: string; password: string }> {
  const username = `loadtest_${Date.now()}`;
  const password = `LoadTest!${Date.now()}9x`;
  const res = await fetch(`${BASE_URL}/api/users`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie: adminCookie },
    body: JSON.stringify({
      username,
      email: `${username}@example.invalid`,
      password,
      role: "operator",
    }),
  });
  if (!res.ok) throw new Error(`temp user create failed: ${res.status} ${await res.text()}`);
  const user = (await res.json()) as { id: number };
  return { id: user.id, username, password };
}

async function deleteTempUser(adminCookie: string, id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/users/${id}`, {
    method: "DELETE",
    headers: { cookie: adminCookie },
  });
  if (!res.ok) {
    console.error(`WARNING: failed to delete temp user ${id}: ${res.status} ${await res.text()}`);
  }
}

interface RunResult {
  label: string;
  connections: number;
  p50: number;
  p95: number;
  p99: number;
  mean: number;
  reqPerSec: number;
  errors: number;
  non2xx: number;
}

async function runRead(label: string, path: string, cookie: string, connections: number): Promise<RunResult> {
  const result = await autocannon({
    url: `${BASE_URL}${path}`,
    connections,
    duration: DURATION_S,
    headers: { cookie },
  });
  return {
    label,
    connections,
    p50: result.latency.p50,
    p95: result.latency.p97_5,
    p99: result.latency.p99,
    mean: result.latency.mean,
    reqPerSec: result.requests.mean,
    errors: result.errors,
    non2xx: result.non2xx,
  };
}

async function runWrite(label: string, cookie: string, connections: number): Promise<RunResult> {
  let i = 0;
  const result = await autocannon({
    url: `${BASE_URL}/api/ledger`,
    method: "POST",
    connections,
    duration: DURATION_S,
    headers: { cookie, "content-type": "application/json" },
    setupClient: (client) => {
      client.setBody(
        JSON.stringify({
          date: new Date().toISOString().slice(0, 10),
          customerName: `Load Test Customer ${i++}`,
          serviceType: "Other",
          credit: 10,
          debit: 0,
          description: "Phase 2 load test entry — disposable, deleted after the run",
        })
      );
    },
  });
  return {
    label,
    connections,
    p50: result.latency.p50,
    p95: result.latency.p97_5,
    p99: result.latency.p99,
    mean: result.latency.mean,
    reqPerSec: result.requests.mean,
    errors: result.errors,
    non2xx: result.non2xx,
  };
}

function printResult(r: RunResult) {
  console.log(
    `${r.label} @ ${r.connections} conns: p50=${r.p50}ms p95=${r.p95}ms p99=${r.p99}ms mean=${r.mean}ms ` +
      `req/s=${r.reqPerSec} errors=${r.errors} non2xx=${r.non2xx}`
  );
}

async function main() {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) throw new Error("ADMIN_PASSWORD env var not set");

  console.log("Logging in as admin...");
  const admin = await login("admin", adminPassword);

  console.log("Creating disposable temp user for write-heavy mix...");
  const tempUser = await createTempUser(admin.cookie);
  const temp = await login(tempUser.username, tempUser.password);
  console.log(`Temp user created: id=${tempUser.id} username=${tempUser.username}`);

  const allResults: RunResult[] = [];

  try {
    for (const connections of CONNECTION_LEVELS) {
      console.log(`\n=== Read-heavy mix: GET /api/dashboard (admin) @ ${connections} connections ===`);
      allResults.push(await runRead("GET /api/dashboard", "/api/dashboard", admin.cookie, connections));
      printResult(allResults[allResults.length - 1]);

      console.log(`\n=== Read-heavy mix: GET /api/admin/users-overview (admin) @ ${connections} connections ===`);
      allResults.push(
        await runRead("GET /api/admin/users-overview", "/api/admin/users-overview", admin.cookie, connections)
      );
      printResult(allResults[allResults.length - 1]);

      console.log(`\n=== Read-heavy mix: GET /api/reports/daily (admin) @ ${connections} connections ===`);
      allResults.push(
        await runRead(
          "GET /api/reports/daily",
          `/api/reports/daily?date=${new Date().toISOString().slice(0, 10)}`,
          admin.cookie,
          connections
        )
      );
      printResult(allResults[allResults.length - 1]);

      console.log(`\n=== Write-heavy mix: POST /api/ledger (temp user) @ ${connections} connections ===`);
      allResults.push(await runWrite("POST /api/ledger", temp.cookie, connections));
      printResult(allResults[allResults.length - 1]);
    }
  } finally {
    console.log("\nCleaning up temp user and its ledger entries...");
    await deleteTempUser(admin.cookie, tempUser.id);
    console.log("Cleanup done.");
  }

  console.log("\n=== Summary (markdown table) ===");
  console.log("| Endpoint | Connections | p50 | p95 | p99 | mean | req/s | errors | non-2xx |");
  console.log("|---|---|---|---|---|---|---|---|---|");
  for (const r of allResults) {
    console.log(
      `| ${r.label} | ${r.connections} | ${r.p50}ms | ${r.p95}ms | ${r.p99}ms | ${r.mean}ms | ${r.reqPerSec} | ${r.errors} | ${r.non2xx} |`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
