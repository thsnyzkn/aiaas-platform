import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/app/lib/dal";
import { generateApiKey } from "@/lib/apiKey";

export async function GET() {
  try {
    const session = await verifySession();

    const keys = await prisma.apiKey.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        key: true,
        name: true,
        isActive: true,
        requestLimitPerMin: true,
        createdAt: true,
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

export async function POST(req: Request) {
  try {
    const session = await verifySession();
    const body = await req.json();
    const name = body.name?.trim();
    const parsedLimit = Number(body.requestLimitPerMin);
    const requestLimitPerMin = Number.isInteger(parsedLimit)
      ? parsedLimit
      : 10;

    if (!name) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Name is required." } },
        { status: 400 }
      );
    }

    if (requestLimitPerMin < 10) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Request limit must be at least 10 per minute.",
          },
        },
        { status: 400 }
      );
    }

    const apiKey = await prisma.apiKey.create({
      data: {
        key: generateApiKey(),
        name,
        requestLimitPerMin,
        userId: session.userId,
      },
      select: {
        id: true,
        key: true,
        name: true,
        isActive: true,
        requestLimitPerMin: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ data: apiKey }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create key." } },
      { status: 500 }
    );
  }
}
