import { Bell, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BroadcastStats } from "./broadcastTypes";

function StatCard({ icon: Icon, label, value, accent }: {
  icon: React.ElementType; label: string; value: number | string; accent: string;
}) {
  return (
    <div className="rounded-2xl bg-white border border-slate-100 p-4 flex items-center gap-3"
      style={{ boxShadow: "0 2px 8px rgba(11,44,96,0.06)" }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: accent }}>
        <Icon size={18} color="#fff" />
      </div>
      <div>
        <p className="text-2xl font-black text-slate-800 leading-none">{value}</p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

interface BroadcastStatsBarProps {
  stats: BroadcastStats | undefined;
  statsLoading: boolean;
}

export function BroadcastStatsBar({ stats, statsLoading }: BroadcastStatsBarProps) {
  const { t } = useTranslation();

  if (statsLoading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[0, 1].map((i) => <div key={i} className="rounded-2xl bg-white h-16 animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard
        icon={Bell}
        label={t("broadcast.push_subscribers")}
        value={stats?.pushSubscribers ?? 0}
        accent="linear-gradient(135deg,#7c3aed,#a855f7)"
      />
      <StatCard
        icon={Users}
        label={t("broadcast.active_users")}
        value={stats?.activeUsers ?? 0}
        accent="linear-gradient(135deg,#0b2c60,#1e4da1)"
      />
    </div>
  );
}
