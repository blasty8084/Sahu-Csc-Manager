import { useState, useMemo } from "react";
import {
  Plus, Pencil, Trash2, Download, X, ChevronLeft, ChevronRight,
  Receipt, Search, IndianRupee, User, FileText, Calendar,
  CheckCircle2, TrendingUp, TrendingDown, Wallet
} from "lucide-react";
import "./_group.css";

// ── Mock Data ──────────────────────────────────────────────────────────────────

const MOCK_BALANCE = {
  balance: 24750.50,
  totalCredits: 38500.00,
  totalDebits: 13749.50,
};

const SERVICE_COLOR_MAP: Record<string, string> = {
  "PAN Card": "#7c3aed",
  "Aadhaar Update": "#0891b2",
  "Passport Seva": "#0b2c60",
  "Income Certificate": "#059669",
  "Voter ID": "#d97706",
  "Ration Card": "#dc2626",
  "Death Certificate": "#64748b",
  "Birth Certificate": "#0284c7",
  "Driving License": "#9333ea",
  "PM-Kisan": "#16a34a",
  "Jeevan Praman": "#0f766e",
  "Caste Certificate": "#b45309",
};
const getServiceColor = (name: string) => SERVICE_COLOR_MAP[name] || "#475569";

const SERVICE_TYPES = Object.keys(SERVICE_COLOR_MAP);

interface Entry {
  id: number;
  receiptNumber: string;
  date: string;
  customerName: string;
  serviceType: string;
  credit: number;
  debit: number;
  balance: number;
  description: string;
}

const MOCK_ENTRIES: Entry[] = [
  { id: 10, receiptNumber: "CSC-2026-0010", date: "2026-07-14", customerName: "Ramesh Kumar Yadav", serviceType: "Income Certificate", credit: 250, debit: 0, balance: 24750.50, description: "Urgency charges applied" },
  { id: 9,  receiptNumber: "CSC-2026-0009", date: "2026-07-14", customerName: "Sunita Devi",         serviceType: "PAN Card",          credit: 120, debit: 0, balance: 24500.50, description: "" },
  { id: 8,  receiptNumber: "CSC-2026-0008", date: "2026-07-13", customerName: "Mohan Lal Sharma",   serviceType: "Aadhaar Update",    credit: 50,  debit: 0, balance: 24380.50, description: "Address update" },
  { id: 7,  receiptNumber: "CSC-2026-0007", date: "2026-07-13", customerName: "Priya Singh",         serviceType: "Voter ID",          credit: 80,  debit: 0, balance: 24330.50, description: "" },
  { id: 6,  receiptNumber: "CSC-2026-0006", date: "2026-07-12", customerName: "Arvind Prasad",       serviceType: "Ration Card",       credit: 0,   debit: 200, balance: 24250.50, description: "BPL card correction" },
  { id: 5,  receiptNumber: "CSC-2026-0005", date: "2026-07-12", customerName: "Geeta Kumari",        serviceType: "Birth Certificate", credit: 150, debit: 0, balance: 24450.50, description: "" },
  { id: 4,  receiptNumber: "CSC-2026-0004", date: "2026-07-11", customerName: "Vijay Tiwari",        serviceType: "Driving License",   credit: 350, debit: 0, balance: 24300.50, description: "DL renewal" },
  { id: 3,  receiptNumber: "CSC-2026-0003", date: "2026-07-11", customerName: "Asha Rani",           serviceType: "PM-Kisan",          credit: 0,   debit: 50,  balance: 23950.50, description: "Refund issued" },
  { id: 2,  receiptNumber: "CSC-2026-0002", date: "2026-07-10", customerName: "Deepak Narayan",      serviceType: "Jeevan Praman",     credit: 100, debit: 0, balance: 24000.50, description: "" },
  { id: 1,  receiptNumber: "CSC-2026-0001", date: "2026-07-10", customerName: "Lakshmi Sharma",      serviceType: "Passport Seva",     credit: 500, debit: 0, balance: 23900.50, description: "Tatkal passport" },
];

const todayStr = "2026-07-14";

// ── Component ────────────────────────────────────────────────────────────────

export function Current() {
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [activeTab, setActiveTab] = useState<"transactions" | "receipts">("transactions");
  const [receiptSearch, setReceiptSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [entryType, setEntryType] = useState<"credit" | "debit">("credit");
  const [rawAmount, setRawAmount] = useState("0");
  const [quickAdd, setQuickAdd] = useState({ date: todayStr, customerName: "", serviceType: "", entryType: "credit" as "credit" | "debit", amount: "", description: "" });
  const [inlineEditId, setInlineEditId] = useState<number | null>(null);
  const [inlineEdit, setInlineEdit] = useState({ date: "", customerName: "", serviceType: "", entryType: "credit" as "credit" | "debit", amount: "0", description: "" });
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // form state for new-entry modal
  const [formValues, setFormValues] = useState({ date: todayStr, customerName: "", serviceType: "", description: "" });

  const hasFilters = !!(startDate || endDate || customerName || serviceFilter);

  const clearFilters = () => { setStartDate(""); setEndDate(""); setCustomerName(""); setServiceFilter(""); setPage(1); };

  // Filtered entries
  const filteredEntries = useMemo(() => {
    let entries = MOCK_ENTRIES;
    if (startDate) entries = entries.filter(e => e.date >= startDate);
    if (endDate) entries = entries.filter(e => e.date <= endDate);
    if (customerName) entries = entries.filter(e => e.customerName.toLowerCase().includes(customerName.toLowerCase()));
    if (serviceFilter) entries = entries.filter(e => e.serviceType === serviceFilter);
    return entries;
  }, [startDate, endDate, customerName, serviceFilter]);

  const ITEMS_PER_PAGE = 15;
  const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE);
  const pagedEntries = filteredEntries.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const receiptEntries = useMemo(() => {
    const q = receiptSearch.trim().toLowerCase();
    return MOCK_ENTRIES.filter(e =>
      !q || e.receiptNumber.toLowerCase().includes(q) ||
      e.customerName.toLowerCase().includes(q) ||
      e.serviceType.toLowerCase().includes(q)
    );
  }, [receiptSearch]);

  const accentColor = entryType === "credit" ? "#059669" : "#e11d48";
  const accentGrad = entryType === "credit"
    ? "linear-gradient(135deg, #064e3b, #059669)"
    : "linear-gradient(135deg, #881337, #e11d48)";
  const accentBg = entryType === "credit" ? "rgba(5,150,105,0.08)" : "rgba(225,29,72,0.08)";

  const pageSummary = pagedEntries.reduce(
    (acc, e) => ({ cr: acc.cr + e.credit, dr: acc.dr + e.debit }),
    { cr: 0, dr: 0 }
  );

  const openEdit = (entry: Entry) => {
    setInlineEditId(entry.id);
    const etype = entry.credit > 0 ? "credit" : "debit";
    setInlineEdit({ date: entry.date, customerName: entry.customerName, serviceType: entry.serviceType, entryType: etype, amount: String(etype === "credit" ? entry.credit : entry.debit), description: entry.description });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column" }}>

      {/* ── Page wrapper: sidebar + right panel ── */}
      <div style={{ display: "flex", gap: 16, padding: 16, minHeight: "100vh", boxSizing: "border-box" }}>

        {/* ── LEFT SIDEBAR (dark navy) ── */}
        <div style={{ width: 240, flexShrink: 0, display: "flex", flexDirection: "column", background: "#0b2c60", borderRadius: 20, color: "#fff", overflow: "hidden" }}>

          {/* Page title */}
          <div style={{ padding: "16px 18px 12px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 3 }}>CSC Ledger</p>
            <h1 style={{ fontSize: 17, fontWeight: 900, color: "#fff", margin: 0, lineHeight: 1.2 }}>Account Book</h1>
          </div>

          {/* Balance card */}
          <div style={{ padding: "14px 18px 14px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 7 }}>Current Balance</p>
            <p style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-1px", lineHeight: 1, marginBottom: 12 }}>
              ₹{MOCK_BALANCE.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
              <div style={{ background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 10, padding: "8px 10px" }}>
                <p style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 3 }}>Credits</p>
                <p style={{ fontSize: 13, fontWeight: 800, color: "#4ade80" }}>+₹{MOCK_BALANCE.totalCredits.toLocaleString("en-IN")}</p>
              </div>
              <div style={{ background: "rgba(251,113,133,0.12)", border: "1px solid rgba(251,113,133,0.2)", borderRadius: 10, padding: "8px 10px" }}>
                <p style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 3 }}>Debits</p>
                <p style={{ fontSize: 13, fontWeight: 800, color: "#fb7185" }}>−₹{MOCK_BALANCE.totalDebits.toLocaleString("en-IN")}</p>
              </div>
            </div>
            <button
              onClick={() => { setShowForm(true); setEntryType("credit"); setRawAmount("0"); setFormValues({ date: todayStr, customerName: "", serviceType: "", description: "" }); }}
              style={{ width: "100%", height: 42, borderRadius: 12, border: "none", background: "#f97316", color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 16px rgba(249,115,22,0.45)" }}>
              <Plus size={16} strokeWidth={2.5} />New Entry
            </button>
          </div>

          {/* Filters */}
          <div style={{ flex: 1, padding: "14px 16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 13 }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Filters</p>

            {/* Date presets */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {[
                { label: "Today", key: "today", sd: todayStr, ed: todayStr },
                { label: "This Week", key: "week", sd: "2026-07-07", ed: todayStr },
                { label: "This Month", key: "month", sd: "2026-07-01", ed: todayStr },
              ].map(({ label, key, sd, ed }) => {
                const isActive = key === "today" ? (startDate === sd && endDate === ed) : key === "week" ? (startDate === sd && endDate === ed) : (startDate === sd && endDate === ed);
                return (
                  <button key={key} onClick={() => { setStartDate(sd); setEndDate(ed); setPage(1); }}
                    style={{ padding: "5px 11px", borderRadius: 20, border: `1px solid ${isActive ? "#f97316" : "rgba(255,255,255,0.15)"}`, background: isActive ? "#f97316" : "transparent", color: isActive ? "#fff" : "rgba(255,255,255,0.65)", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
                    {label}
                  </button>
                );
              })}
              {hasFilters && (
                <button onClick={clearFilters} style={{ padding: "5px 11px", borderRadius: 20, border: "1px solid rgba(251,113,133,0.3)", background: "rgba(225,29,72,0.1)", color: "#fb7185", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
                  Clear ×
                </button>
              )}
            </div>

            {/* Customer search */}
            <div style={{ position: "relative" }}>
              <Search size={12} color="rgba(255,255,255,0.3)" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", zIndex: 1 }} />
              <input value={customerName} onChange={e => { setCustomerName(e.target.value); setPage(1); }}
                placeholder="Search customer…"
                style={{ width: "100%", height: 36, paddingLeft: 28, paddingRight: 10, borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.07)", fontSize: 12, color: "#fff", outline: "none", fontWeight: 500, boxSizing: "border-box" }} />
            </div>

            {/* Date range */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <p style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>From</p>
                <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setPage(1); }}
                  style={{ width: "100%", height: 34, paddingInline: 8, borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.07)", fontSize: 10, color: "#fff", outline: "none", colorScheme: "dark", boxSizing: "border-box" }} />
              </div>
              <div>
                <p style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>To</p>
                <input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setPage(1); }}
                  style={{ width: "100%", height: 34, paddingInline: 8, borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.07)", fontSize: 10, color: "#fff", outline: "none", colorScheme: "dark", boxSizing: "border-box" }} />
              </div>
            </div>

            {/* Service type list */}
            <div>
              <p style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>Service type</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {SERVICE_TYPES.map(s => {
                  const color = getServiceColor(s);
                  const active = serviceFilter === s;
                  return (
                    <button key={s} onClick={() => { setServiceFilter(active ? "" : s); setPage(1); }}
                      style={{ textAlign: "left", padding: "6px 10px", borderRadius: 8, border: `1px solid ${active ? color + "60" : "transparent"}`, background: active ? color + "25" : "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom actions */}
          <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", gap: 8 }}>
            <button
              style={{ height: 38, borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "rgba(255,255,255,0.75)", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Download size={14} />Export to Excel
            </button>
            <button
              style={{ height: 38, borderRadius: 10, border: "1px solid rgba(251,113,133,0.3)", background: "rgba(225,29,72,0.08)", color: "#fb7185", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Trash2 size={14} />Delete All Entries
            </button>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>

          {/* ── Quick-add strip ── */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "10px 16px", display: "flex", gap: 8, alignItems: "center", boxShadow: "0 2px 12px rgba(11,44,96,0.07)", border: "1px solid rgba(11,44,96,0.06)", flexShrink: 0 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#f97316,#fb923c)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(249,115,22,0.35)" }}>
              <Plus size={14} color="#fff" strokeWidth={3} />
            </div>
            <input type="date" value={quickAdd.date} onChange={e => setQuickAdd(p => ({ ...p, date: e.target.value }))}
              style={{ height: 36, paddingInline: 10, borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 12, color: "#0b2c60", outline: "none", background: "#fafbff", width: 140, fontFamily: "monospace", fontWeight: 600, boxSizing: "border-box" }} />
            <input value={quickAdd.customerName} onChange={e => setQuickAdd(p => ({ ...p, customerName: e.target.value }))}
              placeholder="Customer name *"
              style={{ height: 36, paddingInline: 10, borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 12, color: "#0b2c60", outline: "none", background: "#fafbff", flex: 1, fontWeight: 600, boxSizing: "border-box" }} />
            <select value={quickAdd.serviceType} onChange={e => setQuickAdd(p => ({ ...p, serviceType: e.target.value }))}
              style={{ height: 36, paddingInline: 10, borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 12, color: quickAdd.serviceType ? "#0b2c60" : "#94a3b8", outline: "none", background: "#fafbff", width: 160, boxSizing: "border-box" }}>
              <option value="">Service type *</option>
              {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div style={{ display: "flex", borderRadius: 9, overflow: "hidden", border: "1.5px solid #e2e8f0", flexShrink: 0 }}>
              <button onClick={() => setQuickAdd(p => ({ ...p, entryType: "credit" }))}
                style={{ height: 36, paddingInline: 12, border: "none", background: quickAdd.entryType === "credit" ? "rgba(5,150,105,0.1)" : "#fff", color: quickAdd.entryType === "credit" ? "#059669" : "#94a3b8", fontSize: 12, fontWeight: 800, cursor: "pointer", borderRight: "1px solid #e2e8f0" }}>
                Cr
              </button>
              <button onClick={() => setQuickAdd(p => ({ ...p, entryType: "debit" }))}
                style={{ height: 36, paddingInline: 12, border: "none", background: quickAdd.entryType === "debit" ? "rgba(225,29,72,0.08)" : "#fff", color: quickAdd.entryType === "debit" ? "#e11d48" : "#94a3b8", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>
                Dr
              </button>
            </div>
            <input type="number" value={quickAdd.amount} min="0" step="0.01"
              onChange={e => setQuickAdd(p => ({ ...p, amount: e.target.value }))}
              placeholder="Amount *"
              style={{ height: 36, paddingInline: 10, borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, color: "#0b2c60", outline: "none", background: "#fafbff", width: 120, textAlign: "right", fontWeight: 700, boxSizing: "border-box" }} />
            <input value={quickAdd.description} onChange={e => setQuickAdd(p => ({ ...p, description: e.target.value }))}
              placeholder="Note (optional)"
              style={{ height: 36, paddingInline: 10, borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 12, color: "#64748b", outline: "none", background: "#fafbff", width: 130, boxSizing: "border-box" }} />
            <button
              style={{ height: 36, paddingInline: 18, borderRadius: 9, border: "none", background: "linear-gradient(135deg,#f97316,#fb923c)", color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", flexShrink: 0, boxShadow: "0 2px 10px rgba(249,115,22,0.35)" }}>
              Add →
            </button>
          </div>

          {/* ── Main table card ── */}
          <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 20px rgba(11,44,96,0.08)", border: "1px solid rgba(11,44,96,0.06)", flex: 1, display: "flex", flexDirection: "column" }}>

            {/* Tab toolbar */}
            <div style={{ padding: "14px 18px 0", borderBottom: "1px solid rgba(11,44,96,0.07)", flexShrink: 0 }}>
              <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 13, padding: 4, gap: 4, marginBottom: 12 }}>
                {(["transactions", "receipts"] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    style={{ flex: 1, height: 36, borderRadius: 10, border: "none", cursor: "pointer", background: activeTab === tab ? "#fff" : "transparent", color: activeTab === tab ? "#0b2c60" : "#64748b", fontWeight: activeTab === tab ? 800 : 600, fontSize: 13, boxShadow: activeTab === tab ? "0 2px 8px rgba(11,44,96,0.10)" : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.15s" }}>
                    {tab === "transactions" ? <><FileText size={13} />Transactions</> : <><Receipt size={13} />Receipt History</>}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 12 }}>
                <p style={{ fontSize: 11, color: "#94a3b8" }}>
                  {activeTab === "transactions"
                    ? `${filteredEntries.length} total entries · Page ${page} of ${Math.max(totalPages, 1)}`
                    : `${receiptEntries.length} receipt${receiptEntries.length !== 1 ? "s" : ""} found`}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {activeTab === "transactions" && hasFilters && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#f97316", background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: 20, padding: "4px 12px" }}>Filtered</span>
                  )}
                </div>
              </div>
            </div>

            {/* ── Receipt History tab ── */}
            {activeTab === "receipts" && (
              <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ position: "relative" }}>
                  <Search size={13} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input value={receiptSearch} onChange={e => setReceiptSearch(e.target.value)}
                    placeholder="Search by receipt no., customer name, or service…"
                    style={{ width: "100%", height: 40, paddingLeft: 34, paddingRight: 12, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#f8fafc", fontSize: 13, color: "#0b2c60", outline: "none", boxSizing: "border-box", fontWeight: 500 }} />
                </div>
                {receiptEntries.length === 0 ? (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
                    <div style={{ width: 60, height: 60, borderRadius: 18, background: "rgba(11,44,96,0.06)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                      <Receipt size={26} color="#0b2c60" opacity={0.3} />
                    </div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: "#0b2c60", marginBottom: 6 }}>No receipts found</p>
                    <p style={{ fontSize: 12, color: "#94a3b8" }}>Try a different search term</p>
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: "rgba(11,44,96,0.03)", borderBottom: "2px solid rgba(11,44,96,0.08)" }}>
                          {[{ label: "Receipt No", w: 140 }, { label: "Date", w: 100 }, { label: "Customer" }, { label: "Service", w: 156 }, { label: "Amount", w: 120, right: true }, { label: "Actions", w: 160, right: true }].map((col: any) => (
                            <th key={col.label} style={{ padding: "10px 14px", textAlign: col.right ? "right" : "left", fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: "0.07em", whiteSpace: "nowrap" as const, width: col.w }}>
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {receiptEntries.map(entry => {
                          const isCredit = entry.credit > 0;
                          const amt = isCredit ? entry.credit : entry.debit;
                          const ec = isCredit ? "#059669" : "#e11d48";
                          return (
                            <tr key={entry.id} style={{ borderBottom: "1px solid rgba(11,44,96,0.05)" }}
                              onMouseEnter={e => (e.currentTarget.style.background = "rgba(11,44,96,0.02)")}
                              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                              <td style={{ padding: "12px 14px", whiteSpace: "nowrap" as const }}>
                                <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 800, color: "#f97316", background: "rgba(249,115,22,0.07)", padding: "3px 8px", borderRadius: 6, border: "1px solid rgba(249,115,22,0.15)" }}>{entry.receiptNumber}</span>
                              </td>
                              <td style={{ padding: "12px 14px", fontFamily: "monospace", fontSize: 12, color: "#64748b", whiteSpace: "nowrap" as const }}>{entry.date}</td>
                              <td style={{ padding: "12px 14px", fontWeight: 700, fontSize: 13, color: "#0b2c60" }}>{entry.customerName}</td>
                              <td style={{ padding: "12px 14px" }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: getServiceColor(entry.serviceType), background: getServiceColor(entry.serviceType) + "14", padding: "3px 10px", borderRadius: 20 }}>{entry.serviceType}</span>
                              </td>
                              <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 900, fontSize: 14, color: ec }}>
                                {isCredit ? "+" : "−"}₹{amt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                              </td>
                              <td style={{ padding: "12px 14px" }}>
                                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                                  <button style={{ height: 32, paddingInline: 10, borderRadius: 8, border: "1.5px solid rgba(11,44,96,0.15)", background: "rgba(11,44,96,0.04)", color: "#0b2c60", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                                    <Receipt size={12} />View
                                  </button>
                                  <button style={{ height: 32, paddingInline: 10, borderRadius: 8, border: "none", background: "linear-gradient(135deg,#0b2c60,#1a4a9e)", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, boxShadow: "0 2px 8px rgba(11,44,96,0.22)" }}>
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

            {/* ── Transactions table ── */}
            <div style={{ flex: 1, overflowX: "auto", overflowY: "auto", display: activeTab !== "transactions" ? "none" : undefined }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                  <tr style={{ background: "#f8fafc", borderBottom: "2px solid rgba(11,44,96,0.08)" }}>
                    {([{ label: "#", w: 44 }, { label: "Receipt No", w: 126 }, { label: "Date", w: 100 }, { label: "Customer" }, { label: "Service", w: 156 }, { label: "Credit", w: 108, right: true }, { label: "Debit", w: 108, right: true }, { label: "Balance", w: 118, right: true }, { label: "Note", w: 130 }, { label: "Actions", w: 100 }] as any[]).map((col: any) => (
                      <th key={col.label} style={{ padding: "11px 14px", textAlign: col.right ? "right" : "left", fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: "0.07em", whiteSpace: "nowrap" as const, width: col.w }}>
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedEntries.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: "center", padding: "72px 0" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                          <div style={{ width: 60, height: 60, borderRadius: 18, background: "rgba(11,44,96,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <FileText size={26} color="#0b2c60" opacity={0.3} />
                          </div>
                          <div>
                            <p style={{ fontSize: 15, fontWeight: 700, color: "#0b2c60", marginBottom: 5 }}>No entries found</p>
                            <p style={{ fontSize: 12, color: "#94a3b8" }}>{hasFilters ? "Try clearing the filters" : "Use New Entry in the sidebar to add your first transaction"}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pagedEntries.map((entry, idx) => {
                      const rowNum = (page - 1) * ITEMS_PER_PAGE + idx + 1;
                      const isEditing = inlineEditId === entry.id;
                      const svcColor = getServiceColor(entry.serviceType);

                      if (isEditing) {
                        return (
                          <tr key={entry.id} style={{ borderBottom: "1px solid rgba(11,44,96,0.1)", background: "rgba(11,44,96,0.025)" }}>
                            <td style={{ padding: "8px 14px", color: "#0b2c60", fontSize: 11, fontWeight: 700 }}>{rowNum}</td>
                            <td style={{ padding: "8px 14px", whiteSpace: "nowrap" as const }}>
                              <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 800, color: "#f97316", background: "rgba(249,115,22,0.07)", padding: "3px 8px", borderRadius: 6, border: "1px solid rgba(249,115,22,0.15)" }}>{entry.receiptNumber}</span>
                            </td>
                            <td style={{ padding: "6px 6px" }}>
                              <input type="date" value={inlineEdit.date} onChange={e => setInlineEdit(p => ({ ...p, date: e.target.value }))}
                                style={{ width: "100%", height: 32, paddingInline: 7, borderRadius: 8, border: "1.5px solid #0b2c60", fontSize: 11, color: "#0b2c60", outline: "none", background: "#fff", fontFamily: "monospace", boxSizing: "border-box" }} />
                            </td>
                            <td style={{ padding: "6px 6px" }}>
                              <input value={inlineEdit.customerName} onChange={e => setInlineEdit(p => ({ ...p, customerName: e.target.value }))} placeholder="Customer"
                                style={{ width: "100%", height: 32, paddingInline: 8, borderRadius: 8, border: "1.5px solid #0b2c60", fontSize: 12, color: "#0b2c60", outline: "none", background: "#fff", fontWeight: 600, boxSizing: "border-box" }} />
                            </td>
                            <td style={{ padding: "6px 6px" }}>
                              <select value={inlineEdit.serviceType} onChange={e => setInlineEdit(p => ({ ...p, serviceType: e.target.value }))}
                                style={{ width: "100%", height: 32, paddingInline: 7, borderRadius: 8, border: "1.5px solid #0b2c60", fontSize: 11, color: "#0b2c60", outline: "none", background: "#fff", boxSizing: "border-box" }}>
                                {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </td>
                            <td colSpan={2} style={{ padding: "6px 6px" }}>
                              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                                <button onClick={() => setInlineEdit(p => ({ ...p, entryType: "credit" }))}
                                  style={{ flexShrink: 0, height: 32, paddingInline: 9, borderRadius: 8, border: "1.5px solid", borderColor: inlineEdit.entryType === "credit" ? "#059669" : "#e2e8f0", background: inlineEdit.entryType === "credit" ? "rgba(5,150,105,0.1)" : "#fff", color: inlineEdit.entryType === "credit" ? "#059669" : "#94a3b8", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>Cr</button>
                                <button onClick={() => setInlineEdit(p => ({ ...p, entryType: "debit" }))}
                                  style={{ flexShrink: 0, height: 32, paddingInline: 9, borderRadius: 8, border: "1.5px solid", borderColor: inlineEdit.entryType === "debit" ? "#e11d48" : "#e2e8f0", background: inlineEdit.entryType === "debit" ? "rgba(225,29,72,0.08)" : "#fff", color: inlineEdit.entryType === "debit" ? "#e11d48" : "#94a3b8", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>Dr</button>
                                <input type="number" value={inlineEdit.amount} min="0" step="0.01"
                                  onChange={e => setInlineEdit(p => ({ ...p, amount: e.target.value }))} placeholder="0.00"
                                  style={{ flex: 1, minWidth: 0, height: 32, paddingInline: 8, borderRadius: 8, border: "1.5px solid #0b2c60", fontSize: 12, color: "#0b2c60", outline: "none", background: "#fff", textAlign: "right", fontWeight: 700, boxSizing: "border-box" }} />
                              </div>
                            </td>
                            <td style={{ padding: "8px 14px", textAlign: "right", fontWeight: 900, fontSize: 13, color: "#94a3b8", whiteSpace: "nowrap" as const }}>
                              ₹{entry.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </td>
                            <td style={{ padding: "6px 6px" }}>
                              <input value={inlineEdit.description} onChange={e => setInlineEdit(p => ({ ...p, description: e.target.value }))} placeholder="Note…"
                                style={{ width: "100%", height: 32, paddingInline: 8, borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 11, color: "#0b2c60", outline: "none", background: "#fff", boxSizing: "border-box" }} />
                            </td>
                            <td style={{ padding: "6px 8px" }}>
                              <div style={{ display: "flex", gap: 5, justifyContent: "flex-end" }}>
                                <button onClick={() => setInlineEditId(null)}
                                  style={{ height: 30, paddingInline: 13, borderRadius: 8, border: "none", background: "#059669", color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" as const }}>Save</button>
                                <button onClick={() => setInlineEditId(null)}
                                  style={{ height: 30, paddingInline: 10, borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#f8fafc", color: "#64748b", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr key={entry.id}
                          style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.1s" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "rgba(11,44,96,0.018)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                          <td style={{ padding: "14px 14px", color: "#d1d5db", fontSize: 11, fontWeight: 700 }}>{rowNum}</td>
                          <td style={{ padding: "14px 14px", whiteSpace: "nowrap" as const }}>
                            <code style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 800, color: "#f97316", background: "rgba(249,115,22,0.07)", padding: "3px 8px", borderRadius: 6, border: "1px solid rgba(249,115,22,0.12)" }}>
                              {entry.receiptNumber}
                            </code>
                          </td>
                          <td style={{ padding: "14px 14px", fontSize: 12, fontWeight: 600, color: "#64748b", whiteSpace: "nowrap" as const }}>{entry.date}</td>
                          <td style={{ padding: "14px 14px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 28, height: 28, borderRadius: 8, background: svcColor + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <span style={{ fontSize: 11, fontWeight: 800, color: svcColor }}>{(entry.customerName || "?")[0].toUpperCase()}</span>
                              </div>
                              <span style={{ fontSize: 13, fontWeight: 700, color: "#0b2c60", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{entry.customerName}</span>
                            </div>
                          </td>
                          <td style={{ padding: "14px 14px" }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: svcColor, background: svcColor + "14", padding: "4px 10px", borderRadius: 20, whiteSpace: "nowrap", display: "inline-block" }}>{entry.serviceType}</span>
                          </td>
                          <td style={{ padding: "14px 14px", textAlign: "right", fontWeight: 800, fontSize: 13, whiteSpace: "nowrap" as const }}>
                            {entry.credit > 0 ? (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#059669", display: "inline-block", flexShrink: 0 }} />
                                <span style={{ color: "#059669" }}>+₹{entry.credit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                              </span>
                            ) : <span style={{ color: "#e2e8f0" }}>—</span>}
                          </td>
                          <td style={{ padding: "14px 14px", textAlign: "right", fontWeight: 800, fontSize: 13, whiteSpace: "nowrap" as const }}>
                            {entry.debit > 0 ? (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#e11d48", display: "inline-block", flexShrink: 0 }} />
                                <span style={{ color: "#e11d48" }}>−₹{entry.debit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                              </span>
                            ) : <span style={{ color: "#e2e8f0" }}>—</span>}
                          </td>
                          <td style={{ padding: "14px 14px", textAlign: "right", fontWeight: 900, fontSize: 13, color: entry.balance < 0 ? "#e11d48" : "#0b2c60", whiteSpace: "nowrap" as const }}>
                            ₹{entry.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: "14px 14px", fontSize: 11, color: "#94a3b8", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{entry.description || "—"}</td>
                          <td style={{ padding: "14px 10px" }}>
                            <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                              <button title="Receipt"
                                style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                                <Receipt size={12} color="#64748b" />
                              </button>
                              <button onClick={() => openEdit(entry)} title="Edit"
                                style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid rgba(11,44,96,0.15)", background: "rgba(11,44,96,0.04)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                                <Pencil size={12} color="#0b2c60" />
                              </button>
                              <button onClick={() => setDeleteId(entry.id)} title="Delete"
                                style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid rgba(225,29,72,0.2)", background: "rgba(225,29,72,0.04)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                                <Trash2 size={12} color="#e11d48" />
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

            {/* Footer: page summary + pagination */}
            <div style={{ display: activeTab !== "transactions" ? "none" : "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderTop: "1px solid #f1f5f9", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <p style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>
                  {filteredEntries.length > 0 ? `Showing ${(page - 1) * ITEMS_PER_PAGE + 1}–${Math.min(page * ITEMS_PER_PAGE, filteredEntries.length)} of ${filteredEntries.length}` : "No entries"}
                </p>
                {pagedEntries.length > 0 && (
                  <span style={{ display: "flex", gap: 10, fontSize: 12, fontWeight: 600 }}>
                    <span style={{ color: "#059669" }}>Cr: ₹{pageSummary.cr.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    <span style={{ color: "#cbd5e1" }}>·</span>
                    <span style={{ color: "#e11d48" }}>Dr: ₹{pageSummary.dr.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    <span style={{ color: "#cbd5e1" }}>·</span>
                    <span style={{ color: "#0b2c60", fontWeight: 700 }}>Net: +₹{(pageSummary.cr - pageSummary.dr).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </span>
                )}
              </div>
              {totalPages > 1 && (
                <div style={{ display: "flex", gap: 4 }}>
                  <button onClick={() => setPage(p => p - 1)} disabled={page <= 1}
                    style={{ height: 32, paddingInline: 12, borderRadius: 8, border: "1.5px solid #e2e8f0", background: page <= 1 ? "#f8fafc" : "#fff", color: page <= 1 ? "#cbd5e1" : "#0b2c60", fontSize: 12, fontWeight: 700, cursor: page <= 1 ? "default" : "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                    <ChevronLeft size={13} />Prev
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setPage(p)}
                      style={{ width: 32, height: 32, borderRadius: 8, border: "1.5px solid", borderColor: p === page ? "#0b2c60" : "#e2e8f0", background: p === page ? "#0b2c60" : "#fff", color: p === page ? "#fff" : "#64748b", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                      {p}
                    </button>
                  ))}
                  <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}
                    style={{ height: 32, paddingInline: 12, borderRadius: 8, border: "1.5px solid #e2e8f0", background: page >= totalPages ? "#f8fafc" : "#fff", color: page >= totalPages ? "#cbd5e1" : "#0b2c60", fontSize: 12, fontWeight: 700, cursor: page >= totalPages ? "default" : "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                    Next<ChevronRight size={13} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── New Entry Modal (Desktop full-screen split) ── */}
      {showForm && (
        <>
          <div onClick={() => setShowForm(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(11,44,96,0.40)", backdropFilter: "blur(4px)", zIndex: 49 }} />
          <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>

            {/* Left info panel */}
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
                  {entryType === "credit" ? "New Credit Entry" : "New Debit Entry"}
                </h1>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: 1.7 }}>Record your daily service income and expenses. Every entry updates your running balance instantly.</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: "auto", position: "relative" }}>
                {([
                  { label: "Running Balance", value: `₹${MOCK_BALANCE.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, color: "#f97316", Icon: Wallet },
                  { label: "Total Credits", value: `₹${MOCK_BALANCE.totalCredits.toLocaleString("en-IN")}`, color: "#10b981", Icon: TrendingUp },
                  { label: "Total Debits", value: `₹${MOCK_BALANCE.totalDebits.toLocaleString("en-IN")}`, color: "#f43f5e", Icon: TrendingDown },
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

            {/* Right form panel */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#f8fafc" }}>
              <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0b2c60", margin: 0 }}>New Transaction</h2>
                  <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, marginTop: 2 }}>Ledger · {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 14, padding: 4, gap: 4 }}>
                    {(["credit", "debit"] as const).map(t => (
                      <button key={t} type="button" onClick={() => setEntryType(t)}
                        style={{ padding: "8px 18px", borderRadius: 11, border: "none", cursor: "pointer", background: entryType === t ? (t === "credit" ? "linear-gradient(135deg,#059669,#10b981)" : "linear-gradient(135deg,#e11d48,#f43f5e)") : "transparent", color: entryType === t ? "#fff" : "#64748b", fontWeight: 700, fontSize: 13, boxShadow: entryType === t ? `0 2px 10px ${t === "credit" ? "rgba(5,150,105,0.35)" : "rgba(225,29,72,0.35)"}` : "none", transition: "all 0.15s" }}>
                        {t === "credit" ? "Credit (+)" : "Debit (−)"}
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={() => setShowForm(false)}
                    style={{ width: 38, height: 38, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <X size={16} color="#64748b" />
                  </button>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: "auto" }}>
                <div style={{ padding: "32px 40px", display: "flex", flexDirection: "column", gap: 24, maxWidth: 640 }}>
                  {/* Amount hero */}
                  <div style={{ background: accentBg, border: `2px solid ${accentColor}22`, borderRadius: 20, padding: "20px 24px" }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: accentColor, textTransform: "uppercase" as const, letterSpacing: "0.1em", display: "block", marginBottom: 12 }}>Amount (₹) *</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 15, background: accentGrad, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <IndianRupee size={22} color="#fff" />
                      </div>
                      <input type="number" step="0.01" min="0" value={rawAmount} onChange={e => setRawAmount(e.target.value)} placeholder="0.00"
                        style={{ flex: 1, fontSize: 38, fontWeight: 900, color: accentColor, background: "transparent", border: "none", outline: "none", letterSpacing: "-0.02em" }} />
                    </div>
                  </div>

                  {/* Customer + Date */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Customer Name *</label>
                      <div style={{ position: "relative" }}>
                        <User size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                        <input value={formValues.customerName} onChange={e => setFormValues(p => ({ ...p, customerName: e.target.value }))} placeholder="Customer name"
                          style={{ width: "100%", height: 50, paddingLeft: 40, paddingRight: 14, borderRadius: 14, border: "1.5px solid #e2e8f0", fontSize: 14, fontWeight: 600, color: "#0b2c60", outline: "none", background: "#fff", boxSizing: "border-box" }} />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Date *</label>
                      <div style={{ position: "relative" }}>
                        <Calendar size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
                        <input type="date" value={formValues.date} onChange={e => setFormValues(p => ({ ...p, date: e.target.value }))}
                          style={{ width: "100%", height: 50, paddingLeft: 40, paddingRight: 14, borderRadius: 14, border: "1.5px solid #e2e8f0", fontSize: 14, fontWeight: 600, color: "#0b2c60", outline: "none", background: "#fff", boxSizing: "border-box" }} />
                      </div>
                    </div>
                  </div>

                  {/* Service */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Service Type</label>
                    <select value={formValues.serviceType} onChange={e => setFormValues(p => ({ ...p, serviceType: e.target.value }))}
                      style={{ width: "100%", height: 50, paddingInline: 16, borderRadius: 14, border: "1.5px solid #e2e8f0", fontSize: 14, fontWeight: 600, color: formValues.serviceType ? "#0b2c60" : "#94a3b8", outline: "none", background: "#fff", boxSizing: "border-box" }}>
                      <option value="">Select service type</option>
                      {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Note */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Note <span style={{ fontWeight: 400, textTransform: "none" as const, color: "#94a3b8", letterSpacing: 0 }}>(optional)</span></label>
                    <div style={{ position: "relative" }}>
                      <FileText size={15} style={{ position: "absolute", left: 14, top: 16, color: "#94a3b8" }} />
                      <textarea value={formValues.description} onChange={e => setFormValues(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Add a note about this transaction…"
                        style={{ width: "100%", paddingLeft: 40, paddingRight: 14, paddingTop: 14, paddingBottom: 14, borderRadius: 14, border: "1.5px solid #e2e8f0", fontSize: 14, color: "#0b2c60", resize: "none", outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#fff", lineHeight: 1.6 }} />
                    </div>
                  </div>

                  {/* Balance preview */}
                  <div style={{ background: "rgba(11,44,96,0.04)", border: "1px solid rgba(11,44,96,0.10)", borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>Balance after this entry</p>
                      <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                        ₹{MOCK_BALANCE.balance.toLocaleString("en-IN")} {entryType === "credit" ? "+" : "−"} ₹{(parseFloat(rawAmount) || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <p style={{ fontSize: 22, fontWeight: 900, color: accentColor }}>
                      ₹{(entryType === "credit"
                        ? MOCK_BALANCE.balance + (parseFloat(rawAmount) || 0)
                        : MOCK_BALANCE.balance - (parseFloat(rawAmount) || 0)
                      ).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{ padding: "20px 40px", borderTop: "1px solid #f1f5f9", background: "#fff", flexShrink: 0, display: "flex", gap: 14 }}>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{ height: 50, padding: "0 28px", borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#64748b" }}>Cancel</button>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{ flex: 1, height: 50, borderRadius: 14, border: "none", cursor: "pointer", background: accentGrad, color: "#fff", fontSize: 15, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: `0 6px 20px ${accentColor}35` }}>
                  <CheckCircle2 size={18} strokeWidth={2.5} />
                  {`Save ${entryType === "credit" ? "Credit" : "Debit"} Entry`}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Delete confirmation overlay ── */}
      {deleteId !== null && (
        <>
          <div onClick={() => setDeleteId(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 49 }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 50, background: "#fff", borderRadius: 20, padding: "28px 32px", width: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0b2c60", marginBottom: 8 }}>Delete Entry?</h3>
            <p style={{ fontSize: 14, color: "#64748b", marginBottom: 24 }}>This action cannot be undone.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteId(null)}
                style={{ flex: 1, height: 44, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#64748b" }}>Cancel</button>
              <button onClick={() => setDeleteId(null)}
                style={{ flex: 1, height: 44, borderRadius: 12, border: "none", background: "linear-gradient(135deg,#e11d48,#f43f5e)", color: "#fff", cursor: "pointer", fontWeight: 800, fontSize: 14 }}>Delete</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Current;
