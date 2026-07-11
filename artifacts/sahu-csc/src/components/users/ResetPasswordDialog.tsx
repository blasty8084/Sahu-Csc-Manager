import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CheckCircle2, Eye, EyeOff, KeyRound, XCircle } from "lucide-react";

interface ResetPasswordDialogProps {
  resetPwUser: any;
  setResetPwUser: (u: any) => void;
  resetPwValue: string;
  setResetPwValue: (v: string) => void;
  resetPwConfirm: string;
  setResetPwConfirm: (v: string) => void;
  resetPwShow: boolean;
  setResetPwShow: (v: boolean | ((p: boolean) => boolean)) => void;
  resetPwLoading: boolean;
  resetPassword: () => void;
}

export function ResetPasswordDialog({
  resetPwUser,
  setResetPwUser,
  resetPwValue,
  setResetPwValue,
  resetPwConfirm,
  setResetPwConfirm,
  resetPwShow,
  setResetPwShow,
  resetPwLoading,
  resetPassword,
}: ResetPasswordDialogProps) {
  return (
    <Dialog open={resetPwUser !== null} onOpenChange={(open) => { if (!open) { setResetPwUser(null); setResetPwValue(""); setResetPwConfirm(""); } }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound size={16} className="text-blue-600" />
            Reset Password
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Set a new password for <strong>@{resetPwUser?.username}</strong>. This takes effect immediately.
          </p>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>New Password</Label>
              <div className="relative">
                <input
                  type={resetPwShow ? "text" : "password"}
                  value={resetPwValue}
                  onChange={e => setResetPwValue(e.target.value)}
                  placeholder="Min 8 chars, upper, lower, number"
                  className="w-full h-10 px-3 pr-10 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setResetPwShow(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {resetPwShow ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Confirm Password</Label>
              <input
                type={resetPwShow ? "text" : "password"}
                value={resetPwConfirm}
                onChange={e => setResetPwConfirm(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                autoComplete="new-password"
              />
            </div>
            <ul className="text-xs space-y-1 pt-1">
              {([
                { label: "At least 8 characters", ok: resetPwValue.length >= 8 },
                { label: "Uppercase letter (A–Z)", ok: /[A-Z]/.test(resetPwValue) },
                { label: "Lowercase letter (a–z)", ok: /[a-z]/.test(resetPwValue) },
                { label: "Number (0–9)", ok: /\d/.test(resetPwValue) },
                { label: "Passwords match", ok: resetPwValue.length > 0 && resetPwValue === resetPwConfirm },
              ] as { label: string; ok: boolean }[]).map(({ label, ok }) => (
                <li key={label} className={`flex items-center gap-1.5 transition-colors ${ok ? "text-green-600" : "text-muted-foreground"}`}>
                  {ok ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { setResetPwUser(null); setResetPwValue(""); setResetPwConfirm(""); }}>Cancel</Button>
          <Button
            onClick={resetPassword}
            disabled={
              resetPwLoading ||
              resetPwValue.length < 8 ||
              !/[A-Z]/.test(resetPwValue) ||
              !/[a-z]/.test(resetPwValue) ||
              !/\d/.test(resetPwValue) ||
              resetPwValue !== resetPwConfirm
            }
          >
            {resetPwLoading ? "Saving…" : "Set Password"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ResetPasswordDialog;
