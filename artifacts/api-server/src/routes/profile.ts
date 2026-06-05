import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";
import { requireAuth, hashPassword, auditLog, getClientIp } from "../lib/auth";

const router: IRouter = Router();

const UpdateProfileBody = z.object({
  fullName: z.string().optional(),
  email: z.email().optional(),
  mobile: z.string().optional(),
  bio: z.string().max(500).optional(),
  address: z.string().max(500).optional(),
  password: z.string().min(6).optional(),
  currentPassword: z.string().optional(),
});

const UpdateAvatarBody = z.object({
  profilePicture: z.string(), // base64 data URL (data:image/...;base64,...)
});

function fmtProfile(user: any) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    mobile: user.mobile ?? null,
    fullName: user.fullName ?? null,
    role: user.role,
    profilePicture: user.profilePicture ?? null,
    bio: user.bio ?? null,
    address: user.address ?? null,
    createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
  };
}

router.get("/profile", requireAuth, async (req, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId!));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(fmtProfile(user));
});

router.patch("/profile", requireAuth, async (req, res): Promise<void> => {
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const userId = req.session.userId!;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const { password, currentPassword, ...profileFields } = parsed.data;

  const updates: Record<string, any> = {};

  if (profileFields.fullName !== undefined) updates.fullName = profileFields.fullName;
  if (profileFields.email !== undefined) updates.email = profileFields.email;
  if (profileFields.mobile !== undefined) updates.mobile = profileFields.mobile;
  if (profileFields.bio !== undefined) updates.bio = profileFields.bio;
  if (profileFields.address !== undefined) updates.address = profileFields.address;

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

  if (Object.keys(updates).length === 0) {
    res.json(fmtProfile(user)); return;
  }

  const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, userId)).returning();
  await auditLog(userId, "profile.update", "User updated profile", getClientIp(req));
  res.json(fmtProfile(updated));
});

router.post("/profile/avatar", requireAuth, async (req, res): Promise<void> => {
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

  const [updated] = await db
    .update(usersTable)
    .set({ profilePicture: dataUrl })
    .where(eq(usersTable.id, userId))
    .returning();

  await auditLog(userId, "profile.avatar_update", "User updated profile picture", getClientIp(req));
  res.json({ profilePicture: updated.profilePicture });
});

router.delete("/profile/avatar", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  await db.update(usersTable).set({ profilePicture: null }).where(eq(usersTable.id, userId));
  await auditLog(userId, "profile.avatar_delete", "User removed profile picture", getClientIp(req));
  res.json({ message: "Profile picture removed" });
});

export default router;
