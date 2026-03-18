import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyApiSession } from "@/app/lib/dal";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifyApiSession();
    if (!session) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required." } },
        { status: 401 }
      );
    }

    const { id } = await params;

    const apiKey = await prisma.apiKey.findUnique({ where: { id } });

    if (!apiKey) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "API key not found." } },
        { status: 404 }
      );
    }

    if (apiKey.userId !== session.userId) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Not your API key." } },
        { status: 403 }
      );
    }

    const updated = await prisma.apiKey.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        key: true,
        name: true,
        isActive: true,
        requestLimitPerMin: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update key." } },
      { status: 500 }
    );
  }
}
