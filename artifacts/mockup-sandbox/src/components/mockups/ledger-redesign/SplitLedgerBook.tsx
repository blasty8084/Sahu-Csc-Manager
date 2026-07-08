import React, { useState } from 'react';
import './_group.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BookOpen, 
  Search, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  FileDown, 
  Eye, 
  Receipt,
  FileText
} from 'lucide-react';

type Transaction = {
  id: string;
  receiptNo: string;
  date: string;
  customerName: string;
  serviceType: string;
  credit: number | null;
  debit: number | null;
  balance: number;
  note: string;
};

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', receiptNo: 'CSC-2026-0001', date: '2026-10-14', customerName: 'Ramesh Kumar', serviceType: 'Income Certificate', credit: 150, debit: null, balance: 40150, note: 'Urgent processing' },
  { id: '2', receiptNo: 'CSC-2026-0002', date: '2026-10-14', customerName: 'CSC Wallet', serviceType: 'Wallet Topup', credit: null, debit: 5000, balance: 35150, note: 'SBI Netbanking' },
  { id: '3', receiptNo: 'CSC-2026-0003', date: '2026-10-15', customerName: 'Sunita Devi', serviceType: 'Voter ID', credit: 50, debit: null, balance: 35200, note: 'Correction' },
  { id: '4', receiptNo: 'CSC-2026-0004', date: '2026-10-15', customerName: 'Abdul Rahman', serviceType: 'PAN Card', credit: 200, debit: null, balance: 35400, note: 'New application' },
  { id: '5', receiptNo: 'CSC-2026-0005', date: '2026-10-16', customerName: 'Office Expenses', serviceType: 'Electricity Bill', credit: null, debit: 1200, balance: 34200, note: 'October bill' },
  { id: '6', receiptNo: 'CSC-2026-0006', date: '2026-10-16', customerName: 'Priya Nair', serviceType: 'Aadhaar Update', credit: 100, debit: null, balance: 34300, note: 'Biometric update' },
  { id: '7', receiptNo: 'CSC-2026-0007', date: '2026-10-17', customerName: 'Kishan Lal', serviceType: 'Ration Card', credit: 80, debit: null, balance: 34380, note: 'Name addition' },
  { id: '8', receiptNo: 'CSC-2026-0008', date: '2026-10-17', customerName: 'AePS Withdrawal', serviceType: 'AePS Cash', credit: null, debit: 2500, balance: 31880, note: 'Cash dispensed' },
  { id: '9', receiptNo: 'CSC-2026-0009', date: '2026-10-17', customerName: 'Suresh Raina', serviceType: 'Passport Seva', credit: 500, debit: null, balance: 32380, note: 'Fresh passport' },
  { id: '10', receiptNo: 'CSC-2026-0010', date: '2026-10-18', customerName: 'Anita Desai', serviceType: 'PM Kisan', credit: 50, debit: null, balance: 32430, note: 'KYC Update' },
];

export function SplitLedgerBook() {
  const [activeTab, setActiveTab] = useState('ledger');
  const [entryType, setEntryType] = useState<'credit' | 'debit'>('credit');

  const credits = MOCK_TRANSACTIONS.filter(t => t.credit !== null);
  const debits = MOCK_TRANSACTIONS.filter(t => t.debit !== null);

  const totalCredits = credits.reduce((sum, t) => sum + (t.credit || 0), 0);
  const totalDebits = debits.reduce((sum, t) => sum + (t.debit || 0), 0);
  const currentBalance = 32430;

  return (
    <div className="flex h-screen bg-[#11131a] overflow-hidden text-slate-800 font-serif">
      {/* LEFT SIDEBAR - The Dark Book Cover Binding */}
      <div className="w-[340px] bg-[#1a1f2e] border-r border-[#0f1422] flex flex-col z-10 shadow-[4px_0_15px_-3px_rgba(0,0,0,0.5)] shrink-0 text-slate-200">
        <div className="p-7 border-b border-slate-700/50 bg-[#141926]">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3 text-white">
            <BookOpen className="text-[#a1a1aa] h-7 w-7" />
            Ledger Book
          </h1>
          <p className="text-xs text-slate-400 mt-2 tracking-widest uppercase">Digital Accounting</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-700/30">
            <TabsList className="grid w-full grid-cols-2 bg-[#252b3d] p-1.5 rounded-lg border border-slate-700/50">
              <TabsTrigger value="ledger" className="text-xs font-semibold data-[state=active]:bg-[#1a1f2e] data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm rounded-md py-2">Book View</TabsTrigger>
              <TabsTrigger value="receipts" className="text-xs font-semibold data-[state=active]:bg-[#1a1f2e] data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md py-2">Receipts</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 px-6">
            <TabsContent value="ledger" className="m-0 mt-4 space-y-8 font-sans">
              {/* New Entry Form */}
              <div className="space-y-5">
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-700/50 pb-2">Record New Entry</h2>
                <div className="flex bg-[#252b3d] p-1.5 rounded-lg border border-slate-700/50">
                  <button 
                    onClick={() => setEntryType('credit')}
                    className={`flex-1 text-xs py-2.5 rounded-md font-bold transition-all uppercase tracking-wider ${
                      entryType === 'credit' ? 'bg-[#065f46] shadow-sm text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Credit (In)
                  </button>
                  <button 
                    onClick={() => setEntryType('debit')}
                    className={`flex-1 text-xs py-2.5 rounded-md font-bold transition-all uppercase tracking-wider ${
                      entryType === 'debit' ? 'bg-[#991b1b] shadow-sm text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Debit (Out)
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 mb-1.5 block uppercase tracking-wider">Party Name</label>
                    <Input placeholder="e.g. Ramesh Kumar" className="h-10 text-sm bg-[#141926] border-slate-700/50 text-white placeholder:text-slate-600 focus-visible:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 mb-1.5 block uppercase tracking-wider">Particulars / Service</label>
                    <Select>
                      <SelectTrigger className="h-10 text-sm bg-[#141926] border-slate-700/50 text-white focus:ring-emerald-500">
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1f2e] border-slate-700 text-white">
                        <SelectItem value="income">Income Certificate</SelectItem>
                        <SelectItem value="voter">Voter ID</SelectItem>
                        <SelectItem value="pan">PAN Card</SelectItem>
                        <SelectItem value="aeps">AePS Withdrawal</SelectItem>
                        <SelectItem value="expense">Office Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 mb-1.5 block uppercase tracking-wider">Amount (₹)</label>
                    <Input type="number" placeholder="0.00" className="h-10 text-sm bg-[#141926] border-slate-700/50 text-white placeholder:text-slate-600 focus-visible:ring-emerald-500 font-mono" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 mb-1.5 block uppercase tracking-wider">Notes (Optional)</label>
                    <Input placeholder="Brief description" className="h-10 text-sm bg-[#141926] border-slate-700/50 text-white placeholder:text-slate-600 focus-visible:ring-emerald-500" />
                  </div>
                  <Button className={`w-full h-11 text-white font-bold tracking-wide uppercase text-xs ${entryType === 'credit' ? 'bg-[#10b981] hover:bg-[#059669] text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-[#ef4444] hover:bg-[#dc2626] text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]'}`}>
                    Post {entryType === 'credit' ? 'Credit' : 'Debit'} to Ledger
                  </Button>
                </div>
              </div>

              <div className="pt-6">
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-700/50 pb-2 mb-4">Search Ledger</h2>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input placeholder="Search records..." className="h-10 pl-9 text-sm bg-[#141926] border-slate-700/50 text-white placeholder:text-slate-600" />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="receipts" className="m-0 mt-4 space-y-6 font-sans">
              <div className="space-y-4">
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-700/50 pb-2">Find Receipt</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input placeholder="Search receipt number..." className="h-10 pl-9 text-sm bg-[#141926] border-slate-700/50 text-white placeholder:text-slate-600" />
                </div>
              </div>
              <div className="text-center p-8 border-2 border-dashed border-slate-700/50 rounded-lg bg-[#141926]">
                <Receipt className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400 font-medium">Use the main panel to view all generated receipts.</p>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>

      {/* MAIN CONTENT AREA - The Open Book */}
      <div className="flex-1 flex overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-[#0d1117] p-4 lg:p-8 xl:p-12 relative items-center justify-center">
        
        {activeTab === 'ledger' && (
          <div className="w-full h-full max-w-[1600px] flex rounded-md overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05)] bg-[#fefce8] relative isolate">
            
            {/* The Spine of the Book */}
            <div className="absolute left-1/2 top-0 bottom-0 w-10 -ml-5 bg-gradient-to-r from-[#0d131f] via-[#1a1f2e] to-[#0d131f] z-30 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] border-x border-[#000000] flex flex-col justify-between py-12 items-center">
              {/* Spine stitching */}
              {[...Array(20)].map((_, i) => (
                <div key={i} className="w-4 h-0.5 bg-slate-400/30 rounded-full shadow-[0_1px_0_rgba(255,255,255,0.1)]"></div>
              ))}
            </div>
            
            {/* Left Page Shadow/Gradient */}
            <div className="absolute left-1/2 top-0 bottom-0 w-24 -ml-24 bg-gradient-to-l from-black/20 to-transparent z-20 pointer-events-none mix-blend-multiply"></div>
            {/* Right Page Shadow/Gradient */}
            <div className="absolute left-1/2 top-0 bottom-0 w-24 ml-5 bg-gradient-to-r from-black/20 to-transparent z-20 pointer-events-none mix-blend-multiply"></div>

            {/* Left Page (Credits) */}
            <div className="flex-1 flex flex-col h-full bg-[#fefce8] bg-[url('https://www.transparenttextures.com/patterns/beige-paper.png')] overflow-hidden border-r border-[#d1c29e]">
              <div className="bg-[#065f46] text-white p-5 lg:p-7 flex justify-between items-center shadow-md relative z-10">
                <div>
                  <h3 className="font-serif text-2xl font-bold tracking-wide flex items-center gap-3">
                    <TrendingUp className="h-6 w-6 text-emerald-300" />
                    CREDITS (INCOME)
                  </h3>
                  <p className="text-emerald-200 text-xs tracking-widest uppercase mt-1">Receipts & Inwards</p>
                </div>
                <div className="bg-[#044e3a] border border-[#065f46] shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] px-4 py-2 rounded-md">
                  <span className="text-emerald-300 text-xs font-bold uppercase tracking-widest block mb-0.5">Subtotal</span>
                  <span className="font-mono text-xl font-bold tracking-tight text-white">₹{totalCredits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <Table className="w-full">
                  <TableHeader className="bg-[#f5f1da] sticky top-0 z-10 shadow-sm">
                    <TableRow className="border-b-2 border-[#bfae8b] hover:bg-transparent">
                      <TableHead className="w-[110px] text-xs uppercase tracking-widest text-[#5c4a3d] font-bold pl-8 border-r border-[#d4c8b2]">Date</TableHead>
                      <TableHead className="text-xs uppercase tracking-widest text-[#5c4a3d] font-bold px-6 border-r border-[#d4c8b2]">Particulars</TableHead>
                      <TableHead className="text-xs uppercase tracking-widest text-[#5c4a3d] font-bold px-4 hidden sm:table-cell border-r border-[#d4c8b2]">Ref No.</TableHead>
                      <TableHead className="text-right text-xs uppercase tracking-widest text-[#5c4a3d] font-bold pr-8">Amount (₹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="font-serif">
                    {credits.map((t) => (
                      <TableRow key={t.id} className="border-b border-[#e1d5ba] hover:bg-[#f5eed9] transition-colors group">
                        <TableCell className="text-sm text-[#4a3f35] pl-8 whitespace-nowrap border-r border-[#e1d5ba]/50 py-4 font-mono">{t.date}</TableCell>
                        <TableCell className="px-6 border-r border-[#e1d5ba]/50 py-4">
                          <div className="flex flex-col">
                            <span className="text-[15px] font-semibold text-[#2c241b]">{t.customerName}</span>
                            <span className="text-sm text-[#5c4a3d] italic mt-0.5">By: {t.serviceType}</span>
                            {t.note && <span className="text-xs text-[#8c7a6b] mt-1 font-sans uppercase tracking-wider">{t.note}</span>}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-[#6e5d4d] font-mono hidden sm:table-cell border-r border-[#e1d5ba]/50 px-4 py-4">{t.receiptNo}</TableCell>
                        <TableCell className="text-right text-lg font-bold text-[#065f46] pr-8 py-4 font-mono tracking-tight">
                          {t.credit?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Empty ruled lines for the rest of the page */}
                    {Array.from({ length: 15 }).map((_, i) => (
                      <TableRow key={`empty-cr-${i}`} className="border-b border-[#e1d5ba] h-[72px] hover:bg-transparent">
                        <TableCell className="border-r border-[#e1d5ba]/50"></TableCell>
                        <TableCell className="border-r border-[#e1d5ba]/50"></TableCell>
                        <TableCell className="border-r border-[#e1d5ba]/50 hidden sm:table-cell"></TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Right Page (Debits) */}
            <div className="flex-1 flex flex-col h-full bg-[#fefce8] bg-[url('https://www.transparenttextures.com/patterns/beige-paper.png')] overflow-hidden pl-5">
              <div className="bg-[#991b1b] text-white p-5 lg:p-7 flex justify-between items-center shadow-md relative z-10">
                <div>
                  <h3 className="font-serif text-2xl font-bold tracking-wide flex items-center gap-3">
                    <TrendingDown className="h-6 w-6 text-rose-300" />
                    DEBITS (EXPENSES)
                  </h3>
                  <p className="text-rose-200 text-xs tracking-widest uppercase mt-1">Payments & Outwards</p>
                </div>
                <div className="bg-[#7f1d1d] border border-[#991b1b] shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] px-4 py-2 rounded-md">
                  <span className="text-rose-300 text-xs font-bold uppercase tracking-widest block mb-0.5">Subtotal</span>
                  <span className="font-mono text-xl font-bold tracking-tight text-white">₹{totalDebits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <Table className="w-full">
                  <TableHeader className="bg-[#f5f1da] sticky top-0 z-10 shadow-sm">
                    <TableRow className="border-b-2 border-[#bfae8b] hover:bg-transparent">
                      <TableHead className="w-[110px] text-xs uppercase tracking-widest text-[#5c4a3d] font-bold pl-8 border-r border-[#d4c8b2]">Date</TableHead>
                      <TableHead className="text-xs uppercase tracking-widest text-[#5c4a3d] font-bold px-6 border-r border-[#d4c8b2]">Particulars</TableHead>
                      <TableHead className="text-xs uppercase tracking-widest text-[#5c4a3d] font-bold px-4 hidden sm:table-cell border-r border-[#d4c8b2]">Ref No.</TableHead>
                      <TableHead className="text-right text-xs uppercase tracking-widest text-[#5c4a3d] font-bold pr-8">Amount (₹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="font-serif">
                    {debits.map((t) => (
                      <TableRow key={t.id} className="border-b border-[#e1d5ba] hover:bg-[#f5eed9] transition-colors group">
                        <TableCell className="text-sm text-[#4a3f35] pl-8 whitespace-nowrap border-r border-[#e1d5ba]/50 py-4 font-mono">{t.date}</TableCell>
                        <TableCell className="px-6 border-r border-[#e1d5ba]/50 py-4">
                          <div className="flex flex-col">
                            <span className="text-[15px] font-semibold text-[#2c241b]">{t.customerName}</span>
                            <span className="text-sm text-[#5c4a3d] italic mt-0.5">To: {t.serviceType}</span>
                            {t.note && <span className="text-xs text-[#8c7a6b] mt-1 font-sans uppercase tracking-wider">{t.note}</span>}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-[#6e5d4d] font-mono hidden sm:table-cell border-r border-[#e1d5ba]/50 px-4 py-4">{t.receiptNo}</TableCell>
                        <TableCell className="text-right text-lg font-bold text-[#991b1b] pr-8 py-4 font-mono tracking-tight">
                          {t.debit?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Empty ruled lines for the rest of the page */}
                    {Array.from({ length: 15 }).map((_, i) => (
                      <TableRow key={`empty-dr-${i}`} className="border-b border-[#e1d5ba] h-[72px] hover:bg-transparent">
                        <TableCell className="border-r border-[#e1d5ba]/50"></TableCell>
                        <TableCell className="border-r border-[#e1d5ba]/50"></TableCell>
                        <TableCell className="border-r border-[#e1d5ba]/50 hidden sm:table-cell"></TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            
          </div>
        )}

        {activeTab === 'receipts' && (
          <div className="w-full h-full max-w-[1200px] bg-white shadow-2xl rounded-xl p-8 lg:p-12 font-sans flex flex-col">
            <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-6">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Receipt Archive</h2>
                <p className="text-slate-500 text-sm mt-2 font-medium">Digital copies of all generated transaction receipts.</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="border-slate-300 text-slate-700 shadow-sm"><Download className="h-4 w-4 mr-2"/> Export Data</Button>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm flex-1 bg-slate-50 flex flex-col">
              <Table>
                <TableHeader className="bg-slate-100 border-b border-slate-200">
                  <TableRow>
                    <TableHead className="font-semibold text-slate-700">Receipt No.</TableHead>
                    <TableHead className="font-semibold text-slate-700">Date</TableHead>
                    <TableHead className="font-semibold text-slate-700">Customer</TableHead>
                    <TableHead className="font-semibold text-slate-700">Service</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700">Amount</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white">
                  {MOCK_TRANSACTIONS.map((t) => (
                    <TableRow key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="font-mono text-xs text-slate-500">{t.receiptNo}</TableCell>
                      <TableCell className="text-sm text-slate-600">{t.date}</TableCell>
                      <TableCell className="font-medium text-slate-900">{t.customerName}</TableCell>
                      <TableCell className="text-sm text-slate-600">
                        <Badge variant="secondary" className="font-medium bg-slate-100 text-slate-700 border border-slate-200">{t.serviceType}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold font-mono">
                        {t.credit ? (
                          <span className="text-emerald-700">+ ₹{t.credit.toFixed(2)}</span>
                        ) : (
                          <span className="text-rose-700">- ₹{t.debit?.toFixed(2)}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
      
      {/* RIGHT RAIL - RUNNING BALANCE (Financial Terminal Style) */}
      <div className="w-[340px] bg-[#0d131f] text-slate-100 p-7 flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.5)] z-20 shrink-0 font-sans border-l border-[#1a2333]">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2 border-b border-[#1a2333] pb-4">
          <TrendingUp className="h-4 w-4 text-emerald-500" />
          Financial Summary
        </h3>
        
        <div className="space-y-6 flex-1">
          <div className="bg-[#141d2b] rounded-xl p-6 border border-[#1e293b] shadow-inner relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-2xl rounded-full"></div>
            
            <p className="text-slate-400 text-xs mb-3 font-semibold uppercase tracking-wider">Net Balance</p>
            <div className="text-[2.5rem] font-bold tracking-tighter text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.4)] font-mono leading-none">
              <span className="text-2xl text-emerald-500/50 mr-1">₹</span>
              {currentBalance.toLocaleString('en-IN')}
              <span className="text-xl text-emerald-500/50 ml-1">.00</span>
            </div>
            <div className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-2.5 py-1.5 rounded border border-emerald-400/20">
              <TrendingUp className="h-3.5 w-3.5" />
              In Surplus
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#141d2b] rounded-xl p-4 border border-[#1e293b]">
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <TrendingUp className="h-4 w-4" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total In</p>
              </div>
              <p className="font-mono text-lg font-bold text-white tracking-tight">₹{totalCredits.toLocaleString('en-IN')}</p>
            </div>
            
            <div className="bg-[#141d2b] rounded-xl p-4 border border-[#1e293b]">
              <div className="flex items-center gap-2 text-rose-400 mb-2">
                <TrendingDown className="h-4 w-4" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Out</p>
              </div>
              <p className="font-mono text-lg font-bold text-white tracking-tight">₹{totalDebits.toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div className="bg-[#1a2333]/50 rounded-xl p-5 border border-[#1e293b]">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-300 mb-2 border-b border-[#2a3649] pb-2">Fiscal Period</h4>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-slate-400">Current Month</span>
              <span className="text-sm font-semibold text-white">October 2026</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-slate-400">Total Entries</span>
              <span className="text-sm font-semibold text-white">10 Records</span>
            </div>
          </div>
        </div>
        
        <div className="mt-8 space-y-3">
          <Button className="w-full h-11 bg-[#1e293b] hover:bg-[#334155] text-white font-bold tracking-wide uppercase text-[11px] border border-[#334155]">
            Run EOD Reconciliation
          </Button>
          <div className="pt-4 border-t border-[#1a2333] text-[10px] uppercase tracking-widest font-bold text-slate-500 flex justify-between items-center">
            <span>System Online</span>
            <span className="flex items-center gap-1.5 text-emerald-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Sync Active
            </span>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f5f1da;
          border-left: 1px solid #e1d5ba;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #d4c8b2;
          border-radius: 4px;
        }
      `}} />
    </div>
  );
}
