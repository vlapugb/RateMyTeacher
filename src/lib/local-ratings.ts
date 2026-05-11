"use client";

import { useLayoutEffect, useMemo, useState } from "react";
import { STORAGE_KEYS } from "@/lib/app-config";
import { roundScore } from "@/lib/teacher-model";
import type { MetricKey, Review, Teacher } from "@/lib/types";

const STORAGE_KEY = STORAGE_KEYS.anonymousRatings;
const STORAGE_EVENT = "studradar:ratings-updated";

export type LocalRating = {
  id: string;
  teacherId: string;
  scores: Record<MetricKey, number>;
  comment: string;
  createdAt: string;
};

export type LocalRatingInput = Omit<LocalRating, "id" | "createdAt">;

export function saveLocalRating(input: LocalRatingInput) {
  if (typeof window === "undefined") return;

  try {
    const ratings = getLocalRatings();
    const rating: LocalRating = {
      ...input,
      id: createLocalId(),
      createdAt: new Date().toISOString(),
    };

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([rating, ...ratings]),
    );
    window.dispatchEvent(new Event(STORAGE_EVENT));
  } catch (error) {
    console.error("Failed to save local rating", error);
  }
}

export function useLocalTeachers(baseTeachers: Teacher[]) {
  const ratings = useLocalRatings();

  return useMemo(
    () => baseTeachers.map((teacher) => applyLocalRatingsToTeacher(teacher, ratings)),
    [baseTeachers, ratings],
  );
}

export function useLocalTeacher(baseTeacher: Teacher) {
  const ratings = useLocalRatings();

  return useMemo(
    () => applyLocalRatingsToTeacher(baseTeacher, ratings),
    [baseTeacher, ratings],
  );
}

export function useLocalComments(teacherId: string): Review[] {
  const ratings = useLocalRatings();

  return useMemo(
    () =>
      ratings
        .filter((rating) => rating.teacherId === teacherId && rating.comment)
        .map((rating) => ({
          id: rating.id,
          teacherId: rating.teacherId,
          author: "Анонимно",
          initial: "А",
          course: "Общая оценка преподавателя",
          year: "Анонимная публикация",
          createdAt: rating.createdAt,
          createdAgo: "только что",
          rating: rating.scores.overall,
          body: rating.comment,
          tags: ["анонимно"],
        })),
    [ratings, teacherId],
  );
}

export function buildRatingComment(parts: string[]) {
  return parts
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ");
}

function useLocalRatings() {
  const [ratings, setRatings] = useState<LocalRating[]>([]);

  useLayoutEffect(() => {
    function syncRatings() {
      setRatings(getLocalRatings());
    }

    syncRatings();
    window.addEventListener("storage", syncRatings);
    window.addEventListener(STORAGE_EVENT, syncRatings);

    return () => {
      window.removeEventListener("storage", syncRatings);
      window.removeEventListener(STORAGE_EVENT, syncRatings);
    };
  }, []);

  return ratings;
}

function getLocalRatings() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isLocalRating) : [];
  } catch {
    return [];
  }
}

function createLocalId() {
  if (crypto.randomUUID) return crypto.randomUUID();

  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

function isLocalRating(value: unknown): value is LocalRating {
  if (!value || typeof value !== "object") return false;

  const rating = value as Partial<LocalRating>;
  return (
    typeof rating.id === "string" &&
    typeof rating.teacherId === "string" &&
    typeof rating.comment === "string" &&
    typeof rating.createdAt === "string" &&
    isScoreMap(rating.scores)
  );
}

function isScoreMap(value: unknown): value is Record<MetricKey, number> {
  if (!value || typeof value !== "object") return false;

  return Object.values(value as Record<string, unknown>).every(
    (score) => typeof score === "number" && Number.isFinite(score),
  );
}

function applyLocalRatingsToTeacher(teacher: Teacher, ratings: LocalRating[]) {
  const teacherRatings = ratings.filter((rating) => rating.teacherId === teacher.id);

  if (!teacherRatings.length) return teacher;

  const nextReviewCount = teacher.reviewCount + teacherRatings.length;
  const nextCommentCount =
    (teacher.commentCount ?? 0) +
    teacherRatings.filter((rating) => rating.comment.length > 0).length;
  const scores = { ...teacher.scores };

  for (const key of Object.keys(scores) as MetricKey[]) {
    const localSum = teacherRatings.reduce(
      (sum, rating) => sum + rating.scores[key],
      0,
    );
    scores[key] = roundScore(
      (teacher.scores[key] * teacher.reviewCount + localSum) / nextReviewCount,
    );
  }

  return {
    ...teacher,
    rating: scores.overall,
    reviewCount: nextReviewCount,
    commentCount: nextCommentCount,
    scores,
  };
}
