"use client";

import { useActionState } from "react";
import { signup } from "@/app/actions/auth";
import { AuthFormShell } from "@/app/components/auth-form-shell";
import { AuthTextField } from "@/app/components/auth-text-field";
import { Button } from "@/app/components/button";

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, undefined);
  const emailError = state?.errors?.email?.[0];
  const passwordError = state?.errors?.password?.[0];

  return (
    <AuthFormShell
      title="Create account"
      description="Sign up to start using the platform."
      alternateHref="/login"
      alternateText="Already have an account?"
      alternateLabel="Sign in"
    >
        <form action={action} className="mt-8 space-y-5" noValidate>
          <div
            aria-live="polite"
            aria-atomic="true"
            className="min-h-5 text-sm text-red-600 dark:text-red-400"
          >
            {state?.message}
          </div>

          <AuthTextField
            id="email"
            name="email"
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={emailError}
          />

          <AuthTextField
            id="password"
            name="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="Minimum 8 characters"
            error={passwordError}
            hint="Use at least 8 characters."
          />

          <label className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-300">
            <input
              id="role"
              name="role"
              type="checkbox"
              value="ADMIN"
              className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <span className="space-y-1">
              <span className="block font-medium text-zinc-900 dark:text-zinc-100">
                Register as admin
              </span>
              <span className="block text-zinc-500 dark:text-zinc-400">
                Enables access to user, key, and usage oversight screens.
              </span>
            </span>
          </label>

          <Button
            type="submit"
            disabled={pending}
            aria-busy={pending}
            fullWidth
          >
            {pending ? "Creating account..." : "Create account"}
          </Button>
        </form>
    </AuthFormShell>
  );
}
