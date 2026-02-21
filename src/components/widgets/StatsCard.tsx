"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { StatsCardData } from "@/lib/tools";

export default function StatsCard({ title, metrics, chartData }: StatsCardData) {
  return (
    <div className="p-4 flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((m, i) => (
          <div key={i} className="bg-accent/30 rounded-lg p-2.5">
            <p className="text-xs text-muted-foreground">{m.label}</p>
            <p className="text-lg font-bold text-foreground">
              {m.value}
              {m.unit && (
                <span className="text-xs font-normal text-muted-foreground ml-1">
                  {m.unit}
                </span>
              )}
            </p>
          </div>
        ))}
      </div>
      {chartData && chartData.length > 0 && (
        <div className="h-[120px] mt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid hsl(var(--border))",
                }}
              />
              <Bar
                dataKey="value"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
