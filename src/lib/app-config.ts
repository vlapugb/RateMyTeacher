export const APP_NAME = "StudRadar";

export const RATING_SCALE = {
  min: 1,
  max: 5,
  percentMultiplier: 20,
  roundingPrecision: 100,
} as const;

export const REVIEW_CONFIG = {
  defaultPageSize: 20,
  maxPageSize: 50,
  textMaxLength: 500,
  defaultSort: "newest",
  approvedStatus: "approved",
  pendingStatus: "pending",
  rejectedStatus: "rejected",
  needsEditStatus: "needs_edit",
  disputedStatus: "disputed",
  statsCacheMs: 10_000,
} as const;

export const MODERATION_CONFIG = {
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN?.trim() || "",
  telegramAdminId: process.env.TELEGRAM_ADMIN_ID?.trim() || "",
  webhookSecret: process.env.MODERATION_WEBHOOK_SECRET?.trim() || "",
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

export const LEGAL_CONFIG = {
  documentVersion: "1.0",
  adminName: "Администратор StudRadar",
  adminEmail:
    process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim() ||
    "admin@ratespbuteacher.ru",
  orgAddress: "199034, Санкт-Петербург, Университетская наб., д. 7–9",
  disclaimerText:
    "Сайт не является официальным ресурсом Санкт-Петербургского государственного университета, не аффилирован с ним и не действует от его имени.",
} as const;
