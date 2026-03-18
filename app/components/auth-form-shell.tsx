import Link from "next/link";

export function AuthFormShell({
  title,
  description,
  alternateHref,
  alternateLabel,
  alternateText,
  children,
}: {
  title: string;
  description: string;
  alternateHref: string;
  alternateLabel: string;
  alternateText: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10 dark:bg-zinc-950 sm:px-6">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            {title}
          </h1>
          <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            {description}
          </p>
        </div>

        {children}

        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          {alternateText}{" "}
          <Link
            href={alternateHref}
            className="font-medium text-zinc-950 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-900 dark:text-zinc-50 dark:decoration-zinc-700 dark:hover:decoration-zinc-100"
          >
            {alternateLabel}
          </Link>
        </p>
      </div>
    </div>
  );
}
