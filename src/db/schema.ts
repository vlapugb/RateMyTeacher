import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const courseTypeEnum = pgEnum("course_type", ["pi", "tp"]);
export const moderationStatusEnum = pgEnum("moderation_status", [
  "pending",
  "approved",
  "rejected",
]);
export const favoriteTargetEnum = pgEnum("favorite_target", [
  "teacher",
  "course",
]);

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

export const teachers = pgTable(
  "teachers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fullName: text("full_name").notNull(),
    department: text("department"),
    bio: text("bio"),
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    nameIdx: index("teachers_full_name_idx").on(table.fullName),
  }),
);

export const courses = pgTable(
  "courses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    type: courseTypeEnum("type").notNull(),
    semester: integer("semester"),
    description: text("description"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    titleIdx: index("courses_title_idx").on(table.title),
  }),
);

export const teacherCourses = pgTable(
  "teacher_courses",
  {
    teacherId: uuid("teacher_id")
      .notNull()
      .references(() => teachers.id, { onDelete: "cascade" }),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.teacherId, table.courseId] }),
  }),
);

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    teacherId: uuid("teacher_id")
      .notNull()
      .references(() => teachers.id, { onDelete: "cascade" }),
    courseId: uuid("course_id").references(() => courses.id, {
      onDelete: "set null",
    }),
    knowledge: numeric("knowledge", { precision: 3, scale: 1 }).notNull(),
    communication: numeric("communication", { precision: 3, scale: 1 }).notNull(),
    leniency: numeric("leniency", { precision: 3, scale: 1 }).notNull(),
    fairness: numeric("fairness", { precision: 3, scale: 1 }).notNull(),
    vibe: numeric("vibe", { precision: 3, scale: 1 }).notNull(),
    overall: numeric("overall", { precision: 3, scale: 1 }).notNull(),
    liked: text("liked").notNull(),
    difficult: text("difficult").notNull(),
    examProcess: text("exam_process").notNull(),
    advice: text("advice").notNull(),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    anonymous: boolean("anonymous").notNull().default(false),
    status: moderationStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    teacherIdx: index("reviews_teacher_id_idx").on(table.teacherId),
    courseIdx: index("reviews_course_id_idx").on(table.courseId),
    statusIdx: index("reviews_status_idx").on(table.status),
    knowledgeCheck: check(
      "reviews_knowledge_check",
      sql`${table.knowledge} >= 1 and ${table.knowledge} <= 5`,
    ),
    communicationCheck: check(
      "reviews_communication_check",
      sql`${table.communication} >= 1 and ${table.communication} <= 5`,
    ),
    leniencyCheck: check(
      "reviews_leniency_check",
      sql`${table.leniency} >= 1 and ${table.leniency} <= 5`,
    ),
    fairnessCheck: check(
      "reviews_fairness_check",
      sql`${table.fairness} >= 1 and ${table.fairness} <= 5`,
    ),
    vibeCheck: check(
      "reviews_vibe_check",
      sql`${table.vibe} >= 1 and ${table.vibe} <= 5`,
    ),
    overallCheck: check(
      "reviews_overall_check",
      sql`${table.overall} >= 1 and ${table.overall} <= 5`,
    ),
  }),
);

export const comments = pgTable(
  "comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reviewId: uuid("review_id")
      .notNull()
      .references(() => reviews.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    status: moderationStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    reviewIdx: index("comments_review_id_idx").on(table.reviewId),
  }),
);

export const favorites = pgTable(
  "favorites",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    targetType: favoriteTargetEnum("target_type").notNull(),
    targetId: uuid("target_id").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.targetType, table.targetId] }),
  }),
);

export const recentViews = pgTable(
  "recent_views",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    targetType: favoriteTargetEnum("target_type").notNull(),
    targetId: uuid("target_id").notNull(),
    title: text("title").notNull(),
    subtitle: text("subtitle"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("recent_views_user_id_idx").on(table.userId),
  }),
);

export const reviewDrafts = pgTable(
  "review_drafts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    teacherId: uuid("teacher_id").references(() => teachers.id, {
      onDelete: "set null",
    }),
    courseId: uuid("course_id").references(() => courses.id, {
      onDelete: "set null",
    }),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("review_drafts_user_id_idx").on(table.userId),
  }),
);

export const faqItems = pgTable("faq_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  position: integer("position").notNull().default(0),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
