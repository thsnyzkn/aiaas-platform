import { prisma } from "@/lib/prisma";
import { StatCard } from "@/app/components/stat-card";
import { AdminCharts } from "@/app/components/admin-charts";

export default async function AdminDashboardPage() {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [userCount, keyCount, logCount24h] = await Promise.all([
    prisma.user.count(),
    prisma.apiKey.count(),
    prisma.usageLog.count({ where: { createdAt: { gte: oneDayAgo } } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Admin Dashboard
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Platform-wide overview.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Users" value={userCount} />
        <StatCard label="Total API Keys" value={keyCount} />
        <StatCard label="Requests (24h)" value={logCount24h} />
      </div>

      <AdminCharts />
    </div>
  );
}
