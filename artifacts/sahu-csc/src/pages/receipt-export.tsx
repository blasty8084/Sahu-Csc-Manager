import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Download,
  FileArchive,
  FileText,
  Search,
  Calendar,
  User,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Mail,
  Clock,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";

interface PreviewEntry {
  receiptNumber: string;
  date: string;
  customerName: string;
  serviceType: string;
  amount: number;
  type: "credit" | "debit";
  operator: string | null;
}

interface CountResult {
  count: number;
  entries: PreviewEntry[];
}

function MonthlyExportSection() {
  const now = new Date();
  const [triggerYear, setTriggerYear] = useState(now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear());
  const [triggerMonth, setTriggerMonth] = useState(now.getMonth() === 0 ? 12 : now.getMonth());
  const [triggering, setTriggering] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();

  const monthName = new Date(triggerYear, triggerMonth - 1, 1).toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const nextExport = (() => {
    const d = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 5, 0);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  })();

  const handleTriggerEmail = async () => {
    setTriggering(true);
    try {
      const res = await fetch("/api/admin/receipts/monthly-export/trigger", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year: triggerYear, month: triggerMonth }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to trigger export");
      }
      toast({ title: "Email sent!", description: `Monthly export for ${monthName} emailed to all admins.` });
    } catch (err: any) {
      toast({ title: "Failed to send", description: err.message, variant: "destructive" });
    } finally {
      setTriggering(false);
    }
  };

  const handleDownloadZip = async () => {
    setDownloading(true);
    try {
      const res = await fetch(
        `/api/admin/receipts/monthly-export/download?year=${triggerYear}&month=${triggerMonth}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipts-${triggerYear}-${String(triggerMonth).padStart(2, "0")}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Downloaded!", description: `ZIP for ${monthName} saved.` });
    } catch {
      toast({ title: "Download failed", variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  const months = [
    { value: 1, label: "January" }, { value: 2, label: "February" }, { value: 3, label: "March" },
    { value: 4, label: "April" }, { value: 5, label: "May" }, { value: 6, label: "June" },
    { value: 7, label: "July" }, { value: 8, label: "August" }, { value: 9, label: "September" },
    { value: 10, label: "October" }, { value: 11, label: "November" }, { value: 12, label: "December" },
  ];

  const years = Array.from({ length: 3 }, (_, i) => now.getFullYear() - i);

  return (
    <Card className="border-orange-100">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #f97316, #ea6c0a)" }}
          >
            <Clock size={15} className="text-white" />
          </div>
          <div>
            <CardTitle className="text-base">Monthly Auto-Export</CardTitle>
            <CardDescription className="text-xs">
              Runs automatically on the 1st of each month · Next: {nextExport}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-orange-50 border border-orange-100 px-3.5 py-2.5 flex items-start gap-2">
          <Mail size={13} className="text-orange-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-orange-700 leading-relaxed">
            On the 1st of every month, a ZIP of last month's receipts is automatically emailed to all admin accounts
            that have an email address set. Configure SMTP settings (
            <code className="bg-orange-100 rounded px-1">SMTP_HOST</code>,{" "}
            <code className="bg-orange-100 rounded px-1">SMTP_USER</code>,{" "}
            <code className="bg-orange-100 rounded px-1">SMTP_PASS</code>) to enable email delivery.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Month</Label>
            <Select value={String(triggerMonth)} onValueChange={(v) => setTriggerMonth(Number(v))}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Year</Label>
            <Select value={String(triggerYear)} onValueChange={(v) => setTriggerYear(Number(v))}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <p className="text-xs text-slate-500 text-center">
          Selected: <strong className="text-slate-700">{monthName}</strong>
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadZip}
            disabled={downloading}
            className="flex-1 gap-1.5 text-xs h-9"
          >
            {downloading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
            Download ZIP
          </Button>
          <Button
            size="sm"
            onClick={handleTriggerEmail}
            disabled={triggering}
            className="flex-1 gap-1.5 text-xs h-9"
            style={{ background: "linear-gradient(135deg, #0b2c60, #1a4a9e)" }}
          >
            {triggering ? <Loader2 size={12} className="animate-spin" /> : <Mail size={12} />}
            Email to Admins
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ReceiptExport() {
  const today = new Date().toISOString().split("T")[0];
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const [startDate, setStartDate] = useState(firstOfMonth);
  const [endDate, setEndDate] = useState(today);
  const [userId, setUserId] = useState("all");
  const [preview, setPreview] = useState<CountResult | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();

  const navigate = useNavigate();

  const { data: usersOverview = [] } = useQuery<any[]>({
    queryKey: ["admin", "users-overview"],
    queryFn: () => customFetch<any[]>("/api/admin/users-overview"),
  });

  const buildParams = () => {
    const p = new URLSearchParams({ startDate, endDate });
    if (userId !== "all") p.set("userId", userId);
    return p.toString();
  };

  const handlePreview = async () => {
    if (!startDate || !endDate) {
      toast({ title: "Please select both start and end dates", variant: "destructive" });
      return;
    }
    if (startDate > endDate) {
      toast({ title: "Start date must be before end date", variant: "destructive" });
      return;
    }
    setPreviewing(true);
    setPreview(null);
    try {
      const res = await fetch(`/api/admin/receipts/bulk-export/count?${buildParams()}`, {
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to fetch count");
      }
      const data: CountResult = await res.json();
      setPreview(data);
    } catch (err: unknown) {
      toast({
        title: "Preview failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setPreviewing(false);
    }
  };

  const handleDownload = async () => {
    if (!preview || preview.count === 0) return;
    setDownloading(true);
    try {
      const res = await fetch(`/api/admin/receipts/bulk-export/download?${buildParams()}`, {
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Download failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const label = `receipts-${startDate}-to-${endDate}`;
      a.download = `${label}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast({
        title: "Download started",
        description: `${preview.count} receipt PDF${preview.count !== 1 ? "s" : ""} in ZIP`,
      });
    } catch (err: unknown) {
      toast({
        title: "Download failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  const setQuickRange = (preset: "today" | "week" | "month" | "lastMonth" | "year") => {
    const now = new Date();
    let start: Date;
    let end = new Date(now);
    switch (preset) {
      case "today":
        start = new Date(now);
        break;
      case "week": {
        start = new Date(now);
        start.setDate(start.getDate() - 6);
        break;
      }
      case "month":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "lastMonth":
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case "year":
        start = new Date(now.getFullYear(), 0, 1);
        break;
    }
    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
    setPreview(null);
  };

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-5">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-slate-500 hover:text-[#0b2c60] hover:bg-slate-100 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #0b2c60, #1a4a9e)" }}
          >
            <FileArchive size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Bulk Receipt Export</h1>
            <p className="text-sm text-slate-500">
              Download all receipts for a date range as a ZIP of individual PDFs
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-6 space-y-5">
        {/* Filters card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar size={16} className="text-slate-500" />
              Select Range &amp; Filters
            </CardTitle>
            <CardDescription>Choose the date range and optional user to export receipts for</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Quick presets */}
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { label: "Today", preset: "today" },
                  { label: "Last 7 days", preset: "week" },
                  { label: "This month", preset: "month" },
                  { label: "Last month", preset: "lastMonth" },
                  { label: "This year", preset: "year" },
                ] as const
              ).map(({ label, preset }) => (
                <button
                  key={preset}
                  onClick={() => setQuickRange(preset)}
                  className="text-xs px-3 py-1.5 rounded-full border border-slate-200 hover:border-[#0b2c60] hover:text-[#0b2c60] transition-colors font-medium text-slate-600"
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Date pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="startDate" className="text-sm font-medium">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  max={endDate}
                  onChange={(e) => { setStartDate(e.target.value); setPreview(null); }}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endDate" className="text-sm font-medium">
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  min={startDate}
                  max={today}
                  onChange={(e) => { setEndDate(e.target.value); setPreview(null); }}
                />
              </div>
            </div>

            {/* User filter */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <User size={13} />
                Operator / User
              </Label>
              <Select
                value={userId}
                onValueChange={(v) => { setUserId(v); setPreview(null); }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All operators</SelectItem>
                  {usersOverview.map((u: any) => (
                    <SelectItem key={u.userId} value={String(u.userId)}>
                      {u.fullName ? `${u.fullName} (@${u.username})` : `@${u.username}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preview button */}
            <Button
              onClick={handlePreview}
              disabled={previewing || !startDate || !endDate}
              className="w-full gap-2"
              style={{ background: "#0b2c60" }}
            >
              {previewing ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Search size={15} />
              )}
              {previewing ? "Checking…" : "Preview Receipts"}
              {!previewing && <ArrowRight size={14} />}
            </Button>
          </CardContent>
        </Card>

        {/* Preview results */}
        {preview && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  {preview.count === 0 ? (
                    <AlertCircle size={16} className="text-amber-500" />
                  ) : (
                    <CheckCircle2 size={16} className="text-emerald-500" />
                  )}
                  Preview Results
                </CardTitle>
                <Badge
                  variant={preview.count === 0 ? "secondary" : "default"}
                  className={
                    preview.count > 0
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                      : ""
                  }
                >
                  {preview.count} receipt{preview.count !== 1 ? "s" : ""} found
                </Badge>
              </div>
              {preview.count > 0 && (
                <CardDescription>
                  {fmtDate(startDate)} → {fmtDate(endDate)}
                  {userId !== "all" && (() => {
                    const u = usersOverview.find((x: any) => String(x.userId) === userId) as any;
                    return u ? ` · @${u.username}` : "";
                  })()}
                </CardDescription>
              )}
            </CardHeader>

            {preview.count === 0 ? (
              <CardContent>
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-center text-sm text-amber-700">
                  No receipts with receipt numbers found for this range. Adjust the dates and try again.
                </div>
              </CardContent>
            ) : (
              <CardContent className="space-y-4">
                {/* Sample entries table */}
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    {preview.entries.length < preview.count
                      ? `Showing first ${preview.entries.length} of ${preview.count}`
                      : `All ${preview.count} receipts`}
                  </div>
                  <div className="divide-y divide-slate-100">
                    {preview.entries.map((e) => (
                      <div key={e.receiptNumber} className="flex items-center px-4 py-3 gap-3 text-sm">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{
                            background: e.type === "credit"
                              ? "rgba(5,150,105,0.1)"
                              : "rgba(225,29,72,0.1)",
                          }}>
                          <FileText
                            size={13}
                            color={e.type === "credit" ? "#059669" : "#e11d48"}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 truncate">
                            {e.receiptNumber}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {e.customerName} · {e.serviceType}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p
                            className="font-bold text-sm"
                            style={{ color: e.type === "credit" ? "#059669" : "#e11d48" }}
                          >
                            {e.type === "credit" ? "+" : "-"}₹
                            {e.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-slate-400">{fmtDate(e.date)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Info strip */}
                <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 flex items-start gap-2.5">
                  <FileArchive size={15} className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-700">
                    A ZIP file containing <strong>{preview.count} PDF receipt{preview.count !== 1 ? "s" : ""}</strong> will
                    be generated and downloaded. Each PDF is named by its receipt number (e.g.{" "}
                    <code className="bg-blue-100 rounded px-1 text-xs">
                      {preview.entries[0]?.receiptNumber ?? "CSC-2025-0001"}.pdf
                    </code>
                    ).
                  </p>
                </div>

                {/* Download button */}
                <Button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full gap-2 h-11 text-base font-semibold"
                  style={{ background: "linear-gradient(135deg, #f97316, #ea6c0a)" }}
                >
                  {downloading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Generating ZIP…
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      Download {preview.count} PDF{preview.count !== 1 ? "s" : ""} as ZIP
                    </>
                  )}
                </Button>
              </CardContent>
            )}
          </Card>
        )}

        {/* Help card */}
        {!preview && (
          <Card className="border-dashed">
            <CardContent className="pt-5 pb-5">
              <div className="flex flex-col items-center text-center gap-2 text-slate-400">
                <FileArchive size={32} className="opacity-40" />
                <p className="text-sm font-medium text-slate-500">How it works</p>
                <ol className="text-xs text-slate-400 space-y-1 text-left list-none">
                  <li className="flex gap-2"><span className="font-bold text-[#0b2c60]">1.</span> Choose a date range and optional operator filter</li>
                  <li className="flex gap-2"><span className="font-bold text-[#0b2c60]">2.</span> Click <em>Preview Receipts</em> to see how many receipts will be exported</li>
                  <li className="flex gap-2"><span className="font-bold text-[#0b2c60]">3.</span> Click <em>Download as ZIP</em> — each receipt is a separate named PDF</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Monthly auto-export section */}
        <MonthlyExportSection />
      </div>
    </div>
  );
}
