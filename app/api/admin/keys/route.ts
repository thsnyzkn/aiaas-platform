import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyApiSession } from "@/app/lib/dal";

export async function GET() {
  try {
    const session = await verifyApiSession();
    if (!session) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required." } },
        { status: 401 }
      );
    }

    if (session.role !== "ADMIN") {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Admin access required." } },
        { status: 403 }
      );
    }

    const keys = await prisma.apiKey.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        key: true,
        name: true,
        isActive: true,
        requestLimitPerMin: true,
        createdAt: true,
        user: { select: { id: true, email: true } },
      },
    });

    return NextResponse.json({ data: keys });
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch keys." } },
      { status: 500 }
    );
  }
}
