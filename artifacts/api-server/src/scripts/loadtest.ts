// Load test for the heaviest read endpoints (dashboard summary, admin
// users-overview). Run with: pnpm --filter @workspace/api-server run loadtest
//
// Requires the API Server workflow already running and a seeded admin
// session cookie (pass via ADMIN_COOKIE env var, e.g. copy from browser
// devtools after logging in as admin). Without a cookie, requests will
// 401 and autocannon will just measure auth-rejection latency, which is
// still useful as a baseline but not the real numbers to report.
import autocannon from "autocannon";

const BASE_URL = process.env.LOADTEST_URL ?? "http://127.0.0.1:8080";
const COOKIE = process.env.ADMIN_COOKIE ?? "";
const DURATION_S = Number(process.env.LOADTEST_DURATION ?? 15);
const CONNECTIONS = Number(process.env.LOADTEST_CONNECTIONS ?? 20);

async function run(name: string, path: string) {
  console.log(`\n=== ${name} (${CONNECTIONS} conns, ${DURATION_S}s) ===`);
  const result = await autocannon({
    url: `${BASE_URL}${path}`,
    connections: CONNECTIONS,
    duration: DURATION_S,
    headers: COOKIE ? { cookie: COOKIE } : undefined,
  });
  const statusCounts = result as unknown as Record<string, number>;
  console.log(
    `p50=${result.latency.p50}ms p95=${result.latency.p97_5}ms p99=${result.latency.p99}ms ` +
      `mean=${result.latency.mean}ms req/s=${result.requests.mean} errors=${result.errors} 2xx=${statusCounts["200"] ?? 0} 4xx/5xx=${result.non2xx}`,
  );
  return result;
}

async function main() {
  await run("GET /api/dashboard", "/api/dashboard");
  await run("GET /api/admin/users-overview", "/api/admin/users-overview");
  await run("GET /healthz", "/healthz");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
