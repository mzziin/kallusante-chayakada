import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis/cloudflare";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Local in-memory sliding window rate limiter fallback for development/local testing
 * when UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not configured.
 * Strictly enforces 10 requests per 60 seconds per IP per §13.
 */
interface WindowRecord {
  timestamps: number[];
}

const memoryStore = new Map<string, WindowRecord>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;

function checkMemoryRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  let record = memoryStore.get(ip);
  if (!record) {
    record = { timestamps: [] };
    memoryStore.set(ip, record);
  }

  // Filter timestamps within the sliding window
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (record.timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldestTimestamp = record.timestamps[0] || now;
    const resetTime = Math.ceil((oldestTimestamp + RATE_LIMIT_WINDOW_MS - now) / 1000);
    return {
      success: false,
      limit: MAX_REQUESTS_PER_WINDOW,
      remaining: 0,
      reset: Math.max(resetTime, 1),
    };
  }

  record.timestamps.push(now);
  return {
    success: true,
    limit: MAX_REQUESTS_PER_WINDOW,
    remaining: MAX_REQUESTS_PER_WINDOW - record.timestamps.length,
    reset: 60,
  };
}

/**
 * Global rate limiter instance backed by Upstash Redis if configured (§13)
 */
let upstashLimiter: Ratelimit | null = null;

if (
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
) {
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    upstashLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(MAX_REQUESTS_PER_WINDOW, "60 s"),
      analytics: false,
      prefix: "kalloosan_ratelimit",
    });
  } catch (err) {
    console.warn(
      JSON.stringify({
        tag: "UPSTASH_INIT_WARNING",
        message: "Failed to initialize Upstash Redis. Falling back to memory limiter.",
        error: String(err),
      })
    );
  }
}

/**
 * Check rate limit for client IP (10 requests/minute) per §13
 */
export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  if (upstashLimiter) {
    try {
      const res = await upstashLimiter.limit(`ip:${ip}`);
      return {
        success: res.success,
        limit: res.limit,
        remaining: res.remaining,
        reset: Math.ceil((res.reset - Date.now()) / 1000),
      };
    } catch (err) {
      console.warn(
        JSON.stringify({
          tag: "UPSTASH_RATE_LIMIT_ERROR",
          message: "Upstash query failed. Using in-memory fallback.",
          error: String(err),
        })
      );
      return checkMemoryRateLimit(ip);
    }
  }

  return checkMemoryRateLimit(ip);
}
