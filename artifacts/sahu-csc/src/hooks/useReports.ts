import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useGetDailyReport, useGetMonthlyReport, useGetServiceBreakdown } from "@workspace/api-client-react";

export const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const PIE_COLORS = [
  "#0b2c60", "#f97316", "#10b981", "#8b5cf6",
  "#ef4444", "#06b6d4", "#f59e0b", "#ec4899",
];

export function formatINR(n: number) {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

export function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

// ── Shared filter state ───────────────────────────────────────────────────────
export function useFilterState() {
  const today = new Date().toISOString().split("T")[0];
  const now = new Date();
  const [dailyDate, setDailyDate] = useState(today);
  const [reportYear, setReportYear] = useState(now.getFullYear());
  const [reportMonth, setReportMonth] = useState(now.getMonth() + 1);
  const [aepsStart, setAepsStart] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`,
  );
  const [aepsEnd, setAepsEnd] = useState(today);
  const monthStart = `${reportYear}-${String(reportMonth).padStart(2, "0")}-01`;
  const lastDay = new Date(reportYear, reportMonth, 0).getDate();
  const monthEnd = `${reportYear}-${String(reportMonth).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return {
    dailyDate, setDailyDate,
    reportYear, setReportYear,
    reportMonth, setReportMonth,
    aepsStart, setAepsStart,
    aepsEnd, setAepsEnd,
    monthStart, monthEnd,
  };
}

export type FilterState = ReturnType<typeof useFilterState>;

// ── Shared data hook ─────────────────────────────────────────────────────────
export function useReportsData(
  dailyDate: string,
  reportYear: number,
  reportMonth: number,
  aepsStart: string,
  aepsEnd: string,
) {
  const daily = useGetDailyReport({ date: dailyDate }) as { data: any; isLoading: boolean };
  const monthly = useGetMonthlyReport({ year: reportYear, month: reportMonth }) as { data: any; isLoading: boolean };
  const breakdown = useGetServiceBreakdown({}) as { data: any };
  const aepsReport = useQuery<any>({
    queryKey: ["reports", "aeps", aepsStart, aepsEnd],
    queryFn: async () => {
      const res = await fetch(
        `${BASE}/api/reports/aeps?startDate=${aepsStart}&endDate=${aepsEnd}`,
        { credentials: "include" },
      );
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });
  return { daily, monthly, breakdown, aepsReport };
}
