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

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { apiKeys: true } },
      },
    });

    return NextResponse.json({ data: users });
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch users." } },
      { status: 500 }
    );
  }
}
