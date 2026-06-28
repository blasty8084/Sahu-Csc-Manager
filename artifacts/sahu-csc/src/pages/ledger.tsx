import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useListLedgerEntries, useCreateLedgerEntry, useUpdateLedgerEntry, useDeleteLedgerEntry,
  useGetBalance, useListServices, useGetSettings,
  getListLedgerEntriesQueryKey, getGetBalanceQueryKey
} from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { Plus, Pencil, Trash2, Download, Filter, X, ChevronLeft, ChevronRight, Clock, WifiOff, Receipt, Search, IndianRupee, User, FileText, Calendar, CheckCircle2, ArrowDownLeft, ArrowUpRight, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { useForm } from "react-hook-form";
import { addPendingEntry, getAllPendingEntries, type PendingLedgerEntry } from "@/lib/offline-db";
import { syncEngine } from "@/lib/sync-engine";
import { ReceiptModal } from "@/components/receipt-modal";
import { AutocompleteInput } from "@/components/autocomplete-input";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface EntryForm {
  date: string;
  customerName: string;
  serviceType: string;
  credit: number;
  debit: number;
  description: string;
}

export default function Ledger() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const isMobile = useIsMobile();
  const { isOffline } = useNetworkStatus();
  const [pendingEntries, setPendingEntries] = useState<PendingLedgerEntry[]>([]);
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editEntry, setEditEntry] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const [receiptEntry, setReceiptEntry] = useState<any>(null);
  const [entryType, setEntryType] = useState<"credit" | "debit">("credit");
  const [rawAmount, setRawAmount] = useState("0");
  const [inlineEditId, setInlineEditId] = useState<number | null>(null);
  const [inlineEdit, setInlineEdit] = useState<{ date: string; customerName: string; serviceType: string; entryType: "credit" | "debit"; amount: string; description: string }>({ date: "", customerName: "", serviceType: "", entryType: "credit", amount: "0", description: "" });
  const todayStr = new Date().toISOString().split("T")[0];
  const [quickAdd, setQuickAdd] = useState<{ date: string; customerName: string; serviceType: string; entryType: "credit" | "debit"; amount: string; description: string }>({ date: todayStr, customerName: "", serviceType: "", entryType: "credit", amount: "", description: "" });
  const [quickAddSaving, setQuickAddSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"transactions" | "receipts">("transactions");
  const [receiptSearch, setReceiptSearch] = useState("");
  const [autoDownloadReceipt, setAutoDownloadReceipt] = useState(false);

  const refreshPending = async () => {
    try {
      const entries = await getAllPendingEntries();
      setPendingEntries(entries.sort((a, b) => b.createdAt - a.createdAt));
    } catch {}
  };

  useEffect(() => {
    refreshPending();
    const handler = () => refreshPending();
    window.addEventListener("sahu-sync-complete", handler);
    window.addEventListener("online", handler);
    return () => {
      window.removeEventListener("sahu-sync-complete", handler);
      window.removeEventListener("online", handler);
    };
  }, []);

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
      setShowDeleteAll(false);
      setPage(1);
      toast.warning("All transactions deleted", "Balance reset to ₹0.");
    },
    onError: () => toast({ title: "Failed to delete all transactions", variant: "destructive" }),
  });

  const form = useForm<EntryForm>({
    defaultValues: { date: new Date().toISOString().split("T")[0], customerName: "", serviceType: "", credit: 0, debit: 0, description: "" }
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: getListLedgerEntriesQueryKey(params) });
    qc.invalidateQueries({ queryKey: getGetBalanceQueryKey() });
  };

  const openCreate = () => {
    setEditEntry(null);
    setEntryType("credit");
    setRawAmount("0");
    form.reset({ date: new Date().toISOString().split("T")[0], customerName: "", serviceType: "", credit: 0, debit: 0, description: "" });
    setShowForm(true);
  };

  const openEdit = (entry: any) => {
    if (isMobile) {
      setEditEntry(entry);
      const etype = entry.credit > 0 ? "credit" : "debit";
      setEntryType(etype);
      setRawAmount(String(entry.credit > 0 ? entry.credit : entry.debit));
      form.reset({ date: entry.date, customerName: entry.customerName, serviceType: entry.serviceType, credit: entry.credit, debit: entry.debit, description: entry.description });
      setShowForm(true);
    } else {
      const etype = entry.credit > 0 ? "credit" : "debit";
      setInlineEditId(entry.id);
      setInlineEdit({ date: entry.date, customerName: entry.customerName, serviceType: entry.serviceType, entryType: etype, amount: String(etype === "credit" ? entry.credit : entry.debit), description: entry.description || "" });
    }
  };

  const saveInlineEdit = async () => {
    if (!inlineEditId) return;
    const amt = parseFloat(inlineEdit.amount) || 0;
    try {
      await updateMut.mutateAsync({ id: inlineEditId, data: { date: inlineEdit.date, customerName: inlineEdit.customerName, serviceType: inlineEdit.serviceType, credit: inlineEdit.entryType === "credit" ? amt : 0, debit: inlineEdit.entryType === "debit" ? amt : 0, description: inlineEdit.description } });
      toast.success("Entry updated");
      setInlineEditId(null);
      invalidate();
    } catch {
      toast({ title: "Failed to update entry", variant: "destructive" });
    }
  };

  const saveQuickAdd = async () => {
    const amt = parseFloat(quickAdd.amount);
    if (!quickAdd.customerName.trim() || !quickAdd.serviceType || !amt || amt <= 0) {
      toast({ title: "Fill in customer, service, and a valid amount", variant: "destructive" });
      return;
    }
    setQuickAddSaving(true);
    try {
      await createMut.mutateAsync({ date: quickAdd.date, customerName: quickAdd.customerName.trim(), serviceType: quickAdd.serviceType, credit: quickAdd.entryType === "credit" ? amt : 0, debit: quickAdd.entryType === "debit" ? amt : 0, description: quickAdd.description });
      toast.success("Entry added");
      setQuickAdd({ date: todayStr, customerName: "", serviceType: "", entryType: "credit", amount: "", description: "" });
      invalidate();
    } catch {
      toast({ title: "Failed to add entry", variant: "destructive" });
    } finally {
      setQuickAddSaving(false);
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (editEntry) {
        await updateMut.mutateAsync({ id: editEntry.id, data: values });
        toast.success("Entry updated");
        setShowForm(false);
        invalidate();
      } else if (isOffline) {
        const pending: PendingLedgerEntry = {
          id: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          date: values.date,
          customerName: values.customerName,
          serviceType: values.serviceType,
          credit: Number(values.credit) || 0,
          debit: Number(values.debit) || 0,
          description: values.description || "",
          createdAt: Date.now(),
          retryCount: 0,
        };
        await addPendingEntry(pending);
        await syncEngine.markPendingAdded();
        await refreshPending();
        setShowForm(false);
        toast({
          title: "Saved offline",
          description: "Will sync automatically when connected",
        });
      } else {
        await createMut.mutateAsync({ data: values });
        toast.success("Entry created");
        setShowForm(false);
        invalidate();
      }
    } catch {
      toast({ title: "Failed to save entry", variant: "destructive" });
    }
  });

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMut.mutateAsync({ id: deleteId });
      toast.success("Entry deleted");
      setDeleteId(null);
      invalidate();
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const clearFilters = () => { setStartDate(""); setEndDate(""); setCustomerName(""); setServiceFilter(""); setPage(1); };
  const hasFilters = !!(startDate || endDate || customerName || serviceFilter);
  const serviceTypes = services?.map((s: any) => s.name) ?? [];
  const totalPages = Math.ceil((data?.total ?? 0) / 15);
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

  // Sync rawAmount + entryType → form credit/debit fields
  useEffect(() => {
    const amt = parseFloat(rawAmount) || 0;
    if (entryType === "credit") {
      form.setValue("credit", amt);
      form.setValue("debit", 0);
    } else {
      form.setValue("credit", 0);
      form.setValue("debit", amt);
    }
  }, [entryType, rawAmount]);

  // Accent colors for Add Entry form
  const accentColor = entryType === "credit" ? "#059669" : "#e11d48";
  const accentGrad = entryType === "credit"
    ? "linear-gradient(135deg, #064e3b, #059669)"
    : "linear-gradient(135deg, #881337, #e11d48)";
  const accentBg = entryType === "credit" ? "rgba(5,150,105,0.08)" : "rgba(225,29,72,0.08)";

  // Date grouping helpers for mobile
  const groupByDate = (entries: any[]) => {
    const groups: Record<string, any[]> = {};
    entries?.forEach((e: any) => {
      if (!groups[e.date]) groups[e.date] = [];
      groups[e.date].push(e);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  };
  const fmtDateGroup = (d: string) => {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    if (d === today) return t("common.today");
    if (d === yesterday) return t("common.yesterday");
    return new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", weekday: "short" });
  };

  return (
    <Layout>
      {/* Customer name datalist for autocomplete */}
      <datalist id="ledger-customer-names">
        {customerNameSuggestions.map(name => <option key={name} value={name} />)}
      </datalist>
      <div className="space-y-4">
        {/* ── MOBILE: Navy gradient hero header ── */}
        <div className="md:hidden rounded-2xl overflow-hidden" style={{ background: "linear-gradient(145deg,#0b2c60 0%,#1a4a9e 100%)", padding: "20px 20px 24px", position: "relative" }}>
          <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(249,115,22,0.12)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -20, left: 20, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
          {/* Top row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, position: "relative" }}>
            <div>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>{t("ledger.title")}</p>
              <h1 style={{ color: "#fff", fontSize: 20, fontWeight: 900, lineHeight: 1.1, marginTop: 2 }}>{t("ledger.subtitle")}</h1>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <a href="/api/reports/export" target="_blank" style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
                <Download size={15} color="#fff" />
              </a>
              <button onClick={() => setShowDeleteAll(true)} style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(249,115,22,0.18)", border: "1px solid rgba(249,115,22,0.35)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", outline: "none" }}>
                <Trash2 size={15} color="#f97316" />
              </button>
            </div>
          </div>
          {/* Balance card */}
          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 16, padding: "14px 16px", border: "1px solid rgba(255,255,255,0.12)", position: "relative" }}>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>{t("ledger.current_balance")}</p>
            {balance === undefined
              ? <div style={{ height: 30, background: "rgba(255,255,255,0.1)", borderRadius: 8, marginBottom: 12, width: "55%" }} />
              : <p style={{ color: "#fff", fontSize: 26, fontWeight: 900, lineHeight: 1, marginBottom: 12 }}>₹{(balance?.balance ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div style={{ background: "rgba(16,185,129,0.15)", borderRadius: 10, padding: "8px 10px", border: "1px solid rgba(16,185,129,0.25)" }}>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>{t("ledger.credits")}</p>
                {balance === undefined
                  ? <div style={{ height: 16, background: "rgba(255,255,255,0.12)", borderRadius: 4, marginTop: 4, width: "70%" }} />
                  : <p style={{ color: "#34d399", fontSize: 15, fontWeight: 900, marginTop: 2 }}>+₹{(balance?.totalCredits ?? 0).toLocaleString("en-IN")}</p>}
              </div>
              <div style={{ background: "rgba(244,63,94,0.15)", borderRadius: 10, padding: "8px 10px", border: "1px solid rgba(244,63,94,0.25)" }}>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>{t("ledger.debits")}</p>
                {balance === undefined
                  ? <div style={{ height: 16, background: "rgba(255,255,255,0.12)", borderRadius: 4, marginTop: 4, width: "70%" }} />
                  : <p style={{ color: "#fb7185", fontSize: 15, fontWeight: 900, marginTop: 2 }}>−₹{(balance?.totalDebits ?? 0).toLocaleString("en-IN")}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* ── MOBILE: Search bar ── */}
        <div className="md:hidden" style={{ position: "relative" }}>
          <Search size={14} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", zIndex: 1 }} />
          <AutocompleteInput
            value={customerName}
            onChange={(val) => { setCustomerName(val); setPage(1); }}
            suggestions={customerNameSuggestions}
            placeholder={t("ledger.search_placeholder")}
            style={{ width: "100%", height: 44, paddingLeft: 34, paddingRight: 46, borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 13, color: "#0b2c60", outline: "none", boxSizing: "border-box", fontWeight: 500, boxShadow: "0 1px 6px rgba(11,44,96,0.06)" }}
          />
          <button onClick={() => setShowFilters(!showFilters)} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 30, height: 30, borderRadius: 8, background: hasFilters ? "#0b2c60" : "#f1f5f9", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", outline: "none" }}>
            <Filter size={13} color={hasFilters ? "#fff" : "#64748b"} />
          </button>
        </div>

        {/* ── MOBILE: Frequent customers ── */}
        {frequentCustomers.length > 0 && (
          <div className="md:hidden" style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 2, scrollbarWidth: "none" as const }}>
            {frequentCustomers.map(name => (
              <button
                key={name}
                type="button"
                onClick={() => { setCustomerName(customerName === name ? "" : name); setPage(1); }}
                style={{
                  flexShrink: 0, padding: "5px 11px", borderRadius: 20,
                  border: `1.5px solid ${customerName === name ? "#0b2c60" : "rgba(11,44,96,0.18)"}`,
                  background: customerName === name ? "#0b2c60" : "rgba(11,44,96,0.04)",
                  color: customerName === name ? "#fff" : "#0b2c60",
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
                }}
              >
                <User size={10} />
                {name}
              </button>
            ))}
          </div>
        )}

        {/* ── MOBILE: Tab switcher ── */}
        <div className="md:hidden" style={{ display: "flex", background: "#f1f5f9", borderRadius: 14, padding: 4, gap: 4 }}>
          {(["transactions", "receipts"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, height: 38, borderRadius: 11, border: "none", cursor: "pointer",
                background: activeTab === tab ? "#fff" : "transparent",
                color: activeTab === tab ? "#0b2c60" : "#64748b",
                fontWeight: activeTab === tab ? 800 : 600,
                fontSize: 13,
                boxShadow: activeTab === tab ? "0 2px 8px rgba(11,44,96,0.12)" : "none",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                transition: "all 0.15s",
              }}
            >
              {tab === "transactions" ? <><FileText size={13} />{t("dashboard.transactions")}</> : <><Receipt size={13} />{t("ledger.receipts_tab")}</>}
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════
            DESKTOP LAYOUT — sidebar + main panel
            Hidden on mobile, shown on md+
        ═══════════════════════════════════════════════ */}
        <div className="hidden md:flex gap-5" style={{ minHeight: "calc(100vh - 130px)" }}>

          {/* ── LEFT SIDEBAR ── */}
          <div style={{ width: 268, flexShrink: 0, display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Brand + Balance + New Entry */}
            <div style={{ background: "linear-gradient(145deg,#0b2c60 0%,#1a4a9e 100%)", borderRadius: 20, padding: "20px 18px 18px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -24, right: -24, width: 100, height: 100, borderRadius: "50%", background: "rgba(249,115,22,0.12)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", bottom: -18, left: 8, width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
              <div style={{ position: "relative" }}>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 2 }}>{t("ledger.title")}</p>
                <h1 style={{ color: "#fff", fontSize: 18, fontWeight: 900, lineHeight: 1.1, marginBottom: 16 }}>{t("ledger.subtitle")}</h1>
                {/* Balance glass card */}
                <div style={{ background: "rgba(255,255,255,0.09)", borderRadius: 14, padding: "14px 14px", border: "1px solid rgba(255,255,255,0.13)", marginBottom: 12 }}>
                  <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 5 }}>{t("ledger.current_balance")}</p>
                  {balance === undefined
                    ? <div style={{ height: 28, background: "rgba(255,255,255,0.1)", borderRadius: 6, width: "65%", marginBottom: 12 }} />
                    : <p style={{ color: "#fff", fontSize: 24, fontWeight: 900, lineHeight: 1, marginBottom: 12 }}>₹{(balance?.balance ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    <div style={{ background: "rgba(16,185,129,0.15)", borderRadius: 9, padding: "8px 10px", border: "1px solid rgba(16,185,129,0.25)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
                        <ArrowDownLeft size={10} color="#34d399" />
                        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 8, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{t("ledger.credits")}</p>
                      </div>
                      {balance === undefined
                        ? <div style={{ height: 14, background: "rgba(255,255,255,0.12)", borderRadius: 4, width: "80%" }} />
                        : <p style={{ color: "#34d399", fontSize: 13, fontWeight: 900 }}>+₹{(balance?.totalCredits ?? 0).toLocaleString("en-IN")}</p>}
                    </div>
                    <div style={{ background: "rgba(244,63,94,0.15)", borderRadius: 9, padding: "8px 10px", border: "1px solid rgba(244,63,94,0.25)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
                        <ArrowUpRight size={10} color="#fb7185" />
                        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 8, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{t("ledger.debits")}</p>
                      </div>
                      {balance === undefined
                        ? <div style={{ height: 14, background: "rgba(255,255,255,0.12)", borderRadius: 4, width: "80%" }} />
                        : <p style={{ color: "#fb7185", fontSize: 13, fontWeight: 900 }}>−₹{(balance?.totalDebits ?? 0).toLocaleString("en-IN")}</p>}
                    </div>
                  </div>
                </div>
                {/* New Entry */}
                <button onClick={openCreate} data-testid="button-new-entry"
                  style={{ width: "100%", height: 46, borderRadius: 13, background: "linear-gradient(135deg,#f97316,#fb923c)", border: "none", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, boxShadow: "0 4px 18px rgba(249,115,22,0.45)", letterSpacing: "0.01em" }}>
                  <Plus size={18} strokeWidth={2.5} />New Entry
                </button>
              </div>
            </div>

            {/* Filters card */}
            <div style={{ background: "#fff", borderRadius: 16, padding: "16px 16px", boxShadow: "0 2px 12px rgba(11,44,96,0.07)", border: "1px solid rgba(11,44,96,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 7, background: "rgba(11,44,96,0.07)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Filter size={11} color="#0b2c60" />
                  </div>
                  <p style={{ fontSize: 11, fontWeight: 800, color: "#0b2c60", textTransform: "uppercase", letterSpacing: "0.08em" }}>{t("reports.filters")}</p>
                </div>
                {hasFilters && (
                  <button onClick={clearFilters} style={{ fontSize: 10, fontWeight: 700, color: "#f97316", background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: 6, padding: "3px 9px", cursor: "pointer" }}>
                    Clear all
                  </button>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {frequentCustomers.length > 0 && (
                  <div>
                    <p style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Frequent</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {frequentCustomers.map(name => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => { setCustomerName(customerName === name ? "" : name); setPage(1); }}
                          style={{
                            padding: "3px 9px", borderRadius: 10,
                            border: `1px solid ${customerName === name ? "#0b2c60" : "rgba(11,44,96,0.18)"}`,
                            background: customerName === name ? "#0b2c60" : "transparent",
                            color: customerName === name ? "#fff" : "#0b2c60",
                            fontSize: 10, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                          }}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ position: "relative" }}>
                  <Search size={12} color="#94a3b8" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", zIndex: 1 }} />
                  <AutocompleteInput
                    value={customerName}
                    onChange={(val) => { setCustomerName(val); setPage(1); }}
                    suggestions={customerNameSuggestions}
                    placeholder="Search customer…"
                    style={{ width: "100%", height: 36, paddingLeft: 28, paddingRight: 10, borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fafbff", fontSize: 12, color: "#0b2c60", outline: "none", boxSizing: "border-box", fontWeight: 500, transition: "border-color 0.15s" }}
                    onFocus={e => ((e.target as HTMLInputElement).style.borderColor = "#0b2c60")}
                    onBlur={e => ((e.target as HTMLInputElement).style.borderColor = "#e2e8f0")}
                  />
                </div>
                <div>
                  <p style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>From Date</p>
                  <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                    style={{ width: "100%", height: 36, paddingInline: 10, borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fafbff", fontSize: 12, color: startDate ? "#0b2c60" : "#94a3b8", outline: "none", boxSizing: "border-box", fontWeight: 500 }} />
                </div>
                <div>
                  <p style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>To Date</p>
                  <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                    style={{ width: "100%", height: 36, paddingInline: 10, borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fafbff", fontSize: 12, color: endDate ? "#0b2c60" : "#94a3b8", outline: "none", boxSizing: "border-box", fontWeight: 500 }} />
                </div>
                <div>
                  <p style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Service</p>
                  <Select value={serviceFilter} onValueChange={(v) => { setServiceFilter(v); setPage(1); }}>
                    <SelectTrigger style={{ height: 36, borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fafbff", fontSize: 12, fontWeight: 500, color: "#0b2c60" }}>
                      <SelectValue placeholder="All services" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      <SelectItem value="all">All services</SelectItem>
                      {serviceTypes.map((s: string) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <a href="/api/reports/export" target="_blank"
                style={{ height: 42, borderRadius: 12, border: "1.5px solid rgba(11,44,96,0.15)", background: "#fff", color: "#0b2c60", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none", boxShadow: "0 1px 6px rgba(11,44,96,0.05)" }}>
                <Download size={15} />Export to Excel
              </a>
              <button onClick={() => setShowDeleteAll(true)}
                style={{ height: 42, borderRadius: 12, border: "1.5px solid rgba(225,29,72,0.2)", background: "rgba(225,29,72,0.04)", color: "#e11d48", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Trash2 size={15} />Delete All Entries
              </button>
            </div>
          </div>

          {/* ── RIGHT MAIN PANEL ── */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
            <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 20px rgba(11,44,96,0.08)", border: "1px solid rgba(11,44,96,0.06)", flex: 1, display: "flex", flexDirection: "column" }}>

              {/* Table toolbar + Tab switcher */}
              <div style={{ padding: "14px 18px 0", borderBottom: "1px solid rgba(11,44,96,0.07)", flexShrink: 0 }}>
                {/* Tab pills */}
                <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 13, padding: 4, gap: 4, marginBottom: 12 }}>
                  {(["transactions", "receipts"] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        flex: 1, height: 36, borderRadius: 10, border: "none", cursor: "pointer",
                        background: activeTab === tab ? "#fff" : "transparent",
                        color: activeTab === tab ? "#0b2c60" : "#64748b",
                        fontWeight: activeTab === tab ? 800 : 600,
                        fontSize: 13,
                        boxShadow: activeTab === tab ? "0 2px 8px rgba(11,44,96,0.10)" : "none",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        transition: "all 0.15s",
                      }}
                    >
                      {tab === "transactions" ? <><FileText size={13} />Transactions</> : <><Receipt size={13} />Receipt History</>}
                    </button>
                  ))}
                </div>
                {/* Subtitle row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 12 }}>
                  <p style={{ fontSize: 11, color: "#94a3b8" }}>
                    {activeTab === "transactions"
                      ? `${data?.total ?? 0} total entries · Page ${page} of ${Math.max(totalPages, 1)}`
                      : `${receiptEntries.length} receipt${receiptEntries.length !== 1 ? "s" : ""} found`}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {activeTab === "transactions" && hasFilters && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#f97316", background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: 20, padding: "4px 12px" }}>
                        Filtered
                      </span>
                    )}
                    {isOffline && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#d97706", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)", borderRadius: 20, padding: "4px 10px", display: "flex", alignItems: "center", gap: 4 }}>
                        <WifiOff size={10} /> Offline
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Pending entries banner */}
              {pendingEntries.length > 0 && (
                <div style={{ background: "rgba(251,191,36,0.07)", borderBottom: "1px solid rgba(251,191,36,0.18)", padding: "10px 22px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <Clock size={13} style={{ color: "#d97706", flexShrink: 0 }} />
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#92400e" }}>
                    {pendingEntries.length} offline {pendingEntries.length === 1 ? "entry" : "entries"} pending sync — will upload when reconnected
                  </p>
                </div>
              )}

              {/* Desktop Receipt History panel */}
              {activeTab === "receipts" && (
                <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                  {/* Search bar */}
                  <div style={{ position: "relative" }}>
                    <Search size={13} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    <input
                      value={receiptSearch}
                      onChange={(e) => setReceiptSearch(e.target.value)}
                      placeholder="Search by receipt no., customer name, or service…"
                      style={{ width: "100%", height: 40, paddingLeft: 34, paddingRight: 12, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#f8fafc", fontSize: 13, color: "#0b2c60", outline: "none", boxSizing: "border-box", fontWeight: 500, boxShadow: "0 1px 4px rgba(11,44,96,0.05)" }}
                    />
                  </div>
                  {/* Receipt list */}
                  {receiptEntries.length === 0 ? (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
                      <div style={{ width: 60, height: 60, borderRadius: 18, background: "rgba(11,44,96,0.06)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                        <Receipt size={26} color="#0b2c60" opacity={0.3} />
                      </div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: "#0b2c60", marginBottom: 6 }}>No receipts found</p>
                      <p style={{ fontSize: 12, color: "#94a3b8" }}>{receiptSearch ? "Try a different search term" : "Receipts will appear here after adding entries"}</p>
                    </div>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ background: "rgba(11,44,96,0.03)", borderBottom: "2px solid rgba(11,44,96,0.08)" }}>
                            {[
                              { label: "Receipt No", w: 140 },
                              { label: "Date", w: 100 },
                              { label: "Customer", w: undefined },
                              { label: "Service", w: 156 },
                              { label: "Amount", w: 120, right: true },
                              { label: "Actions", w: 160, right: true },
                            ].map(col => (
                              <th key={col.label} style={{ padding: "10px 14px", textAlign: col.right ? "right" : "left", fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: "0.07em", whiteSpace: "nowrap" as const, width: col.w }}>
                                {col.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {receiptEntries.map((entry: any) => {
                            const isCredit = entry.credit > 0;
                            const amt = isCredit ? entry.credit : entry.debit;
                            const ec = isCredit ? "#059669" : "#e11d48";
                            const prefix = isCredit ? "+" : "−";
                            return (
                              <tr key={entry.id}
                                style={{ borderBottom: "1px solid rgba(11,44,96,0.05)", transition: "background 0.1s" }}
                                onMouseEnter={e => (e.currentTarget.style.background = "rgba(11,44,96,0.02)")}
                                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                              >
                                <td style={{ padding: "12px 14px", whiteSpace: "nowrap" as const }}>
                                  <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 800, color: "#f97316", background: "rgba(249,115,22,0.07)", padding: "3px 8px", borderRadius: 6, border: "1px solid rgba(249,115,22,0.15)" }}>
                                    {entry.receiptNumber}
                                  </span>
                                </td>
                                <td style={{ padding: "12px 14px", fontFamily: "monospace", fontSize: 12, color: "#64748b", whiteSpace: "nowrap" as const }}>{entry.date}</td>
                                <td style={{ padding: "12px 14px", fontWeight: 700, fontSize: 13, color: "#0b2c60", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{entry.customerName}</td>
                                <td style={{ padding: "12px 14px" }}>
                                  <span style={{ fontSize: 11, fontWeight: 700, color: "#475569", background: "rgba(71,85,105,0.07)", padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap" as const }}>
                                    {entry.serviceType}
                                  </span>
                                </td>
                                <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 900, fontSize: 14, color: ec, whiteSpace: "nowrap" as const }}>
                                  {prefix}₹{amt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                </td>
                                <td style={{ padding: "12px 14px" }}>
                                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                                    <button
                                      onClick={() => { setReceiptEntry(entry); setAutoDownloadReceipt(false); }}
                                      title="View Receipt"
                                      style={{ height: 32, paddingInline: 10, borderRadius: 8, border: "1.5px solid rgba(11,44,96,0.15)", background: "rgba(11,44,96,0.04)", color: "#0b2c60", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                                      <Receipt size={12} />View
                                    </button>
                                    <button
                                      onClick={() => { setReceiptEntry(entry); setAutoDownloadReceipt(true); }}
                                      title="Download PDF"
                                      style={{ height: 32, paddingInline: 10, borderRadius: 8, border: "none", background: "linear-gradient(135deg,#0b2c60,#1a4a9e)", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, boxShadow: "0 2px 8px rgba(11,44,96,0.22)" }}>
                                      <Download size={12} />PDF
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Table */}
              <div style={{ flex: 1, overflowX: "auto", overflowY: "auto", display: activeTab !== "transactions" ? "none" : undefined }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                    <tr style={{ background: "rgba(11,44,96,0.03)", borderBottom: "2px solid rgba(11,44,96,0.08)" }}>
                      {[
                        { label: "#", w: 44 },
                        { label: "Receipt No", w: 126 },
                        { label: "Date", w: 100 },
                        { label: "Customer", w: undefined },
                        { label: "Service", w: 156 },
                        { label: "Credit", w: 108, right: true },
                        { label: "Debit", w: 108, right: true },
                        { label: "Balance", w: 118, right: true },
                        { label: "Note", w: 130 },
                        { label: "", w: 106 },
                      ].map((col) => (
                        <th key={col.label} style={{ padding: "11px 14px", textAlign: col.right ? "right" : "left", fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap", width: col.w }}>
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* ── Quick-add row (always pinned at top, desktop only) ── */}
                    <tr style={{ borderBottom: "2px solid rgba(11,44,96,0.09)", background: "rgba(249,115,22,0.025)" }}>
                      {/* + label */}
                      <td style={{ padding: "8px 14px" }}>
                        <div style={{ width: 22, height: 22, borderRadius: 6, background: "linear-gradient(135deg,#f97316,#fb923c)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Plus size={13} color="#fff" strokeWidth={3} />
                        </div>
                      </td>
                      {/* Date — no receipt col in quick-add, spans receipt+date */}
                      <td colSpan={2} style={{ padding: "6px 6px" }}>
                        <input type="date" value={quickAdd.date}
                          onChange={e => setQuickAdd(p => ({ ...p, date: e.target.value }))}
                          style={{ width: "100%", height: 33, paddingInline: 8, borderRadius: 8, border: "1.5px solid rgba(249,115,22,0.35)", fontSize: 11, color: "#0b2c60", outline: "none", background: "#fff", fontFamily: "monospace", boxSizing: "border-box" }} />
                      </td>
                      {/* Customer */}
                      <td style={{ padding: "6px 6px" }}>
                        <input value={quickAdd.customerName}
                          onChange={e => setQuickAdd(p => ({ ...p, customerName: e.target.value }))}
                          onKeyDown={e => e.key === "Enter" && saveQuickAdd()}
                          placeholder="Customer name *"
                          list="ledger-customer-names"
                          autoComplete="off"
                          style={{ width: "100%", height: 33, paddingInline: 8, borderRadius: 8, border: "1.5px solid rgba(249,115,22,0.35)", fontSize: 12, color: "#0b2c60", outline: "none", background: "#fff", fontWeight: 600, boxSizing: "border-box" }}
                          onFocus={e => (e.target.style.borderColor = "#f97316")}
                          onBlur={e => (e.target.style.borderColor = "rgba(249,115,22,0.35)")} />
                      </td>
                      {/* Service */}
                      <td style={{ padding: "6px 6px" }}>
                        <select value={quickAdd.serviceType}
                          onChange={e => setQuickAdd(p => ({ ...p, serviceType: e.target.value }))}
                          style={{ width: "100%", height: 33, paddingInline: 7, borderRadius: 8, border: "1.5px solid rgba(249,115,22,0.35)", fontSize: 11, color: quickAdd.serviceType ? "#0b2c60" : "#94a3b8", outline: "none", background: "#fff", boxSizing: "border-box" }}>
                          <option value="">Service *</option>
                          {serviceTypes.map((s: string) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      {/* Cr/Dr toggle + amount (spans credit+debit cols) */}
                      <td colSpan={2} style={{ padding: "6px 6px" }}>
                        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                          <button onClick={() => setQuickAdd(p => ({ ...p, entryType: "credit" }))}
                            style={{ flexShrink: 0, height: 33, paddingInline: 10, borderRadius: 8, border: "1.5px solid", borderColor: quickAdd.entryType === "credit" ? "#059669" : "#e2e8f0", background: quickAdd.entryType === "credit" ? "rgba(5,150,105,0.1)" : "#fff", color: quickAdd.entryType === "credit" ? "#059669" : "#94a3b8", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>
                            Cr
                          </button>
                          <button onClick={() => setQuickAdd(p => ({ ...p, entryType: "debit" }))}
                            style={{ flexShrink: 0, height: 33, paddingInline: 10, borderRadius: 8, border: "1.5px solid", borderColor: quickAdd.entryType === "debit" ? "#e11d48" : "#e2e8f0", background: quickAdd.entryType === "debit" ? "rgba(225,29,72,0.08)" : "#fff", color: quickAdd.entryType === "debit" ? "#e11d48" : "#94a3b8", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>
                            Dr
                          </button>
                          <input type="number" value={quickAdd.amount} min="0" step="0.01"
                            onChange={e => setQuickAdd(p => ({ ...p, amount: e.target.value }))}
                            onKeyDown={e => e.key === "Enter" && saveQuickAdd()}
                            placeholder="Amount *"
                            style={{ flex: 1, minWidth: 0, height: 33, paddingInline: 8, borderRadius: 8, border: "1.5px solid rgba(249,115,22,0.35)", fontSize: 12, color: "#0b2c60", outline: "none", background: "#fff", textAlign: "right", fontWeight: 700, boxSizing: "border-box" }}
                            onFocus={e => (e.target.style.borderColor = "#f97316")}
                            onBlur={e => (e.target.style.borderColor = "rgba(249,115,22,0.35)")} />
                        </div>
                      </td>
                      {/* Balance placeholder */}
                      <td style={{ padding: "8px 14px", textAlign: "right", color: "#cbd5e1", fontSize: 11 }}>—</td>
                      {/* Note */}
                      <td style={{ padding: "6px 6px" }}>
                        <input value={quickAdd.description}
                          onChange={e => setQuickAdd(p => ({ ...p, description: e.target.value }))}
                          onKeyDown={e => e.key === "Enter" && saveQuickAdd()}
                          placeholder="Note…"
                          style={{ width: "100%", height: 33, paddingInline: 8, borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 11, color: "#0b2c60", outline: "none", background: "#fff", boxSizing: "border-box" }} />
                      </td>
                      {/* Add button */}
                      <td style={{ padding: "6px 8px" }}>
                        <button onClick={saveQuickAdd} disabled={quickAddSaving}
                          style={{ width: "100%", height: 33, borderRadius: 8, border: "none", background: quickAddSaving ? "#94a3b8" : "linear-gradient(135deg,#f97316,#fb923c)", color: "#fff", fontSize: 12, fontWeight: 800, cursor: quickAddSaving ? "wait" : "pointer", whiteSpace: "nowrap", boxShadow: quickAddSaving ? "none" : "0 2px 10px rgba(249,115,22,0.35)" }}>
                          {quickAddSaving ? "…" : "Add"}
                        </button>
                      </td>
                    </tr>

                    {isLoading ? (
                      [...Array(8)].map((_, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid rgba(11,44,96,0.05)" }}>
                          {[44, 110, 90, 0, 130, 90, 90, 100, 110, 90].map((w, j) => (
                            <td key={j} style={{ padding: "13px 14px" }}>
                              <div style={{ height: 12, borderRadius: 6, background: "#f1f5f9", width: w || "80%" }} />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : !data?.entries?.length ? (
                      <tr>
                        <td colSpan={10} style={{ textAlign: "center", padding: "72px 0" }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                            <div style={{ width: 60, height: 60, borderRadius: 18, background: "rgba(11,44,96,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <FileText size={26} color="#0b2c60" opacity={0.3} />
                            </div>
                            <div>
                              <p style={{ fontSize: 15, fontWeight: 700, color: "#0b2c60", marginBottom: 5 }}>No entries found</p>
                              <p style={{ fontSize: 12, color: "#94a3b8" }}>
                                {hasFilters ? "Try clearing the filters" : "Use New Entry in the sidebar to add your first transaction"}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      data.entries.map((entry: any, idx: number) => {
                        const rowNum = (page - 1) * 15 + idx + 1;
                        const balanceNum = Number(entry.balance);
                        const isEditing = inlineEditId === entry.id;

                        if (isEditing) {
                          return (
                            <tr key={entry.id} data-testid={`row-ledger-${entry.id}`}
                              style={{ borderBottom: "1px solid rgba(11,44,96,0.1)", background: "rgba(11,44,96,0.025)" }}>
                              {/* # */}
                              <td style={{ padding: "8px 14px", color: "#0b2c60", fontSize: 11, fontWeight: 700 }}>{rowNum}</td>
                              {/* Receipt — read-only */}
                              <td style={{ padding: "8px 14px", whiteSpace: "nowrap" }}>
                                <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 800, color: "#f97316", background: "rgba(249,115,22,0.07)", padding: "3px 8px", borderRadius: 6, border: "1px solid rgba(249,115,22,0.15)" }}>
                                  {entry.receiptNumber ?? `CSC-${new Date(entry.createdAt).getFullYear()}-${String(entry.id).padStart(4, "0")}`}
                                </span>
                              </td>
                              {/* Date input */}
                              <td style={{ padding: "6px 6px" }}>
                                <input type="date" value={inlineEdit.date}
                                  onChange={e => setInlineEdit(p => ({ ...p, date: e.target.value }))}
                                  style={{ width: "100%", height: 32, paddingInline: 7, borderRadius: 8, border: "1.5px solid #0b2c60", fontSize: 11, color: "#0b2c60", outline: "none", background: "#fff", fontFamily: "monospace", boxSizing: "border-box" }} />
                              </td>
                              {/* Customer input */}
                              <td style={{ padding: "6px 6px" }}>
                                <input value={inlineEdit.customerName}
                                  onChange={e => setInlineEdit(p => ({ ...p, customerName: e.target.value }))}
                                  placeholder="Customer"
                                  list="ledger-customer-names"
                                  autoComplete="off"
                                  style={{ width: "100%", height: 32, paddingInline: 8, borderRadius: 8, border: "1.5px solid #0b2c60", fontSize: 12, color: "#0b2c60", outline: "none", background: "#fff", fontWeight: 600, boxSizing: "border-box" }} />
                              </td>
                              {/* Service select */}
                              <td style={{ padding: "6px 6px" }}>
                                <select value={inlineEdit.serviceType}
                                  onChange={e => setInlineEdit(p => ({ ...p, serviceType: e.target.value }))}
                                  style={{ width: "100%", height: 32, paddingInline: 7, borderRadius: 8, border: "1.5px solid #0b2c60", fontSize: 11, color: "#0b2c60", outline: "none", background: "#fff", boxSizing: "border-box" }}>
                                  {serviceTypes.map((s: string) => <option key={s} value={s}>{s}</option>)}
                                </select>
                              </td>
                              {/* Credit / Debit toggle + amount (spans 2 cols) */}
                              <td colSpan={2} style={{ padding: "6px 6px" }}>
                                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                                  <button onClick={() => setInlineEdit(p => ({ ...p, entryType: "credit" }))}
                                    style={{ flexShrink: 0, height: 32, paddingInline: 9, borderRadius: 8, border: "1.5px solid", borderColor: inlineEdit.entryType === "credit" ? "#059669" : "#e2e8f0", background: inlineEdit.entryType === "credit" ? "rgba(5,150,105,0.1)" : "#fff", color: inlineEdit.entryType === "credit" ? "#059669" : "#94a3b8", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>
                                    Cr
                                  </button>
                                  <button onClick={() => setInlineEdit(p => ({ ...p, entryType: "debit" }))}
                                    style={{ flexShrink: 0, height: 32, paddingInline: 9, borderRadius: 8, border: "1.5px solid", borderColor: inlineEdit.entryType === "debit" ? "#e11d48" : "#e2e8f0", background: inlineEdit.entryType === "debit" ? "rgba(225,29,72,0.08)" : "#fff", color: inlineEdit.entryType === "debit" ? "#e11d48" : "#94a3b8", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>
                                    Dr
                                  </button>
                                  <input type="number" value={inlineEdit.amount} min="0" step="0.01"
                                    onChange={e => setInlineEdit(p => ({ ...p, amount: e.target.value }))}
                                    placeholder="0.00"
                                    style={{ flex: 1, minWidth: 0, height: 32, paddingInline: 8, borderRadius: 8, border: "1.5px solid #0b2c60", fontSize: 12, color: "#0b2c60", outline: "none", background: "#fff", textAlign: "right", fontWeight: 700, boxSizing: "border-box" }} />
                                </div>
                              </td>
                              {/* Balance — read-only */}
                              <td style={{ padding: "8px 14px", textAlign: "right", fontWeight: 900, fontSize: 13, color: balanceNum < 0 ? "#e11d48" : "#94a3b8", whiteSpace: "nowrap" }}>
                                ₹{balanceNum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                              </td>
                              {/* Note input */}
                              <td style={{ padding: "6px 6px" }}>
                                <input value={inlineEdit.description}
                                  onChange={e => setInlineEdit(p => ({ ...p, description: e.target.value }))}
                                  placeholder="Note…"
                                  style={{ width: "100%", height: 32, paddingInline: 8, borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 11, color: "#0b2c60", outline: "none", background: "#fff", boxSizing: "border-box" }} />
                              </td>
                              {/* Save / Cancel */}
                              <td style={{ padding: "6px 8px" }}>
                                <div style={{ display: "flex", gap: 5, justifyContent: "flex-end" }}>
                                  <button onClick={saveInlineEdit} disabled={updateMut.isPending}
                                    style={{ height: 30, paddingInline: 13, borderRadius: 8, border: "none", background: "#059669", color: "#fff", fontSize: 12, fontWeight: 800, cursor: updateMut.isPending ? "wait" : "pointer", whiteSpace: "nowrap", opacity: updateMut.isPending ? 0.7 : 1 }}>
                                    {updateMut.isPending ? "…" : "Save"}
                                  </button>
                                  <button onClick={() => setInlineEditId(null)}
                                    style={{ height: 30, paddingInline: 10, borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#f8fafc", color: "#64748b", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                                    Cancel
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        }

                        return (
                          <tr key={entry.id}
                            data-testid={`row-ledger-${entry.id}`}
                            style={{ borderBottom: "1px solid rgba(11,44,96,0.05)", transition: "background 0.1s" }}
                            onMouseEnter={e => (e.currentTarget.style.background = "rgba(11,44,96,0.025)")}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                          >
                            {/* # */}
                            <td style={{ padding: "13px 14px", color: "#cbd5e1", fontSize: 11, fontWeight: 700 }}>{rowNum}</td>
                            {/* Receipt */}
                            <td style={{ padding: "13px 14px", whiteSpace: "nowrap" }}>
                              <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 800, color: "#f97316", background: "rgba(249,115,22,0.07)", padding: "3px 8px", borderRadius: 6, border: "1px solid rgba(249,115,22,0.15)" }}>
                                {entry.receiptNumber ?? `CSC-${new Date(entry.createdAt).getFullYear()}-${String(entry.id).padStart(4, "0")}`}
                              </span>
                            </td>
                            {/* Date */}
                            <td style={{ padding: "13px 14px", fontFamily: "monospace", fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>{entry.date}</td>
                            {/* Customer */}
                            <td style={{ padding: "13px 14px", fontWeight: 700, fontSize: 13, color: "#0b2c60", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.customerName}</td>
                            {/* Service */}
                            <td style={{ padding: "13px 14px" }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: "#475569", background: "rgba(71,85,105,0.07)", padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap", display: "inline-block", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", verticalAlign: "middle" }}>
                                {entry.serviceType}
                              </span>
                            </td>
                            {/* Credit */}
                            <td style={{ padding: "13px 14px", textAlign: "right", fontWeight: 800, fontSize: 13, whiteSpace: "nowrap" }}>
                              {entry.credit > 0
                                ? <span style={{ color: "#059669", background: "rgba(5,150,105,0.07)", padding: "3px 8px", borderRadius: 7 }}>+₹{entry.credit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                : <span style={{ color: "#e2e8f0" }}>—</span>}
                            </td>
                            {/* Debit */}
                            <td style={{ padding: "13px 14px", textAlign: "right", fontWeight: 800, fontSize: 13, whiteSpace: "nowrap" }}>
                              {entry.debit > 0
                                ? <span style={{ color: "#e11d48", background: "rgba(225,29,72,0.07)", padding: "3px 8px", borderRadius: 7 }}>−₹{entry.debit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                : <span style={{ color: "#e2e8f0" }}>—</span>}
                            </td>
                            {/* Balance */}
                            <td style={{ padding: "13px 14px", textAlign: "right", fontWeight: 900, fontSize: 13, color: balanceNum < 0 ? "#e11d48" : "#0b2c60", whiteSpace: "nowrap" }}>
                              ₹{balanceNum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </td>
                            {/* Note */}
                            <td style={{ padding: "13px 14px", color: "#94a3b8", fontSize: 11, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.description || "—"}</td>
                            {/* Actions */}
                            <td style={{ padding: "13px 14px" }}>
                              <div style={{ display: "flex", gap: 5, justifyContent: "flex-end" }}>
                                <button onClick={() => setReceiptEntry(entry)} title="Receipt"
                                  style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                                  <Receipt size={13} color="#64748b" />
                                </button>
                                <button onClick={() => openEdit(entry)} title="Edit"
                                  style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid rgba(11,44,96,0.15)", background: "rgba(11,44,96,0.04)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                                  <Pencil size={13} color="#0b2c60" />
                                </button>
                                <button onClick={() => setDeleteId(entry.id)} title="Delete"
                                  style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid rgba(225,29,72,0.2)", background: "rgba(225,29,72,0.04)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                                  <Trash2 size={13} color="#e11d48" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination footer */}
              <div style={{ display: activeTab !== "transactions" ? "none" : "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 22px", borderTop: "1px solid rgba(11,44,96,0.07)", background: "rgba(11,44,96,0.015)", flexShrink: 0 }}>
                <p style={{ fontSize: 12, color: "#94a3b8" }}>
                  {data?.total
                    ? `Showing ${(page - 1) * 15 + 1}–${Math.min(page * 15, data.total)} of ${data.total} entries`
                    : "No entries"}
                </p>
                {totalPages > 1 && (
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => setPage(p => p - 1)} disabled={page <= 1}
                      style={{ height: 34, paddingInline: 14, borderRadius: 10, border: "1.5px solid #e2e8f0", background: page <= 1 ? "#f8fafc" : "#fff", color: page <= 1 ? "#cbd5e1" : "#0b2c60", fontSize: 12, fontWeight: 700, cursor: page <= 1 ? "default" : "pointer", display: "flex", alignItems: "center", gap: 5, transition: "all 0.1s" }}>
                      <ChevronLeft size={14} />Previous
                    </button>
                    <div style={{ display: "flex", gap: 4 }}>
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
                        return (
                          <button key={p} onClick={() => setPage(p)}
                            style={{ width: 34, height: 34, borderRadius: 10, border: "1.5px solid", borderColor: p === page ? "#0b2c60" : "#e2e8f0", background: p === page ? "#0b2c60" : "#fff", color: p === page ? "#fff" : "#64748b", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                            {p}
                          </button>
                        );
                      })}
                    </div>
                    <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}
                      style={{ height: 34, paddingInline: 14, borderRadius: 10, border: "1.5px solid #e2e8f0", background: page >= totalPages ? "#f8fafc" : "#fff", color: page >= totalPages ? "#cbd5e1" : "#0b2c60", fontSize: 12, fontWeight: 700, cursor: page >= totalPages ? "default" : "pointer", display: "flex", alignItems: "center", gap: 5, transition: "all 0.1s" }}>
                      Next<ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
        {/* ═══════════════════════════════════════════════ */}

        {/* Offline Pending Entries — mobile only (desktop shows banner inside table panel) */}
        {activeTab === "transactions" && pendingEntries.length > 0 && (
          <div className="md:hidden bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                {pendingEntries.length} offline {pendingEntries.length === 1 ? "entry" : "entries"} — will sync when connected
              </p>
              {isOffline && (
                <span className="ml-auto flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-500">
                  <WifiOff size={11} /> Offline
                </span>
              )}
            </div>
            <div className="space-y-2">
              {pendingEntries.slice(0, 5).map((entry) => (
                <div key={entry.id} className="flex items-center gap-3 bg-white dark:bg-amber-950/30 rounded-lg px-3 py-2 border border-amber-100 dark:border-amber-800/30">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{entry.customerName || "—"}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{entry.serviceType} · {entry.date}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    {entry.credit > 0 && (
                      <p className="text-xs font-bold text-emerald-600">+₹{entry.credit.toLocaleString("en-IN")}</p>
                    )}
                    {entry.debit > 0 && (
                      <p className="text-xs font-bold text-rose-500">-₹{entry.debit.toLocaleString("en-IN")}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-amber-300 text-amber-600 dark:text-amber-400 flex-shrink-0">
                    Pending
                  </Badge>
                </div>
              ))}
              {pendingEntries.length > 5 && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400 text-center">
                  +{pendingEntries.length - 5} more
                </p>
              )}
            </div>
          </div>
        )}

        {/* Mobile Filters (collapsible) */}
        {activeTab === "transactions" && showFilters && (
          <div className="md:hidden bg-card border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Filters</p>
              {hasFilters && (
                <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={clearFilters}>
                  <X size={12} className="mr-1" />Clear
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">From</Label>
                <Input className="h-9 text-sm" type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">To</Label>
                <Input className="h-9 text-sm" type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} />
              </div>
            </div>
            <Input className="h-9 text-sm" value={customerName} onChange={(e) => { setCustomerName(e.target.value); setPage(1); }} placeholder="Search customer..." />
            <Select value={serviceFilter} onValueChange={(v) => { setServiceFilter(v); setPage(1); }}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="All services" /></SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                <SelectItem value="all">All services</SelectItem>
                {serviceTypes.map((s: string) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}


        {/* ── MOBILE: Receipt History ── */}
        {activeTab === "receipts" && (
          <div className="md:hidden space-y-3 pb-24">
            <div style={{ position: "relative" }}>
              <Search size={13} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input
                value={receiptSearch}
                onChange={(e) => setReceiptSearch(e.target.value)}
                placeholder="Search receipt no., customer, or service…"
                style={{ width: "100%", height: 42, paddingLeft: 34, paddingRight: 12, borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 13, color: "#0b2c60", outline: "none", boxSizing: "border-box", fontWeight: 500, boxShadow: "0 1px 6px rgba(11,44,96,0.06)" }}
              />
            </div>
            {receiptEntries.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(11,44,96,0.06)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <Receipt size={22} color="#0b2c60" opacity={0.3} />
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#0b2c60", marginBottom: 4 }}>No receipts yet</p>
                <p style={{ fontSize: 12, color: "#94a3b8" }}>{receiptSearch ? "No receipts match your search" : "Receipts appear here after you add entries"}</p>
              </div>
            ) : receiptEntries.map((entry: any) => {
              const isCredit = entry.credit > 0;
              const amt = isCredit ? entry.credit : entry.debit;
              const ec = isCredit ? "#059669" : "#e11d48";
              const prefix = isCredit ? "+" : "−";
              return (
                <div key={entry.id} style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 8px rgba(11,44,96,0.07)", border: "1px solid #f1f5f9" }}>
                  <div style={{ height: 3, background: "linear-gradient(90deg,#f97316,#0b2c60)" }} />
                  <div style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 800, color: "#f97316", background: "rgba(249,115,22,0.08)", padding: "3px 9px", borderRadius: 7, border: "1px solid rgba(249,115,22,0.18)" }}>
                        {entry.receiptNumber}
                      </span>
                      <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>
                        {new Date(entry.date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#0b2c60", marginBottom: 2 }}>{entry.customerName}</p>
                    <p style={{ fontSize: 11, color: "#64748b", marginBottom: 10 }}>{entry.serviceType}</p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <p style={{ fontSize: 18, fontWeight: 900, color: ec }}>{prefix}₹{amt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => { setReceiptEntry(entry); setAutoDownloadReceipt(false); }}
                          style={{ height: 34, paddingInline: 12, borderRadius: 10, border: "1.5px solid rgba(11,44,96,0.15)", background: "rgba(11,44,96,0.04)", color: "#0b2c60", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                          <Receipt size={13} />View
                        </button>
                        <button
                          onClick={() => { setReceiptEntry(entry); setAutoDownloadReceipt(true); }}
                          style={{ height: 34, paddingInline: 12, borderRadius: 10, border: "none", background: "linear-gradient(135deg,#0b2c60,#1a4a9e)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, boxShadow: "0 2px 10px rgba(11,44,96,0.25)" }}>
                          <Download size={13} />PDF
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── MOBILE: Date-grouped card list ── */}
        <div className="md:hidden space-y-1 pb-24" style={activeTab === "receipts" ? { display: "none" } : {}}>
          {isLoading ? (
            [...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)
          ) : !data?.entries?.length ? (
            <div className="text-center text-muted-foreground py-16 text-sm">
              No entries found. Tap <strong>+</strong> to add your first entry.
            </div>
          ) : (
            groupByDate(data.entries).map(([date, txns]) => (
              <div key={date}>
                {/* Date group header */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 4px 6px" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>{fmtDateGroup(date)}</p>
                  <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                </div>
                {txns.map((entry: any) => {
                  const isCredit = entry.credit > 0;
                  const amt = isCredit ? entry.credit : entry.debit;
                  const ec = isCredit ? "#059669" : "#e11d48";
                  const iconBg = isCredit ? "rgba(5,150,105,0.08)" : "rgba(225,29,72,0.08)";
                  return (
                    <div key={entry.id} data-testid={`row-ledger-${entry.id}`}
                      style={{ background: "#fff", borderRadius: 14, marginBottom: 8, overflow: "hidden", boxShadow: "0 1px 8px rgba(11,44,96,0.07)", display: "flex", border: "1px solid #f1f5f9" }}>
                      <div style={{ width: 4, background: ec, flexShrink: 0 }} />
                      <div style={{ flex: 1, padding: "11px 12px", display: "flex", alignItems: "center", gap: 10 }}>
                        {/* Icon badge */}
                        <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {isCredit
                            ? <ArrowDownLeft size={17} color={ec} strokeWidth={2.5} />
                            : <ArrowUpRight size={17} color={ec} strokeWidth={2.5} />}
                        </div>
                        {/* Details */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: "#0b2c60", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.customerName}</p>
                          <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{entry.serviceType}</p>
                        </div>
                        {/* Amount + balance + action buttons */}
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <p style={{ fontSize: 15, fontWeight: 900, color: ec, lineHeight: 1 }}>{isCredit ? "+" : "−"}₹{amt.toLocaleString("en-IN")}</p>
                          <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>Bal ₹{Number(entry.balance).toLocaleString("en-IN")}</p>
                          <div style={{ display: "flex", gap: 4, justifyContent: "flex-end", marginTop: 5 }}>
                            <button onClick={() => setReceiptEntry(entry)} style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                              <Receipt size={11} color="#64748b" />
                            </button>
                            <button onClick={() => openEdit(entry)} style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                              <Pencil size={11} color="#64748b" />
                            </button>
                            <button onClick={() => setDeleteId(entry.id)} style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid #fee2e2", background: "#fff5f5", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                              <Trash2 size={11} color="#e11d48" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Mobile Pagination */}
        {totalPages > 1 && (
          <div className="md:hidden flex items-center justify-between px-1">
            <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>
              <ChevronLeft size={14} className="mr-1" />Prev
            </Button>
            <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>
              Next<ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
        )}
      </div>

      {/* ── MOBILE: Floating Action Button ── */}
      {isMobile && (
        <button
          onClick={openCreate}
          data-testid="button-new-entry"
          style={{ position: "fixed", bottom: 88, right: 20, width: 56, height: 56, borderRadius: 18, background: "linear-gradient(135deg,#f97316,#fb923c)", boxShadow: "0 8px 24px rgba(249,115,22,0.45)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 50 }}
        >
          <Plus size={24} color="#fff" strokeWidth={2.5} />
        </button>
      )}

      {/* ── Entry Form: Mobile Dialog ── */}
      {isMobile && (
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="w-[calc(100vw-2rem)] max-w-md rounded-2xl p-0 overflow-hidden gap-0">
            <div className="flex justify-center pt-3 pb-0">
              <div style={{ width: 40, height: 4, borderRadius: 2, background: "#e2e8f0" }} />
            </div>
            <div className="px-5 pt-4 pb-3 flex items-center justify-between">
              <h2 style={{ fontSize: 18, fontWeight: 900, color: accentColor }}>
                {editEntry ? "Edit Entry" : (entryType === "credit" ? "New Credit Entry" : "New Debit Entry")}
              </h2>
              <button type="button" onClick={() => setShowForm(false)} style={{ width: 32, height: 32, borderRadius: 8, background: "#f1f5f9", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <X size={15} color="#64748b" />
              </button>
            </div>
            <form onSubmit={onSubmit} className="px-5 pb-6 space-y-3">
              {!editEntry && (
                <div style={{ background: "#f1f5f9", borderRadius: 14, padding: 4, display: "flex", gap: 4 }}>
                  {(["credit", "debit"] as const).map(t => (
                    <button key={t} type="button" onClick={() => setEntryType(t)}
                      style={{ flex: 1, height: 40, borderRadius: 11, border: "none", cursor: "pointer", fontWeight: 800, fontSize: 13, background: entryType === t ? (t === "credit" ? "#059669" : "#e11d48") : "transparent", color: entryType === t ? "#fff" : "#94a3b8", transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                      {t === "credit" ? "▲ Credit (Income)" : "▼ Debit (Expense)"}
                    </button>
                  ))}
                </div>
              )}
              <div style={{ background: accentBg, border: `2px solid ${accentColor}25`, borderRadius: 16, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: accentGrad, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 4px 12px ${accentColor}30` }}>
                  <IndianRupee size={18} color="#fff" strokeWidth={2.5} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>Amount (₹)</p>
                  <input type="number" step="0.01" min="0" value={rawAmount} onChange={e => setRawAmount(e.target.value)}
                    data-testid="input-credit" placeholder="0.00"
                    style={{ width: "100%", fontSize: 28, fontWeight: 900, color: accentColor, background: "transparent", border: "none", outline: "none", padding: 0 }} />
                </div>
              </div>
              <div style={{ position: "relative" }}>
                <User size={14} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input {...form.register("customerName", { required: true })} placeholder="Customer name"
                  list="ledger-customer-names" autoComplete="off" data-testid="input-customer"
                  style={{ width: "100%", height: 44, paddingLeft: 36, paddingRight: 12, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#fafafa", fontSize: 14, color: "#0b2c60", outline: "none", boxSizing: "border-box", fontWeight: 600 }} />
              </div>
              <Select value={form.watch("serviceType")} onValueChange={(v) => form.setValue("serviceType", v)}>
                <SelectTrigger data-testid="select-service" className="h-11 rounded-xl border-[#e2e8f0] bg-[#fafafa] text-sm font-semibold text-[#0b2c60]">
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {serviceTypes.map((s: string) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <div style={{ position: "relative" }}>
                <Calendar size={14} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input type="date" {...form.register("date", { required: true })} data-testid="input-date"
                  style={{ width: "100%", height: 44, paddingLeft: 36, paddingRight: 12, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#fafafa", fontSize: 14, color: "#0b2c60", outline: "none", boxSizing: "border-box", fontWeight: 600 }} />
              </div>
              <div style={{ position: "relative" }}>
                <FileText size={14} color="#94a3b8" style={{ position: "absolute", left: 12, top: 13 }} />
                <textarea {...form.register("description")} rows={2} placeholder="Add a note (optional)" data-testid="input-description"
                  style={{ width: "100%", paddingLeft: 36, paddingRight: 12, paddingTop: 12, paddingBottom: 12, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#fafafa", fontSize: 13, color: "#0b2c60", outline: "none", resize: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
              </div>
              <button type="submit" data-testid="button-save-entry" disabled={createMut.isPending || updateMut.isPending}
                style={{ width: "100%", height: 52, borderRadius: 16, border: "none", cursor: "pointer", background: accentGrad, color: "#fff", fontSize: 16, fontWeight: 900, letterSpacing: "0.02em", boxShadow: `0 6px 20px ${accentColor}35`, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: (createMut.isPending || updateMut.isPending) ? 0.7 : 1 }}>
                <CheckCircle2 size={18} strokeWidth={2.5} />
                {editEntry ? "Update Entry" : `Save ${entryType === "credit" ? "Credit" : "Debit"} Entry`}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Entry Form: Desktop Panel ── */}
      {!isMobile && showForm && (
        <>
          <div onClick={() => setShowForm(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(11,44,96,0.40)", backdropFilter: "blur(4px)", zIndex: 49 }} />
          {/* V2 — Full-screen split layout */}
          <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>

            {/* ── LEFT INFO PANEL ── */}
            <div style={{ width: 380, flexShrink: 0, background: "linear-gradient(160deg,#0b2c60 0%,#0f3872 55%,#1a4a9e 100%)", display: "flex", flexDirection: "column", padding: "40px 36px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -80, right: -80, width: 260, height: 260, borderRadius: "50%", background: "rgba(249,115,22,0.12)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", bottom: -60, left: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 48, position: "relative" }}>
                <div style={{ width: 36, height: 36, borderRadius: 11, background: "linear-gradient(135deg,#f97316,#fb923c)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(249,115,22,0.40)" }}>
                  <span style={{ fontWeight: 900, fontSize: 13, color: "#fff" }}>SC</span>
                </div>
                <div><span style={{ color: "#fff", fontWeight: 900, fontSize: 16 }}>SAHU </span><span style={{ color: "#f97316", fontWeight: 900, fontSize: 16 }}>CSC</span></div>
              </div>
              <div style={{ position: "relative", marginBottom: 28 }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: accentGrad, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 8px 28px ${accentColor}45`, marginBottom: 20 }}>
                  {entryType === "credit" ? <TrendingUp size={30} color="#fff" /> : <TrendingDown size={30} color="#fff" />}
                </div>
                <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 900, lineHeight: 1.2, marginBottom: 10 }}>
                  {editEntry ? "Edit Entry" : entryType === "credit" ? "New Credit Entry" : "New Debit Entry"}
                </h1>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: 1.7 }}>Record your daily service income and expenses. Every entry updates your running balance instantly.</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: "auto", position: "relative" }}>
                {([
                  { label: "Running Balance", value: `₹${((balance as any)?.balance ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, color: "#f97316", Icon: Wallet },
                  { label: "Total Credits", value: `₹${((balance as any)?.totalCredits ?? 0).toLocaleString("en-IN")}`, color: "#10b981", Icon: TrendingUp },
                  { label: "Total Debits", value: `₹${((balance as any)?.totalDebits ?? 0).toLocaleString("en-IN")}`, color: "#f43f5e", Icon: TrendingDown },
                ] as { label: string; value: string; color: string; Icon: React.ElementType }[]).map(({ label, value, color, Icon }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.08)", borderRadius: 14, padding: "12px 16px", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 11, background: "rgba(255,255,255,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={16} color={color} />
                    </div>
                    <div>
                      <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
                      <p style={{ color: "#fff", fontSize: 15, fontWeight: 800, marginTop: 1 }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT FORM PANEL ── */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#f8fafc" }}>
              {/* Top bar */}
              <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0b2c60", margin: 0 }}>{editEntry ? "Edit Entry" : "New Transaction"}</h2>
                  <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, marginTop: 2 }}>Ledger · {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {!editEntry && (
                    <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 14, padding: 4, gap: 4 }}>
                      {(["credit", "debit"] as const).map(t => (
                        <button key={t} type="button" onClick={() => setEntryType(t)}
                          style={{ padding: "8px 18px", borderRadius: 11, border: "none", cursor: "pointer", background: entryType === t ? (t === "credit" ? "linear-gradient(135deg,#059669,#10b981)" : "linear-gradient(135deg,#e11d48,#f43f5e)") : "transparent", color: entryType === t ? "#fff" : "#64748b", fontWeight: 700, fontSize: 13, boxShadow: entryType === t ? `0 2px 10px ${t === "credit" ? "rgba(5,150,105,0.35)" : "rgba(225,29,72,0.35)"}` : "none", transition: "all 0.15s" }}>
                          {t === "credit" ? "Credit (+)" : "Debit (−)"}
                        </button>
                      ))}
                    </div>
                  )}
                  <button type="button" onClick={() => setShowForm(false)}
                    style={{ width: 38, height: 38, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <X size={16} color="#64748b" />
                  </button>
                </div>
              </div>

              {/* Scrollable form */}
              <form onSubmit={onSubmit} style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "32px 40px", display: "flex", flexDirection: "column", gap: 24, maxWidth: 640 }}>

                  {/* Amount — hero */}
                  <div style={{ background: entryType === "credit" ? "linear-gradient(135deg,rgba(5,150,105,0.06),rgba(16,185,129,0.04))" : "linear-gradient(135deg,rgba(225,29,72,0.06),rgba(244,63,94,0.04))", border: `2px solid ${entryType === "credit" ? "rgba(5,150,105,0.22)" : "rgba(225,29,72,0.22)"}`, borderRadius: 20, padding: "20px 24px" }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: accentColor, textTransform: "uppercase" as const, letterSpacing: "0.1em", display: "block", marginBottom: 12 }}>Amount (₹) *</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 15, background: accentGrad, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 4px 14px ${accentColor}35` }}>
                        <IndianRupee size={22} color="#fff" />
                      </div>
                      <input type="number" step="0.01" min="0" value={rawAmount} onChange={e => setRawAmount(e.target.value)}
                        data-testid="input-credit" placeholder="0.00" autoFocus
                        style={{ flex: 1, fontSize: 38, fontWeight: 900, color: accentColor, background: "transparent", border: "none", outline: "none", letterSpacing: "-0.02em" }} />
                    </div>
                  </div>

                  {/* Customer + Date */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Customer Name *</label>
                      <div style={{ position: "relative" }}>
                        <User size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                        <input {...form.register("customerName", { required: true })} placeholder="Customer name" list="ledger-customer-names" autoComplete="off" data-testid="input-customer"
                          style={{ width: "100%", height: 50, paddingLeft: 40, paddingRight: 14, borderRadius: 14, border: "1.5px solid #e2e8f0", fontSize: 14, fontWeight: 600, color: "#0b2c60", outline: "none", background: "#fff", boxSizing: "border-box", boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }}
                          onFocus={e => (e.target.style.borderColor = accentColor)} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Date *</label>
                      <div style={{ position: "relative" }}>
                        <Calendar size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
                        <input type="date" {...form.register("date", { required: true })} data-testid="input-date"
                          style={{ width: "100%", height: 50, paddingLeft: 40, paddingRight: 14, borderRadius: 14, border: "1.5px solid #e2e8f0", fontSize: 14, fontWeight: 600, color: "#0b2c60", outline: "none", background: "#fff", boxSizing: "border-box", boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }}
                          onFocus={e => (e.target.style.borderColor = accentColor)} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                      </div>
                    </div>
                  </div>

                  {/* Service */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Service Type</label>
                    <Select value={form.watch("serviceType")} onValueChange={(v) => form.setValue("serviceType", v)}>
                      <SelectTrigger data-testid="select-service" className="h-[50px] rounded-[14px] border-[#e2e8f0] bg-white text-sm font-semibold text-[#0b2c60] shadow-[0_1px_4px_rgba(11,44,96,0.06)]">
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {serviceTypes.map((s: string) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Note */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Note <span style={{ fontWeight: 400, textTransform: "none" as const, color: "#94a3b8", letterSpacing: 0 }}>(optional)</span></label>
                    <div style={{ position: "relative" }}>
                      <FileText size={15} style={{ position: "absolute", left: 14, top: 16, color: "#94a3b8" }} />
                      <textarea {...form.register("description")} rows={3} placeholder="Add a note about this transaction…" data-testid="input-description"
                        style={{ width: "100%", paddingLeft: 40, paddingRight: 14, paddingTop: 14, paddingBottom: 14, borderRadius: 14, border: "1.5px solid #e2e8f0", fontSize: 14, color: "#0b2c60", resize: "none", outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#fff", lineHeight: 1.6, boxShadow: "0 1px 4px rgba(11,44,96,0.06)" }}
                        onFocus={e => (e.target.style.borderColor = accentColor)} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                    </div>
                  </div>

                  {/* Balance preview */}
                  {(balance as any)?.balance !== undefined && (
                    <div style={{ background: "rgba(11,44,96,0.04)", border: "1px solid rgba(11,44,96,0.10)", borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>Balance after this entry</p>
                        <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                          ₹{((balance as any)?.balance ?? 0).toLocaleString("en-IN")} {entryType === "credit" ? "+" : "−"} ₹{(parseFloat(rawAmount) || 0).toLocaleString("en-IN")}
                        </p>
                      </div>
                      <p style={{ fontSize: 22, fontWeight: 900, color: accentColor }}>
                        ₹{(entryType === "credit"
                          ? ((balance as any)?.balance ?? 0) + (parseFloat(rawAmount) || 0)
                          : ((balance as any)?.balance ?? 0) - (parseFloat(rawAmount) || 0)
                        ).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div style={{ padding: "20px 40px", borderTop: "1px solid #f1f5f9", background: "#fff", flexShrink: 0, display: "flex", gap: 14, marginTop: "auto" }}>
                  <button type="button" onClick={() => setShowForm(false)}
                    style={{ height: 50, padding: "0 28px", borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#64748b" }}>Cancel</button>
                  <button type="submit" data-testid="button-save-entry" disabled={createMut.isPending || updateMut.isPending}
                    style={{ flex: 1, height: 50, borderRadius: 14, border: "none", cursor: "pointer", background: accentGrad, color: "#fff", fontSize: 15, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: `0 6px 20px ${accentColor}35`, opacity: (createMut.isPending || updateMut.isPending) ? 0.7 : 1 }}>
                    <CheckCircle2 size={18} strokeWidth={2.5} />
                    {editEntry ? "Update Entry" : `Save ${entryType === "credit" ? "Credit" : "Debit"} Entry`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Delete Single */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-sm rounded-2xl md:rounded-lg">
          <DialogHeader><DialogTitle>Delete Entry?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteMut.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Modal */}
      <ReceiptModal
        entry={receiptEntry}
        open={!!receiptEntry}
        onClose={() => { setReceiptEntry(null); setAutoDownloadReceipt(false); }}
        businessName={businessName}
        businessAddress={businessAddress}
        businessMobile={businessMobile}
        businessWebsite={businessWebsite}
        autoDownload={autoDownloadReceipt}
        onAutoDownloadComplete={() => setAutoDownloadReceipt(false)}
      />

      {/* Delete All */}
      <AlertDialog open={showDeleteAll} onOpenChange={setShowDeleteAll}>
        <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-md rounded-2xl md:rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete ALL Transactions?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>every ledger entry</strong> and reset the balance to <strong>₹0.00</strong>. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteAllMut.mutate()}
              disabled={deleteAllMut.isPending}
            >
              {deleteAllMut.isPending ? "Deleting..." : "Yes, Delete All"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
