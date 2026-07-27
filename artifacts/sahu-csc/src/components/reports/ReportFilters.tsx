import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Printer } from "lucide-react";
import { MONTHS, type FilterState } from "@/hooks/useReports";

// ── Mobile filter panel (collapsible) ────────────────────────────────────────
export function MobileReportFilters({
  activeTab,
  filters,
}: {
  activeTab: string;
  filters: FilterState;
}) {
  return (
    <div className="bg-card rounded-2xl p-4 space-y-3 border border-border" style={{ boxShadow: "0 2px 12px var(--brand-navy-tint-md)" }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: "var(--color-slate-400)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Filter Options</p>

      {activeTab === "daily" && (
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-1">Date</p>
          <input
            type="date"
            value={filters.dailyDate}
            onChange={e => filters.setDailyDate(e.target.value)}
            className="w-full h-9 border border-border rounded-xl px-3 text-sm text-foreground bg-background"
          />
        </div>
      )}

      {activeTab === "monthly" && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1">Month</p>
            <Select value={String(filters.reportMonth)} onValueChange={v => filters.setReportMonth(Number(v))}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {MONTHS.map((m, i) => <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1">Year</p>
            <input
              type="number"
              value={filters.reportYear}
              onChange={e => filters.setReportYear(Number(e.target.value))}
              className="w-full h-9 border border-border rounded-xl px-3 text-sm text-foreground bg-background"
            />
          </div>
        </div>
      )}

      {activeTab === "aeps" && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1">From</p>
            <input
              type="date"
              value={filters.aepsStart}
              onChange={e => filters.setAepsStart(e.target.value)}
              className="w-full h-9 border border-border rounded-xl px-3 text-sm text-foreground bg-background"
            />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1">To</p>
            <input
              type="date"
              value={filters.aepsEnd}
              onChange={e => filters.setAepsEnd(e.target.value)}
              className="w-full h-9 border border-border rounded-xl px-3 text-sm text-foreground bg-background"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Desktop filter controls (top nav right section) ───────────────────────────
export function DesktopReportFilters({
  activeTab,
  filters,
  onPrint,
  exportUrl,
}: {
  activeTab: string;
  filters: FilterState;
  onPrint: () => void;
  exportUrl: string;
}) {
  return (
    <div style={{ padding: "0 16px", display: "flex", alignItems: "center", gap: 8, borderLeft: "1px solid var(--color-slate-200)" }}>
      {activeTab === "daily" && (
        <input
          type="date"
          value={filters.dailyDate}
          onChange={e => filters.setDailyDate(e.target.value)}
          style={{ height: 32, borderRadius: 8, border: "1px solid hsl(var(--border))", padding: "0 10px", fontSize: 12, color: "hsl(var(--foreground))", background: "hsl(var(--background))", outline: "none" }}
        />
      )}

      {activeTab === "monthly" && (
        <>
          <Select value={String(filters.reportMonth)} onValueChange={v => filters.setReportMonth(Number(v))}>
            <SelectTrigger className="h-8 text-xs w-28" style={{ border: "1px solid var(--color-slate-200)", borderRadius: 8 }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m, i) => <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <input
            type="number"
            value={filters.reportYear}
            onChange={e => filters.setReportYear(Number(e.target.value))}
            style={{ height: 32, width: 72, borderRadius: 8, border: "1px solid hsl(var(--border))", padding: "0 10px", fontSize: 12, color: "hsl(var(--foreground))", background: "hsl(var(--background))", outline: "none" }}
          />
        </>
      )}

      {activeTab === "aeps" && (
        <>
          <input
            type="date"
            value={filters.aepsStart}
            onChange={e => filters.setAepsStart(e.target.value)}
            style={{ height: 32, borderRadius: 8, border: "1px solid hsl(var(--border))", padding: "0 10px", fontSize: 12, color: "hsl(var(--foreground))", background: "hsl(var(--background))", outline: "none" }}
          />
          <span style={{ fontSize: 11, color: "var(--color-slate-400)" }}>→</span>
          <input
            type="date"
            value={filters.aepsEnd}
            onChange={e => filters.setAepsEnd(e.target.value)}
            style={{ height: 32, borderRadius: 8, border: "1px solid hsl(var(--border))", padding: "0 10px", fontSize: 12, color: "hsl(var(--foreground))", background: "hsl(var(--background))", outline: "none" }}
          />
        </>
      )}

      <button
        onClick={onPrint}
        style={{ height: 32, borderRadius: 8, background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))", fontSize: 12, fontWeight: 700, padding: "0 14px", display: "flex", alignItems: "center", gap: 6, cursor: "pointer", flexShrink: 0 }}
      >
        <Printer size={12} /> Print
      </button>

      <a
        href={exportUrl}
        target="_blank"
        style={{ height: 32, borderRadius: 8, background: "linear-gradient(135deg,var(--brand-orange),var(--brand-orange-400))", color: "white", fontSize: 12, fontWeight: 700, padding: "0 14px", display: "flex", alignItems: "center", gap: 6, textDecoration: "none", flexShrink: 0 }}
      >
        <Download size={12} /> Export
      </a>
    </div>
  );
}
