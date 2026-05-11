import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { API_RATE_LIMITS, REVIEW_CONFIG } from "@/lib/app-config";
import {
  reviewSortSchema,
  reviewWriteSchema,
  type ReviewSortKey,
  type ReviewWriteInput,
} from "@/lib/api-contracts";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { teachers } from "@/lib/teacher-catalog";
import {
  createTeacherReview,
  deleteTeacherReview,
  getOwnReview,
  getPublicReviewsPage,
  updateTeacherReview,
} from "@/lib/teacher-store";

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  const { searchParams } = new URL(request.url);
  const teacherId = searchParams.get("teacherId");
  const limit = clampNumber(
    Number(searchParams.get("limit") ?? REVIEW_CONFIG.defaultPageSize),
    1,
    REVIEW_CONFIG.maxPageSize,
  );
  const offset = Math.max(0, Number(searchParams.get("offset") ?? 0) || 0);
  const sort = getReviewSort(searchParams.get("sort"));

  if (!teacherId) {
    return NextResponse.json(
      { message: "Не указан преподаватель." },
      { status: 400 },
    );
  }

  const [reviewsPage, ownReview] = await Promise.all([
    getPublicReviewsPage({
      teacherId,
      userId: session?.user.id,
      limit,
      offset,
      sort,
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
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`reviews:post:${ip}`, API_RATE_LIMITS.reviewWrites);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Слишком много запросов. Попробуйте позже." },
      {
        status: 429,
        headers: getRateLimitHeaders(
          API_RATE_LIMITS.reviewWrites,
          0,
          `reviews:post:${ip}`,
        ),
      },
    );
  }

  const body = await readJson(request);

  if (body === null) {
    return NextResponse.json(
      { message: "Неверный формат данных." },
      { status: 400 },
    );
  }

  const parsed = reviewWriteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Проверьте поля формы." },
      { status: 400 },
    );
  }

  if (!teachers.some((teacher) => teacher.id === parsed.data.teacherId)) {
    return NextResponse.json(
      { message: "Преподаватель не найден." },
      { status: 404 },
    );
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
      return NextResponse.json(
        { message: "Войдите, чтобы поставить оценку. Комментарий можно оставить анонимно." },
        { status: 401 },
      );
    }

    if (!hasComment) {
      return NextResponse.json(
        { message: "Заполните комментарий." },
        { status: 400 },
      );
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
      { status: 201 },
    );
  }

  if (hasScore && !session.user.emailVerified) {
    return NextResponse.json(
      { message: "Подтвердите почту перед публикацией оценки." },
      { status: 403 },
    );
  }

  const existingReview = await getOwnReview(parsed.data.teacherId, session.user.id);

  if (existingReview) {
    return NextResponse.json(
      { message: "Вы уже оценили этого преподавателя. Измените существующий отзыв." },
      { status: 409 },
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

  return NextResponse.json({ ok: true, published: true }, { status: 201 });
}

export async function PUT(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`reviews:put:${ip}`, API_RATE_LIMITS.reviewWrites);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Слишком много запросов. Попробуйте позже." },
      {
        status: 429,
        headers: getRateLimitHeaders(
          API_RATE_LIMITS.reviewWrites,
          0,
          `reviews:put:${ip}`,
        ),
      },
    );
  }

  const body = await readJson(request);

  if (body === null) {
    return NextResponse.json(
      { message: "Неверный формат данных." },
      { status: 400 },
    );
  }

  const parsed = reviewWriteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Проверьте поля формы." },
      { status: 400 },
    );
  }

  if (!teachers.some((teacher) => teacher.id === parsed.data.teacherId)) {
    return NextResponse.json(
      { message: "Преподаватель не найден." },
      { status: 404 },
    );
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });
  const hasScore = hasReviewScore(parsed.data);

  if (!session) {
    return NextResponse.json(
      { message: "Войдите, чтобы изменить оценку." },
      { status: 401 },
    );
  }

  if (hasScore && !session.user.emailVerified) {
    return NextResponse.json(
      { message: "Подтвердите почту перед изменением оценки." },
      { status: 403 },
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
    return NextResponse.json(
      { message: "Сначала оставьте оценку." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true, updated: true });
}

export async function DELETE(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(
    `reviews:delete:${ip}`,
    API_RATE_LIMITS.reviewWrites,
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Слишком много запросов. Попробуйте позже." },
      {
        status: 429,
        headers: getRateLimitHeaders(
          API_RATE_LIMITS.reviewWrites,
          0,
          `reviews:delete:${ip}`,
        ),
      },
    );
  }

  const { searchParams } = new URL(request.url);
  const teacherId = searchParams.get("teacherId");

  if (!teacherId) {
    return NextResponse.json(
      { message: "Не указан преподаватель." },
      { status: 400 },
    );
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json(
      { message: "Войдите, чтобы удалить оценку." },
      { status: 401 },
    );
  }

  const deleted = await deleteTeacherReview(teacherId, session.user.id);

  if (!deleted) {
    return NextResponse.json(
      { message: "Оценка не найдена." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true, deleted: true });
}

function getReviewComment(review: ReviewWriteInput) {
  const parts = getReviewParts(review);

  return (
    parts.comment ||
    [parts.liked, parts.difficult, parts.examProcess, parts.advice]
      .filter(Boolean)
      .join(" ")
  );
}

function getReviewParts(review: ReviewWriteInput) {
  return {
    comment: review.comment.trim(),
    liked: review.liked.trim(),
    difficult: review.difficult.trim(),
    examProcess: review.examProcess.trim(),
    advice: review.advice.trim(),
  };
}

function hasReviewScore(review: ReviewWriteInput) {
  return Object.values(review.scores).some((value) => typeof value === "number");
}

function getReviewSort(value: string | null): ReviewSortKey {
  const parsed = reviewSortSchema.safeParse(value);
  if (parsed.success) return parsed.data;

  return REVIEW_CONFIG.defaultSort;
}

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;

  return Math.min(max, Math.max(min, Math.floor(value)));
}

async function readJson(request: Request) {
  return request.json().catch(() => null);
}

function getClientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip")
    ?? "anonymous";
}
