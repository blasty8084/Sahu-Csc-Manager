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
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, padding: "10px 14px", display: "flex", gap: 10, alignItems: "center", flexShrink: 0, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
        <Search size={17} color="#94a3b8" />
        <input value={customerName} onChange={e => { setCustomerName(e.target.value); setPage(1); }}
          list="ledger-customer-names" placeholder="Search transactions…"
          style={{ flex: 1, outline: "none", fontSize: 13, color: "#334155", fontWeight: 500, background: "transparent", border: "none" }} />
      </div>
      <div style={{ width: 1, height: 24, background: "#e2e8f0" }} />
      <button onClick={() => setShowFilters(!showFilters)}
        style={{ display: "flex", alignItems: "center", gap: 6, border: `1px solid ${showFilters || hasFilters ? "#0b2c60" : "#e2e8f0"}`, background: showFilters || hasFilters ? "#0b2c60" : "#f8fafc", color: showFilters || hasFilters ? "#fff" : "#334155", borderRadius: 12, padding: "0 14px", height: 36, fontSize: 12, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>
        <SlidersHorizontal size={13} />Filters{hasFilters && <span style={{ background: "#f97316", color: "#fff", borderRadius: 20, fontSize: 9, fontWeight: 800, padding: "1px 5px", marginLeft: 2 }}>{[startDate, endDate, serviceFilter].filter(Boolean).length}</span>}
      </button>
      <a href="/api/reports/export" target="_blank"
        style={{ display: "flex", alignItems: "center", gap: 6, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#334155", borderRadius: 12, padding: "0 14px", height: 36, fontSize: 12, fontWeight: 600, cursor: "pointer", textDecoration: "none", flexShrink: 0 }}>
        <Download size={13} />Export
      </a>
      <div style={{ width: 1, height: 24, background: "#e2e8f0" }} />
      <button onClick={clearFilters}
        style={{ display: "flex", alignItems: "center", gap: 6, border: "none", background: "transparent", color: "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer", flexShrink: 0, padding: "0 8px" }}>
        <RotateCcw size={13} />Clear
      </button>
      <button onClick={() => setPage(1)}
        style={{ background: "#f97316", color: "white", borderRadius: 12, padding: "0 20px", height: 36, fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer", flexShrink: 0 }}>
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
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start", flexShrink: 0, flexWrap: "wrap", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 4 }}>Date</span>
        {([
          { label: t("common.today"), key: "today", action: () => { const d = new Date().toISOString().split("T")[0]; setStartDate(d); setEndDate(d); setPage(1); } },
          { label: "This Week", key: "week", action: () => { const d = new Date(); const mon = new Date(d); mon.setDate(d.getDate() - ((d.getDay() + 6) % 7)); setStartDate(mon.toISOString().split("T")[0]); setEndDate(d.toISOString().split("T")[0]); setPage(1); } },
          { label: "This Month", key: "month", action: () => { const d = new Date(); setStartDate(new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0]); setEndDate(d.toISOString().split("T")[0]); setPage(1); } },
        ] as { label: string; key: string; action: () => void }[]).map(({ label, key, action }) => {
          const td = new Date().toISOString().split("T")[0];
          const wk = (() => { const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.toISOString().split("T")[0]; })();
          const mo = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
          const isActive = key === "today" ? (startDate === td && endDate === td) : key === "week" ? (startDate === wk && endDate === td) : (startDate === mo && endDate === td);
          return <button key={key} onClick={action} style={{ padding: "4px 10px", borderRadius: 20, border: `1px solid ${isActive ? "#f97316" : "#e2e8f0"}`, background: isActive ? "#f97316" : "#f8fafc", color: isActive ? "#fff" : "#334155", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{label}</button>;
        })}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>From</span>
        <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setPage(1); }}
          style={{ height: 32, paddingInline: 8, borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 12, color: "#0b2c60", outline: "none", background: "#f8fafc", boxSizing: "border-box" }} />
        <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>To</span>
        <input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setPage(1); }}
          style={{ height: 32, paddingInline: 8, borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 12, color: "#0b2c60", outline: "none", background: "#f8fafc", boxSizing: "border-box" }} />
      </div>
      {serviceTypes.length > 0 && (
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 2 }}>Service</span>
          {serviceTypes.slice(0, 8).map((s: string) => {
            const color = getServiceColor(s);
            const active = serviceFilter === s;
            return <button key={s} onClick={() => { setServiceFilter(active ? "" : s); setPage(1); }} style={{ padding: "4px 10px", borderRadius: 20, border: `1px solid ${active ? color + "80" : "#e2e8f0"}`, background: active ? color + "18" : "#f8fafc", color: active ? color : "#334155", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
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
