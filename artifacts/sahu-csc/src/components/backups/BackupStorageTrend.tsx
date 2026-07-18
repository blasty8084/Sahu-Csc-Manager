import { TrendingUp } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { NavyCard, CardHead } from "@/components/backups/BackupCards";
import { formatSize } from "@/hooks/useBackups";

interface ChartPoint { date: string; sizeKB: number; totalKB: number; type: string; }

interface BackupStorageTrendProps {
  backups: any[] | undefined;
  chartData: ChartPoint[];
  totalSize: number;
}

/** Storage Trend area chart — cumulative backup size over time, auto vs manual breakdown. */
export function BackupStorageTrend({ backups, chartData, totalSize }: BackupStorageTrendProps) {
  const count = backups?.length ?? 0;
  if (count === 0) return null;
  return (
    <NavyCard>
      <CardHead
        icon={<TrendingUp size={16} />}
        title="Storage Trend"
        description={`Cumulative backup storage · ${formatSize(totalSize)} across ${count} snapshot${count !== 1 ? "s" : ""}`}
      />
      <div className="px-4 pb-5 pt-2">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#0b2c60] inline-block" />
            <span className="text-xs text-slate-500">Snapshot size (KB)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#f97316] inline-block" />
            <span className="text-xs text-slate-500">Cumulative storage (KB)</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradSize" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0b2c60" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#0b2c60" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v} KB`} width={62} />
            <Tooltip
              contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
              formatter={(value: number, name: string) => [`${value} KB`, name === "sizeKB" ? "Snapshot size" : "Cumulative storage"]}
              labelStyle={{ fontWeight: 600, color: "#0b2c60", marginBottom: 4 }}
            />
            <Area type="monotone" dataKey="sizeKB" stroke="#0b2c60" strokeWidth={2} fill="url(#gradSize)" dot={{ r: 3, fill: "#0b2c60", strokeWidth: 0 }} activeDot={{ r: 5, fill: "#0b2c60" }} />
            <Area type="monotone" dataKey="totalKB" stroke="#f97316" strokeWidth={2} fill="url(#gradTotal)" dot={{ r: 3, fill: "#f97316", strokeWidth: 0 }} activeDot={{ r: 5, fill: "#f97316" }} />
          </AreaChart>
        </ResponsiveContainer>

        <div className="mt-4 flex items-center gap-3 flex-wrap">
          <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">Breakdown:</span>
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            {chartData.filter((d) => d.type === "auto").length} auto
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-600">
            <span className="w-2 h-2 rounded-full bg-[#0b2c60] inline-block" />
            {chartData.filter((d) => d.type === "manual").length} manual
          </span>
          <span className="text-[11px] text-slate-400">·</span>
          <span className="text-[11px] text-slate-600">Avg size: {formatSize(totalSize / (backups?.length || 1))}</span>
          <span className="text-[11px] text-slate-600">· Latest: {chartData.length ? `${chartData[chartData.length - 1].sizeKB} KB` : "—"}</span>
        </div>
      </div>
    </NavyCard>
  );
}
