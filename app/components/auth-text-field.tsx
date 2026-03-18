type AuthTextFieldProps = {
  id: string;
  name: string;
  label: string;
  type: "email" | "password" | "text";
  autoComplete?: string;
  placeholder?: string;
  error?: string;
  hint?: string;
};

export function AuthTextField({
  id,
  name,
  label,
  type,
  autoComplete,
  placeholder,
  error,
  hint,
}: AuthTextFieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
      >
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required
        aria-invalid={error ? "true" : "false"}
        aria-describedby={describedBy}
        className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 dark:bg-zinc-950 ${
          error
            ? "border-red-300 text-zinc-950 focus:border-red-400 focus:ring-red-200 dark:border-red-800 dark:text-zinc-50 dark:focus:ring-red-950"
            : "border-zinc-300 text-zinc-950 focus:border-zinc-500 focus:ring-zinc-200 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-800"
        }`}
      />
      {error ? (
        <p
          id={`${id}-error`}
          className="text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      ) : hint ? (
        <p
          id={`${id}-hint`}
          className="text-sm text-zinc-500 dark:text-zinc-400"
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}
