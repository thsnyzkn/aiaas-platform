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

export function AdminCharts() {
  const { data, error, isLoading } = useSWR("/api/admin/stats", fetcher, {
    refreshInterval: 30_000,
  });

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900" />
        <div className="space-y-6">
          <div className="h-28 animate-pulse rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900" />
          <div className="h-28 animate-pulse rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900" />
        </div>
      </div>
    );
  }

  if (error || data?.error) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Admin analytics unavailable
        </p>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          The dashboard charts could not be loaded right now.
        </p>
      </div>
    );
  }

  const stats = data?.data;
  if (!stats) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="mb-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Endpoint usage (last 7 days)
        </p>
        {stats.usageOverTime.length === 0 ? (
          <p className="py-16 text-center text-sm text-zinc-400">No data</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.usageOverTime}>
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
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Top used endpoints
          </p>
          {stats.topEndpoints.length === 0 ? (
            <p className="text-sm text-zinc-400">No data</p>
          ) : (
            <div className="space-y-2">
              {stats.topEndpoints.map((e: { endpoint: string; count: number }) => (
                <div key={e.endpoint} className="flex items-center justify-between">
                  <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
                    {e.endpoint}
                  </span>
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {e.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Top API users
          </p>
          {stats.topUsers.length === 0 ? (
            <p className="text-sm text-zinc-400">No data</p>
          ) : (
            <div className="space-y-2">
              {stats.topUsers.map((u: { email: string; count: number }) => (
                <div key={u.email} className="flex items-center justify-between">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {u.email}
                  </span>
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {u.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
