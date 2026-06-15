import { pgTable, serial, integer, text, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const userSessionsTable = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  sessionId: text("session_id").notNull().unique(),
  deviceInfo: text("device_info"),
  browser: text("browser"),
  os: text("os"),
  ipAddress: text("ip_address"),
  isActive: boolean("is_active").notNull().default(true),
  rememberMe: boolean("remember_me").notNull().default(false),
  lastActivity: timestamp("last_activity", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("idx_user_sessions_user_id").on(t.userId),
  index("idx_user_sessions_active_expires").on(t.isActive, t.expiresAt),
  index("idx_user_sessions_user_active").on(t.userId, t.isActive),
]);

export type UserSession = typeof userSessionsTable.$inferSelect;
