import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/app/components/status-badge";
import { EmptyState } from "@/app/components/empty-state";
import { PageHeader } from "@/app/components/page-header";
import { LinkButton } from "@/app/components/button";
import {
  DesktopDataTable,
  MobileDataCard,
  MobileDataList,
  dataTableBodyClassName,
  dataTableHeadCellClassName,
  dataTableHeadClassName,
  dataTableRowClassName,
} from "@/app/components/data-table-shell";

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
      <PageHeader
        title="Usage Logs"
        description="Review request history across the platform, including endpoint, status, latency, key, and owner context."
      />

      <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        {total} total log entries
      </div>

      {logs.length === 0 ? (
        <EmptyState
          title="No usage logs found"
          description="Request activity will appear here once the API is used."
        />
      ) : (
        <>
          <MobileDataList>
            {logs.map((log) => (
              <MobileDataCard key={log.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs text-zinc-900 dark:text-zinc-100">
                      {log.endpoint}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <StatusBadge
                    tone={
                      log.statusCode === 200
                        ? "success"
                        : log.statusCode === 429
                          ? "warning"
                          : "error"
                    }
                    label={String(log.statusCode)}
                  />
                </div>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-zinc-500 dark:text-zinc-400">Latency</dt>
                    <dd className="text-zinc-900 dark:text-zinc-100">{log.latencyMs}ms</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-zinc-500 dark:text-zinc-400">Key</dt>
                    <dd className="text-right text-zinc-900 dark:text-zinc-100">
                      {log.apiKey?.name ?? "Unknown"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-zinc-500 dark:text-zinc-400">User</dt>
                    <dd className="text-right text-zinc-900 dark:text-zinc-100">
                      {log.apiKey?.user.email ?? "Unknown"}
                    </dd>
                  </div>
                </dl>
              </MobileDataCard>
            ))}
          </MobileDataList>

          <DesktopDataTable caption="Platform usage logs with endpoint, status, latency, key, and user context.">
            <thead className={dataTableHeadClassName}>
              <tr>
                <th scope="col" className={dataTableHeadCellClassName}>Time</th>
                <th scope="col" className={dataTableHeadCellClassName}>Endpoint</th>
                <th scope="col" className={dataTableHeadCellClassName}>Status</th>
                <th scope="col" className={dataTableHeadCellClassName}>Latency</th>
                <th scope="col" className={dataTableHeadCellClassName}>Key</th>
                <th scope="col" className={dataTableHeadCellClassName}>User</th>
              </tr>
            </thead>
            <tbody className={dataTableBodyClassName}>
              {logs.map((log) => (
                <tr key={log.id} className={dataTableRowClassName}>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-900 dark:text-zinc-100">
                    {log.endpoint}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      tone={
                        log.statusCode === 200
                          ? "success"
                          : log.statusCode === 429
                            ? "warning"
                            : "error"
                      }
                      label={String(log.statusCode)}
                    />
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{log.latencyMs}ms</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{log.apiKey?.name ?? "Unknown"}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{log.apiKey?.user.email ?? "Unknown"}</td>
                </tr>
              ))}
            </tbody>
          </DesktopDataTable>
        </>
      )}

      {totalPages > 1 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <LinkButton href={`/admin/logs?page=${page - 1}`} variant="secondary" size="sm">
                Previous
              </LinkButton>
            )}
            {page < totalPages && (
              <LinkButton href={`/admin/logs?page=${page + 1}`} variant="secondary" size="sm">
                Next
              </LinkButton>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
