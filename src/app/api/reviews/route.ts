import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { teachers } from "@/lib/mock-data";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import {
  createTeacherReview,
  deleteTeacherReview,
  getOwnReview,
  getPublicReviewsPage,
  updateTeacherReview,
  type ReviewSortKey,
} from "@/lib/teacher-store";

const scoreSchema = z.object({
  knowledge: z.number().min(1).max(5).optional(),
  communication: z.number().min(1).max(5).optional(),
  leniency: z.number().min(1).max(5).optional(),
  fairness: z.number().min(1).max(5).optional(),
  vibe: z.number().min(1).max(5).optional(),
  overall: z.number().min(1).max(5).optional(),
});

const createReviewSchema = z
  .object({
    teacherId: z.string().min(1),
    scores: scoreSchema,
    comment: z.string().max(500).default(""),
    liked: z.string().max(500).default(""),
    difficult: z.string().max(500).default(""),
    examProcess: z.string().max(500).default(""),
    advice: z.string().max(500).default(""),
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
  const { searchParams } = new URL(request.url);
  const teacherId = searchParams.get("teacherId");
  const limit = clampNumber(Number(searchParams.get("limit") ?? 20), 1, 50);
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
  const rateLimit = checkRateLimit(`reviews:post:${ip}`, 10);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Слишком много запросов. Попробуйте позже." },
      { status: 429, headers: getRateLimitHeaders(10, 0, `reviews:post:${ip}`) },
    );
  }

  const body = await readJson(request);

  if (body === null) {
    return NextResponse.json(
      { message: "Неверный формат данных." },
      { status: 400 },
    );
  }

  const parsed = createReviewSchema.safeParse(body);

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
  const rateLimit = checkRateLimit(`reviews:put:${ip}`, 10);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Слишком много запросов. Попробуйте позже." },
      { status: 429, headers: getRateLimitHeaders(10, 0, `reviews:put:${ip}`) },
    );
  }

  const body = await readJson(request);

  if (body === null) {
    return NextResponse.json(
      { message: "Неверный формат данных." },
      { status: 400 },
    );
  }

  const parsed = createReviewSchema.safeParse(body);

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
  const rateLimit = checkRateLimit(`reviews:delete:${ip}`, 10);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Слишком много запросов. Попробуйте позже." },
      { status: 429, headers: getRateLimitHeaders(10, 0, `reviews:delete:${ip}`) },
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

function getReviewComment(review: z.infer<typeof createReviewSchema>) {
  const parts = getReviewParts(review);

  return (
    parts.comment ||
    [parts.liked, parts.difficult, parts.examProcess, parts.advice]
      .filter(Boolean)
      .join(" ")
  );
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

  return "newest";
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
