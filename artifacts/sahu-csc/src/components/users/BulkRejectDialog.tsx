import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface BulkRejectDialogProps {
  showBulkRejectDialog: boolean;
  setShowBulkRejectDialog: (v: boolean) => void;
  bulkRejectReason: string;
  setBulkRejectReason: (v: string) => void;
  confirmBulkReject: () => void;
  bulkActionLoading: boolean;
  selectedCount: number;
}

export function BulkRejectDialog({
  showBulkRejectDialog,
  setShowBulkRejectDialog,
  bulkRejectReason,
  setBulkRejectReason,
  confirmBulkReject,
  bulkActionLoading,
  selectedCount,
}: BulkRejectDialogProps) {
  return (
    <Dialog open={showBulkRejectDialog} onOpenChange={(open) => { if (!open) { setShowBulkRejectDialog(false); setBulkRejectReason(""); } }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Decline {selectedCount} Registration{selectedCount !== 1 ? "s" : ""}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            All <strong>{selectedCount} selected</strong> registration requests will be declined and each user will be notified.
          </p>
          <div className="space-y-1.5">
            <Label className="text-sm">Reason for declining <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Textarea
              placeholder="e.g. Incomplete documentation, duplicate accounts, unauthorised applications..."
              value={bulkRejectReason}
              onChange={(e) => setBulkRejectReason(e.target.value)}
              className="resize-none h-20"
            />
            <p className="text-xs text-muted-foreground">
              The same reason will be shown to all declined users when they next try to log in.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { setShowBulkRejectDialog(false); setBulkRejectReason(""); }}>Cancel</Button>
          <Button variant="destructive" onClick={confirmBulkReject} disabled={bulkActionLoading}>
            {bulkActionLoading ? "Declining…" : `Decline All (${selectedCount})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default BulkRejectDialog;
