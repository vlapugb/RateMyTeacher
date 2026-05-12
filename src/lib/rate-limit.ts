import { API_RATE_LIMITS } from "@/lib/app-config";

type Bucket = {
  count: number;
  resetAt: number;
};

export type RateLimitStore = {
  get(key: string): Bucket | undefined;
  set(key: string, bucket: Bucket): void;
  delete(key: string): void;
  entries(): IterableIterator<[string, Bucket]>;
};

class MemoryRateLimitStore implements RateLimitStore {
  private readonly buckets = new Map<string, Bucket>();

  get(key: string) {
    return this.buckets.get(key);
  }

  set(key: string, bucket: Bucket) {
    this.buckets.set(key, bucket);
  }

  delete(key: string) {
    this.buckets.delete(key);
  }

  entries() {
    return this.buckets.entries();
  }
}

const store: RateLimitStore = new MemoryRateLimitStore();

setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of store.entries()) {
    if (bucket.resetAt <= now) {
      store.delete(key);
    }
  }
}, API_RATE_LIMITS.windowMs).unref();

export function checkRateLimit(
  key: string,
  limit: number,
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    const bucket: Bucket = { count: 1, resetAt: now + API_RATE_LIMITS.windowMs };
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
