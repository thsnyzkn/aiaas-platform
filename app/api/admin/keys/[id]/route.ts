import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/app/lib/dal";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifySession();

    if (session.role !== "ADMIN") {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Admin access required." } },
        { status: 403 }
      );
    }

    const { id } = await params;

    const apiKey = await prisma.apiKey.findUnique({
      where: { id },
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

    if (!apiKey) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "API key not found." } },
        { status: 404 }
      );
    }

    const updated = await prisma.apiKey.update({
      where: { id },
      data: { isActive: !apiKey.isActive },
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

    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to update API key.",
        },
      },
      { status: 500 }
    );
  }
}
