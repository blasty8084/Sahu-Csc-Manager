import { pgTable, text, serial, timestamp, boolean, integer, index } from "drizzle-orm/pg-core";
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
  profilePicture: text("profile_picture"),
  bio: text("bio"),
  address: text("address"),
  // kept for backward-compat; V2 multi-device uses user_sessions table instead
  activeSessionToken: text("active_session_token"),
  appealSubmittedAt: timestamp("appeal_submitted_at", { withTimezone: true }),
  appealDismissedAt: timestamp("appeal_dismissed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (t) => [
  index("users_role_idx").on(t.role),
  index("users_status_idx").on(t.status),
]);

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
