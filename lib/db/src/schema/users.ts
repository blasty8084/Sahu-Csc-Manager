import { pgTable, text, serial, timestamp, boolean, integer, index, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  mobile: text("mobile"),
  fullName: text("full_name"),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("operator"), // admin, operator, user
  isActive: boolean("is_active").notNull().default(true),
  // V2: extended account status (ACTIVE | INACTIVE | SUSPENDED | LOCKED | DELETED)
  status: text("status").notNull().default("ACTIVE"),
  failedLoginAttempts: integer("failed_login_attempts").notNull().default(0),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
  rejectionReason: text("rejection_reason"),
  profilePicture: text("profile_picture"),  // base64 data URL (legacy / local fallback)
  avatarUrl: text("avatar_url"),            // Google Drive URL when Drive is configured
  avatarFileId: text("avatar_file_id"),     // Drive fileId for deletion
  bio: text("bio"),
  address: text("address"),
  // kept for backward-compat; V2 multi-device uses user_sessions table instead
  activeSessionToken: text("active_session_token"),
  appealSubmittedAt: timestamp("appeal_submitted_at", { withTimezone: true }),
  appealDismissedAt: timestamp("appeal_dismissed_at", { withTimezone: true }),
  // Maintained running total of ledger credits minus debits. Updated atomically
  // on every ledger create/update/delete — avoids a full SUM() scan on writes.
  ledgerBalance: numeric("ledger_balance", { precision: 15, scale: 2 }).notNull().default("0"),
  // First-time login permission overlay (notifications + file access) — shown
  // once after first successful login, then never again.
  firstLoginCompleted: boolean("first_login_completed").notNull().default(false),
  // 2FA (OTP or TOTP). totpSecret is stored AES-256-GCM encrypted via
  // lib/encryption.ts (encryptField/decryptField), never in plaintext.
  twoFaEnabled: boolean("two_fa_enabled").notNull().default(false),
  twoFaMethod: text("two_fa_method").notNull().default("otp"), // 'otp' | 'totp'
  totpSecret: text("totp_secret"),
  twoFaVerifiedAt: timestamp("two_fa_verified_at", { withTimezone: true }),
  // JSON-stringified array of bcrypt-hashed one-time backup codes.
  backupCodes: text("backup_codes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (t) => [
  index("users_role_idx").on(t.role),
  index("users_status_idx").on(t.status),
  // mobile is queried directly (eq()) on every login/OTP/reset-password lookup
  // alongside username/email — those are already indexed via their unique
  // constraints, mobile was the missing one.
  index("users_mobile_idx").on(t.mobile),
]);

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
