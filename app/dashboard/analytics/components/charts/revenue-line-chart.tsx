"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface RevenueLineChartProps {
  data: {
    date: string;
    total: number;
  }[];
}

export function RevenueLineChart({ data }: RevenueLineChartProps) {
  if (!data.length) {
    return (
      <div className="h-[200px] flex items-center justify-center text-[11px] text-slate-400 bg-slate-50/50 rounded-xl border border-dashed">
        No revenue data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#f1f5f9"
        />
        <XAxis
          dataKey="date"
          hide // Keeps it clean for the tight dashboard layout
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `₱${v >= 1000 ? v / 1000 + "k" : v}`}
        />
        <Tooltip
          contentStyle={{
            borderRadius: "12px",
            border: "none",
            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
            fontSize: "12px",
          }}
          formatter={(v: number) => [`₱${v.toLocaleString()}`, "Revenue"]}
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke="#16a34a"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorRevenue)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
