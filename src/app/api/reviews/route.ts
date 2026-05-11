import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { teachers } from "@/lib/mock-data";
import { joinReviewTextParts } from "@/lib/teacher-model";
import {
  createTeacherReview,
  deleteTeacherReview,
  deleteTeacherReviewById,
  getOwnReview,
  getPublicReviewsPage,
  updateTeacherReview,
  type ReviewSortKey,
} from "@/lib/teacher-store";
import { isModeratorUser } from "@/lib/moderation";
import {
  API_RATE_LIMITS,
  HTTP_STATUS,
  RATE_LIMIT_NAMESPACE,
  RATING_SCALE,
  REVIEW_CONFIG,
} from "@/lib/app-config";
import {
  createRateLimitResponse,
  jsonMessage,
  parseBoundedInteger,
  readJson,
} from "@/lib/http";

const scoreSchema = z.object({
  knowledge: z.number().min(RATING_SCALE.min).max(RATING_SCALE.max).optional(),
  communication: z
    .number()
    .min(RATING_SCALE.min)
    .max(RATING_SCALE.max)
    .optional(),
  leniency: z.number().min(RATING_SCALE.min).max(RATING_SCALE.max).optional(),
  fairness: z.number().min(RATING_SCALE.min).max(RATING_SCALE.max).optional(),
  vibe: z.number().min(RATING_SCALE.min).max(RATING_SCALE.max).optional(),
  overall: z.number().min(RATING_SCALE.min).max(RATING_SCALE.max).optional(),
});

const createReviewSchema = z
  .object({
    teacherId: z.string().min(1),
    scores: scoreSchema,
    comment: z.string().max(REVIEW_CONFIG.textMaxLength).default(""),
    liked: z.string().max(REVIEW_CONFIG.textMaxLength).default(""),
    difficult: z.string().max(REVIEW_CONFIG.textMaxLength).default(""),
    examProcess: z.string().max(REVIEW_CONFIG.textMaxLength).default(""),
    advice: z.string().max(REVIEW_CONFIG.textMaxLength).default(""),
    anonymous: z.boolean().default(false),
    publishAnonymously: z.boolean().default(false),
  })
  .refine(
    (review) =>
      Object.values(review.scores).some((value) => typeof value === "number") ||
      [
        review.comment,
        review.liked,
        review.difficult,
        review.examProcess,
        review.advice,
      ].some((value) => value.trim().length > 0),
    { message: "Поставьте хотя бы одну оценку или заполните комментарий." },
  );

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  const canModerate = isModeratorUser(session?.user);
  const { searchParams } = new URL(request.url);
  const teacherId = searchParams.get("teacherId");
  const limit = parseBoundedInteger(searchParams.get("limit"), {
    fallback: REVIEW_CONFIG.defaultPageSize,
    min: 1,
    max: REVIEW_CONFIG.maxPageSize,
  });
  const offset = parseBoundedInteger(searchParams.get("offset"), {
    fallback: 0,
    min: 0,
  });
  const sort = getReviewSort(searchParams.get("sort"));

  if (!teacherId) {
    return jsonMessage("Не указан преподаватель.", HTTP_STATUS.badRequest);
  }

  const [reviewsPage, ownReview] = await Promise.all([
    getPublicReviewsPage({
      teacherId,
      userId: session?.user.id,
      limit,
      offset,
      sort,
      canModerate,
    }),
    session ? getOwnReview(teacherId, session.user.id) : null,
  ]);

  return NextResponse.json({
    reviews: reviewsPage.reviews,
    ownReview,
    total: reviewsPage.total,
    limit,
    offset,
    hasMore: offset + reviewsPage.reviews.length < reviewsPage.total,
  });
}

export async function POST(request: Request) {
  const rateLimitResponse = createReviewWriteRateLimitResponse(
    request,
    RATE_LIMIT_NAMESPACE.reviewPost,
  );
  if (rateLimitResponse) return rateLimitResponse;

  const body = await readJson(request);

  if (body === null) {
    return jsonMessage("Неверный формат данных.", HTTP_STATUS.badRequest);
  }

  const parsed = createReviewSchema.safeParse(body);

  if (!parsed.success) {
    return jsonMessage("Проверьте поля формы.", HTTP_STATUS.badRequest);
  }

  if (!teachers.some((teacher) => teacher.id === parsed.data.teacherId)) {
    return jsonMessage("Преподаватель не найден.", HTTP_STATUS.notFound);
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });
  const hasScore = hasReviewScore(parsed.data);
  const comment = getReviewComment(parsed.data);
  const hasComment = comment.length > 0;
  const parts = getReviewParts(parsed.data);

  if (!session) {
    if (hasScore) {
      return jsonMessage(
        "Войдите, чтобы поставить оценку. Комментарий можно оставить анонимно.",
        HTTP_STATUS.unauthorized,
      );
    }

    if (!hasComment) {
      return jsonMessage("Заполните комментарий.", HTTP_STATUS.badRequest);
    }

    await createTeacherReview({
      teacherId: parsed.data.teacherId,
      userId: null,
      authorName: null,
      scores: {},
      ...parts,
      anonymous: true,
    });

    return NextResponse.json(
      { ok: true, published: true, anonymous: true },
      { status: HTTP_STATUS.created },
    );
  }

  if (hasScore && !session.user.emailVerified) {
    return jsonMessage(
      "Подтвердите почту перед публикацией оценки.",
      HTTP_STATUS.forbidden,
    );
  }

  const existingReview = await getOwnReview(
    parsed.data.teacherId,
    session.user.id,
  );

  if (existingReview) {
    return jsonMessage(
      "Вы уже оценили этого преподавателя. Измените существующий отзыв.",
      HTTP_STATUS.conflict,
    );
  }

  await createTeacherReview({
    teacherId: parsed.data.teacherId,
    userId: session.user.id,
    authorName: session.user.name ?? null,
    scores: parsed.data.scores,
    ...parts,
    anonymous: parsed.data.publishAnonymously || parsed.data.anonymous,
  });

  return NextResponse.json(
    { ok: true, published: true },
    { status: HTTP_STATUS.created },
  );
}

export async function PUT(request: Request) {
  const rateLimitResponse = createReviewWriteRateLimitResponse(
    request,
    RATE_LIMIT_NAMESPACE.reviewPut,
  );
  if (rateLimitResponse) return rateLimitResponse;

  const body = await readJson(request);

  if (body === null) {
    return jsonMessage("Неверный формат данных.", HTTP_STATUS.badRequest);
  }

  const parsed = createReviewSchema.safeParse(body);

  if (!parsed.success) {
    return jsonMessage("Проверьте поля формы.", HTTP_STATUS.badRequest);
  }

  if (!teachers.some((teacher) => teacher.id === parsed.data.teacherId)) {
    return jsonMessage("Преподаватель не найден.", HTTP_STATUS.notFound);
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });
  const hasScore = hasReviewScore(parsed.data);

  if (!session) {
    return jsonMessage(
      "Войдите, чтобы изменить оценку.",
      HTTP_STATUS.unauthorized,
    );
  }

  if (hasScore && !session.user.emailVerified) {
    return jsonMessage(
      "Подтвердите почту перед изменением оценки.",
      HTTP_STATUS.forbidden,
    );
  }

  const parts = getReviewParts(parsed.data);

  const updated = await updateTeacherReview({
    teacherId: parsed.data.teacherId,
    userId: session.user.id,
    authorName: session.user.name ?? null,
    scores: parsed.data.scores,
    ...parts,
    anonymous: parsed.data.publishAnonymously || parsed.data.anonymous,
  });

  if (!updated) {
    return jsonMessage("Сначала оставьте оценку.", HTTP_STATUS.notFound);
  }

  return NextResponse.json({ ok: true, updated: true });
}

export async function DELETE(request: Request) {
  const rateLimitResponse = createReviewWriteRateLimitResponse(
    request,
    RATE_LIMIT_NAMESPACE.reviewDelete,
  );
  if (rateLimitResponse) return rateLimitResponse;

  const { searchParams } = new URL(request.url);
  const teacherId = searchParams.get("teacherId");
  const reviewId = searchParams.get("reviewId");

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return jsonMessage(
      "Войдите, чтобы удалить оценку.",
      HTTP_STATUS.unauthorized,
    );
  }

  const canModerate = isModeratorUser(session.user);

  if (canModerate && reviewId) {
    const deleted = await deleteTeacherReviewById(reviewId);

    if (!deleted) {
      return jsonMessage("Оценка не найдена.", HTTP_STATUS.notFound);
    }

    return NextResponse.json({ ok: true, deleted: true });
  }

  if (!teacherId) {
    return jsonMessage("Не указан преподаватель.", HTTP_STATUS.badRequest);
  }

  const deleted = await deleteTeacherReview(teacherId, session.user.id);

  if (!deleted) {
    return jsonMessage("Оценка не найдена.", HTTP_STATUS.notFound);
  }

  return NextResponse.json({ ok: true, deleted: true });
}

function getReviewComment(review: z.infer<typeof createReviewSchema>) {
  const parts = getReviewParts(review);

  return parts.comment || joinReviewTextParts(parts);
}

function getReviewParts(review: z.infer<typeof createReviewSchema>) {
  return {
    comment: review.comment.trim(),
    liked: review.liked.trim(),
    difficult: review.difficult.trim(),
    examProcess: review.examProcess.trim(),
    advice: review.advice.trim(),
  };
}

function hasReviewScore(review: z.infer<typeof createReviewSchema>) {
  return Object.values(review.scores).some((value) => typeof value === "number");
}

function getReviewSort(value: string | null): ReviewSortKey {
  if (value === "highest" || value === "lowest") return value;

  return REVIEW_CONFIG.defaultSort;
}

function createReviewWriteRateLimitResponse(request: Request, namespace: string) {
  return createRateLimitResponse({
    request,
    namespace,
    limit: API_RATE_LIMITS.reviewWrites,
    message: "Слишком много запросов. Попробуйте позже.",
  });
}
