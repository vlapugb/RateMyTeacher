"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Star, X, MessageSquareText } from "lucide-react";
import { usePreferences } from "@/lib/preferences";
import { formatRelativeTime } from "@/lib/i18n";
import { APP_ROUTES } from "@/lib/app-routes";
import type { Review, Teacher } from "@/lib/types";

type RecentKind = "reviews" | "comments";

const copy = {
  ru: {
    reviewsTitle: "Последние оценки",
    commentsTitle: "Последние комментарии",
    subtitle: (kind: RecentKind) =>
      kind === "reviews"
        ? "10 свежих оценок по всем преподавателям"
        : "10 свежих комментариев по всем преподавателям",
    loading: "Загружаем...",
    emptyReviews: "Пока нет оценок",
    emptyReviewsHint: "Когда появятся новые оценки, они будут отображаться здесь.",
    emptyComments: "Пока нет комментариев",
    emptyCommentsHint: "Когда появятся новые отзывы, они будут отображаться здесь.",
    close: "Скрыть последние комментарии",
    closeReviews: "Скрыть последние оценки",
    ratingOnly: "Без комментария",
    unknownTeacher: "Преподаватель",
  },
  en: {
    reviewsTitle: "Latest ratings",
    commentsTitle: "Latest comments",
    subtitle: (kind: RecentKind) =>
      kind === "reviews"
        ? "10 recent ratings across all teachers"
        : "10 recent comments across all teachers",
    loading: "Loading...",
    emptyReviews: "No ratings yet",
    emptyReviewsHint: "New ratings will appear here once they are submitted.",
    emptyComments: "No comments yet",
    emptyCommentsHint: "New comments will appear here once they are submitted.",
    close: "Hide latest comments",
    closeReviews: "Hide latest ratings",
    ratingOnly: "No comment",
    unknownTeacher: "Teacher",
  },
  zh: {
    reviewsTitle: "最新评分",
    commentsTitle: "最新评论",
    subtitle: (kind: RecentKind) =>
      kind === "reviews"
        ? "10 条最新评分"
        : "10 条最新评论",
    loading: "加载中...",
    emptyReviews: "暂无评分",
    emptyReviewsHint: "新的评分提交后将显示在这里。",
    emptyComments: "暂无评论",
    emptyCommentsHint: "新的评论提交后将显示在这里。",
    close: "隐藏最新评论",
    closeReviews: "隐藏最新评分",
    ratingOnly: "无评论",
    unknownTeacher: "教师",
  },
};

type RecentActivityInlinePanelProps = {
  activeType: RecentKind | null;
  teachers: Teacher[];
  onClose: () => void;
};

export function RecentActivityInlinePanel({
  activeType,
  teachers,
  onClose,
}: RecentActivityInlinePanelProps) {
  const { language } = usePreferences();
  const t = copy[language];
  const [items, setItems] = useState<Review[] | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const teacherMap = new Map(teachers.map((t) => [t.id, t]));
  const isOpen = activeType !== null;
  const kind = activeType ?? "comments";

  useEffect(() => {
    if (!activeType) return;

    let active = true;
    const controller = new AbortController();
    const kind = activeType;

    fetch(`/api/reviews/recent?kind=${kind}&limit=10`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (active) setItems(data.reviews ?? []);
      })
      .catch(() => {
        if (active) setItems([]);
      });

    return () => {
      active = false;
      controller.abort();
      setItems(null);
    };
  }, [activeType]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const currentTitle =
    kind === "reviews" ? t.reviewsTitle : t.commentsTitle;
  const closeLabel =
    kind === "reviews" ? t.closeReviews : t.close;

  return (
    <div
      id="recent-activity-panel"
      ref={panelRef}
      className="expandable-panel"
      data-open={isOpen ? "true" : "false"}
      role="region"
      aria-label={currentTitle}
    >
      <div className="expandable-panel-inner">
        <div
          className="mt-4 rounded-[20px] border border-line bg-white px-4 py-4 shadow-sm sm:mt-5 sm:px-5 sm:py-5"
          key={kind}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-lg font900 sm:text-xl">
                {currentTitle}
              </h3>
              <p className="mt-0.5 text-xs font700 text-muted sm:text-sm">
                {t.subtitle(kind)}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="focus-ring grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 sm:h-10 sm:w-10"
              aria-label={closeLabel}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {items === null ? (
            <p className="py-12 text-center text-sm font700 text-muted">
              {t.loading}
            </p>
          ) : items.length === 0 ? (
            <div className="py-12 text-center">
              <MessageSquareText className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm font800 text-muted">
                {kind === "reviews" ? t.emptyReviews : t.emptyComments}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {kind === "reviews"
                  ? t.emptyReviewsHint
                  : t.emptyCommentsHint}
              </p>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {items.map((review) => {
                const teacher = teacherMap.get(review.teacherId);
                const teacherName =
                  teacher?.fullName ?? t.unknownTeacher;
                const timeAgo = formatRelativeTime(
                  review.createdAt,
                  language,
                );
                const hasText = review.body.length > 0;
                const displayBody =
                  review.body || (kind === "reviews" ? t.ratingOnly : "");

                return (
                  <Link
                    key={review.id}
                    href={APP_ROUTES.teacher(review.teacherId)}
                    className="block rounded-[14px] border border-line bg-slate-50/60 p-3 transition hover:border-primary/25 hover:bg-slate-50 sm:rounded-[16px] sm:p-3.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="truncate text-sm font900 text-foreground">
                        {teacherName}
                      </span>
                      <span className="shrink-0 text-[11px] font700 text-slate-400 sm:text-xs">
                        {timeAgo}
                      </span>
                    </div>
                    {kind === "reviews" &&
                      review.hasRating !== false && (
                        <div className="mt-1 flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                          <span className="text-xs font800 text-slate-600">
                            {review.rating}
                          </span>
                        </div>
                      )}
                    {kind === "comments" && hasText && (
                      <CommentContent body={review.body} />
                    )}
                    {kind === "comments" && !hasText && (
                      <p className="mt-1 text-xs italic text-slate-400">
                        {t.ratingOnly}
                      </p>
                    )}
                    {kind === "reviews" && hasText && (
                      <CommentContent body={displayBody} />
                    )}
                    {kind === "reviews" && !hasText && (
                      <p className="mt-1 text-xs italic text-slate-400">
                        {t.ratingOnly}
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CommentContent({ body }: { body: string }) {
  return (
    <p className="mt-1.5 line-clamp-3 text-[13px] leading-5 text-slate-600">
      {body}
    </p>
  );
}
