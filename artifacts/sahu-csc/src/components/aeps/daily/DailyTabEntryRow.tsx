import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { shiftDate, todayStr } from "@/pages/aeps/aeps.constants";

interface DailyTabEntryRowProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  isToday: boolean;
}

/** Date navigator row — prev/next arrows, date input, Today badge + jump button. */
export function DailyTabEntryRow({ selectedDate, setSelectedDate, isToday }: DailyTabEntryRowProps) {
  return (
    <div
      className="bg-white dark:bg-zinc-800 rounded-2xl px-4 py-3 flex items-center gap-2"
      style={{ boxShadow: "0 2px 10px var(--brand-navy-tint-md)" }}
    >
      <button
        type="button"
        onClick={() => setSelectedDate(shiftDate(selectedDate, -1))}
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-slate-100"
        style={{ color: "var(--brand-navy-800)" }}
      >
        <ChevronLeft size={18} />
      </button>

      <div className="flex-1 flex items-center justify-center gap-2 min-w-0">
        <CalendarDays size={14} style={{ color: "var(--color-slate-400)", flexShrink: 0 }} />
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="h-8 text-sm text-center border-0 shadow-none bg-transparent p-0 focus-visible:ring-0 w-36"
          style={{ color: "var(--brand-navy-800)", fontWeight: 700 }}
        />
        {isToday && (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: "var(--brand-orange-tint-sm)", color: "var(--brand-orange)" }}
          >
            TODAY
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => setSelectedDate(shiftDate(selectedDate, 1))}
        disabled={selectedDate >= todayStr()}
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
        style={{ color: "var(--brand-navy-800)" }}
      >
        <ChevronRight size={18} />
      </button>

      {!isToday && (
        <button
          type="button"
          onClick={() => setSelectedDate(todayStr())}
          className="text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors"
          style={{ background: "var(--brand-navy-tint-md)", color: "var(--brand-navy-800)" }}
        >
          Today
        </button>
      )}
    </div>
  );
}
