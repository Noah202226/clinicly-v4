"use client";

import { useAnalyticsStore } from "@/app/store/analytics-store";
import { useBranchStore } from "@/app/store/branch-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";

const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

// Dynamic Year List (Current Year back to 2024)
const currentYearNum = new Date().getFullYear();
const YEARS = Array.from({ length: currentYearNum - 2024 + 1 }, (_, i) => ({
  value: String(currentYearNum - i),
  label: String(currentYearNum - i),
}));

export function AnalyticsHeader() {
  const { currentBranchId } = useBranchStore();
  const { fetchAnalytics, selectedMonth, selectedYear } = useAnalyticsStore();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Analytics Overview
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          Performance tracking for{" "}
          {currentBranchId ? "current branch" : "all branches"}
        </p>
      </div>

      <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl ring-1 ring-slate-200 shadow-sm">
        <div className="bg-slate-50 p-2 rounded-xl">
          <Calendar className="size-4 text-slate-500" />
        </div>

        <div className="flex items-center gap-1 px-2">
          {/* MONTH SELECT */}
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase ml-1">
              Month
            </span>
            <Select
              value={selectedMonth}
              onValueChange={(m) =>
                fetchAnalytics(currentBranchId || "", m, selectedYear)
              }
            >
              <SelectTrigger className="h-7 border-none p-0 focus:ring-0 text-sm font-bold text-slate-900 w-[60px] shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {MONTHS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="h-8 w-px bg-slate-100 mx-1" />

          {/* YEAR SELECT */}
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase ml-1">
              Year
            </span>
            <Select
              value={selectedYear}
              onValueChange={(y) =>
                fetchAnalytics(currentBranchId || "", selectedMonth, y)
              }
            >
              <SelectTrigger className="h-7 border-none p-0 focus:ring-0 text-sm font-bold text-slate-900 w-[70px] shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {YEARS.map((y) => (
                  <SelectItem key={y.value} value={y.value}>
                    {y.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
