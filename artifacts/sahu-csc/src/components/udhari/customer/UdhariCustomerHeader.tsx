import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useDeleteUdhariCustomer } from "@workspace/api-client-react";
import {
  ArrowDownLeft, ArrowLeft, ArrowUpRight, FileDown,
  MessageCircle, MoreHorizontal, Pencil, Phone, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UdhariEditCustomerDialog } from "./UdhariEditCustomerDialog";
import { printLedger, sendReminder } from "./utils";

interface Props {
  customer: any;
  entries: any[];
  isMobile: boolean;
  onBack: () => void;
  onGave: () => void;
  onGot: () => void;
  onDeleted: () => void;
}

export function UdhariCustomerHeader({ customer, entries, isMobile, onBack, onGave, onGot, onDeleted }: Props) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const deleteCustomer = useDeleteUdhariCustomer();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const handleDeleteCustomer = async () => {
    try {
      await deleteCustomer.mutateAsync({ customerId: customer.id });
      qc.invalidateQueries({ queryKey: ["/api/udhari/customers"] });
      qc.invalidateQueries({ queryKey: ["/api/udhari/summary"] });
      toast({ title: "Customer deleted" });
      onDeleted();
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  return (
    <>
      {/* Back + name + dropdown */}
      <div className="flex items-center gap-3">
        <button onClick={onBack}
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-muted hover:bg-muted/70 transition-colors">
          <ArrowLeft size={15} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-black text-lg leading-tight truncate" style={{ color: "#0b2c60" }}>
            {customer.name}
          </h1>
          {customer.mobile && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Phone size={9} /> {customer.mobile}
            </p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-9 h-9 rounded-xl flex items-center justify-center bg-muted hover:bg-muted/70 transition-colors">
              <MoreHorizontal size={15} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Pencil size={13} className="mr-2" /> Edit Customer
            </DropdownMenuItem>
            {customer.mobile && (
              <DropdownMenuItem onClick={() => sendReminder(customer)}>
                <MessageCircle size={13} className="mr-2" /> Send Reminder
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => printLedger(customer, entries)}>
              <FileDown size={13} className="mr-2" /> Export PDF
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive"
              onClick={() => setDeleteConfirm(true)}>
              <Trash2 size={13} className="mr-2" /> Delete Customer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Quick action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={onGave}
          className="rounded-2xl py-4 flex flex-col items-center gap-1.5 font-bold text-sm transition-transform active:scale-95"
          style={{ background: "linear-gradient(135deg,#fff7ed,#fed7aa)", color: "#ea580c", boxShadow: "0 2px 12px rgba(249,115,22,0.15)" }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(249,115,22,0.15)" }}>
            <ArrowUpRight size={20} style={{ color: "#ea580c" }} />
          </div>
          You Gave
          <span className="text-[10px] font-normal opacity-70">Customer owes more</span>
        </button>
        <button onClick={onGot}
          className="rounded-2xl py-4 flex flex-col items-center gap-1.5 font-bold text-sm transition-transform active:scale-95"
          style={{ background: "linear-gradient(135deg,#f0fdf4,#bbf7d0)", color: "#059669", boxShadow: "0 2px 12px rgba(16,185,129,0.15)" }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(16,185,129,0.15)" }}>
            <ArrowDownLeft size={20} style={{ color: "#059669" }} />
          </div>
          You Got
          <span className="text-[10px] font-normal opacity-70">Customer paid back</span>
        </button>
      </div>

      {/* Desktop action bar */}
      {!isMobile && (
        <div className="flex gap-2 justify-end">
          {customer.mobile && (
            <Button variant="outline" size="sm" onClick={() => sendReminder(customer)}>
              <MessageCircle size={13} className="mr-1.5" /> Send Reminder
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => printLedger(customer, entries)}>
            <FileDown size={13} className="mr-1.5" /> Export PDF
          </Button>
        </div>
      )}

      {/* Edit customer dialog */}
      {editOpen && (
        <UdhariEditCustomerDialog customer={customer} open={editOpen} onClose={() => setEditOpen(false)} />
      )}

      {/* Delete customer confirm */}
      <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {customer.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the customer and all their entries. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90"
              onClick={handleDeleteCustomer} disabled={deleteCustomer.isPending}>
              Delete Customer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
