// Barrel — all skeleton components re-exported from themed sub-files.
// Import sites that use named imports (e.g. `import { LedgerSkeleton } from "@/components/skeletons"`)
// continue to work unchanged.

export { DashboardServicesSkeleton, DashboardStatsSkeleton } from "./skeletons/DashboardSkeletons";
export { LedgerSkeleton, LedgerBalanceSkeleton }             from "./skeletons/LedgerSkeletons";
export { AepsSkeleton }                                       from "./skeletons/AepsSkeletons";
export {
  NotificationsSkeleton, PreferencesSkeleton, SessionsListSkeleton,
  AdminSessionsSkeleton, UsersOverviewSkeleton,
  ProfileToggleSkeleton, ProfilePageSkeleton,
} from "./skeletons/ProfileSkeletons";
export { UdhariListSkeleton, UdhariSummarySkeleton, UdhariCustomerHeaderSkeleton } from "./skeletons/UdhariSkeletons";
export {
  ReportsSkeleton, RecentTxSkeleton, ServicesSkeleton,
  BackupHistorySkeleton, BackupScheduleSkeleton, AuditLogsSkeleton,
} from "./skeletons/ReportsSkeletons";
