import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface DeleteUserDialogProps {
  deleteId: number | null;
  setDeleteId: (id: number | null) => void;
  confirmDelete: () => void;
  isPending: boolean;
}

export function DeleteUserDialog({ deleteId, setDeleteId, confirmDelete, isPending }: DeleteUserDialogProps) {
  return (
    <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Delete User?</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="destructive" onClick={confirmDelete} disabled={isPending}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteUserDialog;
