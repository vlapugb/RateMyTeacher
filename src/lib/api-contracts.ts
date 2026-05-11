import { z } from "zod";
import { RATING_SCALE, REVIEW_CONFIG } from "@/lib/app-config";
import type { Review, Teacher } from "@/lib/types";

export const reviewSortSchema = z.enum(["newest", "highest", "lowest"]);
export type ReviewSortKey = z.infer<typeof reviewSortSchema>;

export const scoreSchema = z.object({
  knowledge: z
    .number()
    .min(RATING_SCALE.min)
    .max(RATING_SCALE.max)
    .optional(),
  communication: z
    .number()
    .min(RATING_SCALE.min)
    .max(RATING_SCALE.max)
    .optional(),
  leniency: z
    .number()
    .min(RATING_SCALE.min)
    .max(RATING_SCALE.max)
    .optional(),
  fairness: z
    .number()
    .min(RATING_SCALE.min)
    .max(RATING_SCALE.max)
    .optional(),
  vibe: z.number().min(RATING_SCALE.min).max(RATING_SCALE.max).optional(),
  overall: z.number().min(RATING_SCALE.min).max(RATING_SCALE.max).optional(),
});

export const reviewWriteSchema = z
  .object({
    teacherId: z.string().min(1),
    scores: scoreSchema,
    comment: z.string().max(REVIEW_CONFIG.textMaxLength).default(""),
    liked: z.string().max(REVIEW_CONFIG.textMaxLength).default(""),
    difficult: z.string().max(REVIEW_CONFIG.textMaxLength).default(""),
    examProcess: z.string().max(REVIEW_CONFIG.textMaxLength).default(""),
    advice: z.string().max(REVIEW_CONFIG.textMaxLength).default(""),
    anonymous: z.boolean().default(false),
    publishAnonymously: z.boolean().default(false),
  })
  .refine(
    (review) =>
      Object.values(review.scores).some((value) => typeof value === "number") ||
      [
        review.comment,
        review.liked,
        review.difficult,
        review.examProcess,
        review.advice,
      ].some((value) => value.trim().length > 0),
    { message: "Поставьте хотя бы одну оценку или заполните комментарий." },
  );

export const favoriteTeacherSchema = z.object({
  teacherId: z.string().min(1),
});

export const likeReviewSchema = z.object({
  liked: z.boolean(),
});

export type ReviewWriteInput = z.infer<typeof reviewWriteSchema>;
export type ReviewCreateInput = ReviewWriteInput;
export type ReviewUpdateInput = ReviewWriteInput;

export type TeachersResponse = {
  teachers: Teacher[];
};

export type ReviewsPageResponse = {
  reviews: Review[];
  ownReview: Review | null;
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};

export type ReviewWriteResponse = {
  ok: true;
  published?: true;
  updated?: true;
  deleted?: true;
  anonymous?: boolean;
};

export type ReviewLikeResponse = {
  likeCount: number;
  likedByMe: boolean;
};

export type AccountSummaryResponse = {
  reviewCount: number;
  commentCount: number;
  favoriteCount: number;
  lastReviewAt: string | null;
};
