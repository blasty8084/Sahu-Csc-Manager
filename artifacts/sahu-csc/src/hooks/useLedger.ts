import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useListLedgerEntries, useCreateLedgerEntry, useUpdateLedgerEntry, useDeleteLedgerEntry,
  useGetBalance, useListServices, useGetSettings,
  getListLedgerEntriesQueryKey, getGetBalanceQueryKey
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export interface EntryForm {
  date: string;
  customerName: string;
  serviceType: string;
  credit: number;
  debit: number;
  description: string;
}

export interface QuickAddState {
  date: string;
  customerName: string;
  serviceType: string;
  entryType: "credit" | "debit";
  amount: string;
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

/**
 * Data layer + filter/pagination state for the Ledger page.
 *
 * Owns: data fetching, mutations, filter state (page, dates, customer, service,
 * showFilters), quick-add state and handler. All modal/dialog/form state stays
 * in the ledger.tsx orchestrator.
 */
export function useLedger(receiptSearch: string) {
  const qc = useQueryClient();
  const { toast } = useToast();

  // ── Filter & pagination state ────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const hasFilters = !!(startDate || endDate || customerName || serviceFilter);
  const clearFilters = () => { setStartDate(""); setEndDate(""); setCustomerName(""); setServiceFilter(""); setPage(1); };

  // ── Quick-add strip state ────────────────────────────────────────────────
  const todayStr = new Date().toISOString().split("T")[0];
  const [quickAdd, setQuickAdd] = useState<QuickAddState>({
    date: todayStr, customerName: "", serviceType: "", entryType: "credit", amount: "", description: "",
  });
  const [quickAddSaving, setQuickAddSaving] = useState(false);

  // ── Queries ──────────────────────────────────────────────────────────────
  const params = {
    page,
    limit: 15,
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
    ...(customerName && { customerName }),
    ...(serviceFilter && serviceFilter !== "all" && { serviceType: serviceFilter }),
  };

  const { data, isLoading } = useListLedgerEntries(params);
  const { data: allEntriesData } = useListLedgerEntries({ limit: 500 });
  const { data: balance } = useGetBalance();
  const { data: services } = useListServices();
  const { data: settings } = useGetSettings();

  const totalPages = Math.ceil((data?.total ?? 0) / 15);

  const businessName = (settings as any)?.businessName ?? "SAHU CSC";
  const businessAddress = (settings as any)?.businessAddress ?? "";
  const businessMobile = (settings as any)?.businessMobile ?? "";
  const businessWebsite = (settings as any)?.businessWebsite ?? "";

  // ── Mutations ────────────────────────────────────────────────────────────
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

  // ── Derived lists ────────────────────────────────────────────────────────
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

  // ── Quick-add handler ────────────────────────────────────────────────────
  const saveQuickAdd = async () => {
    const amt = parseFloat(quickAdd.amount);
    if (!quickAdd.customerName.trim() || !quickAdd.serviceType || !amt || amt <= 0) {
      toast({ title: "Fill in customer, service, and a valid amount", variant: "destructive" });
      return;
    }
    setQuickAddSaving(true);
    try {
      await createMut.mutateAsync({
        data: {
          date: quickAdd.date,
          customerName: quickAdd.customerName.trim(),
          serviceType: quickAdd.serviceType,
          credit: quickAdd.entryType === "credit" ? amt : 0,
          debit: quickAdd.entryType === "debit" ? amt : 0,
          description: quickAdd.description,
        },
      });
      toast.success("Entry added");
      setQuickAdd({ date: todayStr, customerName: "", serviceType: "", entryType: "credit", amount: "", description: "" });
      invalidate();
    } catch {
      toast({ title: "Failed to add entry", variant: "destructive" });
    } finally {
      setQuickAddSaving(false);
    }
  };

  return {
    // queries & derived
    data, isLoading, allEntriesData, balance, services, settings,
    businessName, businessAddress, businessMobile, businessWebsite,
    serviceTypes, customerNameSuggestions, frequentCustomers, receiptEntries,
    // mutations
    createMut, updateMut, deleteMut, deleteAllMut, invalidate,
    // filter state
    page, setPage,
    startDate, setStartDate,
    endDate, setEndDate,
    customerName, setCustomerName,
    serviceFilter, setServiceFilter,
    showFilters, setShowFilters,
    hasFilters, totalPages, clearFilters,
    // quick-add state
    quickAdd, setQuickAdd, quickAddSaving, saveQuickAdd,
  };
}
