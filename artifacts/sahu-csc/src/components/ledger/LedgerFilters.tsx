import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Filter, X, Search, User, SlidersHorizontal, RotateCcw } from "lucide-react";
import { AutocompleteInput } from "@/components/autocomplete-input";

// ── MOBILE: Search bar (customer search + filter toggle) ──
export function MobileSearchBar({
  customerName, setCustomerName, setPage, customerNameSuggestions, showFilters, setShowFilters, hasFilters, t,
}: {
  customerName: string;
  setCustomerName: (v: string) => void;
  setPage: (v: number) => void;
  customerNameSuggestions: string[];
  showFilters: boolean;
  setShowFilters: (v: boolean) => void;
  hasFilters: boolean;
  t: (key: string) => string;
}) {
  return (
    <div className="md:hidden" style={{ position: "relative" }}>
      <Search size={14} color="var(--color-slate-400)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", zIndex: 1 }} />
      <AutocompleteInput
        value={customerName}
        onChange={(val) => { setCustomerName(val); setPage(1); }}
        suggestions={customerNameSuggestions}
        placeholder={t("ledger.search_placeholder")}
        className="bg-white dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:border-zinc-600"
        style={{ width: "100%", height: 44, paddingLeft: 34, paddingRight: 46, borderRadius: 14, border: "1.5px solid var(--color-slate-200)", fontSize: 13, color: "var(--brand-navy-800)", outline: "none", boxSizing: "border-box", fontWeight: 500, boxShadow: "0 1px 6px var(--brand-navy-tint-md)" }}
      />
      <button onClick={() => setShowFilters(!showFilters)} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 30, height: 30, borderRadius: 8, background: hasFilters ? "var(--brand-navy-800)" : "var(--color-slate-100)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", outline: "none" }}>
        <Filter size={13} color={hasFilters ? "#fff" : "var(--color-slate-500)"} />
      </button>
    </div>
  );
}

// ── MOBILE: Frequent customers quick-filter chips ──
export function MobileFrequentCustomers({
  frequentCustomers, customerName, setCustomerName, setPage,
}: {
  frequentCustomers: string[];
  customerName: string;
  setCustomerName: (v: string) => void;
  setPage: (v: number) => void;
}) {
  if (frequentCustomers.length === 0) return null;
  return (
    <div className="md:hidden" style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 2, scrollbarWidth: "none" as const }}>
      {frequentCustomers.map(name => (
        <button
          key={name}
          type="button"
          onClick={() => { setCustomerName(customerName === name ? "" : name); setPage(1); }}
          style={{
            flexShrink: 0, padding: "5px 11px", borderRadius: 20,
            border: `1.5px solid ${customerName === name ? "var(--brand-navy-800)" : "var(--brand-navy-border-md)"}`,
            background: customerName === name ? "var(--brand-navy-800)" : "var(--brand-navy-tint-sm)",
            color: customerName === name ? "#fff" : "var(--brand-navy-800)",
            fontSize: 12, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
          }}
        >
          <User size={10} />
          {name}
        </button>
      ))}
    </div>
  );
}

// ── DESKTOP: Search & filter bar + collapsible filter panel ──
export function DesktopSearchFilterBar({
  customerName, setCustomerName, setPage, showFilters, setShowFilters, hasFilters,
  startDate, endDate, serviceFilter, clearFilters,
}: {
  customerName: string;
  setCustomerName: (v: string) => void;
  setPage: (v: number) => void;
  showFilters: boolean;
  setShowFilters: (v: boolean) => void;
  hasFilters: boolean;
  startDate: string;
  endDate: string;
  serviceFilter: string;
  clearFilters: () => void;
}) {
  return (
    <div className="bg-white dark:bg-zinc-800 dark:border-zinc-700" style={{ border: "1px solid var(--color-slate-200)", borderRadius: 20, padding: "10px 14px", display: "flex", gap: 10, alignItems: "center", flexShrink: 0, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
        <Search size={17} color="var(--color-slate-400)" />
        <input value={customerName} onChange={e => { setCustomerName(e.target.value); setPage(1); }}
          list="ledger-customer-names" placeholder="Search transactions…"
          className="dark:text-zinc-100 dark:placeholder:text-zinc-500"
         style={{ flex: 1, outline: "none", fontSize: 13, color: "var(--color-slate-700)", fontWeight: 500, background: "transparent", border: "none" }} />
      </div>
      <div style={{ width: 1, height: 24, background: "var(--color-slate-200)" }} />
      <button onClick={() => setShowFilters(!showFilters)}
        style={{ display: "flex", alignItems: "center", gap: 6, border: `1px solid ${showFilters || hasFilters ? "var(--brand-navy-800)" : "var(--color-slate-200)"}`, background: showFilters || hasFilters ? "var(--brand-navy-800)" : "var(--color-slate-50)", color: showFilters || hasFilters ? "#fff" : "var(--color-slate-700)", borderRadius: 12, padding: "0 14px", height: 36, fontSize: 12, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>
        <SlidersHorizontal size={13} />Filters{hasFilters && <span style={{ background: "var(--brand-orange)", color: "#fff", borderRadius: 20, fontSize: 9, fontWeight: 800, padding: "1px 5px", marginLeft: 2 }}>{[startDate, endDate, serviceFilter].filter(Boolean).length}</span>}
      </button>
      <a href="/api/reports/export" target="_blank"
        style={{ display: "flex", alignItems: "center", gap: 6, border: "1px solid var(--color-slate-200)", background: "var(--color-slate-50)", color: "var(--color-slate-700)", borderRadius: 12, padding: "0 14px", height: 36, fontSize: 12, fontWeight: 600, cursor: "pointer", textDecoration: "none", flexShrink: 0 }}>
        <Download size={13} />Export
      </a>
      <div style={{ width: 1, height: 24, background: "var(--color-slate-200)" }} />
      <button onClick={clearFilters}
        style={{ display: "flex", alignItems: "center", gap: 6, border: "none", background: "transparent", color: "var(--color-slate-500)", fontSize: 12, fontWeight: 600, cursor: "pointer", flexShrink: 0, padding: "0 8px" }}>
        <RotateCcw size={13} />Clear
      </button>
      <button onClick={() => setPage(1)}
        style={{ background: "var(--brand-orange)", color: "white", borderRadius: 12, padding: "0 20px", height: 36, fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer", flexShrink: 0 }}>
        Apply
      </button>
    </div>
  );
}

export function DesktopFilterPanel({
  showFilters, t, startDate, setStartDate, endDate, setEndDate, setPage,
  serviceTypes, serviceFilter, setServiceFilter, getServiceColor,
}: {
  showFilters: boolean;
  t: (key: string) => string;
  startDate: string;
  setStartDate: (v: string) => void;
  endDate: string;
  setEndDate: (v: string) => void;
  setPage: (v: number) => void;
  serviceTypes: string[];
  serviceFilter: string;
  setServiceFilter: (v: string) => void;
  getServiceColor: (name: string) => string;
}) {
  if (!showFilters) return null;
  return (
    <div className="bg-white dark:bg-zinc-800 dark:border-zinc-700" style={{ border: "1px solid var(--color-slate-200)", borderRadius: 16, padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start", flexShrink: 0, flexWrap: "wrap", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "var(--color-slate-400)", textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 4 }}>Date</span>
        {([
          { label: t("common.today"), key: "today", action: () => { const d = new Date().toISOString().split("T")[0]; setStartDate(d); setEndDate(d); setPage(1); } },
          { label: "This Week", key: "week", action: () => { const d = new Date(); const mon = new Date(d); mon.setDate(d.getDate() - ((d.getDay() + 6) % 7)); setStartDate(mon.toISOString().split("T")[0]); setEndDate(d.toISOString().split("T")[0]); setPage(1); } },
          { label: "This Month", key: "month", action: () => { const d = new Date(); setStartDate(new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0]); setEndDate(d.toISOString().split("T")[0]); setPage(1); } },
        ] as { label: string; key: string; action: () => void }[]).map(({ label, key, action }) => {
          const td = new Date().toISOString().split("T")[0];
          const wk = (() => { const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.toISOString().split("T")[0]; })();
          const mo = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
          const isActive = key === "today" ? (startDate === td && endDate === td) : key === "week" ? (startDate === wk && endDate === td) : (startDate === mo && endDate === td);
          return <button key={key} onClick={action} className={isActive ? "" : "bg-slate-50 dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-300"} style={{ padding: "4px 10px", borderRadius: 20, border: `1px solid ${isActive ? "var(--brand-orange)" : "var(--color-slate-200)"}`, background: isActive ? "var(--brand-orange)" : undefined, color: isActive ? "#fff" : "var(--color-slate-700)", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{label}</button>;
        })}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "var(--color-slate-400)", textTransform: "uppercase", letterSpacing: "0.08em" }}>From</span>
        <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setPage(1); }}
          className="bg-slate-50 dark:bg-zinc-700 dark:text-zinc-100 dark:border-zinc-600"
          style={{ height: 32, paddingInline: 8, borderRadius: 8, border: "1.5px solid var(--color-slate-200)", fontSize: 12, color: "var(--brand-navy-800)", outline: "none", boxSizing: "border-box" }} />
        <span style={{ fontSize: 10, fontWeight: 700, color: "var(--color-slate-400)", textTransform: "uppercase", letterSpacing: "0.08em" }}>To</span>
        <input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setPage(1); }}
          className="bg-slate-50 dark:bg-zinc-700 dark:text-zinc-100 dark:border-zinc-600"
          style={{ height: 32, paddingInline: 8, borderRadius: 8, border: "1.5px solid var(--color-slate-200)", fontSize: 12, color: "var(--brand-navy-800)", outline: "none", boxSizing: "border-box" }} />
      </div>
      {serviceTypes.length > 0 && (
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--color-slate-400)", textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 2 }}>Service</span>
          {serviceTypes.slice(0, 8).map((s: string) => {
            const color = getServiceColor(s);
            const active = serviceFilter === s;
            return <button key={s} onClick={() => { setServiceFilter(active ? "" : s); setPage(1); }} className={active ? "" : "bg-slate-50 dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-300"} style={{ padding: "4px 10px", borderRadius: 20, border: `1px solid ${active ? color + "80" : "var(--color-slate-200)"}`, background: active ? color + "18" : undefined, color: active ? color : "var(--color-slate-700)", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />{s}
            </button>;
          })}
        </div>
      )}
    </div>
  );
}

// ── MOBILE: collapsible filter panel (date range, customer, service dropdown) ──
export function MobileFilterPanel({
  showFilters, hasFilters, clearFilters, startDate, setStartDate, endDate, setEndDate, setPage,
  customerName, setCustomerName, serviceFilter, setServiceFilter, serviceTypes,
}: {
  showFilters: boolean;
  hasFilters: boolean;
  clearFilters: () => void;
  startDate: string;
  setStartDate: (v: string) => void;
  endDate: string;
  setEndDate: (v: string) => void;
  setPage: (v: number) => void;
  customerName: string;
  setCustomerName: (v: string) => void;
  serviceFilter: string;
  setServiceFilter: (v: string) => void;
  serviceTypes: string[];
}) {
  if (!showFilters) return null;
  return (
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
  );
}
