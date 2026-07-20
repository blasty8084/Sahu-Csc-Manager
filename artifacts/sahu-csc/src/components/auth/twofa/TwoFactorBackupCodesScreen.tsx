import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Copy, Check } from "lucide-react";

const NAVY = "#0B1340";

interface Props {
  backupCodes: string[];
  copiedIdx: number | null;
  onCopyCode: (text: string, idx: number) => void;
  onFinish: () => void;
}

/** Post-enrollment screen: user must save their backup codes before continuing. */
export function TwoFactorBackupCodesScreen({ backupCodes, copiedIdx, onCopyCode, onFinish }: Props) {
  return (
    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }} transition={{ duration: 0.25 }}>
      <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-600" />
          <p className="text-sm font-bold text-amber-800">Save your backup codes</p>
        </div>
        <p className="text-xs text-amber-700">
          Authenticator app connected. Each code below can be used once if you lose access to your app — store them somewhere safe, they won't be shown again.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {backupCodes.map((c, i) => (
            <button key={c} type="button" onClick={() => onCopyCode(c, i)}
              className="flex items-center justify-between gap-1.5 font-mono text-xs bg-white border border-amber-200 rounded-lg px-2.5 py-2">
              {c}
              {copiedIdx === i ? <Check size={12} className="text-green-600" /> : <Copy size={12} className="text-muted-foreground" />}
            </button>
          ))}
        </div>
        <Button className="w-full h-11 font-bold text-white border-0" style={{ background: NAVY }} onClick={onFinish}>
          I've saved these codes — Continue
        </Button>
      </div>
    </motion.div>
  );
}
