import { Header } from "@/app/components/header";
import { Sidebar } from "@/app/components/sidebar";

type NavItem = {
  label: string;
  href: string;
};

export function WorkspaceShell({
  children,
  email,
  role,
  navItems,
}: {
  children: React.ReactNode;
  email: string;
  role: string;
  navItems: NavItem[];
}) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 lg:flex">
      <Sidebar items={navItems} role={role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header email={email} role={role} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
