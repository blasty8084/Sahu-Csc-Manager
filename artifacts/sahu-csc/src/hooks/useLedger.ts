import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useListLedgerEntries, useCreateLedgerEntry, useUpdateLedgerEntry, useDeleteLedgerEntry,
  useGetBalance, useListServices, useGetSettings,
  getListLedgerEntriesQueryKey, getGetBalanceQueryKey
} from "@workspace/api-client-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export interface EntryForm {
  date: string;
  customerName: string;
  serviceType: string;
  credit: number;
  debit: number;
  description: string;
}

// NOTE: balance is computed server-side and returned per-entry as `entry.balance`.
// The client never re-derives running balances independently — do not add local
// balance recalculation here; this preserves the balance-recalculation bug fix.
export const SERVICE_COLOR_MAP: Record<string, string> = {
  "PAN Card": "#7c3aed", "Aadhar Enrolment": "#0891b2", "Passport Seva": "#0b2c60",
  "Income Certificate": "#059669", "Voter ID": "#d97706", "Ration Card": "#dc2626",
  "Death Certificate": "#64748b", "Birth Certificate": "#0284c7", "Driving License": "#9333ea",
  "PMAY": "#b45309", "PM-Kisan": "#16a34a", "Jeevan Praman": "#0f766e",
};

export const getServiceColor = (name: string) => SERVICE_COLOR_MAP[name] || "#475569";

// Date grouping helpers for mobile transaction list
export const groupByDate = (entries: any[]) => {
  const groups: Record<string, any[]> = {};
  entries?.forEach((e: any) => {
    if (!groups[e.date]) groups[e.date] = [];
    groups[e.date].push(e);
  });
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
};

export const fmtDateGroup = (d: string, t: (key: string) => string) => {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  if (d === today) return t("common.today");
  if (d === yesterday) return t("common.yesterday");
  return new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", weekday: "short" });
};

export interface LedgerListParams {
  page: number;
  limit: number;
  startDate?: string;
  endDate?: string;
  customerName?: string;
  serviceType?: string;
}

/**
 * Non-UI data layer for the Ledger page: query hooks, mutations, and derived
 * (filtered/sorted) data. All UI state (dialogs, filters inputs, active tab, etc.)
 * stays in the ledger.tsx orchestrator.
 */
export function useLedger(params: LedgerListParams, receiptSearch: string) {
  const qc = useQueryClient();

  const { data, isLoading } = useListLedgerEntries(params);
  const { data: allEntriesData } = useListLedgerEntries({ limit: 500 });
  const { data: balance } = useGetBalance();
  const { data: services } = useListServices();
  const { data: settings } = useGetSettings();

  const businessName = (settings as any)?.businessName ?? "SAHU CSC";
  const businessAddress = (settings as any)?.businessAddress ?? "";
  const businessMobile = (settings as any)?.businessMobile ?? "";
  const businessWebsite = (settings as any)?.businessWebsite ?? "";

  const createMut = useCreateLedgerEntry();
  const updateMut = useUpdateLedgerEntry();
  const deleteMut = useDeleteLedgerEntry();

  const deleteAllMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/ledger/all`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getListLedgerEntriesQueryKey() });
      qc.invalidateQueries({ queryKey: getGetBalanceQueryKey() });
    },
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: getListLedgerEntriesQueryKey(params) });
    qc.invalidateQueries({ queryKey: getGetBalanceQueryKey() });
  };

  const serviceTypes = services?.map((s: any) => s.name) ?? [];

  const customerNameSuggestions = useMemo(() => {
    const names = new Set<string>();
    allEntriesData?.entries?.forEach((e: any) => { if (e.customerName) names.add(e.customerName); });
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [allEntriesData]);

  const frequentCustomers = useMemo(() => {
    const freq: Record<string, number> = {};
    allEntriesData?.entries?.forEach((e: any) => {
      if (e.customerName) freq[e.customerName] = (freq[e.customerName] || 0) + 1;
    });
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name]) => name);
  }, [allEntriesData]);

  const receiptEntries = useMemo(() => {
    const all: any[] = allEntriesData?.entries ?? [];
    const q = receiptSearch.trim().toLowerCase();
    return all
      .filter((e: any) => e.receiptNumber)
      .filter((e: any) => !q || (
        e.receiptNumber?.toLowerCase().includes(q) ||
        e.customerName?.toLowerCase().includes(q) ||
        e.serviceType?.toLowerCase().includes(q)
      ))
      .sort((a: any, b: any) => b.id - a.id);
  }, [allEntriesData, receiptSearch]);

  return {
    data, isLoading, allEntriesData, balance, services, settings,
    businessName, businessAddress, businessMobile, businessWebsite,
    createMut, updateMut, deleteMut, deleteAllMut, invalidate,
    serviceTypes, customerNameSuggestions, frequentCustomers, receiptEntries,
  };
}
