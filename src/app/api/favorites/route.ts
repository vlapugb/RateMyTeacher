import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  addFavoriteTeacher,
  getFavoriteTeacherIds,
  removeFavoriteTeacher,
} from "@/lib/teacher-store";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { teachers } from "@/lib/mock-data";

const favoriteSchema = z.object({
  teacherId: z.string().min(1),
});

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json(
      { message: "Войдите, чтобы смотреть избранное." },
      { status: 401 },
    );
  }

  return NextResponse.json({
    teacherIds: Array.from(await getFavoriteTeacherIds(session.user.id)),
  });
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip")
    ?? "anonymous";
  const rateLimit = checkRateLimit(`favorites:${ip}`, 30);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Слишком много запросов. Попробуйте позже." },
      { status: 429, headers: getRateLimitHeaders(30, 0, `favorites:${ip}`) },
    );
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json(
      { message: "Войдите, чтобы добавить в избранное." },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = favoriteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Неверный формат данных." },
      { status: 400 },
    );
  }

  if (!teachers.some((teacher) => teacher.id === parsed.data.teacherId)) {
    return NextResponse.json(
      { message: "Преподаватель не найден." },
      { status: 400 },
    );
  }

  await addFavoriteTeacher(session.user.id, parsed.data.teacherId);

  return NextResponse.json({ saved: true });
}

export async function DELETE(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip")
    ?? "anonymous";
  const rateLimit = checkRateLimit(`favorites:${ip}`, 30);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Слишком много запросов. Попробуйте позже." },
      { status: 429, headers: getRateLimitHeaders(30, 0, `favorites:${ip}`) },
    );
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json(
      { message: "Войдите, чтобы изменить избранное." },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const teacherId = searchParams.get("teacherId");

  if (!teacherId) {
    return NextResponse.json(
      { message: "Преподаватель не найден." },
      { status: 400 },
    );
  }

  if (!teachers.some((teacher) => teacher.id === teacherId)) {
    return NextResponse.json(
      { message: "Преподаватель не найден." },
      { status: 400 },
    );
  }

  await removeFavoriteTeacher(session.user.id, teacherId);

  return NextResponse.json({ saved: false });
}
