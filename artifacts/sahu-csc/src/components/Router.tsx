import { lazy, Suspense, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { Redirect } from "wouter";
import { PageSkeleton } from "@/components/page-skeleton";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthFade } from "@/components/AuthFade";

// ─── Static imports (tiny / needed on first paint) ───────────────────────────
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";
import Offline from "@/pages/offline";

// ─── Lazy-loaded pages (each becomes its own JS chunk) ───────────────────────
const Register           = lazy(() => import("@/pages/register"));
const RegistrationClosed = lazy(() => import("@/pages/register-closed"));
const RegisterPending    = lazy(() => import("@/pages/register-pending"));
const ForgotPassword     = lazy(() => import("@/pages/forgot-password"));
const ResetPassword      = lazy(() => import("@/pages/reset-password"));
const Sessions           = lazy(() => import("@/pages/sessions"));
const Dashboard          = lazy(() => import("@/pages/dashboard"));
const Ledger             = lazy(() => import("@/pages/ledger"));
const Services           = lazy(() => import("@/pages/services"));
const Reports            = lazy(() => import("@/pages/reports"));
const Notifications      = lazy(() => import("@/pages/notifications"));
const AuditLogs          = lazy(() => import("@/pages/audit-logs"));
const Users              = lazy(() => import("@/pages/users"));
const Backups            = lazy(() => import("@/pages/backups"));
const AePS               = lazy(() => import("@/pages/aeps"));
const Profile            = lazy(() => import("@/pages/profile"));
const PwaStatus          = lazy(() => import("@/pages/pwa-status"));
const ServerHealth       = lazy(() => import("@/pages/server-health"));
const DownloadApp        = lazy(() => import("@/pages/download-app"));
const About              = lazy(() => import("@/pages/about"));
const Udhari             = lazy(() => import("@/pages/udhari"));
const UdhariCustomer     = lazy(() => import("@/pages/udhari-customer"));
const ReceiptsVerify     = lazy(() => import("@/pages/receipts-verify"));
const AepsReceiptVerify  = lazy(() => import("@/pages/aeps-receipt-verify"));
const UdhariReceiptVerify = lazy(() => import("@/pages/udhari-receipt-verify"));
const Broadcast          = lazy(() => import("@/pages/broadcast"));
const ReceiptExport      = lazy(() => import("@/pages/receipt-export"));

// ─── Share target handler — must live inside WouterRouter ─────────────────────
function ShareTargetHandler() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const text = params.get("text") || params.get("title") || "";
    setLocation(text ? `/ledger?description=${encodeURIComponent(text)}` : "/ledger");
  }, [setLocation]);
  return null;
}

// ─── Router — transitions live inside Layout's <main> for protected routes ───
export function Router() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Switch>
        <Route path="/login">{() => <AuthFade><Login /></AuthFade>}</Route>
        <Route path="/register">{() => <AuthFade><Register /></AuthFade>}</Route>
        <Route path="/register/closed">{() => <AuthFade><RegistrationClosed /></AuthFade>}</Route>
        <Route path="/register/pending">{() => <AuthFade><RegisterPending /></AuthFade>}</Route>
        <Route path="/forgot-password">{() => <AuthFade><ForgotPassword /></AuthFade>}</Route>
        <Route path="/reset-password">{() => <AuthFade><ResetPassword /></AuthFade>}</Route>
        <Route path="/">{() => <ProtectedRoute component={Dashboard} />}</Route>
        <Route path="/ledger">{() => <ProtectedRoute component={Ledger} />}</Route>
        <Route path="/services">{() => <ProtectedRoute component={Services} />}</Route>
        <Route path="/reports">{() => <ProtectedRoute component={Reports} />}</Route>
        <Route path="/aeps">{() => <ProtectedRoute component={AePS} />}</Route>
        <Route path="/notifications">{() => <ProtectedRoute component={Notifications} />}</Route>
        <Route path="/profile">{() => <ProtectedRoute component={Profile} />}</Route>
        <Route path="/preferences">{() => <Redirect to="/profile" />}</Route>
        <Route path="/users">{() => <ProtectedRoute component={Users} adminOnly />}</Route>
        <Route path="/users-overview">{() => <Redirect to="/users" />}</Route>
        <Route path="/audit-logs">{() => <ProtectedRoute component={AuditLogs} adminOnly />}</Route>
        <Route path="/settings">{() => <Redirect to="/profile" />}</Route>
        <Route path="/backups">{() => <ProtectedRoute component={Backups} adminOnly />}</Route>
        <Route path="/sessions">{() => <ProtectedRoute component={Sessions} />}</Route>
        <Route path="/pwa-status">{() => <ProtectedRoute component={PwaStatus} />}</Route>
        <Route path="/server-health">{() => <ProtectedRoute component={ServerHealth} adminOnly />}</Route>
        <Route path="/download-app">{() => <ProtectedRoute component={DownloadApp} />}</Route>
        <Route path="/about">{() => <ProtectedRoute component={About} />}</Route>
        <Route path="/udhari">{() => <ProtectedRoute component={Udhari} />}</Route>
        <Route path="/udhari/:customerId">{() => <ProtectedRoute component={UdhariCustomer} />}</Route>
        <Route path="/broadcast">{() => <ProtectedRoute component={Broadcast} adminOnly />}</Route>
        <Route path="/receipt-export">{() => <ProtectedRoute component={ReceiptExport} adminOnly />}</Route>
        <Route path="/receipts/verify/:token" component={ReceiptsVerify} />
        <Route path="/receipts/verify/aeps/:token" component={AepsReceiptVerify} />
        <Route path="/receipts/verify/udhari/:token" component={UdhariReceiptVerify} />
        <Route path="/share-target" component={ShareTargetHandler} />
        <Route path="/offline" component={Offline} />
        <Route path="/open-file">{() => <ProtectedRoute component={Ledger} />}</Route>
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}
