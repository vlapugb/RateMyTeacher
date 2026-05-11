import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
<<<<<<< HEAD
import { teachers } from "@/lib/mock-data";
import { logger } from "@/lib/logger";
import { resetTeachersRuntimeData } from "@/lib/teacher-model";
import { getTeachersWithStats } from "@/lib/teacher-store";
import { TEACHER_QUERY_PARAM } from "@/lib/app-routes";

export async function GET(request: Request) {
  // The catalog is public. Session is only used to mark favorites.
=======
import { logger } from "@/lib/logger";
import { teachers } from "@/lib/teacher-catalog";
import { getTeachersWithStats } from "@/lib/teacher-store";
import { resetTeachersRuntimeData } from "@/lib/teacher-model";

export async function GET(request: Request) {
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)
  const session = await auth.api
    .getSession({
      headers: request.headers,
    })
    .catch((error) => {
<<<<<<< HEAD
      logger.warn({ err: error }, "Failed to load session for teachers list");
      return null;
    });
  const { searchParams } = new URL(request.url);
  const allTeachers = await getTeachersWithStats(
    teachers,
    session?.user.id,
  ).catch((error) => {
    logger.error({ err: error }, "Failed to load teacher runtime stats");
    return resetTeachersRuntimeData(teachers);
  });
=======
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
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)
  const visibleTeachers =
    searchParams.get(TEACHER_QUERY_PARAM.favorite) === "true"
      ? allTeachers.filter((teacher) => teacher.saved)
      : allTeachers;

  return NextResponse.json({ teachers: visibleTeachers });
}
