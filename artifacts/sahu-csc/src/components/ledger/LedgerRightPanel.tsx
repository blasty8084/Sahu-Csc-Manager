import { Plus, Receipt, Download, Database, ChevronRight, ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react";

interface LedgerRightPanelProps {
  balance: any;
  data: any;
  onAddEntry: () => void;
  onShowReceipts: () => void;
  onShowDeleteAll: () => void;
}

export function LedgerRightPanel({ balance, data, onAddEntry, onShowReceipts, onShowDeleteAll }: LedgerRightPanelProps) {
  return (
    <div style={{ width: 252, flexShrink: 0, display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" }}>

      {/* Quick Actions */}
      <div style={{ background: "#fff", border: "1px solid var(--color-slate-200)", borderRadius: 20, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <h3 style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, color: "var(--color-slate-800)", fontSize: 13, marginBottom: 14 }}>
          <span style={{ fontSize: 16 }}>⚡</span>Quick Actions
        </h3>
        {([
          { icon: Plus, label: "Add New Entry", sub: "Record a new transaction", grad: "linear-gradient(135deg,var(--brand-orange),var(--brand-orange-600))", action: onAddEntry },
          { icon: Receipt, label: "Receipt History", sub: "View all receipts", grad: "linear-gradient(135deg,#a855f7,#9333ea)", action: onShowReceipts },
          { icon: Download, label: "Export Ledger", sub: "Download as Excel / PDF", grad: "linear-gradient(135deg,var(--color-success-light),var(--color-success))", href: "/api/reports/export" },
          { icon: Database, label: "Backup Ledger", sub: "Create a ledger backup", grad: "linear-gradient(135deg,var(--color-blue),var(--color-blue-600))", action: onShowDeleteAll },
        ] as { icon: React.ElementType; label: string; sub: string; grad: string; action?: () => void; href?: string }[]).map(({ icon: Icon, label, sub, grad, action, href }) => (
          href
            ? <a key={label} href={href} target="_blank" style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 12, textDecoration: "none", cursor: "pointer", marginBottom: 6 }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--color-slate-50)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: grad, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={17} color="white" strokeWidth={2.5} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--color-slate-800)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</p>
                  <p style={{ fontSize: 11, color: "var(--color-slate-500)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub}</p>
                </div>
                <ChevronRight size={15} color="var(--color-slate-300)" />
              </a>
            : <button key={label} onClick={action}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 12, border: "none", background: "transparent", cursor: "pointer", textAlign: "left", marginBottom: 6 }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--color-slate-50)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: grad, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={17} color="white" strokeWidth={2.5} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--color-slate-800)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</p>
                  <p style={{ fontSize: 11, color: "var(--color-slate-500)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub}</p>
                </div>
                <ChevronRight size={15} color="var(--color-slate-300)" />
              </button>
        ))}
      </div>

      {/* Summary */}
      <div style={{ background: "#fff", border: "1px solid var(--color-slate-200)", borderRadius: 20, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, color: "var(--color-slate-800)", fontSize: 13 }}>
            <span style={{ fontSize: 14 }}>📊</span>Summary
          </h3>
          <span style={{ fontSize: 11, color: "var(--color-slate-400)", background: "var(--color-slate-100)", borderRadius: 6, padding: "2px 8px" }}>This Month</span>
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
                  <circle cx={50} cy={50} r={r} fill="none" stroke="var(--color-slate-200)" strokeWidth={14} />
                  {cr + db > 0 && <>
                    <circle cx={50} cy={50} r={r} fill="none" stroke="var(--color-success-light)" strokeWidth={14}
                      strokeDasharray={`${crDash} ${circ - crDash}`} strokeDashoffset={circ * 0.25}
                      strokeLinecap="round" style={{ transition: "stroke-dasharray 0.5s" }} />
                    <circle cx={50} cy={50} r={r} fill="none" stroke="var(--color-error-std)" strokeWidth={14}
                      strokeDasharray={`${circ - crDash} ${crDash}`} strokeDashoffset={circ * 0.25 + crDash}
                      strokeLinecap="round" style={{ opacity: dbPct > 0 ? 1 : 0 }} />
                  </>}
                  <text x={50} y={46} textAnchor="middle" fontSize={10} fontWeight={700} fill="var(--brand-navy-800)">{cr + db > 0 ? crPct : 0}</text>
                  <text x={50} y={58} textAnchor="middle" fontSize={8} fill="var(--color-slate-400)">Total</text>
                </svg>
              </div>
              {[
                { label: "Credits", color: "var(--color-success-light)", value: `₹${cr.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` },
                { label: "Debits", color: "var(--color-error-std)", value: `₹${db.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` },
                { label: "Balance", color: "var(--color-blue)", value: `₹${bal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` },
              ].map(({ label, color, value }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                    <span style={{ fontSize: 12, color: "var(--color-slate-500)" }}>{label}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-slate-800)" }}>{value}</span>
                </div>
              ))}
            </>
          );
        })()}
      </div>

      {/* Recent Activity */}
      <div style={{ background: "#fff", border: "1px solid var(--color-slate-200)", borderRadius: 20, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <h3 style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, color: "var(--color-slate-800)", fontSize: 13, marginBottom: 12 }}>
          <span style={{ fontSize: 14 }}>🕐</span>Recent Activity
        </h3>
        {(data?.entries ?? []).slice(0, 4).length === 0
          ? <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "24px 0" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--color-slate-100)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Clock size={18} color="var(--color-slate-400)" />
              </div>
              <p style={{ fontSize: 13, color: "var(--color-slate-700)", fontWeight: 600 }}>No recent Activity</p>
              <p style={{ fontSize: 11, color: "var(--color-slate-400)", textAlign: "center" }}>Your recent transactions will appear here</p>
            </div>
          : (data?.entries ?? []).slice(0, 4).map((entry: any) => {
              const isCr = entry.credit > 0;
              const amt = isCr ? entry.credit : entry.debit;
              const color = isCr ? "var(--color-success)" : "var(--color-error-std)";
              return (
                <div key={entry.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--color-slate-100)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--color-slate-50)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <div style={{ width: 30, height: 30, borderRadius: 9, background: isCr ? "var(--color-success-bg-light)" : "var(--color-error-bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {isCr ? <ArrowUpRight size={13} color="var(--color-success)" strokeWidth={2.5} /> : <ArrowDownLeft size={13} color="var(--color-error-std)" strokeWidth={2.5} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "var(--brand-navy-800)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.customerName}</p>
                    <p style={{ fontSize: 10, color: "var(--color-slate-400)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.serviceType}</p>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800, color, flexShrink: 0 }}>{isCr ? "+" : "−"}₹{amt.toLocaleString("en-IN")}</span>
                </div>
              );
            })}
      </div>

    </div>
  );
}
