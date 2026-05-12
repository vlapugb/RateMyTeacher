"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Star, X, MessageSquareText } from "lucide-react";
import { usePreferences } from "@/lib/preferences";
import { formatRelativeTime } from "@/lib/i18n";
import { APP_ROUTES } from "@/lib/app-routes";
import { cn } from "@/lib/utils";
import type { Review, Teacher } from "@/lib/types";

type RecentKind = "reviews" | "comments";

const copy = {
  ru: {
    reviewsTitle: "Последние оценки",
    commentsTitle: "Последние комментарии",
    reviewsSub: "10 свежих оценок",
    commentsSub: "10 свежих комментариев",
    loading: "Загружаем...",
    emptyReviews: "Пока нет оценок",
    emptyReviewsHint: "Когда появятся новые оценки, они будут отображаться здесь.",
    emptyComments: "Пока нет комментариев",
    emptyCommentsHint:
      "Когда появятся новые отзывы, они будут отображаться здесь.",
    closeReviews: "Скрыть последние оценки",
    closeComments: "Скрыть последние комментарии",
    noComment: "Без комментария",
    unknownTeacher: "Преподаватель",
  },
  en: {
    reviewsTitle: "Latest ratings",
    commentsTitle: "Latest comments",
    reviewsSub: "10 recent ratings",
    commentsSub: "10 recent comments",
    loading: "Loading...",
    emptyReviews: "No ratings yet",
    emptyReviewsHint: "New ratings will appear here once submitted.",
    emptyComments: "No comments yet",
    emptyCommentsHint: "New comments will appear here once submitted.",
    closeReviews: "Hide latest ratings",
    closeComments: "Hide latest comments",
    noComment: "No comment",
    unknownTeacher: "Teacher",
  },
  zh: {
    reviewsTitle: "最新评分",
    commentsTitle: "最新评论",
    reviewsSub: "10 条最新评分",
    commentsSub: "10 条最新评论",
    loading: "加载中...",
    emptyReviews: "暂无评分",
    emptyReviewsHint: "新的评分提交后将显示在这里。",
    emptyComments: "暂无评论",
    emptyCommentsHint: "新的评论提交后将显示在这里。",
    closeReviews: "隐藏最新评分",
    closeComments: "隐藏最新评论",
    noComment: "无评论",
    unknownTeacher: "教师",
  },
};

export type RecentActivityExpansionProps = {
  kind: RecentKind;
  teachers: Teacher[];
  align?: "left" | "right";
  variant?: "popover" | "inline";
  onClose: () => void;
};

export function RecentActivityExpansion({
  kind,
  teachers,
  align = "left",
  variant = "popover",
  onClose,
}: RecentActivityExpansionProps) {
  const { language } = usePreferences();
  const t = copy[language];
  const [items, setItems] = useState<Review[] | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const teacherMap = new Map(teachers.map((t) => [t.id, t]));

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

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
  }, [kind]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const title = kind === "reviews" ? t.reviewsTitle : t.commentsTitle;
  const subtitle = kind === "reviews" ? t.reviewsSub : t.commentsSub;
  const closeLabel =
    kind === "reviews" ? t.closeReviews : t.closeComments;

  const isPopover = variant === "popover";

  return (
    <div
      ref={panelRef}
      id="recent-activity-panel"
      role="region"
      aria-label={title}
      className={cn(
        isPopover
          ? "recent-popover w-[min(420px,calc(100vw-2rem))]"
          : "recent-inline mt-2.5 w-full sm:hidden",
        isPopover && align === "right" && "recent-popover--right",
      )}
    >
      <div
        className={cn(
          isPopover && "animate-scale-in",
          "rounded-2xl border border-line bg-white px-4 py-3 shadow-lg sm:shadow-xl",
        )}
        key={kind}
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-base font900 sm:text-lg">{title}</h3>
            <p className="mt-0.5 text-xs text-muted">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring -mr-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label={closeLabel}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {items === null ? (
          <p className="py-6 text-center text-sm font700 text-muted">
            {t.loading}
          </p>
        ) : items.length === 0 ? (
          <div className="flex items-start gap-3 rounded-xl border border-line/60 bg-slate-50/50 px-3 py-2.5">
            <MessageSquareText className="mt-0.5 h-5 w-5 shrink-0 text-slate-300" />
            <div className="min-w-0">
              <p className="text-sm font800 text-slate-600">
                {kind === "reviews"
                  ? t.emptyReviews
                  : t.emptyComments}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                {kind === "reviews"
                  ? t.emptyReviewsHint
                  : t.emptyCommentsHint}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((review) => {
              const teacher = teacherMap.get(review.teacherId);
              const teacherName =
                teacher?.fullName ?? t.unknownTeacher;
              const timeAgo = formatRelativeTime(
                review.createdAt,
                language,
              );
              const hasText = review.body.length > 0;
              const showRating =
                kind === "reviews" &&
                review.hasRating !== false;

              return (
                <Link
                  key={review.id}
                  href={APP_ROUTES.teacher(review.teacherId)}
                  className="block rounded-xl border border-line bg-slate-50/60 px-3 py-2 transition hover:border-primary/25 hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="truncate text-sm font900 text-foreground">
                      {teacherName}
                    </span>
                    <span className="shrink-0 text-[11px] font700 text-slate-400">
                      {timeAgo}
                    </span>
                  </div>
                  {showRating && (
                    <div className="mt-0.5 flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                      <span className="text-xs font800 text-slate-600">
                        {review.rating}
                      </span>
                    </div>
                  )}
                  {hasText ? (
                    <p className="mt-0.5 line-clamp-2 text-[13px] leading-5 text-slate-600">
                      {review.body}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-xs italic text-slate-400">
                      {t.noComment}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
