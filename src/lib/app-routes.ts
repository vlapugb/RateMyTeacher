export const APP_ROUTES = {
  teachers: "/teachers",
  favorites: "/favorites",
  account: "/account",
  faq: "/faq",
  about: "/about",
  resetPassword: "/reset-password",
  teacher: (teacherId: string) => `/teachers/${encodeURIComponent(teacherId)}`,
  teacherRate: (teacherId: string) =>
    `/teachers/${encodeURIComponent(teacherId)}/rate`,
  teacherCourses: (teacherId: string) =>
    `/teachers/${encodeURIComponent(teacherId)}?tab=courses`,
  teacherComments: (teacherId: string) =>
    `/teachers/${encodeURIComponent(teacherId)}?tab=comments`,
  teacherWithCatalog: (teacherId: string, catalogHref: string) =>
    `/teachers/${encodeURIComponent(teacherId)}?from=${encodeURIComponent(
      catalogHref,
    )}`,
} as const;

export const API_ROUTES = {
  teachers: "/api/teachers",
  favoriteTeachers: "/api/teachers?favorite=true",
  favorites: "/api/favorites",
  accountSummary: "/api/account/summary",
  reviews: "/api/reviews",
  recentReviews: "/api/reviews/recent",
  reviewsForTeacher: (teacherId: string) =>
    `/api/reviews?teacherId=${encodeURIComponent(teacherId)}`,
  reviewForTeacherById: (teacherId: string, reviewId: string) =>
    `/api/reviews?teacherId=${encodeURIComponent(
      teacherId,
    )}&reviewId=${encodeURIComponent(reviewId)}`,
  reviewLike: (reviewId: string) =>
    `/api/reviews/${encodeURIComponent(reviewId)}/like`,
  authRequestPasswordReset: "/api/auth/request-password-reset",
  authResetPassword: "/api/auth/reset-password",
  authChangePassword: "/api/auth/change-password",
  authSendVerificationEmail: "/api/auth/send-verification-email",
} as const;

export const TEACHER_QUERY_PARAM = {
  favorite: "favorite",
  from: "from",
  page: "page",
  query: "q",
  order: "order",
  sort: "sort",
  tab: "tab",
} as const;
