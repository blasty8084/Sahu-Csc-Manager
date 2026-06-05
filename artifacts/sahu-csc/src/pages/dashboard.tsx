import { useGetDashboard } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { ArrowUpRight, ArrowDownRight, Activity, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useGetDashboard();

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <Layout>
      <div className="space-y-4 md:space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground text-xs md:text-sm">
              Welcome, {user?.fullName || user?.username}
            </p>
          </div>
          <p className="text-xs text-muted-foreground hidden sm:block">{today}</p>
        </div>

        {/* Balance Hero — compact on mobile, large on desktop */}
        <Card className="bg-primary text-primary-foreground border-0 shadow-lg overflow-hidden">
          <CardContent className="p-4 md:p-6">
            <p className="text-primary-foreground/70 text-xs font-semibold uppercase tracking-widest">
              Current Balance
            </p>
            {isLoading ? (
              <Skeleton className="h-10 md:h-14 w-40 md:w-56 mt-2 bg-primary-foreground/20" />
            ) : (
              <p className="text-3xl md:text-5xl font-bold mt-1.5 tracking-tight">
                ₹{(data?.currentBalance ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
            )}

            {/* Mobile: 2-col inline stats; Desktop: row */}
            <div className="grid grid-cols-2 md:flex md:gap-8 gap-3 mt-4 pt-3 border-t border-primary-foreground/20">
              <div>
                <p className="text-primary-foreground/60 text-[10px] md:text-xs uppercase tracking-wide font-medium">Total Credits</p>
                {isLoading ? (
                  <Skeleton className="h-5 w-24 mt-1 bg-primary-foreground/20" />
                ) : (
                  <p className="font-bold text-emerald-300 text-sm md:text-base">
                    ₹{(data?.monthCredits ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>
                )}
              </div>
              <div>
                <p className="text-primary-foreground/60 text-[10px] md:text-xs uppercase tracking-wide font-medium">Total Debits</p>
                {isLoading ? (
                  <Skeleton className="h-5 w-24 mt-1 bg-primary-foreground/20" />
                ) : (
                  <p className="font-bold text-red-300 text-sm md:text-base">
                    ₹{(data?.monthDebits ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid: 2-col on mobile, 4-col on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatCard
            title="Today's Income"
            value={data?.todayCredits ?? 0}
            icon={<ArrowUpRight size={16} className="text-emerald-500" />}
            color="text-emerald-600"
            isLoading={isLoading}
          />
          <StatCard
            title="Today's Expenses"
            value={data?.todayDebits ?? 0}
            icon={<ArrowDownRight size={16} className="text-red-500" />}
            color="text-red-600"
            isLoading={isLoading}
          />
          <StatCard
            title="Today's Transactions"
            value={data?.todayTransactions ?? 0}
            icon={<Activity size={16} className="text-blue-500" />}
            color="text-blue-600"
            isLoading={isLoading}
            isCount
          />
          <StatCard
            title="Monthly Profit"
            value={data?.netProfitMonth ?? 0}
            icon={<TrendingUp size={16} className="text-amber-500" />}
            color={(data?.netProfitMonth ?? 0) >= 0 ? "text-emerald-600" : "text-red-600"}
            isLoading={isLoading}
          />
        </div>

        {/* Recent + Top Services: stacked on mobile, side-by-side on desktop */}
        <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
          {/* Recent Transactions */}
          <Card>
            <CardHeader className="pb-2 px-4 md:px-6 pt-4 md:pt-6">
              <CardTitle className="text-sm md:text-base font-semibold">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="space-y-2 p-4">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : !data?.recentEntries?.length ? (
                <p className="text-center text-muted-foreground py-10 text-sm">No transactions yet</p>
              ) : (
                <div className="divide-y divide-border">
                  {data.recentEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{entry.customerName}</p>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4">{entry.serviceType}</Badge>
                          <span className="text-[10px] text-muted-foreground">{entry.date}</span>
                        </div>
                      </div>
                      <div className="text-right ml-3 flex-shrink-0">
                        {entry.credit > 0 && (
                          <p className="text-emerald-600 font-bold text-sm">+₹{entry.credit.toLocaleString("en-IN")}</p>
                        )}
                        {entry.debit > 0 && (
                          <p className="text-red-600 font-bold text-sm">-₹{entry.debit.toLocaleString("en-IN")}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Services */}
          <Card>
            <CardHeader className="pb-2 px-4 md:px-6 pt-4 md:pt-6">
              <CardTitle className="text-sm md:text-base font-semibold">Top Services This Month</CardTitle>
            </CardHeader>
            <CardContent className="px-4 md:px-6">
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : !data?.topServicesMonth?.length ? (
                <p className="text-center text-muted-foreground py-6 text-sm">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {data.topServicesMonth.map((s, i) => {
                    const maxRevenue = data.topServicesMonth[0]?.revenue ?? 1;
                    const pct = Math.round((s.revenue / maxRevenue) * 100);
                    return (
                      <div key={s.serviceType}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-xs font-mono text-muted-foreground w-4 flex-shrink-0">{i + 1}</span>
                            <span className="text-xs md:text-sm font-medium truncate">{s.serviceType}</span>
                            <Badge variant="secondary" className="text-[10px] py-0 h-4 flex-shrink-0">{s.count}tx</Badge>
                          </div>
                          <span className="text-xs md:text-sm font-bold text-primary ml-2 flex-shrink-0">
                            ₹{s.revenue.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ title, value, icon, color, isLoading, isCount }: {
  title: string; value: number; icon: React.ReactNode; color: string; isLoading: boolean; isCount?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-3 md:p-5">
        <div className="flex items-start justify-between">
          <p className="text-[10px] md:text-xs font-medium text-muted-foreground leading-tight pr-1">{title}</p>
          <div className="p-1 md:p-1.5 bg-muted rounded-md flex-shrink-0">{icon}</div>
        </div>
        {isLoading ? (
          <Skeleton className="h-6 md:h-8 w-20 md:w-28 mt-2" />
        ) : (
          <p className={`text-lg md:text-2xl font-bold mt-1.5 ${color}`}>
            {isCount
              ? value
              : `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 0 })}`}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
