import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/app/components/status-badge";
import { EmptyState } from "@/app/components/empty-state";
import { PageHeader } from "@/app/components/page-header";
import {
  DesktopDataTable,
  MobileDataCard,
  MobileDataList,
  dataTableBodyClassName,
  dataTableHeadCellClassName,
  dataTableHeadClassName,
  dataTableRowClassName,
} from "@/app/components/data-table-shell";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { apiKeys: true } },
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Review all registered users, their roles, and how many keys they currently own."
      />

      {users.length === 0 ? (
        <EmptyState
          title="No users found"
          description="Users will appear here once accounts are created."
        />
      ) : (
        <>
          <MobileDataList>
            {users.map((u) => (
              <MobileDataCard key={u.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                      {u.email}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      Joined {new Date(u.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge
                    tone={u.role === "ADMIN" ? "admin" : "neutral"}
                    label={u.role}
                  />
                </div>
                <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
                  API keys: {u._count.apiKeys}
                </p>
              </MobileDataCard>
            ))}
          </MobileDataList>

          <DesktopDataTable caption="All registered users with role, API key count, and join date.">
            <thead className={dataTableHeadClassName}>
              <tr>
                <th scope="col" className={dataTableHeadCellClassName}>Email</th>
                <th scope="col" className={dataTableHeadCellClassName}>Role</th>
                <th scope="col" className={dataTableHeadCellClassName}>API keys</th>
                <th scope="col" className={dataTableHeadCellClassName}>Joined</th>
              </tr>
            </thead>
            <tbody className={dataTableBodyClassName}>
              {users.map((u) => (
                <tr key={u.id} className={dataTableRowClassName}>
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{u.email}</td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      tone={u.role === "ADMIN" ? "admin" : "neutral"}
                      label={u.role}
                    />
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{u._count.apiKeys}</td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </DesktopDataTable>
        </>
      )}
    </div>
  );
}
