import { pgTable, text, serial, timestamp, integer, index } from "drizzle-orm/pg-core";

export const broadcastLogsTable = pgTable("broadcast_logs", {
  id: serial("id").primaryKey(),
  sentBy: integer("sent_by").notNull(),
  channel: text("channel").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  recipientFilter: text("recipient_filter"),
  recipientCount: integer("recipient_count").notNull().default(0),
  failedCount: integer("failed_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("idx_broadcast_logs_sent_by").on(t.sentBy),
  index("idx_broadcast_logs_channel").on(t.channel),
  index("idx_broadcast_logs_created_at").on(t.createdAt),
]);

export type BroadcastLog = typeof broadcastLogsTable.$inferSelect;
