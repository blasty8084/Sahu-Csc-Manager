import { pgTable, serial, text, numeric, integer, timestamp, index } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const udhariCustomersTable = pgTable(
  "udhari_customers",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    mobile: text("mobile"),
    address: text("address"),
    notes: text("notes"),
    balance: numeric("balance", { precision: 12, scale: 2 }).notNull().default("0"),
    createdBy: integer("created_by")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("idx_udhari_customers_created_by").on(t.createdBy),
    index("idx_udhari_customers_mobile").on(t.mobile),
  ]
);

export const udhariEntriesTable = pgTable(
  "udhari_entries",
  {
    id: serial("id").primaryKey(),
    customerId: integer("customer_id")
      .notNull()
      .references(() => udhariCustomersTable.id, { onDelete: "cascade" }),
    date: text("date").notNull(),
    type: text("type").notNull(), // 'gave' | 'got'
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    note: text("note").notNull().default(""),
    receiptToken: text("receipt_token"),
    createdBy: integer("created_by")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("idx_udhari_entries_customer_id").on(t.customerId),
    index("idx_udhari_entries_created_by").on(t.createdBy),
    index("idx_udhari_entries_date").on(t.date),
  ]
);
