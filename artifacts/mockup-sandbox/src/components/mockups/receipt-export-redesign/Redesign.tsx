import './_group.css';
import { useState } from 'react';
import {
  Download, FileText, FileSpreadsheet, Search, Filter,
  Calendar, Eye, Printer, CheckSquare, Square, ChevronDown,
  Receipt, IndianRupee, X, Check, Bell, Sun,
  ArrowDownToLine, Share2, QrCode, Clock, Mail,
  FileArchive, TrendingUp, User, SlidersHorizontal, Hash,
} from 'lucide-react';

const NAVY = '#0b2c60';
const SAFFRON = '#f97316';

/* ── Mock data (matches real API response shapes) ───────────────────────── */
const MOCK_ENTRIES = [
  { receiptNumber: 'CSC-2026-0142', date: '2026-07-08', customerName: 'Rajesh Kumar Sahu',   serviceType: 'AEPS Withdrawal',   amount: 4500,  type: 'credit' as const, operator: 'operator1' },
  { receiptNumber: 'CSC-2026-0141', date: '2026-07-08', customerName: 'Priya Mishra',         serviceType: 'PAN Card Update',   amount: 250,   type: 'credit' as const, operator: 'operator2' },
  { receiptNumber: 'CSC-2026-0140', date: '2026-07-07', customerName: 'Suresh Patra',         serviceType: 'Mobile Recharge',   amount: 199,   type: 'debit'  as const, operator: 'operator1' },
  { receiptNumber: 'CSC-2026-0139', date: '2026-07-07', customerName: 'Anita Behera',          serviceType: 'DTH Recharge',      amount: 350,   type: 'credit' as const, operator: 'operator3' },
  { receiptNumber: 'CSC-2026-0138', date: '2026-07-06', customerName: 'Manoj Nayak',           serviceType: 'AEPS Withdrawal',   amount: 8200,  type: 'credit' as const, operator: 'operator1' },
  { receiptNumber: 'CSC-2026-0137', date: '2026-07-06', customerName: 'Kavita Das',            serviceType: 'Passport Assist',   amount: 1500,  type: 'credit' as const, operator: 'operator2' },
  { receiptNumber: 'CSC-2026-0136', date: '2026-07-05', customerName: 'Bikash Pradhan',        serviceType: 'Electricity Bill',  amount: 1120,  type: 'debit'  as const, operator: 'operator3' },
];
const TOTAL_AMOUNT = MOCK_ENTRIES.reduce((s, e) => s + e.amount, 0);
const USERS_OVERVIEW = [
  { userId: 1, username: 'operator1', fullName: 'Ramesh Operator' },
  { userId: 2, username: 'operator2', fullName: 'Sita Operator' },
  { userId: 3, username: 'operator3', fullName: 'Ganesh Operator' },
];

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtDateShort(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function Checkbox({ checked, onChange, size = 16 }: { checked: boolean; onChange: () => void; size?: number }) {
  return (
    <button onClick={onChange} className="shrink-0">
      {checked ? <CheckSquare size={size} className="text-[#0b2c60]" /> : <Square size={size} className="text-slate-300" />}
    </button>
  );
}

/* ── Standard app header (mirrors Layout.tsx's page header exactly) ──────── */
function StandardHeader({ pageTitle }: { pageTitle: string }) {
  return (
    <header
      className="hidden md:block sticky top-0 z-20"
      style={{ position: 'relative', overflow: 'hidden', background: 'white' }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${NAVY} 0%, #1e40af 40%, ${SAFFRON} 75%, #ea580c 100%)`, zIndex: 3 }} />
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06, pointerEvents: 'none' }} preserveAspectRatio="none">
        <defs>
          <pattern id="rexp-hex" x="0" y="0" width="28" height="24" patternUnits="userSpaceOnUse">
            <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="none" stroke={NAVY} strokeWidth="0.9" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#rexp-hex)" />
      </svg>
      <div style={{ position: 'absolute', top: -30, right: 60, width: 130, height: 130, background: 'radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)', filter: 'blur(24px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: -10, left: '42%', width: 100, height: 80, background: 'radial-gradient(circle, rgba(11,44,96,0.07) 0%, transparent 70%)', filter: 'blur(18px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,#e2e8f0,transparent)', zIndex: 2 }} />

      <div className="flex items-center justify-between px-8" style={{ height: 64, position: 'relative', zIndex: 2 }}>
        <div>
          <h1 className="text-xl font-bold" style={{ color: NAVY }}>{pageTitle}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Good afternoon, Admin</span>
            <span style={{ fontSize: 12, lineHeight: 1 }}>👋</span>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>·</span>
            <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400 }}>Wed, 10 Jul</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="h-8 w-8 rounded-lg flex items-center justify-center"
            style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0' }}
          >
            <Sun size={15} color="#64748b" />
          </button>
          <button
            className="relative flex items-center gap-2 rounded-xl px-3 h-8 text-sm font-medium"
            style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', color: NAVY }}
          >
            <Bell size={15} color={NAVY} />
            <span>Notifications</span>
            <span style={{ background: SAFFRON, color: 'white', borderRadius: 999, fontSize: 10, fontWeight: 700, padding: '0 5px', lineHeight: '18px' }}>3</span>
          </button>
          <div
            className="flex items-center gap-2 rounded-xl cursor-pointer"
            style={{ padding: '4px 10px 4px 4px', background: '#f8fafc', border: '1.5px solid #e2e8f0' }}
          >
            <div
              className="flex items-center justify-center rounded-lg"
              style={{ width: 28, height: 28, background: `linear-gradient(135deg, ${NAVY} 0%, #1e40af 55%, ${SAFFRON} 100%)`, color: '#fff', fontSize: 10, fontWeight: 900 }}
            >AD</div>
            <span style={{ fontSize: 12, fontWeight: 700, background: `linear-gradient(135deg, ${NAVY}, ${SAFFRON})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ── Standard app mobile header (mirrors Layout.tsx mobile header) ───────── */
function StandardMobileHeader() {
  return (
    <header className="sticky top-0 z-20 md:hidden">
      <div style={{ position: 'relative', overflow: 'hidden', background: 'white' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${NAVY} 0%, #1e40af 40%, ${SAFFRON} 75%, #ea580c 100%)`, zIndex: 3 }} />
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.07, pointerEvents: 'none' }} preserveAspectRatio="none">
          <defs>
            <pattern id="rexp-hex-m" x="0" y="0" width="28" height="24" patternUnits="userSpaceOnUse">
              <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="none" stroke={NAVY} strokeWidth="0.9" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#rexp-hex-m)" />
        </svg>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,#e2e8f0,transparent)', zIndex: 2 }} />

        <div className="flex items-center justify-between px-4" style={{ height: 60, position: 'relative', zIndex: 2 }}>
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center justify-center rounded-2xl flex-shrink-0"
              style={{ width: 40, height: 40, background: `linear-gradient(135deg, ${NAVY} 0%, #1e40af 55%, ${SAFFRON} 100%)`, boxShadow: '0 3px 12px rgba(11,44,96,0.28)' }}
            >
              <FileArchive size={18} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: 15, fontWeight: 900, color: NAVY, lineHeight: 1 }}>Receipt Export</h1>
              <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Admin Only</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="relative flex items-center justify-center rounded-xl"
              style={{ width: 38, height: 38, background: '#f8fafc', border: '1.5px solid #e2e8f0' }}
            >
              <Bell size={17} color={NAVY} />
              <span className="absolute" style={{ top: 7, right: 7, width: 8, height: 8, borderRadius: '50%', background: SAFFRON, border: '2px solid white' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Greeting bar */}
      <div style={{ background: `linear-gradient(90deg, ${NAVY} 0%, #1e3a8a 60%, #1e40af 100%)`, padding: '0 16px', height: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>Good afternoon, Admin 👋</span>
        <span style={{ fontSize: 12, color: 'white', fontWeight: 700, fontFamily: 'monospace', background: 'rgba(255,255,255,0.12)', borderRadius: 6, padding: '2px 8px' }}>02:14 PM</span>
      </div>
    </header>
  );
}

export function Redesign() {
  const [startDate] = useState('2026-07-01');
  const [endDate] = useState('2026-07-10');
  const [userId, setUserId] = useState('all');
  const [searchQ, setSearchQ] = useState('');
  const [dateRange, setDateRange] = useState('month');
  const [selected, setSelected] = useState<Set<string>>(new Set(MOCK_ENTRIES.map(e => e.receiptNumber)));
  const [expandedEntry, setExpandedEntry] = useState<string | null>(MOCK_ENTRIES[0].receiptNumber);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf');
  const [showFilters, setShowFilters] = useState(false);

  const filteredEntries = MOCK_ENTRIES.filter(e =>
    e.customerName.toLowerCase().includes(searchQ.toLowerCase()) ||
    e.receiptNumber.toLowerCase().includes(searchQ.toLowerCase()) ||
    e.serviceType.toLowerCase().includes(searchQ.toLowerCase())
  );
  const selTotal = filteredEntries.filter(e => selected.has(e.receiptNumber)).reduce((s, e) => s + e.amount, 0);
  const allFilteredSelected = filteredEntries.length > 0 && filteredEntries.every(e => selected.has(e.receiptNumber));

  const toggleAll = () => {
    const next = new Set(selected);
    if (allFilteredSelected) filteredEntries.forEach(e => next.delete(e.receiptNumber));
    else filteredEntries.forEach(e => next.add(e.receiptNumber));
    setSelected(next);
  };
  const toggleEntry = (id: string) => {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id); else s.add(id);
    setSelected(s);
  };

  return (
    <div className="recx-group min-h-screen bg-muted/20" style={{ background: '#f1f5f9' }}>
      <StandardMobileHeader />
      <StandardHeader pageTitle="Receipt Export" />

      {/* ═══ Desktop content ═══ */}
      <div className="hidden sm:block">
        {/* Stat cards row — sits directly under the standard header, replacing the old navy stat band */}
        <div className="px-8 pt-5 pb-1 max-w-[1200px] mx-auto">
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Total Receipts', value: String(MOCK_ENTRIES.length), icon: Receipt, accent: NAVY },
              { label: 'Total Amount', value: `₹${TOTAL_AMOUNT.toLocaleString('en-IN')}`, icon: IndianRupee, accent: '#059669' },
              { label: 'Credit Entries', value: String(MOCK_ENTRIES.filter(e => e.type === 'credit').length), icon: TrendingUp, accent: SAFFRON },
              { label: 'Selected', value: String(selected.size), icon: ArrowDownToLine, accent: '#7c3aed' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-3.5 flex items-center gap-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: s.accent }} />
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${s.accent}15` }}>
                  <s.icon size={18} style={{ color: s.accent }} />
                </div>
                <div>
                  <p className="text-xl font-bold leading-none" style={{ color: NAVY }}>{s.value}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-8 py-5 flex gap-5">
          {/* Left column */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Filter bar */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3.5 flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Calendar size={13} className="text-slate-400" />
                <input readOnly value={startDate} className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-slate-50 text-slate-700 h-9 w-[110px]" />
                <span className="text-slate-300 text-xs">→</span>
                <input readOnly value={endDate} className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-slate-50 text-slate-700 h-9 w-[110px]" />
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                {(['today', 'week', 'month', 'lastMonth'] as const).map(v => {
                  const l = v === 'today' ? 'Today' : v === 'week' ? 'Week' : v === 'month' ? 'This Month' : 'Last Month';
                  return (
                    <button key={v} onClick={() => setDateRange(v)} className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${dateRange === v ? 'bg-[#0b2c60] text-white' : 'text-slate-500 hover:text-slate-800'}`}>{l}</button>
                  );
                })}
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-600">
                <User size={12} className="text-slate-400" />
                <select value={userId} onChange={e => setUserId(e.target.value)} className="bg-transparent text-xs text-slate-600 focus:outline-none cursor-pointer">
                  <option value="all">All Operators</option>
                  {USERS_OVERVIEW.map(u => <option key={u.userId} value={String(u.userId)}>{u.fullName} (@{u.username})</option>)}
                </select>
                <ChevronDown size={11} className="text-slate-400" />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg h-9 ml-auto" style={{ background: `linear-gradient(135deg, ${NAVY}, #1a4a9e)` }}>
                <Search size={13} /> Preview Receipts
              </button>
            </div>

            {/* Bulk action bar */}
            {selected.size > 0 && (
              <div className="bg-[#0b2c60]/5 border border-[#0b2c60]/20 rounded-xl px-4 py-2.5 flex items-center gap-3">
                <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: NAVY }}>
                  <Hash size={9} className="text-white" />
                </div>
                <span className="text-xs font-semibold text-[#0b2c60]">{selected.size} selected · ₹{selTotal.toLocaleString('en-IN')}</span>
                <div className="flex-1" />
                <button onClick={() => setSelected(new Set())} className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"><X size={12} /> Clear</button>
                <button className="bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5"><Download size={12} /> Download {selected.size} ZIP</button>
              </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <div className="relative max-w-xs flex-1">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search receipts…" className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b2c60]/20" />
                </div>
                <div className="flex items-center gap-3 ml-3">
                  <span className="text-[10px] bg-slate-100 text-slate-500 font-medium px-2 py-0.5 rounded-full">{filteredEntries.length} receipts</span>
                  <span className="text-xs font-bold text-emerald-600">₹{TOTAL_AMOUNT.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <table className="w-full text-sm">
                <thead className="border-b border-slate-100 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 w-8"><Checkbox checked={allFilteredSelected} onChange={toggleAll} /></th>
                    {['Receipt #', 'Date', 'Customer', 'Service', 'Amount', 'Actions'].map((h, i) => (
                      <th key={h} className={`px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide ${i >= 4 ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredEntries.map(e => (
                    <tr key={e.receiptNumber} onClick={() => setExpandedEntry(expandedEntry === e.receiptNumber ? null : e.receiptNumber)}
                      className={`cursor-pointer transition-colors ${expandedEntry === e.receiptNumber ? 'bg-[#0b2c60]/5' : 'hover:bg-slate-50'}`}>
                      <td className="px-4 py-3" onClick={ev => { ev.stopPropagation(); toggleEntry(e.receiptNumber); }}>
                        <Checkbox checked={selected.has(e.receiptNumber)} onChange={() => toggleEntry(e.receiptNumber)} />
                      </td>
                      <td className="px-3 py-3">
                        <span className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${expandedEntry === e.receiptNumber ? 'bg-[#0b2c60] text-white' : 'bg-slate-100 text-slate-700'}`}>{e.receiptNumber}</span>
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-500 whitespace-nowrap">{fmtDateShort(e.date)}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] text-white font-bold shrink-0" style={{ background: `linear-gradient(135deg, ${NAVY}, #1a4a9e)` }}>{e.customerName.charAt(0).toUpperCase()}</div>
                          <span className="text-xs font-medium text-slate-800 truncate max-w-[110px]">{e.customerName}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-500 max-w-[130px] truncate">{e.serviceType}</td>
                      <td className="px-3 py-3 text-right whitespace-nowrap">
                        <span className={`text-sm font-bold ${e.type === 'credit' ? 'text-emerald-600' : 'text-rose-500'}`}>{e.type === 'credit' ? '+' : '-'}₹{e.amount.toLocaleString('en-IN')}</span>
                      </td>
                      <td className="px-3 py-3 text-right" onClick={ev => ev.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {[Eye, Printer, Share2].map((Icon, i) => (
                            <button key={i} className="w-6 h-6 rounded hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"><Icon size={12} /></button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <span className="text-xs text-slate-500">{filteredEntries.length} receipts · {fmtDate(startDate)} → {fmtDate(endDate)}</span>
                <span className="text-sm font-bold text-emerald-600">₹{TOTAL_AMOUNT.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="w-[280px] shrink-0 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-[#0b2c60] px-4 py-3 flex items-center gap-2">
                <ArrowDownToLine size={14} className="text-white/80" />
                <span className="text-sm font-semibold text-white">Export Options</span>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Format</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setExportFormat('pdf')} className={`flex flex-col items-center gap-1.5 py-2.5 rounded-lg border-2 text-xs font-medium transition-all ${exportFormat === 'pdf' ? 'border-[#f97316] bg-[#f97316]/5 text-[#f97316]' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}><FileText size={18} /> PDF</button>
                    <button onClick={() => setExportFormat('excel')} className={`flex flex-col items-center gap-1.5 py-2.5 rounded-lg border-2 text-xs font-medium transition-all ${exportFormat === 'excel' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}><FileSpreadsheet size={18} /> Excel</button>
                  </div>
                </div>
                <button className="w-full py-2.5 bg-[#f97316] hover:bg-[#ea580c] text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <Download size={14} /> Export {selected.size > 0 ? selected.size : 'All'}
                </button>
              </div>
            </div>

            {expandedEntry && (() => {
              const e = filteredEntries.find(x => x.receiptNumber === expandedEntry);
              if (!e) return null;
              return (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-slate-700 px-4 py-2.5 flex items-center gap-2">
                    <Eye size={13} className="text-white/70" />
                    <span className="text-xs font-semibold text-white">Receipt Preview</span>
                  </div>
                  <div className="p-4">
                    <div className="border border-dashed border-slate-200 rounded-lg p-3 bg-slate-50/50 text-center">
                      <div className="w-8 h-8 bg-[#0b2c60] rounded-full flex items-center justify-center mx-auto mb-1.5"><Receipt size={14} className="text-white" /></div>
                      <p className="text-[10px] font-bold text-[#0b2c60] uppercase tracking-wider">SAHU CSC</p>
                      <p className="text-[9px] text-slate-400 mb-2">Common Service Center, Odisha</p>
                      <div className="border-t border-dashed border-slate-200 pt-2 text-left space-y-1">
                        {[['Receipt #', e.receiptNumber], ['Date', fmtDate(e.date)], ['Customer', e.customerName], ['Service', e.serviceType]].map(([k, v]) => (
                          <div key={k} className="flex justify-between text-[10px]">
                            <span className="text-slate-500">{k}</span>
                            <span className="font-semibold text-slate-800 text-right max-w-[110px] truncate">{v}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-dashed border-slate-200 mt-2 pt-2 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-800">Total Paid</span>
                        <span className={`text-sm font-bold ${e.type === 'credit' ? 'text-emerald-600' : 'text-rose-500'}`}>{e.type === 'credit' ? '+' : '-'}₹{e.amount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="mt-2.5 flex justify-center">
                        <div className="w-14 h-14 bg-slate-100 border border-slate-200 rounded flex items-center justify-center"><QrCode size={28} className="text-slate-400" /></div>
                      </div>
                      <p className="text-[9px] text-slate-400 mt-1">Scan to verify online</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="bg-white rounded-xl border border-orange-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 flex items-center gap-2.5" style={{ background: `linear-gradient(135deg, ${SAFFRON}, #ea580c)` }}>
                <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center shrink-0"><Clock size={14} className="text-white" /></div>
                <div>
                  <p className="text-sm font-bold text-white">Monthly Auto-Export</p>
                  <p className="text-[10px] text-white/60">Runs on 1st of each month</p>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="rounded-lg bg-orange-50 border border-orange-100 px-3 py-2 flex items-start gap-2">
                  <Mail size={11} className="text-orange-500 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-orange-700 leading-relaxed">ZIP is automatically emailed to admin accounts on the 1st.</p>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
                  <TrendingUp size={11} className="text-slate-400 shrink-0" />
                  <p className="text-[10px] text-slate-500">Next auto-run: <strong className="text-slate-700">1 August 2026</strong></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Mobile content ═══ */}
      <div className="sm:hidden">
        <div className="px-3 pt-3">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Total', value: String(MOCK_ENTRIES.length), icon: Receipt, accent: NAVY },
              { label: 'Amount', value: `₹${TOTAL_AMOUNT.toLocaleString('en-IN')}`, icon: IndianRupee, accent: '#059669' },
              { label: 'Selected', value: String(selected.size), icon: CheckSquare, accent: SAFFRON },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-slate-200 shadow-sm px-3 py-2.5 flex items-center gap-2 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: s.accent }} />
                <s.icon size={14} style={{ color: s.accent }} className="shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-bold leading-none truncate" style={{ color: NAVY }}>{s.value}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-3 py-2.5 mt-1">
          <div className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 flex gap-2 shadow-sm">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search receipts..." className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700" />
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${showFilters ? 'bg-[#0b2c60] border-[#0b2c60] text-white' : 'bg-white border-slate-200 text-slate-500'}`}>
              <SlidersHorizontal size={16} />
            </button>
          </div>
        </div>

        {selected.size > 0 && (
          <div className="mx-3 mb-2 bg-[#0b2c60]/5 border border-[#0b2c60]/20 rounded-2xl px-4 py-2.5 flex items-center gap-2">
            <span className="flex-1 text-xs font-semibold text-[#0b2c60]">{selected.size} selected · ₹{selTotal.toLocaleString('en-IN')}</span>
            <button onClick={() => setSelected(new Set())} className="p-1 text-slate-400"><X size={14} /></button>
            <button className="bg-[#f97316] text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1"><Download size={12} /> Export</button>
          </div>
        )}

        <div className="px-3 pb-4 space-y-2">
          {filteredEntries.map(e => (
            <div key={e.receiptNumber} className={`bg-white rounded-2xl border shadow-sm ${selected.has(e.receiptNumber) ? 'border-[#0b2c60]/30' : 'border-slate-200'}`}>
              <div className="p-4 flex items-center gap-3">
                <div onClick={() => toggleEntry(e.receiptNumber)} className="p-1"><Checkbox checked={selected.has(e.receiptNumber)} onChange={() => toggleEntry(e.receiptNumber)} size={18} /></div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: `linear-gradient(135deg, ${NAVY}, #1a4a9e)` }}>{e.customerName.charAt(0).toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800 truncate">{e.customerName}</p>
                    <span className={`text-sm font-bold shrink-0 ${e.type === 'credit' ? 'text-emerald-600' : 'text-rose-500'}`}>{e.type === 'credit' ? '+' : '-'}₹{e.amount.toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{e.serviceType}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{e.receiptNumber}</span>
                    <span className="text-[10px] text-slate-400">{fmtDateShort(e.date)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Redesign;
