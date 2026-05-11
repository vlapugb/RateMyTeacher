import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { API_RATE_LIMITS } from "@/lib/app-config";
import { favoriteTeacherSchema } from "@/lib/api-contracts";
import {
  addFavoriteTeacher,
  getFavoriteTeacherIds,
  removeFavoriteTeacher,
} from "@/lib/teacher-store";
<<<<<<< HEAD
import { teachers } from "@/lib/mock-data";
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

const favoriteSchema = z.object({
  teacherId: z.string().min(1),
});
=======
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { teachers } from "@/lib/teacher-catalog";
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return jsonMessage(
      "Войдите, чтобы смотреть избранное.",
      HTTP_STATUS.unauthorized,
    );
  }

  return NextResponse.json({
    teacherIds: Array.from(await getFavoriteTeacherIds(session.user.id)),
  });
}

export async function POST(request: Request) {
<<<<<<< HEAD
  const rateLimitResponse = createRateLimitResponse({
    request,
    namespace: RATE_LIMIT_NAMESPACE.favorites,
    limit: API_RATE_LIMITS.favoriteWrites,
    message: "Слишком много запросов. Попробуйте позже.",
  });
  if (rateLimitResponse) return rateLimitResponse;
=======
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip")
    ?? "anonymous";
  const rateLimit = checkRateLimit(
    `favorites:${ip}`,
    API_RATE_LIMITS.favoriteWrites,
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Слишком много запросов. Попробуйте позже." },
      {
        status: 429,
        headers: getRateLimitHeaders(
          API_RATE_LIMITS.favoriteWrites,
          0,
          `favorites:${ip}`,
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
      "Войдите, чтобы добавить в избранное.",
      HTTP_STATUS.unauthorized,
    );
  }

<<<<<<< HEAD
  const body = await readJson(request);
  const parsed = favoriteSchema.safeParse(body);
=======
  const body = await request.json().catch(() => null);
  const parsed = favoriteTeacherSchema.safeParse(body);
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)

  if (!parsed.success) {
    return jsonMessage("Неверный формат данных.", HTTP_STATUS.badRequest);
  }

  if (!teachers.some((teacher) => teacher.id === parsed.data.teacherId)) {
    return jsonMessage("Преподаватель не найден.", HTTP_STATUS.badRequest);
  }

  await addFavoriteTeacher(session.user.id, parsed.data.teacherId);

  return NextResponse.json({ saved: true });
}

export async function DELETE(request: Request) {
<<<<<<< HEAD
  const rateLimitResponse = createRateLimitResponse({
    request,
    namespace: RATE_LIMIT_NAMESPACE.favorites,
    limit: API_RATE_LIMITS.favoriteWrites,
    message: "Слишком много запросов. Попробуйте позже.",
  });
  if (rateLimitResponse) return rateLimitResponse;
=======
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip")
    ?? "anonymous";
  const rateLimit = checkRateLimit(
    `favorites:${ip}`,
    API_RATE_LIMITS.favoriteWrites,
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Слишком много запросов. Попробуйте позже." },
      {
        status: 429,
        headers: getRateLimitHeaders(
          API_RATE_LIMITS.favoriteWrites,
          0,
          `favorites:${ip}`,
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
      "Войдите, чтобы изменить избранное.",
      HTTP_STATUS.unauthorized,
    );
  }

  const { searchParams } = new URL(request.url);
  const teacherId = searchParams.get("teacherId");

  if (!teacherId) {
    return jsonMessage("Преподаватель не найден.", HTTP_STATUS.badRequest);
  }

  if (!teachers.some((teacher) => teacher.id === teacherId)) {
    return jsonMessage("Преподаватель не найден.", HTTP_STATUS.badRequest);
  }

  await removeFavoriteTeacher(session.user.id, teacherId);

  return NextResponse.json({ saved: false });
}
