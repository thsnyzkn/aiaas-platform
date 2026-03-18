import { verifySession } from "@/app/lib/dal";
import { prisma } from "@/lib/prisma";
import { ApiKeysClient } from "./api-keys-client";
import { PageHeader } from "@/app/components/page-header";

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
      <PageHeader
        title="API Keys"
        description="Create and manage your API keys."
      />
      <ApiKeysClient initialKeys={keys} />
    </div>
  );
}
