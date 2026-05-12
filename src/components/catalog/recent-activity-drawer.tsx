"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { Star, X, MessageSquareText, GripHorizontal } from "lucide-react";
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
    empty: "Пока ничего нет",
    close: "Закрыть",
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
    empty: "Nothing here yet",
    close: "Close",
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
    empty: "暂无内容",
    close: "关闭",
    ratingOnly: "无评论",
    unknownTeacher: "教师",
  },
};

type RecentActivityDrawerProps = {
  open: boolean;
  kind: RecentKind;
  teachers: Teacher[];
  onClose: () => void;
  onKindChange: (kind: RecentKind) => void;
};

export function RecentActivityDrawer({
  open,
  kind,
  teachers,
  onClose,
  onKindChange,
}: RecentActivityDrawerProps) {
  const { language } = usePreferences();
  const t = copy[language];
  const [items, setItems] = useState<Review[] | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const teacherMap = new Map(teachers.map((t) => [t.id, t]));

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      previousFocusRef.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

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
    };
  }, [open, kind]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  const currentTitle =
    kind === "reviews" ? t.reviewsTitle : t.commentsTitle;

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-50 transition-colors duration-200 ${
        open ? "bg-black/25" : "bg-black/0"
      }`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="recent-drawer-title"
    >
      {/* Desktop: right drawer */}
      <div
        ref={panelRef}
        className={`fixed bottom-0 right-0 flex w-full flex-col bg-white shadow-2xl transition-transform duration-200 ease-out sm:bottom-0 sm:top-0 sm:w-[420px] lg:w-[480px] ${
          open ? "translate-y-0 sm:translate-x-0" : "translate-y-full sm:translate-y-0 sm:translate-x-full"
        }`}
        style={{ maxHeight: "100dvh" }}
      >
        {/* Mobile drag handle */}
        <div className="flex shrink-0 justify-center pt-2 sm:hidden">
          <GripHorizontal className="h-5 w-8 text-slate-300" />
        </div>

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5 sm:py-4">
          <div className="min-w-0">
            <h2
              id="recent-drawer-title"
              className="truncate text-lg font900 sm:text-xl"
            >
              {currentTitle}
            </h2>
            <p className="mt-0.5 text-xs font700 text-muted sm:text-sm">
              {t.subtitle(kind)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label={t.close}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex shrink-0 gap-1 border-b border-line px-4 py-2">
          <button
            type="button"
            onClick={() => onKindChange("reviews")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font900 transition sm:text-sm ${
              kind === "reviews"
                ? "bg-primary text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            }`}
          >
            <Star className="h-3.5 w-3.5" />
            {t.reviewsTitle}
          </button>
          <button
            type="button"
            onClick={() => onKindChange("comments")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font900 transition sm:text-sm ${
              kind === "comments"
                ? "bg-primary text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            }`}
          >
            <MessageSquareText className="h-3.5 w-3.5" />
            {t.commentsTitle}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:px-5 sm:py-4">
          {items === null ? (
            <p className="py-12 text-center text-sm font700 text-muted">
              {t.loading}
            </p>
          ) : items.length === 0 ? (
            <div className="py-16 text-center">
              <MessageSquareText className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm font800 text-muted">{t.empty}</p>
            </div>
          ) : (
            <div className="space-y-2.5">
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
                  review.body || t.ratingOnly;

                return (
                  <Link
                    key={review.id}
                    href={APP_ROUTES.teacher(review.teacherId)}
                    onClick={onClose}
                    className="block rounded-lg border border-line bg-white p-3 shadow-sm transition hover:border-primary/25 hover:bg-slate-50 sm:p-3.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="truncate text-sm font900 text-foreground">
                        {teacherName}
                      </span>
                      <span className="shrink-0 text-[11px] font700 text-slate-400 sm:text-xs">
                        {timeAgo}
                      </span>
                    </div>
                    {kind === "reviews" && review.hasRating !== false && (
                      <div className="mt-1 flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                        <span className="text-xs font800 text-slate-600">
                          {review.rating}
                        </span>
                      </div>
                    )}
                    <p className="mt-1.5 line-clamp-3 text-[13px] leading-5 text-slate-600 sm:text-sm">
                      {displayBody}
                    </p>
                    {!hasText && kind === "comments" && (
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
