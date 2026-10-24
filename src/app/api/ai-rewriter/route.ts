/**
 * ResumeLoops AI Rewriter Server Endpoint
 * POST /api/ai-rewriter
 * GET  /api/ai-rewriter (health & provider configuration check)
 */

import { NextRequest, NextResponse } from "next/server";
import {
  executeAiRewrite,
  isAiProviderConfigured,
  validateRewriteRequest,
} from "@/lib/ai-provider";
import { RewriteGoalId, RewriteRequestBody, RewriteResponseBody } from "@/types/ai-rewriter";

// In-memory rate limiting map for basic abuse prevention
// Key: IP, Value: { count: number, resetAt: number }
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 20; // 20 requests per minute per client
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count += 1;
  return true;
}

/**
 * GET: Checks whether the AI provider is configured without exposing secrets
 */
export async function GET() {
  const configured = isAiProviderConfigured();
  return NextResponse.json({
    configured,
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
  });
}

/**
 * POST: Validates input and triggers OpenAI Responses API
 */
export async function POST(req: NextRequest): Promise<NextResponse<RewriteResponseBody>> {
  // Best-effort client IP detection
  const clientIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "localhost-client";

  if (!checkRateLimit(clientIp)) {
    return NextResponse.json(
      {
        success: false,
        error: "RATE_LIMITED",
        message: "Too many rewrite requests. Please wait a moment before trying again.",
      },
      { status: 429 }
    );
  }

  let body: Partial<RewriteRequestBody>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "INVALID_INPUT",
        message: "Invalid JSON request body.",
      },
      { status: 400 }
    );
  }

  const validation = validateRewriteRequest(body);
  if (!validation.valid) {
    return NextResponse.json(
      {
        success: false,
        error: (validation.error || "INVALID_INPUT") as RewriteResponseBody["error"],
        message: validation.message || "Invalid input parameters.",
      },
      { status: validation.status || 400 }
    );
  }

  const { text, goal, jobContext, targetLabel } = body;

  // 4. Provider configuration check
  if (!isAiProviderConfigured()) {
    return NextResponse.json(
      {
        success: false,
        error: "PROVIDER_NOT_CONFIGURED",
        message:
          "OpenAI API provider is not configured. Please set OPENAI_API_KEY in your server environment (.env.local).",
      },
      { status: 503 }
    );
  }

  try {
    const result = await executeAiRewrite({
      text: text!.trim(),
      goal: goal as RewriteGoalId,
      jobContext: jobContext?.trim(),
      targetLabel: targetLabel?.trim().slice(0, 100),
    });

    return NextResponse.json({
      success: true,
      rewrittenText: result.rewrittenText,
      modelUsed: result.modelUsed,
      factualCaution: result.factualCaution,
    });
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;

    if (code === "PROVIDER_NOT_CONFIGURED") {
      return NextResponse.json(
        {
          success: false,
          error: "PROVIDER_NOT_CONFIGURED",
          message:
            "OpenAI API key not configured. Add OPENAI_API_KEY to .env.local to enable real AI rewrites.",
        },
        { status: 503 }
      );
    }

    if (code === "TIMEOUT") {
      return NextResponse.json(
        {
          success: false,
          error: "TIMEOUT",
          message: "The AI rewrite request timed out after 15 seconds. Please try again.",
        },
        { status: 504 }
      );
    }

    if (code === "RATE_LIMITED") {
      return NextResponse.json(
        {
          success: false,
          error: "RATE_LIMITED",
          message: "Upstream provider rate limit reached. Please wait a moment.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "PROVIDER_ERROR",
        message: "The AI service encountered an error processing your request.",
      },
      { status: 502 }
    );
  }
}
