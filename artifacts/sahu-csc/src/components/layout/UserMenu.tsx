import { LogOut, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";

interface UserMenuProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/** Logout confirmation dialog. Rendered at Layout root so it sits above all other z-layers. */
export function UserMenu({ open, onCancel, onConfirm }: UserMenuProps) {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-3">
            <AlertTriangle size={22} className="text-amber-500" />
          </div>
          <DialogTitle className="text-center text-[#0b2c60]">Sign out?</DialogTitle>
          <DialogDescription className="text-center text-sm text-slate-500 pt-1">
            You will be logged out of this session. Any unsaved changes may be lost.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:gap-2 pt-1">
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
          <Button className="flex-1 bg-[#0b2c60] hover:bg-[#0a2456] text-white" onClick={onConfirm}>
            <LogOut size={14} className="mr-1.5" />
            Sign out
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
