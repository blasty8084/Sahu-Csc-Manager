import { Button } from "@/components/ui/button";
import { AlertTriangle, Copy, Check } from "lucide-react";

const NAVY = "#0B1340";

type Method = "otp" | "totp";

interface Props {
  codes: string[];
  pendingMethod: Method;
  copiedIdx: number | null;
  onCopyCode: (code: string, idx: number) => void;
  onDone: () => void;
}

/** Full-page backup-codes save screen shown after enabling 2FA from the profile settings page. */
export function TwoFaBackupCodesPanel({ codes, pendingMethod, copiedIdx, onCopyCode, onDone }: Props) {
  return (
    <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle size={15} className="text-amber-600" />
        <p className="text-sm font-bold text-amber-800">Save your backup codes</p>
      </div>
      <p className="text-xs text-amber-700">
        Each code works once if you lose access to your {pendingMethod === "totp" ? "authenticator app" : "email"}.
        Store them somewhere safe — they won't be shown again.
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        {codes.map((code, i) => (
          <button key={code} type="button" onClick={() => onCopyCode(code, i)}
            className="flex items-center justify-between gap-1.5 font-mono text-xs bg-white border border-amber-200 rounded-xl px-2.5 py-2 text-gray-800">
            {code}
            {copiedIdx === i ? <Check size={11} className="text-green-600 flex-shrink-0" /> : <Copy size={11} className="text-gray-300 flex-shrink-0" />}
          </button>
        ))}
      </div>
      <Button className="w-full h-11 font-bold text-white border-0"
        style={{ background: `linear-gradient(135deg, ${NAVY}, #1d3070)` }}
        onClick={onDone}>
        I've saved my codes — Done
      </Button>
    </div>
  );
}
