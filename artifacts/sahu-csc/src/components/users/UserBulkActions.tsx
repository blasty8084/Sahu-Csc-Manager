import { Button } from "@/components/ui/button";
import { ListChecks, UserCheck, UserMinus } from "lucide-react";

interface UserBulkActionsProps {
  selectedSize: number;
  bulkActionLoading: boolean;
  bulkSetStatus: (activate: boolean) => void;
  clearSelection: () => void;
}

/** Bulk action bar shown on the Active / All tabs when one or more users are selected. */
export function UserBulkActions({
  selectedSize,
  bulkActionLoading,
  bulkSetStatus,
  clearSelection,
}: UserBulkActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 px-3 py-2.5 rounded-xl border-2 border-primary/20 bg-primary/5 sticky top-0 z-10">
      <ListChecks className="w-4 h-4 text-primary shrink-0" />
      <span className="text-sm font-semibold text-primary flex-1 min-w-[80px]">
        {selectedSize} selected
      </span>
      <Button
        size="sm"
        className="bg-green-600 hover:bg-green-700 text-white h-8 px-3 text-xs"
        onClick={() => bulkSetStatus(true)}
        disabled={bulkActionLoading}
      >
        <UserCheck size={12} className="mr-1" />
        Activate<span className="hidden sm:inline"> ({selectedSize})</span>
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="border-orange-200 text-orange-600 hover:bg-orange-50 h-8 px-3 text-xs"
        onClick={() => bulkSetStatus(false)}
        disabled={bulkActionLoading}
      >
        <UserMinus size={12} className="mr-1" />
        Suspend<span className="hidden sm:inline"> ({selectedSize})</span>
      </Button>
      <button
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        onClick={clearSelection}
      >
        Clear
      </button>
    </div>
  );
}

export default UserBulkActions;
