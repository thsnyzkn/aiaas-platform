import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyApiSession } from "@/app/lib/dal";

export async function GET(req: NextRequest) {
  try {
    const session = await verifyApiSession();
    if (!session) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required." } },
        { status: 401 }
      );
    }

    const range = req.nextUrl.searchParams.get("range") ?? "7d";

    const days = range === "24h" ? 1 : range === "30d" ? 30 : 7;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const userKeyIds = await prisma.apiKey.findMany({
      where: { userId: session.userId },
      select: { id: true },
    });
    const keyIds = userKeyIds.map((k) => k.id);

    const logs = await prisma.usageLog.findMany({
      where: { apiKeyId: { in: keyIds }, createdAt: { gte: since } },
      select: { createdAt: true, statusCode: true },
      orderBy: { createdAt: "asc" },
    });

    // Group by date
    const grouped = new Map<string, { success: number; error: number }>();
    for (const log of logs) {
      const date = new Date(log.createdAt).toISOString().split("T")[0];
      const entry = grouped.get(date) ?? { success: 0, error: 0 };
      if (log.statusCode === 200) entry.success++;
      else entry.error++;
      grouped.set(date, entry);
    }

    const chart = Array.from(grouped.entries()).map(([date, counts]) => ({
      date,
      ...counts,
    }));

    return NextResponse.json({ data: chart });
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch stats." } },
      { status: 500 }
    );
  }
}
