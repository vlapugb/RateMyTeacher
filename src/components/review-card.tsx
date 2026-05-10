"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart } from "lucide-react";
import type { Review } from "@/lib/types";
import { RatingStars } from "@/components/rating-stars";
import { Button } from "@/components/ui/button";
import { useAuthDialog } from "@/components/auth-dialog-context";
import { authClient } from "@/lib/auth-client";
import { genericReviewText, formatRelativeTime } from "@/lib/i18n";
import { usePreferences, type LanguagePreference } from "@/lib/preferences";
import { cn } from "@/lib/utils";

type ReviewCardProps = {
  review: Review;
  editHref?: string;
  onDelete?: (review: Review) => void;
};

const reviewCardCopy: Record<
  LanguagePreference,
  {
    edit: string;
    delete: string;
    like: string;
    unlike: string;
    signIn: string;
    authRequired: string;
    likeFailed: string;
  }
> = {
  ru: {
    edit: "Изменить",
    delete: "Удалить",
    like: "Нравится",
    unlike: "Убрать лайк",
    signIn: "Войти",
    authRequired: "Войдите, чтобы оценить комментарий.",
    likeFailed: "Не удалось оценить комментарий.",
  },
  en: {
    edit: "Edit",
    delete: "Delete",
    like: "Like",
    unlike: "Unlike",
    signIn: "Sign in",
    authRequired: "Sign in to rate comments.",
    likeFailed: "Could not rate the comment.",
  },
  zh: {
    edit: "编辑",
    delete: "删除",
    like: "赞",
    unlike: "取消赞",
    signIn: "登录",
    authRequired: "请先登录再评价评论。",
    likeFailed: "无法评价评论。",
  },
};

export function ReviewCard({ review, editHref, onDelete }: ReviewCardProps) {
  const { language } = usePreferences();
  const { openAuthDialog } = useAuthDialog();
  const session = authClient.useSession();
  const copy = reviewCardCopy[language];
  const generic = genericReviewText[language];
  const [likedByMe, setLikedByMe] = useState(Boolean(review.likedByMe));
  const [likeCount, setLikeCount] = useState(review.likeCount ?? 0);
  const [likeSaving, setLikeSaving] = useState(false);
  const [likeStatus, setLikeStatus] = useState<string | null>(null);
  const author =
    review.anonymousNumber
      ? `${getAnonymousNoun(language)} #${review.anonymousNumber}`
      : review.author === "Анонимно"
      ? generic.anonymous
      : review.author === "Студент"
        ? generic.student
        : review.author;
  const course =
    review.course === "Общая оценка преподавателя"
      ? generic.generalCourse
      : review.course;
  const year =
    review.year === "Опубликованный отзыв" ||
    review.year === "Анонимная публикация"
      ? generic.publishedReview
      : review.year;

  async function handleLike() {
    if (!session.data?.user) {
      setLikeStatus(copy.authRequired);
      return;
    }

    const nextLiked = !likedByMe;
    setLikeSaving(true);
    setLikeStatus(null);

    const response = await fetch(
      `/api/reviews/${encodeURIComponent(review.id)}/like`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ liked: nextLiked }),
      },
    ).catch(() => null);

    setLikeSaving(false);

    if (!response?.ok) {
      setLikeStatus(response?.status === 401 ? copy.authRequired : copy.likeFailed);
      return;
    }

    const body = (await response.json()) as {
      likeCount?: number;
      likedByMe?: boolean;
    };

    setLikeCount(body.likeCount ?? likeCount);
    setLikedByMe(Boolean(body.likedByMe));
  }

  return (
    <article className="interactive-card rounded-lg border border-line bg-white p-3 hover:border-primary/30 hover:shadow-sm sm:p-4">
      <div className="flex items-start gap-2.5 sm:gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-sm font900 text-white shadow-sm sm:h-10 sm:w-10">
          {author.trim().charAt(0).toUpperCase() || review.initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font900">{author}</h3>
              <p className="text-xs font700 text-muted">
                {course} · {year}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font700 text-slate-400">
                {formatRelativeTime(review.createdAt, language)}
              </span>
              {review.hasRating === true && review.rating != null && (
                <span className="font900 text-warning">★ {review.rating}</span>
              )}
            </div>
          </div>
          <p className="mt-2 text-sm font-medium leading-6 text-slate-700">
            {review.body}
          </p>
          {review.canEdit && (
            <div className="mt-3 flex flex-wrap gap-2">
              {editHref && (
                <Link
                  href={editHref}
                  className="focus-ring inline-flex h-9 items-center justify-center rounded-lg border border-line bg-panel px-3 text-xs font900 text-foreground transition hover:border-primary hover:text-primary"
                >
                  {copy.edit}
                </Link>
              )}
              {onDelete && (
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  onClick={() => onDelete(review)}
                >
                  {copy.delete}
                </Button>
              )}
            </div>
          )}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              {review.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-emerald-50 px-3 py-1 text-xs font800 text-emerald-700"
                >
                  {tag === "анонимно" ? generic.anonymousTag : tag}
                </span>
              ))}
            </div>
            <button
              type="button"
              disabled={likeSaving}
              aria-label={likedByMe ? copy.unlike : copy.like}
              title={likedByMe ? copy.unlike : copy.like}
              onClick={handleLike}
              className={cn(
                "focus-ring inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-panel px-3 text-xs font900 text-muted transition hover:border-primary hover:text-primary disabled:opacity-60",
                likedByMe && "border-primary bg-primary-soft text-primary",
              )}
            >
              <Heart
                className={cn(
                  "h-4 w-4",
                  likedByMe && "fill-primary text-primary",
                )}
              />
              {likeCount}
            </button>
          </div>
          {likeStatus && (
            <p className="mt-2 text-xs font800 text-muted">
              {likeStatus}{" "}
              <button
                type="button"
                className="text-primary underline-offset-4 hover:underline"
                onClick={() => openAuthDialog("signin")}
              >
                {copy.signIn}
              </button>
            </p>
          )}
        </div>
      </div>
      {review.hasRating === true && review.rating != null && (
        <div className="mt-3 pl-11 sm:pl-13">
          <RatingStars value={review.rating} size="sm" />
        </div>
      )}
    </article>
  );
}

function getAnonymousNoun(language: LanguagePreference) {
  if (language === "en") return "Anonymous";
  if (language === "zh") return "匿名";

  return "Аноним";
}
