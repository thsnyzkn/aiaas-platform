import { verifySession, getUser } from "@/app/lib/dal";
import { redirect } from "next/navigation";
import { Sidebar } from "@/app/components/sidebar";
import { Header } from "@/app/components/header";

const navItems = [
  { label: "Users", href: "/admin/users" },
  { label: "API Keys", href: "/admin/api-keys" },
  { label: "Logs", href: "/admin/logs" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();

  if (session.role !== "ADMIN") {
    redirect("/dashboard");
  }

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
