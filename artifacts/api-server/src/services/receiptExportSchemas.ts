import { z } from "zod";

// ISO calendar date (YYYY-MM-DD).  Zod's z.string().date() validates the
// format AND the calendar value (e.g. 2025-02-30 is rejected).
const isoDate = z.string().date();

export const bulkExportQuerySchema = z
  .object({
    startDate: isoDate,
    endDate: isoDate,
    // Optional positive integer operator filter.
    userId: z
      .string()
      .regex(/^\d+$/, "userId must be a positive integer")
      .transform(Number)
      .refine((n) => n > 0, "userId must be a positive integer")
      .optional(),
    // Optional comma-separated receipt numbers — sanity-checked format only.
    receiptNumbers: z
      .string()
      .regex(/^[A-Za-z0-9,\-]+$/, "receiptNumbers contains invalid characters")
      .optional(),
  })
  .refine((d) => d.startDate <= d.endDate, {
    message: "startDate must be on or before endDate",
    path: ["startDate"],
  })
  .refine(
    (d) => {
      const diffMs = new Date(d.endDate).getTime() - new Date(d.startDate).getTime();
      return diffMs <= 90 * 24 * 60 * 60 * 1000;
    },
    { message: "Date range cannot exceed 90 days per export", path: ["endDate"] }
  );

export const monthlyDownloadQuerySchema = z.object({
  year: z
    .string()
    .regex(/^\d{4}$/, "year must be a 4-digit number")
    .transform(Number)
    .optional(),
  month: z
    .string()
    .regex(/^\d{1,2}$/, "month must be 1-12")
    .transform(Number)
    .refine((n) => n >= 1 && n <= 12, "month must be 1-12")
    .optional(),
});

export const monthlyTriggerBodySchema = z.object({
  year: z.number().int().min(2000).max(2100).optional(),
  month: z.number().int().min(1).max(12).optional(),
});

export type BulkExportQuery = z.infer<typeof bulkExportQuerySchema>;
export type MonthlyDownloadQuery = z.infer<typeof monthlyDownloadQuerySchema>;
export type MonthlyTriggerBody = z.infer<typeof monthlyTriggerBodySchema>;
