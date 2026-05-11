export const APP_NAME = "StudRadar";
<<<<<<< HEAD
export const FACULTY_TITLE = "Математико-механический факультет СПбГУ";

export const HTTP_STATUS = {
  created: 201,
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  conflict: 409,
  tooManyRequests: 429,
  internalServerError: 500,
} as const;

export const STORAGE_KEYS = {
  catalogState: "studradar:catalog-state",
  catalogIntroDismissed: "studradar:intro-dismissed",
  theme: "studradar:theme",
  language: "studradar:language",
  preferencesEvent: "studradar:preferences",
  anonymousRatings: "studradar:anonymous-ratings:v1",
} as const;

export const STUDENT_IDENTITY = {
  loginPrefix: "st",
  loginDigitCount: 6,
  emailDomain: "student.spbu.ru",
  exampleLogin: "st055555",
  passwordMinLength: 8,
  nameMinLength: 2,
  emailVerificationTtlSeconds: 60 * 60 * 24,
} as const;
=======
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)

export const RATING_SCALE = {
  min: 1,
  max: 5,
<<<<<<< HEAD
  displayMin: 0,
  displayMax: 5,
  stars: 5,
} as const;

export const REVIEW_CONFIG = {
  textMaxLength: 500,
  defaultPageSize: 20,
  maxPageSize: 50,
  defaultSort: "newest",
  approvedStatus: "approved",
  pendingStatus: "pending",
  statsCacheMs: 10_000,
} as const;

export const REVIEW_IDENTITY = {
  anonymousLabel: "Анонимно",
  anonymousTag: "анонимно",
  studentLabel: "Студент",
  generalCourseLabel: "Общая оценка преподавателя",
  publishedReviewLabel: "Опубликованный отзыв",
  anonymousPublicationLabel: "Анонимная публикация",
} as const;

export const CATALOG_CONFIG = {
  pageSize: 6,
  defaultSort: "rating",
  defaultSortDirection: "desc",
  introDismissDelayMs: 12_000,
  countDisplayLimit: 1000,
} as const;

export const API_RATE_LIMITS = {
  reviewWrites: 10,
  favoriteWrites: 30,
  commentLikes: 30,
} as const;

export const RATE_LIMIT_NAMESPACE = {
  reviewPost: "reviews:post",
  reviewPut: "reviews:put",
  reviewDelete: "reviews:delete",
  favorites: "favorites",
  likes: "likes",
} as const;

export const FALLBACK_CLIENT_ID = "anonymous";

export const DATABASE_POOL_SIZE = Number.parseInt(
  process.env.DATABASE_POOL_SIZE ?? "10",
  10,
);

export const SHARE_COPIED_DISPLAY_MS = 1800;
=======
  percentMultiplier: 20,
  roundingPrecision: 100,
} as const;

export const REVIEW_CONFIG = {
  defaultPageSize: 20,
  maxPageSize: 50,
  textMaxLength: 500,
  defaultSort: "newest",
  approvedStatus: "approved",
  statsCacheMs: 10_000,
} as const;

export const API_RATE_LIMITS = {
  reviewWrites: 10,
  favoriteWrites: 30,
  reviewLikes: 30,
  windowMs: 60_000,
} as const;

export const STUDENT_IDENTITY = {
  emailDomain: "student.spbu.ru",
  loginPattern: /^st[0-9]{6}$/,
  emailPattern: /^st[0-9]{6}@student\.spbu\.ru$/,
  passwordMinLength: 8,
  emailVerificationTtlSeconds: 60 * 60 * 24,
} as const;

export const STORAGE_KEYS = {
  theme: "studradar:theme",
  language: "studradar:language",
  preferencesEvent: "studradar:preferences",
  introDismissed: "studradar:intro-dismissed",
} as const;

export const CONTACT_CONFIG = {
  email:
    process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ||
    "bystepgoing@student.spbu.ru",
  telegramUrl:
    process.env.NEXT_PUBLIC_TELEGRAM_URL?.trim() ||
    "https://t.me/bystepgoing",
  telegramHandle:
    process.env.NEXT_PUBLIC_TELEGRAM_HANDLE?.trim() || "@bystepgoing",
} as const;

export const ANALYTICS_CONFIG = {
  yandexMetrikaId: process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID?.trim() || "",
} as const;
>>>>>>> 26926d9 (refactor: delete students from teachers list and refactor code)
