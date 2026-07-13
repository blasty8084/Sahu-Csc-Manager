import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { auditLog, getClientIp } from "../../lib/auth";
import { notifyNewRegistration } from "../../services/notificationTemplates";
import { asyncHandler } from "../../lib/async-handler";

const router: IRouter = Router();

// Simple in-memory rate limit: max 3 appeals per IP per hour
const appealRateMap = new Map<string, { count: number; resetAt: number }>();

// ─── POST /auth/appeal ────────────────────────────────────────────────────────
// Public — no auth required. Records that a declined user clicked the appeal
// contact button. Creates notifications for all admins + an audit log entry.
router.post("/auth/appeal", asyncHandler(async (req, res) => {
  const clientIp = getClientIp(req);

  const now = Date.now();
  const bucket = appealRateMap.get(clientIp);
  if (bucket && now < bucket.resetAt) {
    if (bucket.count >= 3) {
      res.status(429).json({ error: "Too many appeal requests. Please try again later." });
      return;
    }
    bucket.count += 1;
  } else {
    appealRateMap.set(clientIp, { count: 1, resetAt: now + 60 * 60 * 1000 });
  }

  const { identifier, channel } = req.body as { identifier?: string; channel?: string };
  if (!identifier || typeof identifier !== "string") {
    res.status(400).json({ error: "identifier is required" });
    return;
  }

  const [user] = await db
    .select({
      id: usersTable.id,
      username: usersTable.username,
      fullName: usersTable.fullName,
      status: usersTable.status,
      rejectionReason: usersTable.rejectionReason,
      appealDismissedAt: usersTable.appealDismissedAt,
    })
    .from(usersTable)
    .where(or(eq(usersTable.username, identifier), eq(usersTable.email, identifier)));

  if (!user || user.status !== "DELETED") {
    // Don't reveal whether the user exists — just ack
    res.json({ ok: true });
    return;
  }

  // 24-hour cooldown after a dismissal
  if (user.appealDismissedAt) {
    const cooldownMs = 24 * 60 * 60 * 1000;
    const elapsed = Date.now() - new Date(user.appealDismissedAt).getTime();
    if (elapsed < cooldownMs) {
      const hoursLeft = Math.ceil((cooldownMs - elapsed) / (60 * 60 * 1000));
      res.status(429).json({
        error: `Your previous appeal was reviewed. Please wait ${hoursLeft} hour${hoursLeft !== 1 ? "s" : ""} before submitting another appeal.`,
        cooldownHoursLeft: hoursLeft,
      });
      return;
    }
  }

  const channelLabel = channel === "whatsapp" ? "WhatsApp" : channel === "email" ? "Email" : "unknown channel";
  const displayName = user.fullName ? `${user.fullName} (@${user.username})` : `@${user.username}`;

  await db.update(usersTable).set({ appealSubmittedAt: new Date() }).where(eq(usersTable.id, user.id));

  await notifyNewRegistration(
    `Appeal: Registration declined — ${displayName}`,
    `${displayName} clicked the ${channelLabel} appeal button after their registration was declined.${user.rejectionReason ? ` Decline reason: "${user.rejectionReason}".` : ""} Review their registration in User Management.`
  );

  await auditLog(
    null,
    "appeal.submitted",
    `Declined user @${user.username} submitted an appeal via ${channelLabel} from ${clientIp}`,
    clientIp
  );

  res.json({ ok: true });
}));

export default router;
