import { pgTable, serial, integer, text, timestamp, index } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const fileUploadsTable = pgTable("file_uploads", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id, { onDelete: "set null" }),
  driveFileId: text("drive_file_id").notNull(),
  url: text("url").notNull(),
  destination: text("destination").notNull(), // 'drive' | 'local'
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  folder: text("folder").notNull(),         // 'receipts' | 'profiles' | 'exports' | 'documents'
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("idx_file_uploads_user_id").on(t.userId),
  index("idx_file_uploads_folder").on(t.folder),
]);

export type FileUpload = typeof fileUploadsTable.$inferSelect;
