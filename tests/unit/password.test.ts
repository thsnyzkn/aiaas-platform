import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/app/lib/password";

describe("password", () => {
  it("hashes passwords as salt:key", async () => {
    const hash = await hashPassword("super-secret");
    const [salt, key] = hash.split(":");

    expect(salt).toMatch(/^[0-9a-f]{32}$/);
    expect(key).toMatch(/^[0-9a-f]{128}$/);
  });

  it("verifies the original password", async () => {
    const hash = await hashPassword("super-secret");

    await expect(verifyPassword("super-secret", hash)).resolves.toBe(true);
  });

  it("rejects a different password", async () => {
    const hash = await hashPassword("super-secret");

    await expect(verifyPassword("not-the-password", hash)).resolves.toBe(false);
  });

  it("generates different hashes for the same password", async () => {
    const [firstHash, secondHash] = await Promise.all([
      hashPassword("super-secret"),
      hashPassword("super-secret"),
    ]);

    expect(firstHash).not.toBe(secondHash);
  });
});
