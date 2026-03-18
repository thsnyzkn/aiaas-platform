"use client";

import { Button } from "@/app/components/button";

export default function AdminAreaError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        Admin workspace error
      </h2>
      <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
        The admin panel could not finish loading. Try again.
      </p>
      <Button type="button" onClick={reset} className="mt-5">
        Retry
      </Button>
    </div>
  );
}
