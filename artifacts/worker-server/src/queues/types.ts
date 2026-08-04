// ── Shared job-data types ─────────────────────────────────────────────────────
// Keep in sync with artifacts/api-server/src/lib/queue-client.ts

// Push-notification queue
export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: Array<{ action: string; title: string }>;
}

export type NotificationJobData =
  | { kind: "send-to-user"; userId: number; payload: PushPayload }
  | { kind: "send-to-all"; payload: PushPayload };

// PDF-generation queue (receipt PDFs via PDFKit)
export interface PdfJobData {
  receiptId: string;
  userId: number;
  timestamp: number;
}

// SMS queue (stub — no SMS provider configured yet)
export interface SmsJobData {
  mobile: string;
  message: string;
}
