import React from 'react';
import { 
  LayoutDashboard, BookOpen, HandCoins, Fingerprint, Briefcase, BarChart3, 
  Bell, UserCircle, WifiOff, Moon, LogOut, Crown, Sun, ChevronDown, 
  Eye, ArrowUpRight, ArrowDownLeft, FileText, Calendar, SlidersHorizontal, 
  Download, RotateCcw, Clock, IndianRupee, Plus, Database, ChevronRight, 
  ChevronLeft, ChevronsLeft, ChevronsRight, Lock, LayoutGrid, Search
} from 'lucide-react';

// NavItem Component
function NavItem({ icon, label, active, badge }: { icon: React.ReactNode, label: string, active?: boolean, badge?: string }) {
  return (
    <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${active ? 'bg-[#f97316] text-white shadow-md font-semibold' : 'text-white/65 hover:bg-white/8 hover:text-white font-medium'}`}>
      {icon}
      <span className="flex-1 text-left text-sm">{label}</span>
      {badge && (
        <span className="bg-white text-[#f97316] text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[20px] text-center shadow-sm">
          {badge}
        </span>
      )}
    </button>
  );
}

export function LedgerPage() {
    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: 'Inter, sans-serif', background: '#f8fafc' }}>
            <style>
                {`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.2); border-radius: 4px; }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.4); }
                `}
            </style>
            
            {/* Sidebar — exact match from layout.tsx */}
            <div className="flex flex-col h-full bg-[#0b2c60] w-[256px] flex-shrink-0 z-20 shadow-2xl">

                {/* ── Top Header ── */}
                <div className="px-4 pt-5 pb-4 flex items-center gap-3 border-b border-white/10">
                    <div className="relative flex-shrink-0">
                        <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-white/20 shadow-md">
                            <img src="/__mockup/images/sahu-logo.png" alt="SAHU CSC Logo" className="w-full h-full object-cover" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="font-extrabold text-base leading-tight tracking-wide text-white">SAHU CSC</h2>
                        <p className="text-[11px] text-white/50 font-medium tracking-wide mt-0.5">Management Platform</p>
                    </div>
                </div>

                {/* ── Nav Items ── */}
                <div className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5 custom-scrollbar">
                    {[
                        { icon: <LayoutDashboard size={17} />, label: 'Dashboard', active: false },
                        { icon: <BookOpen size={17} />, label: 'Ledger', active: true },
                        { icon: <HandCoins size={17} />, label: 'Udhari Khata', active: false },
                        { icon: <Fingerprint size={17} />, label: 'AePS Cash', active: false },
                        { icon: <Briefcase size={17} />, label: 'Services', active: false },
                        { icon: <BarChart3 size={17} />, label: 'Reports', active: false },
                        { icon: <Bell size={17} />, label: 'Notifications', active: false, badge: 2 },
                        { icon: <UserCircle size={17} />, label: 'My Profile', active: false },
                        { icon: <WifiOff size={17} />, label: 'Ann & Offline', active: false },
                    ].map((item) => (
                        <div key={item.label} className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors duration-100 ${item.active ? 'bg-[#f97316] text-white font-semibold shadow-md shadow-orange-900/30' : 'text-white/65 hover:text-white hover:bg-white/8'}`}>
                            <div className="flex items-center gap-3">
                                <span className={item.active ? 'text-white' : 'text-white/45'}>{item.icon}</span>
                                <span className="text-[14px] leading-none">{item.label}</span>
                            </div>
                            {item.badge && item.badge > 0 && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${item.active ? 'bg-white/25 text-white' : 'bg-[#f97316] text-white'}`}>
                                    {item.badge}
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                {/* ── Version ── */}
                <div className="px-4 py-1.5 flex items-center justify-between">
                    <span className="text-[9px] text-white/20 font-mono tracking-wide uppercase">SAHU CSC v3.3.0</span>
                    <span className="text-[9px] text-white/20">© 2026</span>
                </div>

                {/* ── User Footer ── */}
                <div className="mx-3 mb-3 mt-0.5 p-2.5 rounded-2xl bg-white/8 border border-white/10 flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-full ring-2 ring-[#f97316]/60 shadow-sm flex items-center justify-center bg-[#f97316] text-white text-sm font-black flex-shrink-0">
                        SA
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-white leading-tight truncate">SAHU Admin</p>
                        <p className="text-[11px] text-white/45 mt-0.5 capitalize">Admin</p>
                    </div>
                    <button className="flex-shrink-0 w-8 h-8 rounded-xl border border-white/15 bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors duration-100 cursor-pointer">
                        <Moon size={13} />
                    </button>
                    <button className="flex-shrink-0 w-8 h-8 rounded-xl border border-white/15 bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors duration-100 cursor-pointer">
                        <LogOut size={13} className="rotate-180" />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
                {/* Top Header */}
                <div className="h-16 bg-white border-b border-slate-200 sticky top-0 z-10 flex flex-col justify-center px-6 relative flex-shrink-0">
                    <div className="absolute top-0 left-0 w-full h-[3px]" style={{ background: 'linear-gradient(90deg, #0b2c60 0%, #1e40af 40%, #f97316 75%, #ea580c 100%)' }} />
                    
                    {/* Hex Mesh Pattern Overlay */}
                    <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0b2c60 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
                    
                    {/* Aurora blobs */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
                    <div className="absolute top-0 left-1/2 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 -translate-x-1/2" />

                    <div className="flex justify-between items-center relative z-10">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2.5">
                                <span className="text-xl leading-none">📚</span>
                                <h1 className="text-[22px] font-bold text-[#0b2c60] leading-none tracking-tight">Ledger</h1>
                            </div>
                            <p className="text-[13px] font-medium text-slate-500 mt-1.5 leading-none">Track all your transactions and manage records seamlessly.</p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <button className="h-8 w-8 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors shadow-sm">
                                <Sun size={16} />
                            </button>
                            <button className="rounded-xl px-3 h-8 bg-[#f8fafc] border border-[#e2e8f0] flex items-center gap-2 text-slate-600 hover:bg-slate-100 transition-colors shadow-sm">
                                <Bell size={14} />
                                <span className="text-sm font-semibold">Notifications</span>
                                <span className="bg-[#f97316] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[20px] text-center shadow-sm">2</span>
                            </button>
                            <button className="rounded-xl p-1 pr-3 h-8 bg-[#f8fafc] border border-[#e2e8f0] flex items-center gap-2 hover:bg-slate-100 transition-colors shadow-sm">
                                <div className="w-6 h-6 rounded-[8px] bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-[10px] font-bold">SA</div>
                                <span className="text-sm font-bold text-slate-700">SAHU</span>
                                <ChevronDown size={14} className="text-slate-400 ml-0.5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Body Content Area */}
                <div className="flex-1 flex flex-row overflow-hidden relative">
                    
                    {/* Middle scrollable area */}
                    <div className="flex-1 overflow-y-auto px-6 py-5 bg-slate-50/50 flex flex-col gap-4 custom-scrollbar">
                        
                        {/* Row 1: Cards */}
                        <div className="grid grid-cols-4 gap-4">
                            {/* Card 1 */}
                            <div className="bg-gradient-to-br from-[#0b2c60] to-[#1e3a8a] rounded-2xl p-5 relative overflow-hidden shadow-md shadow-blue-900/10">
                                <div className="absolute -right-4 -top-4 w-28 h-28 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                                <div className="flex justify-between items-start mb-2.5 relative z-10">
                                    <div className="text-white/70 text-sm font-medium tracking-wide">Current Balance</div>
                                    <button className="bg-white/10 rounded-lg p-1.5 hover:bg-white/20 text-white/90 backdrop-blur-sm transition-colors">
                                        <Eye size={14} />
                                    </button>
                                </div>
                                <div className="text-[28px] font-black text-white mb-4 relative z-10 tracking-tight">₹0.00</div>
                                <div className="flex items-center gap-1.5 text-white/50 text-xs relative z-10 font-medium">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                                    Last updated: Just now
                                </div>
                            </div>

                            {/* Card 2 */}
                            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2.5">
                                    <div className="text-slate-500 text-sm font-semibold">Total Credits</div>
                                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-2 text-emerald-600">
                                        <ArrowUpRight size={16} strokeWidth={2.5} />
                                    </div>
                                </div>
                                <div className="text-[28px] font-black text-emerald-600 mb-4 tracking-tight">₹0.00</div>
                                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                                    This month
                                </div>
                            </div>

                            {/* Card 3 */}
                            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2.5">
                                    <div className="text-slate-500 text-sm font-semibold">Total Debits</div>
                                    <div className="bg-red-50 border border-red-100 rounded-xl p-2 text-red-500">
                                        <ArrowDownLeft size={16} strokeWidth={2.5} />
                                    </div>
                                </div>
                                <div className="text-[28px] font-black text-red-500 mb-4 tracking-tight">₹0.00</div>
                                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                                    This month
                                </div>
                            </div>

                            {/* Card 4 */}
                            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2.5">
                                    <div className="text-slate-500 text-sm font-semibold">Total Transactions</div>
                                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-2 text-blue-600">
                                        <FileText size={16} strokeWidth={2.5} />
                                    </div>
                                </div>
                                <div className="text-[28px] font-black text-blue-600 mb-4 tracking-tight">0</div>
                                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                                    This month
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Quick Add */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-2.5 flex gap-2 items-center w-full shadow-sm">
                            <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 h-10 w-36 text-sm bg-slate-50 focus-within:bg-white focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
                                <Calendar size={16} className="text-slate-400" />
                                <input type="text" defaultValue="09/07/2026" className="w-full outline-none text-slate-700 bg-transparent font-semibold" />
                            </div>
                            <input type="text" placeholder="Customer name" className="flex-1 min-w-[120px] border border-slate-200 rounded-xl px-3 h-10 text-sm outline-none text-slate-700 placeholder-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all font-medium" />
                            <div className="relative flex-1 min-w-[120px]">
                                <select className="w-full border border-slate-200 rounded-xl px-3 pr-8 h-10 text-sm outline-none text-slate-700 bg-transparent appearance-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all cursor-pointer font-medium">
                                    <option value="" disabled selected hidden>Service type</option>
                                    <option>Aadhar Withdrawal</option>
                                    <option>Pan Card Service</option>
                                    <option>Electricity Bill</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                                <button className="bg-emerald-500 text-white rounded-lg px-3.5 h-8 text-xs font-bold shadow-sm">Cr</button>
                                <button className="text-slate-500 hover:bg-white hover:text-red-600 hover:shadow-sm rounded-lg px-3.5 h-8 text-xs font-bold transition-all">Dr</button>
                            </div>
                            <div className="relative w-32">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                <input type="number" placeholder="Amount" className="w-full border border-slate-200 rounded-xl pl-7 pr-3 h-10 text-sm outline-none text-slate-700 placeholder-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all font-bold" />
                            </div>
                            <input type="text" placeholder="Note (optional)" className="flex-1 min-w-[120px] border border-slate-200 rounded-xl px-3 h-10 text-sm outline-none text-slate-700 placeholder-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all font-medium" />
                            <button className="bg-[#f97316] text-white px-6 h-10 rounded-xl text-sm font-bold hover:bg-[#ea580c] transition-colors whitespace-nowrap shadow-sm hover:shadow flex items-center gap-1.5 active:scale-95">
                                Apply
                            </button>
                        </div>

                        {/* Row 3: Search & Filter */}
                        <div className="bg-white border border-slate-200 rounded-2xl px-3 py-2.5 flex gap-3 items-center shadow-sm">
                            <div className="flex items-center gap-2.5 flex-1 px-2 border-r border-slate-100 mr-2">
                                <Search size={18} className="text-slate-400" />
                                <input type="text" placeholder="Search transactions..." className="w-full outline-none text-sm text-slate-700 placeholder-slate-400 font-medium bg-transparent" />
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="flex items-center gap-2 border border-slate-200 bg-slate-50 rounded-xl px-3.5 h-9 text-sm text-slate-700 hover:bg-slate-100 font-semibold transition-colors">
                                    <SlidersHorizontal size={14} /> Filters
                                </button>
                                <button className="flex items-center gap-2 border border-slate-200 bg-slate-50 rounded-xl px-3.5 h-9 text-sm text-slate-700 hover:bg-slate-100 font-semibold transition-colors">
                                    <Download size={14} /> Export <ChevronDown size={14} className="text-slate-400 ml-0.5" />
                                </button>
                                <div className="w-px h-6 bg-slate-200 mx-1.5"></div>
                                <button className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 font-semibold px-2 transition-colors">
                                    <RotateCcw size={14} /> Clear
                                </button>
                                <button className="bg-[#f97316] text-white rounded-xl px-5 h-9 text-sm font-bold hover:bg-[#ea580c] transition-colors shadow-sm ml-1 active:scale-95">
                                    Apply
                                </button>
                            </div>
                        </div>

                        {/* Table Area */}
                        <div className="flex flex-col shadow-sm rounded-2xl bg-white border border-slate-200">
                            {/* Row 4 Tabs */}
                            <div className="flex border-b border-slate-200">
                                <button className="flex items-center gap-2 border-b-2 border-[#0b2c60] text-[#0b2c60] font-bold px-6 py-3.5 text-sm">
                                    <FileText size={16} strokeWidth={2.5} /> Transactions
                                </button>
                                <button className="flex items-center gap-2 border-b-2 border-transparent text-slate-400 font-semibold px-6 py-3.5 text-sm hover:text-slate-600 transition-colors">
                                    <Clock size={16} strokeWidth={2.5} /> Receipt History
                                </button>
                            </div>
                            
                            {/* Row 5 Table Header */}
                            <div className="bg-slate-50/80 px-4 py-3.5 flex text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                                <div className="w-[140px] flex items-center gap-1 cursor-pointer hover:text-slate-700">Date & Time <span className="text-[10px]">↕</span></div>
                                <div className="flex-1">Customer</div>
                                <div className="w-[130px]">Service</div>
                                <div className="w-[80px]">Type</div>
                                <div className="w-[100px] text-right">Amount</div>
                                <div className="w-[150px] px-4">Note</div>
                                <div className="w-[80px] text-center">Receipt</div>
                                <div className="w-[80px] text-right">Action</div>
                            </div>
                            
                            {/* Row 6 Empty State */}
                            <div className="min-h-[280px] flex flex-col items-center justify-center gap-3 py-16">
                                <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-[#f97316] mb-2 ring-[6px] ring-orange-50">
                                    <IndianRupee size={28} strokeWidth={2.5} />
                                </div>
                                <div className="text-slate-800 text-lg font-bold">No transactions found</div>
                                <div className="text-slate-500 text-sm mb-3 font-medium">Add your first entry to get started</div>
                                <button className="bg-[#f97316] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#ea580c] transition-colors shadow-sm active:scale-95">
                                    + Add New Entry
                                </button>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex flex-col gap-5 mt-1">
                            <div className="flex items-center justify-between">
                                <div className="text-slate-500 text-sm font-medium">Showing 0 of 0 transactions</div>
                                <div className="flex items-center gap-1">
                                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all disabled:opacity-50"><ChevronsLeft size={16} /></button>
                                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all disabled:opacity-50"><ChevronLeft size={16} /></button>
                                    <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#0b2c60] text-white text-sm font-bold shadow-sm">1</button>
                                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all disabled:opacity-50"><ChevronRight size={16} /></button>
                                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all disabled:opacity-50"><ChevronsRight size={16} /></button>
                                </div>
                            </div>
                            <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs font-medium pb-4">
                                <Lock size={12} /> All your transactions are secure and encrypted
                            </div>
                        </div>

                    </div>
                    
                    {/* Right Panel */}
                    <div className="w-64 flex-shrink-0 overflow-y-auto p-4 flex flex-col gap-4 bg-slate-50 border-l border-slate-200 custom-scrollbar z-10 shadow-[-4px_0_15px_rgba(0,0,0,0.02)]">
                        
                        {/* Quick Actions */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-3.5 text-sm">
                                <span className="text-lg leading-none">⚡</span> Quick Actions
                            </h3>
                            <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 group transition-all">
                                    <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-white bg-gradient-to-br from-[#f97316] to-[#ea580c] shadow-sm flex-shrink-0">
                                        <Plus size={18} strokeWidth={3} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[13px] font-bold text-slate-800 truncate">Add New Entry</div>
                                        <div className="text-[11px] text-slate-500 truncate">Record a new transaction</div>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                                </div>
                                <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 group transition-all">
                                    <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-white bg-gradient-to-br from-purple-500 to-purple-600 shadow-sm flex-shrink-0">
                                        <FileText size={18} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[13px] font-bold text-slate-800 truncate">Receipt History</div>
                                        <div className="text-[11px] text-slate-500 truncate">View all receipts</div>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                                </div>
                                <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 group transition-all">
                                    <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-white bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-sm flex-shrink-0">
                                        <Download size={18} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[13px] font-bold text-slate-800 truncate">Export Ledger</div>
                                        <div className="text-[11px] text-slate-500 truncate">Download as Excel / PDF</div>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                                </div>
                                <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 group transition-all">
                                    <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-white bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm flex-shrink-0">
                                        <Database size={18} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[13px] font-bold text-slate-800 truncate">Backup Ledger</div>
                                        <div className="text-[11px] text-slate-500 truncate">Create a ledger backup</div>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                                </div>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                                    📊 Summary
                                </h3>
                                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200">This Month</span>
                            </div>
                            
                            <div className="relative w-[110px] h-[110px] mx-auto my-1">
                                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="14" />
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#0b2c60" strokeWidth="14" strokeDasharray="251.2" strokeDashoffset="251.2" strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center mt-1">
                                    <span className="text-[20px] font-black text-slate-800 leading-none">0</span>
                                    <span className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-wide">Total</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 mt-4 px-1">
                                <div className="flex justify-between items-center text-xs">
                                    <div className="flex items-center gap-2 text-slate-600 font-semibold"><span className="text-emerald-500 text-[12px] leading-none">●</span> Credits</div>
                                    <div className="font-bold text-slate-800">₹0.00</div>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <div className="flex items-center gap-2 text-slate-600 font-semibold"><span className="text-red-500 text-[12px] leading-none">●</span> Debits</div>
                                    <div className="font-bold text-slate-800">₹0.00</div>
                                </div>
                                <div className="flex justify-between items-center text-[13px] border-t border-slate-100 pt-2.5 mt-1">
                                    <div className="flex items-center gap-2 text-[#0b2c60] font-bold"><span className="text-[#0b2c60] text-[12px] leading-none">●</span> Balance</div>
                                    <div className="font-black text-[#0b2c60]">₹0.00</div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex-1 flex flex-col min-h-[160px]">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 text-sm">
                                🕐 Recent Activity
                            </h3>
                            <div className="flex-1 flex flex-col items-center justify-center text-center px-4 gap-2">
                                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-1 border border-slate-100">
                                    <Clock size={20} strokeWidth={2.5} />
                                </div>
                                <div className="text-sm font-bold text-slate-600">No recent activity</div>
                                <div className="text-[11px] font-medium text-slate-400 leading-relaxed px-2">Your recent transactions will appear here</div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default LedgerPage;