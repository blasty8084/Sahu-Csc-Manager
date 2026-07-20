import { Eye, EyeOff, Copy, Check, QrCode, ShieldCheck } from "lucide-react";

interface Props {
  enrollQrDataUrl: string | null;
  enrollSecret: string | null;
  showSecret: boolean;
  setShowSecret: (v: boolean) => void;
  copiedSecret: boolean;
  onCopySecret: () => void;
}

/** QR code + manual-key fallback shown during first-time TOTP setup at login time. */
export function TotpEnrollmentCard({ enrollQrDataUrl, enrollSecret, showSecret, setShowSecret, copiedSecret, onCopySecret }: Props) {
  return (
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
              <button type="button" onClick={() => setShowSecret(!showSecret)}
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
  );
}
