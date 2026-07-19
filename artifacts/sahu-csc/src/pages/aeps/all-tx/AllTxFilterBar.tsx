import type { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AutocompleteInput } from "@/components/autocomplete-input";
import { ListFilter, X } from "lucide-react";
import { AllTxExportButton } from "./AllTxExportButton";
import type { AllTxResponse } from "../aeps.constants";

interface AllTxFilterBarProps {
  showFilters: boolean;
  setShowFilters: Dispatch<SetStateAction<boolean>>;
  startDate: string;
  setStartDate: (v: string) => void;
  endDate: string;
  setEndDate: (v: string) => void;
  typeFilter: string;
  setTypeFilter: (v: string) => void;
  customerName: string;
  setCustomerName: (v: string) => void;
  hasFilters: boolean;
  clearFilters: () => void;
  total: number;
  allTabCustomerNames: string[];
  setPage: Dispatch<SetStateAction<number>>;
  data: AllTxResponse | undefined;
}

/** Toolbar + collapsible filter panel for the All Transactions tab. */
export function AllTxFilterBar({
  showFilters, setShowFilters,
  startDate, setStartDate,
  endDate, setEndDate,
  typeFilter, setTypeFilter,
  customerName, setCustomerName,
  hasFilters, clearFilters,
  total, allTabCustomerNames, setPage, data,
}: AllTxFilterBarProps) {
  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2">
        <p style={{ fontSize: 12, color: "#94a3b8" }}>
          {total} transaction{total !== 1 ? "s" : ""}
        </p>
        <div className="flex gap-2">
          <AllTxExportButton data={data} />
          <Button
            variant="outline" size="sm"
            onClick={() => setShowFilters((v) => !v)}
            className="gap-1.5 h-8 text-xs"
          >
            <ListFilter size={13} />
            Filters
            {hasFilters && <span className="w-1.5 h-1.5 bg-primary rounded-full" />}
          </Button>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground h-8 text-xs">
              <X size={12} />Clear
            </Button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div
          className="bg-white rounded-2xl p-4"
          style={{ boxShadow: "0 2px 10px rgba(11,44,96,0.07)", border: "1px solid rgba(11,44,96,0.08)" }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">From Date</Label>
              <Input
                type="date" value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">To Date</Label>
              <Input
                type="date" value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Type</Label>
              <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="withdrawal">Withdrawal</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Customer Name</Label>
              <div style={{ position: "relative" }}>
                <AutocompleteInput
                  value={customerName}
                  onChange={(val) => { setCustomerName(val); setPage(1); }}
                  suggestions={allTabCustomerNames}
                  placeholder="Search name…"
                  className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
