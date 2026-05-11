import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { teachers } from "@/lib/teacher-catalog";
import { getTeachersWithStats } from "@/lib/teacher-store";
import { resetTeachersRuntimeData } from "@/lib/teacher-model";

export async function GET(request: Request) {
  const session = await auth.api
    .getSession({
      headers: request.headers,
    })
    .catch((error) => {
      logger.error({ err: error }, "Failed to resolve teacher request session");
      return null;
    });
  const { searchParams } = new URL(request.url);
  const allTeachers = await getTeachersWithStats(teachers, session?.user.id).catch(
    (error) => {
      logger.error({ err: error }, "Failed to load teachers with stats");
      return resetTeachersRuntimeData(teachers);
    },
  );
  const visibleTeachers =
    searchParams.get("favorite") === "true"
      ? allTeachers.filter((teacher) => teacher.saved)
      : allTeachers;

  return NextResponse.json({ teachers: visibleTeachers });
}
