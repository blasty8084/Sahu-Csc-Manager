/**
 * Service integration test — Resend · Backblaze B2 · Upstash Redis
 * Run: pnpm --filter @workspace/api-server exec tsx src/scripts/test-services.ts
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Redis } from "@upstash/redis";

const PASS  = "✅";
const FAIL  = "❌";
const SKIP  = "⏭️ ";

// ─── Resend ────────────────────────────────────────────────────────────────────
async function testResend() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(`${SKIP} Resend — not configured (RESEND_API_KEY missing)`);
    return;
  }

  console.log(`\n── Resend Email ─────────────────────────`);
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const from  = process.env.RESEND_FROM ?? "SAHU CSC <onboarding@resend.dev>";
    const to    = process.env.ADMIN_EMAIL ?? "";

    if (!to) {
      console.log(`${SKIP} Resend — no recipient (set ADMIN_EMAIL)`);
      return;
    }

    const { error } = await resend.emails.send({
      from,
      to: [to],
      subject: "SAHU CSC — Resend integration test",
      text: "Resend is working correctly. This is an automated test from SAHU CSC.",
      html: "<p>✅ Resend is working correctly.</p><p>This is an automated test from <strong>SAHU CSC</strong>.</p>",
    });

    if (error) throw new Error(error.message);
    console.log(`${PASS} Test email sent → ${to}`);
    console.log(`     From: ${from}`);
  } catch (err: any) {
    console.log(`${FAIL} Resend failed: ${err.message}`);
  }
}

// ─── Backblaze B2 ──────────────────────────────────────────────────────────────
async function testB2() {
  const keyId    = process.env.B2_KEY_ID;
  const appKey   = process.env.B2_APP_KEY;
  const bucket   = process.env.B2_BUCKET_NAME;
  const endpoint = process.env.B2_BUCKET_ENDPOINT;

  if (!keyId || !appKey || !bucket || !endpoint) {
    console.log(`${SKIP} B2 — not configured (B2_KEY_ID / B2_APP_KEY / B2_BUCKET_NAME / B2_BUCKET_ENDPOINT missing)`);
    return;
  }

  // Normalise: accept plain hostname or full URL — always produce https://
  const normEndpoint = endpoint.startsWith("http") ? endpoint : `https://${endpoint}`;

  console.log(`\n── Backblaze B2 (bucket: ${bucket}) ─────`);
  const client = new S3Client({
    endpoint: normEndpoint,
    region: "auto",
    credentials: { accessKeyId: keyId, secretAccessKey: appKey },
  });

  const testKey  = `test/sahu-csc-integration-test-${Date.now()}.txt`;
  const testBody = `SAHU CSC B2 integration test — ${new Date().toISOString()}`;

  try {
    // Upload
    await client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: testKey,
      Body: testBody,
      ContentType: "text/plain",
    }));
    console.log(`${PASS} Upload succeeded (${testKey})`);

    // Download & verify
    const getRes = await client.send(new GetObjectCommand({ Bucket: bucket, Key: testKey }));
    const bodyText = await getRes.Body!.transformToString();
    if (bodyText === testBody) {
      console.log(`${PASS} Download + content verified`);
    } else {
      console.log(`${FAIL} Content mismatch:\n  expected: ${testBody}\n  got:      ${bodyText}`);
    }

    // Delete
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: testKey }));
    console.log(`${PASS} Cleanup (test file deleted)`);
  } catch (err: any) {
    console.log(`${FAIL} B2 failed: ${err.message}`);
  }
}

// ─── Upstash Redis ─────────────────────────────────────────────────────────────
async function testRedis() {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.log(`${SKIP} Redis — not configured (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN missing)`);
    return;
  }

  console.log(`\n── Upstash Redis ────────────────────────`);
  const redis = new Redis({ url, token });
  const testKey = `sahu-csc:test:${Date.now()}`;

  try {
    // SET
    await redis.set(testKey, "integration-test-value", { ex: 60 });
    console.log(`${PASS} SET succeeded`);

    // GET
    const val = await redis.get<string>(testKey);
    if (val === "integration-test-value") {
      console.log(`${PASS} GET value verified`);
    } else {
      console.log(`${FAIL} Value mismatch: expected 'integration-test-value', got '${val}'`);
    }

    // TTL
    const ttl = await redis.ttl(testKey);
    console.log(`${PASS} TTL = ${ttl}s (expected ≤60)`);

    // DELETE
    await redis.del(testKey);
    console.log(`${PASS} DEL succeeded`);

    // Also test the rate-limiter sendCommand bridge
    const bridgeRes = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(["PING"]),
    });
    const pong = (await bridgeRes.json()) as { result: string };
    if (pong.result === "PONG") {
      console.log(`${PASS} Rate-limiter REST bridge works (PING → PONG)`);
    } else {
      console.log(`${FAIL} REST bridge unexpected response: ${JSON.stringify(pong)}`);
    }
  } catch (err: any) {
    console.log(`${FAIL} Redis failed: ${err.message}`);
  }
}

// ─── Run ───────────────────────────────────────────────────────────────────────
console.log("═══════════════════════════════════════════");
console.log("  SAHU CSC — Integration Service Tests");
console.log("═══════════════════════════════════════════");

await testResend();
await testB2();
await testRedis();

console.log("\n═══════════════════════════════════════════");
console.log("  Done.");
console.log("═══════════════════════════════════════════\n");
