import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/app/components/status-badge";
import { EmptyState } from "@/app/components/empty-state";
import { PageHeader } from "@/app/components/page-header";

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
          <div className="grid gap-4 md:hidden">
            {users.map((u) => (
              <article
                key={u.id}
                className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
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
              </article>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <caption className="sr-only">
                  All registered users with role, API key count, and join date.
                </caption>
                <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/60">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Email</th>
                    <th scope="col" className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Role</th>
                    <th scope="col" className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">API keys</th>
                    <th scope="col" className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {users.map((u) => (
                    <tr key={u.id} className="bg-white dark:bg-zinc-900/50">
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
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
