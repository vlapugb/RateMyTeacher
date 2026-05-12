import Link from "next/link";
import { RatingStars } from "@/components/rating-stars";
import { TeacherAvatar } from "@/components/teacher-avatar";
import {
  facultyText,
  formatCommentCount,
  formatReviewCount,
} from "@/lib/i18n";
import type { LanguagePreference } from "@/lib/preferences";
import type { Teacher } from "@/lib/types";
import type { TopTeacherMetric } from "@/components/teacher-profile/profile-types";

type ProfileHeroProps = {
  language: LanguagePreference;
  rateHref: string;
  rateLabel: string;
  teacher: Teacher;
  topMetrics: TopTeacherMetric[];
};

export function ProfileHero({
  language,
  rateHref,
  rateLabel,
  teacher,
  topMetrics,
}: ProfileHeroProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-line bg-white shadow-sm">
      <div className="grid gap-6 p-5 md:p-6 xl:grid-cols-[1fr_340px] xl:items-end">
        <div className="flex flex-col gap-5 md:flex-row md:items-center">
          <TeacherAvatar name={teacher.fullName} size="lg" />
          <div className="min-w-0">
            <h1 className="text-3xl font900 tracking-tight text-foreground">
              {teacher.fullName}
            </h1>
            <p className="mt-2 text-sm font800 text-muted">
              {facultyText[language]}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <span className="text-4xl font900 text-foreground">
                ★ {teacher.rating}
              </span>
              <RatingStars value={teacher.rating} size="lg" />
              <span className="text-sm font900 text-muted">
                {formatReviewCount(teacher.reviewCount, language)}
              </span>
              <span className="text-sm font900 text-muted">
                {formatCommentCount(teacher.commentCount, language)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          <Link
            href={rateHref}
            className="focus-ring inline-flex h-11 items-center justify-center rounded-lg bg-gradient-to-r from-primary to-primary-strong px-4 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:-translate-y-0.5 hover:brightness-105"
          >
            {rateLabel}
          </Link>
          <div className="grid grid-cols-3 gap-2">
            {topMetrics.map((metric) => (
              <div
                key={metric.key}
                className="rounded-lg border border-line bg-slate-50 px-3 py-2 text-center"
              >
                <div className="text-lg font900 text-primary">
                  {metric.value}
                </div>
                <div className="mt-1 line-clamp-2 text-[10px] font800 leading-3 text-muted">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

