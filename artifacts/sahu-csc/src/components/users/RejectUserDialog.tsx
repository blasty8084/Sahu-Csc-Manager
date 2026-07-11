import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface RejectUserDialogProps {
  rejectTarget: any;
  setRejectTarget: (u: any) => void;
  rejectReason: string;
  setRejectReason: (v: string) => void;
  confirmReject: () => void;
  actionLoading: number | null;
}

export function RejectUserDialog({
  rejectTarget,
  setRejectTarget,
  rejectReason,
  setRejectReason,
  confirmReject,
  actionLoading,
}: RejectUserDialogProps) {
  return (
    <Dialog open={rejectTarget !== null} onOpenChange={() => { setRejectTarget(null); setRejectReason(""); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Decline Registration</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Declining <strong>@{rejectTarget?.username}</strong>. Their account will be removed and they will be notified.
          </p>
          <div className="space-y-1.5">
            <Label className="text-sm">Reason for declining</Label>
            <Textarea
              placeholder="e.g. Duplicate account, incomplete information, not authorised..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="resize-none h-20"
            />
            <p className="text-xs text-muted-foreground">
              This reason will be shown to the user when they next try to log in.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { setRejectTarget(null); setRejectReason(""); }}>Cancel</Button>
          <Button variant="destructive" onClick={confirmReject} disabled={actionLoading === rejectTarget?.id}>Decline</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default RejectUserDialog;
