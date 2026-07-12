import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import {
  type PreviewEntry, type CountResult, type FullReceiptEntry,
  type BusinessInfo, type ModalAction, type UserOverview,
  MONTH_OPTIONS,
} from "@/components/receipt-export/types";

export function useReceiptExport() {
  const now          = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const today        = now.toISOString().split("T")[0];

  const { toast } = useToast();

  // ── Shared filter state ──
  const [startDate,   setStartDate]   = useState(firstOfMonth);
  const [endDate,     setEndDate]     = useState(today);
  const [userId,      setUserId]      = useState("all");
  const [searchQ,     setSearchQ]     = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange,   setDateRange]   = useState("month");

  // ── Results state ──
  const [preview,       setPreview]       = useState<CountResult | null>(null);
  const [previewing,    setPreviewing]    = useState(false);
  const [downloading,   setDownloading]   = useState(false);
  const [selected,      setSelected]      = useState<Set<string>>(new Set());
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  // ── Export format ──
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel">("pdf");
  const [exported,     setExported]     = useState(false);

  // ── Monthly export state ──
  const [trigMonth,        setTrigMonth]        = useState(now.getMonth() === 0 ? 12 : now.getMonth());
  const [trigYear,         setTrigYear]         = useState(now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear());
  const [emailing,         setEmailing]         = useState(false);
  const [monthDownloading, setMonthDownloading] = useState(false);

  // ── Single-receipt action modal ──
  const [modalOpen,       setModalOpen]       = useState(false);
  const [modalEntry,      setModalEntry]      = useState<FullReceiptEntry | null>(null);
  const [modalAction,     setModalAction]     = useState<ModalAction>(null);
  const [modalLoadingFor, setModalLoadingFor] = useState<string | null>(null);
  const [business, setBusiness] = useState<BusinessInfo>({
    businessName: "SAHU CSC Center", businessAddress: "", businessMobile: "", businessWebsite: "",
  });

  // ── Data: users list for operator filter ──
  const { data: usersOverview = [] } = useQuery<UserOverview[]>({
    queryKey: ["admin", "users-overview"],
    queryFn:  () => customFetch<UserOverview[]>("/api/admin/users-overview"),
  });

  // ── Computed ──────────────────────────────────────────────────────────────────
  const nextExport = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 5, 0)
    .toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const years = [now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2];

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const openReceiptAction = async (receiptNumber: string, action: ModalAction = null) => {
    setModalLoadingFor(receiptNumber);
    try {
      const data = await customFetch<FullReceiptEntry & { business: BusinessInfo }>(
        `/api/admin/receipts/single/${encodeURIComponent(receiptNumber)}`
      );
      setBusiness(data.business);
      setModalEntry(data);
      setModalAction(action);
      setModalOpen(true);
    } catch (err: unknown) {
      toast({ title: "Could not load receipt", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally {
      setModalLoadingFor(null);
    }
  };

  const setQuickRange = (preset: "today" | "week" | "month" | "lastMonth" | "year") => {
    const n = new Date();
    let start: Date;
    let end = new Date(n);
    switch (preset) {
      case "today":     start = new Date(n); break;
      case "week":      start = new Date(n); start.setDate(start.getDate() - 6); break;
      case "month":     start = new Date(n.getFullYear(), n.getMonth(), 1); break;
      case "lastMonth":
        start = new Date(n.getFullYear(), n.getMonth() - 1, 1);
        end   = new Date(n.getFullYear(), n.getMonth(), 0);
        break;
      case "year":      start = new Date(n.getFullYear(), 0, 1); break;
      default:          start = new Date(n);
    }
    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
    setPreview(null); setSelected(new Set()); setExpandedEntry(null);
  };

  /** Builds the shared query-param string used by all three bulk-export endpoints. */
  const buildParams = () => {
    const p = new URLSearchParams({ startDate, endDate });
    if (userId !== "all") p.set("userId", userId);
    return p.toString();
  };

  /** Calls /api/admin/receipts/bulk-export/count */
  const handlePreview = async () => {
    if (!startDate || !endDate) { toast({ title: "Select both dates", variant: "destructive" }); return; }
    if (startDate > endDate)    { toast({ title: "Start date must be before end date", variant: "destructive" }); return; }
    setPreviewing(true); setPreview(null); setSelected(new Set()); setExpandedEntry(null);
    try {
      const data: CountResult = await customFetch(`/api/admin/receipts/bulk-export/count?${buildParams()}`);
      setPreview(data);
      if (data.entries.length > 0) setSelected(new Set(data.entries.map(e => e.receiptNumber)));
    } catch (err: unknown) {
      toast({ title: "Preview failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally { setPreviewing(false); }
  };

  /** Calls /api/admin/receipts/bulk-export/download (PDF ZIP) or /api/admin/receipts/bulk-export/excel */
  const handleDownload = async () => {
    if (!preview || preview.count === 0) { toast({ title: "No receipts to download", variant: "destructive" }); return; }
    if (selected.size === 0) { toast({ title: "Nothing selected", description: "Select at least one receipt to download.", variant: "destructive" }); return; }
    setDownloading(true);
    try {
      const params = new URLSearchParams(buildParams());
      params.set("receiptNumbers", Array.from(selected).join(","));
      const isExcel  = exportFormat === "excel";
      const endpoint = isExcel ? "/api/admin/receipts/bulk-export/excel" : "/api/admin/receipts/bulk-export/download";
      const res  = await fetch(`${endpoint}?${params.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Download failed");
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = `receipts-${startDate}-to-${endDate}.${isExcel ? "xlsx" : "zip"}`; a.click();
      URL.revokeObjectURL(url);
      toast({
        title: "Download started",
        description: isExcel
          ? `${selected.size} receipt${selected.size !== 1 ? "s" : ""} in Excel sheet`
          : `${selected.size} PDF receipt${selected.size !== 1 ? "s" : ""} in ZIP`,
      });
      setExported(true); setTimeout(() => setExported(false), 2000);
    } catch (err: unknown) {
      toast({ title: "Download failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally { setDownloading(false); }
  };

  const handleMonthDownload = async () => {
    setMonthDownloading(true);
    try {
      const res  = await fetch(`/api/admin/receipts/monthly-export/download?year=${trigYear}&month=${trigMonth}`, { credentials: "include" });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = `receipts-${trigYear}-${String(trigMonth).padStart(2, "0")}.zip`; a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Downloaded!", description: `ZIP for ${MONTH_OPTIONS.find(m => m.v === trigMonth)?.l} ${trigYear} saved.` });
    } catch { toast({ title: "Download failed", variant: "destructive" }); }
    finally  { setMonthDownloading(false); }
  };

  const handleMonthEmail = async () => {
    setEmailing(true);
    try {
      const res = await fetch("/api/admin/receipts/monthly-export/trigger", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year: trigYear, month: trigMonth }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Failed to send");
      toast({ title: "Email sent!", description: `Monthly export for ${MONTH_OPTIONS.find(m => m.v === trigMonth)?.l} ${trigYear} emailed.` });
    } catch (err: unknown) {
      toast({ title: "Failed to send", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally { setEmailing(false); }
  };

  // ── Derived values ────────────────────────────────────────────────────────────
  const displayedEntries = preview?.entries ?? [];
  const filteredEntries  = displayedEntries.filter(e =>
    e.customerName.toLowerCase().includes(searchQ.toLowerCase())  ||
    e.receiptNumber.toLowerCase().includes(searchQ.toLowerCase()) ||
    e.serviceType.toLowerCase().includes(searchQ.toLowerCase())
  );
  const selTotal    = filteredEntries.filter(e => selected.has(e.receiptNumber)).reduce((s, e) => s + e.amount, 0);
  const totalAmount = displayedEntries.reduce((s, e) => s + e.amount, 0);
  const allFilteredSelected = filteredEntries.length > 0 && filteredEntries.every(e => selected.has(e.receiptNumber));

  const toggleAll = () => {
    if (allFilteredSelected) {
      const next = new Set(selected);
      filteredEntries.forEach(e => next.delete(e.receiptNumber));
      setSelected(next);
    } else {
      const next = new Set(selected);
      filteredEntries.forEach(e => next.add(e.receiptNumber));
      setSelected(next);
    }
  };
  const toggleEntry = (id: string) => {
    const s = new Set(selected); if (s.has(id)) s.delete(id); else s.add(id); setSelected(s);
  };

  return {
    // Filter state
    startDate, setStartDate,
    endDate,   setEndDate,
    userId,    setUserId,
    searchQ,   setSearchQ,
    showFilters, setShowFilters,
    dateRange, setDateRange,
    today,
    // Results state
    preview, previewing, downloading,
    selected, setSelected,
    expandedEntry, setExpandedEntry,
    // Export format
    exportFormat, setExportFormat,
    exported,
    // Monthly state
    trigMonth, setTrigMonth,
    trigYear,  setTrigYear,
    emailing, monthDownloading,
    // Modal state
    modalOpen, setModalOpen,
    modalEntry, setModalEntry,
    modalAction, setModalAction,
    modalLoadingFor,
    business,
    // Data
    usersOverview,
    // Computed
    nextExport, years,
    displayedEntries, filteredEntries,
    selTotal, totalAmount, allFilteredSelected,
    // Handlers
    buildParams,
    handlePreview,
    handleDownload,
    handleMonthDownload,
    handleMonthEmail,
    openReceiptAction,
    setQuickRange,
    toggleAll,
    toggleEntry,
  };
}

export type ReceiptExportState = ReturnType<typeof useReceiptExport>;
