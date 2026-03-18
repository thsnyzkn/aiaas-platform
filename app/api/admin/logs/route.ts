import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyApiSession } from "@/app/lib/dal";

const DEFAULT_PAGE_SIZE = 50;

export async function GET(req: NextRequest) {
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

    const { searchParams } = req.nextUrl;
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || DEFAULT_PAGE_SIZE));
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.usageLog.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          endpoint: true,
          statusCode: true,
          latencyMs: true,
          createdAt: true,
          apiKey: {
            select: {
              key: true,
              name: true,
              user: { select: { email: true } },
            },
          },
        },
      }),
      prisma.usageLog.count(),
    ]);

    return NextResponse.json({
      data: logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch logs." } },
      { status: 500 }
    );
  }
}
