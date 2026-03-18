import { verifySession } from "@/app/lib/dal";
import { prisma } from "@/lib/prisma";
import { PlaygroundClient } from "./playground-client";
import { PageHeader } from "@/app/components/page-header";

export default async function PlaygroundPage() {
  const session = await verifySession();

  const keys = await prisma.apiKey.findMany({
    where: { userId: session.userId, isActive: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, key: true, name: true },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="API Playground"
        description="Test AI endpoints with your API keys."
      />
      <PlaygroundClient keys={keys} />
    </div>
  );
}
