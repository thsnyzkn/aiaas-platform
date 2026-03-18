import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "destructive" | "success";
type ButtonSize = "sm" | "md";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200",
  secondary:
    "border border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800",
  destructive:
    "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900",
  success:
    "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "rounded-xl px-3 py-1.5 text-xs font-medium",
  md: "rounded-2xl px-4 py-3 text-sm font-medium",
};

function classesFor(variant: ButtonVariant, size: ButtonSize, fullWidth: boolean) {
  return `${sizeClasses[size]} transition disabled:cursor-not-allowed disabled:opacity-50 ${
    variantClasses[variant]
  } ${fullWidth ? "w-full" : ""}`.trim();
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}) {
  return (
    <button
      {...props}
      className={`${classesFor(variant, size, fullWidth)} ${className}`.trim()}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  children,
  href,
  variant = "primary",
  size = "md",
  className = "",
}: {
  children: React.ReactNode;
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`${classesFor(variant, size, false)} inline-flex ${className}`.trim()}
    >
      {children}
    </Link>
  );
}
