import { verifySession } from "@/app/lib/dal";
import { LogoutButton } from "@/app/components/logout-button";
import { UserDashboard } from "@/app/components/user-dashboard";
import { AdminDashboard } from "@/app/components/admin-dashboard";

export default async function DashboardPage() {
  const session = await verifySession();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          AIaaS Platform
        </h1>
        <div className="flex items-center gap-4">
          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {session.role}
          </span>
          <LogoutButton />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">
        {session.role === "ADMIN" ? <AdminDashboard /> : <UserDashboard />}
      </main>
    </div>
  );
}
