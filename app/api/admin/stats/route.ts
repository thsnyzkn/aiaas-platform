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

    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const logs = await prisma.usageLog.findMany({
      where: { createdAt: { gte: since } },
      select: {
        createdAt: true,
        endpoint: true,
        apiKey: { select: { user: { select: { email: true } } } },
      },
      orderBy: { createdAt: "asc" },
    });

    // Usage over time
    const byDate = new Map<string, number>();
    const byEndpoint = new Map<string, number>();
    const byUser = new Map<string, number>();

    for (const log of logs) {
      const date = new Date(log.createdAt).toISOString().split("T")[0];
      byDate.set(date, (byDate.get(date) ?? 0) + 1);
      byEndpoint.set(log.endpoint, (byEndpoint.get(log.endpoint) ?? 0) + 1);
      const email = log.apiKey?.user.email;
      if (email) {
        byUser.set(email, (byUser.get(email) ?? 0) + 1);
      }
    }

    return NextResponse.json({
      data: {
        usageOverTime: Array.from(byDate.entries()).map(([date, count]) => ({ date, count })),
        topEndpoints: Array.from(byEndpoint.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([endpoint, count]) => ({ endpoint, count })),
        topUsers: Array.from(byUser.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([email, count]) => ({ email, count })),
      },
    });
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch stats." } },
      { status: 500 }
    );
  }
}
