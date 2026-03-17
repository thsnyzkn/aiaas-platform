import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 50;

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const [logs, total] = await Promise.all([
    prisma.usageLog.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      select: {
        id: true,
        endpoint: true,
        statusCode: true,
        latencyMs: true,
        createdAt: true,
        apiKey: {
          select: {
            name: true,
            user: { select: { email: true } },
          },
        },
      },
    }),
    prisma.usageLog.count(),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Usage Logs
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {total} total log entries.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Time</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Endpoint</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Status</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Latency</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Key</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">User</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {logs.map((log) => (
              <tr key={log.id} className="bg-white dark:bg-zinc-900/50">
                <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-900 dark:text-zinc-100">
                  {log.endpoint}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    log.statusCode === 200
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                      : log.statusCode === 429
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                        : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400"
                  }`}>
                    {log.statusCode}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{log.latencyMs}ms</td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{log.apiKey.name}</td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{log.apiKey.user.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`/admin/logs?page=${page - 1}`}
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Previous
              </a>
            )}
            {page < totalPages && (
              <a
                href={`/admin/logs?page=${page + 1}`}
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
