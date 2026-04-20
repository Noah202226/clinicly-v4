"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = {
  Completed: "#22c55e",
  Cancelled: "#ef4444",
  Pending: "#facc15",
  Scheduled: "#3b82f6",
};

interface AppointmentPieChartProps {
  data: {
    status: string;
    count: number;
  }[];
}

export function AppointmentPieChart({ data }: AppointmentPieChartProps) {
  if (!data.length)
    return (
      <div className="h-[200px] flex items-center justify-center text-[11px] text-slate-400">
        No data
      </div>
    );

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={45}
          outerRadius={70}
          paddingAngle={5}
          dataKey="count"
          nameKey="status"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[entry.status as keyof typeof COLORS] || "#94a3b8"}
              stroke="none"
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            borderRadius: "10px",
            border: "none",
            fontSize: "12px",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
          formatter={(value) => (
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              {value}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
