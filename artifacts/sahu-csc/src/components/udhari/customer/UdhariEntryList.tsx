import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDeleteUdhariEntry } from "@workspace/api-client-react";
import { SessionsListSkeleton } from "@/components/skeletons";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UdhariEntryRow } from "./UdhariEntryRow";

interface Props {
  customerId: number;
  entries: any[];
  loading: boolean;
  onEdit: (entry: any) => void;
  onReceipt: (entry: any) => void;
}

export function UdhariEntryList({ customerId, entries, loading, onEdit, onReceipt }: Props) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const deleteEntry = useDeleteUdhariEntry();
  const [deleteEntryId, setDeleteEntryId] = useState<number | null>(null);

  const handleDeleteEntry = async () => {
    if (!deleteEntryId) return;
    try {
      await deleteEntry.mutateAsync({ customerId, entryId: deleteEntryId });
      qc.invalidateQueries({ queryKey: [`/api/udhari/customers/${customerId}/entries`] });
      qc.invalidateQueries({ queryKey: [`/api/udhari/customers/${customerId}`] });
      qc.invalidateQueries({ queryKey: ["/api/udhari/customers"] });
      qc.invalidateQueries({ queryKey: ["/api/udhari/summary"] });
      toast({ title: "Entry deleted" });
      setDeleteEntryId(null);
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  return (
    <>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
          Transaction History
        </p>
        {loading ? (
          <SessionsListSkeleton />
        ) : entries.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl"
            style={{ boxShadow: "0 1px 6px rgba(11,44,96,0.06)" }}>
            <Plus size={28} className="mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground font-medium">No entries yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Use "You Gave" or "You Got" to add the first entry
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((e: any) => (
              <UdhariEntryRow
                key={e.id}
                e={e}
                onEdit={() => onEdit(e)}
                onDelete={() => setDeleteEntryId(e.id)}
                onReceipt={() => onReceipt(e)}
              />
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={deleteEntryId !== null} onOpenChange={(v) => { if (!v) setDeleteEntryId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This entry will be permanently removed and the balance will be recalculated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDeleteEntry}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
