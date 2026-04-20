"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
  Cell,
} from "recharts";

interface ServiceBarChartProps {
  data: {
    name: string;
    total: number;
  }[];
}

export function ServiceBarChart({ data }: ServiceBarChartProps) {
  if (!data.length) {
    return (
      <div className="h-[200px] flex items-center justify-center text-muted-foreground bg-slate-50/50 rounded-xl border border-dashed">
        No service data available
      </div>
    );
  }

  // Sort and take top 5 for clarity
  const chartData = [...data].sort((a, b) => b.total - a.total).slice(0, 5);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={chartData}
        layout="horizontal" // Changed to horizontal for "pataas" bars
        margin={{ top: 25, right: 10, left: -20, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false} // Only horizontal lines for vertical charts
          stroke="#f1f5f9"
        />

        {/* XAxis now shows the names at the bottom */}
        <XAxis
          dataKey="name"
          type="category"
          tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }}
          axisLine={false}
          tickLine={false}
          interval={0} // Ensures all names show if space permits
        />

        {/* YAxis shows the scale (hidden to keep it clean like your other charts) */}
        <YAxis type="number" hide />

        <Tooltip
          cursor={{ fill: "#f8fafc" }}
          contentStyle={{
            borderRadius: "12px",
            border: "none",
            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
            fontSize: "12px",
          }}
          formatter={(value: number) => `₱${value.toLocaleString()}`}
        />

        <Bar dataKey="total" radius={[4, 4, 0, 0]} barSize={30}>
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={index === 0 ? "#2563eb" : "#3b82f6"}
            />
          ))}
          {/* LabelList at the top ("position top") for the pataas look */}
          <LabelList
            dataKey="total"
            position="top"
            formatter={(value: number) => `₱${value.toLocaleString()}`}
            style={{ fill: "#1e293b", fontSize: "10px", fontWeight: "bold" }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
