import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AutocompleteInput } from "@/components/autocomplete-input";
import type { UseFormReturn } from "react-hook-form";

// ─────────────────────────────────────────────────────────
// Edit Transaction Dialog — shared by Daily Tab and All Transactions Tab
// ─────────────────────────────────────────────────────────
export function EditTransactionDialog({
  open, onOpenChange, editForm, editCustomerName, suggestions, onSubmit, isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editForm: UseFormReturn<any>;
  editCustomerName: string;
  suggestions: string[];
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit Transaction</DialogTitle></DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Transaction Type</Label>
            <Select value={editForm.watch("type")} onValueChange={(v) => editForm.setValue("type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="withdrawal">Withdrawal (Balance decreases)</SelectItem>
                <SelectItem value="deposit">Deposit (Balance increases)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Customer Name</Label>
            <AutocompleteInput
              value={editCustomerName}
              onChange={(val) => editForm.setValue("customerName", val)}
              suggestions={suggestions}
              autoFocus
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Amount (₹)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₹</span>
              <Input type="number" min={1} step={0.01} className="pl-7" {...editForm.register("amount", { required: true })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Description (optional)</Label>
            <Input placeholder="e.g. Aadhaar linked, HDFC Bank" {...editForm.register("description")} />
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save Changes"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
