"use client";

import Link from "next/link";
import { MouseEvent, useState } from "react";
import { Bookmark, MessageSquareText } from "lucide-react";
import type { Teacher } from "@/lib/types";
import { metrics } from "@/lib/teacher-catalog";
import { RatingStars } from "@/components/rating-stars";
import { ScorePill } from "@/components/score-pill";
import { TeacherAvatar } from "@/components/teacher-avatar";
import { useAuthDialog } from "@/components/auth-dialog-context";
import { authClient } from "@/lib/auth-client";
import { formatReviewCount, localizeMetrics } from "@/lib/i18n";
import { usePreferences, type LanguagePreference } from "@/lib/preferences";
import { addFavoriteTeacher, removeFavoriteTeacher } from "@/lib/api-client";
import { APP_ROUTES } from "@/lib/app-routes";
import { cn } from "@/lib/utils";

type TeacherCardProps = {
  teacher: Teacher;
  compact?: boolean;
  onFavoriteChange?: (teacherId: string, saved: boolean) => void;
};

const teacherCardCopy: Record<
  LanguagePreference,
  {
    addFavorite: string;
    removeFavorite: string;
    favoriteFailed: string;
  }
> = {
  ru: {
    addFavorite: "Добавить в избранное",
    removeFavorite: "Убрать из избранного",
    favoriteFailed: "Не удалось обновить избранное.",
  },
  en: {
    addFavorite: "Add to favorites",
    removeFavorite: "Remove from favorites",
    favoriteFailed: "Could not update favorites.",
  },
  zh: {
    addFavorite: "添加到收藏",
    removeFavorite: "从收藏中移除",
    favoriteFailed: "无法更新收藏。",
  },
};

export function TeacherCard({
  teacher,
  compact,
  onFavoriteChange,
}: TeacherCardProps) {
  const { openAuthDialog } = useAuthDialog();
  const session = authClient.useSession();
  const { language } = usePreferences();
  const copy = teacherCardCopy[language];
  const [saving, setSaving] = useState(false);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);
  const saved = Boolean(teacher.saved);
  const topMetrics = localizeMetrics(metrics, language)
    .filter((metric) => metric.key !== "overall")
    .map((metric) => ({
      label: metric.label,
      value: teacher.scores[metric.key],
    }))
    .sort((left, right) => right.value - left.value)
    .slice(0, 3);

  async function toggleFavorite(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (!session.data?.user) {
      openAuthDialog("signin");
      return;
    }

    setSaving(true);
    setFavoriteError(null);
    const nextSaved = !saved;
    const savedResult = await (nextSaved
      ? addFavoriteTeacher(teacher.id)
      : removeFavoriteTeacher(teacher.id)
    ).catch((error) => {
      console.error("Failed to toggle favorite", error);
      return null;
    });
    setSaving(false);

    if (!savedResult) {
      setFavoriteError(copy.favoriteFailed);
      return;
    }

    onFavoriteChange?.(teacher.id, nextSaved);
  }

  return (
    <Link
      href={APP_ROUTES.teacher(teacher.id)}
      className={cn(
        "interactive-card group block rounded-lg border border-line bg-panel p-3 shadow-sm hover:border-primary hover:shadow-md sm:p-4",
        compact && "p-3",
      )}
    >
      <div className="flex items-start gap-2.5 sm:gap-3">
        <TeacherAvatar name={teacher.fullName} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="line-clamp-2 text-sm font800 leading-tight text-foreground transition-colors group-hover:text-primary sm:text-base">
                {teacher.shortName}
              </h3>
            </div>
            <button
              type="button"
              className="focus-ring -m-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-300 transition hover:bg-primary-soft hover:text-primary disabled:opacity-60 sm:h-9 sm:w-9"
              aria-label={saved ? copy.removeFavorite : copy.addFavorite}
              disabled={saving}
              onClick={toggleFavorite}
            >
              <Bookmark
                className={cn(
                  "h-5 w-5 transition-colors sm:h-6 sm:w-6",
                  saved
                    ? "fill-primary text-primary"
                    : "text-slate-300 group-hover:text-primary",
                )}
              />
            </button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs sm:mt-3 sm:gap-2 sm:text-sm">
            <span className="font800 text-warning">★ {teacher.rating}</span>
            <span className="text-xs font-semibold text-muted transition-colors group-hover:text-slate-500">
              {formatReviewCount(teacher.reviewCount, language)}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted transition-colors group-hover:text-slate-500">
              <MessageSquareText className="h-3.5 w-3.5" />
              {teacher.commentCount ?? 0}
            </span>
          </div>
        </div>
      </div>

      {!compact && (
        <>
          <div className="mt-2 sm:mt-3">
            <RatingStars value={teacher.rating} size="sm" />
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1.5 sm:mt-3 sm:gap-2">
            {topMetrics.map((metric) => (
              <ScorePill
                key={metric.label}
                label={metric.label}
                value={metric.value}
              />
            ))}
          </div>
          {favoriteError && (
            <p className="mt-2 text-xs font800 text-danger">{favoriteError}</p>
          )}
        </>
      )}
      {compact && favoriteError && (
        <p className="mt-2 text-xs font800 text-danger">{favoriteError}</p>
      )}
    </Link>
  );
}
