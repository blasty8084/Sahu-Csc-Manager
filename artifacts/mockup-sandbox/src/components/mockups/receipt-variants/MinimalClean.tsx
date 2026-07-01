import React from 'react';
import { 
  CheckCircle2, 
  Printer, 
  Download, 
  Share2, 
  MessageCircle,
  MapPin,
  Phone,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MinimalClean() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 font-sans text-gray-900">
      {/* Receipt Container */}
      <div className="w-full max-w-[400px] bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
        
        {/* Top Accent Stripe */}
        <div className="h-1 w-full" style={{ backgroundColor: '#f97316' }} />

        {/* Header Section */}
        <div className="pt-10 pb-8 px-8 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold tracking-wide mb-6">
            <CheckCircle2 className="w-3.5 h-3.5" />
            VERIFIED
          </div>
          <div className="text-sm text-gray-500 font-medium mb-1">Receipt CSC-2026-0042</div>
          <div className="text-5xl font-light tracking-tight text-emerald-500 mb-2">
            +₹250<span className="text-2xl text-emerald-400">.00</span>
          </div>
          <div className="text-gray-400 text-sm">Jul 1, 2026 at 10:32 AM</div>
        </div>

        {/* Divider */}
        <div className="px-8">
          <div className="h-[1px] w-full bg-gray-100" />
        </div>

        {/* Details Section */}
        <div className="px-8 py-8 space-y-6">
          <div className="flex justify-between items-start">
            <span className="text-sm text-gray-400 font-medium">Customer</span>
            <span className="text-sm font-semibold text-gray-900 text-right">Ramesh Kumar</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-sm text-gray-400 font-medium">Service</span>
            <span className="text-sm font-semibold text-gray-900 text-right">Aadhaar Enrollment</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-sm text-gray-400 font-medium">Date</span>
            <span className="text-sm font-semibold text-gray-900 text-right">1 July 2026</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-sm text-gray-400 font-medium">Operator</span>
            <span className="text-sm font-semibold text-gray-900 text-right">Admin</span>
          </div>
        </div>

        {/* Divider */}
        <div className="px-8">
          <div className="h-[1px] w-full bg-gray-100" />
        </div>

        {/* QR & Verification Section */}
        <div className="px-8 py-8 flex flex-col items-center justify-center">
          <div className="w-24 h-24 border border-gray-100 rounded-xl p-2 mb-3 bg-gray-50 flex items-center justify-center">
            {/* Simple SVG Grid for QR Placeholder */}
            <svg viewBox="0 0 100 100" className="w-full h-full text-gray-300" fill="currentColor">
               <rect x="10" y="10" width="20" height="20" />
               <rect x="40" y="10" width="20" height="20" />
               <rect x="70" y="10" width="20" height="20" />
               
               <rect x="10" y="40" width="20" height="20" />
               <rect x="40" y="40" width="20" height="20" />
               <rect x="70" y="40" width="20" height="20" />
               
               <rect x="10" y="70" width="20" height="20" />
               <rect x="40" y="70" width="20" height="20" />
               <rect x="70" y="70" width="20" height="20" />
            </svg>
          </div>
          <div className="text-[11px] text-gray-400 font-medium tracking-wider uppercase">Scan to verify</div>
        </div>

        {/* Footer Business Details */}
        <div className="bg-gray-50 px-8 py-6 rounded-b-3xl">
          <h3 className="text-sm font-semibold text-gray-900 text-center mb-4" style={{ color: '#0b2c60' }}>
            SAHU CSC Center
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              Cuttack, Odisha
            </div>
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                +91 98765 43210
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Globe className="w-3.5 h-3.5 text-gray-400" />
                sahucsc.in
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 left-0 right-0 px-4 flex justify-center gap-3">
        <Button variant="outline" size="icon" className="h-12 w-12 rounded-full bg-white shadow-sm border-gray-200 text-gray-600 hover:text-gray-900">
          <Download className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="icon" className="h-12 w-12 rounded-full bg-white shadow-sm border-gray-200 text-gray-600 hover:text-gray-900">
          <Printer className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="icon" className="h-12 w-12 rounded-full bg-white shadow-sm border-gray-200 text-gray-600 hover:text-gray-900">
          <Share2 className="h-5 w-5" />
        </Button>
        <Button 
          className="h-12 px-6 rounded-full shadow-sm text-white font-medium gap-2"
          style={{ backgroundColor: '#f97316' }}
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </Button>
      </div>

    </div>
  );
}
