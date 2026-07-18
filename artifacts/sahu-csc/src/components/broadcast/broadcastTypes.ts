export const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

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
  { value: "info",     label: "Info",     color: "#0b2c60" },
  { value: "success",  label: "Success",  color: "#16a34a" },
  { value: "warning",  label: "Warning",  color: "#d97706" },
  { value: "error",    label: "Error",    color: "#dc2626" },
  { value: "system",   label: "System",   color: "#7c3aed" },
  { value: "business", label: "Business", color: "#0891b2" },
  { value: "security", label: "Security", color: "#ea580c" },
] as const;

export const NOTIF_PRIORITIES = [
  { value: "LOW",      label: "Low" },
  { value: "MEDIUM",   label: "Medium" },
  { value: "HIGH",     label: "High" },
  { value: "CRITICAL", label: "Critical" },
] as const;

export type Tab = "push" | "email" | "inapp" | "history";
