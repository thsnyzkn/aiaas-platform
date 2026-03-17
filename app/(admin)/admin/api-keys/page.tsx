import { prisma } from "@/lib/prisma";
import { AdminKeysClient } from "./admin-keys-client";

export default async function AdminApiKeysPage() {
  const keys = await prisma.apiKey.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      key: true,
      name: true,
      isActive: true,
      requestLimitPerMin: true,
      createdAt: true,
      user: { select: { email: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          API Keys
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          All API keys across the platform.
        </p>
      </div>
      <AdminKeysClient initialKeys={keys} />
    </div>
  );
}
