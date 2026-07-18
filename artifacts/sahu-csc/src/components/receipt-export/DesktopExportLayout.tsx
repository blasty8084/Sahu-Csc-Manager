import { Download, Loader2 } from "lucide-react";
import { SAFFRON } from "./types";
import type { ReceiptExportState } from "@/hooks/useReceiptExport";
import { DesktopStatBar } from "./ReceiptExportStats";
import { DesktopBulkBar, DesktopExportOptionsCard } from "./ReceiptExportActions";
import { DesktopExportFilters } from "./ExportFilters";
import { DesktopReceiptTable } from "./DesktopReceiptTable";
import { DesktopReceiptExpandedPreview } from "./DesktopReceiptExpandedPreview";
import { ReceiptMonthlyPanel } from "./ReceiptMonthlyPanel";

interface Props { s: ReceiptExportState }

export function DesktopExportLayout({ s }: Props) {
  return (
    <div className="space-y-5">
      {/* 4-stat bar */}
      <DesktopStatBar
        preview={s.preview}
        totalAmount={s.totalAmount}
        displayedEntries={s.displayedEntries}
        selectedSize={s.selected.size}
      />

      {/* Two-column body */}
      <div className="flex gap-5 items-start">

        {/* Left: filter bar + bulk bar + table */}
        <div className="flex-1 min-w-0 space-y-4">
          <DesktopExportFilters
            startDate={s.startDate}  endDate={s.endDate}
            userId={s.userId}        dateRange={s.dateRange}
            today={s.today}          usersOverview={s.usersOverview}
            previewing={s.previewing}
            setStartDate={s.setStartDate}  setEndDate={s.setEndDate}
            setUserId={s.setUserId}        setPreview={() => s.setSelected(new Set())}
            onPreview={s.handlePreview}    onQuickRange={s.setQuickRange}
            setDateRange={s.setDateRange}
          />

          {s.selected.size > 0 && s.preview && (
            <DesktopBulkBar
              selectedSize={s.selected.size}
              selTotal={s.selTotal}
              downloading={s.downloading}
              clearSelected={() => s.setSelected(new Set())}
              handleDownload={s.handleDownload}
            />
          )}

          <DesktopReceiptTable
            preview={s.preview}
            filteredEntries={s.filteredEntries}
            selected={s.selected}
            searchQ={s.searchQ}             setSearchQ={s.setSearchQ}
            expandedEntry={s.expandedEntry} setExpandedEntry={s.setExpandedEntry}
            toggleEntry={s.toggleEntry}     toggleAll={s.toggleAll}
            allFilteredSelected={s.allFilteredSelected}
            openReceiptAction={s.openReceiptAction}
            modalLoadingFor={s.modalLoadingFor}
            startDate={s.startDate}  endDate={s.endDate}
            totalAmount={s.totalAmount}
          />
        </div>

        {/* Right: export options + preview + monthly */}
        <div className="w-[280px] shrink-0 space-y-4">
          <DesktopExportOptionsCard
            exportFormat={s.exportFormat}   setExportFormat={s.setExportFormat}
            selected={s.selected}           preview={s.preview}
            startDate={s.startDate}         endDate={s.endDate}
            downloading={s.downloading}     exported={s.exported}
            handleDownload={s.handleDownload}
          />

          <DesktopReceiptExpandedPreview
            expandedEntry={s.expandedEntry}
            filteredEntries={s.filteredEntries}
            openReceiptAction={s.openReceiptAction}
            modalLoadingFor={s.modalLoadingFor}
          />

          <ReceiptMonthlyPanel
            trigMonth={s.trigMonth}   trigYear={s.trigYear}
            setTrigMonth={s.setTrigMonth} setTrigYear={s.setTrigYear}
            years={s.years}
            monthDownloading={s.monthDownloading} emailing={s.emailing}
            nextExport={s.nextExport}
            handleMonthDownload={s.handleMonthDownload}
            handleMonthEmail={s.handleMonthEmail}
          />
        </div>
      </div>
    </div>
  );
}
