import { prisma } from "@/lib/prisma";

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
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Users
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          All registered users on the platform.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Email</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Role</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">API Keys</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {users.map((u) => (
              <tr key={u.id} className="bg-white dark:bg-zinc-900/50">
                <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    u.role === "ADMIN"
                      ? "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-400"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}>
                    {u.role}
                  </span>
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
  );
}
