import { prisma } from "@/lib/prisma";
import { AdminKeysClient } from "./admin-keys-client";
import { PageHeader } from "@/app/components/page-header";

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
      <PageHeader
        title="API Keys"
        description="All API keys across the platform."
      />
      <AdminKeysClient initialKeys={keys} />
    </div>
  );
}
