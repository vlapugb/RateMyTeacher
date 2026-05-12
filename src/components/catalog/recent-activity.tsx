"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquareText, Star } from "lucide-react";
import { usePreferences, type LanguagePreference } from "@/lib/preferences";
import { APP_ROUTES } from "@/lib/app-routes";
import type { Review, Teacher } from "@/lib/types";
import { formatRelativeTime } from "@/lib/i18n";

type RecentKind = "reviews" | "comments";

const recentCopy: Record<
  LanguagePreference,
  {
    title: string;
    reviewsTab: string;
    commentsTab: string;
    loading: string;
    empty: string;
    goToTeacher: string;
    noTeacher: string;
  }
> = {
  ru: {
    title: "Последние отзывы",
    reviewsTab: "Оценки",
    commentsTab: "Комментарии",
    loading: "Загружаем...",
    empty: "Пока ничего нет",
    goToTeacher: "Перейти к преподавателю",
    noTeacher: "Неизвестный преподаватель",
  },
  en: {
    title: "Recent reviews",
    reviewsTab: "Ratings",
    commentsTab: "Comments",
    loading: "Loading...",
    empty: "Nothing here yet",
    goToTeacher: "Go to teacher",
    noTeacher: "Unknown teacher",
  },
  zh: {
    title: "最新评价",
    reviewsTab: "评分",
    commentsTab: "评论",
    loading: "加载中...",
    empty: "暂无内容",
    goToTeacher: "查看教师",
    noTeacher: "未知教师",
  },
};

type RecentActivityProps = {
  teachers: Teacher[];
};

export function RecentActivity({ teachers }: RecentActivityProps) {
  const { language } = usePreferences();
  const copy = recentCopy[language];
  const [kind, setKind] = useState<RecentKind>("comments");
  const [reviews, setReviews] = useState<Review[] | null>(null);

  const teacherMap = new Map(teachers.map((t) => [t.id, t]));

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/reviews/recent?kind=${kind}&limit=10`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => setReviews(data.reviews ?? []))
      .catch(() => setReviews([]));

    return () => controller.abort();
  }, [kind]);

  return (
    <section className="mt-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font900 sm:text-2xl">{copy.title}</h2>
        <div className="flex rounded-lg border border-line bg-slate-50 p-0.5">
          <button
            type="button"
            className={`rounded-md px-3 py-1.5 text-xs font900 transition ${
              kind === "comments"
                ? "bg-white text-primary shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
            onClick={() => setKind("comments")}
          >
            {copy.commentsTab}
          </button>
          <button
            type="button"
            className={`rounded-md px-3 py-1.5 text-xs font900 transition ${
              kind === "reviews"
                ? "bg-white text-primary shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
            onClick={() => setKind("reviews")}
          >
            {copy.reviewsTab}
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {reviews === null ? (
          <p className="text-sm font700 text-muted">{copy.loading}</p>
        ) : reviews.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line bg-white p-6 text-center text-sm font800 text-muted">
            {copy.empty}
          </p>
        ) : (
          reviews.map((review) => {
            const teacher = teacherMap.get(review.teacherId);
            const teacherName = teacher?.fullName ?? copy.noTeacher;
            const timeAgo = formatRelativeTime(review.createdAt, language);
            const snippet =
              review.body.length > 120
                ? review.body.slice(0, 120) + "…"
                : review.body;

            return (
              <Link
                key={review.id}
                href={APP_ROUTES.teacher(review.teacherId)}
                className="block rounded-lg border border-line bg-white p-4 shadow-sm transition hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {kind === "reviews" && review.hasRating !== false ? (
                        <Star className="h-4 w-4 shrink-0 fill-warning text-warning" />
                      ) : (
                        <MessageSquareText className="h-4 w-4 shrink-0 text-primary" />
                      )}
                      <span className="truncate text-sm font900 text-foreground">
                        {teacherName}
                      </span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-slate-600">
                      {snippet}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font700 text-muted">
                    {timeAgo}
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
}
