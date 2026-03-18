import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockFindUnique,
  mockCreateUsageLog,
  mockCheckRateLimit,
} = vi.hoisted(() => ({
  mockFindUnique: vi.fn(),
  mockCreateUsageLog: vi.fn(),
  mockCheckRateLimit: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    apiKey: {
      findUnique: mockFindUnique,
    },
    usageLog: {
      create: mockCreateUsageLog,
    },
  },
}));

vi.mock("@/lib/rateLimiter", () => ({
  checkRateLimit: mockCheckRateLimit,
}));

import { POST } from "@/app/api/chat/completions/route";

describe("POST /api/chat/completions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckRateLimit.mockReturnValue({ allowed: true });
    mockCreateUsageLog.mockResolvedValue(undefined);
  });

  it("returns 401 when the API key header is missing", async () => {
    const req = new Request("http://localhost/api/chat/completions", {
      method: "POST",
    });

    const res = await POST(req);

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toMatchObject({
      error: {
        code: "UNAUTHORIZED",
        message: "Missing x-api-key header.",
      },
    });
    expect(mockFindUnique).not.toHaveBeenCalled();
    expect(mockCreateUsageLog).toHaveBeenCalledWith({
      data: expect.objectContaining({
        apiKeyId: null,
        endpoint: "/api/chat/completions",
        statusCode: 401,
      }),
    });
  });

  it("returns 401 when the API key is invalid", async () => {
    mockFindUnique.mockResolvedValue(null);

    const req = new Request("http://localhost/api/chat/completions", {
      method: "POST",
      headers: { "x-api-key": "sk_ai_invalid" },
    });

    const res = await POST(req);

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toMatchObject({
      error: {
        code: "UNAUTHORIZED",
        message: "Invalid API key.",
      },
    });
    expect(mockCreateUsageLog).toHaveBeenCalledWith({
      data: expect.objectContaining({
        apiKeyId: null,
        endpoint: "/api/chat/completions",
        statusCode: 401,
      }),
    });
  });

  it("returns 429 and logs the request when rate limited", async () => {
    mockFindUnique.mockResolvedValue({
      id: "key_123",
      isActive: true,
      requestLimitPerMin: 1,
    });
    mockCheckRateLimit.mockReturnValue({ allowed: false, retryAfter: 12 });

    const req = new Request("http://localhost/api/chat/completions", {
      method: "POST",
      headers: { "x-api-key": "sk_ai_limited" },
    });

    const res = await POST(req);

    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("12");
    await expect(res.json()).resolves.toMatchObject({
      error: {
        code: "RATE_LIMITED",
        retryAfter: 12,
      },
    });
    expect(mockCreateUsageLog).toHaveBeenCalledWith({
      data: expect.objectContaining({
        apiKeyId: "key_123",
        endpoint: "/api/chat/completions",
        statusCode: 429,
      }),
    });
  });

  it("returns a mock completion and logs the success", async () => {
    mockFindUnique.mockResolvedValue({
      id: "key_123",
      isActive: true,
      requestLimitPerMin: 60,
    });

    const req = new Request("http://localhost/api/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": "sk_ai_valid",
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Explain rate limits" }],
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toMatchObject({
      data: {
        object: "chat.completion",
        model: "mock-gpt",
        choices: [
          {
            message: {
              role: "assistant",
              content: 'This is a mock response to: "Explain rate limits"',
            },
          },
        ],
      },
    });
    expect(body.data.id).toMatch(/^chatcmpl-mock-/);
    expect(mockCheckRateLimit).toHaveBeenCalledWith("sk_ai_valid", 60);
    expect(mockCreateUsageLog).toHaveBeenCalledWith({
      data: expect.objectContaining({
        apiKeyId: "key_123",
        endpoint: "/api/chat/completions",
        statusCode: 200,
      }),
    });
  });

  it("returns 500 in the error envelope when an unexpected error occurs", async () => {
    mockFindUnique.mockRejectedValue(new Error("db exploded"));

    const req = new Request("http://localhost/api/chat/completions", {
      method: "POST",
      headers: { "x-api-key": "sk_ai_valid" },
    });

    const res = await POST(req);

    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toMatchObject({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong.",
      },
    });
  });
});
