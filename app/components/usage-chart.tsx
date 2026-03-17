"use client";

import useSWR from "swr";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function UsageChart() {
  const { data, isLoading } = useSWR("/api/stats?range=7d", fetcher, {
    refreshInterval: 30_000,
  });

  const chart: { date: string; success: number; error: number }[] =
    data?.data ?? [];

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm text-zinc-400">Loading chart...</p>
      </div>
    );
  }

  if (chart.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm text-zinc-400">No usage data yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="mb-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Requests (Last 7 Days)
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chart}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: "#a1a1aa" }}
            tickFormatter={(v: string) => v.slice(5)}
          />
          <YAxis tick={{ fontSize: 12, fill: "#a1a1aa" }} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#18181b",
              border: "1px solid #3f3f46",
              borderRadius: 6,
              fontSize: 12,
            }}
            labelStyle={{ color: "#a1a1aa" }}
          />
          <Bar dataKey="success" fill="#10b981" radius={[3, 3, 0, 0]} />
          <Bar dataKey="error" fill="#ef4444" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
