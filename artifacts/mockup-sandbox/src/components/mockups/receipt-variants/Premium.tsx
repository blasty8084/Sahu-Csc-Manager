import React from "react";
import { 
  Printer, 
  FileText, 
  MessageCircle, 
  Share2, 
  CheckCircle, 
  ShieldCheck 
} from "lucide-react";

export function Premium() {
  return (
    <div className="min-h-screen bg-slate-200 p-4 flex items-center justify-center font-sans antialiased">
      {/* Card Container */}
      <div className="w-full max-w-[380px] relative rounded-[24px] bg-white shadow-[0_20px_60px_-15px_rgba(11,44,96,0.3)] overflow-hidden flex flex-col border border-white/40 backdrop-blur-xl">
        
        {/* Header Strip - Premium Metallic/Textured Feel */}
        <div className="bg-gradient-to-br from-[#0b2c60] via-[#1a3f7a] to-[#071938] px-6 py-7 text-center relative overflow-hidden">
          {/* Subtle noise/texture overlay */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
            }}
          />
          {/* Gold accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#f97316] via-[#fcd34d] to-[#f97316]" />
          
          <h1 className="text-2xl font-bold tracking-[0.15em] mb-1 relative z-10 text-white uppercase drop-shadow-md">
            SAHU CSC
          </h1>
          <p className="text-[10px] text-blue-200 tracking-[0.25em] relative z-10 uppercase font-medium">
            Official E-Receipt
          </p>
        </div>

        {/* Body Content */}
        <div className="p-7 relative bg-white">
          {/* Center Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
            <ShieldCheck className="w-72 h-72 text-[#0b2c60]" strokeWidth={1} />
          </div>

          {/* Receipt Info */}
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-dashed border-gray-200">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Receipt No</p>
              <p className="text-xs font-mono font-medium text-gray-700">CSC-2026-0042</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Date</p>
              <p className="text-xs font-medium text-gray-700">1 Jul 2026</p>
            </div>
          </div>

          {/* Amount Display */}
          <div className="text-center mb-8 relative">
            <p className="text-[11px] text-gray-400 font-semibold mb-2 uppercase tracking-[0.15em]">Amount Received</p>
            <div className="flex items-baseline justify-center gap-1 text-emerald-600">
              <span className="text-3xl font-medium tracking-tight">+</span>
              <span className="text-5xl font-bold tracking-tighter">₹250</span>
              <span className="text-2xl font-semibold opacity-80">.00</span>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="space-y-4 mb-10 relative z-10 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
            <DetailRow label="Customer" value="Ramesh Kumar" highlight />
            <DetailRow label="Service" value="Aadhaar Enrollment" />
            <DetailRow label="Issued" value="1 Jul 2026, 10:32 AM" />
            <DetailRow label="Operator" value="Admin" />
          </div>

          {/* Verification Badge & QR Placeholder */}
          <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className="w-16 h-16 bg-white border border-gray-200 rounded-xl flex items-center justify-center overflow-hidden shrink-0 shadow-sm p-1.5">
              {/* Abstract QR Pattern */}
              <div className="w-full h-full grid grid-cols-4 grid-rows-4 gap-0.5">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="bg-[#0b2c60] rounded-sm"
                    style={{ opacity: [0.2, 0.5, 0.8, 1][(i * 3 + 7) % 4] }}
                  />
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-emerald-600 font-bold mb-1 text-sm tracking-wide">
                <CheckCircle className="w-4 h-4" />
                VERIFIED
              </div>
              <p className="text-[11px] text-gray-500 font-medium">Digital signature valid</p>
            </div>
          </div>

          {/* Footer Contact */}
          <div className="text-center text-[11px] text-gray-400 leading-relaxed">
            <p className="font-bold text-gray-700 text-xs mb-0.5">SAHU CSC Center</p>
            <p>Cuttack, Odisha</p>
            <p className="mt-1">+91 98765 43210 • sahucsc.in</p>
          </div>
        </div>

        {/* Action Panel - Bottom section separated by color */}
        <div className="bg-slate-50 border-t border-slate-100 p-4 px-6 grid grid-cols-4 gap-2 mt-auto">
          <ActionButton icon={Printer} label="Print" />
          <ActionButton icon={FileText} label="PDF" />
          <ActionButton icon={MessageCircle} label="WhatsApp" iconColor="text-emerald-500" />
          <ActionButton icon={Share2} label="Share" />
        </div>
        
      </div>
    </div>
  );
}

function DetailRow({ label, value, highlight = false }: { label: string, value: string, highlight?: boolean }) {
  return (
    <div className="flex justify-between items-baseline gap-4">
      <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">{label}</span>
      <span className={`text-sm text-right ${highlight ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
        {value}
      </span>
    </div>
  );
}

function ActionButton({ icon: Icon, label, iconColor = "text-gray-600" }: { icon: any, label: string, iconColor?: string }) {
  return (
    <button className="group flex flex-col items-center justify-center gap-2 p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all duration-200 active:scale-95">
      <div className={`p-2 rounded-full bg-white shadow-sm border border-slate-100 group-hover:border-slate-200 transition-colors ${iconColor}`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
    </button>
  );
}
