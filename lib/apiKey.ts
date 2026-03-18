import crypto from "crypto";

export function generateApiKey(): string {
  const random = crypto.randomBytes(8).toString("hex");
  return `sk_ai_${random}`;
}

export function maskApiKey(key: string): string {
  return `${key.slice(0, 10)}••••••••••••`;
}
