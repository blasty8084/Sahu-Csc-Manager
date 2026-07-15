import { pgTable, serial, integer, text, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

// Security-relevant events not already covered by audit_logs' user-action
// framing: failed 2FA attempts, new-device challenges, device trust changes,
// etc. userId is nullable since some events (e.g. a 2FA attempt against an
// unknown pending session) may not resolve to a confirmed user.
export const securityLogsTable = pgTable("security_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id, { onDelete: "cascade" }),
  event: text("event").notNull(),
  ipAddress: text("ip_address"),
  deviceFingerprint: text("device_fingerprint"),
  success: boolean("success").notNull().default(false),
  details: text("details"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("idx_security_logs_user_id").on(t.userId),
  index("idx_security_logs_event").on(t.event),
  index("idx_security_logs_created_at").on(t.createdAt),
]);

export type SecurityLog = typeof securityLogsTable.$inferSelect;
