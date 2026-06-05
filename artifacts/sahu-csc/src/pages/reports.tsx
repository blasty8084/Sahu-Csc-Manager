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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const COLORS = ["#2563eb", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function formatINR(n: number) {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

function StatCard({ label, value, cls, isCount }: { label: string; value: number; cls?: string; isCount?: boolean }) {
  return (
    <Card>
      <CardContent className="p-3 md:p-4">
        <p className="text-[10px] md:text-xs text-muted-foreground leading-tight">{label}</p>
        <p className={`text-base md:text-xl font-bold mt-1 ${cls ?? ""}`}>
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
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const monthStart = `${reportYear}-${String(reportMonth).padStart(2, "0")}-01`;
  const lastDay = new Date(reportYear, reportMonth, 0).getDate();
  const monthEnd = `${reportYear}-${String(reportMonth).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  return (
    <Layout>
      <div className="space-y-4 md:space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-bold">Reports</h2>
          <Button asChild size="sm" variant="outline">
            <a href={`${BASE}/api/reports/export?startDate=${monthStart}&endDate=${monthEnd}`} target="_blank">
              <Download size={14} className="md:mr-1.5" />
              <span className="hidden md:inline">Export Excel</span>
            </a>
          </Button>
        </div>

        <Tabs defaultValue="daily">
          {/* Scrollable tab list on mobile */}
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <TabsList className="w-max md:w-auto">
              <TabsTrigger value="daily" className="text-xs md:text-sm">Daily</TabsTrigger>
              <TabsTrigger value="monthly" className="text-xs md:text-sm">Monthly</TabsTrigger>
              <TabsTrigger value="aeps" className="text-xs md:text-sm">AePS</TabsTrigger>
              <TabsTrigger value="services" className="text-xs md:text-sm">Services</TabsTrigger>
            </TabsList>
          </div>

          {/* ── Daily ── */}
          <TabsContent value="daily" className="space-y-4 mt-4">
            {/* Mobile: stacked; Desktop: inline row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <Label className="text-sm text-muted-foreground whitespace-nowrap">Select Date</Label>
              <Input
                type="date"
                value={dailyDate}
                onChange={(e) => setDailyDate(e.target.value)}
                className="w-full sm:w-44 h-9 text-sm"
              />
            </div>
            {dailyLoading ? <Skeleton className="h-48 w-full" /> : daily ? (
              <>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Ledger</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                  <StatCard label="Transactions" value={daily.transactionCount} isCount />
                  <StatCard label="Credits" value={daily.totalCredits} cls="text-emerald-600" />
                  <StatCard label="Debits" value={daily.totalDebits} cls="text-red-600" />
                  <StatCard label="Net Revenue" value={daily.netRevenue} cls={daily.netRevenue >= 0 ? "text-emerald-600" : "text-red-600"} />
                </div>

                {daily.aeps && (
                  <>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">AePS Cash</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                      <StatCard label="AePS Tx" value={daily.aeps.totalTransactions} isCount />
                      <StatCard label="Withdrawals" value={daily.aeps.totalWithdrawals} cls="text-red-600" />
                      <StatCard label="Deposits" value={daily.aeps.totalDeposits} cls="text-emerald-600" />
                      <StatCard label="Net Flow" value={daily.aeps.netFlow} cls={daily.aeps.netFlow >= 0 ? "text-emerald-600" : "text-red-600"} />
                    </div>
                  </>
                )}

                {daily.topServices?.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2 px-4 pt-4"><CardTitle className="text-sm">Services Used</CardTitle></CardHeader>
                    <CardContent className="px-4 pb-4">
                      <div className="space-y-2">
                        {daily.topServices.map((s: any) => (
                          <div key={s.serviceType} className="flex justify-between items-center text-sm">
                            <span className="truncate mr-2">{s.serviceType}</span>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge variant="secondary" className="text-xs">{s.count}tx</Badge>
                              <span className="font-semibold text-primary text-xs md:text-sm">{formatINR(s.revenue)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : <p className="text-center text-muted-foreground py-12 text-sm">No data for this date</p>}
          </TabsContent>

          {/* ── Monthly ── */}
          <TabsContent value="monthly" className="space-y-4 mt-4">
            {/* Mobile: stacked selects; Desktop: inline */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 flex-1">
                <Label className="text-sm text-muted-foreground whitespace-nowrap">Month</Label>
                <Select value={String(reportMonth)} onValueChange={(v) => setReportMonth(Number(v))}>
                  <SelectTrigger className="h-9 text-sm flex-1 sm:w-40 sm:flex-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm text-muted-foreground whitespace-nowrap">Year</Label>
                <Input
                  type="number"
                  value={reportYear}
                  onChange={(e) => setReportYear(Number(e.target.value))}
                  className="w-24 h-9 text-sm"
                />
              </div>
            </div>

            {monthlyLoading ? <Skeleton className="h-64 w-full" /> : monthly ? (
              <>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Ledger</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                  <StatCard label="Transactions" value={monthly.totalTransactions} isCount />
                  <StatCard label="Total Credits" value={monthly.totalCredits} cls="text-emerald-600" />
                  <StatCard label="Total Debits" value={monthly.totalDebits} cls="text-red-600" />
                  <StatCard label="Net Profit" value={monthly.netProfit} cls={monthly.netProfit >= 0 ? "text-emerald-600" : "text-red-600"} />
                </div>

                {monthly.aeps && (
                  <>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">AePS Cash</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                      <StatCard label="AePS Tx" value={monthly.aeps.totalTransactions} isCount />
                      <StatCard label="Withdrawals" value={monthly.aeps.totalWithdrawals} cls="text-red-600" />
                      <StatCard label="Deposits" value={monthly.aeps.totalDeposits} cls="text-emerald-600" />
                      <StatCard label="Net Flow" value={monthly.aeps.netFlow} cls={monthly.aeps.netFlow >= 0 ? "text-emerald-600" : "text-red-600"} />
                    </div>
                    {monthly.aeps.dailyBreakdown?.length > 0 && (
                      <Card>
                        <CardHeader className="pb-2 px-4 pt-4"><CardTitle className="text-sm">AePS Daily Breakdown</CardTitle></CardHeader>
                        <CardContent className="px-2 pb-4">
                          <ResponsiveContainer width="100%" height={160}>
                            <BarChart data={monthly.aeps.dailyBreakdown} margin={{ top: 0, right: 4, left: -24, bottom: 0 }}>
                              <XAxis dataKey="date" tick={{ fontSize: 9 }} tickFormatter={(v) => v.split("-")[2]} />
                              <YAxis tick={{ fontSize: 9 }} />
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
                    <CardHeader className="pb-2 px-4 pt-4"><CardTitle className="text-sm">Daily Revenue</CardTitle></CardHeader>
                    <CardContent className="px-2 pb-4">
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={monthly.dailyBreakdown} margin={{ top: 0, right: 4, left: -24, bottom: 0 }}>
                          <XAxis dataKey="date" tick={{ fontSize: 9 }} tickFormatter={(v) => v.split("-")[2]} />
                          <YAxis tick={{ fontSize: 9 }} />
                          <Tooltip formatter={(v: any) => [`₹${v.toLocaleString("en-IN")}`, ""]} labelFormatter={(l) => `Date: ${l}`} />
                          <Bar dataKey="credits" fill="#10b981" name="Credits" radius={[2, 2, 0, 0]} />
                          <Bar dataKey="debits" fill="#ef4444" name="Debits" radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : <p className="text-center text-muted-foreground py-12 text-sm">No data for this period</p>}
          </TabsContent>

          {/* ── AePS ── */}
          <TabsContent value="aeps" className="space-y-4 mt-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 flex-1">
                <Label className="text-sm text-muted-foreground whitespace-nowrap">From</Label>
                <Input type="date" value={aepsStart} onChange={(e) => setAepsStart(e.target.value)} className="h-9 text-sm flex-1 sm:w-44 sm:flex-none" />
              </div>
              <div className="flex items-center gap-2 flex-1">
                <Label className="text-sm text-muted-foreground whitespace-nowrap">To</Label>
                <Input type="date" value={aepsEnd} onChange={(e) => setAepsEnd(e.target.value)} className="h-9 text-sm flex-1 sm:w-44 sm:flex-none" />
              </div>
              <Button asChild size="sm" variant="outline" className="h-9 self-start sm:self-auto">
                <a href={`${BASE}/api/reports/export?startDate=${aepsStart}&endDate=${aepsEnd}`} target="_blank">
                  <Download size={13} className="mr-1.5" />Export
                </a>
              </Button>
            </div>

            {aepsLoading ? <Skeleton className="h-48 w-full" /> : aepsReport ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                  <StatCard label="AePS Transactions" value={aepsReport.totalTransactions} isCount />
                  <StatCard label="Withdrawals" value={aepsReport.totalWithdrawals} cls="text-red-600" />
                  <StatCard label="Deposits" value={aepsReport.totalDeposits} cls="text-emerald-600" />
                  <StatCard label="Net Flow" value={aepsReport.netFlow} cls={aepsReport.netFlow >= 0 ? "text-emerald-600" : "text-red-600"} />
                </div>

                {aepsReport.dailyBreakdown?.length > 0 ? (
                  <>
                    <Card>
                      <CardHeader className="pb-2 px-4 pt-4"><CardTitle className="text-sm">Withdrawals vs Deposits</CardTitle></CardHeader>
                      <CardContent className="px-2 pb-4">
                        <ResponsiveContainer width="100%" height={180}>
                          <BarChart data={aepsReport.dailyBreakdown} margin={{ top: 0, right: 4, left: -24, bottom: 0 }}>
                            <XAxis dataKey="date" tick={{ fontSize: 9 }} tickFormatter={(v) => v.split("-")[2]} />
                            <YAxis tick={{ fontSize: 9 }} />
                            <Tooltip formatter={(v: any) => [`₹${v.toLocaleString("en-IN")}`, ""]} labelFormatter={(l) => `Date: ${l}`} />
                            <Bar dataKey="withdrawals" fill="#ef4444" name="Withdrawals" radius={[2, 2, 0, 0]} />
                            <Bar dataKey="deposits" fill="#10b981" name="Deposits" radius={[2, 2, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Mobile: card list; Desktop: table */}
                    <Card>
                      <CardHeader className="pb-2 px-4 pt-4"><CardTitle className="text-sm">Day-wise Detail</CardTitle></CardHeader>
                      <CardContent className="px-4 pb-4">
                        {/* Mobile cards */}
                        <div className="md:hidden space-y-2">
                          {aepsReport.dailyBreakdown.map((row: any) => (
                            <div key={row.date} className="border rounded-lg p-3 text-sm">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-mono text-xs font-semibold">{row.date}</span>
                                <Badge variant="secondary" className="text-xs">{row.transactions} tx</Badge>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div>
                                  <p className="text-muted-foreground">Withdrawal</p>
                                  <p className="font-semibold text-red-600">₹{row.withdrawals.toLocaleString("en-IN")}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Deposit</p>
                                  <p className="font-semibold text-emerald-600">₹{row.deposits.toLocaleString("en-IN")}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Net Flow</p>
                                  <p className={`font-semibold ${row.netFlow >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                                    ₹{row.netFlow.toLocaleString("en-IN")}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* Desktop table */}
                        <div className="hidden md:block overflow-x-auto">
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
                                  <td className="py-2 pr-4 text-right"><Badge variant="secondary" className="text-xs">{row.transactions}</Badge></td>
                                  <td className={`py-2 text-right font-semibold ${row.netFlow >= 0 ? "text-emerald-600" : "text-red-600"}`}>{formatINR(row.netFlow)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <p className="text-center text-muted-foreground py-10 text-sm">No AePS transactions in this date range</p>
                )}
              </>
            ) : <p className="text-center text-muted-foreground py-12 text-sm">No AePS data found</p>}
          </TabsContent>

          {/* ── Services ── */}
          <TabsContent value="services" className="space-y-4 mt-4">
            {/* Mobile: stacked; Desktop: side by side */}
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader className="pb-2 px-4 pt-4"><CardTitle className="text-sm">Revenue by Service</CardTitle></CardHeader>
                <CardContent className="px-2 pb-4">
                  {!breakdown?.length ? (
                    <p className="text-center text-muted-foreground py-10 text-sm">No data yet</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={breakdown} dataKey="revenue" nameKey="serviceType" cx="50%" cy="50%" outerRadius={75}>
                          {breakdown?.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v: any) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2 px-4 pt-4"><CardTitle className="text-sm">Service Details</CardTitle></CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="space-y-2.5">
                    {breakdown?.map((s: any, i: number) => (
                      <div key={s.serviceType} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                          <span className="truncate text-xs md:text-sm">{s.serviceType}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <Badge variant="secondary" className="text-xs">{s.count}tx</Badge>
                          <span className="font-semibold text-xs md:text-sm">{formatINR(s.revenue)}</span>
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
