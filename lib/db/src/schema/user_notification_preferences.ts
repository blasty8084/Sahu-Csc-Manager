import { pgTable, serial, integer, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const userNotificationPreferencesTable = pgTable("user_notification_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  enabled: boolean("enabled").notNull().default(true),
  securityAlerts: boolean("security_alerts").notNull().default(true),
  businessAlerts: boolean("business_alerts").notNull().default(true),
  systemAlerts: boolean("system_alerts").notNull().default(true),
  infoAlerts: boolean("info_alerts").notNull().default(true),
  pushEnabled: boolean("push_enabled").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (t) => [
  index("idx_notif_prefs_user_id").on(t.userId),
]);

export type UserNotificationPreferences = typeof userNotificationPreferencesTable.$inferSelect;
