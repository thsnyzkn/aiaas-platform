import { prisma } from "@/lib/prisma";
import { StatCard } from "@/app/components/stat-card";
import { AdminCharts } from "@/app/components/admin-charts";
import { PageHeader } from "@/app/components/page-header";

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
      <PageHeader
        title="Admin Dashboard"
        description="Track overall usage, top API users, and the endpoints getting the most traffic."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Users" value={userCount} />
        <StatCard label="Total API Keys" value={keyCount} />
        <StatCard label="Requests (24h)" value={logCount24h} />
      </div>

      <AdminCharts />
    </div>
  );
}
