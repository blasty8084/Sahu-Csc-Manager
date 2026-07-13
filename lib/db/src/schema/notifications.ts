import { pgTable, text, serial, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { index } from "drizzle-orm/pg-core";

export const notificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("info"),
  priority: text("priority").notNull().default("MEDIUM"),
  isRead: boolean("is_read").notNull().default(false),
  readAt: timestamp("read_at", { withTimezone: true }),
  link: text("link"),
  meta: jsonb("meta"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("idx_notifications_user_id").on(t.userId),
  index("idx_notifications_is_read").on(t.isRead),
  index("idx_notifications_user_read").on(t.userId, t.isRead),
  index("idx_notifications_created_at").on(t.createdAt),
  // Covers the primary list query: WHERE user_id = ? ORDER BY created_at DESC LIMIT n
  index("idx_notifications_user_created").on(t.userId, t.createdAt),
]);

export const insertNotificationSchema = createInsertSchema(notificationsTable).omit({ id: true, createdAt: true });
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notificationsTable.$inferSelect;
