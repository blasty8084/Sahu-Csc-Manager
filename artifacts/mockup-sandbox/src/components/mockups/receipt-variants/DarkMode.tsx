import React from "react";
import { CheckCircle2, Download, FileText, Share2, MessageCircle, QrCode, Building2, Phone, Globe } from "lucide-react";

export function DarkMode() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 flex flex-col items-center p-4 sm:p-8 font-sans selection:bg-[#f97316] selection:text-white">
      {/* Receipt Card */}
      <div className="w-full max-w-md bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Header Gradient */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#0b2c60] to-transparent opacity-80" />
        
        <div className="p-6 relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">SAHU CSC</h1>
              <p className="text-sm text-slate-400">Common Service Center</p>
            </div>
            <div className="bg-[#4ade80]/10 text-[#4ade80] px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-[#4ade80]/20 shadow-[0_0_10px_rgba(74,222,128,0.2)]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="text-xs font-medium uppercase tracking-wider">Verified</span>
            </div>
          </div>

          <div className="text-center mb-8 pb-8 border-b border-white/10 relative">
            <p className="text-sm text-slate-400 mb-1 uppercase tracking-widest font-semibold">Credit Amount</p>
            <h2 className="text-5xl font-light text-[#4ade80] tracking-tight drop-shadow-[0_0_15px_rgba(74,222,128,0.3)]">+₹250.00</h2>
            <p className="text-sm text-slate-500 mt-2">Receipt: <span className="font-mono text-slate-300">CSC-2026-0042</span></p>
          </div>

          <div className="space-y-4 mb-8">
            <DetailRow label="Customer" value="Ramesh Kumar" />
            <DetailRow label="Service" value="Aadhaar Enrollment" />
            <DetailRow label="Date" value="1 July 2026" />
            <DetailRow label="Issued" value="1 Jul 2026, 10:32 AM" />
            <DetailRow label="Operator" value="Admin" />
          </div>

          <div className="flex flex-col items-center justify-center p-6 bg-slate-900/50 rounded-2xl border border-white/5 mb-8">
            <div className="w-32 h-32 bg-white rounded-xl p-2 mb-3 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              {/* Fake QR Pattern */}
              <div className="w-full h-full border-[6px] border-[#0f172a] rounded relative flex items-center justify-center">
                 <div className="absolute top-1 left-1 w-4 h-4 border-2 border-[#0f172a]" />
                 <div className="absolute top-1 right-1 w-4 h-4 border-2 border-[#0f172a]" />
                 <div className="absolute bottom-1 left-1 w-4 h-4 border-2 border-[#0f172a]" />
                 <QrCode className="w-10 h-10 text-[#0f172a]" />
              </div>
            </div>
            <p className="text-xs text-slate-500 font-mono tracking-widest">SCAN TO VERIFY</p>
          </div>

          <div className="bg-[#0f172a]/80 p-5 rounded-2xl border border-white/5 space-y-3">
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <Building2 className="w-4 h-4 text-[#f97316]" />
              <span>SAHU CSC Center, Cuttack, Odisha</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <Phone className="w-4 h-4 text-[#f97316]" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <Globe className="w-4 h-4 text-[#f97316]" />
              <span>sahucsc.in</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-md grid grid-cols-4 gap-3 mt-6">
        <ActionButton icon={<Download className="w-5 h-5" />} label="Save" />
        <ActionButton icon={<FileText className="w-5 h-5" />} label="PDF" />
        <ActionButton icon={<MessageCircle className="w-5 h-5" />} label="WhatsApp" color="hover:text-green-400 hover:border-green-400/50" />
        <ActionButton icon={<Share2 className="w-5 h-5" />} label="Share" />
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className="text-slate-100 font-medium text-right text-sm">{value}</span>
    </div>
  );
}

function ActionButton({ icon, label, color = "hover:text-[#f97316] hover:border-[#f97316]/50" }: { icon: React.ReactNode; label: string; color?: string }) {
  return (
    <button className={`flex flex-col items-center justify-center gap-2 p-3 bg-[#1e293b]/60 backdrop-blur-md border border-white/10 rounded-2xl transition-all duration-300 ${color} text-slate-300 hover:bg-[#1e293b]`}>
      {icon}
      <span className="text-[10px] font-medium tracking-wide uppercase">{label}</span>
    </button>
  );
}
