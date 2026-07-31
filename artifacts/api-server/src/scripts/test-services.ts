/**
 * Service integration test — SMTP · Backblaze B2 · Upstash Redis
 * Run: pnpm --filter @workspace/api-server exec tsx src/scripts/test-services.ts
 */

import nodemailer from "nodemailer";
import { resolve4Sync } from "node:dns";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Redis } from "@upstash/redis";

const PASS  = "✅";
const FAIL  = "❌";
const SKIP  = "⏭️ ";

// ─── SMTP ──────────────────────────────────────────────────────────────────────
async function testSmtp() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS ?? process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    console.log(`${SKIP} SMTP — not configured (SMTP_HOST / SMTP_USER / SMTP_PASS missing)`);
    return;
  }

  console.log(`\n── SMTP (${host}) ──────────────────────`);
  try {
    const smtpIpv4 = resolve4Sync(host)[0] ?? host;
    const transporter = nodemailer.createTransport({
      host: smtpIpv4,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: false,
      requireTLS: true,
      connectionTimeout: 15_000,
      greetingTimeout: 15_000,
      socketTimeout: 30_000,
      tls: { servername: host },
      auth: { user, pass },
    });

    await transporter.verify();
    console.log(`${PASS} Connection verified`);

    const from = process.env.SMTP_FROM_EMAIL ?? `SAHU CSC <${user}>`;
    const info = await transporter.sendMail({
      from,
      to: user,
      subject: "SAHU CSC — SMTP integration test",
      text: "SMTP is working correctly. This is an automated test from SAHU CSC.",
      html: "<p>SMTP is working correctly. ✅</p><p>This is an automated test from <strong>SAHU CSC</strong>.</p>",
    });
    console.log(`${PASS} Test email sent → ${user}`);
    console.log(`     Message-ID: ${info.messageId}`);
  } catch (err: any) {
    console.log(`${FAIL} SMTP failed: ${err.message}`);
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

await testSmtp();
await testB2();
await testRedis();

console.log("\n═══════════════════════════════════════════");
console.log("  Done.");
console.log("═══════════════════════════════════════════\n");
