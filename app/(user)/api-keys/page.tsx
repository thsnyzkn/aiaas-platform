import { verifySession } from "@/app/lib/dal";
import { prisma } from "@/lib/prisma";
import { ApiKeysClient } from "./api-keys-client";

export default async function ApiKeysPage() {
  const session = await verifySession();

  const keys = await prisma.apiKey.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      key: true,
      name: true,
      isActive: true,
      requestLimitPerMin: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          API Keys
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Create and manage your API keys.
        </p>
      </div>
      <ApiKeysClient initialKeys={keys} />
    </div>
  );
}
