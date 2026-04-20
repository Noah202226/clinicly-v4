"use client";

import { useAnalyticsStore } from "@/app/store/analytics-store";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarRange } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  Completed: "#22c55e",
  Cancelled: "#ef4444",
  Pending: "#facc15",
  Scheduled: "#3b82f6",
  APPROVED: "#3b82f6",
};

export function AppointmentSection() {
  const { charts } = useAnalyticsStore();
  const data = charts.appointmentStatus;
  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <Card className="rounded-2xl border-none shadow-sm ring-1 ring-slate-200 overflow-hidden bg-white flex flex-col justify-between">
      {/* HEADER - Identical to Service Section */}
      <CardHeader className="p-4 pb-2 border-b bg-white">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <div className="bg-emerald-50 p-1.5 rounded-md">
                <CalendarRange className="size-4 text-emerald-600" />
              </div>
              Appointments
            </CardTitle>
            <p className="text-[11px] text-slate-500">Status breakdown</p>
          </div>
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-100 gap-1 font-bold text-[10px]"
          >
            {total} Total
          </Badge>
        </div>
      </CardHeader>

      {/* CONTENT - Standardized Height */}
      <CardContent className="p-3 pt-6">
        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50} // Creates the donut look
                outerRadius={70}
                paddingAngle={5}
                dataKey="count"
                nameKey="status"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={STATUS_COLORS[entry.status] || "#94a3b8"}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  fontSize: "12px",
                }}
              />
              <Legend
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                formatter={(value) => (
                  <span className="text-[10px] font-medium text-slate-600 uppercase ml-1">
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* FOOTER - Identical to Service Section */}
        <div className="mt-6 flex justify-between items-center border-t border-slate-100 pt-4 px-1">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              Status Overview
            </span>
            <span className="text-sm font-bold text-slate-900">
              Active Tracking
            </span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              Update Frequency
            </span>
            <span className="text-sm font-bold text-slate-900">Real-time</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
