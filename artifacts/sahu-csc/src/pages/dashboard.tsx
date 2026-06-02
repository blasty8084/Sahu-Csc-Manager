import { useGetDashboard, getGetDashboardQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { TrendingUp, TrendingDown, Wallet, Activity, IndianRupee, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function Dashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useGetDashboard();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground text-sm">
              Welcome back, {user?.fullName || user?.username}. Here's your CSC summary.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
        </div>

        {/* Balance Hero */}
        <Card className="bg-primary text-primary-foreground border-0 shadow-lg">
          <CardContent className="p-6">
            <p className="text-primary-foreground/70 text-sm font-medium uppercase tracking-wide">Current Balance</p>
            {isLoading ? (
              <Skeleton className="h-12 w-48 mt-2 bg-primary-foreground/20" />
            ) : (
              <p className="text-4xl md:text-5xl font-bold mt-2 tracking-tight">
                ₹{(data?.currentBalance ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
            )}
            <div className="flex gap-6 mt-4 pt-4 border-t border-primary-foreground/20">
              <div>
                <p className="text-primary-foreground/70 text-xs">Total Credits</p>
                {isLoading ? <Skeleton className="h-5 w-24 mt-1 bg-primary-foreground/20" /> : (
                  <p className="font-semibold text-emerald-300">₹{(data?.monthCredits ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                )}
              </div>
              <div>
                <p className="text-primary-foreground/70 text-xs">Total Debits</p>
                {isLoading ? <Skeleton className="h-5 w-24 mt-1 bg-primary-foreground/20" /> : (
                  <p className="font-semibold text-red-300">₹{(data?.monthDebits ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Today's Income"
            value={data?.todayCredits ?? 0}
            icon={<ArrowUpRight className="text-emerald-500" size={18} />}
            color="text-emerald-600"
            isLoading={isLoading}
          />
          <StatCard
            title="Today's Expenses"
            value={data?.todayDebits ?? 0}
            icon={<ArrowDownRight className="text-red-500" size={18} />}
            color="text-red-600"
            isLoading={isLoading}
          />
          <StatCard
            title="Today's Transactions"
            value={data?.todayTransactions ?? 0}
            icon={<Activity className="text-blue-500" size={18} />}
            color="text-blue-600"
            isLoading={isLoading}
            isCount
          />
          <StatCard
            title="Monthly Profit"
            value={data?.netProfitMonth ?? 0}
            icon={<TrendingUp className="text-amber-500" size={18} />}
            color={(data?.netProfitMonth ?? 0) >= 0 ? "text-emerald-600" : "text-red-600"}
            isLoading={isLoading}
          />
        </div>

        {/* Recent Entries + Top Services */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Entries */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="space-y-3 p-4">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
                </div>
              ) : data?.recentEntries?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">No transactions yet</p>
              ) : (
                <div className="divide-y divide-border">
                  {data?.recentEntries?.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{entry.customerName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-xs py-0 px-1.5 h-4">{entry.serviceType}</Badge>
                          <span className="text-xs text-muted-foreground">{entry.date}</span>
                        </div>
                      </div>
                      <div className="text-right ml-2">
                        {entry.credit > 0 && <p className="text-emerald-600 font-semibold text-sm">+₹{entry.credit.toLocaleString("en-IN")}</p>}
                        {entry.debit > 0 && <p className="text-red-600 font-semibold text-sm">-₹{entry.debit.toLocaleString("en-IN")}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Services */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Top Services This Month</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : data?.topServicesMonth?.length === 0 ? (
                <p className="text-center text-muted-foreground py-4 text-sm">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {data?.topServicesMonth?.map((s, i) => {
                    const maxRevenue = data.topServicesMonth[0]?.revenue ?? 1;
                    const pct = Math.round((s.revenue / maxRevenue) * 100);
                    return (
                      <div key={s.serviceType}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground w-4">{i + 1}</span>
                            <span className="text-sm font-medium">{s.serviceType}</span>
                            <Badge variant="secondary" className="text-xs py-0 h-4">{s.count} tx</Badge>
                          </div>
                          <span className="text-sm font-semibold text-primary">₹{s.revenue.toLocaleString("en-IN")}</span>
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
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="p-1.5 bg-muted rounded-md">{icon}</div>
        </div>
        {isLoading ? (
          <Skeleton className="h-8 w-32 mt-3" />
        ) : (
          <p className={`text-2xl font-bold mt-2 ${color}`}>
            {isCount ? value : `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
