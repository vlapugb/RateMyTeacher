const WINDOW_MS = 60_000;

type Bucket = {
  count: number;
  resetAt: number;
};

const store = new Map<string, Bucket>();

setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of store) {
    if (bucket.resetAt <= now) {
      store.delete(key);
    }
  }
}, 60_000).unref();

export function checkRateLimit(
  key: string,
  limit: number,
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    const bucket: Bucket = { count: 1, resetAt: now + WINDOW_MS };
    store.set(key, bucket);
    return { allowed: true, remaining: limit - 1 };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count };
}

export function getRateLimitHeaders(
  limit: number,
  remaining: number,
  key: string,
): Record<string, string> {
  const bucket = store.get(key);
  const retryAfter = bucket ? Math.ceil((bucket.resetAt - Date.now()) / 1000) : 60;

  return {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(retryAfter),
    "Retry-After": String(retryAfter),
  };
}
