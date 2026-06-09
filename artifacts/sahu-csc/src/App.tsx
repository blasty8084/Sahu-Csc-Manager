import React from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";

import Login from "@/pages/login";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import Dashboard from "@/pages/dashboard";
import Ledger from "@/pages/ledger";
import Services from "@/pages/services";
import Reports from "@/pages/reports";
import Notifications from "@/pages/notifications";
import AuditLogs from "@/pages/audit-logs";
import Users from "@/pages/users";
import UsersOverview from "@/pages/users-overview";
import Settings from "@/pages/settings";
import Backups from "@/pages/backups";
import AePS from "@/pages/aeps";
import Profile from "@/pages/profile";
import Offline from "@/pages/offline";
import { Redirect } from "wouter";
import { useEffect } from "react";
import { useListNotifications } from "@workspace/api-client-react";
import { updateAppBadge } from "@/lib/pwa-badge";

function BadgeUpdater() {
  const { data } = useListNotifications({ unreadOnly: true });
  const count = Array.isArray(data) ? data.length : 0;
  useEffect(() => { updateAppBadge(count); }, [count]);
  return null;
}

function ShareTargetHandler() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const text = params.get("text") || params.get("title") || "";
    setLocation(text ? `/ledger?description=${encodeURIComponent(text)}` : "/ledger");
  }, []);
  return null;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function ProtectedRoute({ component: Component, adminOnly = false, ...rest }: any) {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  React.useEffect(() => {
    if (!isLoading && !user && location !== "/login") {
      setLocation("/login");
    }
  }, [user, isLoading, location, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  if (adminOnly && user.role !== "admin") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-2xl font-bold text-muted-foreground">403</p>
          <p className="text-muted-foreground mt-1">Access restricted to admins only</p>
        </div>
      </div>
    );
  }

  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/">{() => <ProtectedRoute component={Dashboard} />}</Route>
      <Route path="/ledger">{() => <ProtectedRoute component={Ledger} />}</Route>
      <Route path="/services">{() => <ProtectedRoute component={Services} />}</Route>
      <Route path="/reports">{() => <ProtectedRoute component={Reports} />}</Route>
      <Route path="/aeps">{() => <ProtectedRoute component={AePS} />}</Route>
      <Route path="/notifications">{() => <ProtectedRoute component={Notifications} />}</Route>
      <Route path="/profile">{() => <ProtectedRoute component={Profile} />}</Route>
      <Route path="/preferences">{() => <Redirect to="/profile" />}</Route>
      <Route path="/users">{() => <ProtectedRoute component={Users} adminOnly />}</Route>
      <Route path="/users-overview">{() => <ProtectedRoute component={UsersOverview} adminOnly />}</Route>
      <Route path="/audit-logs">{() => <ProtectedRoute component={AuditLogs} adminOnly />}</Route>
      <Route path="/settings">{() => <ProtectedRoute component={Settings} adminOnly />}</Route>
      <Route path="/backups">{() => <ProtectedRoute component={Backups} adminOnly />}</Route>
      <Route path="/share-target" component={ShareTargetHandler} />
      <Route path="/offline" component={Offline} />
      <Route path="/open-file">{() => <ProtectedRoute component={Ledger} />}</Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider defaultTheme="light" storageKey="sahu-csc-theme">
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AuthProvider>
              <BadgeUpdater />
              <Router />
            </AuthProvider>
          </WouterRouter>
        </ThemeProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
