// Simple in-memory rate limiter (resets on deploy/restart)
// For production: use Redis or Upstash

const requests = new Map<string, { count: number; resetAt: number }>();

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number; // seconds
}

export function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60_000 // 1 minute
): RateLimitResult {
  const now = Date.now();
  const entry = requests.get(key);

  if (!entry || now > entry.resetAt) {
    requests.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetIn: Math.ceil(windowMs / 1000) };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetIn: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetIn: Math.ceil((entry.resetAt - now) / 1000) };
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of requests.entries()) {
    if (now > entry.resetAt) requests.delete(key);
  }
}, 60_000);
