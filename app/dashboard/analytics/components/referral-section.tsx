"use client";

import { useAnalyticsStore } from "@/app/store/analytics-store";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Share2 } from "lucide-react";

export function ReferralSection() {
  const { charts, kpis } = useAnalyticsStore();
  const data = charts.referralStats;

  return (
    <Card className="rounded-2xl border-none shadow-sm ring-1 ring-slate-200 overflow-hidden bg-white flex flex-col justify-between">
      <CardHeader className="p-4 pb-2 border-b bg-white">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <div className="bg-indigo-50 p-1.5 rounded-md">
                <Share2 className="size-4 text-indigo-600" />
              </div>
              Acquisition Channels
            </CardTitle>
            <p className="text-[11px] text-slate-500">
              Patient source breakdown
            </p>
          </div>
          <Badge
            variant="outline"
            className="bg-indigo-50 text-indigo-700 border-indigo-100 gap-1 font-bold text-[10px]"
          >
            <div className="size-1.5 rounded-full bg-indigo-500 animate-pulse" />
            Live Stats
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-3 pt-8">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 20, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f1f5f9"
            />
            <XAxis
              dataKey="source"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 10, fontWeight: 500 }}
            />
            <YAxis hide />
            <Bar
              dataKey="count"
              radius={[4, 4, 0, 0]}
              barSize={32}
              fill="#3b82f6"
            >
              <LabelList
                dataKey="count"
                position="top"
                style={{
                  fill: "#1e293b",
                  fontSize: "11px",
                  fontWeight: "bold",
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-6 flex justify-between items-center border-t border-slate-100 pt-4 px-1">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              Top Source
            </span>
            <span className="text-sm font-bold text-slate-900">
              {kpis.topReferralSource || "N/A"}
            </span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              Total Bookings
            </span>
            <span className="text-sm font-bold text-slate-900">
              {kpis.totalAppointments} Bookings
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
