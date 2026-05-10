import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { getUserTeacherActivitySummary } from "@/lib/teacher-store";

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json(
      { message: "Войдите, чтобы смотреть аккаунт." },
      { status: 401 },
    );
  }

  try {
    return NextResponse.json(
      await getUserTeacherActivitySummary(session.user.id),
    );
  } catch (error) {
    logger.error({ err: error }, "Failed to load account summary");
    return NextResponse.json(
      { message: "Не удалось загрузить сводку аккаунта." },
      { status: 500 },
    );
  }
}
