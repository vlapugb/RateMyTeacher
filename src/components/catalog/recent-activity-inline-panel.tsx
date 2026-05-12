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
    reviewsSub: "10 свежих оценок по всем преподавателям",
    commentsSub: "10 свежих комментариев по всем преподавателям",
    loading: "Загружаем...",
    emptyReviewsTitle: "Пока нет оценок",
    emptyReviewsHint: "Когда появятся новые оценки, они будут отображаться здесь.",
    emptyCommentsTitle: "Пока нет комментариев",
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
    reviewsSub: "10 recent ratings across all teachers",
    commentsSub: "10 recent comments across all teachers",
    loading: "Loading...",
    emptyReviewsTitle: "No ratings yet",
    emptyReviewsHint: "New ratings will appear here once submitted.",
    emptyCommentsTitle: "No comments yet",
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
    emptyReviewsTitle: "暂无评分",
    emptyReviewsHint: "新的评分提交后将显示在这里。",
    emptyCommentsTitle: "暂无评论",
    emptyCommentsHint: "新的评论提交后将显示在这里。",
    closeReviews: "隐藏最新评分",
    closeComments: "隐藏最新评论",
    noComment: "无评论",
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
    const targetKind = activeType;

    fetch(`/api/reviews/recent?kind=${targetKind}&limit=10`, {
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
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const title = kind === "reviews" ? t.reviewsTitle : t.commentsTitle;
  const subtitle = kind === "reviews" ? t.reviewsSub : t.commentsSub;
  const closeLabel =
    kind === "reviews" ? t.closeReviews : t.closeComments;

  return (
    <div
      id="recent-activity-panel"
      ref={panelRef}
      className="expandable-panel"
      data-open={isOpen ? "true" : "false"}
      data-active-type={kind}
      role="region"
      aria-label={title}
    >
      <div className="expandable-panel-inner">
        <div
          key={kind}
          className="recent-activity-card"
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-lg font900 sm:text-xl">{title}</h3>
              <p className="mt-0.5 text-xs leading-5 text-muted sm:text-sm">
                {subtitle}
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
            <p className="py-8 text-center text-sm font700 text-muted sm:py-10">
              {t.loading}
            </p>
          ) : items.length === 0 ? (
            <EmptyState
              icon={
                <MessageSquareText className="h-6 w-6 text-slate-300 sm:h-7 sm:w-7" />
              }
              title={
                kind === "reviews"
                  ? t.emptyReviewsTitle
                  : t.emptyCommentsTitle
              }
              hint={
                kind === "reviews"
                  ? t.emptyReviewsHint
                  : t.emptyCommentsHint
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
              {items.map((review) => (
                <ActivityItem
                  key={review.id}
                  review={review}
                  kind={kind}
                  teacherName={
                    teacherMap.get(review.teacherId)?.fullName ??
                    t.unknownTeacher
                  }
                  timeAgo={formatRelativeTime(review.createdAt, language)}
                  noCommentLabel={t.noComment}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  hint,
}: {
  icon: React.ReactNode;
  title: string;
  hint: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-line/60 bg-slate-50/50 px-4 py-3 sm:px-4 sm:py-3.5">
      <div className="shrink-0 pt-0.5">{icon}</div>
      <div className="min-w-0">
        <p className="text-sm font800 text-slate-600">{title}</p>
        <p className="mt-0.5 text-xs text-slate-400">{hint}</p>
      </div>
    </div>
  );
}

function ActivityItem({
  review,
  kind,
  teacherName,
  timeAgo,
  noCommentLabel,
}: {
  review: Review;
  kind: RecentKind;
  teacherName: string;
  timeAgo: string;
  noCommentLabel: string;
}) {
  const hasText = review.body.length > 0;
  const showRating =
    kind === "reviews" && review.hasRating !== false;

  return (
    <Link
      href={APP_ROUTES.teacher(review.teacherId)}
      className="block rounded-[14px] border border-line bg-slate-50/60 px-3 py-2.5 transition hover:border-primary/25 hover:bg-slate-50 sm:rounded-[16px] sm:px-3.5 sm:py-3"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="truncate text-sm font900 text-foreground">
          {teacherName}
        </span>
        <span className="shrink-0 text-[11px] font700 text-slate-400 sm:text-xs">
          {timeAgo}
        </span>
      </div>
      {showRating && (
        <div className="mt-1 flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-warning text-warning" />
          <span className="text-xs font800 text-slate-600">
            {review.rating}
          </span>
        </div>
      )}
      {hasText ? (
        <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-slate-600">
          {review.body}
        </p>
      ) : (
        <p className="mt-1 text-xs italic text-slate-400">
          {noCommentLabel}
        </p>
      )}
    </Link>
  );
}
