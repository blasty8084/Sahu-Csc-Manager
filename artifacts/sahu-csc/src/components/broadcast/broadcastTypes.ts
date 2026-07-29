import { getApiBase } from "@/lib/api-base";
export const BASE = getApiBase();

export interface BroadcastStats {
  pushSubscribers: number;
  usersWithEmail: number;
  activeUsers: number;
  smtpConfigured: boolean;
}

export interface BroadcastLogEntry {
  id: number;
  sentBy: number;
  channel: string;
  subject: string;
  body: string;
  recipientFilter: string | null;
  recipientCount: number;
  failedCount: number;
  createdAt: string;
  senderUsername: string | null;
  senderFullName: string | null;
}

export interface HistoryResponse {
  logs: BroadcastLogEntry[];
  total: number;
  page: number;
  limit: number;
}

export const NOTIF_TYPES = [
  { value: "info",     label: "Info",     color: "var(--brand-navy-800)" },
  { value: "success",  label: "Success",  color: "var(--color-success-dim)" },
  { value: "warning",  label: "Warning",  color: "var(--color-warning)" },
  { value: "error",    label: "Error",    color: "var(--color-error-dim)" },
  { value: "system",   label: "System",   color: "var(--color-violet)" },
  { value: "business", label: "Business", color: "var(--color-sky)" },
  { value: "security", label: "Security", color: "var(--brand-orange-600)" },
] as const;

export const NOTIF_PRIORITIES = [
  { value: "LOW",      label: "Low" },
  { value: "MEDIUM",   label: "Medium" },
  { value: "HIGH",     label: "High" },
  { value: "CRITICAL", label: "Critical" },
] as const;

export type Tab = "push" | "email" | "inapp" | "history";
