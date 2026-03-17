import { LogoutButton } from "@/app/components/logout-button";

export function Header({ email }: { email: string }) {
  return (
    <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{email}</p>
      <LogoutButton />
    </header>
  );
}
