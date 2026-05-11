import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getRecentPublicReviews,
  type RecentReviewKind,
} from "@/lib/teacher-store";
import { REVIEW_CONFIG } from "@/lib/app-config";
import { parseBoundedInteger } from "@/lib/http";
import { logger } from "@/lib/logger";

const DEFAULT_RECENT_LIMIT = 10;

export async function GET(request: Request) {
  const session = await auth.api
    .getSession({
      headers: request.headers,
    })
    .catch((error) => {
      logger.warn({ err: error }, "Failed to load session for recent reviews");
      return null;
    });
  const { searchParams } = new URL(request.url);
  const kind = getRecentKind(searchParams.get("kind"));
  const limit = parseBoundedInteger(searchParams.get("limit"), {
    fallback: DEFAULT_RECENT_LIMIT,
    min: 1,
    max: REVIEW_CONFIG.maxPageSize,
  });
  const reviews = await getRecentPublicReviews({
    kind,
    userId: session?.user.id,
    limit,
  }).catch((error) => {
    logger.error({ err: error }, "Failed to load recent reviews");
    return [];
  });

  return NextResponse.json({ reviews, limit, kind });
}

function getRecentKind(value: string | null): RecentReviewKind {
  return value === "comments" ? "comments" : "reviews";
}
