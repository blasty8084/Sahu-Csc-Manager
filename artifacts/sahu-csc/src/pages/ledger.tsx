import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNetworkStatus } from "@/hooks/use-network-status";
import {
  Plus, Trash2, Download, Filter, X, Clock, WifiOff, Receipt, Search, IndianRupee, User, FileText,
  Eye, ChevronRight, ArrowDownLeft, ArrowUpRight, Database,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { addPendingEntry, getAllPendingEntries, type PendingLedgerEntry } from "@/lib/offline-db";
import { syncEngine } from "@/lib/sync-engine";
import { useSync } from "@/hooks/use-sync";
import { ReceiptModal } from "@/components/receipt-modal";
import { AutocompleteInput } from "@/components/autocomplete-input";

import { useLedger, groupByDate, fmtDateGroup, getServiceColor, type EntryForm } from "@/hooks/useLedger";
import {
  MobileSearchBar, MobileFrequentCustomers, DesktopSearchFilterBar, DesktopFilterPanel, MobileFilterPanel,
} from "@/components/ledger/LedgerFilters";
import { MobileEntryFormDialog, DesktopEntryFormPanel } from "@/components/ledger/LedgerEntryForm";
import {
  TableTabsHeader, PendingSyncBanners, DesktopReceiptsPanel, DesktopTransactionsTable, TableFooterPagination,
  MobileReceiptsList, MobileTransactionsList, MobilePagination,
} from "@/components/ledger/LedgerTable";

export default function Ledger() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { isOffline } = useNetworkStatus();
  const { bgSyncCount } = useSync();
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

  const {
    data, isLoading, balance, businessName, businessAddress, businessMobile, businessWebsite,
    createMut, updateMut, deleteMut, deleteAllMut, invalidate,
    serviceTypes, customerNameSuggestions, frequentCustomers, receiptEntries,
  } = useLedger(params, receiptSearch);

  const form = useForm<EntryForm>({
    defaultValues: { date: new Date().toISOString().split("T")[0], customerName: "", serviceType: "", credit: 0, debit: 0, description: "" }
  });

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
      await createMut.mutateAsync({ data: { date: quickAdd.date, customerName: quickAdd.customerName.trim(), serviceType: quickAdd.serviceType, credit: quickAdd.entryType === "credit" ? amt : 0, debit: quickAdd.entryType === "debit" ? amt : 0, description: quickAdd.description } });
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
        // Reset so stale values don't persist the next time the dialog opens.
        form.reset({ date: new Date().toISOString().split("T")[0], customerName: "", serviceType: "", credit: 0, debit: 0, description: "" });
        setShowForm(false);
        toast({
          title: "Saved offline",
          description: "Will sync automatically when connected",
        });
      } else {
        await createMut.mutateAsync({ data: values });
        toast.success("Entry created");
        // Reset so stale values don't persist the next time the dialog opens.
        form.reset({ date: new Date().toISOString().split("T")[0], customerName: "", serviceType: "", credit: 0, debit: 0, description: "" });
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
  const totalPages = Math.ceil((data?.total ?? 0) / 15);

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

        <MobileSearchBar
          customerName={customerName} setCustomerName={setCustomerName} setPage={setPage}
          customerNameSuggestions={customerNameSuggestions} showFilters={showFilters} setShowFilters={setShowFilters}
          hasFilters={hasFilters} t={t}
        />

        <MobileFrequentCustomers frequentCustomers={frequentCustomers} customerName={customerName} setCustomerName={setCustomerName} setPage={setPage} />

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
            DESKTOP LAYOUT v3 — mockup design
            Hidden on mobile, shown on md+
        ═══════════════════════════════════════════════ */}
        <div className="hidden md:flex md:flex-col" style={{ height: "calc(100vh - 128px)", gap: 12 }}>

          {/* ── Desktop Page Header ── */}
          <div style={{ position: "relative", overflow: "hidden", background: "white", borderRadius: 20, flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", border: "1px solid #e2e8f0" }}>
            {/* Gradient accent bar */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,#0b2c60 0%,#1e40af 40%,#f97316 75%,#ea580c 100%)", zIndex: 3, borderRadius: "20px 20px 0 0" }} />
            {/* Hex mesh */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.05, pointerEvents: "none", borderRadius: 20 }} preserveAspectRatio="none">
              <defs>
                <pattern id="lhdr-hex" x="0" y="0" width="28" height="24" patternUnits="userSpaceOnUse">
                  <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="none" stroke="#0b2c60" strokeWidth="0.9" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#lhdr-hex)" />
            </svg>
            {/* Aurora blobs */}
            <div style={{ position: "absolute", top: -20, right: 60, width: 110, height: 110, background: "radial-gradient(circle,rgba(249,115,22,0.10) 0%,transparent 70%)", filter: "blur(20px)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: -5, left: "42%", width: 90, height: 70, background: "radial-gradient(circle,rgba(11,44,96,0.06) 0%,transparent 70%)", filter: "blur(16px)", pointerEvents: "none" }} />
            {/* Bottom border */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,#e2e8f0,transparent)", zIndex: 2 }} />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", height: 60, position: "relative", zIndex: 2 }}>
              <div>
                <h1 style={{ fontSize: 18, fontWeight: 700, color: "#0b2c60", margin: 0 }}>{t("ledger.title") || "Ledger"}</h1>
                <p style={{ fontSize: 11, color: "#64748b", fontWeight: 500, marginTop: 2 }}>{t("ledger.subtitle") || "Track all your transactions and manage records seamlessly."}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <a href="/api/reports/export" target="_blank"
                  style={{ display: "flex", alignItems: "center", gap: 6, height: 34, paddingInline: 14, borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#f8fafc", color: "#334155", fontSize: 12, fontWeight: 600, textDecoration: "none", cursor: "pointer" }}>
                  <Download size={13} />Export
                </a>
                <button onClick={() => setShowDeleteAll(true)}
                  style={{ display: "flex", alignItems: "center", gap: 6, height: 34, paddingInline: 14, borderRadius: 10, border: "1.5px solid rgba(225,29,72,0.25)", background: "rgba(225,29,72,0.05)", color: "#e11d48", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  <Trash2 size={13} />Delete All
                </button>
              </div>
            </div>
          </div>

          {/* ── Row 1: Stat Cards ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, flexShrink: 0 }}>
            {/* Current Balance */}
            <div style={{ background: "linear-gradient(135deg,#0b2c60,#1e3a8a)", borderRadius: 20, padding: "18px 20px", position: "relative", overflow: "hidden", boxShadow: "0 4px 20px rgba(11,44,96,0.22)" }}>
              <div style={{ position: "absolute", right: -16, top: -16, width: 110, height: 110, background: "rgba(255,255,255,0.10)", borderRadius: "50%", filter: "blur(20px)", pointerEvents: "none" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, position: "relative", zIndex: 1 }}>
                <span style={{ color: "rgba(255,255,255,0.70)", fontSize: 13, fontWeight: 500 }}>{t("ledger.current_balance")}</span>
                <button style={{ background: "rgba(255,255,255,0.10)", borderRadius: 8, padding: 6, border: "none", cursor: "pointer" }}><Eye size={13} color="rgba(255,255,255,0.90)" /></button>
              </div>
              {balance === undefined
                ? <div style={{ height: 34, background: "rgba(255,255,255,0.08)", borderRadius: 8, marginBottom: 14, width: "65%" }} />
                : <p style={{ fontSize: 26, fontWeight: 900, color: "white", marginBottom: 14, lineHeight: 1, position: "relative", zIndex: 1 }}>₹{(balance?.balance ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>}
              <div style={{ display: "flex", alignItems: "center", gap: 6, position: "relative", zIndex: 1 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 8px rgba(52,211,153,0.8)" }} />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.50)", fontWeight: 500 }}>Last updated: Just now</span>
              </div>
            </div>
            {/* Total Credits */}
            <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 20, padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <span style={{ color: "#64748b", fontSize: 13, fontWeight: 600 }}>{t("ledger.credits")}</span>
                <div style={{ background: "#d1fae5", border: "1px solid #a7f3d0", borderRadius: 12, padding: 8 }}><ArrowUpRight size={15} color="#059669" strokeWidth={2.5} /></div>
              </div>
              {balance === undefined
                ? <div style={{ height: 32, background: "#f1f5f9", borderRadius: 8, marginBottom: 14, width: "65%" }} />
                : <p style={{ fontSize: 24, fontWeight: 900, color: "#059669", marginBottom: 14, lineHeight: 1 }}>₹{(balance?.totalCredits ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fb923c" }} />
                <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>This month</span>
              </div>
            </div>
            {/* Total Debits */}
            <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 20, padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <span style={{ color: "#64748b", fontSize: 13, fontWeight: 600 }}>{t("ledger.debits")}</span>
                <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 12, padding: 8 }}><ArrowDownLeft size={15} color="#ef4444" strokeWidth={2.5} /></div>
              </div>
              {balance === undefined
                ? <div style={{ height: 32, background: "#f1f5f9", borderRadius: 8, marginBottom: 14, width: "65%" }} />
                : <p style={{ fontSize: 24, fontWeight: 900, color: "#ef4444", marginBottom: 14, lineHeight: 1 }}>₹{(balance?.totalDebits ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fb923c" }} />
                <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>This month</span>
              </div>
            </div>
            {/* Total Transactions */}
            <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 20, padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <span style={{ color: "#64748b", fontSize: 13, fontWeight: 600 }}>Total Transactions</span>
                <div style={{ background: "#dbeafe", border: "1px solid #93c5fd", borderRadius: 12, padding: 8 }}><FileText size={15} color="#2563eb" strokeWidth={2.5} /></div>
              </div>
              {isLoading
                ? <div style={{ height: 32, background: "#f1f5f9", borderRadius: 8, marginBottom: 14, width: "40%" }} />
                : <p style={{ fontSize: 24, fontWeight: 900, color: "#2563eb", marginBottom: 14, lineHeight: 1 }}>{data?.total ?? 0}</p>}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fb923c" }} />
                <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>All time</span>
              </div>
            </div>
          </div>

          {/* ── Row 2: Quick Add Strip ── */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, padding: "10px 14px", display: "flex", gap: 8, alignItems: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <input type="date" value={quickAdd.date} onChange={e => setQuickAdd(p => ({ ...p, date: e.target.value }))}
              style={{ height: 38, paddingInline: 10, borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 12, color: "#0b2c60", outline: "none", background: "#f8fafc", width: 138, fontFamily: "monospace", fontWeight: 600, boxSizing: "border-box" }} />
            <input value={quickAdd.customerName} onChange={e => setQuickAdd(p => ({ ...p, customerName: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && saveQuickAdd()}
              placeholder="Customer name *" list="ledger-customer-names" autoComplete="off"
              style={{ height: 38, paddingInline: 10, borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 12, color: "#0b2c60", outline: "none", background: "#f8fafc", flex: 1, fontWeight: 600, boxSizing: "border-box" }} />
            <select value={quickAdd.serviceType} onChange={e => setQuickAdd(p => ({ ...p, serviceType: e.target.value }))}
              style={{ height: 38, paddingInline: 10, borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 12, color: quickAdd.serviceType ? "#0b2c60" : "#94a3b8", outline: "none", background: "#f8fafc", width: 156, boxSizing: "border-box" }}>
              <option value="">Service type *</option>
              {serviceTypes.map((s: string) => <option key={s} value={s}>{s}</option>)}
            </select>
            <div style={{ display: "flex", background: "#f8fafc", borderRadius: 10, border: "1.5px solid #e2e8f0", flexShrink: 0, overflow: "hidden" }}>
              <button onClick={() => setQuickAdd(p => ({ ...p, entryType: "credit" }))}
                style={{ height: 38, paddingInline: 14, border: "none", background: quickAdd.entryType === "credit" ? "#10b981" : "transparent", color: quickAdd.entryType === "credit" ? "#fff" : "#94a3b8", fontSize: 12, fontWeight: 800, cursor: "pointer", borderRight: "1px solid #e2e8f0" }}>
                Cr
              </button>
              <button onClick={() => setQuickAdd(p => ({ ...p, entryType: "debit" }))}
                style={{ height: 38, paddingInline: 14, border: "none", background: quickAdd.entryType === "debit" ? "#ef4444" : "transparent", color: quickAdd.entryType === "debit" ? "#fff" : "#94a3b8", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>
                Dr
              </button>
            </div>
            <input type="number" value={quickAdd.amount} min="0" step="0.01"
              onChange={e => setQuickAdd(p => ({ ...p, amount: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && saveQuickAdd()}
              placeholder="Amount *"
              style={{ height: 38, paddingInline: 10, borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, color: "#0b2c60", outline: "none", background: "#f8fafc", width: 116, textAlign: "right", fontWeight: 700, boxSizing: "border-box" }} />
            <input value={quickAdd.description} onChange={e => setQuickAdd(p => ({ ...p, description: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && saveQuickAdd()}
              placeholder="Note (optional)"
              style={{ height: 38, paddingInline: 10, borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 12, color: "#64748b", outline: "none", background: "#f8fafc", flex: 1, boxSizing: "border-box" }} />
            <button onClick={saveQuickAdd} disabled={quickAddSaving} data-testid="button-new-entry"
              style={{ height: 38, paddingInline: 20, borderRadius: 10, border: "none", background: quickAddSaving ? "#94a3b8" : "#f97316", color: "#fff", fontSize: 13, fontWeight: 800, cursor: quickAddSaving ? "wait" : "pointer", flexShrink: 0, boxShadow: quickAddSaving ? "none" : "0 2px 10px rgba(249,115,22,0.35)" }}>
              {quickAddSaving ? "…" : "Apply"}
            </button>
          </div>

          {/* ── Row 3+: Table area + Right panel ── */}
          <div style={{ flex: 1, minHeight: 0, display: "flex", gap: 14 }}>

            {/* ── Main area ── */}
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>

              <DesktopSearchFilterBar
                customerName={customerName} setCustomerName={setCustomerName} setPage={setPage}
                showFilters={showFilters} setShowFilters={setShowFilters} hasFilters={hasFilters}
                startDate={startDate} endDate={endDate} serviceFilter={serviceFilter} clearFilters={clearFilters}
              />

              <DesktopFilterPanel
                showFilters={showFilters} t={t} startDate={startDate} setStartDate={setStartDate}
                endDate={endDate} setEndDate={setEndDate} setPage={setPage} serviceTypes={serviceTypes}
                serviceFilter={serviceFilter} setServiceFilter={setServiceFilter} getServiceColor={getServiceColor}
              />

              {/* ── Main table card ── */}
              <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 12px rgba(11,44,96,0.07)", border: "1px solid #e2e8f0", flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>

                <TableTabsHeader
                  activeTab={activeTab} setActiveTab={setActiveTab} data={data} page={page} totalPages={totalPages}
                  receiptEntries={receiptEntries} hasFilters={hasFilters} isOffline={isOffline} bgSyncCount={bgSyncCount}
                />

                <PendingSyncBanners pendingEntries={pendingEntries} bgSyncCount={bgSyncCount} />

                <DesktopReceiptsPanel
                  activeTab={activeTab} receiptSearch={receiptSearch} setReceiptSearch={setReceiptSearch}
                  receiptEntries={receiptEntries} getServiceColor={getServiceColor} setReceiptEntry={setReceiptEntry}
                  setAutoDownloadReceipt={setAutoDownloadReceipt}
                />

                <DesktopTransactionsTable
                  activeTab={activeTab} data={data} isLoading={isLoading} page={page} hasFilters={hasFilters}
                  openCreate={openCreate} inlineEditId={inlineEditId} inlineEdit={inlineEdit} setInlineEdit={setInlineEdit}
                  serviceTypes={serviceTypes} saveInlineEdit={saveInlineEdit} setInlineEditId={setInlineEditId}
                  updateMut={updateMut} getServiceColor={getServiceColor} setReceiptEntry={setReceiptEntry}
                  openEdit={openEdit} setDeleteId={setDeleteId}
                />

                <TableFooterPagination activeTab={activeTab} data={data} page={page} setPage={setPage} totalPages={totalPages} />

              </div>{/* close table card */}
            </div>{/* close main area */}

            {/* ── Right Panel ── */}
            <div style={{ width: 252, flexShrink: 0, display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" }}>

              {/* Quick Actions */}
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <h3 style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, color: "#1e293b", fontSize: 13, marginBottom: 14 }}>
                  <span style={{ fontSize: 16 }}>⚡</span>Quick Actions
                </h3>
                {([
                  { icon: Plus, label: "Add New Entry", sub: "Record a new transaction", grad: "linear-gradient(135deg,#f97316,#ea580c)", action: () => openCreate() },
                  { icon: Receipt, label: "Receipt History", sub: "View all receipts", grad: "linear-gradient(135deg,#a855f7,#9333ea)", action: () => setActiveTab("receipts" as const) },
                  { icon: Download, label: "Export Ledger", sub: "Download as Excel / PDF", grad: "linear-gradient(135deg,#10b981,#059669)", href: "/api/reports/export" },
                  { icon: Database, label: "Backup Ledger", sub: "Create a ledger backup", grad: "linear-gradient(135deg,#3b82f6,#2563eb)", action: () => setShowDeleteAll(true) },
                ] as { icon: React.ElementType; label: string; sub: string; grad: string; action?: () => void; href?: string }[]).map(({ icon: Icon, label, sub, grad, action, href }) => (
                  href
                    ? <a key={label} href={href} target="_blank" style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 12, textDecoration: "none", cursor: "pointer", marginBottom: 6 }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: grad, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Icon size={17} color="white" strokeWidth={2.5} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</p>
                          <p style={{ fontSize: 11, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub}</p>
                        </div>
                        <ChevronRight size={15} color="#cbd5e1" />
                      </a>
                    : <button key={label} onClick={action}
                        style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 12, border: "none", background: "transparent", cursor: "pointer", textAlign: "left", marginBottom: 6 }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: grad, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Icon size={17} color="white" strokeWidth={2.5} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</p>
                          <p style={{ fontSize: 11, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub}</p>
                        </div>
                        <ChevronRight size={15} color="#cbd5e1" />
                      </button>
                ))}
              </div>

              {/* Summary */}
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <h3 style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, color: "#1e293b", fontSize: 13 }}>
                    <span style={{ fontSize: 14 }}>📊</span>Summary
                  </h3>
                  <span style={{ fontSize: 11, color: "#94a3b8", background: "#f1f5f9", borderRadius: 6, padding: "2px 8px" }}>This Month</span>
                </div>
                {(() => {
                  const cr = (balance as any)?.totalCredits ?? 0;
                  const db = (balance as any)?.totalDebits ?? 0;
                  const bal = (balance as any)?.balance ?? 0;
                  const total = cr + db || 1;
                  const crPct = Math.round((cr / total) * 100);
                  const dbPct = 100 - crPct;
                  const r = 38; const circ = 2 * Math.PI * r;
                  const crDash = (crPct / 100) * circ;
                  return (
                    <>
                      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                        <svg width={100} height={100} viewBox="0 0 100 100">
                          <circle cx={50} cy={50} r={r} fill="none" stroke="#e2e8f0" strokeWidth={14} />
                          {cr + db > 0 && <>
                            <circle cx={50} cy={50} r={r} fill="none" stroke="#10b981" strokeWidth={14}
                              strokeDasharray={`${crDash} ${circ - crDash}`} strokeDashoffset={circ * 0.25}
                              strokeLinecap="round" style={{ transition: "stroke-dasharray 0.5s" }} />
                            <circle cx={50} cy={50} r={r} fill="none" stroke="#ef4444" strokeWidth={14}
                              strokeDasharray={`${circ - crDash} ${crDash}`} strokeDashoffset={circ * 0.25 + crDash}
                              strokeLinecap="round" style={{ opacity: dbPct > 0 ? 1 : 0 }} />
                          </>}
                          <text x={50} y={46} textAnchor="middle" fontSize={10} fontWeight={700} fill="#0b2c60">{cr + db > 0 ? crPct : 0}</text>
                          <text x={50} y={58} textAnchor="middle" fontSize={8} fill="#94a3b8">Total</text>
                        </svg>
                      </div>
                      {[
                        { label: "Credits", color: "#10b981", value: `₹${cr.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` },
                        { label: "Debits", color: "#ef4444", value: `₹${db.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` },
                        { label: "Balance", color: "#3b82f6", value: `₹${bal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` },
                      ].map(({ label, color, value }) => (
                        <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                            <span style={{ fontSize: 12, color: "#64748b" }}>{label}</span>
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#1e293b" }}>{value}</span>
                        </div>
                      ))}
                    </>
                  );
                })()}
              </div>

              {/* Recent Activity */}
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <h3 style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, color: "#1e293b", fontSize: 13, marginBottom: 12 }}>
                  <span style={{ fontSize: 14 }}>🕐</span>Recent Activity
                </h3>
                {(data?.entries ?? []).slice(0, 4).length === 0
                  ? <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "24px 0" }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Clock size={18} color="#94a3b8" />
                      </div>
                      <p style={{ fontSize: 13, color: "#334155", fontWeight: 600 }}>No recent Activity</p>
                      <p style={{ fontSize: 11, color: "#94a3b8", textAlign: "center" }}>Your recent transactions will appear here</p>
                    </div>
                  : (data?.entries ?? []).slice(0, 4).map((entry: any) => {
                      const isCr = entry.credit > 0;
                      const amt = isCr ? entry.credit : entry.debit;
                      const color = isCr ? "#059669" : "#ef4444";
                      return (
                        <div key={entry.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                          <div style={{ width: 30, height: 30, borderRadius: 9, background: isCr ? "#d1fae5" : "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {isCr ? <ArrowUpRight size={13} color="#059669" strokeWidth={2.5} /> : <ArrowDownLeft size={13} color="#ef4444" strokeWidth={2.5} />}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 12, fontWeight: 700, color: "#0b2c60", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.customerName}</p>
                            <p style={{ fontSize: 10, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.serviceType}</p>
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 800, color, flexShrink: 0 }}>{isCr ? "+" : "−"}₹{amt.toLocaleString("en-IN")}</span>
                        </div>
                      );
                    })}
              </div>

            </div>{/* close right panel */}
          </div>{/* close row 3 (table + right panel) */}
        </div>{/* close outer desktop section */}
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
            {bgSyncCount > 0 && (
              <div className="flex items-center gap-2 bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800/40 rounded-lg px-3 py-2">
                <Clock size={12} className="text-violet-600 dark:text-violet-400 flex-shrink-0" />
                <p className="text-[11px] font-semibold text-violet-700 dark:text-violet-400">
                  {bgSyncCount} {bgSyncCount === 1 ? "request" : "requests"} retrying in background
                </p>
              </div>
            )}
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

        {activeTab === "transactions" && (
          <MobileFilterPanel
            showFilters={showFilters} hasFilters={hasFilters} clearFilters={clearFilters}
            startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate}
            setPage={setPage} customerName={customerName} setCustomerName={setCustomerName}
            serviceFilter={serviceFilter} setServiceFilter={setServiceFilter} serviceTypes={serviceTypes}
          />
        )}

        <MobileReceiptsList
          activeTab={activeTab} receiptSearch={receiptSearch} setReceiptSearch={setReceiptSearch}
          receiptEntries={receiptEntries} setReceiptEntry={setReceiptEntry} setAutoDownloadReceipt={setAutoDownloadReceipt}
        />

        <MobileTransactionsList
          activeTab={activeTab} isLoading={isLoading} data={data} groupByDate={groupByDate} fmtDateGroup={fmtDateGroup}
          t={t} setReceiptEntry={setReceiptEntry} openEdit={openEdit} setDeleteId={setDeleteId}
        />

        <MobilePagination page={page} setPage={setPage} totalPages={totalPages} />
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
        <MobileEntryFormDialog
          showForm={showForm} setShowForm={setShowForm} editEntry={editEntry} entryType={entryType}
          setEntryType={setEntryType} rawAmount={rawAmount} setRawAmount={setRawAmount}
          accentColor={accentColor} accentGrad={accentGrad} accentBg={accentBg} form={form}
          serviceTypes={serviceTypes} onSubmit={onSubmit} createMut={createMut} updateMut={updateMut} balance={balance}
        />
      )}

      {/* ── Entry Form: Desktop Panel ── */}
      {!isMobile && (
        <DesktopEntryFormPanel
          showForm={showForm} setShowForm={setShowForm} editEntry={editEntry} entryType={entryType}
          setEntryType={setEntryType} rawAmount={rawAmount} setRawAmount={setRawAmount}
          accentColor={accentColor} accentGrad={accentGrad} accentBg={accentBg} form={form}
          serviceTypes={serviceTypes} onSubmit={onSubmit} createMut={createMut} updateMut={updateMut} balance={balance}
        />
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
