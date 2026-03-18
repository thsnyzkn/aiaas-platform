"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/app/lib/session";
import { hashPassword, verifyPassword } from "@/app/lib/password";
import {
  SignupFormSchema,
  LoginFormSchema,
  type FormState,
} from "@/app/lib/definitions";

export async function signup(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const validated = SignupFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { email, password } = validated.data;
  const role = formData.get("role") === "ADMIN" ? "ADMIN" : "USER";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { message: "Email already exists." };
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash, role },
  });

  await createSession(user.id, user.role);
  redirect(user.role === "ADMIN" ? "/admin" : "/dashboard");
}

export async function login(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const validated = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { email, password } = validated.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { message: "Invalid email or password." };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { message: "Invalid email or password." };
  }

  await createSession(user.id, user.role);
  redirect(user.role === "ADMIN" ? "/admin" : "/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
