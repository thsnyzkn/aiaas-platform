type StatusBadgeTone = "success" | "error" | "warning" | "neutral" | "admin";

const toneClasses: Record<StatusBadgeTone, string> = {
  success:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  error: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
  warning:
    "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  neutral:
    "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  admin:
    "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
};

export function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: StatusBadgeTone;
}) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${toneClasses[tone]}`}
    >
      {label}
    </span>
  );
}
