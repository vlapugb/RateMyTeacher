import type { MetricKey, Review, Teacher } from "@/lib/types";
import { RATING_SCALE } from "@/lib/app-config";

export type TeacherScoreMap = Record<MetricKey, number>;

export type TeacherStats = {
  teacherId: string;
  reviewCount: number;
  commentCount: number;
  scores: Partial<Record<MetricKey, number>>;
};

export const emptyScores: TeacherScoreMap = {
  knowledge: 0,
  communication: 0,
  leniency: 0,
  fairness: 0,
  vibe: 0,
  overall: 0,
};

export function resetTeacherRuntimeData(teacher: Teacher): Teacher {
  return {
    ...teacher,
    rating: 0,
    reviewCount: 0,
    commentCount: 0,
    recommendedPercent: 0,
    saved: false,
    scores: { ...emptyScores },
    courses: teacher.courses.map((course) => ({
      ...course,
      rating: 0,
      reviewCount: 0,
      commentCount: 0,
    })),
  };
}

export function resetTeachersRuntimeData(teachers: Teacher[]) {
  return teachers.map(resetTeacherRuntimeData);
}

export function applyStatsToTeacher(
  teacher: Teacher,
  stats: TeacherStats | undefined,
  saved: boolean,
): Teacher {
  const baseTeacher = resetTeacherRuntimeData(teacher);

  if (!stats) {
    return { ...baseTeacher, saved };
  }

  const ratingValues = Object.values(stats.scores).filter(
    (value): value is number => typeof value === "number",
  );
  const rating =
    stats.scores.overall ??
    (ratingValues.length > 0
      ? roundScore(
          ratingValues.reduce((sum, value) => sum + value, 0) /
            ratingValues.length,
        )
      : 0);
  const scores = {
    ...emptyScores,
    ...Object.fromEntries(
      Object.entries(stats.scores).map(([key, value]) => [key, value ?? 0]),
    ),
  } as TeacherScoreMap;

  return {
    ...baseTeacher,
    saved,
    rating,
    reviewCount: stats.reviewCount,
    commentCount: stats.commentCount,
    scores,
    courses: baseTeacher.courses.map((course) => ({
      ...course,
      rating,
      reviewCount: stats.reviewCount,
      commentCount: stats.commentCount,
    })),
  };
}

export function createPublicReview(input: {
  id: string;
  teacherId: string;
  author: string;
  course: string;
  createdAt: string;
  rating: number;
  hasRating?: boolean;
  body: string;
  anonymous: boolean;
  anonymousNumber?: number;
  scores?: Partial<Record<MetricKey, number>>;
  comment?: string;
  liked?: string;
  difficult?: string;
  examProcess?: string;
  advice?: string;
  likeCount?: number;
  likedByMe?: boolean;
  canEdit?: boolean;
}): Review {
  const author = input.anonymous
    ? input.anonymousNumber
      ? `Аноним #${input.anonymousNumber}`
      : "Анонимно"
    : input.author || "Студент";

  return {
    id: input.id,
    teacherId: input.teacherId,
    author,
    initial: author.trim().charAt(0).toUpperCase() || "С",
    course: input.course,
    year: "Опубликованный отзыв",
    createdAt: input.createdAt,
    createdAgo: formatCreatedAgo(input.createdAt),
    rating: input.rating,
    hasRating: input.hasRating,
    body: input.body,
    tags: input.anonymous ? ["анонимно"] : [],
    scores: input.scores,
    comment: input.comment,
    liked: input.liked,
    difficult: input.difficult,
    examProcess: input.examProcess,
    advice: input.advice,
    anonymous: input.anonymous,
    anonymousNumber: input.anonymousNumber,
    likeCount: input.likeCount ?? 0,
    likedByMe: input.likedByMe ?? false,
    canEdit: input.canEdit,
  };
}

function formatCreatedAgo(createdAt: string) {
  const timestamp = new Date(createdAt).getTime();

  if (!Number.isFinite(timestamp)) return "недавно";

  const diff = Date.now() - timestamp;
  const minutes = Math.max(0, Math.floor(diff / 60000));

  if (minutes < 1) return "только что";
  if (minutes < 60) return `${minutes} мин. назад`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ч. назад`;

  const days = Math.floor(hours / 24);
  return `${days} дн. назад`;
}

function roundScore(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * RATING_SCALE.roundingPrecision) /
    RATING_SCALE.roundingPrecision;
}
