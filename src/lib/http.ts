import { NextResponse } from "next/server";
import {
  FALLBACK_CLIENT_ID,
  HTTP_STATUS,
} from "@/lib/app-config";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";

export async function readJson(request: Request): Promise<unknown | null> {
  return request.json().catch(() => null);
}

export function getClientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    FALLBACK_CLIENT_ID
  );
}

export function jsonMessage(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

export function createRateLimitResponse(input: {
  request: Request;
  namespace: string;
  limit: number;
  message: string;
}) {
  const key = `${input.namespace}:${getClientIp(input.request)}`;
  const rateLimit = checkRateLimit(key, input.limit);

  if (rateLimit.allowed) return null;

  return NextResponse.json(
    { message: input.message },
    {
      status: HTTP_STATUS.tooManyRequests,
      headers: getRateLimitHeaders(input.limit, 0, key),
    },
  );
}

export function parseBoundedInteger(
  value: string | null | undefined,
  options: {
    fallback: number;
    min: number;
    max?: number;
  },
) {
  const parsed = value == null ? Number.NaN : Number.parseInt(value, 10);

  if (!Number.isFinite(parsed)) return options.fallback;

  const lowerBounded = Math.max(options.min, parsed);
  return options.max == null
    ? lowerBounded
    : Math.min(options.max, lowerBounded);
}
