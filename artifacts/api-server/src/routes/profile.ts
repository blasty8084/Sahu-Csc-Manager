import { Router, type IRouter } from "express";
import { db, usersTable, userSessionsTable } from "@workspace/db";
import { eq, and, not } from "drizzle-orm";
import { z } from "zod/v4";
import sharp from "sharp";
import { requireAuth, hashPassword, auditLog, getClientIp } from "../lib/auth";
import { invalidateSessionCache, invalidateUserCache } from "../lib/auth/sessionCache";
import { encryptField, decryptField } from "../lib/encryption";
import { sanitize } from "../lib/sanitize";
import { passwordPolicySchema } from "../lib/password-policy";
import { asyncHandler } from "../lib/async-handler";

const router: IRouter = Router();

const UpdateProfileBody = z.object({
  fullName: z.string().optional(),
  email: z.email().optional(),
  mobile: z.string().optional(),
  bio: z.string().max(500).optional(),
  address: z.string().max(500).optional(),
  password: passwordPolicySchema.optional(),
  currentPassword: z.string().optional(),
});

const UpdateAvatarBody = z.object({
  profilePicture: z.string(), // base64 data URL (data:image/...;base64,...)
});

async function fmtProfile(user: any) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    mobile: user.mobile ?? null,
    fullName: user.fullName ?? null,
    role: user.role,
    profilePicture: user.profilePicture ?? null,
    bio: await decryptField(user.bio),
    address: await decryptField(user.address),
    createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
  };
}

router.get("/profile", requireAuth, asyncHandler(async (req, res) => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId!));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(await fmtProfile(user));
}));

router.patch("/profile", requireAuth, asyncHandler(async (req, res) => {
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const userId = req.session.userId!;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const { password, currentPassword, ...profileFields } = parsed.data;

  const updates: Record<string, any> = {};

  if (profileFields.fullName !== undefined) updates.fullName = sanitize(profileFields.fullName);
  if (profileFields.email !== undefined) updates.email = profileFields.email;
  if (profileFields.mobile !== undefined) updates.mobile = sanitize(profileFields.mobile);
  if (profileFields.bio !== undefined) updates.bio = await encryptField(sanitize(profileFields.bio));
  if (profileFields.address !== undefined) updates.address = await encryptField(sanitize(profileFields.address));

  if (password) {
    if (!currentPassword) {
      res.status(400).json({ error: "Current password is required to change password" }); return;
    }
    const { comparePassword } = await import("../lib/auth");
    const valid = await comparePassword(currentPassword, user.passwordHash);
    if (!valid) {
      res.status(400).json({ error: "Current password is incorrect" }); return;
    }
    updates.passwordHash = await hashPassword(password);
    await auditLog(userId, "profile.password_change", "User changed password", getClientIp(req));
  }

  const passwordChanged = !!updates.passwordHash;

  if (Object.keys(updates).length === 0) {
    res.json(await fmtProfile(user)); return;
  }

  const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, userId)).returning();

  if (passwordChanged) {
    // Revoke every other active session (keep the one making this request
    // alive) so a stolen session can't outlive a password change, then drop
    // the cached role entry so this takes effect immediately.
    const currentSessionId = req.session.sessionId ?? req.session.sessionToken ?? "";
    const revoked = await db
      .update(userSessionsTable)
      .set({ isActive: false })
      .where(
        and(
          eq(userSessionsTable.userId, userId),
          not(eq(userSessionsTable.sessionId, currentSessionId))
        )
      )
      .returning({ sessionId: userSessionsTable.sessionId });
    await Promise.all(revoked.map((r) => invalidateSessionCache(r.sessionId)));
    await invalidateUserCache(userId);
  }

  await auditLog(userId, "profile.update", "User updated profile", getClientIp(req));
  res.json(await fmtProfile(updated));
}));

// Avatars are resized down to a small square and re-encoded as WebP before
// storage — uploads from a phone camera can be several MB; nothing here is
// ever displayed larger than a ~128px thumbnail, so storing the original
// bloats the DB row and slows every profile fetch/render for no benefit.
const AVATAR_MAX_DIMENSION = 512;
const AVATAR_WEBP_QUALITY = 80;

router.post("/profile/avatar", requireAuth, asyncHandler(async (req, res) => {
  const parsed = UpdateAvatarBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const userId = req.session.userId!;

  // Validate it's a proper image data URL
  const dataUrl = parsed.data.profilePicture;
  if (!dataUrl.startsWith("data:image/")) {
    res.status(400).json({ error: "Invalid image format. Must be a base64 data URL." }); return;
  }

  // Limit size to ~5MB (base64 is ~1.33x original, so 5MB image ≈ 6.7MB base64)
  if (dataUrl.length > 7_000_000) {
    res.status(400).json({ error: "Image too large. Maximum size is 5MB." }); return;
  }

  const base64Payload = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const inputBuffer = Buffer.from(base64Payload, "base64");

  let compressedDataUrl: string;
  try {
    const outputBuffer = await sharp(inputBuffer)
      .rotate() // honor EXIF orientation before stripping it below
      .resize(AVATAR_MAX_DIMENSION, AVATAR_MAX_DIMENSION, { fit: "cover", withoutEnlargement: true })
      .webp({ quality: AVATAR_WEBP_QUALITY })
      .toBuffer();
    compressedDataUrl = `data:image/webp;base64,${outputBuffer.toString("base64")}`;
  } catch {
    res.status(400).json({ error: "Could not process image. Please upload a valid image file." }); return;
  }

  const [updated] = await db
    .update(usersTable)
    .set({ profilePicture: compressedDataUrl })
    .where(eq(usersTable.id, userId))
    .returning();

  await auditLog(userId, "profile.avatar_update", "User updated profile picture", getClientIp(req));
  res.json({ profilePicture: updated.profilePicture });
}));

router.delete("/profile/avatar", requireAuth, asyncHandler(async (req, res) => {
  const userId = req.session.userId!;
  await db.update(usersTable).set({ profilePicture: null }).where(eq(usersTable.id, userId));
  await auditLog(userId, "profile.avatar_delete", "User removed profile picture", getClientIp(req));
  res.json({ message: "Profile picture removed" });
}));

export default router;
