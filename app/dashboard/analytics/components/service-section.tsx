"use client";

import { useAnalyticsStore } from "@/app/store/analytics-store";
import { ServiceBarChart } from "../components/charts/service-bar-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp } from "lucide-react";

export function ServiceSection() {
  const { charts } = useAnalyticsStore();

  return (
    <Card className="rounded-2xl border-none shadow-sm ring-1 ring-slate-200 overflow-hidden bg-white flex flex-col justify-between">
      {/* HEADER - Unified Style */}
      <CardHeader className="p-4 pb-2 border-b bg-white">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <div className="bg-blue-50 p-1.5 rounded-md">
                <BarChart3 className="size-4 text-blue-600" />
              </div>
              Service Performance
            </CardTitle>
            <p className="text-[11px] text-slate-500">Revenue by category</p>
          </div>
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-100 gap-1 font-bold text-[10px]"
          >
            <TrendingUp className="size-3" />
            Live Stats
          </Badge>
        </div>
      </CardHeader>

      {/* CONTENT - Standardized Padding & Chart Height */}
      <CardContent className="p-3 pt-8">
        <div className="h-[180px] w-full">
          <ServiceBarChart data={charts.topServices} />
        </div>

        {/* FOOTER - Unified Split Layout */}
        <div className="mt-6 flex justify-between items-center border-t border-slate-100 pt-4 px-1">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Highest Earner
            </span>
            <span className="text-sm font-bold text-slate-900">
              {charts.topServices[0]?.name || "N/A"}
            </span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Active Services
            </span>
            <span className="text-sm font-bold text-slate-900">
              {charts.topServices.length} Categories
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
