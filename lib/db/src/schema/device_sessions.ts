import { pgTable, serial, integer, text, timestamp, boolean, index, unique } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

// Tracks known browser/device fingerprints per user for the single-device
// login enforcement + "trust this device for 30 days" flow. Separate from
// user_sessions (which tracks the currently *active* express-session), since
// a device can be "known/trusted" even when there's no active session for it.
export const deviceSessionsTable = pgTable("device_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  // The user_sessions.sessionId created the last time this device logged in.
  sessionId: text("session_id"),
  deviceName: text("device_name"),
  deviceFingerprint: text("device_fingerprint").notNull(),
  ipAddress: text("ip_address"),
  lastActive: timestamp("last_active", { withTimezone: true }).notNull().defaultNow(),
  isTrusted: boolean("is_trusted").notNull().default(false),
  trustedUntil: timestamp("trusted_until", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("idx_device_sessions_user_id").on(t.userId),
  unique("uq_device_sessions_user_fingerprint").on(t.userId, t.deviceFingerprint),
]);

export type DeviceSession = typeof deviceSessionsTable.$inferSelect;
