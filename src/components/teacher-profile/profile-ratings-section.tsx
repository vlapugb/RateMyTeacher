import { Star } from "lucide-react";
import { RATING_SCALE } from "@/lib/app-config";
import type { Metric, Teacher } from "@/lib/types";

type ProfileRatingsSectionProps = {
  categorySubtitle: string;
  categoryTitle: string;
  localizedMetrics: Metric[];
  overallLabel: string;
  teacher: Teacher;
};

export function ProfileRatingsSection({
  categorySubtitle,
  categoryTitle,
  localizedMetrics,
  overallLabel,
  teacher,
}: ProfileRatingsSectionProps) {
  return (
    <section className="mt-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font900">{categoryTitle}</h2>
          <p className="mt-1 text-sm font700 text-muted">
            {categorySubtitle}
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm font900 text-slate-600">
          <Star className="h-4 w-4 fill-warning text-warning" />
          {overallLabel} {teacher.scores.overall}
        </div>
      </div>
      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {localizedMetrics.map((metric) => (
          <article
            key={metric.key}
            className="interactive-card rounded-lg border border-line bg-white p-5 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="text-lg font900 text-slate-800">
                {metric.label}
              </h3>
              <span className="text-3xl font900 text-primary">
                {teacher.scores[metric.key]}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-primary-strong transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      0,
                      teacher.scores[metric.key] *
                        RATING_SCALE.percentMultiplier,
                    ),
                  )}%`,
                }}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

