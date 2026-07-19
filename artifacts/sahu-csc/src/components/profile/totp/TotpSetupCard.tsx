import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Smartphone, Loader2, Copy, Check, KeyRound, Eye, EyeOff } from "lucide-react";
import { TotpLiveCode } from "@/components/auth/TotpLiveCode";

const ORANGE = "#F97316";

interface TotpSetupCardProps {
  qrDataUrl: string | null;
  totpSecret: string | null;
  showSecret: boolean;
  onToggleSecret: () => void;
  copiedSecret: boolean;
  onCopySecret: () => void;
  totpCode: string;
  onTotpCodeChange: (v: string) => void;
  isPending: boolean;
  onVerify: () => void;
  onCancel: () => void;
}

/**
 * TOTP enrollment screen — QR code display, manual secret reveal,
 * built-in code viewer fallback, and 6-digit confirmation input.
 */
export function TotpSetupCard({
  qrDataUrl,
  totpSecret,
  showSecret,
  onToggleSecret,
  copiedSecret,
  onCopySecret,
  totpCode,
  onTotpCodeChange,
  isPending,
  onVerify,
  onCancel,
}: TotpSetupCardProps) {
  return (
    <div className="rounded-2xl border bg-white p-4 space-y-3 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#fff7ed" }}>
          <Smartphone size={16} style={{ color: ORANGE }} />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">Connect Authenticator App</p>
          <p className="text-xs text-gray-400">Google Authenticator, Authy, or any TOTP app</p>
        </div>
      </div>

      {/* QR code */}
      {qrDataUrl && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 flex flex-col items-center gap-2">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Scan with your app</p>
          <img src={qrDataUrl} alt="TOTP QR code" className="w-44 h-44 rounded-lg" />
          <p className="text-[11px] text-gray-400 text-center">
            Open your authenticator app → Add account → Scan QR code
          </p>
        </div>
      )}

      {/* Manual entry fallback */}
      {totpSecret && (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3 space-y-1.5">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
            <KeyRound size={10} /> Can't scan? Enter manually
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-[11px] font-mono bg-white border border-gray-200 rounded-lg px-2.5 py-2 break-all text-gray-700 leading-relaxed">
              {showSecret ? totpSecret : totpSecret.replace(/./g, "•")}
            </code>
            <div className="flex flex-col gap-1">
              <button
                type="button" onClick={onToggleSecret}
                className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-gray-600"
              >
                {showSecret ? <EyeOff size={12} /> : <Eye size={12} />}
              </button>
              <button
                type="button" onClick={onCopySecret}
                className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-gray-600"
              >
                {copiedSecret ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
              </button>
            </div>
          </div>
          <p className="text-[10px] text-gray-400">In your app: Time-based · 30-second codes</p>
        </div>
      )}

      {/* Built-in live code viewer (fallback) */}
      <details className="group">
        <summary className="text-[11px] font-semibold text-gray-400 cursor-pointer flex items-center gap-1.5 select-none">
          <span className="group-open:hidden">▶ Or use built-in code viewer</span>
          <span className="hidden group-open:inline">▼ Built-in code viewer</span>
        </summary>
        <div className="mt-2">
          <TotpLiveCode apiPath="/api/auth/2fa/totp-code" />
        </div>
      </details>

      <Input
        autoFocus
        inputMode="numeric"
        placeholder="Enter 6-digit code from your app to confirm"
        value={totpCode}
        onChange={(e) => onTotpCodeChange(e.target.value)}
        className="text-center tracking-widest font-bold h-11"
        maxLength={6}
      />
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 h-10" onClick={onCancel}>Cancel</Button>
        <Button
          className="flex-1 h-10 font-bold text-white border-0"
          style={{ background: ORANGE }}
          disabled={isPending || totpCode.length < 6}
          onClick={onVerify}
        >
          {isPending ? <Loader2 size={14} className="animate-spin" /> : "Confirm"}
        </Button>
      </div>
    </div>
  );
}
