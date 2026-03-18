import { z } from "zod";

export const SignupFormSchema = z.object({
  email: z.email({ error: "Please enter a valid email." }).trim(),
  password: z
    .string()
    .min(8, { error: "Password must be at least 8 characters." })
    .trim(),
});

export const LoginFormSchema = z.object({
  email: z.email({ error: "Please enter a valid email." }).trim(),
  password: z.string().min(1, { error: "Password is required." }),
});

export type Role = "USER" | "ADMIN";

export type SessionPayload = {
  userId: string;
  role: Role;
  expiresAt: Date;
};

export type FormState =
  | { errors?: { email?: string[]; password?: string[] }; message?: string }
  | undefined;
