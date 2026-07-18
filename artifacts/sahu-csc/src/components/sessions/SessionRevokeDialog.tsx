import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SessionRevokeDialogProps {
  revokeId: number | null;
  setRevokeId: (id: number | null) => void;
  onRevoke: (id: number) => void;
}

/** Single-session revoke confirm dialog. */
export function SessionRevokeDialog({ revokeId, setRevokeId, onRevoke }: SessionRevokeDialogProps) {
  return (
    <AlertDialog open={revokeId !== null} onOpenChange={() => setRevokeId(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Revoke Session</AlertDialogTitle>
          <AlertDialogDescription>
            This will immediately log out the selected device. Any unsaved work on that device will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/90"
            onClick={() => { if (revokeId !== null) { onRevoke(revokeId); setRevokeId(null); } }}
          >
            Revoke Session
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
