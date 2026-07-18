import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { addPendingEntry, getAllPendingEntries, type PendingLedgerEntry } from "@/lib/offline-db";
import { syncEngine } from "@/lib/sync-engine";
import { useSync } from "@/hooks/use-sync";
import { ReceiptModal } from "@/components/receipt-modal";

import { useLedger, groupByDate, fmtDateGroup, getServiceColor, type EntryForm } from "@/hooks/useLedger";
import { MobileSearchBar, MobileFrequentCustomers, DesktopSearchFilterBar, DesktopFilterPanel, MobileFilterPanel } from "@/components/ledger/LedgerFilters";
import { MobileEntryFormDialog, DesktopEntryFormPanel } from "@/components/ledger/LedgerEntryForm";
import { TableTabsHeader, PendingSyncBanners, DesktopReceiptsPanel, DesktopTransactionsTable, TableFooterPagination, MobileReceiptsList, MobileTransactionsList, MobilePagination } from "@/components/ledger/LedgerTable";
import { LedgerSummaryCards } from "@/components/ledger/LedgerSummaryCards";
import { LedgerMobileHeader } from "@/components/ledger/LedgerMobileHeader";
import { LedgerDesktopHeader } from "@/components/ledger/LedgerDesktopHeader";
import { LedgerQuickAddStrip } from "@/components/ledger/LedgerQuickAddStrip";
import { LedgerRightPanel } from "@/components/ledger/LedgerRightPanel";
import { LedgerMobilePending } from "@/components/ledger/LedgerMobilePending";

export default function Ledger() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { isOffline } = useNetworkStatus();
  const { bgSyncCount } = useSync();

  // ── Local UI state (dialogs, form, inline-edit) ──────────────────────────
  const [pendingEntries, setPendingEntries] = useState<PendingLedgerEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editEntry, setEditEntry] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const [receiptEntry, setReceiptEntry] = useState<any>(null);
  const [entryType, setEntryType] = useState<"credit" | "debit">("credit");
  const [rawAmount, setRawAmount] = useState("0");
  const [inlineEditId, setInlineEditId] = useState<number | null>(null);
  const [inlineEdit, setInlineEdit] = useState<{ date: string; customerName: string; serviceType: string; entryType: "credit" | "debit"; amount: string; description: string }>({ date: "", customerName: "", serviceType: "", entryType: "credit", amount: "0", description: "" });
  const [activeTab, setActiveTab] = useState<"transactions" | "receipts">("transactions");
  const [receiptSearch, setReceiptSearch] = useState("");
  const [autoDownloadReceipt, setAutoDownloadReceipt] = useState(false);

  // ── Offline pending entries ──────────────────────────────────────────────
  const refreshPending = async () => {
    try { const e = await getAllPendingEntries(); setPendingEntries(e.sort((a, b) => b.createdAt - a.createdAt)); } catch {}
  };
  useEffect(() => {
    refreshPending();
    window.addEventListener("sahu-sync-complete", refreshPending);
    window.addEventListener("online", refreshPending);
    return () => { window.removeEventListener("sahu-sync-complete", refreshPending); window.removeEventListener("online", refreshPending); };
  }, []);

  // ── Data layer (filter state, pagination, queries, mutations) ────────────
  const {
    data, isLoading, balance, businessName, businessAddress, businessMobile, businessWebsite,
    createMut, updateMut, deleteMut, deleteAllMut, invalidate,
    serviceTypes, customerNameSuggestions, frequentCustomers, receiptEntries,
    page, setPage, startDate, setStartDate, endDate, setEndDate,
    customerName, setCustomerName, serviceFilter, setServiceFilter,
    showFilters, setShowFilters, hasFilters, totalPages, clearFilters,
    quickAdd, setQuickAdd, quickAddSaving, saveQuickAdd,
  } = useLedger(receiptSearch);

  // ── Form ─────────────────────────────────────────────────────────────────
  const form = useForm<EntryForm>({
    defaultValues: { date: new Date().toISOString().split("T")[0], customerName: "", serviceType: "", credit: 0, debit: 0, description: "" }
  });

  const openCreate = () => {
    setEditEntry(null); setEntryType("credit"); setRawAmount("0");
    form.reset({ date: new Date().toISOString().split("T")[0], customerName: "", serviceType: "", credit: 0, debit: 0, description: "" });
    setShowForm(true);
  };
  const openEdit = (entry: any) => {
    const etype = entry.credit > 0 ? "credit" : "debit";
    if (isMobile) {
      setEditEntry(entry); setEntryType(etype); setRawAmount(String(etype === "credit" ? entry.credit : entry.debit));
      form.reset({ date: entry.date, customerName: entry.customerName, serviceType: entry.serviceType, credit: entry.credit, debit: entry.debit, description: entry.description });
      setShowForm(true);
    } else {
      setInlineEditId(entry.id);
      setInlineEdit({ date: entry.date, customerName: entry.customerName, serviceType: entry.serviceType, entryType: etype, amount: String(etype === "credit" ? entry.credit : entry.debit), description: entry.description || "" });
    }
  };
  const saveInlineEdit = async () => {
    if (!inlineEditId) return;
    const amt = parseFloat(inlineEdit.amount) || 0;
    try {
      await updateMut.mutateAsync({ id: inlineEditId, data: { date: inlineEdit.date, customerName: inlineEdit.customerName, serviceType: inlineEdit.serviceType, credit: inlineEdit.entryType === "credit" ? amt : 0, debit: inlineEdit.entryType === "debit" ? amt : 0, description: inlineEdit.description } });
      toast.success("Entry updated"); setInlineEditId(null); invalidate();
    } catch { toast({ title: "Failed to update entry", variant: "destructive" }); }
  };
  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (editEntry) {
        await updateMut.mutateAsync({ id: editEntry.id, data: values });
        toast.success("Entry updated"); setShowForm(false); invalidate();
      } else if (isOffline) {
        const pending: PendingLedgerEntry = { id: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`, date: values.date, customerName: values.customerName, serviceType: values.serviceType, credit: Number(values.credit) || 0, debit: Number(values.debit) || 0, description: values.description || "", createdAt: Date.now(), retryCount: 0 };
        await addPendingEntry(pending); await syncEngine.markPendingAdded(); await refreshPending();
        form.reset({ date: new Date().toISOString().split("T")[0], customerName: "", serviceType: "", credit: 0, debit: 0, description: "" });
        setShowForm(false);
        toast({ title: "Saved offline", description: "Will sync automatically when connected" });
      } else {
        await createMut.mutateAsync({ data: values });
        toast.success("Entry created");
        form.reset({ date: new Date().toISOString().split("T")[0], customerName: "", serviceType: "", credit: 0, debit: 0, description: "" });
        setShowForm(false); invalidate();
      }
    } catch { toast({ title: "Failed to save entry", variant: "destructive" }); }
  });
  const confirmDelete = async () => {
    if (!deleteId) return;
    try { await deleteMut.mutateAsync({ id: deleteId }); toast.success("Entry deleted"); setDeleteId(null); invalidate(); }
    catch { toast({ title: "Failed to delete", variant: "destructive" }); }
  };

  // Sync rawAmount + entryType → form credit/debit fields
  useEffect(() => {
    const amt = parseFloat(rawAmount) || 0;
    if (entryType === "credit") { form.setValue("credit", amt); form.setValue("debit", 0); }
    else { form.setValue("credit", 0); form.setValue("debit", amt); }
  }, [entryType, rawAmount]);

  const accentColor = entryType === "credit" ? "#059669" : "#e11d48";
  const accentGrad = entryType === "credit" ? "linear-gradient(135deg, #064e3b, #059669)" : "linear-gradient(135deg, #881337, #e11d48)";
  const accentBg = entryType === "credit" ? "rgba(5,150,105,0.08)" : "rgba(225,29,72,0.08)";

  return (
    <Layout>
      <datalist id="ledger-customer-names">{customerNameSuggestions.map(n => <option key={n} value={n} />)}</datalist>
      <div className="space-y-4">

        {/* ── Mobile ── */}
        <LedgerMobileHeader balance={balance} t={t} activeTab={activeTab} setActiveTab={setActiveTab} onDeleteAll={() => setShowDeleteAll(true)} />
        <MobileSearchBar customerName={customerName} setCustomerName={setCustomerName} setPage={setPage} customerNameSuggestions={customerNameSuggestions} showFilters={showFilters} setShowFilters={setShowFilters} hasFilters={hasFilters} t={t} />
        <MobileFrequentCustomers frequentCustomers={frequentCustomers} customerName={customerName} setCustomerName={setCustomerName} setPage={setPage} />

        {/* ── Desktop ── */}
        <div className="hidden md:flex md:flex-col" style={{ height: "calc(100vh - 128px)", gap: 12 }}>
          <LedgerDesktopHeader t={t} onDeleteAll={() => setShowDeleteAll(true)} />
          <LedgerSummaryCards balance={balance} isLoading={isLoading} data={data} t={t} />
          <LedgerQuickAddStrip quickAdd={quickAdd} setQuickAdd={setQuickAdd} serviceTypes={serviceTypes} saveQuickAdd={saveQuickAdd} quickAddSaving={quickAddSaving} />
          <div style={{ flex: 1, minHeight: 0, display: "flex", gap: 14 }}>
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              <DesktopSearchFilterBar customerName={customerName} setCustomerName={setCustomerName} setPage={setPage} showFilters={showFilters} setShowFilters={setShowFilters} hasFilters={hasFilters} startDate={startDate} endDate={endDate} serviceFilter={serviceFilter} clearFilters={clearFilters} />
              <DesktopFilterPanel showFilters={showFilters} t={t} startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate} setPage={setPage} serviceTypes={serviceTypes} serviceFilter={serviceFilter} setServiceFilter={setServiceFilter} getServiceColor={getServiceColor} />
              <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 12px rgba(11,44,96,0.07)", border: "1px solid #e2e8f0", flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
                <TableTabsHeader activeTab={activeTab} setActiveTab={setActiveTab} data={data} page={page} totalPages={totalPages} receiptEntries={receiptEntries} hasFilters={hasFilters} isOffline={isOffline} bgSyncCount={bgSyncCount} />
                <PendingSyncBanners pendingEntries={pendingEntries} bgSyncCount={bgSyncCount} />
                <DesktopReceiptsPanel activeTab={activeTab} receiptSearch={receiptSearch} setReceiptSearch={setReceiptSearch} receiptEntries={receiptEntries} getServiceColor={getServiceColor} setReceiptEntry={setReceiptEntry} setAutoDownloadReceipt={setAutoDownloadReceipt} />
                <DesktopTransactionsTable activeTab={activeTab} data={data} isLoading={isLoading} page={page} hasFilters={hasFilters} openCreate={openCreate} inlineEditId={inlineEditId} inlineEdit={inlineEdit} setInlineEdit={setInlineEdit} serviceTypes={serviceTypes} saveInlineEdit={saveInlineEdit} setInlineEditId={setInlineEditId} updateMut={updateMut} getServiceColor={getServiceColor} setReceiptEntry={setReceiptEntry} openEdit={openEdit} setDeleteId={setDeleteId} />
                <TableFooterPagination activeTab={activeTab} data={data} page={page} setPage={setPage} totalPages={totalPages} />
              </div>
            </div>
            <LedgerRightPanel balance={balance} data={data} onAddEntry={openCreate} onShowReceipts={() => setActiveTab("receipts")} onShowDeleteAll={() => setShowDeleteAll(true)} />
          </div>
        </div>

        {/* ── Mobile continued ── */}
        <LedgerMobilePending pendingEntries={pendingEntries} bgSyncCount={bgSyncCount} isOffline={isOffline} activeTab={activeTab} />
        {activeTab === "transactions" && <MobileFilterPanel showFilters={showFilters} hasFilters={hasFilters} clearFilters={clearFilters} startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate} setPage={setPage} customerName={customerName} setCustomerName={setCustomerName} serviceFilter={serviceFilter} setServiceFilter={setServiceFilter} serviceTypes={serviceTypes} />}
        <MobileReceiptsList activeTab={activeTab} receiptSearch={receiptSearch} setReceiptSearch={setReceiptSearch} receiptEntries={receiptEntries} setReceiptEntry={setReceiptEntry} setAutoDownloadReceipt={setAutoDownloadReceipt} />
        <MobileTransactionsList activeTab={activeTab} isLoading={isLoading} data={data} groupByDate={groupByDate} fmtDateGroup={fmtDateGroup} t={t} setReceiptEntry={setReceiptEntry} openEdit={openEdit} setDeleteId={setDeleteId} />
        <MobilePagination page={page} setPage={setPage} totalPages={totalPages} />
      </div>

      {/* ── Floating action button (mobile) ── */}
      {isMobile && <button onClick={openCreate} data-testid="button-new-entry" style={{ position: "fixed", bottom: 88, right: 20, width: 56, height: 56, borderRadius: 18, background: "linear-gradient(135deg,#f97316,#fb923c)", boxShadow: "0 8px 24px rgba(249,115,22,0.45)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 50 }}><Plus size={24} color="#fff" strokeWidth={2.5} /></button>}

      {/* ── Entry form ── */}
      {isMobile && <MobileEntryFormDialog showForm={showForm} setShowForm={setShowForm} editEntry={editEntry} entryType={entryType} setEntryType={setEntryType} rawAmount={rawAmount} setRawAmount={setRawAmount} accentColor={accentColor} accentGrad={accentGrad} accentBg={accentBg} form={form} serviceTypes={serviceTypes} onSubmit={onSubmit} createMut={createMut} updateMut={updateMut} balance={balance} />}
      {!isMobile && <DesktopEntryFormPanel showForm={showForm} setShowForm={setShowForm} editEntry={editEntry} entryType={entryType} setEntryType={setEntryType} rawAmount={rawAmount} setRawAmount={setRawAmount} accentColor={accentColor} accentGrad={accentGrad} accentBg={accentBg} form={form} serviceTypes={serviceTypes} onSubmit={onSubmit} createMut={createMut} updateMut={updateMut} balance={balance} />}

      {/* ── Delete single entry ── */}
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

      {/* ── Receipt modal ── */}
      <ReceiptModal entry={receiptEntry} open={!!receiptEntry} onClose={() => { setReceiptEntry(null); setAutoDownloadReceipt(false); }} businessName={businessName} businessAddress={businessAddress} businessMobile={businessMobile} businessWebsite={businessWebsite} autoDownload={autoDownloadReceipt} onAutoDownloadComplete={() => setAutoDownloadReceipt(false)} />

      {/* ── Delete all ── */}
      <AlertDialog open={showDeleteAll} onOpenChange={setShowDeleteAll}>
        <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-md rounded-2xl md:rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete ALL Transactions?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete <strong>every ledger entry</strong> and reset the balance to <strong>₹0.00</strong>. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteAllMut.mutate()} disabled={deleteAllMut.isPending}>
              {deleteAllMut.isPending ? "Deleting..." : "Yes, Delete All"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
