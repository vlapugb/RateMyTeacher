import { Search } from "lucide-react";
import type { MetricKey } from "@/lib/types";
import type { CatalogSortKey } from "@/components/catalog/catalog-types";

type LocalizedMetricOption = {
  key: MetricKey;
  label: string;
};

type CatalogControlsProps = {
  allLabel: string;
  byCommentsLabel: string;
  byRatingLabel: string;
  byReviewsLabel: string;
  localizedMetrics: LocalizedMetricOption[];
  query: string;
  searchLabel: string;
  sortingLabel: string;
  sortKey: CatalogSortKey;
  onQueryChange: (query: string) => void;
  onSortChange: (sortKey: CatalogSortKey) => void;
};

export function CatalogControls({
  allLabel,
  byCommentsLabel,
  byRatingLabel,
  byReviewsLabel,
  localizedMetrics,
  query,
  searchLabel,
  sortingLabel,
  sortKey,
  onQueryChange,
  onSortChange,
}: CatalogControlsProps) {
  return (
    <>
      <div className="mt-5 flex max-w-3xl items-center gap-2 rounded-lg border border-line bg-white px-3 py-2.5 shadow-sm sm:mt-8 sm:gap-3 sm:px-4 sm:py-3">
        <Search className="h-5 w-5 shrink-0 text-slate-400 sm:h-6 sm:w-6" />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={searchLabel}
          className="focus-ring min-w-0 flex-1 border-0 bg-transparent text-sm font700 text-foreground outline-none placeholder:text-slate-400 sm:text-base"
        />
      </div>

      <div className="mt-4 flex flex-col items-stretch gap-2 sm:mt-5 sm:flex-row sm:items-center sm:gap-3">
        <button
          type="button"
          className="rounded-lg border border-primary bg-primary px-4 py-2 text-sm font900 text-white shadow-sm"
        >
          {allLabel}
        </button>
        <label className="flex items-center justify-between gap-2 text-sm font900 text-slate-600 sm:ml-auto">
          {sortingLabel}
          <select
            value={sortKey}
            onChange={(event) =>
              onSortChange(event.target.value as CatalogSortKey)
            }
            className="focus-ring h-10 min-w-0 flex-1 rounded-lg border border-line bg-white px-3 text-sm font900 text-slate-700 sm:flex-none"
          >
            <option value="rating">{byRatingLabel}</option>
            <option value="commentCount">{byCommentsLabel}</option>
            <option value="reviewCount">{byReviewsLabel}</option>
            {localizedMetrics.map((metric) => (
              <option key={metric.key} value={metric.key}>
                {metric.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </>
  );
}

