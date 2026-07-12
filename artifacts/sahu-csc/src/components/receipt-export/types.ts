// ── Brand tokens ──────────────────────────────────────────────────────────────
export const NAVY    = "#0b2c60";
export const SAFFRON = "#f97316";

export const MONTH_OPTIONS = [
  { v: 1,  l: "January" },  { v: 2,  l: "February" }, { v: 3,  l: "March" },
  { v: 4,  l: "April" },    { v: 5,  l: "May" },       { v: 6,  l: "June" },
  { v: 7,  l: "July" },     { v: 8,  l: "August" },    { v: 9,  l: "September" },
  { v: 10, l: "October" },  { v: 11, l: "November" },  { v: 12, l: "December" },
];

// ── Types ─────────────────────────────────────────────────────────────────────
export interface PreviewEntry {
  receiptNumber: string;
  date: string;
  customerName: string;
  serviceType: string;
  amount: number;
  type: "credit" | "debit";
  operator: string | null;
}

export interface CountResult {
  count: number;
  entries: PreviewEntry[];
}

export interface FullReceiptEntry {
  id: number;
  date: string;
  customerName: string;
  serviceType: string;
  credit: number;
  debit: number;
  description: string | null;
  balance: number;
  receiptNumber: string | null;
  receiptToken: string | null;
  createdByName: string | null;
  createdAt: string;
}

export interface BusinessInfo {
  businessName: string;
  businessAddress: string;
  businessMobile: string;
  businessWebsite: string;
}

export type ModalAction = "print" | "download" | "share" | "whatsapp" | null;
export type MobileTab   = "receipts" | "byDate" | "summary" | "export";

export interface UserOverview {
  userId: number;
  username: string;
  fullName: string | null;
  role: string;
  isActive: boolean;
  balance: number;
  totalCredits: number;
  totalDebits: number;
  totalTransactions: number;
}

export function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
export function fmtDateShort(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
