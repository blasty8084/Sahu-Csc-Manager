// ─────────────────────────────────────────────────────────
// AePS — shared types, constants, and formatting helpers
// ─────────────────────────────────────────────────────────

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export async function apiFetch(path: string, opts?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error ?? "Request failed");
  }
  if (res.status === 204) return null;
  return res.json();
}

export function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

export function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export function fmtDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "short", day: "2-digit", month: "short", year: "numeric",
  });
}

export function maskAadhaar(val: string) {
  const digits = val.replace(/\D/g, "").slice(0, 12);
  const groups: string[] = [];
  for (let i = 0; i < digits.length; i += 4) groups.push(digits.slice(i, i + 4));
  return groups.join(" ");
}

export type AepsTx = {
  id: number;
  type: "withdrawal" | "deposit";
  amount: number;
  customerName: string;
  description: string | null;
  balance: number;
  createdAt: string;
  receiptToken?: string | null;
};

export type AepsSession = {
  id: number;
  date: string;
  openingBalance: number;
  notes: string | null;
  transactions: AepsTx[];
  totalWithdrawals: number;
  totalDeposits: number;
  currentBalance: number;
} | null;

export type AllTx = {
  id: number;
  date: string;
  type: "withdrawal" | "deposit";
  amount: number;
  customerName: string;
  description: string | null;
  createdAt: string;
  receiptToken?: string | null;
};

export type AllTxResponse = {
  transactions: AllTx[];
  total: number;
  page: number;
  limit: number;
};

export const OPEN_QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 20000, 50000];

export const AEPS_BANKS = [
  "State Bank of India (SBI)", "Punjab National Bank (PNB)", "Bank of India (BOI)",
  "Bank of Baroda (BOB)", "Canara Bank", "Union Bank of India",
  "Central Bank of India", "Indian Bank", "UCO Bank", "Post Office (IPPB)",
];
export const AEPS_QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000];
