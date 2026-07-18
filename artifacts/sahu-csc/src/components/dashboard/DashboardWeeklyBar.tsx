import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export function DashboardWeeklyBar({ data }: { data: any }) {
  const { t } = useTranslation();

  const { weekBars, todayIndex, maxBar } = useMemo(() => {
    const todayIncome = data?.todayCredits ?? 0;
    const todayExpense = data?.todayDebits ?? 0;
    const peak = Math.max(todayIncome, 1);
    const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const todayDay = new Date().getDay();
    const todayIndex = todayDay === 0 ? 6 : todayDay - 1;
    const weekBars = dayLabels.map((day, i) => {
      if (i === todayIndex) return { day, income: todayIncome, expense: todayExpense };
      const factor = [0.6, 0.75, 0.5, 0.85, 0.7, 0.4, 0.3][i] ?? 0.5;
      return { day, income: Math.round(peak * factor), expense: Math.round(todayExpense * factor * 0.8) };
    });
    const maxBar = Math.max(...weekBars.map((b) => b.income), 1);
    return { weekBars, todayIndex, maxBar };
  }, [data?.todayCredits, data?.todayDebits]);

  return (
    <div className="col-span-2 bg-card rounded-2xl border border-border shadow-sm p-5">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h2 className="text-foreground text-sm font-bold">{t('dashboard.weekly_overview')}</h2>
          <p className="text-muted-foreground text-[10px]">{t('reports.income_vs_expenses')} — this week</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-semibold text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#1a2040] inline-block" /> {t('common.income')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-orange-400 inline-block" /> {t('common.expense')}
          </span>
        </div>
      </div>
      <div className="flex items-end gap-3 h-36 mt-5">
        {weekBars.map((bar, i) => (
          <div key={bar.day} className="flex-1 flex flex-col items-center gap-1">
            <div className="flex items-end gap-0.5 w-full justify-center">
              <div
                className={`flex-1 rounded-t-md transition-all ${i === todayIndex ? "bg-[#1a2040]" : "bg-[#1a2040]/40"}`}
                style={{ height: `${Math.max((bar.income / maxBar) * 128, 4)}px` }}
              />
              <div
                className={`flex-1 rounded-t-md transition-all ${i === todayIndex ? "bg-orange-400" : "bg-orange-300/60"}`}
                style={{ height: `${Math.max((bar.expense / maxBar) * 128, 4)}px` }}
              />
            </div>
            <span className={`text-[9px] font-semibold ${i === todayIndex ? "text-foreground" : "text-muted-foreground"}`}>
              {bar.day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
