import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
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

const likeSchema = z.object({
  liked: z.boolean(),
});

type RouteContext = {
  params: Promise<{
    reviewId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const rateLimitResponse = createRateLimitResponse({
    request,
    namespace: RATE_LIMIT_NAMESPACE.likes,
    limit: API_RATE_LIMITS.commentLikes,
    message: "Слишком много запросов. Попробуйте позже.",
  });
  if (rateLimitResponse) return rateLimitResponse;

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return jsonMessage(
      "Войдите, чтобы оценить комментарий.",
      HTTP_STATUS.unauthorized,
    );
  }

  const parsed = likeSchema.safeParse(await readJson(request));

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
