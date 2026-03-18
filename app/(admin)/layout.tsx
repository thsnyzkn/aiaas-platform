import { verifySession, getUser } from "@/app/lib/dal";
import { redirect } from "next/navigation";
import { WorkspaceShell } from "@/app/components/workspace-shell";

const navItems = [
  { label: "Dashboard", href: "/admin" },
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
    <WorkspaceShell
      navItems={navItems}
      role={session.role}
      email={user?.email ?? ""}
    >
      {children}
    </WorkspaceShell>
  );
}
