// Simple in-memory sliding-window rate limiter.
// NOTE: For production/multi-instance deployments, replace this with a shared
// store (e.g. Upstash Redis) so limits are enforced across serverless instances.

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 10;

const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string): { success: boolean; remaining: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { success: true, remaining: MAX_REQUESTS - 1 };
  }

  if (bucket.count >= MAX_REQUESTS) {
    return { success: false, remaining: 0 };
  }

  bucket.count += 1;
  return { success: true, remaining: MAX_REQUESTS - bucket.count };
}
