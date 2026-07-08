import React, { useState } from 'react';
import { 
  Wallet, TrendingUp, TrendingDown, IndianRupee, Search, 
  Filter, Download, Plus, Edit2, Trash2, Receipt, Search as SearchIcon 
} from 'lucide-react';
import './_group.css';

// Mock Data
const MOCK_TRANSACTIONS = [
  { id: '1', date: '2023-11-20 09:30 AM', receipt: 'CSC-2026-0001', customer: 'Ramesh Kumar', service: 'Income Certificate', type: 'Credit', amount: 150, status: 'Completed' },
  { id: '2', date: '2023-11-20 10:15 AM', receipt: 'CSC-2026-0002', customer: 'Sunita Devi', service: 'AePS Cash Withdrawal', type: 'Debit', amount: 500, status: 'Completed' },
  { id: '3', date: '2023-11-20 11:00 AM', receipt: 'CSC-2026-0003', customer: 'Abdul Rahman', service: 'Voter ID', type: 'Credit', amount: 50, status: 'Completed' },
  { id: '4', date: '2023-11-20 12:30 PM', receipt: 'CSC-2026-0004', customer: 'Priya Nair', service: 'PAN Card', type: 'Credit', amount: 200, status: 'Completed' },
  { id: '5', date: '2023-11-20 01:45 PM', receipt: 'CSC-2026-0005', customer: 'Vikram Singh', service: 'Electricity Bill', type: 'Debit', amount: 1250, status: 'Completed' },
  { id: '6', date: '2023-11-20 02:20 PM', receipt: 'CSC-2026-0006', customer: 'Meena Kumari', service: 'Ration Card', type: 'Credit', amount: 100, status: 'Pending' },
  { id: '7', date: '2023-11-20 03:10 PM', receipt: 'CSC-2026-0007', customer: 'Rajesh Sharma', service: 'Passport Seva', type: 'Credit', amount: 300, status: 'Completed' },
  { id: '8', date: '2023-11-20 04:05 PM', receipt: 'CSC-2026-0008', customer: 'Anita Desai', service: 'Aadhaar Update', type: 'Credit', amount: 50, status: 'Completed' },
  { id: '9', date: '2023-11-21 09:15 AM', receipt: 'CSC-2026-0009', customer: 'Kishan Lal', service: 'Income Certificate', type: 'Credit', amount: 150, status: 'Completed' },
  { id: '10', date: '2023-11-21 10:30 AM', receipt: 'CSC-2026-0010', customer: 'Amit Singh', service: 'Electricity Bill', type: 'Debit', amount: 840, status: 'Completed' },
];

export function MidnightFinance() {
  const [entryType, setEntryType] = useState<'Credit' | 'Debit'>('Credit');
  const [searchQuery, setSearchQuery] = useState('');

  // Styles
  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  };

  const glassInputStyle = {
    background: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#fff',
  };

  const emeraldGlow = {
    boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)'
  };
  
  const roseGlow = {
    boxShadow: '0 0 20px rgba(244, 63, 94, 0.2)'
  };

  return (
    <div 
      className="min-h-screen w-full flex overflow-hidden text-slate-300 font-sans"
      style={{ 
        background: 'linear-gradient(135deg, #0a0f1e 0%, #0b2c60 100%)',
      }}
    >
      {/* LEFT PANEL */}
      <div 
        className="w-[300px] flex-shrink-0 flex flex-col p-6 overflow-y-auto border-r border-white/5 shadow-2xl relative z-10"
        style={glassStyle}
      >
        <div className="flex items-center gap-3 mb-10">
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-pulse blur-[2px]" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Midnight<span className="text-cyan-400 font-light">Ledger</span></h1>
        </div>

        <div className="mb-8">
          <p className="text-sm font-medium text-slate-400 mb-1 tracking-wider uppercase">Running Balance</p>
          <div className="flex items-baseline gap-1">
            <IndianRupee className="w-6 h-6 text-cyan-400" />
            <h2 className="text-4xl font-extrabold text-white tracking-tight">32,430</h2>
          </div>
          
          <div className="mt-4 h-8 flex items-end gap-1" style={{ opacity: 0.8 }}>
            {[20, 35, 25, 45, 60, 40, 70, 50, 80, 95].map((val, i) => (
              <div 
                key={i} 
                className="flex-1 bg-gradient-to-t from-cyan-600/20 to-cyan-400 rounded-t-sm"
                style={{ height: `${val}%` }}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-10">
          <div className="p-3 rounded-2xl flex flex-col" style={glassStyle}>
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-xs text-slate-400 mb-0.5">Total In</p>
            <p className="text-sm font-bold text-white">₹ 45,200</p>
          </div>
          <div className="p-3 rounded-2xl flex flex-col" style={glassStyle}>
            <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center mb-2">
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <p className="text-xs text-slate-400 mb-0.5">Total Out</p>
            <p className="text-sm font-bold text-white">₹ 12,770</p>
          </div>
        </div>

        <div className="mt-auto">
          <div className="p-5 rounded-2xl relative overflow-hidden" style={glassStyle}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            
            <h3 className="text-sm font-bold text-white mb-4">New Entry</h3>
            
            <div className="flex p-1 bg-black/40 rounded-lg mb-4 backdrop-blur-md">
              <button
                onClick={() => setEntryType('Credit')}
                className={`flex-1 text-xs font-semibold py-1.5 rounded-md transition-all ${
                  entryType === 'Credit' 
                    ? 'bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Credit IN
              </button>
              <button
                onClick={() => setEntryType('Debit')}
                className={`flex-1 text-xs font-semibold py-1.5 rounded-md transition-all ${
                  entryType === 'Debit' 
                    ? 'bg-rose-500/20 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.2)]' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Debit OUT
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1 ml-1">Amount</label>
                <div className="relative">
                  <IndianRupee className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="0.00" 
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
                    style={glassInputStyle}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1 ml-1">Particulars</label>
                <input 
                  type="text" 
                  placeholder="Service / Customer" 
                  className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
                  style={glassInputStyle}
                />
              </div>
              
              <button 
                className="w-full mt-2 py-2.5 rounded-lg text-sm font-bold text-white shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
                style={{ 
                  background: 'linear-gradient(90deg, #f97316 0%, #f59e0b 100%)',
                  boxShadow: '0 4px 15px rgba(249, 115, 22, 0.3)' 
                }}
              >
                <Plus className="w-4 h-4" />
                Add Transaction
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col min-w-0 p-8 relative z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-900/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Header/Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 z-10">
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search receipts, customers, or services..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all placeholder-slate-500"
              style={glassStyle}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-white/5 transition-colors" style={glassStyle}>
              <Filter className="w-4 h-4 text-cyan-400" />
              Filter
            </button>
            <button className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-white/5 transition-colors" style={glassStyle}>
              <Download className="w-4 h-4 text-cyan-400" />
              Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 rounded-2xl overflow-hidden flex flex-col z-10" style={glassStyle}>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-black/20 text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  <th className="py-4 px-6">Receipt / Date</th>
                  <th className="py-4 px-6">Customer Details</th>
                  <th className="py-4 px-6">Service</th>
                  <th className="py-4 px-6 text-right">Amount</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {MOCK_TRANSACTIONS.map((tx) => (
                  <tr 
                    key={tx.id} 
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <div className="font-mono text-xs text-cyan-300 mb-1">{tx.receipt}</div>
                      <div className="text-xs text-slate-500">{tx.date}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-slate-200">{tx.customer}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
                          <Receipt className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                        <span className="text-sm text-slate-300">{tx.service}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className={`text-sm font-bold flex items-center justify-end gap-1 ${
                        tx.type === 'Credit' ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {tx.type === 'Credit' ? '+' : '-'}
                        <IndianRupee className="w-3.5 h-3.5" />
                        {tx.amount.toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          tx.status === 'Completed' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {tx.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-cyan-400 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-rose-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-white/5 bg-black/20 flex items-center justify-between">
            <span className="text-xs text-slate-500">Showing 1-10 of 248 entries</span>
            <div className="flex gap-1">
              {[1, 2, 3, '...', 25].map((page, i) => (
                <button 
                  key={i}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                    page === 1 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL (Mini) */}
      <div className="w-[240px] flex-shrink-0 p-6 border-l border-white/5 flex flex-col gap-6 relative z-10" style={glassStyle}>
        
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Today's Pulse</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Total Entries</span>
              <span className="text-lg font-bold text-white">42</span>
            </div>
            
            <div className="w-full h-px bg-white/5" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Cash In</span>
              <span className="text-sm font-bold text-emerald-400 flex items-center">
                <IndianRupee className="w-3 h-3 mr-0.5" /> 8,450
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Cash Out</span>
              <span className="text-sm font-bold text-rose-400 flex items-center">
                <IndianRupee className="w-3 h-3 mr-0.5" /> 2,100
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 mt-4">Top Services</h3>
          <div className="space-y-3">
            {[
              { name: 'Income Certificate', count: 18, color: 'bg-cyan-500' },
              { name: 'Electricity Bill', count: 12, color: 'bg-amber-500' },
              { name: 'AePS Cash', count: 8, color: 'bg-purple-500' },
            ].map((srv, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">{srv.name}</span>
                  <span className="text-slate-500">{srv.count}</span>
                </div>
                <div className="h-1.5 w-full bg-black/30 rounded-full overflow-hidden">
                  <div className={`h-full ${srv.color} rounded-full`} style={{ width: `${(srv.count / 20) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto">
          <button className="w-full py-2.5 rounded-lg text-sm font-medium text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </div>
    </div>
  );
}
