import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { API_RATE_LIMITS } from "@/lib/app-config";
import { likeReviewSchema } from "@/lib/api-contracts";
import { setTeacherReviewLike } from "@/lib/teacher-store";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";

type RouteContext = {
  params: Promise<{
    reviewId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip")
    ?? "anonymous";
  const rateLimit = checkRateLimit(`likes:${ip}`, API_RATE_LIMITS.reviewLikes);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Слишком много запросов. Попробуйте позже." },
      {
        status: 429,
        headers: getRateLimitHeaders(
          API_RATE_LIMITS.reviewLikes,
          0,
          `likes:${ip}`,
        ),
      },
    );
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json(
      { message: "Войдите, чтобы оценить комментарий." },
      { status: 401 },
    );
  }

  const parsed = likeReviewSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Проверьте действие." },
      { status: 400 },
    );
  }

  const { reviewId } = await context.params;
  let result: Awaited<ReturnType<typeof setTeacherReviewLike>>;

  try {
    result = await setTeacherReviewLike(
      reviewId,
      session.user.id,
      parsed.data.liked,
    );
  } catch (error) {
    console.error("Failed to set review like", error);
    return NextResponse.json(
      { message: "Не удалось обновить оценку комментария." },
      { status: 500 },
    );
  }

  if (result == null) {
    return NextResponse.json(
      { message: "Комментарий не найден." },
      { status: 404 },
    );
  }

  return NextResponse.json(result);
}
