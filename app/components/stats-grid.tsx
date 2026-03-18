import type { ReactNode } from "react";

export function StatsGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-3">{children}</div>;
}
