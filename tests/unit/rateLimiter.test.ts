import { describe, it, expect, beforeEach, vi } from "vitest";
import { checkRateLimit, resetRateLimiter } from "@/lib/rateLimiter";

describe("rateLimiter", () => {
  beforeEach(() => {
    resetRateLimiter();
  });

  it("allows requests under the limit", () => {
    const result = checkRateLimit("sk_ai_test1", 5);
    expect(result.allowed).toBe(true);
    expect(result.retryAfter).toBeUndefined();
  });

  it("blocks requests over the limit", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("sk_ai_test2", 5);
    }
    const result = checkRateLimit("sk_ai_test2", 5);
    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it("tracks keys independently", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("sk_ai_full", 5);
    }
    const result = checkRateLimit("sk_ai_other", 5);
    expect(result.allowed).toBe(true);
  });

  it("allows requests after the window expires", () => {
    vi.useFakeTimers();

    for (let i = 0; i < 3; i++) {
      checkRateLimit("sk_ai_expire", 3);
    }
    expect(checkRateLimit("sk_ai_expire", 3).allowed).toBe(false);

    // Advance past the 60s window
    vi.advanceTimersByTime(61_000);

    expect(checkRateLimit("sk_ai_expire", 3).allowed).toBe(true);

    vi.useRealTimers();
  });
});
