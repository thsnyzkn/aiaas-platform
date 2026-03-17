import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimiter";
import crypto from "crypto";

export async function POST(req: Request) {
  const startTime = Date.now();
  const apiKeyHeader = req.headers.get("x-api-key");

  if (!apiKeyHeader) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Missing x-api-key header." } },
      { status: 401 }
    );
  }

  const apiKey = await prisma.apiKey.findUnique({
    where: { key: apiKeyHeader },
    select: { id: true, isActive: true, requestLimitPerMin: true },
  });

  if (!apiKey) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Invalid API key." } },
      { status: 401 }
    );
  }

  if (!apiKey.isActive) {
    await logUsage(apiKey.id, 403, startTime);
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "API key is disabled." } },
      { status: 403 }
    );
  }

  const rateCheck = checkRateLimit(apiKeyHeader, apiKey.requestLimitPerMin);
  if (!rateCheck.allowed) {
    await logUsage(apiKey.id, 429, startTime);
    return NextResponse.json(
      {
        error: {
          code: "RATE_LIMITED",
          message: "Rate limit exceeded.",
          retryAfter: rateCheck.retryAfter,
        },
      },
      { status: 429, headers: { "Retry-After": String(rateCheck.retryAfter) } }
    );
  }

  // Parse body for the prompt (optional — mock doesn't need it, but validates structure)
  let prompt = "Hello";
  try {
    const body = await req.json();
    const lastMessage = body.messages?.at(-1);
    if (lastMessage?.content) {
      prompt = lastMessage.content;
    }
  } catch {
    // Empty body is fine — we'll use the default prompt
  }

  await logUsage(apiKey.id, 200, startTime);

  return NextResponse.json({
    data: {
      id: `chatcmpl-mock-${crypto.randomBytes(6).toString("hex")}`,
      object: "chat.completion",
      model: "mock-gpt",
      choices: [
        {
          message: {
            role: "assistant",
            content: `This is a mock response to: "${prompt}"`,
          },
        },
      ],
    },
  });
}

async function logUsage(apiKeyId: string, statusCode: number, startTime: number) {
  await prisma.usageLog.create({
    data: {
      apiKeyId,
      endpoint: "/api/chat/completions",
      statusCode,
      latencyMs: Date.now() - startTime,
    },
  });
}
