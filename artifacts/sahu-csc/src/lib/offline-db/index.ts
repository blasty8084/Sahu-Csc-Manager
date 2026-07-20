// offline-db/index.ts — backward-compatible re-exports
// All consumers that import from "@/lib/offline-db" or "./offline-db" resolve here.
export type {
  PendingLedgerEntry,
  PendingNotification,
  CachedReport,
  UserSession,
  CacheItem,
  PendingActionDomain,
  PendingAction,
} from "./schema";

export {
  openDB,
} from "./schema";

export {
  addPendingEntry,
  getAllPendingEntries,
  removePendingEntry,
  updatePendingEntryRetry,
  getPendingCount,
  addPendingAction,
  getAllPendingActions,
  removePendingAction,
  updatePendingActionRetry,
  getPendingActionsCount,
  addPendingNotification,
  getAllPendingNotifications,
  markNotificationRead,
  clearReadNotifications,
} from "./queue";

export {
  setCacheItem,
  getCacheItem,
  clearExpiredCache,
  saveUserSession,
  getCachedUserSession,
  clearUserSession,
  saveCachedReport,
  getCachedReport,
  getAllCachedReports,
  clearExpiredReports,
  getStorageUsage,
  getOfflineStats,
} from "./sync";
