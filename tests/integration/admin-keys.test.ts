import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockVerifyApiSession,
  mockUpdateMany,
  mockFindMany,
  mockFindUnique,
  mockUpdate,
} = vi.hoisted(() => ({
  mockVerifyApiSession: vi.fn(),
  mockUpdateMany: vi.fn(),
  mockFindMany: vi.fn(),
  mockFindUnique: vi.fn(),
  mockUpdate: vi.fn(),
}));

vi.mock("@/app/lib/dal", () => ({
  verifyApiSession: mockVerifyApiSession,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    apiKey: {
      updateMany: mockUpdateMany,
      findMany: mockFindMany,
      findUnique: mockFindUnique,
      update: mockUpdate,
    },
  },
}));

import { POST as bulkDisable } from "@/app/api/admin/keys/bulk-disable/route";
import { PATCH as toggleKey } from "@/app/api/admin/keys/[id]/route";

describe("admin key routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifyApiSession.mockResolvedValue({ userId: "admin_1", role: "ADMIN" });
    mockUpdateMany.mockResolvedValue({ count: 2 });
    mockFindMany.mockResolvedValue([]);
    mockFindUnique.mockResolvedValue({
      id: "key_1",
      key: "sk_ai_valid",
      name: "Production",
      isActive: true,
      requestLimitPerMin: 60,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      user: { email: "user@example.com" },
    });
    mockUpdate.mockResolvedValue({
      id: "key_1",
      key: "sk_ai_valid",
      name: "Production",
      isActive: false,
      requestLimitPerMin: 60,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      user: { email: "user@example.com" },
    });
  });

  it("bulk disables keys for admins", async () => {
    mockFindMany.mockResolvedValue([
      {
        id: "key_2",
        key: "sk_ai_key_2",
        name: "Staging",
        isActive: false,
        requestLimitPerMin: 60,
        createdAt: new Date("2026-01-02T00:00:00.000Z"),
        user: { email: "user@example.com" },
      },
      {
        id: "key_1",
        key: "sk_ai_key_1",
        name: "Production",
        isActive: false,
        requestLimitPerMin: 60,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        user: { email: "admin@example.com" },
      },
    ]);

    const req = new Request("http://localhost/api/admin/keys/bulk-disable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: ["key_1", "key_2"] }),
    });

    const res = await bulkDisable(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { id: { in: ["key_1", "key_2"] } },
      data: { isActive: false },
    });
    expect(body).toMatchObject({
      data: {
        ids: ["key_2", "key_1"],
      },
    });
  });

  it("rejects bulk disable for non-admin users", async () => {
    mockVerifyApiSession.mockResolvedValue({ userId: "user_1", role: "USER" });

    const req = new Request("http://localhost/api/admin/keys/bulk-disable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: ["key_1"] }),
    });

    const res = await bulkDisable(req);

    expect(res.status).toBe(403);
    await expect(res.json()).resolves.toMatchObject({
      error: { code: "FORBIDDEN" },
    });
    expect(mockUpdateMany).not.toHaveBeenCalled();
  });

  it("allows admins to disable an individual key", async () => {
    const res = await toggleKey(new Request("http://localhost/api/admin/keys/key_1", {
      method: "PATCH",
    }), { params: Promise.resolve({ id: "key_1" }) });

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toMatchObject({
      data: { id: "key_1", isActive: false },
    });
  });
});
