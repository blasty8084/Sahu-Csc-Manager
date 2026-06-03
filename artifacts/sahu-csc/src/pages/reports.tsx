import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useGetDailyReport, useGetMonthlyReport, useGetServiceBreakdown } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const COLORS = ["#2563eb", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4"];

function formatINR(n: number) {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

function StatCard({ label, value, cls, isCount }: { label: string; value: number; cls?: string; isCount?: boolean }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-xl font-bold mt-1 ${cls ?? ""}`}>
          {isCount ? value : formatINR(value)}
        </p>
      </CardContent>
    </Card>
  );
}

export default function Reports() {
  const today = new Date().toISOString().split("T")[0];
  const now = new Date();
  const [dailyDate, setDailyDate] = useState(today);
  const [reportYear, setReportYear] = useState(now.getFullYear());
  const [reportMonth, setReportMonth] = useState(now.getMonth() + 1);
  const [aepsStart, setAepsStart] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`);
  const [aepsEnd, setAepsEnd] = useState(today);

  const { data: daily, isLoading: dailyLoading } = useGetDailyReport({ date: dailyDate }) as { data: any; isLoading: boolean };
  const { data: monthly, isLoading: monthlyLoading } = useGetMonthlyReport({ year: reportYear, month: reportMonth }) as { data: any; isLoading: boolean };
  const { data: breakdown } = useGetServiceBreakdown({});

  const { data: aepsReport, isLoading: aepsLoading } = useQuery<any>({
    queryKey: ["reports", "aeps", aepsStart, aepsEnd],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/reports/aeps?startDate=${aepsStart}&endDate=${aepsEnd}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch AePS report");
      return res.json();
    },
  });

  const monthStart = `${reportYear}-${String(reportMonth).padStart(2, "0")}-01`;
  const lastDay = new Date(reportYear, reportMonth, 0).getDate();
  const monthEnd = `${reportYear}-${String(reportMonth).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  return (
    <Layout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Reports</h2>
          <Button asChild size="sm" variant="outline">
            <a href={`${BASE}/api/reports/export?startDate=${monthStart}&endDate=${monthEnd}`} target="_blank">
              <Download size={14} className="mr-1.5" />Export Excel
            </a>
          </Button>
        </div>

        <Tabs defaultValue="daily">
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="aeps">AePS</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
          </TabsList>

          {/* ── Daily ── */}
          <TabsContent value="daily" className="space-y-4">
            <div className="flex items-center gap-3 mt-3">
              <Label>Date</Label>
              <Input type="date" value={dailyDate} onChange={(e) => setDailyDate(e.target.value)} className="w-44 h-8 text-sm" />
            </div>
            {dailyLoading ? <Skeleton className="h-48 w-full" /> : daily ? (
              <>
                {/* Ledger summary */}
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ledger</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatCard label="Transactions" value={daily.transactionCount} isCount />
                  <StatCard label="Credits" value={daily.totalCredits} cls="text-emerald-600" />
                  <StatCard label="Debits" value={daily.totalDebits} cls="text-red-600" />
                  <StatCard label="Net Revenue" value={daily.netRevenue} cls={daily.netRevenue >= 0 ? "text-emerald-600" : "text-red-600"} />
                </div>

                {/* AePS summary for the day */}
                {daily.aeps && (
                  <>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">AePS Cash</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <StatCard label="AePS Transactions" value={daily.aeps.totalTransactions} isCount />
                      <StatCard label="Withdrawals" value={daily.aeps.totalWithdrawals} cls="text-red-600" />
                      <StatCard label="Deposits" value={daily.aeps.totalDeposits} cls="text-emerald-600" />
                      <StatCard label="Net Flow" value={daily.aeps.netFlow} cls={daily.aeps.netFlow >= 0 ? "text-emerald-600" : "text-red-600"} />
                    </div>
                  </>
                )}

                {daily.topServices?.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Services Used</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {daily.topServices.map((s: any) => (
                          <div key={s.serviceType} className="flex justify-between items-center text-sm">
                            <span>{s.serviceType}</span>
                            <div className="flex gap-3">
                              <Badge variant="secondary">{s.count} tx</Badge>
                              <span className="font-medium text-primary">{formatINR(s.revenue)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : <p className="text-center text-muted-foreground py-8">No data for this date</p>}
          </TabsContent>

          {/* ── Monthly ── */}
          <TabsContent value="monthly" className="space-y-4">
            <div className="flex items-center gap-3 mt-3">
              <Label>Year</Label>
              <Input type="number" value={reportYear} onChange={(e) => setReportYear(Number(e.target.value))} className="w-24 h-8 text-sm" />
              <Label>Month</Label>
              <Input type="number" min={1} max={12} value={reportMonth} onChange={(e) => setReportMonth(Number(e.target.value))} className="w-20 h-8 text-sm" />
            </div>
            {monthlyLoading ? <Skeleton className="h-64 w-full" /> : monthly ? (
              <>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ledger</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatCard label="Transactions" value={monthly.totalTransactions} isCount />
                  <StatCard label="Total Credits" value={monthly.totalCredits} cls="text-emerald-600" />
                  <StatCard label="Total Debits" value={monthly.totalDebits} cls="text-red-600" />
                  <StatCard label="Net Profit" value={monthly.netProfit} cls={monthly.netProfit >= 0 ? "text-emerald-600" : "text-red-600"} />
                </div>

                {monthly.aeps && (
                  <>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">AePS Cash</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <StatCard label="AePS Transactions" value={monthly.aeps.totalTransactions} isCount />
                      <StatCard label="Withdrawals" value={monthly.aeps.totalWithdrawals} cls="text-red-600" />
                      <StatCard label="Deposits" value={monthly.aeps.totalDeposits} cls="text-emerald-600" />
                      <StatCard label="Net Flow" value={monthly.aeps.netFlow} cls={monthly.aeps.netFlow >= 0 ? "text-emerald-600" : "text-red-600"} />
                    </div>
                    {monthly.aeps.dailyBreakdown?.length > 0 && (
                      <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">AePS Daily Breakdown</CardTitle></CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={monthly.aeps.dailyBreakdown} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.split("-")[2]} />
                              <YAxis tick={{ fontSize: 10 }} />
                              <Tooltip formatter={(v: any) => [`₹${v.toLocaleString("en-IN")}`, ""]} labelFormatter={(l) => `Date: ${l}`} />
                              <Bar dataKey="withdrawals" fill="#ef4444" name="Withdrawals" radius={[2, 2, 0, 0]} />
                              <Bar dataKey="deposits" fill="#10b981" name="Deposits" radius={[2, 2, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}

                {monthly.dailyBreakdown?.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Daily Revenue (Ledger)</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={monthly.dailyBreakdown} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.split("-")[2]} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip formatter={(v: any) => [`₹${v.toLocaleString("en-IN")}`, ""]} labelFormatter={(l) => `Date: ${l}`} />
                          <Bar dataKey="credits" fill="#10b981" name="Credits" radius={[2, 2, 0, 0]} />
                          <Bar dataKey="debits" fill="#ef4444" name="Debits" radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : <p className="text-center text-muted-foreground py-8">No data for this period</p>}
          </TabsContent>

          {/* ── AePS Tab ── */}
          <TabsContent value="aeps" className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <Label>From</Label>
              <Input type="date" value={aepsStart} onChange={(e) => setAepsStart(e.target.value)} className="w-44 h-8 text-sm" />
              <Label>To</Label>
              <Input type="date" value={aepsEnd} onChange={(e) => setAepsEnd(e.target.value)} className="w-44 h-8 text-sm" />
              <Button asChild size="sm" variant="outline" className="h-8">
                <a href={`${BASE}/api/reports/export?startDate=${aepsStart}&endDate=${aepsEnd}`} target="_blank">
                  <Download size={13} className="mr-1.5" />Export
                </a>
              </Button>
            </div>

            {aepsLoading ? <Skeleton className="h-48 w-full" /> : aepsReport ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatCard label="AePS Transactions" value={aepsReport.totalTransactions} isCount />
                  <StatCard label="Total Withdrawals" value={aepsReport.totalWithdrawals} cls="text-red-600" />
                  <StatCard label="Total Deposits" value={aepsReport.totalDeposits} cls="text-emerald-600" />
                  <StatCard label="Net Flow" value={aepsReport.netFlow} cls={aepsReport.netFlow >= 0 ? "text-emerald-600" : "text-red-600"} />
                </div>

                {aepsReport.dailyBreakdown?.length > 0 ? (
                  <>
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm">Withdrawals vs Deposits</CardTitle></CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={aepsReport.dailyBreakdown} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.split("-")[2]} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip formatter={(v: any) => [`₹${v.toLocaleString("en-IN")}`, ""]} labelFormatter={(l) => `Date: ${l}`} />
                            <Bar dataKey="withdrawals" fill="#ef4444" name="Withdrawals" radius={[2, 2, 0, 0]} />
                            <Bar dataKey="deposits" fill="#10b981" name="Deposits" radius={[2, 2, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm">Day-wise Detail</CardTitle></CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b text-left text-muted-foreground text-xs">
                                <th className="py-2 pr-4">Date</th>
                                <th className="py-2 pr-4 text-right">Opening Bal</th>
                                <th className="py-2 pr-4 text-right">Withdrawals</th>
                                <th className="py-2 pr-4 text-right">Deposits</th>
                                <th className="py-2 pr-4 text-right">Tx Count</th>
                                <th className="py-2 text-right">Net Flow</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {aepsReport.dailyBreakdown.map((row: any) => (
                                <tr key={row.date} className="hover:bg-muted/20">
                                  <td className="py-2 pr-4 font-mono text-xs">{row.date}</td>
                                  <td className="py-2 pr-4 text-right">{formatINR(row.openingBalance)}</td>
                                  <td className="py-2 pr-4 text-right text-red-600 font-medium">{formatINR(row.withdrawals)}</td>
                                  <td className="py-2 pr-4 text-right text-emerald-600 font-medium">{formatINR(row.deposits)}</td>
                                  <td className="py-2 pr-4 text-right">
                                    <Badge variant="secondary" className="text-xs">{row.transactions}</Badge>
                                  </td>
                                  <td className={`py-2 text-right font-semibold ${row.netFlow >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                                    {formatINR(row.netFlow)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No AePS transactions in this date range</p>
                )}
              </>
            ) : <p className="text-center text-muted-foreground py-8">No AePS data found</p>}
          </TabsContent>

          {/* ── Services ── */}
          <TabsContent value="services" className="space-y-4">
            <div className="mt-3 grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Revenue by Service</CardTitle></CardHeader>
                <CardContent>
                  {breakdown?.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8 text-sm">No data yet</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={breakdown} dataKey="revenue" nameKey="serviceType" cx="50%" cy="50%" outerRadius={80} label={(e) => e.serviceType}>
                          {breakdown?.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v: any) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Service Details</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {breakdown?.map((s: any, i: number) => (
                      <div key={s.serviceType} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                          <span>{s.serviceType}</span>
                        </div>
                        <div className="flex gap-3">
                          <Badge variant="secondary">{s.count} tx</Badge>
                          <span className="font-semibold">{formatINR(s.revenue)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
