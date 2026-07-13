import { index, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const emailOtpsTable = pgTable(
  "email_otps",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    purpose: text("purpose").notNull(),
    otpHash: text("otp_hash").notNull(),
    verifiedToken: text("verified_token").unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    ipAddress: text("ip_address"),
    failedAttempts: integer("failed_attempts").notNull().default(0),
  },
  (t) => [
    index("idx_email_otps_email_purpose_created").on(t.email, t.purpose, t.createdAt),
    index("idx_email_otps_expires_at").on(t.expiresAt),
  ],
);

export type EmailOtp = typeof emailOtpsTable.$inferSelect;
