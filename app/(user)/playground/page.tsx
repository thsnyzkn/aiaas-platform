import { verifySession } from "@/app/lib/dal";
import { prisma } from "@/lib/prisma";
import { PlaygroundClient } from "./playground-client";

export default async function PlaygroundPage() {
  const session = await verifySession();

  const keys = await prisma.apiKey.findMany({
    where: { userId: session.userId, isActive: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, key: true, name: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          API Playground
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Test AI endpoints with your API keys.
        </p>
      </div>
      <PlaygroundClient keys={keys} />
    </div>
  );
}
