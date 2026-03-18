"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@/app/lib/definitions";

type NavItem = { label: string; href: string };

export function Sidebar({
  items,
  role,
}: {
  items: NavItem[];
  role: Role;
}) {
  const pathname = usePathname();

  return (
    <aside className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 lg:h-full lg:w-64 lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800 lg:block">
        <span className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          AIaaS
        </span>
        <span
          aria-label={`Current role: ${role}`}
          className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
        >
          {role}
        </span>
      </div>
      <nav
        aria-label={`${role.toLowerCase()} navigation`}
        className="flex gap-1 overflow-x-auto px-3 py-3 [scrollbar-width:none] [-ms-overflow-style:none] lg:flex-col lg:gap-1 lg:overflow-visible lg:py-4"
      >
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-50"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
