/**
 * First-boot initialisation — runs automatically on every server start.
 *
 * - Safe to run repeatedly: all inserts use onConflictDoUpdate / onConflictDoNothing.
 * - Skips seeding silently if ADMIN_PASSWORD / OPERATOR_PASSWORD are not set.
 * - On Render free tier (no SSH), this is the only way to create the initial
 *   admin and operator accounts without a manual shell command.
 */

import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { db, usersTable, settingsTable } from "@workspace/db";
import { logger } from "./logger";

export async function runStartupInit(): Promise<void> {
  try {
    await seedDefaultUsers();
  } catch (err) {
    // Log but never crash the server — a DB hiccup at boot should not prevent startup.
    logger.warn({ err }, "startup-init: seeding skipped due to error");
  }
}

async function seedDefaultUsers(): Promise<void> {
  const adminPassword    = process.env["ADMIN_PASSWORD"];
  const operatorPassword = process.env["OPERATOR_PASSWORD"];

  if (!adminPassword || !operatorPassword) {
    // Silently skip — passwords not configured (dev / test environment).
    return;
  }

  // Check whether any admin already exists so we avoid noisy upserts on every boot.
  const [{ adminCount }] = await db
    .select({ adminCount: sql<number>`count(*)::int` })
    .from(usersTable)
    .where(eq(usersTable.role, "admin"));

  const alreadySeeded = (adminCount ?? 0) > 0;

  if (alreadySeeded) {
    // Admins exist — check the settings table for whether we've already seeded
    // on this instance so we don't hash passwords on every cold start.
    const [row] = await db
      .select({ value: settingsTable.value })
      .from(settingsTable)
      .where(eq(settingsTable.key, "startupSeedDone"));
    if (row) return; // already seeded and flagged
  }

  logger.info(
    alreadySeeded
      ? "startup-init: re-seeding admin/operator passwords from env vars"
      : "startup-init: first boot — creating admin and operator accounts",
  );

  const adminEmail     = process.env["ADMIN_EMAIL"]    ?? process.env["RESEND_FROM"]?.match(/<([^>]+)>/)?.[1] ?? "admin@example.com";
  const adminMobile    = process.env["ADMIN_MOBILE"]   ?? "0000000000";
  const operatorEmail  = process.env["OPERATOR_EMAIL"] ?? "operator@example.com";
  const operatorMobile = process.env["OPERATOR_MOBILE"] ?? "0000000001";

  const [adminHash, opHash] = await Promise.all([
    bcrypt.hash(adminPassword, 12),
    bcrypt.hash(operatorPassword, 12),
  ]);

  // Admin
  await db
    .insert(usersTable)
    .values({
      username: "admin",
      email: adminEmail,
      mobile: adminMobile,
      fullName: "SAHU Admin",
      passwordHash: adminHash,
      role: "admin",
      isActive: true,
    })
    .onConflictDoUpdate({
      target: usersTable.username,
      set: {
        passwordHash: adminHash,
        isActive: true,
        updatedAt: new Date(),
      },
    });

  // Operator — only insert if the operator username doesn't exist yet.
  // On existing DBs we skip email/mobile changes to avoid unique-constraint
  // conflicts with whatever the existing operator record already has.
  const [existingOp] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.username, "operator"));

  if (existingOp) {
    // Just reset the password
    await db
      .update(usersTable)
      .set({ passwordHash: opHash, updatedAt: new Date() })
      .where(eq(usersTable.username, "operator"));
  } else {
    await db.insert(usersTable).values({
      username: "operator",
      email: operatorEmail,
      mobile: operatorMobile,
      fullName: "CSC Operator",
      passwordHash: opHash,
      role: "operator",
      isActive: true,
    });
  }

  // Persist a flag so subsequent boots skip the bcrypt hashing
  await db
    .insert(settingsTable)
    .values({ key: "startupSeedDone", value: "1" })
    .onConflictDoUpdate({
      target: settingsTable.key,
      set: { value: "1", updatedAt: new Date() },
    });

  logger.info("startup-init: admin and operator accounts ready");
}
