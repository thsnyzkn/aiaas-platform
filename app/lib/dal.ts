import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decrypt } from "@/app/lib/session";
import type { Role } from "@/app/lib/definitions";
import { prisma } from "@/lib/prisma";

type ActiveSession = {
  userId: string;
  role: Role;
};

const getSession = cache(async (): Promise<ActiveSession | null> => {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) {
    return null;
  }

  return { userId: session.userId, role: session.role };
});

export const verifySession = cache(async (): Promise<ActiveSession> => {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
});

export const verifyApiSession = cache(async (): Promise<ActiveSession | null> => {
  return getSession();
});

export const getUser = cache(async () => {
  const session = await verifySession();

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, role: true, createdAt: true },
  });

  return user;
});
