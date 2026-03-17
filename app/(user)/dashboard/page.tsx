import { verifySession } from "@/app/lib/dal";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/app/components/stat-card";
import { UsageChart } from "@/app/components/usage-chart";

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
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Monitor your API usage.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="API Keys" value={keyCount} />
        <StatCard label="Requests (24h)" value={requests24h} />
        <StatCard label="Requests (7d)" value={requests7d} />
      </div>

      <UsageChart />
    </div>
  );
}
