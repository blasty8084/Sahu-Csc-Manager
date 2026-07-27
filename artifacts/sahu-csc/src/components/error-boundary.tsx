/**
 * Top-level React error boundary.
 *
 * Catches uncaught render errors, reports them to Sentry (when configured),
 * and renders a recoverable fallback UI instead of a blank screen.
 *
 * Sensitive data policy: only the current route and a sanitised user context
 * (userId + role, never PII) are attached to captured events.
 */

import React from "react";
import { captureException } from "@/lib/sentry";

interface Props {
  children: React.ReactNode;
  /** Current pathname — attached to Sentry events for easier debugging. */
  route?: string;
}

interface State {
  hasError: boolean;
  eventId?: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    captureException(error, {
      route: this.props.route ?? window.location.pathname,
      componentStack: info.componentStack ?? undefined,
    });
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  private handleReset = (): void => {
    this.setState({ hasError: false });
  };

  render(): React.ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--brand-navy-800)] p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center space-y-4">
          <div className="text-4xl">⚠️</div>
          <h1 className="text-xl font-bold text-[var(--brand-navy-800)]">Something went wrong</h1>
          <p className="text-sm text-gray-500">
            An unexpected error occurred. Your data is safe — try refreshing the
            page or going back to the dashboard.
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 rounded-lg border border-[var(--brand-navy-800)] text-[var(--brand-navy-800)] text-sm font-medium hover:bg-[var(--brand-navy-800)]/5 transition-colors"
            >
              Try again
            </button>
            <button
              onClick={this.handleReload}
              className="px-4 py-2 rounded-lg bg-[var(--brand-navy-800)] text-white text-sm font-medium hover:bg-[var(--brand-navy-800)]/90 transition-colors"
            >
              Reload page
            </button>
          </div>
        </div>
      </div>
    );
  }
}
