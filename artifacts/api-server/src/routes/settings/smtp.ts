/**
 * SMTP settings — removed. Email sending is no longer supported.
 * These endpoints return appropriate responses so existing frontend
 * code doesn't crash.
 */
import { Router, type IRouter } from "express";
import { requireRole } from "../../lib/auth";
import { asyncHandler } from "../../lib/async-handler";

const router: IRouter = Router();

router.get("/settings/smtp", requireRole("admin"), asyncHandler(async (_req, res) => {
  res.json({
    configured: false,
    host: null,
    port: 587,
    user: null,
    fromEmail: null,
    passwordSaved: false,
  });
}));

router.patch("/settings/smtp", requireRole("admin"), asyncHandler(async (_req, res) => {
  res.status(501).json({ error: "Email/SMTP support has been removed from this installation." });
}));

router.post("/settings/smtp/test", requireRole("admin"), asyncHandler(async (_req, res) => {
  res.status(501).json({ error: "Email/SMTP support has been removed from this installation." });
}));

export default router;
