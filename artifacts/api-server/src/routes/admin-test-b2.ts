/**
 * GET /admin/test-b2
 * Admin-only endpoint — uploads a tiny test file to B2, downloads it,
 * verifies content, then deletes it. Returns JSON with pass/fail per step.
 *
 * Usage on Render (after deploy):
 *   curl -u admin:<password> https://<render-url>/api/admin/test-b2
 *   — OR — login to the app as admin and call from browser devtools:
 *   fetch('/api/admin/test-b2').then(r=>r.json()).then(console.log)
 */

import { Router } from "express";
import { requireRole } from "../lib/auth";
import { asyncHandler } from "../lib/async-handler";
import {
  b2Client,
  B2_BUCKET,
  isB2Configured,
} from "../lib/b2";
import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const router = Router();

router.get(
  "/admin/test-b2",
  requireRole("admin"),
  asyncHandler(async (_req, res) => {
    // ── Not configured ───────────────────────────────────────────────────────
    if (!isB2Configured() || !b2Client) {
      res.status(503).json({
        configured: false,
        message:
          "B2 not configured — set B2_KEY_ID, B2_APP_KEY, B2_BUCKET_ENDPOINT, B2_BUCKET_NAME in Render Environment",
        steps: [],
      });
      return;
    }

    const testKey = `test/sahu-csc-b2-test-${Date.now()}.txt`;
    const testBody = `SAHU CSC B2 integration test — ${new Date().toISOString()}`;

    const steps: { step: string; ok: boolean; detail?: string }[] = [];

    // ── Step 1: Upload ────────────────────────────────────────────────────────
    try {
      await b2Client.send(
        new PutObjectCommand({
          Bucket: B2_BUCKET,
          Key: testKey,
          Body: testBody,
          ContentType: "text/plain",
        }),
      );
      steps.push({ step: "upload", ok: true, detail: `Uploaded: ${testKey}` });
    } catch (err: any) {
      steps.push({ step: "upload", ok: false, detail: err.message });
      res.status(500).json({ configured: true, passed: false, steps });
      return;
    }

    // ── Step 2: Download & verify ─────────────────────────────────────────────
    try {
      const getRes = await b2Client.send(
        new GetObjectCommand({ Bucket: B2_BUCKET, Key: testKey }),
      );
      const downloaded = await (getRes.Body as any).transformToString();
      if (downloaded === testBody) {
        steps.push({ step: "download_verify", ok: true, detail: "Content matches ✓" });
      } else {
        steps.push({
          step: "download_verify",
          ok: false,
          detail: `Content mismatch — expected "${testBody}", got "${downloaded}"`,
        });
      }
    } catch (err: any) {
      steps.push({ step: "download_verify", ok: false, detail: err.message });
    }

    // ── Step 3: Delete (cleanup) ──────────────────────────────────────────────
    try {
      await b2Client.send(
        new DeleteObjectCommand({ Bucket: B2_BUCKET, Key: testKey }),
      );
      steps.push({ step: "delete_cleanup", ok: true, detail: "Test file deleted ✓" });
    } catch (err: any) {
      steps.push({ step: "delete_cleanup", ok: false, detail: err.message });
    }

    const allPassed = steps.every((s) => s.ok);

    res.json({
      configured: true,
      passed: allPassed,
      bucket: B2_BUCKET,
      testKey,
      steps,
      message: allPassed
        ? "✅ B2 is fully working — upload, download, and delete all succeeded"
        : "❌ Some steps failed — check the steps array for details",
    });
  }),
);

export default router;
