import React, { useState } from 'react';
import './_group.css';
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  MoreHorizontal, 
  Eye, 
  FileText,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Wallet
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

// Mock Data
type Transaction = {
  id: string;
  receiptNo: string;
  date: string;
  customerName: string;
  serviceType: string;
  credit: number;
  debit: number;
  balance: number;
  note: string;
};

const MOCK_DATA: Transaction[] = [
  { id: '1', receiptNo: 'CSC-2026-0012', date: '2026-10-24T15:45:00Z', customerName: 'Priya Nair', serviceType: 'AePS Cash Withdrawal', credit: 0, debit: 2000, balance: 24500, note: 'SBI Account' },
  { id: '2', receiptNo: 'CSC-2026-0011', date: '2026-10-24T14:20:00Z', customerName: 'Abdul Rahman', serviceType: 'PAN Card', credit: 250, debit: 0, balance: 26500, note: 'New Application' },
  { id: '3', receiptNo: 'CSC-2026-0010', date: '2026-10-24T11:15:00Z', customerName: 'Sunita Devi', serviceType: 'Ration Card', credit: 150, debit: 0, balance: 26250, note: 'Name Addition' },
  { id: '4', receiptNo: 'CSC-2026-0009', date: '2026-10-24T10:30:00Z', customerName: 'Ramesh Kumar', serviceType: 'Income Certificate', credit: 100, debit: 0, balance: 26100, note: 'Urgent' },
  { id: '5', receiptNo: 'CSC-2026-0008', date: '2026-10-23T16:00:00Z', customerName: 'Vikram Singh', serviceType: 'Electricity Bill', credit: 0, debit: 1450, balance: 26000, note: 'Consumer No: 123456789' },
  { id: '6', receiptNo: 'CSC-2026-0007', date: '2026-10-23T12:45:00Z', customerName: 'Meena Kumari', serviceType: 'Aadhaar Update', credit: 50, debit: 0, balance: 27450, note: 'Mobile Number Update' },
  { id: '7', receiptNo: 'CSC-2026-0006', date: '2026-10-23T09:30:00Z', customerName: 'Rajesh Sharma', serviceType: 'Voter ID', credit: 80, debit: 0, balance: 27400, note: 'Address Change' },
  { id: '8', receiptNo: 'CSC-2026-0005', date: '2026-10-22T15:20:00Z', customerName: 'Anita Desai', serviceType: 'Passport Seva', credit: 1500, debit: 0, balance: 27320, note: 'Fresh Passport Fee' },
  { id: '9', receiptNo: 'CSC-2026-0004', date: '2026-10-22T11:10:00Z', customerName: 'Suresh Patil', serviceType: 'AePS Cash Deposit', credit: 5000, debit: 0, balance: 25820, note: 'HDFC Account' },
  { id: '10', receiptNo: 'CSC-2026-0003', date: '2026-10-21T14:00:00Z', customerName: 'Kavita Joshi', serviceType: 'Ayushman Card', credit: 50, debit: 0, balance: 20820, note: 'Family Registration' },
  { id: '11', receiptNo: 'CSC-2026-0002', date: '2026-10-21T10:00:00Z', customerName: 'Mohammad Ali', serviceType: 'Driving License', credit: 800, debit: 0, balance: 20770, note: 'Learner License' },
  { id: '12', receiptNo: 'CSC-2026-0001', date: '2026-10-20T09:15:00Z', customerName: 'Deepa Verma', serviceType: 'PM Kisan Samman Nidhi', credit: 100, debit: 0, balance: 19970, note: 'KYC Update' },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

export function ToolbarDriven() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddEntryOpen, setIsAddEntryOpen] = useState(false);
  const [entryType, setEntryType] = useState('credit');
  
  // Basic filtering for demo
  const filteredData = MOCK_DATA.filter(t => 
    t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.serviceType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#0b2c60] text-slate-200 font-sans selection:bg-[#f97316]/30">
      
      {/* Top Application Header / Navigation */}
      <header className="flex items-center h-16 px-6 border-b border-[#1e4a91] bg-[#0b2c60] shrink-0 shadow-sm relative z-20">
        <div className="flex items-center gap-3 text-white font-bold text-lg">
          <div className="w-9 h-9 rounded bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white flex items-center justify-center text-sm shadow-[0_0_15px_rgba(249,115,22,0.4)]">
            CSC
          </div>
          <span className="tracking-tight">Digital Seva Hub</span>
        </div>
        <nav className="ml-12 flex gap-8 text-sm font-medium text-slate-400 h-full">
          <a href="#" className="flex items-center hover:text-white transition-colors">Dashboard</a>
          <a href="#" className="flex items-center text-white border-b-2 border-[#f97316] transition-colors relative top-[1px]">Ledger</a>
          <a href="#" className="flex items-center hover:text-white transition-colors">Services</a>
          <a href="#" className="flex items-center hover:text-white transition-colors">Reports</a>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-[#1e4a91] rounded-full">
            <FileText className="w-5 h-5" />
          </Button>
          <div className="w-9 h-9 rounded-full bg-[#0f3575] flex items-center justify-center text-white font-bold text-xs border border-[#1e4a91] shadow-inner cursor-pointer hover:border-slate-400 transition-colors">
            JD
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col max-w-[1600px] w-full mx-auto p-6 gap-5">
        
        {/* Compact Summary Strip */}
        <div className="flex flex-wrap md:flex-nowrap items-center gap-6 p-5 bg-[#0f3575] border border-[#1e4a91] rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          <div className="flex items-center gap-4 border-l-4 border-blue-400 pl-4 py-1">
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg shadow-inner">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Balance</p>
              <p className="text-3xl font-black text-white tracking-tight">{formatCurrency(24500)}</p>
            </div>
          </div>
          
          <div className="hidden md:block w-px h-12 bg-[#1e4a91] mx-4"></div>
          
          <div className="flex items-center gap-4 border-l-4 border-[#10b981] pl-4 py-1 relative">
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#10b981]/10 to-transparent pointer-events-none"></div>
            <div className="p-3 bg-[#10b981]/20 text-[#10b981] rounded-lg shadow-inner relative z-10">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="relative z-10">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Today's Credits</p>
              <p className="text-2xl font-bold text-[#10b981] drop-shadow-[0_0_12px_rgba(16,185,129,0.5)] tracking-tight">+{formatCurrency(7800)}</p>
            </div>
          </div>

          <div className="hidden md:block w-px h-12 bg-[#1e4a91] mx-4"></div>

          <div className="flex items-center gap-4 border-l-4 border-[#dc2626] pl-4 py-1 relative">
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#dc2626]/10 to-transparent pointer-events-none"></div>
            <div className="p-3 bg-[#dc2626]/20 text-[#dc2626] rounded-lg shadow-inner relative z-10">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div className="relative z-10">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Today's Debits</p>
              <p className="text-2xl font-bold text-[#dc2626] drop-shadow-[0_0_12px_rgba(220,38,38,0.5)] tracking-tight">-{formatCurrency(3450)}</p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap md:flex-nowrap items-center justify-between p-3 bg-[#0f3575]/80 backdrop-blur-md border border-[#1e4a91] rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.1)] mt-1">
          <div className="flex items-center gap-3 pl-2 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search by customer, receipt, service..." 
                className="pl-10 bg-[#0b2c60] border-[#1e4a91] h-10 text-sm text-white placeholder:text-slate-500 focus-visible:ring-[#f97316] rounded-lg transition-shadow"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-10 border-[#1e4a91] bg-[#0b2c60] text-slate-300 hover:bg-[#1e4a91] hover:text-white rounded-lg transition-colors">
                  <Filter className="w-4 h-4 mr-2 text-slate-400" />
                  Filters
                  <Badge className="ml-2 bg-[#f97316] text-white hover:bg-[#ea580c] px-1.5 py-0 border-none">2</Badge>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-5 bg-[#0b2c60] border-[#1e4a91] text-white shadow-2xl rounded-xl" align="start">
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm text-white flex items-center">
                    <Filter className="w-4 h-4 mr-2 text-[#f97316]" />
                    Filter Transactions
                  </h4>
                  <div className="space-y-2.5">
                    <Label className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">Date Range</Label>
                    <Select defaultValue="7days">
                      <SelectTrigger className="h-10 text-sm bg-[#0f3575] border-[#1e4a91] text-white focus:ring-[#f97316]">
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0b2c60] border-[#1e4a91] text-white">
                        <SelectItem value="today" className="focus:bg-[#1e4a91] focus:text-white cursor-pointer">Today</SelectItem>
                        <SelectItem value="7days" className="focus:bg-[#1e4a91] focus:text-white cursor-pointer">Last 7 Days</SelectItem>
                        <SelectItem value="30days" className="focus:bg-[#1e4a91] focus:text-white cursor-pointer">Last 30 Days</SelectItem>
                        <SelectItem value="custom" className="focus:bg-[#1e4a91] focus:text-white cursor-pointer">Custom Range...</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2.5">
                    <Label className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">Transaction Type</Label>
                    <Select defaultValue="all">
                      <SelectTrigger className="h-10 text-sm bg-[#0f3575] border-[#1e4a91] text-white focus:ring-[#f97316]">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0b2c60] border-[#1e4a91] text-white">
                        <SelectItem value="all" className="focus:bg-[#1e4a91] focus:text-white cursor-pointer">All Transactions</SelectItem>
                        <SelectItem value="credit" className="focus:bg-[#1e4a91] focus:text-white cursor-pointer text-[#10b981]">Credits Only</SelectItem>
                        <SelectItem value="debit" className="focus:bg-[#1e4a91] focus:text-white cursor-pointer text-[#dc2626]">Debits Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2.5">
                    <Label className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">Service Type</Label>
                    <Select defaultValue="all">
                      <SelectTrigger className="h-10 text-sm bg-[#0f3575] border-[#1e4a91] text-white focus:ring-[#f97316]">
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0b2c60] border-[#1e4a91] text-white">
                        <SelectItem value="all" className="focus:bg-[#1e4a91] focus:text-white cursor-pointer">All Services</SelectItem>
                        <SelectItem value="aeps" className="focus:bg-[#1e4a91] focus:text-white cursor-pointer">AePS Transactions</SelectItem>
                        <SelectItem value="g2c" className="focus:bg-[#1e4a91] focus:text-white cursor-pointer">G2C Services</SelectItem>
                        <SelectItem value="b2c" className="focus:bg-[#1e4a91] focus:text-white cursor-pointer">B2C Services</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-[#1e4a91] mt-5">
                    <Button variant="ghost" size="sm" className="h-9 text-xs text-slate-300 hover:text-white hover:bg-[#1e4a91]">Reset</Button>
                    <Button size="sm" className="h-9 text-xs bg-[#f97316] hover:bg-[#ea580c] text-white px-5 border-none shadow-[0_0_10px_rgba(249,115,22,0.3)]">Apply Filters</Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-3 pr-2 w-full md:w-auto mt-3 md:mt-0 justify-end">
            <Button variant="outline" className="h-10 border-[#1e4a91] bg-[#0b2c60] text-slate-300 hover:bg-[#1e4a91] hover:text-white rounded-lg transition-colors">
              <Download className="w-4 h-4 mr-2 text-slate-400" />
              Export
            </Button>
            
            <Dialog open={isAddEntryOpen} onOpenChange={setIsAddEntryOpen}>
              <DialogTrigger asChild>
                <Button className="h-10 bg-gradient-to-r from-[#f97316] to-[#ea580c] hover:from-[#ea580c] hover:to-[#c2410c] text-white shadow-[0_0_15px_rgba(249,115,22,0.4)] rounded-lg font-bold px-6 border-none transition-all hover:scale-[1.02]">
                  <Plus className="w-5 h-5 mr-2" />
                  New Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px] bg-[#0b2c60] border-[#1e4a91] text-white shadow-2xl rounded-2xl p-0 overflow-hidden">
                <div className="px-6 py-4 border-b border-[#1e4a91] bg-[#0f3575]/50 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-[#f97316]/20 flex items-center justify-center mr-3">
                    <Plus className="w-4 h-4 text-[#f97316]" />
                  </div>
                  <DialogTitle className="text-xl font-bold text-white tracking-tight">Add Ledger Entry</DialogTitle>
                </div>
                
                <div className="px-6 py-6 space-y-6">
                  <div className="flex gap-3 bg-[#0f3575] p-1.5 rounded-xl border border-[#1e4a91]">
                    <Button 
                      type="button" 
                      variant="outline"
                      className={`flex-1 border-none h-11 text-sm font-bold transition-all rounded-lg ${entryType === 'credit' ? 'bg-[#10b981]/15 text-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:bg-[#10b981]/25 hover:text-[#10b981]' : 'bg-transparent text-slate-400 hover:bg-[#1e4a91]/50 hover:text-white'}`}
                      onClick={() => setEntryType('credit')}
                    >
                      Credit (Income)
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      className={`flex-1 border-none h-11 text-sm font-bold transition-all rounded-lg ${entryType === 'debit' ? 'bg-[#dc2626]/15 text-[#dc2626] shadow-[0_0_15px_rgba(220,38,38,0.15)] hover:bg-[#dc2626]/25 hover:text-[#dc2626]' : 'bg-transparent text-slate-400 hover:bg-[#1e4a91]/50 hover:text-white'}`}
                      onClick={() => setEntryType('debit')}
                    >
                      Debit (Expense)
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="date" className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">Date</Label>
                      <div className="relative">
                        <CalendarIcon className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <Input id="date" defaultValue="2026-10-24" type="date" className="pl-11 bg-[#0f3575] border-[#1e4a91] text-white focus-visible:ring-[#f97316] h-11 rounded-lg" style={{ colorScheme: 'dark' }} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold flex justify-between">
                        Amount (₹)
                        {entryType === 'credit' ? (
                          <span className="text-[#10b981]">Income</span>
                        ) : (
                          <span className="text-[#dc2626]">Expense</span>
                        )}
                      </Label>
                      <div className="relative">
                        <span className={`absolute left-4 top-2.5 font-bold text-lg ${entryType === 'credit' ? 'text-[#10b981]' : 'text-[#dc2626]'}`}>₹</span>
                        <Input id="amount" type="number" placeholder="0.00" className={`pl-8 font-mono bg-[#0f3575] border-[#1e4a91] text-white focus-visible:ring-[#f97316] h-11 text-lg rounded-lg font-bold shadow-inner ${entryType === 'credit' ? 'focus-visible:ring-[#10b981]' : 'focus-visible:ring-[#dc2626]'}`} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer" className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">Customer Name</Label>
                    <Input id="customer" placeholder="e.g. Ramesh Kumar" className="bg-[#0f3575] border-[#1e4a91] text-white focus-visible:ring-[#f97316] h-11 rounded-lg" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service" className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">Service Type</Label>
                    <Select>
                      <SelectTrigger className="bg-[#0f3575] border-[#1e4a91] text-white focus:ring-[#f97316] h-11 rounded-lg">
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0b2c60] border-[#1e4a91] text-white">
                        <SelectItem value="income_cert" className="focus:bg-[#1e4a91] focus:text-white cursor-pointer py-2">Income Certificate</SelectItem>
                        <SelectItem value="voter_id" className="focus:bg-[#1e4a91] focus:text-white cursor-pointer py-2">Voter ID</SelectItem>
                        <SelectItem value="ration_card" className="focus:bg-[#1e4a91] focus:text-white cursor-pointer py-2">Ration Card</SelectItem>
                        <SelectItem value="pan_card" className="focus:bg-[#1e4a91] focus:text-white cursor-pointer py-2">PAN Card</SelectItem>
                        <SelectItem value="aadhaar_update" className="focus:bg-[#1e4a91] focus:text-white cursor-pointer py-2">Aadhaar Update</SelectItem>
                        <SelectItem value="aeps_cash" className="focus:bg-[#1e4a91] focus:text-white cursor-pointer py-2">AePS Cash Withdrawal</SelectItem>
                        <SelectItem value="other" className="focus:bg-[#1e4a91] focus:text-white cursor-pointer py-2">Other Service</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="note" className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">Notes (Optional)</Label>
                    <Input id="note" placeholder="Add any additional details..." className="bg-[#0f3575] border-[#1e4a91] text-white focus-visible:ring-[#f97316] h-11 rounded-lg" />
                  </div>
                </div>
                
                <DialogFooter className="px-6 py-4 bg-[#0f3575]/30 border-t border-[#1e4a91] sm:justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsAddEntryOpen(false)} className="bg-transparent border-[#1e4a91] text-slate-300 hover:bg-[#1e4a91] hover:text-white h-11 px-6 rounded-lg font-medium transition-colors">Cancel</Button>
                  <Button type="submit" onClick={() => setIsAddEntryOpen(false)} className="bg-gradient-to-r from-[#f97316] to-[#ea580c] hover:from-[#ea580c] hover:to-[#c2410c] text-white font-bold shadow-[0_0_15px_rgba(249,115,22,0.4)] h-11 px-8 rounded-lg border-none transition-all hover:scale-[1.02]">Save Entry</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 bg-[#0f3575] border border-[#1e4a91] rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader className="bg-[#0b2c60] sticky top-0 z-10 shadow-sm border-b border-[#1e4a91]">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="w-[180px] font-semibold text-slate-400 uppercase text-[10px] tracking-widest py-4">Date & Time</TableHead>
                  <TableHead className="w-[140px] font-semibold text-slate-400 uppercase text-[10px] tracking-widest">Receipt No.</TableHead>
                  <TableHead className="w-[200px] font-semibold text-slate-400 uppercase text-[10px] tracking-widest">Customer</TableHead>
                  <TableHead className="w-[220px] font-semibold text-slate-400 uppercase text-[10px] tracking-widest">Service Type</TableHead>
                  <TableHead className="text-right font-semibold text-slate-400 uppercase text-[10px] tracking-widest">Credit (₹)</TableHead>
                  <TableHead className="text-right font-semibold text-slate-400 uppercase text-[10px] tracking-widest">Debit (₹)</TableHead>
                  <TableHead className="text-right font-semibold text-slate-400 uppercase text-[10px] tracking-widest">Balance (₹)</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((tx, idx) => (
                    <TableRow 
                      key={tx.id} 
                      className={`group border-b border-[#1e4a91]/60 ${idx % 2 === 0 ? 'bg-[#0f3575]' : 'bg-[#0b2c60]/50'} hover:bg-[#1e4a91]/40 transition-colors relative`}
                    >
                      <TableCell className="text-slate-300 relative py-3">
                        {/* Highlight line on hover */}
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#f97316] opacity-0 group-hover:opacity-100 transition-opacity rounded-r"></div>
                        {formatDate(tx.date)}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-[11px] font-medium text-blue-300 bg-blue-900/40 px-2 py-1 rounded border border-blue-700/50">{tx.receiptNo}</span>
                      </TableCell>
                      <TableCell className="font-semibold text-white">{tx.customerName}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center text-sm text-slate-200 font-medium">{tx.serviceType}</span>
                        {tx.note && <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]" title={tx.note}>{tx.note}</p>}
                      </TableCell>
                      <TableCell className="text-right">
                        {tx.credit > 0 ? <span className="text-[#10b981] drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] font-bold text-[15px]">+{tx.credit}</span> : <span className="text-slate-600 font-medium">-</span>}
                      </TableCell>
                      <TableCell className="text-right">
                        {tx.debit > 0 ? <span className="text-[#dc2626] drop-shadow-[0_0_8px_rgba(220,38,38,0.5)] font-bold text-[15px]">-{tx.debit}</span> : <span className="text-slate-600 font-medium">-</span>}
                      </TableCell>
                      <TableCell className="text-right font-black text-white text-[15px] tracking-tight">
                        {formatCurrency(tx.balance)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-white hover:bg-[#1e4a91] rounded-md data-[state=open]:opacity-100 data-[state=open]:bg-[#1e4a91] data-[state=open]:text-white">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 bg-[#0b2c60] border-[#1e4a91] text-white shadow-2xl rounded-xl p-1">
                            <DropdownMenuItem className="focus:bg-[#1e4a91] focus:text-white cursor-pointer py-2 rounded-md">
                              <Eye className="mr-2 h-4 w-4 text-slate-400" /> View Receipt
                            </DropdownMenuItem>
                            <DropdownMenuItem className="focus:bg-[#1e4a91] focus:text-white cursor-pointer py-2 rounded-md">
                              <Download className="mr-2 h-4 w-4 text-slate-400" /> Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-[#1e4a91] my-1" />
                            <DropdownMenuItem className="focus:bg-[#1e4a91] focus:text-white cursor-pointer py-2 rounded-md">
                              Edit Entry
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-[#ef4444] focus:bg-[#ef4444]/15 focus:text-[#ef4444] cursor-pointer py-2 rounded-md mt-1">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-40 text-center text-slate-400 font-medium bg-[#0b2c60]/20">
                      No transactions found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#1e4a91] bg-[#0b2c60] mt-auto">
            <div className="text-sm text-slate-400 font-medium">
              Showing <span className="font-bold text-white">1</span> to <span className="font-bold text-white">{filteredData.length}</span> of <span className="font-bold text-white">{MOCK_DATA.length}</span> entries
            </div>
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-[#0f3575] border-[#1e4a91] text-slate-400 hover:bg-[#1e4a91] hover:text-white rounded-md disabled:opacity-50" disabled>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-[#f97316] text-white border-none hover:bg-[#ea580c] hover:text-white font-bold shadow-[0_0_10px_rgba(249,115,22,0.3)] rounded-md">
                1
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-[#0f3575] border-[#1e4a91] text-slate-300 hover:bg-[#1e4a91] hover:text-white font-medium rounded-md">
                2
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-[#0f3575] border-[#1e4a91] text-slate-300 hover:bg-[#1e4a91] hover:text-white font-medium rounded-md">
                3
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-[#0f3575] border-[#1e4a91] text-slate-400 hover:bg-[#1e4a91] hover:text-white rounded-md">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
