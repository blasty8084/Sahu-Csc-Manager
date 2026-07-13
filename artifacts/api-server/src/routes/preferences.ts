import { Router, type IRouter } from "express";
import { db, userPreferencesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";
import { requireAuth, auditLog, getClientIp } from "../lib/auth";
import { asyncHandler } from "../lib/async-handler";

const router: IRouter = Router();

const UpdatePreferencesBody = z.object({
  theme: z.enum(["light", "dark"]).optional(),
  language: z.enum(["en", "hi", "or"]).optional(),
  dashboardLayout: z.string().optional(),
});

const DEFAULT_PREFS = {
  theme: "light" as const,
  language: "en" as const,
  dashboardLayout: "default",
};

async function getOrCreatePrefs(userId: number) {
  const [existing] = await db.select().from(userPreferencesTable).where(eq(userPreferencesTable.userId, userId));
  if (existing) return existing;
  const [created] = await db.insert(userPreferencesTable).values({ userId, ...DEFAULT_PREFS }).returning();
  return created;
}

function fmtPrefs(p: any) {
  return {
    theme: p.theme as "light" | "dark",
    language: p.language as "en" | "hi" | "or",
    dashboardLayout: p.dashboardLayout,
    updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : p.updatedAt,
  };
}

router.get("/preferences", requireAuth, asyncHandler(async (req, res) => {
  const prefs = await getOrCreatePrefs(req.session.userId!);
  res.json(fmtPrefs(prefs));
}));

router.patch("/preferences", requireAuth, asyncHandler(async (req, res) => {
  const parsed = UpdatePreferencesBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const userId = req.session.userId!;
  const existing = await getOrCreatePrefs(userId);

  const updates: Record<string, any> = {};
  if (parsed.data.theme !== undefined) updates.theme = parsed.data.theme;
  if (parsed.data.language !== undefined) updates.language = parsed.data.language;
  if (parsed.data.dashboardLayout !== undefined) updates.dashboardLayout = parsed.data.dashboardLayout;

  const [updated] = await db
    .update(userPreferencesTable)
    .set(updates)
    .where(eq(userPreferencesTable.id, existing.id))
    .returning();

  await auditLog(userId, "preferences.update", "User updated preferences", getClientIp(req));
  res.json(fmtPrefs(updated));
}));

export default router;
