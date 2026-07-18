import { Receipt, Calendar, TrendingUp, ArrowDownToLine } from "lucide-react";
import { NAVY, type MobileTab, type PreviewEntry } from "./types";
import type { ReceiptExportState } from "@/hooks/useReceiptExport";
import { MobileKpiStrip, MobileSummaryCards } from "./ReceiptExportStats";
import { MobileExportTab } from "./ReceiptExportActions";
import { MobileExportFilterToggle, MobileExportFilterPanel, MobileByDatePanel } from "./ExportFilters";
import { MobileReceiptList } from "./MobileReceiptList";
import { MobileReceiptPreview } from "./MobileReceiptPreview";

interface Props {
  s: ReceiptExportState;
  mobileTab: MobileTab;
  setMobileTab: (v: MobileTab) => void;
  showPreview: boolean;
  setShowPreview: (v: boolean) => void;
  activeEntry: PreviewEntry | null;
  setActiveEntry: (v: PreviewEntry | null) => void;
}

const mobileTabs = [
  { tab: "receipts" as MobileTab, icon: Receipt,         label: "Receipts" },
  { tab: "byDate"   as MobileTab, icon: Calendar,        label: "By Date"  },
  { tab: "summary"  as MobileTab, icon: TrendingUp,      label: "Summary"  },
  { tab: "export"   as MobileTab, icon: ArrowDownToLine, label: "Export"   },
] as const;

export function MobileExportLayout({
  s, mobileTab, setMobileTab, showPreview, setShowPreview, activeEntry, setActiveEntry,
}: Props) {
  return (
    <div className="space-y-3">
      {/* KPI strip */}
      <MobileKpiStrip
        preview={s.preview}
        totalAmount={s.totalAmount}
        selectedSize={s.selected.size}
      />

      {/* Tab pills */}
      {!showPreview && (
        <div className="flex gap-1.5 bg-slate-100 rounded-xl p-1">
          {mobileTabs.map(({ tab, icon: Icon, label }) => {
            const active = mobileTab === tab;
            return (
              <button key={tab} onClick={() => setMobileTab(tab)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${active ? "bg-white text-[#0b2c60] shadow-sm" : "text-slate-400"}`}>
                <Icon size={13} />
                <span className="hidden xs:inline">{label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Single-receipt preview overlay */}
      {showPreview && activeEntry && (
        <MobileReceiptPreview
          entry={activeEntry}
          onBack={() => setShowPreview(false)}
          openReceiptAction={s.openReceiptAction}
          modalLoadingFor={s.modalLoadingFor}
        />
      )}

      {/* Receipts tab */}
      {!showPreview && mobileTab === "receipts" && (
        <div className="space-y-2">
          <MobileExportFilterToggle
            showFilters={s.showFilters}
            setShowFilters={s.setShowFilters}
            searchQ={s.searchQ}
            setSearchQ={s.setSearchQ}
          />
          {s.showFilters && (
            <MobileExportFilterPanel
              startDate={s.startDate}  endDate={s.endDate}
              userId={s.userId}        dateRange={s.dateRange}
              today={s.today}          usersOverview={s.usersOverview}
              previewing={s.previewing}
              setStartDate={s.setStartDate}  setEndDate={s.setEndDate}
              setUserId={s.setUserId}        setPreview={() => {}}
              onPreview={s.handlePreview}    onQuickRange={s.setQuickRange}
              setDateRange={s.setDateRange}
              showFilters={s.showFilters}    setShowFilters={s.setShowFilters}
              searchQ={s.searchQ}            setSearchQ={s.setSearchQ}
              onPreviewAndClose={() => { s.handlePreview(); s.setShowFilters(false); }}
            />
          )}
          <MobileReceiptList
            preview={s.preview}
            filteredEntries={s.filteredEntries}
            selected={s.selected}
            searchQ={s.searchQ}
            showFilters={s.showFilters}    setShowFilters={s.setShowFilters}
            selTotal={s.selTotal}          setSelected={s.setSelected}
            toggleEntry={s.toggleEntry}
            openReceiptAction={s.openReceiptAction}
            modalLoadingFor={s.modalLoadingFor}
            onEntryClick={(entry) => { setActiveEntry(entry); setShowPreview(true); }}
            onGoToExport={() => setMobileTab("export")}
          />
        </div>
      )}

      {/* By Date tab */}
      {!showPreview && mobileTab === "byDate" && (
        <MobileByDatePanel
          startDate={s.startDate}  endDate={s.endDate}
          userId={s.userId}        dateRange={s.dateRange}
          today={s.today}          usersOverview={s.usersOverview}
          previewing={s.previewing}
          setStartDate={s.setStartDate}  setEndDate={s.setEndDate}
          setUserId={s.setUserId}        setPreview={() => {}}
          onPreview={s.handlePreview}    onQuickRange={s.setQuickRange}
          setDateRange={s.setDateRange}
          onPreviewAndSwitch={() => { s.handlePreview(); setMobileTab("receipts"); }}
        />
      )}

      {/* Summary tab */}
      {!showPreview && mobileTab === "summary" && (
        <MobileSummaryCards
          preview={s.preview}
          totalAmount={s.totalAmount}
          displayedEntries={s.displayedEntries}
        />
      )}

      {/* Export tab */}
      {!showPreview && mobileTab === "export" && (
        <MobileExportTab
          selected={s.selected}           preview={s.preview}
          selTotal={s.selTotal}           totalAmount={s.totalAmount}
          exportFormat={s.exportFormat}   setExportFormat={s.setExportFormat}
          downloading={s.downloading}     exported={s.exported}
          handleDownload={s.handleDownload}
          trigMonth={s.trigMonth}         trigYear={s.trigYear}
          setTrigMonth={s.setTrigMonth}   setTrigYear={s.setTrigYear}
          years={s.years}
          monthDownloading={s.monthDownloading} emailing={s.emailing}
          nextExport={s.nextExport}
          handleMonthDownload={s.handleMonthDownload}
          handleMonthEmail={s.handleMonthEmail}
        />
      )}
    </div>
  );
}
