import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { API_RATE_LIMITS } from "@/lib/app-config";
import { likeReviewSchema } from "@/lib/api-contracts";
import { setTeacherReviewLike } from "@/lib/teacher-store";
import {
  API_RATE_LIMITS,
  HTTP_STATUS,
  RATE_LIMIT_NAMESPACE,
} from "@/lib/app-config";
import {
  createRateLimitResponse,
  jsonMessage,
  readJson,
} from "@/lib/http";
import { logger } from "@/lib/logger";

type RouteContext = {
  params: Promise<{
    reviewId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
<<<<<<< HEAD
  const rateLimitResponse = createRateLimitResponse({
    request,
    namespace: RATE_LIMIT_NAMESPACE.likes,
    limit: API_RATE_LIMITS.commentLikes,
    message: "Слишком много запросов. Попробуйте позже.",
  });
  if (rateLimitResponse) return rateLimitResponse;
=======
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
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return jsonMessage(
      "Войдите, чтобы оценить комментарий.",
      HTTP_STATUS.unauthorized,
    );
  }

<<<<<<< HEAD
  const parsed = likeSchema.safeParse(await readJson(request));
=======
  const parsed = likeReviewSchema.safeParse(await request.json().catch(() => null));
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)

  if (!parsed.success) {
    return jsonMessage("Проверьте действие.", HTTP_STATUS.badRequest);
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
    logger.error({ err: error }, "Failed to set review like");
    return jsonMessage(
      "Не удалось обновить оценку комментария.",
      HTTP_STATUS.internalServerError,
    );
  }

  if (result == null) {
    return jsonMessage("Комментарий не найден.", HTTP_STATUS.notFound);
  }

  return NextResponse.json(result);
}
