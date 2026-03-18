import { verifySession } from "@/app/lib/dal";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/app/components/stat-card";
import { StatsGrid } from "@/app/components/stats-grid";
import { UsageChart } from "@/app/components/usage-chart";
import { PageHeader } from "@/app/components/page-header";

export default async function DashboardPage() {
  const session = await verifySession();

  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const userKeyIds = await prisma.apiKey.findMany({
    where: { userId: session.userId },
    select: { id: true },
  });
  const keyIds = userKeyIds.map((k) => k.id);

  const [keyCount, requests24h, requests7d] = await Promise.all([
    prisma.apiKey.count({ where: { userId: session.userId } }),
    prisma.usageLog.count({
      where: { apiKeyId: { in: keyIds }, createdAt: { gte: oneDayAgo } },
    }),
    prisma.usageLog.count({
      where: { apiKeyId: { in: keyIds }, createdAt: { gte: sevenDaysAgo } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Monitor your API usage." />

      <StatsGrid>
        <StatCard label="API Keys" value={keyCount} />
        <StatCard label="Requests (24h)" value={requests24h} />
        <StatCard label="Requests (7d)" value={requests7d} />
      </StatsGrid>

      <UsageChart />
    </div>
  );
}
