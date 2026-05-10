import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { setTeacherReviewLike } from "@/lib/teacher-store";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";

const likeSchema = z.object({
  liked: z.boolean(),
});

type RouteContext = {
  params: Promise<{
    reviewId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip")
    ?? "anonymous";
  const rateLimit = checkRateLimit(`likes:${ip}`, 30);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Слишком много запросов. Попробуйте позже." },
      { status: 429, headers: getRateLimitHeaders(30, 0, `likes:${ip}`) },
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

  const parsed = likeSchema.safeParse(await request.json().catch(() => null));

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
