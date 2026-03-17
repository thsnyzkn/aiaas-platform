import { describe, it, expect } from "vitest";
import { generateApiKey } from "@/lib/apiKey";

describe("generateApiKey", () => {
  it("starts with sk_ai_ prefix", () => {
    const key = generateApiKey();
    expect(key).toMatch(/^sk_ai_/);
  });

  it("has correct length (sk_ai_ + 16 hex chars = 22)", () => {
    const key = generateApiKey();
    expect(key).toHaveLength(22);
  });

  it("contains only valid hex characters after prefix", () => {
    const key = generateApiKey();
    const hex = key.replace("sk_ai_", "");
    expect(hex).toMatch(/^[0-9a-f]{16}$/);
  });

  it("generates unique keys", () => {
    const keys = new Set(Array.from({ length: 100 }, () => generateApiKey()));
    expect(keys.size).toBe(100);
  });
});
