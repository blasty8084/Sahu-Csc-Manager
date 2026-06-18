import { pgTable, text, serial, timestamp, integer, numeric, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ledgerTable = pgTable("ledger", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(), // ISO date string YYYY-MM-DD
  customerName: text("customer_name").notNull(),
  serviceType: text("service_type").notNull(),
  credit: numeric("credit", { precision: 12, scale: 2 }).notNull().default("0"),
  debit: numeric("debit", { precision: 12, scale: 2 }).notNull().default("0"),
  description: text("description").notNull().default(""),
  balance: numeric("balance", { precision: 12, scale: 2 }).notNull().default("0"),
  createdBy: integer("created_by").notNull(),
  receiptNumber: text("receipt_number").unique(),
  receiptToken: text("receipt_token").unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (t) => [
  index("idx_ledger_created_by").on(t.createdBy),
  index("idx_ledger_date").on(t.date),
  index("idx_ledger_created_by_date").on(t.createdBy, t.date),
  index("idx_ledger_service_type").on(t.serviceType),
]);

export const insertLedgerSchema = createInsertSchema(ledgerTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertLedger = z.infer<typeof insertLedgerSchema>;
export type LedgerEntry = typeof ledgerTable.$inferSelect;
