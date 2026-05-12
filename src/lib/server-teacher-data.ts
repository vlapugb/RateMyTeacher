import { auth } from "@/lib/auth";
import { REVIEW_CONFIG } from "@/lib/app-config";
import type { ReviewsPageResponse } from "@/lib/api-contracts";
import { logger } from "@/lib/logger";
import { teachers } from "@/lib/teacher-catalog";
import {
  getOwnReview,
  getPublicReviewsPage,
  getTeachersWithStats,
} from "@/lib/teacher-store";
import {
  resetTeacherRuntimeData,
  resetTeachersRuntimeData,
} from "@/lib/teacher-model";
import type { Teacher } from "@/lib/types";

export type TeacherProfileInitialData = {
  teacher: Teacher;
  reviewsPage: ReviewsPageResponse;
};

export async function getInitialTeachers(requestHeaders: Headers) {
  try {
    const session = await auth.api.getSession({ headers: requestHeaders });
    return await getTeachersWithStats(teachers, session?.user.id);
  } catch (error) {
    logger.error({ err: error }, "Failed to load initial teacher catalog");
    return resetTeachersRuntimeData(teachers);
  }
}

export async function getInitialTeacherProfile(
  teacherId: string,
  requestHeaders: Headers,
): Promise<TeacherProfileInitialData | null> {
  const staticTeacher = teachers.find((teacher) => teacher.id === teacherId);

  if (!staticTeacher) return null;

  try {
    const session = await auth.api.getSession({ headers: requestHeaders });
    const [catalogTeachers, reviewsPage, ownReview] = await Promise.all([
      getTeachersWithStats(teachers, session?.user.id),
      getPublicReviewsPage({
        teacherId,
        userId: session?.user.id,
        limit: REVIEW_CONFIG.defaultPageSize,
        offset: 0,
        sort: REVIEW_CONFIG.defaultSort,
      }),
      session ? getOwnReview(teacherId, session.user.id) : null,
    ]);
    const teacher =
      catalogTeachers.find((item) => item.id === teacherId) ??
      resetTeacherRuntimeData(staticTeacher);

    return {
      teacher,
      reviewsPage: {
        reviews: reviewsPage.reviews,
        ownReview,
        total: reviewsPage.total,
        limit: REVIEW_CONFIG.defaultPageSize,
        offset: 0,
        hasMore: reviewsPage.reviews.length < reviewsPage.total,
      },
    };
  } catch (error) {
    logger.error({ err: error, teacherId }, "Failed to load initial teacher profile");
    return {
      teacher: resetTeacherRuntimeData(staticTeacher),
      reviewsPage: {
        reviews: [],
        ownReview: null,
        total: 0,
        limit: REVIEW_CONFIG.defaultPageSize,
        offset: 0,
        hasMore: false,
      },
    };
  }
}
