/**
 * ProfilePermissionsSection — view and manage browser permissions from the profile page.
 * Reuses usePermissions + PermissionRow from the first-login PermissionCard.
 */
import { useEffect } from "react";
import { Bell, FolderOpen, MapPin, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/components/PermissionCard/usePermissions";
import { PermissionRow } from "@/components/PermissionCard/PermissionRow";

function isIOSSafari() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /iP(hone|ad|od)/.test(ua) && /WebKit/.test(ua) && !/CriOS|FxiOS/.test(ua);
}

export function ProfilePermissionsSection() {
  const {
    locationStatus,
    notifStatus,
    fileStatus,
    requestLocation,
    requestNotifications,
    requestFileManager,
    initializeFromBrowser,
  } = usePermissions();

  useEffect(() => {
    void initializeFromBrowser();
  }, [initializeFromBrowser]);

  const skipNotifications = isIOSSafari();

  const allGranted =
    locationStatus === "granted" &&
    (skipNotifications || notifStatus === "granted") &&
    fileStatus === "granted";

  const grantedCount = [
    locationStatus === "granted" || locationStatus === "skipped",
    skipNotifications || notifStatus === "granted" || notifStatus === "skipped",
    fileStatus === "granted" || fileStatus === "skipped",
  ].filter(Boolean).length;

  const total = skipNotifications ? 2 : 3;

  return (
    <div className="space-y-4">
      {/* Status summary banner */}
      <div
        className="flex items-center justify-between px-4 py-3 rounded-xl"
        style={{
          background: allGranted
            ? "linear-gradient(90deg, rgba(16,185,129,0.1), rgba(16,185,129,0.04))"
            : "linear-gradient(90deg, rgba(249,115,22,0.08), rgba(249,115,22,0.02))",
          border: `1px solid ${allGranted ? "rgba(16,185,129,0.25)" : "rgba(249,115,22,0.20)"}`,
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{
              background: allGranted ? "rgba(16,185,129,0.15)" : "rgba(249,115,22,0.12)",
            }}
          >
            <ShieldCheck
              size={16}
              style={{ color: allGranted ? "#10b981" : "#f97316" }}
            />
          </div>
          <div>
            <p className="text-sm font-semibold">
              {allGranted ? "All permissions granted" : `${grantedCount} of ${total} granted`}
            </p>
            <p className="text-xs text-muted-foreground">
              {allGranted
                ? "App has full access to improve your experience."
                : "Some features may be limited without these permissions."}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 h-7 text-xs shrink-0"
          onClick={() => void initializeFromBrowser()}
        >
          <RefreshCw size={11} />
          Refresh
        </Button>
      </div>

      {/* Permission rows */}
      <div className="border border-gray-100 rounded-xl px-3 bg-white dark:bg-card dark:border-border">
        <PermissionRow
          icon={MapPin}
          iconBg="#DCFCE7"
          iconColor="#16A34A"
          title="Location"
          description="Needed to check nearby services and availability."
          status={locationStatus}
          onAllow={requestLocation}
          showDivider
        />
        {!skipNotifications && (
          <PermissionRow
            icon={Bell}
            iconBg="#EEF0FF"
            iconColor="#4F46E5"
            title="Notifications"
            description="Get important updates and transaction alerts."
            status={notifStatus}
            onAllow={requestNotifications}
            showDivider
          />
        )}
        <PermissionRow
          icon={FolderOpen}
          iconBg="#FEF3C7"
          iconColor="#D97706"
          title="File Manager"
          description="Access photos and files for receipts, uploads, and exports."
          status={fileStatus}
          onAllow={requestFileManager}
        />
      </div>

      <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
        <ShieldCheck size={12} />
        Permissions are stored in your browser — we never send them to our servers.
      </p>
    </div>
  );
}
