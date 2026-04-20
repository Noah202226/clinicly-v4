"use client";

import { useAnalyticsStore } from "@/app/store/analytics-store";
import { RevenueLineChart } from "../components/charts/revenue-line-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RevenueSection() {
  const { charts } = useAnalyticsStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Trend ({charts.revenueByDay.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <RevenueLineChart data={charts.revenueByDay} />
      </CardContent>
    </Card>
  );
}
