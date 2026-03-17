import { verifySession, getUser } from "@/app/lib/dal";
import { Sidebar } from "@/app/components/sidebar";
import { Header } from "@/app/components/header";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "API Keys", href: "/api-keys" },
  { label: "Playground", href: "/playground" },
];

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();
  const user = await getUser();

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
      <Sidebar items={navItems} role={session.role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header email={user?.email ?? ""} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
