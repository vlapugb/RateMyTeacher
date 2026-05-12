import {
  boolean,
  check,
  index,
  integer,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const MODERATION_ACTIONS = [
  "approve",
  "reject",
  "request_edit",
  "ban_user",
  "dispute",
  "restore",
] as const;

export const CONSENT_TYPES = [
  "terms_of_service",
  "personal_data",
  "cookies_analytics",
  "cookies_marketing",
] as const;

export const COMPLAINT_STATUSES = ["new", "resolved", "dismissed"] as const;

export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    login: text("login").notNull(),
    email: text("email").notNull(),
    emailVerified: boolean("emailVerified").notNull().default(false),
    image: text("image"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (table) => ({
    emailIdx: uniqueIndex("user_email_idx").on(table.email),
    loginIdx: uniqueIndex("user_login_idx").on(table.login),
  }),
);

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    token: text("token").notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (table) => ({
    tokenIdx: uniqueIndex("session_token_idx").on(table.token),
    userIdx: index("session_user_id_idx").on(table.userId),
  }),
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
    refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
    scope: text("scope"),
    idToken: text("idToken"),
    password: text("password"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("account_user_id_idx").on(table.userId),
    providerAccountIdx: uniqueIndex("account_provider_account_idx").on(
      table.providerId,
      table.accountId,
    ),
  }),
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (table) => ({
    identifierIdx: index("verification_identifier_idx").on(table.identifier),
  }),
);

export const teacherReviews = pgTable(
  "teacher_reviews",
  {
    id: text("id").primaryKey(),
    teacherId: text("teacher_id").notNull(),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
    authorName: text("author_name"),
    knowledge: numeric("knowledge", { precision: 3, scale: 1 }),
    communication: numeric("communication", { precision: 3, scale: 1 }),
    leniency: numeric("leniency", { precision: 3, scale: 1 }),
    fairness: numeric("fairness", { precision: 3, scale: 1 }),
    vibe: numeric("vibe", { precision: 3, scale: 1 }),
    overall: numeric("overall", { precision: 3, scale: 1 }),
    comment: text("comment").notNull().default(""),
    liked: text("liked").notNull().default(""),
    difficult: text("difficult").notNull().default(""),
    examProcess: text("exam_process").notNull().default(""),
    advice: text("advice").notNull().default(""),
    anonymous: boolean("anonymous").notNull().default(false),
    anonymousNumber: integer("anonymous_number"),
    status: text("status").notNull().default("pending"),
    moderationReason: text("moderation_reason"),
    moderatedBy: text("moderated_by"),
    moderatedAt: timestamp("moderated_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    teacherIdx: index("teacher_reviews_teacher_id_idx").on(table.teacherId),
    teacherStatusCreatedIdx: index(
      "teacher_reviews_teacher_status_created_idx",
    ).on(table.teacherId, table.status, table.createdAt),
    statusTeacherIdx: index("teacher_reviews_status_teacher_idx").on(
      table.status,
      table.teacherId,
    ),
    userIdx: index("teacher_reviews_user_id_idx").on(table.userId),
    userTeacherIdx: uniqueIndex("teacher_reviews_user_teacher_idx")
      .on(table.userId, table.teacherId)
      .where(sql`${table.userId} is not null`),
    userTeacherStatusIdx: index("teacher_reviews_user_teacher_status_idx")
      .on(table.userId, table.teacherId, table.status)
      .where(sql`${table.userId} is not null`),
    anonymousNumberIdx: index("teacher_reviews_anonymous_number_idx")
      .on(table.teacherId, table.anonymousNumber)
      .where(sql`${table.userId} is null and ${table.anonymous} = true`),
    knowledgeCheck: check(
      "teacher_reviews_knowledge_range_check",
      sql`${table.knowledge} is null or (${table.knowledge} >= 1 and ${table.knowledge} <= 5)`,
    ),
    communicationCheck: check(
      "teacher_reviews_communication_range_check",
      sql`${table.communication} is null or (${table.communication} >= 1 and ${table.communication} <= 5)`,
    ),
    leniencyCheck: check(
      "teacher_reviews_leniency_range_check",
      sql`${table.leniency} is null or (${table.leniency} >= 1 and ${table.leniency} <= 5)`,
    ),
    fairnessCheck: check(
      "teacher_reviews_fairness_range_check",
      sql`${table.fairness} is null or (${table.fairness} >= 1 and ${table.fairness} <= 5)`,
    ),
    vibeCheck: check(
      "teacher_reviews_vibe_range_check",
      sql`${table.vibe} is null or (${table.vibe} >= 1 and ${table.vibe} <= 5)`,
    ),
    overallCheck: check(
      "teacher_reviews_overall_range_check",
      sql`${table.overall} is null or (${table.overall} >= 1 and ${table.overall} <= 5)`,
    ),
  }),
);

export const moderationLogs = pgTable(
  "moderation_logs",
  {
    id: text("id").primaryKey(),
    reviewId: text("review_id")
      .notNull()
      .references(() => teacherReviews.id, { onDelete: "cascade" }),
    adminId: text("admin_id").notNull(),
    action: text("action").notNull(),
    reason: text("reason"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    reviewIdx: index("moderation_logs_review_idx").on(table.reviewId),
    adminIdx: index("moderation_logs_admin_idx").on(table.adminId),
    createdIdx: index("moderation_logs_created_idx").on(table.createdAt),
  }),
);

export const userConsents = pgTable(
  "user_consents",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
    consentType: text("consent_type").notNull(),
    documentVersion: text("document_version").notNull().default("1.0"),
    acceptedAt: timestamp("accepted_at").notNull().defaultNow(),
    ipHash: text("ip_hash").notNull(),
    userAgentHash: text("user_agent_hash").notNull(),
  },
  (table) => ({
    userIdx: index("user_consents_user_idx").on(table.userId),
    typeUserIdx: index("user_consents_type_user_idx").on(
      table.userId,
      table.consentType,
    ),
  }),
);

export const complaintLogs = pgTable(
  "complaint_logs",
  {
    id: text("id").primaryKey(),
    reviewId: text("review_id")
      .notNull()
      .references(() => teacherReviews.id, { onDelete: "cascade" }),
    complainantName: text("complainant_name"),
    complainantEmail: text("complainant_email"),
    reason: text("reason").notNull(),
    details: text("details"),
    status: text("status").notNull().default("new"),
    adminId: text("admin_id"),
    adminNotes: text("admin_notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    reviewIdx: index("complaint_logs_review_idx").on(table.reviewId),
    statusIdx: index("complaint_logs_status_idx").on(table.status),
  }),
);

export const teacherFavorites = pgTable(
  "teacher_favorites",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    teacherId: text("teacher_id").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.teacherId] }),
  }),
);

export const teacherReviewLikes = pgTable(
  "teacher_review_likes",
  {
    reviewId: text("review_id")
      .notNull()
      .references(() => teacherReviews.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.reviewId, table.userId] }),
    reviewIdx: index("teacher_review_likes_review_id_idx").on(table.reviewId),
    userIdx: index("teacher_review_likes_user_id_idx").on(table.userId),
  }),
);


