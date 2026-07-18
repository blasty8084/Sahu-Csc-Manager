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
      className="bg-white rounded-2xl px-4 py-3 flex items-center gap-2"
      style={{ boxShadow: "0 2px 10px rgba(11,44,96,0.07)" }}
    >
      <button
        type="button"
        onClick={() => setSelectedDate(shiftDate(selectedDate, -1))}
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-slate-100"
        style={{ color: "#0b2c60" }}
      >
        <ChevronLeft size={18} />
      </button>

      <div className="flex-1 flex items-center justify-center gap-2 min-w-0">
        <CalendarDays size={14} style={{ color: "#94a3b8", flexShrink: 0 }} />
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="h-8 text-sm text-center border-0 shadow-none bg-transparent p-0 focus-visible:ring-0 w-36"
          style={{ color: "#0b2c60", fontWeight: 700 }}
        />
        {isToday && (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(249,115,22,0.12)", color: "#f97316" }}
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
        style={{ color: "#0b2c60" }}
      >
        <ChevronRight size={18} />
      </button>

      {!isToday && (
        <button
          type="button"
          onClick={() => setSelectedDate(todayStr())}
          className="text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors"
          style={{ background: "rgba(11,44,96,0.07)", color: "#0b2c60" }}
        >
          Today
        </button>
      )}
    </div>
  );
}
