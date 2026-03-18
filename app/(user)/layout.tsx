import { verifySession, getUser } from "@/app/lib/dal";
import { WorkspaceShell } from "@/app/components/workspace-shell";

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
    <WorkspaceShell
      navItems={navItems}
      role={session.role}
      email={user?.email ?? ""}
    >
      {children}
    </WorkspaceShell>
  );
}
