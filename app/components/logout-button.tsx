"use client";

import { logout } from "@/app/actions/auth";
import { Button } from "@/app/components/button";

export function LogoutButton() {
  return (
    <form action={logout}>
      <Button type="submit" variant="secondary" size="sm">
        Sign out
      </Button>
    </form>
  );
}
