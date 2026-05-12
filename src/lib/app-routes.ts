export const APP_ROUTES = {
  home: "/",
  teachers: "/teachers",
  favorites: "/favorites",
  account: "/account",
  faq: "/faq",
  about: "/about",
  resetPassword: "/reset-password",
  teacher: (teacherId: string) => `/teachers/${encodeURIComponent(teacherId)}`,
  teacherRate: (teacherId: string) =>
    `/teachers/${encodeURIComponent(teacherId)}/rate`,
  teacherReview: (teacherId: string, reviewId: string) =>
    `/teachers/${encodeURIComponent(teacherId)}?review=${encodeURIComponent(reviewId)}`,
  teacherCourses: (teacherId: string) =>
    `/teachers/${encodeURIComponent(teacherId)}?tab=courses`,
  teacherComments: (teacherId: string) =>
    `/teachers/${encodeURIComponent(teacherId)}?tab=comments`,
  legal: "/legal",
  legalTerms: "/legal/terms",
  legalPrivacy: "/legal/privacy",
  legalPersonalDataConsent: "/legal/personal-data-consent",
  legalCookies: "/legal/cookies",
  legalReviewRules: "/legal/review-rules",
  legalComplaint: "/legal/complaint",
  legalContacts: "/legal/contacts",
} as const;

export const TEACHER_QUERY_PARAM = {
  favorite: "favorite",
  teacherId: "teacherId",
  reviewId: "reviewId",
  limit: "limit",
  offset: "offset",
  sort: "sort",
  tab: "tab",
} as const;

export const API_ROUTES = {
  teachers: "/api/teachers",
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
  reviewLike: (reviewId: string) =>
    `/api/reviews/${encodeURIComponent(reviewId)}/like`,
  authRequestPasswordReset: "/api/auth/request-password-reset",
  authResetPassword: "/api/auth/reset-password",
  authChangePassword: "/api/auth/change-password",
  authSendVerificationEmail: "/api/auth/send-verification-email",
  consent: "/api/consent",
  complaints: "/api/complaints",
  moderation: "/api/moderation",
  moderationWebhook: "/api/moderation/webhook",
} as const;
