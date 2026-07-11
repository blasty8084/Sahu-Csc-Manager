import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CheckCircle2, Copy, Link2, Loader2, Mail } from "lucide-react";

interface ResetLinkDialogProps {
  resetLinkUser: any | null;
  closeResetLink: () => void;
  resetLinkToken: string | null;
  resetLinkExpiry: string | null;
  resetLinkUrl: string | null;
  resetLinkLoading: boolean;
  resetLinkCopied: boolean;
  resetLinkEmailLoading: boolean;
  resetLinkEmailSent: boolean;
  generateResetLink: () => void;
  copyResetLink: () => void;
  sendResetLinkEmail: () => void;
}

export function ResetLinkDialog({
  resetLinkUser,
  closeResetLink,
  resetLinkToken,
  resetLinkExpiry,
  resetLinkUrl,
  resetLinkLoading,
  resetLinkCopied,
  resetLinkEmailLoading,
  resetLinkEmailSent,
  generateResetLink,
  copyResetLink,
  sendResetLinkEmail,
}: ResetLinkDialogProps) {
  return (
    <Dialog open={resetLinkUser !== null} onOpenChange={(open) => { if (!open) closeResetLink(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 size={16} className="text-orange-500" />
            Generate Reset Link
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Create a secure, single-use password reset link for{" "}
            <strong>@{resetLinkUser?.username}</strong>
            {resetLinkUser?.fullName ? ` (${resetLinkUser.fullName})` : ""}.{" "}
            {resetLinkUser?.email
              ? "Copy it manually or send it directly to their email."
              : "Copy it and share via a secure channel — no email address on file."}
          </p>

          {!resetLinkToken ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 space-y-1.5">
              <p className="font-semibold flex items-center gap-1.5">⚠ Security notice</p>
              <ul className="space-y-1 list-disc pl-4">
                <li>The link expires in <strong>10 minutes</strong></li>
                <li>It can only be used <strong>once</strong></li>
                <li>Only share through a secure, private channel</li>
                <li>Every generation is recorded in the audit log</li>
              </ul>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Reset Link</p>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={resetLinkUrl ?? ""}
                    className="flex-1 h-9 px-3 text-xs rounded-md border bg-muted/40 font-mono"
                    style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <Button
                    size="sm"
                    variant={resetLinkCopied ? "default" : "outline"}
                    className={`shrink-0 h-9 gap-1.5 transition-colors ${resetLinkCopied ? "bg-green-600 hover:bg-green-700 border-green-600 text-white" : ""}`}
                    onClick={copyResetLink}
                  >
                    {resetLinkCopied
                      ? <><CheckCircle2 size={13} />Copied!</>
                      : <><Copy size={13} />Copy</>}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Click the link field to select all, then copy.</p>
              </div>

              {/* Send to email button — shown only if user has an email on file */}
              {resetLinkUser?.email && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={resetLinkEmailSent ? "default" : "outline"}
                    className={`h-9 gap-1.5 transition-colors text-xs ${resetLinkEmailSent ? "bg-green-600 hover:bg-green-700 border-green-600 text-white" : ""}`}
                    disabled={resetLinkEmailLoading || resetLinkEmailSent}
                    onClick={sendResetLinkEmail}
                  >
                    {resetLinkEmailLoading
                      ? <><Loader2 size={13} className="animate-spin" />Sending…</>
                      : resetLinkEmailSent
                        ? <><CheckCircle2 size={13} />Sent!</>
                        : <><Mail size={13} />Send to {resetLinkUser.email}</>}
                  </Button>
                  {resetLinkEmailSent && (
                    <span className="text-xs text-muted-foreground">Email delivered — link is still valid until expiry.</span>
                  )}
                </div>
              )}

              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800 space-y-1">
                <p className="font-semibold">
                  ⏱ Expires at {resetLinkExpiry
                    ? new Date(resetLinkExpiry).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
                    : ""}
                </p>
                <p>The link becomes invalid once used or after 10 minutes — whichever comes first.</p>
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={closeResetLink}>
            {resetLinkToken ? "Close" : "Cancel"}
          </Button>
          {!resetLinkToken && (
            <Button
              onClick={generateResetLink}
              disabled={resetLinkLoading}
              style={{ background: "#f97316", borderColor: "#f97316", color: "#fff" }}
              className="hover:opacity-90"
            >
              {resetLinkLoading
                ? <><Loader2 size={14} className="animate-spin mr-1.5" />Generating…</>
                : <><Link2 size={14} className="mr-1.5" />Generate Link</>}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ResetLinkDialog;
