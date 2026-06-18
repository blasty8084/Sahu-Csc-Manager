import { pgTable, integer } from "drizzle-orm/pg-core";

export const receiptCountersTable = pgTable("receipt_counters", {
  year: integer("year").primaryKey(),
  lastCount: integer("last_count").notNull().default(0),
});
