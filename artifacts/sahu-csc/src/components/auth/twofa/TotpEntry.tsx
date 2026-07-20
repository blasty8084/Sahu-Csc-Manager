import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  KeyRound, Loader2, ArrowLeft, Smartphone,
  ShieldCheck, QrCode, Eye, EyeOff, Copy, Check,
} from "lucide-react";

const NAVY = "#0B1340";

interface TotpEntryProps {
  code: string;
  setCode: (v: string) => void;
  error: string | null;
  trustDevice: boolean;
  setTrustDevice: (v: boolean) => void;
  useBackupCode: boolean;
  isSubmitting: boolean;
  enrollQrDataUrl: string | null;
  enrollSecret: string | null;
  showSecret: boolean;
  copiedSecret: boolean;
  isNewEnrollment: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  onToggleBackupCode: () => void;
  onToggleShowSecret: () => void;
  onCopySecret: () => void;
}

export function TotpEntry({
  code, setCode, error, trustDevice, setTrustDevice, useBackupCode, isSubmitting,
  enrollQrDataUrl, enrollSecret, showSecret, copiedSecret, isNewEnrollment,
  onSubmit, onBack, onToggleBackupCode, onToggleShowSecret, onCopySecret,
}: TotpEntryProps) {
  return (
    <motion.div key="code-entry-totp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }} className="space-y-4">

      {/* QR code for first-time TOTP enrollment */}
      {isNewEnrollment && !useBackupCode && (
        <div className="rounded-xl border border-orange-100 bg-orange-50 p-3 space-y-2">
          <p className="text-[11px] font-bold text-orange-700 uppercase tracking-widest flex items-center gap-1.5">
            <QrCode size={11} /> Step 1 — Scan QR code
          </p>
          {enrollQrDataUrl && (
            <div className="flex justify-center">
              <img src={enrollQrDataUrl} alt="TOTP QR code" className="w-36 h-36 rounded-lg border border-orange-200 bg-white p-1" />
            </div>
          )}
          <p className="text-[11px] text-orange-600 text-center">Open your authenticator app → Add account → Scan QR</p>
          {enrollSecret && (
            <details className="group">
              <summary className="text-[11px] font-semibold text-orange-500 cursor-pointer select-none flex items-center gap-1">
                <span className="group-open:hidden">▶ Can't scan? Enter manually</span>
                <span className="hidden group-open:inline">▼ Manual entry key</span>
              </summary>
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 text-[10px] font-mono bg-white border border-orange-200 rounded-lg px-2 py-1.5 break-all text-gray-700 leading-relaxed">
                  {showSecret ? enrollSecret : enrollSecret.replace(/./g, "•")}
                </code>
                <div className="flex flex-col gap-1">
                  <button type="button" onClick={onToggleShowSecret}
                    className="p-1.5 rounded-lg border border-orange-200 bg-white text-gray-400">
                    {showSecret ? <EyeOff size={11} /> : <Eye size={11} />}
                  </button>
                  <button type="button" onClick={onCopySecret}
                    className="p-1.5 rounded-lg border border-orange-200 bg-white text-gray-400">
                    {copiedSecret ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-orange-400 mt-1">Time-based · 30-second codes</p>
            </details>
          )}
          <p className="text-[11px] font-bold text-orange-700 flex items-center gap-1.5 pt-1">
            <ShieldCheck size={11} /> Step 2 — Enter the 6-digit code below
          </p>
        </div>
      )}

      {/* TOTP hint when already enrolled */}
      {!useBackupCode && !isNewEnrollment && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 flex items-start gap-3">
          <Smartphone className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 leading-relaxed">
            Open your authenticator app (Google Authenticator, Authy, etc.) and enter the current 6-digit code.
          </p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="relative">
          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input autoFocus
            inputMode={useBackupCode ? "text" : "numeric"}
            placeholder={useBackupCode ? "Backup code (e.g. 1A2B3-C4D5E)" : "Enter your 6-digit code"}
            value={code} onChange={(e) => setCode(e.target.value)}
            className="pl-10 h-11 text-gray-900 placeholder:text-gray-400 border-gray-200 bg-white focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:border-blue-400 transition-all tracking-widest text-center font-semibold"
            maxLength={useBackupCode ? 12 : 6} />
        </div>

        {error && <p className="text-xs font-medium text-center" style={{ color: "#be123c" }}>{error}</p>}

        <label className="flex items-center gap-2 cursor-pointer select-none justify-center">
          <Checkbox checked={trustDevice} onCheckedChange={(v) => setTrustDevice(!!v)}
            className="border-gray-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500" />
          <span className="text-sm text-gray-600">Trust this device for 30 days</span>
        </label>

        <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}>
          <Button type="submit" disabled={isSubmitting || !code.trim()}
            className="w-full h-12 font-bold text-base tracking-wide text-white shadow-lg border-0"
            style={{ background: "linear-gradient(135deg, #1a2560, #0f1a4a)" }}>
            {isSubmitting
              ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Verifying…</span>
              : "Verify & Continue →"}
          </Button>
        </motion.div>

        <div className="flex items-center justify-between text-xs">
          <button type="button" onClick={onBack} className="flex items-center gap-1 font-medium text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-3 h-3" />Change method
          </button>
          <button type="button" onClick={onToggleBackupCode} className="font-semibold" style={{ color: NAVY }}>
            {useBackupCode ? "Use a code instead" : "Use a backup code"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
