import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type PaginationItem = number | "gap-left" | "gap-right";

type CatalogPaginationProps = {
  currentPage: number;
  end: number;
  itemLabel: string;
  items: PaginationItem[];
  nextLabel: string;
  pageCount: number;
  previousLabel: string;
  shownLabel: string;
  start: number;
  total: number;
  totalLabel: string;
  onPageChange: (page: number) => void;
};

export function CatalogPagination({
  currentPage,
  end,
  itemLabel,
  items,
  nextLabel,
  pageCount,
  previousLabel,
  shownLabel,
  start,
  total,
  totalLabel,
  onPageChange,
}: CatalogPaginationProps) {
  return (
    <footer className="mt-8 flex flex-col gap-3 text-xs font800 text-slate-400 sm:mt-12 sm:text-sm md:flex-row md:items-center md:justify-between">
      <span>
        {shownLabel} {start}-{end} {totalLabel} {total} {itemLabel}
      </span>
      <div className="flex max-w-full items-center gap-1.5 overflow-x-auto pb-1 sm:gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          aria-label={previousLabel}
          title={previousLabel}
          className="focus-ring grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line bg-white text-slate-600 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-45 sm:h-10 sm:w-10"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        {items.map((item) =>
          typeof item === "number" ? (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={cn(
                "grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line font900 transition sm:h-10 sm:w-10",
                item === currentPage
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white text-slate-600 hover:border-primary hover:-translate-y-0.5",
              )}
            >
              {item}
            </button>
          ) : (
            <span
              key={item}
              className="grid h-9 w-6 shrink-0 place-items-center text-sm font900 text-muted sm:h-10 sm:w-7"
              aria-hidden
            >
              ...
            </span>
          ),
        )}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(pageCount, currentPage + 1))}
          disabled={currentPage === pageCount}
          aria-label={nextLabel}
          title={nextLabel}
          className="focus-ring grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line bg-white text-slate-600 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-45 sm:h-10 sm:w-10"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </footer>
  );
}

