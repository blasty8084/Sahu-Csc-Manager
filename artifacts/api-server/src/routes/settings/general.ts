import { Router, type IRouter } from "express";
import { db, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateSettingsBody } from "@workspace/api-zod";
import { requireAuth, requireRole, auditLog, getClientIp } from "../../lib/auth";
import { asyncHandler } from "../../lib/async-handler";

export const DEFAULT_SETTINGS: Record<string, string> = {
  businessName: "SAHU CSC Center",
  businessAddress: "Village Road, District",
  businessMobile: "9999999999",
  businessEmail: "",
  businessWebsite: "",
  language: "en",
  theme: "light",
  currency: "INR",
  autoBackup: "false",
  backupFrequencyDays: "7",
};

export async function getAllSettings(): Promise<Record<string, string>> {
  const rows = await db.select().from(settingsTable);
  const result: Record<string, string> = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    result[row.key] = row.value;
  }
  return result;
}

export function formatSettings(s: Record<string, string>) {
  return {
    businessName: s.businessName ?? DEFAULT_SETTINGS.businessName,
    businessAddress: s.businessAddress ?? DEFAULT_SETTINGS.businessAddress,
    businessMobile: s.businessMobile ?? DEFAULT_SETTINGS.businessMobile,
    businessEmail: s.businessEmail || null,
    businessWebsite: s.businessWebsite || null,
    language: (s.language ?? "en") as "en" | "hi" | "or",
    theme: (s.theme ?? "light") as "light" | "dark",
    currency: s.currency ?? "INR",
    autoBackup: s.autoBackup === "true",
    backupFrequencyDays: parseInt(s.backupFrequencyDays ?? "7", 10),
  };
}

const router: IRouter = Router();

// Public — no auth required — returns only contact fields safe to expose pre-login
router.get("/settings/contact", asyncHandler(async (_req, res) => {
  const settings = await getAllSettings();
  res.json({
    name: settings.businessName ?? DEFAULT_SETTINGS.businessName,
    phone: settings.businessMobile || null,
    email: settings.businessEmail || null,
  });
}));

router.get("/settings", requireAuth, asyncHandler(async (_req, res) => {
  const settings = await getAllSettings();
  res.json(formatSettings(settings));
}));

router.patch("/settings", requireRole("admin"), asyncHandler(async (req, res) => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const data = parsed.data as Record<string, any>;
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;
    const strVal = String(value);
    const existing = await db.select().from(settingsTable).where(eq(settingsTable.key, key));
    if (existing.length > 0) {
      await db.update(settingsTable).set({ value: strVal }).where(eq(settingsTable.key, key));
    } else {
      await db.insert(settingsTable).values({ key, value: strVal });
    }
  }

  await auditLog(req.session.userId!, "settings.update", "Updated system settings", getClientIp(req));
  const updated = await getAllSettings();
  res.json(formatSettings(updated));
}));

export default router;
