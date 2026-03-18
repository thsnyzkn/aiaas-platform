import type { ReactNode } from "react";

type MobileDataListProps = {
  children: ReactNode;
};

type MobileDataCardProps = {
  children: ReactNode;
};

type DesktopDataTableProps = {
  caption: string;
  children: ReactNode;
};

const shellClassName =
  "hidden overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 md:block";

const headCellClassName =
  "px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400";

const rowClassName = "bg-white dark:bg-zinc-900/50";

export function MobileDataList({ children }: MobileDataListProps) {
  return <div className="grid gap-4 md:hidden">{children}</div>;
}

export function MobileDataCard({ children }: MobileDataCardProps) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      {children}
    </article>
  );
}

export function DesktopDataTable({ caption, children }: DesktopDataTableProps) {
  return (
    <div className={shellClassName}>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <caption className="sr-only">{caption}</caption>
          {children}
        </table>
      </div>
    </div>
  );
}

export const dataTableHeadClassName =
  "border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/60";

export const dataTableHeadCellClassName = headCellClassName;
export const dataTableBodyClassName = "divide-y divide-zinc-200 dark:divide-zinc-800";
export const dataTableRowClassName = rowClassName;
