"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import { AuthFormShell } from "@/app/components/auth-form-shell";
import { AuthTextField } from "@/app/components/auth-text-field";
import { Button } from "@/app/components/button";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);
  const emailError = state?.errors?.email?.[0];
  const passwordError = state?.errors?.password?.[0];

  return (
    <AuthFormShell
      title="Sign in"
      description="Enter your credentials to access the platform."
      alternateHref="/signup"
      alternateText="Don't have an account?"
      alternateLabel="Sign up"
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
            autoComplete="current-password"
            error={passwordError}
          />

          <Button
            type="submit"
            disabled={pending}
            aria-busy={pending}
            fullWidth
          >
            {pending ? "Signing in..." : "Sign in"}
          </Button>
        </form>
    </AuthFormShell>
  );
}
