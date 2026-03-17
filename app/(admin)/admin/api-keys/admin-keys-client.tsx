"use client";

import { useRouter } from "next/navigation";

type AdminKey = {
  id: string;
  key: string;
  name: string;
  isActive: boolean;
  requestLimitPerMin: number;
  createdAt: Date;
  user: { email: string };
};

export function AdminKeysClient({ initialKeys }: { initialKeys: AdminKey[] }) {
  const router = useRouter();

  async function handleToggle(id: string) {
    await fetch(`/api/keys/${id}`, { method: "PATCH" });
    router.refresh();
  }

  function maskKey(key: string) {
    return key.slice(0, 10) + "••••••••••••";
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className="w-full text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Name</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Key</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">User</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Rate Limit</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Status</th>
            <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {initialKeys.map((k) => (
            <tr key={k.id} className="bg-white dark:bg-zinc-900/50">
              <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{k.name}</td>
              <td className="px-4 py-3 font-mono text-xs text-zinc-500 dark:text-zinc-400">{maskKey(k.key)}</td>
              <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{k.user.email}</td>
              <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{k.requestLimitPerMin}/min</td>
              <td className="px-4 py-3">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                  k.isActive
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                    : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400"
                }`}>
                  {k.isActive ? "Active" : "Disabled"}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => handleToggle(k.id)}
                  className={`rounded px-2 py-1 text-xs transition-colors ${
                    k.isActive
                      ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                      : "text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950"
                  }`}
                >
                  {k.isActive ? "Disable" : "Enable"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
