import crypto from "crypto";

export function generateApiKey(): string {
  const random = crypto.randomBytes(8).toString("hex");
  return `sk_ai_${random}`;
}
