import { pgTable, serial, text, integer, timestamp, index } from "drizzle-orm/pg-core";

export const pushSubscriptionsTable = pgTable("push_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("push_subscriptions_user_id_idx").on(t.userId),
]);

export type PushSubscriptionRow = typeof pushSubscriptionsTable.$inferSelect;
export type NewPushSubscriptionRow = typeof pushSubscriptionsTable.$inferInsert;
