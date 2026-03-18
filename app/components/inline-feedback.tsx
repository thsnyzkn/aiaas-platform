type InlineFeedbackTone = "success" | "error";

export function InlineFeedback({
  tone,
  message,
  className = "",
}: {
  tone: InlineFeedbackTone;
  message?: string | null;
  className?: string;
}) {
  const toneClass =
    tone === "error"
      ? "text-red-600 dark:text-red-400"
      : "text-emerald-600 dark:text-emerald-400";

  return (
    <div
      aria-live="polite"
      role="status"
      className={`min-h-5 text-sm ${toneClass} ${className}`.trim()}
    >
      {message}
    </div>
  );
}
