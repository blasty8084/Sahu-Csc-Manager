/**
 * LedgerTable — barrel re-export.
 *
 * All named exports are preserved so every existing import site continues to
 * work without change:
 *   import { TableTabsHeader, PendingSyncBanners, ... } from "@/components/ledger/LedgerTable"
 *
 * Implementation lives in:
 *   ledger/table/   — full component files (moved from this file)
 *   ledger/Ledger*  — new focused sub-components extracted during split
 */

// ── Existing named exports (moved to table/ sub-files) ────────────────────────
export { TableTabsHeader }          from "./table/TableTabsHeader";
export { PendingSyncBanners }       from "./table/PendingSyncBanners";
export { DesktopReceiptsPanel }     from "./table/DesktopReceiptsPanel";
export { DesktopTransactionsTable } from "./table/DesktopTransactionsTable";
export { TableFooterPagination, MobilePagination } from "./LedgerPagination";
export { MobileReceiptsList }       from "./table/MobileReceiptsList";
export { MobileTransactionsList }   from "./table/MobileTransactionsList";

// ── New focused sub-components ────────────────────────────────────────────────
export { LedgerDesktopRow, LedgerMobileRow } from "./LedgerRow";
export { LedgerRowActions }         from "./LedgerRowActions";
export { LedgerEmptyState }         from "./LedgerEmptyState";
