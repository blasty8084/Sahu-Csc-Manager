import { pgTable, serial, date, numeric, text, integer, timestamp, unique, index } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const aepsDailyTable = pgTable("aeps_daily", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  // RESTRICT: AEPS daily sessions are financial records — prevent deleting a
  // user who still owns session data.  Deactivate the user instead.
  createdBy: integer("created_by").notNull().references(() => usersTable.id, { onDelete: "restrict" }),
  openingBalance: numeric("opening_balance", { precision: 12, scale: 2 }).notNull().default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  unique("aeps_daily_date_user").on(t.date, t.createdBy),
]);

export const aepsTransactionsTable = pgTable("aeps_transactions", {
  id: serial("id").primaryKey(),
  dailyId: integer("daily_id").notNull().references(() => aepsDailyTable.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // "withdrawal" | "deposit"
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  customerName: text("customer_name").notNull(),
  description: text("description"),
  receiptToken: text("receipt_token"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("aeps_transactions_daily_id_idx").on(t.dailyId),
  index("aeps_transactions_type_idx").on(t.type),
  index("aeps_transactions_created_at_idx").on(t.createdAt),
]);
