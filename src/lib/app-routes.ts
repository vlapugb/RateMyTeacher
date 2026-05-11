export const APP_ROUTES = {
<<<<<<< HEAD
=======
  home: "/",
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)
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
<<<<<<< HEAD
  teacherWithCatalog: (teacherId: string, catalogHref: string) =>
    `/teachers/${encodeURIComponent(teacherId)}?from=${encodeURIComponent(
      catalogHref,
    )}`,
=======
} as const;

export const TEACHER_QUERY_PARAM = {
  favorite: "favorite",
  teacherId: "teacherId",
  reviewId: "reviewId",
  limit: "limit",
  offset: "offset",
  sort: "sort",
  tab: "tab",
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)
} as const;

export const API_ROUTES = {
  teachers: "/api/teachers",
<<<<<<< HEAD
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
=======
  favoriteTeachers: `/api/teachers?${TEACHER_QUERY_PARAM.favorite}=true`,
  favorites: "/api/favorites",
  accountSummary: "/api/account/summary",
  reviews: "/api/reviews",
  reviewsForTeacher: (teacherId: string) =>
    `/api/reviews?${TEACHER_QUERY_PARAM.teacherId}=${encodeURIComponent(teacherId)}`,
  reviewForTeacherById: (teacherId: string, reviewId: string) =>
    `/api/reviews?${TEACHER_QUERY_PARAM.teacherId}=${encodeURIComponent(
      teacherId,
    )}&${TEACHER_QUERY_PARAM.reviewId}=${encodeURIComponent(reviewId)}`,
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)
  reviewLike: (reviewId: string) =>
    `/api/reviews/${encodeURIComponent(reviewId)}/like`,
  authRequestPasswordReset: "/api/auth/request-password-reset",
  authResetPassword: "/api/auth/reset-password",
  authChangePassword: "/api/auth/change-password",
  authSendVerificationEmail: "/api/auth/send-verification-email",
} as const;
<<<<<<< HEAD

export const TEACHER_QUERY_PARAM = {
  favorite: "favorite",
  from: "from",
  page: "page",
  query: "q",
  order: "order",
  sort: "sort",
  tab: "tab",
} as const;
=======
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)
