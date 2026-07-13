import { pgTable, integer, primaryKey, index } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const receiptCountersTable = pgTable("receipt_counters", {
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  year: integer("year").notNull(),
  lastCount: integer("last_count").notNull().default(0),
}, (t) => [
  primaryKey({ columns: [t.userId, t.year] }),
  index("idx_rc_user_id").on(t.userId),
]);
