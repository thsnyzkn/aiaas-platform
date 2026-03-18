import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/app/lib/dal";

type RequestBody = {
  ids?: unknown;
};

export async function POST(req: Request) {
  try {
    const session = await verifySession();

    if (session.role !== "ADMIN") {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Admin access required." } },
        { status: 403 }
      );
    }

    const body = (await req.json()) as RequestBody;
    const ids = Array.isArray(body.ids)
      ? body.ids.filter((value): value is string => typeof value === "string")
      : [];

    if (ids.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "At least one API key must be selected.",
          },
        },
        { status: 400 }
      );
    }

    await prisma.apiKey.updateMany({
      where: { id: { in: ids } },
      data: { isActive: false },
    });

    const updatedKeys = await prisma.apiKey.findMany({
      where: { id: { in: ids } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        key: true,
        name: true,
        isActive: true,
        requestLimitPerMin: true,
        createdAt: true,
        user: { select: { email: true } },
      },
    });

    return NextResponse.json({
      data: {
        ids: updatedKeys.map((apiKey) => apiKey.id),
        keys: updatedKeys,
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to disable selected API keys.",
        },
      },
      { status: 500 }
    );
  }
}
