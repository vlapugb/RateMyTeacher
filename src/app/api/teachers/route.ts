import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { teachers } from "@/lib/mock-data";
import { getTeachersWithStats } from "@/lib/teacher-store";

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  const { searchParams } = new URL(request.url);
  const allTeachers = await getTeachersWithStats(teachers, session?.user.id);
  const visibleTeachers =
    searchParams.get("favorite") === "true"
      ? allTeachers.filter((teacher) => teacher.saved)
      : allTeachers;

  return NextResponse.json({ teachers: visibleTeachers });
}
