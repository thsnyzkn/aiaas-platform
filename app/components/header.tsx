import { LogoutButton } from "@/app/components/logout-button";

export function Header({
  email,
  role,
}: {
  email: string;
  role: string;
}) {
  return (
    <header className="flex flex-col gap-3 border-b border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
          {role === "ADMIN" ? "Admin workspace" : "User workspace"}
        </p>
        <p className="truncate text-sm text-zinc-600 dark:text-zinc-300">
          {email}
        </p>
      </div>
      <LogoutButton />
    </header>
  );
}
