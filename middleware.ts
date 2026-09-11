import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";

export const config = {
  matcher: ["/api/roast"],
};

export async function middleware(request: NextRequest) {
  // Extract client IP per §13
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const clientIp = forwardedFor
    ? forwardedFor.split(",")[0].trim()
    : realIp || (request as unknown as { ip?: string }).ip || "127.0.0.1";

  const rateLimit = await checkRateLimit(clientIp);

  if (!rateLimit.success) {
    const retryAfterSeconds = Math.max(rateLimit.reset, 1);

    // Structured observability log for rate-limit trigger per §18
    console.warn(
      JSON.stringify({
        tag: "RATE_LIMIT_BLOCKED",
        clientIpPrefix: clientIp.split(".").slice(0, 2).join(".") + ".*.*",
        retryAfterSeconds,
        limit: rateLimit.limit,
      })
    );

    // Return structured rate-limit response per §12, §13
    return NextResponse.json(
      {
        error: "rate_limited",
        retryAfterSeconds,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSeconds),
          "X-RateLimit-Limit": String(rateLimit.limit),
          "X-RateLimit-Remaining": "0",
          "Content-Type": "application/json",
        },
      }
    );
  }

  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Limit", String(rateLimit.limit));
  response.headers.set("X-RateLimit-Remaining", String(rateLimit.remaining));
  return response;
}
