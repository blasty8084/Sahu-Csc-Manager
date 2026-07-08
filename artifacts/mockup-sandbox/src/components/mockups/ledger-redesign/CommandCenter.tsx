import './_group.css';
import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Filter, 
  Download, 
  FileText, 
  Search,
  Plus,
  MoreVertical,
  X,
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Types
interface Transaction {
  id: string;
  date: string;
  customer: string;
  service: string;
  credit: number | null;
  debit: number | null;
  balance: number;
  note: string;
}

// Mock Data
const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 'CSC-2026-0012', date: '2026-02-24', customer: 'Ramesh Kumar', service: 'Income Certificate', credit: 150, debit: null, balance: 45150, note: 'Tatkal' },
  { id: 'CSC-2026-0011', date: '2026-02-23', customer: 'Sunita Devi', service: 'Voter ID Print', credit: 50, debit: null, balance: 45000, note: 'Color print' },
  { id: 'CSC-2026-0010', date: '2026-02-23', customer: 'Abdul Rahman', service: 'PAN Card New', credit: 200, debit: null, balance: 44950, note: 'Urgent processing' },
  { id: 'CSC-2026-0009', date: '2026-02-22', customer: 'Office Expense', service: 'Internet Bill', credit: null, debit: 800, balance: 44750, note: 'BSNL Broadband' },
  { id: 'CSC-2026-0008', date: '2026-02-21', customer: 'Priya Nair', service: 'Aadhaar Update', credit: 50, debit: null, balance: 45550, note: 'Mobile link' },
  { id: 'CSC-2026-0007', date: '2026-02-21', customer: 'AePS Cash', service: 'Cash Withdrawal', credit: null, debit: 5000, balance: 45500, note: 'SBI withdrawal' },
  { id: 'CSC-2026-0006', date: '2026-02-20', customer: 'Amit Singh', service: 'Ration Card', credit: 100, debit: null, balance: 50500, note: 'New application' },
  { id: 'CSC-2026-0005', date: '2026-02-20', customer: 'AePS Cash', service: 'Cash Withdrawal', credit: null, debit: 2000, balance: 50400, note: 'PNB withdrawal' },
  { id: 'CSC-2026-0004', date: '2026-02-19', customer: 'Rekha Sharma', service: 'Passport Apply', credit: 300, debit: null, balance: 52400, note: '' },
  { id: 'CSC-2026-0003', date: '2026-02-19', customer: 'Stationery', service: 'Print Paper', credit: null, debit: 350, balance: 52100, note: 'A4 bundle' },
];

export function CommandCenter() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  
  // New entry state
  const [newEntry, setNewEntry] = useState({
    date: '2026-02-24',
    customer: '',
    service: '',
    credit: '',
    debit: '',
    note: ''
  });

  const handleAddEntry = () => {
    if (!newEntry.customer || !newEntry.service || (!newEntry.credit && !newEntry.debit)) return;
    
    const creditVal = newEntry.credit ? parseFloat(newEntry.credit) : null;
    const debitVal = newEntry.debit ? parseFloat(newEntry.debit) : null;
    const currentBalance = transactions[0].balance;
    const newBalance = currentBalance + (creditVal || 0) - (debitVal || 0);
    
    const entry = {
      id: `CSC-2026-00${transactions.length + 3}`,
      date: newEntry.date,
      customer: newEntry.customer,
      service: newEntry.service,
      credit: creditVal,
      debit: debitVal,
      balance: newBalance,
      note: newEntry.note
    };
    
    setTransactions([entry, ...transactions]);
    setNewEntry({
      date: '2026-02-24',
      customer: '',
      service: '',
      credit: '',
      debit: '',
      note: ''
    });
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-[#0b2c60] text-slate-100 font-sans min-w-[1280px] selection:bg-indigo-500/30">
      
      {/* Top Header */}
      <div className="bg-[#071c40] border-b border-indigo-900/50 px-6 py-4 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <div className="p-1.5 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg shadow-lg shadow-orange-500/20">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            Financial Ledger
            <div className="h-2 w-2 rounded-full bg-orange-500 ml-1 shadow-[0_0_8px_rgba(249,115,22,0.8)] animate-pulse" />
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
            <Input 
              placeholder="Search receipt..." 
              className="pl-9 w-64 bg-[#0a2350] border-indigo-800/50 text-white placeholder:text-slate-400 focus-visible:ring-indigo-500 focus-visible:border-indigo-400 transition-all"
            />
          </div>
          <Button variant="outline" className="bg-[#0a2350] border-indigo-800/50 text-slate-200 hover:bg-[#123675] hover:text-white transition-colors">
            <FileText className="w-4 h-4 mr-2 text-indigo-400" />
            Receipts
          </Button>
          <Button variant="outline" className="bg-[#0a2350] border-indigo-800/50 text-slate-200 hover:bg-[#123675] hover:text-white transition-colors">
            <Download className="w-4 h-4 mr-2 text-indigo-400" />
            Export
          </Button>
          <Button 
            variant={isFilterOpen ? "default" : "outline"} 
            className={isFilterOpen 
              ? "bg-indigo-600 hover:bg-indigo-500 text-white border-transparent shadow-lg shadow-indigo-500/25" 
              : "bg-[#0a2350] border-indigo-800/50 text-slate-200 hover:bg-[#123675] hover:text-white transition-colors"}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter className={`w-4 h-4 mr-2 ${isFilterOpen ? 'text-white' : 'text-indigo-400'}`} />
            Filters {isFilterOpen ? <X className="w-3 h-3 ml-1 opacity-70" /> : null}
          </Button>
        </div>
      </div>

      <div className="p-6 flex gap-6 items-start max-w-[1600px] mx-auto">
        
        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          
          {/* Dashboard Stats */}
          <div className="grid grid-cols-3 gap-6">
            <div className="rounded-2xl border border-indigo-500/20 p-6 shadow-2xl relative overflow-hidden bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] min-h-[140px] flex flex-col justify-between group">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-all duration-500" />
              <div className="absolute right-4 top-4 opacity-10">
                <Wallet className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <p className="text-sm font-medium text-indigo-200/80 mb-2 uppercase tracking-wider">Current Balance</p>
                <div className="flex items-end gap-3">
                  <h2 className="text-4xl font-extrabold text-white drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                    {formatCurrency(45150)}
                  </h2>
                </div>
              </div>
              <div className="relative z-10 flex items-center justify-between mt-4">
                <p className="text-xs text-indigo-300/60 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> As of Feb 24, 2026
                </p>
                <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/30 backdrop-blur-md">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12%
                </Badge>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 p-6 shadow-2xl relative overflow-hidden bg-gradient-to-br from-[#059669] to-[#10b981] min-h-[140px] flex flex-col justify-between group">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500" />
              <div className="absolute right-4 top-4 opacity-20">
                <ArrowDownRight className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <p className="text-sm font-medium text-emerald-100 mb-2 uppercase tracking-wider">Total Credits (Today)</p>
                <h2 className="text-4xl font-extrabold text-white drop-shadow-md">
                  {formatCurrency(200)}
                </h2>
              </div>
              <div className="relative z-10 flex items-center justify-between mt-4">
                <p className="text-xs text-emerald-100/70 font-medium bg-black/10 px-2.5 py-1 rounded-full backdrop-blur-sm">
                  2 transactions
                </p>
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                  <Plus className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-rose-500/20 p-6 shadow-2xl relative overflow-hidden bg-gradient-to-br from-[#b91c1c] to-[#e11d48] min-h-[140px] flex flex-col justify-between group">
              <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500" />
              <div className="absolute right-4 top-4 opacity-20">
                <ArrowUpRight className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <p className="text-sm font-medium text-rose-100 mb-2 uppercase tracking-wider">Total Debits (Today)</p>
                <h2 className="text-4xl font-extrabold text-white drop-shadow-md">
                  {formatCurrency(0)}
                </h2>
              </div>
              <div className="relative z-10 flex items-center justify-between mt-4">
                <p className="text-xs text-rose-100/70 font-medium bg-black/10 px-2.5 py-1 rounded-full backdrop-blur-sm">
                  0 transactions
                </p>
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                  <TrendingDown className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-[#0f172a] border border-indigo-900/50 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden flex flex-col backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-[#090e1a] border-b border-indigo-900/50 text-slate-400 font-semibold uppercase tracking-widest text-[10px]">
                  <tr>
                    <th className="px-5 py-4 w-32">Receipt No.</th>
                    <th className="px-5 py-4 w-32">Date</th>
                    <th className="px-5 py-4 w-48">Customer Name</th>
                    <th className="px-5 py-4 w-48">Service Type</th>
                    <th className="px-5 py-4 w-32 text-right">Credit (In)</th>
                    <th className="px-5 py-4 w-32 text-right">Debit (Out)</th>
                    <th className="px-5 py-4 w-32 text-right">Balance</th>
                    <th className="px-5 py-4">Note</th>
                    <th className="px-5 py-4 w-16 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-900/30">
                  
                  {/* INLINE QUICK ADD ROW */}
                  <tr className="bg-gradient-to-r from-amber-500/20 to-amber-500/5 border-b-2 border-amber-500/30 relative group shadow-[inset_4px_0_0_rgba(245,158,11,1)]">
                    <td className="px-5 py-3">
                      <Input 
                        disabled 
                        placeholder="Auto" 
                        className="h-9 text-xs bg-black/20 border-amber-500/20 font-mono text-amber-200/50 placeholder:text-amber-200/30"
                      />
                    </td>
                    <td className="px-5 py-3">
                      <Input 
                        type="date" 
                        value={newEntry.date}
                        onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                        className="h-9 text-xs border-amber-500/30 focus-visible:ring-amber-500 bg-black/40 text-amber-50"
                        style={{ colorScheme: 'dark' }}
                      />
                    </td>
                    <td className="px-5 py-3">
                      <Input 
                        placeholder="Customer Name" 
                        value={newEntry.customer}
                        onChange={(e) => setNewEntry({...newEntry, customer: e.target.value})}
                        className="h-9 text-xs border-amber-500/30 focus-visible:ring-amber-500 bg-black/40 text-amber-50 placeholder:text-amber-200/40"
                      />
                    </td>
                    <td className="px-5 py-3">
                      <Input 
                        placeholder="Service (e.g. PAN)" 
                        value={newEntry.service}
                        onChange={(e) => setNewEntry({...newEntry, service: e.target.value})}
                        className="h-9 text-xs border-amber-500/30 focus-visible:ring-amber-500 bg-black/40 text-amber-50 placeholder:text-amber-200/40"
                      />
                    </td>
                    <td className="px-5 py-3 relative">
                      <div className="absolute left-7 top-1/2 -translate-y-1/2 text-emerald-400/50 text-xs pointer-events-none">₹</div>
                      <Input 
                        placeholder="0" 
                        type="number"
                        value={newEntry.credit}
                        onChange={(e) => setNewEntry({...newEntry, credit: e.target.value, debit: ''})}
                        className="h-9 text-xs border-amber-500/30 focus-visible:ring-emerald-500 bg-black/40 pl-6 text-right font-semibold text-emerald-400 placeholder:font-normal placeholder:text-amber-200/40"
                      />
                    </td>
                    <td className="px-5 py-3 relative">
                      <div className="absolute left-7 top-1/2 -translate-y-1/2 text-rose-400/50 text-xs pointer-events-none">₹</div>
                      <Input 
                        placeholder="0" 
                        type="number"
                        value={newEntry.debit}
                        onChange={(e) => setNewEntry({...newEntry, debit: e.target.value, credit: ''})}
                        className="h-9 text-xs border-amber-500/30 focus-visible:ring-rose-500 bg-black/40 pl-6 text-right font-semibold text-rose-400 placeholder:font-normal placeholder:text-amber-200/40"
                      />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="text-amber-200/40 text-xs italic">Auto</span>
                    </td>
                    <td className="px-5 py-3">
                      <Input 
                        placeholder="Optional note" 
                        value={newEntry.note}
                        onChange={(e) => setNewEntry({...newEntry, note: e.target.value})}
                        className="h-9 text-xs border-amber-500/30 focus-visible:ring-amber-500 bg-black/40 text-amber-50 placeholder:text-amber-200/40"
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddEntry() }}
                      />
                    </td>
                    <td className="px-5 py-3 text-center">
                      <Button 
                        size="sm" 
                        className="h-9 w-9 p-0 bg-amber-500 hover:bg-amber-400 text-black rounded-lg transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:shadow-[0_0_20px_rgba(245,158,11,0.6)]"
                        onClick={handleAddEntry}
                        disabled={!newEntry.customer || !newEntry.service || (!newEntry.credit && !newEntry.debit)}
                      >
                        <Plus className="w-5 h-5" />
                      </Button>
                    </td>
                  </tr>

                  {/* DATA ROWS */}
                  {transactions.map((tx, idx) => (
                    <tr 
                      key={tx.id} 
                      className={`
                        group relative transition-all duration-200
                        ${idx % 2 === 0 ? 'bg-[#11192b]' : 'bg-[#0f172a]'} 
                        hover:bg-[#1a2540] hover:shadow-lg hover:-translate-y-[1px] hover:z-10
                      `}
                    >
                      <td className="px-5 py-4 font-mono text-xs text-indigo-300/70 relative">
                        <span className="absolute inset-y-0 left-0 w-[3px] bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {tx.id}
                      </td>
                      <td className="px-5 py-4 text-slate-300 text-xs">{tx.date}</td>
                      <td className="px-5 py-4 font-medium text-slate-100">{tx.customer}</td>
                      <td className="px-5 py-4">
                        <Badge variant="outline" className="font-normal bg-indigo-950/30 text-indigo-300 border-indigo-800/50">
                          {tx.service}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {tx.credit ? (
                          <span className="text-emerald-400 font-semibold drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]">
                            +{formatCurrency(tx.credit)}
                          </span>
                        ) : <span className="text-slate-600">-</span>}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {tx.debit ? (
                          <span className="text-rose-400 font-semibold drop-shadow-[0_0_8px_rgba(251,113,133,0.4)]">
                            -{formatCurrency(tx.debit)}
                          </span>
                        ) : <span className="text-slate-600">-</span>}
                      </td>
                      <td className="px-5 py-4 text-right font-bold text-white tracking-wide">
                        {formatCurrency(tx.balance)}
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-xs truncate max-w-[150px]" title={tx.note}>
                        {tx.note || <span className="text-slate-600 italic">none</span>}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all rounded-md">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="border-t border-indigo-900/50 px-5 py-4 flex items-center justify-between bg-[#0a0f1c] mt-auto">
              <span className="text-sm text-slate-400">
                Showing <span className="font-medium text-white">1</span> to <span className="font-medium text-white">10</span> of <span className="font-medium text-white">142</span> entries
              </span>
              <div className="flex gap-1.5">
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-md bg-transparent border-indigo-800/50 text-slate-400 hover:bg-indigo-900/30 hover:text-white" disabled>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-md bg-indigo-600 border-indigo-500 text-white font-medium shadow-[0_0_10px_rgba(79,70,229,0.3)]">
                  1
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-md bg-transparent border-indigo-800/50 text-slate-400 hover:bg-indigo-900/30 hover:text-white">
                  2
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-md bg-transparent border-indigo-800/50 text-slate-400 hover:bg-indigo-900/30 hover:text-white">
                  3
                </Button>
                <span className="flex items-center px-2 text-slate-600">...</span>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-md bg-transparent border-indigo-800/50 text-slate-400 hover:bg-indigo-900/30 hover:text-white">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Drawer (Collapsible) */}
        {isFilterOpen && (
          <div className="w-[340px] shrink-0 bg-[#0f172a] rounded-2xl border border-indigo-500/30 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col h-[calc(100vh-140px)] sticky top-6 animate-in slide-in-from-right-12 duration-300 backdrop-blur-xl">
            <div className="p-5 border-b border-indigo-900/50 flex items-center justify-between bg-gradient-to-r from-indigo-900/40 to-transparent rounded-t-2xl">
              <h3 className="font-bold text-white flex items-center gap-2.5">
                <div className="p-1.5 bg-indigo-500/20 rounded-md text-indigo-400">
                  <Filter className="w-4 h-4" />
                </div>
                Advanced Filters
              </h3>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors" onClick={() => setIsFilterOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto space-y-8 custom-scrollbar">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Date Range</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-slate-400">From</span>
                    <Input type="date" className="h-10 text-sm bg-black/30 border-indigo-800/50 text-white focus-visible:ring-indigo-500 focus-visible:border-indigo-500" defaultValue="2026-02-01" style={{ colorScheme: 'dark' }} />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-slate-400">To</span>
                    <Input type="date" className="h-10 text-sm bg-black/30 border-indigo-800/50 text-white focus-visible:ring-indigo-500 focus-visible:border-indigo-500" defaultValue="2026-02-28" style={{ colorScheme: 'dark' }} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-3">
                  <Badge variant="secondary" className="bg-indigo-500 text-white hover:bg-indigo-400 cursor-pointer shadow-[0_0_10px_rgba(99,102,241,0.3)]">Today</Badge>
                  <Badge variant="outline" className="text-slate-300 border-indigo-800/50 hover:bg-indigo-900/30 cursor-pointer">This Week</Badge>
                  <Badge variant="outline" className="text-slate-300 border-indigo-800/50 hover:bg-indigo-900/30 cursor-pointer">This Month</Badge>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Transaction Type</label>
                <Select defaultValue="all">
                  <SelectTrigger className="h-10 bg-black/30 border-indigo-800/50 text-white focus:ring-indigo-500">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f172a] border-indigo-800 text-white">
                    <SelectItem value="all" className="focus:bg-indigo-900/50 focus:text-white">All Transactions</SelectItem>
                    <SelectItem value="credit" className="focus:bg-indigo-900/50 focus:text-white">Credit (Income) Only</SelectItem>
                    <SelectItem value="debit" className="focus:bg-indigo-900/50 focus:text-white">Debit (Expense) Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Service Category</label>
                <Select defaultValue="all">
                  <SelectTrigger className="h-10 bg-black/30 border-indigo-800/50 text-white focus:ring-indigo-500">
                    <SelectValue placeholder="Any Service" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f172a] border-indigo-800 text-white">
                    <SelectItem value="all" className="focus:bg-indigo-900/50 focus:text-white">Any Service</SelectItem>
                    <SelectItem value="g2c" className="focus:bg-indigo-900/50 focus:text-white">G2C (Govt Services)</SelectItem>
                    <SelectItem value="b2c" className="focus:bg-indigo-900/50 focus:text-white">B2C (Business Services)</SelectItem>
                    <SelectItem value="financial" className="focus:bg-indigo-900/50 focus:text-white">Financial Services / Banking</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Amount Range (₹)</label>
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Min" type="number" className="h-10 text-sm bg-black/30 border-indigo-800/50 text-white placeholder:text-slate-500" />
                  <Input placeholder="Max" type="number" className="h-10 text-sm bg-black/30 border-indigo-800/50 text-white placeholder:text-slate-500" />
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-indigo-900/50 flex gap-3 bg-[#0a0f1c] rounded-b-2xl">
              <Button variant="outline" className="flex-1 bg-transparent border-indigo-800/50 text-slate-300 hover:bg-white/5 hover:text-white">Reset</Button>
              <Button className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] border-none">Apply</Button>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}

